package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.MaintenanceRecord;
import com.backend.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 维护记录控制器（兼容旧版API）
 * 
 * 功能说明：
 * 提供设备维护记录的RESTful API接口，兼容前端旧版API路径
 * 
 * API路径：/api/maintenance
 * 
 * @author 系统开发团队
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final RecordService recordService;

    @GetMapping("/list")
    public ApiResponse<PageResult<Map<String, Object>>> getMaintenanceList(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) Integer maintenanceType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        log.info("获取维护记录列表: deviceId={}, maintenanceType={}, status={}", deviceId, maintenanceType, status);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getMaintenanceRecords(deviceId, maintenanceType, status, startDate, endDate, pageable);
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> createMaintenance(@RequestBody MaintenanceRecord record) {
        log.info("创建维护记录: deviceId={}", record.getDeviceId());
        return recordService.createMaintenanceRecord(record);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getMaintenanceById(@PathVariable Long id) {
        log.info("获取维护记录详情: id={}", id);
        return recordService.getMaintenanceById(id);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateMaintenance(@PathVariable Long id, @RequestBody MaintenanceRecord record) {
        log.info("更新维护记录: id={}", id);
        return recordService.updateMaintenanceRecord(id, record);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMaintenance(@PathVariable Long id) {
        log.info("删除维护记录: id={}", id);
        return recordService.deleteMaintenanceRecord(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> approveMaintenance(@PathVariable Long id) {
        log.info("批准维护记录: id={}", id);
        return recordService.approveMaintenanceRecord(id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> rejectMaintenance(@PathVariable Long id) {
        log.info("拒绝维护记录: id={}", id);
        return recordService.rejectMaintenanceRecord(id);
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<Void> completeMaintenance(@PathVariable Long id, @RequestBody CompleteMaintenanceRequest request) {
        log.info("完成维护记录: id={}", id);
        return recordService.completeMaintenance(id, request.getMaintenanceResult(), request.getActualCost());
    }

    @GetMapping("/device/{deviceId}")
    public ApiResponse<PageResult<Map<String, Object>>> getDeviceMaintenance(
            @PathVariable Long deviceId,
            @Valid PageRequest pageReq) {
        log.info("获取设备维护记录: deviceId={}", deviceId);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getDeviceMaintenance(deviceId, pageable);
    }

    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getMaintenanceStatistics() {
        log.info("获取维护统计信息");
        return recordService.getMaintenanceStatistics();
    }

    @GetMapping("/page")
    public ApiResponse<PageResult<Map<String, Object>>> getMaintenancePage(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) Integer maintenanceType,
            @RequestParam(required = false) Integer status,
            @Valid PageRequest pageReq) {
        log.info("获取维护记录分页: deviceId={}, maintenanceType={}, status={}", deviceId, maintenanceType, status);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getMaintenanceRecords(deviceId, maintenanceType, status, null, null, pageable);
    }

    private Pageable buildPageable(PageRequest pageReq) {
        if (pageReq.getSort() != null && !pageReq.getSort().isEmpty()) {
            org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(pageReq.getValidOrder())
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;
            return org.springframework.data.domain.PageRequest.of(
                    pageReq.getJpaPage(), pageReq.getSafeSize(),
                    org.springframework.data.domain.Sort.by(direction, pageReq.getSort()));
        }
        return org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(), pageReq.getSafeSize());
    }

    public static class CompleteMaintenanceRequest {
        private String maintenanceResult;
        private Double actualCost;

        public String getMaintenanceResult() {
            return maintenanceResult;
        }

        public void setMaintenanceResult(String maintenanceResult) {
            this.maintenanceResult = maintenanceResult;
        }

        public Double getActualCost() {
            return actualCost;
        }

        public void setActualCost(Double actualCost) {
            this.actualCost = actualCost;
        }
    }
}
