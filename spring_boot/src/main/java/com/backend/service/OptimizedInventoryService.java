package com.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.repository.DeviceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(DistributedLockService.class)
public class OptimizedInventoryService {

    private final DistributedLockService lockService;
    private final DeviceRepository deviceRepository;

    /**
     * 设备入库（增强版）
     * 
     * @param deviceId     设备ID
     * @param quantity     入库数量
     * @param operatorId   操作人员ID
     * @param operatorName 操作人员名称
     * @param location     入库位置
     * @return 操作结果
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> stockIn(Long deviceId, Integer quantity, Long operatorId, String operatorName,
            String location) {
        if (quantity <= 0) {
            return ApiResponse.error(ErrorCode.PARAM_ERROR.getCode(), "入库数量必须大于0");
        }

        String lockKey = "inventory:device:" + deviceId;

        try {
            return lockService.executeWithLock(lockKey, () -> {
                Device device = deviceRepository.findById(deviceId)
                        .orElse(null);

                if (device == null) {
                    return ApiResponse.error(ErrorCode.DEVICE_NOT_FOUND);
                }

                // 入库前状态检查：允许待入库(-1)或在库(0)状态的设备入库
                Integer currentStatus = device.getStatus();
                if (currentStatus != null && currentStatus != -1 && currentStatus != 0) {
                    return ApiResponse.error(ErrorCode.BAD_REQUEST.getCode(),
                            "当前设备状态不允许入库，只有待入库或在库状态的设备可以入库");
                }

                int newStock = device.getCurrentStock() + quantity;
                if (device.getMaxStock() != null && newStock > device.getMaxStock()) {
                    return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "库存超出上限");
                }

                // 更新库存
                device.setCurrentStock(newStock);

                // 更新入库信息
                device.updateInboundInfo(operatorId, operatorName, location);

                deviceRepository.save(device);

                log.info("入库成功: deviceId={}, quantity={}, newStock={}, operator={}, location={}",
                        deviceId, quantity, newStock, operatorName, location);

                return ApiResponse.success();
            });
        } catch (Exception e) {
            log.error("入库失败: deviceId={}, quantity={}", deviceId, quantity, e);
            return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "库存操作失败: " + e.getMessage());
        }
    }

    /**
     * 设备入库（兼容旧版，使用默认操作人）
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> stockIn(Long deviceId, Integer quantity) {
        return stockIn(deviceId, quantity, null, "系统操作", null);
    }

/**
     * 设备出库（增强版）
     * @param deviceId 设备ID
     * @param quantity 出库数量
     * @param operatorId 操作人员ID
     * @param operatorName 操作人员名称
     * @param targetLocation 目标位置
     * @param reason 出库原因
     * @return 操作结果
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> stockOut(Long deviceId, Integer quantity, Long operatorId, 
                                       String operatorName, String targetLocation, String reason) {
        if (quantity <= 0) {
            return ApiResponse.error(ErrorCode.PARAM_ERROR.getCode(), "出库数量必须大于0");
        }

        String lockKey = "inventory:device:" + deviceId;

        try {
            return lockService.executeWithLock(lockKey, () -> {
                Device device = deviceRepository.findById(deviceId)
                        .orElse(null);

                if (device == null) {
                    return ApiResponse.error(ErrorCode.DEVICE_NOT_FOUND);
                }

                // 出库前状态检查：只有在库(0)状态的设备可以出库
                Integer currentStatus = device.getStatus();
                if (currentStatus == null || currentStatus != 0) {
                    return ApiResponse.error(ErrorCode.BAD_REQUEST.getCode(), 
                        "当前设备状态不允许出库，只有在库状态的设备可以出库");
                }

                if (device.getCurrentStock() < quantity) {
                    return ApiResponse.error(ErrorCode.DEVICE_STOCK_INSUFFICIENT);
                }

                int newStock = device.getCurrentStock() - quantity;
                device.setCurrentStock(newStock);
                
                // 更新出库信息
                String location = targetLocation != null ? targetLocation : reason;
                device.updateOutboundInfo(operatorId, operatorName, location);
                
                deviceRepository.save(device);

                log.info("出库成功: deviceId={}, quantity={}, newStock={}, operator={}, targetLocation={}, reason={}", 
                    deviceId, quantity, newStock, operatorName, targetLocation, reason);

                return ApiResponse.success();
            });
        } catch (Exception e) {
            log.error("出库失败: deviceId={}, quantity={}", deviceId, quantity, e);
            return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "库存操作失败: " + e.getMessage());
        }
    }

    /**
     * 设备出库（兼容旧版，使用默认操作人）
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> stockOut(Long deviceId, Integer quantity) {
        return stockOut(deviceId, quantity, null, "系统操作", null, "设备出库");
    }

    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> adjustStock(Long deviceId, Integer newStock, String reason) {
        if (newStock < 0) {
            return ApiResponse.error(ErrorCode.PARAM_ERROR.getCode(), "库存数量不能为负数");
        }

        String lockKey = "inventory:device:" + deviceId;

        try {
            return lockService.executeWithLock(lockKey, () -> {
                Device device = deviceRepository.findById(deviceId)
                        .orElse(null);

                if (device == null) {
                    return ApiResponse.error(ErrorCode.DEVICE_NOT_FOUND);
                }

                if (device.getMaxStock() != null && newStock > device.getMaxStock()) {
                    return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "库存超出上限");
                }

                int oldStock = device.getCurrentStock();
                device.setCurrentStock(newStock);
                deviceRepository.save(device);

                log.info("库存调整成功: deviceId={}, oldStock={}, newStock={}, reason={}",
                        deviceId, oldStock, newStock, reason);

                return ApiResponse.success();
            });
        } catch (Exception e) {
            log.error("库存调整失败: deviceId={}, newStock={}", deviceId, newStock, e);
            return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "库存调整失败: " + e.getMessage());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<String> batchStockIn(Long[] deviceIds, Integer[] quantities) {
        if (deviceIds == null || quantities == null || deviceIds.length != quantities.length) {
            return ApiResponse.error(ErrorCode.PARAM_ERROR.getCode(), "参数错误");
        }

        int successCount = 0;
        int failCount = 0;
        StringBuilder failMsg = new StringBuilder();

        for (int i = 0; i < deviceIds.length; i++) {
            ApiResponse<Void> result = stockIn(deviceIds[i], quantities[i]);
            if (result.getSuccess()) {
                successCount++;
            } else {
                failCount++;
                failMsg.append("设备").append(deviceIds[i]).append(":").append(result.getMessage()).append(";");
            }
        }

        String message = String.format("批量入库完成: 成功%d条, 失败%d条", successCount, failCount);
        if (failCount > 0) {
            message += ", 失败原因:" + failMsg.toString();
        }

        log.info(message);
        return ApiResponse.success(message);
    }

    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<String> batchStockOut(Long[] deviceIds, Integer[] quantities) {
        if (deviceIds == null || quantities == null || deviceIds.length != quantities.length) {
            return ApiResponse.error(ErrorCode.PARAM_ERROR.getCode(), "参数错误");
        }

        int successCount = 0;
        int failCount = 0;
        StringBuilder failMsg = new StringBuilder();

        for (int i = 0; i < deviceIds.length; i++) {
            ApiResponse<Void> result = stockOut(deviceIds[i], quantities[i]);
            if (result.getSuccess()) {
                successCount++;
            } else {
                failCount++;
                failMsg.append("设备").append(deviceIds[i]).append(":").append(result.getMessage()).append(";");
            }
        }

        String message = String.format("批量出库完成: 成功%d条, 失败%d条", successCount, failCount);
        if (failCount > 0) {
            message += ", 失败原因:" + failMsg.toString();
        }

        log.info(message);
        return ApiResponse.success(message);
    }

    @org.springframework.cache.annotation.Cacheable(value = "inventory", key = "'stock:' + #deviceId")
    public Integer getStock(Long deviceId) {
        Device device = deviceRepository.findById(deviceId).orElse(null);
        return device != null ? device.getCurrentStock() : null;
    }
}
