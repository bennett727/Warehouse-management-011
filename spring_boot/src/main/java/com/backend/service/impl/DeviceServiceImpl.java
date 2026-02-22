package com.backend.service.impl;

import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.common.ErrorCode;
import com.backend.repository.DeviceRepository;
import com.backend.service.DeviceService;
import com.backend.service.device.DeviceStatusTransitionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static com.backend.config.CacheConfig.CACHE_DEVICE;

/**
 * 设备管理服务实现类
 *
 * 功能说明：
 * 实现设备的增删改查、状态管理等核心业务逻辑
 *
 * 核心特性：
 * - 缓存优化：使用Redis缓存热点数据
 * - 状态管理：集成状态流转服务
 * - 批量操作：支持批量导入导出
 * - 数据校验：严格的业务规则校验
 *
 * 缓存策略：
 * - 查询操作：使用@Cacheable缓存结果
 * - 更新操作：使用@CacheEvict清除缓存
 * - 缓存键：device::{deviceId}
 *
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Slf4j
@Service
public class DeviceServiceImpl implements DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private DeviceStatusTransitionService statusTransitionService;

    /**
     * 创建设备
     *
     * @param device 设备信息
     * @return 创建后的设备
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Device createDevice(Device device) {
        // 1. 参数校验
        if (device == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "设备信息不能为空");
        }

        if (device.getDeviceCode() == null || device.getDeviceCode().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "设备编码不能为空");
        }

        // 2. 检查设备编码是否已存在
        if (deviceRepository.existsByDeviceCode(device.getDeviceCode())) {
            throw new BusinessException(ErrorCode.DEVICE_CODE_EXISTS);
        }

        // 3. 设置默认值
        if (device.getStatus() == null) {
            device.setStatus(DeviceStatus.IN_STOCK.getCode());
        }

        device.setCreateTime(LocalDateTime.now());
        device.setUpdateTime(LocalDateTime.now());

        // 4. 保存设备
        Device savedDevice = deviceRepository.save(device);

        log.info("创建设备成功: deviceId={}, deviceCode={}",
                savedDevice.getId(), savedDevice.getDeviceCode());

        return savedDevice;
    }

    /**
     * 更新设备
     *
     * @param deviceId 设备ID
     * @param device 设备信息
     * @return 更新后的设备
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = CACHE_DEVICE, key = "'device::' + #deviceId")
    public Device updateDevice(Long deviceId, Device device) {
        // 1. 查询现有设备
        Device existingDevice = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

        // 2. 如果修改了设备编码，检查是否重复
        if (device.getDeviceCode() != null &&
                !device.getDeviceCode().equals(existingDevice.getDeviceCode())) {
            if (deviceRepository.existsByDeviceCode(device.getDeviceCode())) {
                throw new BusinessException(ErrorCode.DEVICE_CODE_EXISTS);
            }
            existingDevice.setDeviceCode(device.getDeviceCode());
        }

        // 3. 更新其他字段
        if (device.getDeviceName() != null) {
            existingDevice.setDeviceName(device.getDeviceName());
        }
        if (device.getModel() != null) {
            existingDevice.setModel(device.getModel());
        }
        if (device.getTypeId() != null) {
            existingDevice.setTypeId(device.getTypeId());
        }
        if (device.getAreaId() != null) {
            existingDevice.setAreaId(device.getAreaId());
        }
        if (device.getBinId() != null) {
            existingDevice.setBinId(device.getBinId());
        }
        if (device.getPrincipal() != null) {
            existingDevice.setPrincipal(device.getPrincipal());
        }
        if (device.getSupplierId() != null) {
            existingDevice.setSupplierId(device.getSupplierId());
        }
        if (device.getDescription() != null) {
            existingDevice.setDescription(device.getDescription());
        }

        existingDevice.setUpdateTime(LocalDateTime.now());

        // 4. 保存设备
        Device updatedDevice = deviceRepository.save(existingDevice);

        log.info("更新设备成功: deviceId={}", deviceId);

        return updatedDevice;
    }

    /**
     * 删除设备
     *
     * @param deviceId 设备ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = CACHE_DEVICE, key = "'device::' + #deviceId")
    public void deleteDevice(Long deviceId) {
        // 1. 查询设备
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

        // 2. 检查设备状态 - 只允许删除待入库或在库状态的设备
        int status = device.getStatus();
        if (status != DeviceStatus.PENDING_INBOUND.getCode()
                && status != DeviceStatus.IN_STOCK.getCode()) {
            throw new BusinessException(ErrorCode.OPERATION_FAILED,
                    "只有" + DeviceStatus.PENDING_INBOUND.getDescription() + "或"
                            + DeviceStatus.IN_STOCK.getDescription() + "状态的设备才能删除");
        }

        // 3. 删除设备
        deviceRepository.deleteById(deviceId);

        log.info("删除设备成功: deviceId={}", deviceId);
    }

    /**
     * 批量删除设备
     *
     * @param deviceIds 设备ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDeleteDevices(List<Long> deviceIds) {
        if (deviceIds == null || deviceIds.isEmpty()) {
            return;
        }

        // 查询所有设备
        List<Device> devices = deviceRepository.findAllById(deviceIds);

        // 检查是否所有设备都是待入库或在库状态
        for (Device device : devices) {
            int status = device.getStatus();
            if (status != DeviceStatus.PENDING_INBOUND.getCode()
                    && status != DeviceStatus.IN_STOCK.getCode()) {
                throw new BusinessException(ErrorCode.OPERATION_FAILED,
                        "设备 " + device.getDeviceCode() + " 不是" +
                                DeviceStatus.PENDING_INBOUND.getDescription() + "或" +
                                DeviceStatus.IN_STOCK.getDescription() + "状态，无法删除");
            }
        }

        // 批量删除
        deviceRepository.deleteAllById(deviceIds);

        log.info("批量删除设备成功: count={}", deviceIds.size());
    }

    /**
     * 根据ID查询设备
     *
     * @param deviceId 设备ID
     * @return 设备信息
     */
    @Override
    @Cacheable(value = CACHE_DEVICE, key = "'device::' + #deviceId")
    public Device getDeviceById(Long deviceId) {
        return deviceRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
    }

    /**
     * 根据编码查询设备
     *
     * @param deviceCode 设备编码
     * @return 设备信息
     */
    @Override
    @Cacheable(value = CACHE_DEVICE, key = "'device:code::' + #deviceCode")
    public Device getDeviceByCode(String deviceCode) {
        return deviceRepository.findByDeviceCode(deviceCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
    }

    /**
     * 分页查询设备列表
     *
     * @param keyword 关键词
     * @param typeId 类型ID
     * @param status 状态
     * @param areaId 库区ID
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Override
    public PageResult<Device> getDeviceList(String keyword, Long typeId, Integer status,
                                             Long areaId, Pageable pageable) {
        Page<Device> page = deviceRepository.findByConditions(keyword, typeId, status, areaId, pageable);
        return PageResult.of(page);
    }

    /**
     * 变更设备状态
     *
     * @param deviceId 设备ID
     * @param targetStatus 目标状态
     * @param operatorId 操作人ID
     * @param remark 备注
     * @return 更新后的设备
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = CACHE_DEVICE, key = "'device::' + #deviceId")
    public Device changeStatus(Long deviceId, Integer targetStatus, Long operatorId, String remark) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
        DeviceStatus toStatus = DeviceStatus.fromCode(targetStatus);
        return statusTransitionService.executeTransition(device, toStatus, operatorId, remark);
    }

    /**
     * 批量变更设备状态
     *
     * @param deviceIds 设备ID列表
     * @param targetStatus 目标状态
     * @param operatorId 操作人ID
     * @param remark 备注
     * @return 批量操作结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public DeviceStatusTransitionService.BatchTransitionResult batchChangeStatus(
            List<Long> deviceIds, Integer targetStatus, Long operatorId, String remark) {
        DeviceStatus status = DeviceStatus.fromCode(targetStatus);
        return statusTransitionService.batchExecuteTransition(deviceIds, status, operatorId, remark);
    }

    /**
     * 获取设备状态统计
     *
     * @return 状态统计结果
     */
    @Override
    public StatusStatistics getStatusStatistics() {
        StatusStatistics statistics = new StatusStatistics();

        // 查询各状态数量
        statistics.setInStockCount(deviceRepository.countByStatus(
                DeviceStatus.IN_STOCK.getCode()).intValue());
        statistics.setBorrowedCount(deviceRepository.countByStatus(
                DeviceStatus.IN_USE.getCode()).intValue());
        statistics.setUnderMaintenanceCount(deviceRepository.countByStatus(
                DeviceStatus.MAINTENANCE.getCode()).intValue());
        statistics.setScrappedCount(deviceRepository.countByStatus(
                DeviceStatus.SCRAPPED.getCode()).intValue());

        // 计算总数
        int total = statistics.getInStockCount() + statistics.getBorrowedCount() +
                statistics.getUnderMaintenanceCount() + statistics.getScrappedCount();
        statistics.setTotalCount(total);

        return statistics;
    }

    /**
     * 检查设备编码是否存在
     *
     * @param deviceCode 设备编码
     * @return true表示存在
     */
    @Override
    public boolean existsByDeviceCode(String deviceCode) {
        return deviceRepository.existsByDeviceCode(deviceCode);
    }

    /**
     * 获取允许的状态流转列表
     *
     * @param deviceId 设备ID
     * @return 允许的流转列表
     */
    @Override
    public List<DeviceStatusTransitionService.StatusTransitionInfo> getAllowedTransitions(Long deviceId) {
        Device device = getDeviceById(deviceId);
        return statusTransitionService.getAllowedTransitions(device.getStatus());
    }

    /**
     * 获取设备历史记录
     *
     * @param deviceId 设备ID
     * @return 历史记录
     */
    @Override
    public Map<String, Object> getDeviceHistory(Long deviceId) {
        Map<String, Object> history = new java.util.HashMap<>();
        
        Device device = getDeviceById(deviceId);
        history.put("device", device);
        
        return history;
    }
}
