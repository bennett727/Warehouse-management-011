package com.backend.controller;

import com.backend.controller.base.BaseController;
import com.backend.dto.ApiResponse;
import com.backend.dto.repair.RepairOutboundDTO;
import com.backend.dto.repair.RepairOutboundProgressDTO;
import com.backend.dto.repair.RepairOutboundCompleteDTO;
import com.backend.entity.RepairOutbound;
import com.backend.service.inventory.RepairOutboundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 修复出库控制器
 * 处理设备修复出库相关的HTTP请求
 */
@Slf4j
@RestController
@RequestMapping("/inventory/repair-outbound")
@RequiredArgsConstructor
public class RepairOutboundController extends BaseController {

    private final RepairOutboundService repairOutboundService;

    /**
     * 创建修复出库单
     *
     * @param dto 修复出库数据
     * @return 创建的修复出库记录
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<RepairOutbound> createRepairOutbound(@RequestBody RepairOutboundDTO dto) {
        try {
            RepairOutbound repairOutbound = repairOutboundService.createRepairOutbound(dto, getCurrentUserId());
            return ApiResponse.success("修复出库单创建成功", repairOutbound);
        } catch (Exception e) {
            log.error("创建修复出库单失败", e);
            return ApiResponse.error(500, "创建修复出库单失败: " + e.getMessage());
        }
    }

    /**
     * 获取修复出库列表
     *
     * @param status 状态
     * @param deviceName 设备名称
     * @param page 页码
     * @param size 每页数量
     * @return 分页修复出库列表
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN')")
    public ApiResponse<Page<RepairOutbound>> getRepairOutboundList(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String deviceName,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<RepairOutbound> result = repairOutboundService.getRepairOutboundList(status, deviceName, pageable);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("获取修复出库列表失败", e);
            return ApiResponse.error(500, "获取修复出库列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取修复出库详情
     *
     * @param id 修复出库ID
     * @return 修复出库详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN')")
    public ApiResponse<RepairOutbound> getRepairOutboundDetail(@PathVariable Long id) {
        try {
            RepairOutbound repairOutbound = repairOutboundService.getRepairOutboundDetail(id);
            return ApiResponse.success(repairOutbound);
        } catch (Exception e) {
            log.error("获取修复出库详情失败", e);
            return ApiResponse.error(500, "获取修复出库详情失败: " + e.getMessage());
        }
    }

    /**
     * 更新修复进度
     *
     * @param id 修复出库ID
     * @param dto 进度数据
     * @return 更新后的修复出库记录
     */
    @PutMapping("/{id}/progress")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ApiResponse<RepairOutbound> updateRepairProgress(
            @PathVariable Long id,
            @RequestBody RepairOutboundProgressDTO dto) {
        try {
            RepairOutbound repairOutbound = repairOutboundService.updateRepairProgress(id, dto, getCurrentUserId());
            return ApiResponse.success("修复进度更新成功", repairOutbound);
        } catch (Exception e) {
            log.error("更新修复进度失败", e);
            return ApiResponse.error(500, "更新修复进度失败: " + e.getMessage());
        }
    }

    /**
     * 完成修复入库
     *
     * @param id 修复出库ID
     * @param dto 完成数据
     * @return 完成后的修复出库记录
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN')")
    public ApiResponse<RepairOutbound> completeRepairInbound(
            @PathVariable Long id,
            @RequestBody RepairOutboundCompleteDTO dto) {
        try {
            RepairOutbound repairOutbound = repairOutboundService.completeRepairInbound(id, dto, getCurrentUserId());
            return ApiResponse.success("修复完成入库成功", repairOutbound);
        } catch (Exception e) {
            log.error("完成修复入库失败", e);
            return ApiResponse.error(500, "完成修复入库失败: " + e.getMessage());
        }
    }

    /**
     * 取消修复出库
     *
     * @param id 修复出库ID
     * @param reason 取消原因
     * @return 操作结果
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> cancelRepairOutbound(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            repairOutboundService.cancelRepairOutbound(id, reason, getCurrentUserId());
            return ApiResponse.success("修复出库已取消", null);
        } catch (Exception e) {
            log.error("取消修复出库失败", e);
            return ApiResponse.error(500, "取消修复出库失败: " + e.getMessage());
        }
    }

    /**
     * 获取修复统计信息
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Map<String, Object>> getRepairStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            Map<String, Object> statistics = repairOutboundService.getRepairStatistics(startDate, endDate);
            return ApiResponse.success(statistics);
        } catch (Exception e) {
            log.error("获取修复统计信息失败", e);
            return ApiResponse.error(500, "获取修复统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备的修复历史
     *
     * @param deviceId 设备ID
     * @return 修复历史列表
     */
    @GetMapping("/device/{deviceId}/history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN')")
    public ApiResponse<List<RepairOutbound>> getDeviceRepairHistory(@PathVariable Long deviceId) {
        try {
            List<RepairOutbound> history = repairOutboundService.getDeviceRepairHistory(deviceId);
            return ApiResponse.success(history);
        } catch (Exception e) {
            log.error("获取设备修复历史失败", e);
            return ApiResponse.error(500, "获取设备修复历史失败: " + e.getMessage());
        }
    }

    /**
     * 生成修复出库单号
     *
     * @return 修复出库单号
     */
    @GetMapping("/generate-no")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<String> generateRepairNo() {
        try {
            String repairNo = repairOutboundService.generateRepairNo();
            return ApiResponse.success(repairNo);
        } catch (Exception e) {
            log.error("生成修复出库单号失败", e);
            return ApiResponse.error(500, "生成修复出库单号失败: " + e.getMessage());
        }
    }
}
