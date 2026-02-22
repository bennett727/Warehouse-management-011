package com.backend.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.BatchOperationRequest;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.service.DeviceService;
import com.backend.service.device.DeviceStatusTransitionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 设备管理控制器（统一优化版）
 *
 * 功能说明：
 * 提供设备管理的RESTful API接口，包括设备的增删改查、状态管理等功能
 *
 * 优化记录：
 * - 2025-02-08: 统一优化版本，整合V2优化内容
 * 1. 统一分页参数（page/size/sort/order）
 * 2. 标准化批量操作接口
 * 3. 优化API路径设计
 * 4. 完善Swagger文档
 *
 * API路径：/api/devices
 *
 * 权限控制：
 * - 查询操作：ADMIN, OPERATOR, TECHNICIAN
 * - 写操作：ADMIN, OPERATOR
 * - 删除操作：ADMIN
 *
 * @author 后端优化团队
 * @version 3.0
 * @since 2025-02-08
 */
@Slf4j
@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
@Tag(name = "设备管理", description = "设备的增删改查、状态管理等接口（统一优化版）")
public class DeviceController {

    private final DeviceService deviceService;

    // ==================== 设备CRUD接口 ====================

    /**
     * 创建设备
     *
     * @param device 设备信息
     * @return 创建后的设备
     */
    @PostMapping
    @Operation(summary = "创建设备", description = "创建新的设备信息")
    public ApiResponse<Device> createDevice(
            @Valid @RequestBody Device device) {
        log.info("创建设备: deviceCode={}", device.getDeviceCode());
        Device createdDevice = deviceService.createDevice(device);
        return ApiResponse.success("设备创建成功", createdDevice);
    }

    /**
     * 更新设备
     *
     * @param deviceId 设备ID
     * @param device   设备信息
     * @return 更新后的设备
     */
    @PutMapping("/{deviceId}")
    @Operation(summary = "更新设备", description = "更新指定设备的信息")
    public ApiResponse<Device> updateDevice(
            @Parameter(description = "设备ID") @PathVariable Long deviceId,
            @Valid @RequestBody Device device) {
        log.info("更新设备: deviceId={}", deviceId);
        Device updatedDevice = deviceService.updateDevice(deviceId, device);
        return ApiResponse.success("设备更新成功", updatedDevice);
    }

    /**
     * 删除设备
     *
     * @param deviceId 设备ID
     * @return 操作结果
     */
    @DeleteMapping("/{deviceId}")
    @Operation(summary = "删除设备", description = "删除指定设备（仅限在库状态的设备）")
    public ApiResponse<Void> deleteDevice(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        log.info("删除设备: deviceId={}", deviceId);
        deviceService.deleteDevice(deviceId);
        return ApiResponse.success("设备删除成功", null);
    }

    /**
     * 根据ID查询设备
     *
     * @param deviceId 设备ID
     * @return 设备信息
     */
    @GetMapping("/{deviceId}")
    @Operation(summary = "查询设备详情", description = "根据ID查询设备详细信息")
    public ApiResponse<Device> getDeviceById(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        Device device = deviceService.getDeviceById(deviceId);
        return ApiResponse.success(device);
    }

    /**
     * 根据编码查询设备
     *
     * @param deviceCode 设备编码
     * @return 设备信息
     */
    @GetMapping("/code/{deviceCode}")
    @Operation(summary = "根据编码查询设备", description = "根据设备编码查询设备信息")
    public ApiResponse<Device> getDeviceByCode(
            @Parameter(description = "设备编码") @PathVariable String deviceCode) {
        Device device = deviceService.getDeviceByCode(deviceCode);
        return ApiResponse.success(device);
    }

    // ==================== 统一分页查询接口 ====================

