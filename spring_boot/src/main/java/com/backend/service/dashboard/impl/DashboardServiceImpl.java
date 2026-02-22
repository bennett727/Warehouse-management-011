/*
 * @file: DashboardServiceImpl.java
 * @description: 仪表盘服务实现类，提供系统概览数据、最近活动记录、统计数据等仪表盘相关的业务逻辑实现
 * @author: 开发团队
 * @createTime: 2025-12-21
 * @version: 1.0.0
 * @modifyRecords:
 *     2025-12-21: 初始版本创建
 */
package com.backend.service.dashboard.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.backend.entity.Area;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.OperationLog;
import com.backend.entity.StockOrder;
import com.backend.enumtype.EntityType;
import com.backend.exception.BusinessException;
import com.backend.dto.PageResult;
import com.backend.service.area.AreaService;
import com.backend.service.dashboard.DashboardService;
import com.backend.service.device.DeviceQueryService;
import com.backend.service.device.maintenance.MaintenanceRecordService;
import com.backend.service.operationlog.OperationLogService;
import com.backend.service.stock.StockOrderService;

/**
 * 仪表盘服务实现类
 * 提供仪表盘相关的业务逻辑实现
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final DeviceQueryService deviceQueryService;
    private final AreaService areaService;
    private final StockOrderService stockOrderService;
    private final MaintenanceRecordService maintenanceRecordService;
    private final OperationLogService operationLogService;

    public DashboardServiceImpl(DeviceQueryService deviceQueryService,
            AreaService areaService,
            StockOrderService stockOrderService,
            MaintenanceRecordService maintenanceRecordService,
            OperationLogService operationLogService) {
        this.deviceQueryService = deviceQueryService;
        this.areaService = areaService;
        this.stockOrderService = stockOrderService;
        this.maintenanceRecordService = maintenanceRecordService;
        this.operationLogService = operationLogService;
    }

    @Override
    @Cacheable(value = "dashboard", key = "'systemOverview'")
    public Map<String, Object> getSystemOverview() {
        logger.info("获取系统概览数据");
        Map<String, Object> overview = new HashMap<>();

        try {
            Map<String, Integer> deviceStats = deviceQueryService.getDeviceStatistics();
            overview.put("deviceCount", deviceStats.getOrDefault("total", 0));
            overview.put("deviceInUseCount", deviceStats.getOrDefault("inUse", 0));
            overview.put("deviceIdleCount", deviceStats.getOrDefault("idle", 0));
            overview.put("deviceMaintenanceCount", deviceStats.getOrDefault("maintenance", 0));
            overview.put("deviceScrapCount", deviceStats.getOrDefault("scrap", 0));

            List<Area> allAreas = areaService.getAllAreas();
            overview.put("areaCount", allAreas.size());

            List<StockOrder> allStockOrders = stockOrderService.getAllStockOrders();
            long inboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.INBOUND.getCode()))
                    .count();
            long outboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.OUTBOUND.getCode()))
                    .count();
            overview.put("inboundCount", inboundCount);
            overview.put("outboundCount", outboundCount);

            List<MaintenanceRecord> allMaintenanceRecords = maintenanceRecordService.getAllMaintenanceRecords();
            long pendingMaintenanceCount = allMaintenanceRecords.stream()
                    .filter(record -> record.getProcessStatus() != null && 
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.PENDING.getCode()))
                    .count();
            long inProgressMaintenanceCount = allMaintenanceRecords.stream()
                    .filter(record -> record.getProcessStatus() != null && 
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.IN_PROGRESS.getCode()))
                    .count();
            overview.put("maintenanceCount", allMaintenanceRecords.size());
            overview.put("pendingMaintenanceCount", pendingMaintenanceCount);
            overview.put("inProgressMaintenanceCount", inProgressMaintenanceCount);

            long recentOutbound = deviceQueryService.getRecentOutboundStats(7);
            long recentMaintenance = deviceQueryService.getRecentMaintenanceStats(7);
            overview.put("recentOutboundCount", recentOutbound);
            overview.put("recentMaintenanceCount", recentMaintenance);

            logger.info("系统概览数据获取成功");
            return overview;
        } catch (Exception e) {
            logger.error("获取系统概览数据失败: {}", e.getMessage(), e);
            throw new BusinessException("获取系统概览数据失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getRecentActivities() {
        logger.info("获取最近活动记录");
        try {
            Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createTime"));
            PageResult<OperationLog> logPage = operationLogService.getLogs(pageable, null);

            Map<String, Object> result = new HashMap<>();
            result.put("total", logPage.getTotal());
            result.put("activities", logPage.getRecords());

            logger.info("最近活动记录获取成功，共{}条", logPage.getTotal());
            return result;
        } catch (Exception e) {
            logger.error("获取最近活动记录失败: {}", e.getMessage(), e);
            throw new BusinessException("获取最近活动记录失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'deviceStatistics'")
    public Map<String, Object> getDeviceStatistics() {
        logger.info("获取设备统计信息");
        Map<String, Object> statistics = new HashMap<>();

        try {
            Map<String, Integer> deviceStats = deviceQueryService.getDeviceStatistics();
            statistics.putAll(deviceStats);

            Map<String, Long> typeStats = deviceQueryService.getDeviceTypeStats();
            statistics.put("typeStatistics", typeStats);

            Map<String, Long> statusStats = deviceQueryService.getDeviceStatusStats();
            statistics.put("statusStatistics", statusStats);

            Map<String, Object> enhancedStats = deviceQueryService.getEnhancedInventoryStatistics();
            statistics.putAll(enhancedStats);

            List<Map<String, Object>> areaStats = deviceQueryService.getAreaInventoryStatistics();
            statistics.put("areaStatistics", areaStats);

            List<Map<String, Object>> typeInventoryStats = deviceQueryService.getDeviceTypeInventoryStatistics();
            statistics.put("typeInventoryStatistics", typeInventoryStats);

            List<Map<String, Object>> principalStats = deviceQueryService.getPrincipalDeviceStatistics();
            statistics.put("principalStatistics", principalStats);

            logger.info("设备统计信息获取成功");
            return statistics;
        } catch (Exception e) {
            logger.error("获取设备统计信息失败: {}", e.getMessage(), e);
            throw new BusinessException("获取设备统计信息失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'inventoryStatistics'")
    public Map<String, Object> getInventoryStatistics() {
        logger.info("获取库存统计信息");
        Map<String, Object> statistics = new HashMap<>();

        try {
            Map<String, Object> inventoryStats = deviceQueryService.getInventoryStatistics();
            statistics.putAll(inventoryStats);

            List<StockOrder> allStockOrders = stockOrderService.getAllStockOrders();
            long inboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.INBOUND.getCode()))
                    .count();
            long outboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.OUTBOUND.getCode()))
                    .count();
            statistics.put("inboundOrderCount", inboundCount);
            statistics.put("outboundOrderCount", outboundCount);

            long pendingInbound = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.INBOUND.getCode())
                            && order.getStatus().equals(EntityType.StockOrderStatus.PENDING.getCode()))
                    .count();
            long pendingOutbound = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.OUTBOUND.getCode())
                            && order.getStatus().equals(EntityType.StockOrderStatus.PENDING.getCode()))
                    .count();
            statistics.put("pendingInboundCount", pendingInbound);
            statistics.put("pendingOutboundCount", pendingOutbound);

            logger.info("库存统计信息获取成功");
            return statistics;
        } catch (Exception e) {
            logger.error("获取库存统计信息失败: {}", e.getMessage(), e);
            throw new BusinessException("获取库存统计信息失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'maintenanceStatistics'")
    public Map<String, Object> getMaintenanceStatistics() {
        logger.info("获取维修统计信息");
        Map<String, Object> statistics = new HashMap<>();

        try {
            List<MaintenanceRecord> allRecords = maintenanceRecordService.getAllMaintenanceRecords();
            statistics.put("totalMaintenanceCount", allRecords.size());

            long pendingCount = allRecords.stream()
                    .filter(record -> record.getProcessStatus() != null &&
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.PENDING.getCode()))
                    .count();
            long inProgressCount = allRecords.stream()
                    .filter(record -> record.getProcessStatus() != null &&
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.IN_PROGRESS.getCode()))
                    .count();
            long completedCount = allRecords.stream()
                    .filter(record -> record.getProcessStatus() != null &&
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.COMPLETED.getCode()))
                    .count();

            statistics.put("pendingCount", pendingCount);
            statistics.put("inProgressCount", inProgressCount);
            statistics.put("completedCount", completedCount);

            long recentMaintenance = deviceQueryService.getRecentMaintenanceStats(30);
            statistics.put("recentMaintenanceCount", recentMaintenance);

            logger.info("维修统计信息获取成功");
            return statistics;
        } catch (Exception e) {
            logger.error("获取维修统计信息失败: {}", e.getMessage(), e);
            throw new BusinessException("获取维修统计信息失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'areaDistribution'")
    public Map<String, Object> getAreaDistribution() {
        logger.info("获取区域分布统计");
        Map<String, Object> distribution = new HashMap<>();

        try {
            List<Area> allAreas = areaService.getAllAreas();
            distribution.put("totalAreas", allAreas.size());

            Map<String, Integer> cityCount = new HashMap<>();
            Map<String, Integer> districtCount = new HashMap<>();

            for (Area area : allAreas) {
                String city = area.getCity() != null ? area.getCity().getName() : null;
                String district = area.getDistrict() != null ? area.getDistrict().getName() : null;

                if (city != null) {
                    cityCount.put(city, cityCount.getOrDefault(city, 0) + 1);
                    if (district != null) {
                        String districtKey = city + "-" + district;
                        districtCount.put(districtKey, districtCount.getOrDefault(districtKey, 0) + 1);
                    }
                }
            }

            distribution.put("cityDistribution", cityCount);
            distribution.put("districtDistribution", districtCount);

            List<Map<String, Object>> areaStats = deviceQueryService.getAreaInventoryStatistics();
            distribution.put("areaDeviceStats", areaStats);

            logger.info("区域分布统计获取成功");
            return distribution;
        } catch (Exception e) {
            logger.error("获取区域分布统计失败: {}", e.getMessage(), e);
            throw new BusinessException("获取区域分布统计失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getTrendData(Map<String, Object> params) {
        logger.info("获取趋势数据");
        Map<String, Object> trendData = new HashMap<>();

        try {
            int months = params.containsKey("months") ? (int) params.get("months") : 6;

            List<Map<String, Object>> purchaseTrend = deviceQueryService.getPurchaseTrendStatistics(months);
            trendData.put("purchaseTrend", purchaseTrend);

            List<Map<String, Object>> maintenanceTrend = new ArrayList<>();
            for (int i = months - 1; i >= 0; i--) {
                Map<String, Object> monthData = new HashMap<>();
                LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0)
                        .withMinute(0)
                        .withSecond(0);
                LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

                long monthMaintenance = deviceQueryService.getRecentMaintenanceStats((int) (i * 30));
                monthData.put("month", monthStart.getMonthValue());
                monthData.put("year", monthStart.getYear());
                monthData.put("count", monthMaintenance);
                maintenanceTrend.add(monthData);
            }
            trendData.put("maintenanceTrend", maintenanceTrend);

            List<Map<String, Object>> outboundTrend = new ArrayList<>();
            for (int i = months - 1; i >= 0; i--) {
                Map<String, Object> monthData = new HashMap<>();
                LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0)
                        .withMinute(0)
                        .withSecond(0);
                LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

                long monthOutbound = deviceQueryService.getRecentOutboundStats((int) (i * 30));
                monthData.put("month", monthStart.getMonthValue());
                monthData.put("year", monthStart.getYear());
                monthData.put("count", monthOutbound);
                outboundTrend.add(monthData);
            }
            trendData.put("outboundTrend", outboundTrend);

            logger.info("趋势数据获取成功");
            return trendData;
        } catch (Exception e) {
            logger.error("获取趋势数据失败: {}", e.getMessage(), e);
            throw new BusinessException("获取趋势数据失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'pendingTasks'")
    public Map<String, Object> getPendingTasks() {
        logger.info("获取待处理任务统计");
        Map<String, Object> pendingTasks = new HashMap<>();

        try {
            List<MaintenanceRecord> allMaintenanceRecords = maintenanceRecordService.getAllMaintenanceRecords();
            long pendingMaintenanceCount = allMaintenanceRecords.stream()
                    .filter(record -> record.getProcessStatus() != null && 
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.PENDING.getCode()))
                    .count();
            pendingTasks.put("pendingMaintenanceCount", pendingMaintenanceCount);

            List<StockOrder> allStockOrders = stockOrderService.getAllStockOrders();
            long pendingInboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.INBOUND.getCode())
                            && order.getStatus().equals(EntityType.StockOrderStatus.PENDING.getCode()))
                    .count();
            long pendingOutboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.OUTBOUND.getCode())
                            && order.getStatus().equals(EntityType.StockOrderStatus.PENDING.getCode()))
                    .count();
            pendingTasks.put("pendingInboundCount", pendingInboundCount);
            pendingTasks.put("pendingOutboundCount", pendingOutboundCount);

            List<Map<String, Object>> expiringDevices = deviceQueryService.getDevicesExpiringSoon(30);
            pendingTasks.put("expiringDevicesCount", expiringDevices.size());
            pendingTasks.put("expiringDevices", expiringDevices);

            long totalPending = pendingMaintenanceCount + pendingInboundCount + pendingOutboundCount;
            pendingTasks.put("totalPendingCount", totalPending);

            logger.info("待处理任务统计获取成功");
            return pendingTasks;
        } catch (Exception e) {
            logger.error("获取待处理任务统计失败: {}", e.getMessage(), e);
            throw new BusinessException("获取待处理任务统计失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'systemHealth'")
    public Map<String, Object> getSystemHealth() {
        logger.info("获取系统健康状态");
        Map<String, Object> healthStatus = new HashMap<>();

        try {
            Map<String, Integer> deviceStats = deviceQueryService.getDeviceStatistics();
            int totalDevices = deviceStats.getOrDefault("total", 0);
            int maintenanceDevices = deviceStats.getOrDefault("maintenance", 0);
            int scrapDevices = deviceStats.getOrDefault("scrap", 0);

            double deviceHealthRate = totalDevices > 0 ? (double) (totalDevices - maintenanceDevices - scrapDevices)
                    / totalDevices * 100 : 100.0;
            healthStatus.put("deviceHealthRate", Math.round(deviceHealthRate * 100.0) / 100.0);

            List<MaintenanceRecord> allMaintenanceRecords = maintenanceRecordService.getAllMaintenanceRecords();
            long pendingMaintenanceCount = allMaintenanceRecords.stream()
                    .filter(record -> record.getProcessStatus() != null && 
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.PENDING.getCode()))
                    .count();
            long inProgressMaintenanceCount = allMaintenanceRecords.stream()
                    .filter(record -> record.getProcessStatus() != null && 
                            record.getProcessStatus().equals(EntityType.MaintenanceStatus.IN_PROGRESS.getCode()))
                    .count();
            double maintenanceHealthRate = allMaintenanceRecords.size() > 0
                    ? (double) (allMaintenanceRecords.size() - pendingMaintenanceCount - inProgressMaintenanceCount)
                            / allMaintenanceRecords.size() * 100
                    : 100.0;
            healthStatus.put("maintenanceHealthRate", Math.round(maintenanceHealthRate * 100.0) / 100.0);

            List<StockOrder> allStockOrders = stockOrderService.getAllStockOrders();
            long pendingStockOrders = allStockOrders.stream()
                    .filter(order -> order.getStatus().equals(EntityType.StockOrderStatus.PENDING.getCode())).count();
            double stockOrderHealthRate = allStockOrders.size() > 0
                    ? (double) (allStockOrders.size() - pendingStockOrders) / allStockOrders.size() * 100
                    : 100.0;
            healthStatus.put("stockOrderHealthRate", Math.round(stockOrderHealthRate * 100.0) / 100.0);

            double overallHealthRate = (deviceHealthRate + maintenanceHealthRate + stockOrderHealthRate) / 3.0;
            healthStatus.put("overallHealthRate", Math.round(overallHealthRate * 100.0) / 100.0);

            String healthLevel;
            if (overallHealthRate >= 90) {
                healthLevel = "优秀";
            } else if (overallHealthRate >= 80) {
                healthLevel = "良好";
            } else if (overallHealthRate >= 60) {
                healthLevel = "一般";
            } else {
                healthLevel = "较差";
            }
            healthStatus.put("healthLevel", healthLevel);

            healthStatus.put("lastUpdateTime", LocalDateTime.now());

            logger.info("系统健康状态获取成功");
            return healthStatus;
        } catch (Exception e) {
            logger.error("获取系统健康状态失败: {}", e.getMessage(), e);
            throw new BusinessException("获取系统健康状态失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'stockStatistics'")
    public Map<String, Object> getStockStatistics() {
        logger.info("获取库存统计信息");
        Map<String, Object> statistics = new HashMap<>();

        try {
            List<StockOrder> allStockOrders = stockOrderService.getAllStockOrders();
            statistics.put("totalStockOrders", allStockOrders.size());

            long inboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.INBOUND.getCode()))
                    .count();
            long outboundCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.OUTBOUND.getCode()))
                    .count();
            long transferCount = allStockOrders.stream()
                    .filter(order -> order.getOrderType().equals(EntityType.StockOrderType.TRANSFER.getCode()))
                    .count();

            statistics.put("inboundCount", inboundCount);
            statistics.put("outboundCount", outboundCount);
            statistics.put("transferCount", transferCount);

            long pendingCount = allStockOrders.stream()
                    .filter(order -> order.getStatus().equals(EntityType.StockOrderStatus.PENDING.getCode()))
                    .count();
            long processingCount = allStockOrders.stream()
                    .filter(order -> order.getStatus().equals(EntityType.StockOrderStatus.PROCESSING.getCode()))
                    .count();
            long completedCount = allStockOrders.stream()
                    .filter(order -> order.getStatus().equals(EntityType.StockOrderStatus.COMPLETED.getCode()))
                    .count();

            statistics.put("pendingCount", pendingCount);
            statistics.put("processingCount", processingCount);
            statistics.put("completedCount", completedCount);

            logger.info("库存统计信息获取成功");
            return statistics;
        } catch (Exception e) {
            logger.error("获取库存统计信息失败: {}", e.getMessage(), e);
            throw new BusinessException("获取库存统计信息失败: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "dashboard", key = "'statistics'")
    public Map<String, Object> getStatistics() {
        logger.info("获取综合统计信息");
        Map<String, Object> statistics = new HashMap<>();

        try {
            Map<String, Object> deviceStats = getDeviceStatistics();
            statistics.putAll(deviceStats);

            Map<String, Object> stockStats = getStockStatistics();
            statistics.putAll(stockStats);

            Map<String, Object> maintenanceStats = getMaintenanceStatistics();
            statistics.putAll(maintenanceStats);

            statistics.put("lastUpdateTime", LocalDateTime.now());

            logger.info("综合统计信息获取成功");
            return statistics;
        } catch (Exception e) {
            logger.error("获取综合统计信息失败: {}", e.getMessage(), e);
            throw new BusinessException("获取综合统计信息失败: " + e.getMessage());
        }
    }
}