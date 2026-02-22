package com.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.controller.base.BaseController;
import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.RepairRecord;
import com.backend.enums.DeviceStatus;
import com.backend.repository.DeviceRepository;
import com.backend.service.RecordService;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/repair-records")
@RequiredArgsConstructor
public class RepairRecordController extends BaseController {

    private final RecordService recordService;
    private final DeviceRepository deviceRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN') or hasRole('VIEWER')")
    public ApiResponse<PageResult<Map<String, Object>>> getRepairRecordList(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) String faultType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        log.info("获取维修记录列表: deviceId={}, faultType={}, status={}", deviceId, faultType, status);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getRepairRecords(deviceId, faultType, status, startDate, endDate, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN') or hasRole('VIEWER')")
    public ApiResponse<Map<String, Object>> getRepairRecordById(@PathVariable Long id) {
        log.info("获取维修记录详情: id={}", id);
        return recordService.getRepairById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Map<String, Object>> createRepairRecord(@RequestBody RepairRecord record) {
        log.info("创建维修记录: deviceId={}", record.getDeviceId());
        return recordService.createRepairRecord(record);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Void> updateRepairRecord(@PathVariable Long id, @RequestBody RepairRecord record) {
        log.info("更新维修记录: id={}", id);
        return recordService.updateRepairRecord(id, record);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteRepairRecord(@PathVariable Long id) {
        log.info("删除维修记录: id={}", id);
        return recordService.deleteRepairRecord(id);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Void> completeRepair(
            @PathVariable Long id,
            @RequestBody CompleteRepairRequest request) {
        log.info("完成维修: id={}, targetStatus={}", id, request.getTargetDeviceStatus());
        return recordService.completeRepair(
                id,
                request.getRepairResult(),
                request.getRepairCost(),
                request.getTargetDeviceStatus());
    }

    @GetMapping("/device/{deviceId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN') or hasRole('VIEWER')")
    public ApiResponse<PageResult<Map<String, Object>>> getDeviceRepairHistory(
            @PathVariable Long deviceId,
            @Valid PageRequest pageReq) {
        log.info("获取设备维修历史: deviceId={}", deviceId);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getDeviceRepairs(deviceId, pageable);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('VIEWER')")
    public ApiResponse<Map<String, Object>> getRepairStatistics() {
        log.info("获取维修统计信息");
        return recordService.getRepairStatistics();
    }

    @GetMapping("/device-status-options")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN')")
    public ApiResponse<List<Map<String, Object>>> getDeviceStatusOptions() {
        List<Map<String, Object>> options = new ArrayList<>();

        Map<String, Object> inStock = new HashMap<>();
        inStock.put("value", DeviceStatus.IN_STOCK.getCode());
        inStock.put("label", "返回库存");
        inStock.put("description", "设备返回仓库库存");
        options.add(inStock);

        Map<String, Object> inUse = new HashMap<>();
        inUse.put("value", DeviceStatus.IN_USE.getCode());
        inUse.put("label", "继续使用");
        inUse.put("description", "设备继续在原位置使用");
        options.add(inUse);

        return ApiResponse.success(options);
    }

    @Data
    public static class CompleteRepairRequest {
        private String repairResult;
        private Double repairCost;
        private Integer targetDeviceStatus = DeviceStatus.IN_STOCK.getCode();
    }
}