    /**
     * 分页查询设备列表（统一优化版）
     *
     * 优化点：
     * 1. 使用统一分页参数对象PageRequest（page/size/sort/order）
     * 2. 页码从1开始，符合前端使用习惯
     * 3. 支持动态排序
     * 4. 限制最大每页100条
     *
     * @param keyword 关键词（可选）
     * @param typeId  类型ID（可选）
     * @param status  状态（可选）
     * @param areaId  库区ID（可选）
     * @param pageReq 统一分页参数
     * @return 分页结果
     */
    @GetMapping
    @Operation(summary = "查询设备列表", description = "分页查询设备列表，支持统一分页参数和动态排序")
    public ApiResponse<PageResult<Device>> getDeviceList(
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "类型ID") @RequestParam(required = false) Long typeId,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "库区ID") @RequestParam(required = false) Long areaId,
            @Valid PageRequest pageReq) {

        // 构建JPA分页对象
        Pageable pageable = buildPageable(pageReq);

        log.info("查询设备列表: keyword={}, typeId={}, status={}, page={}, size={}",
                keyword, typeId, status, pageReq.getPage(), pageReq.getSize());

        PageResult<Device> result = deviceService.getDeviceList(
                keyword, typeId, status, areaId, pageable);

        return ApiResponse.success(result);
    }

    // ==================== 统一批量操作接口 ====================

    /**
     * 批量删除设备
     *
     * 优化点：
     * 1. 使用统一批量操作请求对象BatchOperationRequest
     * 2. 限制单次最多100条
     * 3. 返回详细的操作结果（成功/失败数量、失败原因）
     *
     * @param request 批量操作请求
     * @return 操作结果
     */
    @PostMapping("/batch/delete")
    @Operation(summary = "批量删除设备", description = "批量删除设备，单次最多100条")
    public ApiResponse<BatchOperationResult> batchDeleteDevices(
            @Valid @RequestBody BatchOperationRequest request) {

        log.info("批量删除设备: count={}", request.getCount());

        List<Long> safeIds = request.getSafeIds();
        BatchOperationResult result = new BatchOperationResult();

        int successCount = 0;
        int failCount = 0;

        for (Long deviceId : safeIds) {
            try {
                deviceService.deleteDevice(deviceId);
                successCount++;
            } catch (Exception e) {
                log.warn("删除设备失败: deviceId={}, error={}", deviceId, e.getMessage());
                failCount++;
                result.addFailedItem(deviceId, e.getMessage());
            }
        }

        result.setTotal(safeIds.size());
        result.setSuccessCount(successCount);
        result.setFailCount(failCount);

        return ApiResponse.success(
                String.format("批量删除完成：成功%d条，失败%d条", successCount, failCount),
                result);
    }

    /**
     * 批量更新设备状态
     *
     * @param request 批量操作请求（需包含status字段）
     * @return 操作结果
     */
    @PostMapping("/batch/status")
    @Operation(summary = "批量更新设备状态", description = "批量更新设备状态，单次最多100条")
    public ApiResponse<BatchOperationResult> batchUpdateStatus(
            @Valid @RequestBody BatchOperationRequest request) {

        if (request.getStatus() == null) {
            return ApiResponse.error(400, "目标状态不能为空");
        }

        log.info("批量更新设备状态: count={}, targetStatus={}",
                request.getCount(), request.getStatus());

        List<Long> safeIds = request.getSafeIds();
        BatchOperationResult result = new BatchOperationResult();

        int successCount = 0;
        int failCount = 0;

        for (Long deviceId : safeIds) {
            try {
                deviceService.changeStatus(deviceId, request.getStatus(), null, request.getReason());
                successCount++;
            } catch (Exception e) {
                log.warn("更新设备状态失败: deviceId={}, error={}", deviceId, e.getMessage());
                failCount++;
                result.addFailedItem(deviceId, e.getMessage());
            }
        }

        result.setTotal(safeIds.size());
        result.setSuccessCount(successCount);
        result.setFailCount(failCount);

        return ApiResponse.success(
                String.format("批量更新完成：成功%d条，失败%d条", successCount, failCount),
                result);
    }

    // ==================== 设备状态管理接口 ====================

    /**
     * 变更设备状态
     *
     * @param deviceId 设备ID
     * @param request  状态变更请求
     * @return 更新后的设备
     */
    @PostMapping("/{deviceId}/status")
    @Operation(summary = "变更设备状态", description = "变更设备状态（在库、借用中、维修中、报废）")
    public ApiResponse<Device> changeStatus(
            @Parameter(description = "设备ID") @PathVariable Long deviceId,
            @Valid @RequestBody StatusChangeRequest request) {
        log.info("变更设备状态: deviceId={}, targetStatus={}", deviceId, request.getTargetStatus());
        Device device = deviceService.changeStatus(deviceId, request.getTargetStatus(),
                request.getOperatorId(), request.getRemark());
        return ApiResponse.success("状态变更成功", device);
    }

    /**
     * 获取允许的状态流转列表
     *
     * @param deviceId 设备ID
     * @return 允许的流转列表
     */
    @GetMapping("/{deviceId}/transitions")
    @Operation(summary = "获取允许的状态流转", description = "获取指定设备当前允许的状态流转列表")
    public ApiResponse<List<DeviceStatusTransitionService.StatusTransitionInfo>> getAllowedTransitions(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        List<DeviceStatusTransitionService.StatusTransitionInfo> transitions = deviceService
                .getAllowedTransitions(deviceId);
        return ApiResponse.success(transitions);
    }

    // ==================== 设备统计接口 ====================

    /**
     * 获取设备状态统计
     *
     * @return 状态统计结果
     */
    @GetMapping("/statistics/status")
    @Operation(summary = "设备状态统计", description = "获取各状态设备的数量统计")
    public ApiResponse<DeviceService.StatusStatistics> getStatusStatistics() {
        DeviceService.StatusStatistics statistics = deviceService.getStatusStatistics();
        return ApiResponse.success(statistics);
    }

    /**
     * 检查设备编码是否存在
     *
     * @param deviceCode 设备编码
     * @return 检查结果
     */
    @GetMapping("/check-code")
    @Operation(summary = "检查设备编码", description = "检查设备编码是否已存在")
    public ApiResponse<Boolean> checkDeviceCode(
            @Parameter(description = "设备编码") @RequestParam String deviceCode) {
        boolean exists = deviceService.existsByDeviceCode(deviceCode);
        return ApiResponse.success(exists);
    }

    /**
     * 获取设备历史记录
     *
     * @param deviceId 设备ID
     * @return 历史记录
     */
    @GetMapping("/{deviceId}/history")
    @Operation(summary = "获取设备历史记录", description = "获取指定设备的历史记录")
    public ApiResponse<java.util.Map<String, Object>> getDeviceHistory(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        log.info("获取设备历史记录: deviceId={}", deviceId);
        java.util.Map<String, Object> history = deviceService.getDeviceHistory(deviceId);
        return ApiResponse.success(history);
    }

    // ==================== 辅助方法 ====================

    /**
     * 根据PageRequest构建JPA Pageable对象
     *
     * @param pageReq 统一分页请求
     * @return JPA分页对象
     */
    private Pageable buildPageable(PageRequest pageReq) {
        // 构建排序
        Sort sort = Sort.by("createTime").descending(); // 默认排序

        if (pageReq.getSort() != null && !pageReq.getSort().trim().isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(pageReq.getOrder())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            // 字段名映射：将前端的createdAt映射到后端的createTime
            String sortField = pageReq.getSort();
            if ("createdAt".equals(sortField)) {
                sortField = "createTime";
            }
            sort = Sort.by(direction, sortField);
        }

        // 构建分页对象（JPA页码从0开始）
        return org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(),
                pageReq.getSafeSize(),
                sort);
    }

    // ==================== 内部请求类 ====================

    /**
     * 状态变更请求
     */
    public static class StatusChangeRequest {
        private Integer targetStatus;
        private Long operatorId;
        private String remark;

        // Getters and Setters
        public Integer getTargetStatus() {
            return targetStatus;
        }

        public void setTargetStatus(Integer targetStatus) {
            this.targetStatus = targetStatus;
        }

        public Long getOperatorId() {
            return operatorId;
        }

        public void setOperatorId(Long operatorId) {
            this.operatorId = operatorId;
        }

        public String getRemark() {
            return remark;
        }

        public void setRemark(String remark) {
            this.remark = remark;
        }
    }

    /**
     * 批量操作结果
     */
    public static class BatchOperationResult {
        private int total;
        private int successCount;
        private int failCount;
        private java.util.Map<Long, String> failedItems = new java.util.HashMap<>();

        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }

        public int getSuccessCount() {
            return successCount;
        }

        public void setSuccessCount(int successCount) {
            this.successCount = successCount;
        }

        public int getFailCount() {
            return failCount;
        }

        public void setFailCount(int failCount) {
            this.failCount = failCount;
        }

        public java.util.Map<Long, String> getFailedItems() {
            return failedItems;
        }

        public void setFailedItems(java.util.Map<Long, String> failedItems) {
            this.failedItems = failedItems;
        }

        public void addFailedItem(Long id, String reason) {
            failedItems.put(id, reason);
        }
    }
}
