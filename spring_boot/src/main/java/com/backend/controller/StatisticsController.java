package com.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.service.statistics.StatisticsAnalysisService;
import com.backend.service.statistics.StatisticsAnalysisService.AlertStats;
import com.backend.service.statistics.StatisticsAnalysisService.AreaInventoryStats;
import com.backend.service.statistics.StatisticsAnalysisService.BusinessRecordStats;
import com.backend.service.statistics.StatisticsAnalysisService.DeviceComprehensiveStats;
import com.backend.service.statistics.StatisticsAnalysisService.InventoryComprehensiveStats;
import com.backend.service.statistics.StatisticsAnalysisService.OperatorPerformance;
import com.backend.service.statistics.StatisticsAnalysisService.RepairEfficiencyStats;
import com.backend.service.statistics.StatisticsAnalysisService.StatusDistribution;
import com.backend.service.statistics.StatisticsAnalysisService.TrendAnalysis;
import com.backend.service.statistics.StatisticsAnalysisService.TurnoverRate;
import com.backend.service.statistics.StatisticsAnalysisService.TypeDistribution;
import com.backend.service.statistics.StatisticsAnalysisService.UtilizationStats;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 统计分析控制器
 */
@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@Tag(name = "统计分析", description = "综合统计分析接口")
public class StatisticsController {

    private final StatisticsAnalysisService statisticsService;

    @GetMapping("/device/comprehensive")
    @Operation(summary = "获取设备综合统计", description = "获取设备综合统计数据")
    public ApiResponse<DeviceComprehensiveStats> getDeviceComprehensiveStats() {
        return ApiResponse.success(statisticsService.getDeviceComprehensiveStats());
    }

    @GetMapping("/inventory/comprehensive")
    @Operation(summary = "获取库存综合统计", description = "获取库存综合统计数据")
    public ApiResponse<InventoryComprehensiveStats> getInventoryComprehensiveStats() {
        return ApiResponse.success(statisticsService.getInventoryComprehensiveStats());
    }

    @GetMapping("/business-records")
    @Operation(summary = "获取业务记录统计", description = "获取业务记录统计数据")
    public ApiResponse<BusinessRecordStats> getBusinessRecordStats(
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ApiResponse.success(statisticsService.getBusinessRecordStats(startDate, endDate));
    }

    @GetMapping("/device/status-distribution")
    @Operation(summary = "获取设备状态分布", description = "获取设备状态分布统计")
    public ApiResponse<List<StatusDistribution>> getDeviceStatusDistribution() {
        return ApiResponse.success(statisticsService.getDeviceStatusDistribution());
    }

    @GetMapping("/device/type-distribution")
    @Operation(summary = "获取设备类型分布", description = "获取设备类型分布统计")
    public ApiResponse<List<TypeDistribution>> getDeviceTypeDistribution() {
        return ApiResponse.success(statisticsService.getDeviceTypeDistribution());
    }

    @GetMapping("/inventory/turnover-rate")
    @Operation(summary = "获取库存周转率", description = "获取库存周转率统计")
    public ApiResponse<List<TurnoverRate>> getInventoryTurnoverRate(
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ApiResponse.success(statisticsService.getInventoryTurnoverRate(startDate, endDate));
    }

    @GetMapping("/repair/efficiency")
    @Operation(summary = "获取维修效率统计", description = "获取维修效率统计数据")
    public ApiResponse<RepairEfficiencyStats> getRepairEfficiencyStats(
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ApiResponse.success(statisticsService.getRepairEfficiencyStats(startDate, endDate));
    }

    @GetMapping("/device/utilization")
    @Operation(summary = "获取设备利用率统计", description = "获取设备利用率统计数据")
    public ApiResponse<UtilizationStats> getDeviceUtilizationStats(
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ApiResponse.success(statisticsService.getDeviceUtilizationStats(startDate, endDate));
    }

    @GetMapping("/trend")
    @Operation(summary = "获取趋势分析", description = "获取指定指标的趋势分析数据")
    public ApiResponse<TrendAnalysis> getTrendAnalysis(
            @Parameter(description = "指标名称") @RequestParam String metric,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "粒度(day/week/month)") @RequestParam(defaultValue = "day") String granularity) {
        return ApiResponse.success(statisticsService.getTrendAnalysis(metric, startDate, endDate, granularity));
    }

    @GetMapping("/alerts")
    @Operation(summary = "获取预警统计", description = "获取系统预警统计数据")
    public ApiResponse<AlertStats> getAlertStats() {
        return ApiResponse.success(statisticsService.getAlertStats());
    }

    @GetMapping("/operator/performance")
    @Operation(summary = "获取操作员绩效", description = "获取操作员绩效统计数据")
    public ApiResponse<List<OperatorPerformance>> getOperatorPerformance(
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ApiResponse.success(statisticsService.getOperatorPerformance(startDate, endDate));
    }

    @GetMapping("/area/inventory")
    @Operation(summary = "获取区域库存统计", description = "获取各区域的库存统计数据")
    public ApiResponse<List<AreaInventoryStats>> getAreaInventoryStats() {
        return ApiResponse.success(statisticsService.getAreaInventoryStats());
    }
}
