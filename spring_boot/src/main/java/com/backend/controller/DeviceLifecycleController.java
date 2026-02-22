package com.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.service.lifecycle.DeviceLifecycleService;
import com.backend.service.lifecycle.DeviceLifecycleService.DeviceLifecycleOverview;
import com.backend.service.lifecycle.DeviceLifecycleService.DeviceRelatedRecords;
import com.backend.service.lifecycle.DeviceLifecycleService.LifecycleEvent;
import com.backend.service.lifecycle.DeviceLifecycleService.LifecycleTimelineEntry;
import com.backend.service.lifecycle.DeviceLifecycleService.StatusChangeRecord;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 设备生命周期控制器
 * 
 * 提供设备全生命周期追踪功能的API接口
 */
@RestController
@RequestMapping("/lifecycle")
@RequiredArgsConstructor
@Tag(name = "设备生命周期", description = "设备全生命周期追踪管理接口")
public class DeviceLifecycleController {

    private final DeviceLifecycleService lifecycleService;

    @GetMapping("/overview/{deviceId}")
    @Operation(summary = "获取设备生命周期概览", description = "获取指定设备的全生命周期概览信息")
    public ApiResponse<DeviceLifecycleOverview> getLifecycleOverview(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        DeviceLifecycleOverview overview = lifecycleService.getLifecycleOverview(deviceId);
        return ApiResponse.success(overview);
    }

    @GetMapping("/events/{deviceId}")
    @Operation(summary = "获取设备生命周期事件", description = "获取指定设备的生命周期事件列表")
    public ApiResponse<List<LifecycleEvent>> getLifecycleEvents(
            @Parameter(description = "设备ID") @PathVariable Long deviceId,
            @Parameter(description = "事件类型") @RequestParam(required = false) String eventType,
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<LifecycleEvent> events = lifecycleService.getLifecycleEvents(deviceId, eventType, startDate, endDate);
        return ApiResponse.success(events);
    }

    @GetMapping("/timeline/{deviceId}")
    @Operation(summary = "获取设备生命周期时间线", description = "获取指定设备的生命周期时间线数据")
    public ApiResponse<List<LifecycleTimelineEntry>> getLifecycleTimeline(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        List<LifecycleTimelineEntry> timeline = lifecycleService.getLifecycleTimeline(deviceId);
        return ApiResponse.success(timeline);
    }

    @GetMapping("/status-history/{deviceId}")
    @Operation(summary = "获取设备状态变更历史", description = "获取指定设备的状态变更历史记录")
    public ApiResponse<List<StatusChangeRecord>> getStatusChangeHistory(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        List<StatusChangeRecord> history = lifecycleService.getStatusChangeHistory(deviceId);
        return ApiResponse.success(history);
    }

    @GetMapping("/related-records/{deviceId}")
    @Operation(summary = "获取设备关联记录", description = "获取指定设备的所有关联业务记录")
    public ApiResponse<DeviceRelatedRecords> getRelatedRecords(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        DeviceRelatedRecords records = lifecycleService.getRelatedRecords(deviceId);
        return ApiResponse.success(records);
    }

    @GetMapping("/statistics/{deviceId}")
    @Operation(summary = "获取设备生命周期统计", description = "获取指定设备的生命周期统计信息")
    public ApiResponse<Map<String, Object>> getLifecycleStatistics(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        Map<String, Object> statistics = lifecycleService.getLifecycleStatistics(deviceId);
        return ApiResponse.success(statistics);
    }

    @PostMapping("/batch-overview")
    @Operation(summary = "批量获取设备生命周期概览", description = "批量获取多个设备的生命周期概览信息")
    public ApiResponse<List<DeviceLifecycleOverview>> batchGetLifecycleOverview(
            @Parameter(description = "设备ID列表") @RequestBody List<Long> deviceIds) {
        List<DeviceLifecycleOverview> overviews = lifecycleService.batchGetLifecycleOverview(deviceIds);
        return ApiResponse.success(overviews);
    }
}
