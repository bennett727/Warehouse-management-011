package com.backend.service.statistics;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 统计分析服务接口
 * 
 * 提供基于关联数据的综合统计分析功能
 */
public interface StatisticsAnalysisService {

    /**
     * 获取设备综合统计
     */
    DeviceComprehensiveStats getDeviceComprehensiveStats();

    /**
     * 获取库存综合统计
     */
    InventoryComprehensiveStats getInventoryComprehensiveStats();

    /**
     * 获取业务记录统计
     */
    BusinessRecordStats getBusinessRecordStats(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 获取设备状态分布统计
     */
    List<StatusDistribution> getDeviceStatusDistribution();

    /**
     * 获取设备类型分布统计
     */
    List<TypeDistribution> getDeviceTypeDistribution();

    /**
     * 获取库存周转率统计
     */
    List<TurnoverRate> getInventoryTurnoverRate(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 获取维修效率统计
     */
    RepairEfficiencyStats getRepairEfficiencyStats(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 获取设备利用率统计
     */
    UtilizationStats getDeviceUtilizationStats(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 获取趋势分析数据
     */
    TrendAnalysis getTrendAnalysis(String metric, LocalDateTime startDate, LocalDateTime endDate, String granularity);

    /**
     * 获取预警统计
     */
    AlertStats getAlertStats();

    /**
     * 获取操作员绩效统计
     */
    List<OperatorPerformance> getOperatorPerformance(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 获取区域库存统计
     */
    List<AreaInventoryStats> getAreaInventoryStats();

    /**
     * 设备综合统计
     */
    record DeviceComprehensiveStats(
        long totalDevices,
        long activeDevices,
        long inUseDevices,
        long inMaintenanceDevices,
        long scrappedDevices,
        double avgDaysInUse,
        double utilizationRate,
        long newDevicesThisMonth,
        long maintenanceDevicesThisMonth
    ) {}

    /**
     * 库存综合统计
     */
    record InventoryComprehensiveStats(
        long totalItems,
        long totalQuantity,
        double totalValue,
        long lowStockItems,
        long outOfStockItems,
        long overStockItems,
        double avgTurnoverDays,
        long inboundCountThisMonth,
        long outboundCountThisMonth
    ) {}

    /**
     * 业务记录统计
     */
    record BusinessRecordStats(
        long totalInstallations,
        long totalRepairs,
        long totalMaintenance,
        long totalScraps,
        double avgRepairTime,
        double totalRepairCost,
        double totalMaintenanceCost,
        long pendingApprovals
    ) {}

    /**
     * 状态分布
     */
    record StatusDistribution(
        String status,
        String statusText,
        long count,
        double percentage
    ) {}

    /**
     * 类型分布
     */
    record TypeDistribution(
        Long typeId,
        String typeName,
        long count,
        double percentage,
        double avgAge
    ) {}

    /**
     * 周转率
     */
    record TurnoverRate(
        Long deviceId,
        String deviceCode,
        String deviceName,
        int inboundCount,
        int outboundCount,
        double turnoverRate,
        double avgDaysInStock
    ) {}

    /**
     * 维修效率统计
     */
    record RepairEfficiencyStats(
        long totalRepairs,
        long completedRepairs,
        long pendingRepairs,
        double avgRepairTime,
        double onTimeCompletionRate,
        double totalCost,
        double avgCostPerRepair
    ) {}

    /**
     * 利用率统计
     */
    record UtilizationStats(
        double overallUtilizationRate,
        double avgDaysInUse,
        double avgDaysIdle,
        List<UtilizationByType> utilizationByType
    ) {}

    /**
     * 按类型利用率
     */
    record UtilizationByType(
        String typeName,
        long totalDevices,
        long inUseDevices,
        double utilizationRate
    ) {}

    /**
     * 趋势分析
     */
    record TrendAnalysis(
        String metric,
        String granularity,
        List<TrendDataPoint> dataPoints,
        double growthRate,
        String trend
    ) {}

    /**
     * 趋势数据点
     */
    record TrendDataPoint(
        String period,
        double value,
        double change,
        double changePercent
    ) {}

    /**
     * 预警统计
     */
    record AlertStats(
        long lowStockAlerts,
        long maintenanceDueAlerts,
        long overdueRepairs,
        long expiringBatches,
        long pendingApprovals
    ) {}

    /**
     * 操作员绩效
     */
    record OperatorPerformance(
        Long operatorId,
        String operatorName,
        long inboundOperations,
        long outboundOperations,
        long installationCount,
        long repairCount,
        double avgOperationTime,
        double efficiency
    ) {}

    /**
     * 区域库存统计
     */
    record AreaInventoryStats(
        Long areaId,
        String areaName,
        long totalItems,
        long totalQuantity,
        double utilizationRate,
        long lowStockItems
    ) {}
}
