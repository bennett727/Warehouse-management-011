/*
 * @file: ReportsController.java
 * @description: 报表控制器，提供设备、库存、维护等报表数据API接口
 * @author: 开发团队
 * @createTime: 2026-02-10
 * @version: 1.0.0
 */
package com.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.service.dashboard.DashboardService;
import com.backend.service.device.DeviceQueryService;

/**
 * 报表控制器
 * 提供各类报表数据的REST API接口
 */
@RestController
@RequestMapping("/reports")
public class ReportsController {

    private static final Logger logger = LoggerFactory.getLogger(ReportsController.class);

    private final DashboardService dashboardService;
    private final DeviceQueryService deviceQueryService;

    public ReportsController(DashboardService dashboardService, DeviceQueryService deviceQueryService) {
        this.dashboardService = dashboardService;
        this.deviceQueryService = deviceQueryService;
    }

    /**
     * 获取设备报表
     * 
     * @return 设备报表数据
     */
    @GetMapping("/device")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceReport() {
        logger.info("获取设备报表");
        try {
            Map<String, Object> deviceStats = dashboardService.getDeviceStatistics();
            return ResponseEntity.ok(ApiResponse.success(deviceStats));
        } catch (Exception e) {
            logger.error("获取设备报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备报表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取库存报表
     * 
     * @return 库存报表数据
     */
    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryReport() {
        logger.info("获取库存报表");
        try {
            Map<String, Object> result = new HashMap<>();

            // 获取设备统计数据
            Map<String, Object> deviceStats = dashboardService.getDeviceStatistics();

            // 获取库存统计数据
            Map<String, Object> inventoryStats = dashboardService.getInventoryStatistics();

            // 获取区域分布数据
            Map<String, Object> areaDistribution = dashboardService.getAreaDistribution();

            // 组装设备状态分布数据
            List<Map<String, Object>> deviceStatusDistribution = new ArrayList<>();
            Map<String, Long> statusStats = deviceQueryService.getDeviceStatusStats();
            statusStats.forEach((status, count) -> {
                Map<String, Object> item = new HashMap<>();
                item.put("status", status);
                item.put("name", getStatusText(status));
                item.put("count", count);
                item.put("value", count);
                deviceStatusDistribution.add(item);
            });
            result.put("deviceStatusDistribution", deviceStatusDistribution);

            // 组装趋势数据（近6个月）
            List<Map<String, Object>> trendData = deviceQueryService.getPurchaseTrendStatistics(6);
            result.put("trendData", trendData);

            // 组装业务统计数据
            List<Map<String, Object>> businessStatistics = new ArrayList<>();
            Map<String, Object> maintenanceStats = dashboardService.getMaintenanceStatistics();

            Map<String, Object> installStat = new HashMap<>();
            installStat.put("type", "INSTALL");
            installStat.put("name", "安装记录");
            installStat.put("count", inventoryStats.getOrDefault("inboundOrderCount", 0));
            businessStatistics.add(installStat);

            Map<String, Object> repairStat = new HashMap<>();
            repairStat.put("type", "REPAIR");
            repairStat.put("name", "维修记录");
            repairStat.put("count", maintenanceStats.getOrDefault("totalMaintenanceCount", 0));
            businessStatistics.add(repairStat);

            Map<String, Object> maintenanceStat = new HashMap<>();
            maintenanceStat.put("type", "MAINTENANCE");
            maintenanceStat.put("name", "保养记录");
            maintenanceStat.put("count", maintenanceStats.getOrDefault("completedCount", 0));
            businessStatistics.add(maintenanceStat);

            result.put("businessStatistics", businessStatistics);

            // 组装区域分布数据
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> areaStats = (List<Map<String, Object>>) areaDistribution.get("areaDeviceStats");
            if (areaStats != null) {
                List<Map<String, Object>> areaDistributionList = new ArrayList<>();
                for (Map<String, Object> areaStat : areaStats) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("areaName", areaStat.get("areaName"));
                    item.put("name", areaStat.get("areaName"));
                    item.put("deviceCount", areaStat.get("totalDevices"));
                    item.put("count", areaStat.get("totalDevices"));
                    item.put("value", areaStat.get("totalDevices"));
                    areaDistributionList.add(item);
                }
                result.put("areaDistribution", areaDistributionList);
            }

            // 添加汇总数据
            result.put("totalDevices", deviceStats.getOrDefault("total", 0));
            result.put("inStockDevices", deviceStats.getOrDefault("idle", 0));
            result.put("inUseDevices", deviceStats.getOrDefault("inUse", 0));
            result.put("maintenanceDevices", deviceStats.getOrDefault("maintenance", 0));
            result.put("scrappedDevices", deviceStats.getOrDefault("scrap", 0));

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            logger.error("获取库存报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取库存报表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取维护报表
     * 
     * @return 维护报表数据
     */
    @GetMapping("/maintenance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMaintenanceReport() {
        logger.info("获取维护报表");
        try {
            Map<String, Object> maintenanceStats = dashboardService.getMaintenanceStatistics();
            return ResponseEntity.ok(ApiResponse.success(maintenanceStats));
        } catch (Exception e) {
            logger.error("获取维护报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取维护报表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取出库报表
     * 
     * @return 出库报表数据
     */
    @GetMapping("/outbound")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOutboundReport() {
        logger.info("获取出库报表");
        try {
            Map<String, Object> stockStats = dashboardService.getStockStatistics();
            Map<String, Object> result = new HashMap<>();
            result.put("outboundCount", stockStats.getOrDefault("outboundCount", 0));
            result.put("pendingOutboundCount", stockStats.getOrDefault("pendingCount", 0));
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            logger.error("获取出库报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取出库报表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取入库报表
     * 
     * @return 入库报表数据
     */
    @GetMapping("/inbound")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInboundReport() {
        logger.info("获取入库报表");
        try {
            Map<String, Object> stockStats = dashboardService.getStockStatistics();
            Map<String, Object> result = new HashMap<>();
            result.put("inboundCount", stockStats.getOrDefault("inboundCount", 0));
            result.put("pendingInboundCount", stockStats.getOrDefault("pendingCount", 0));
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            logger.error("获取入库报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取入库报表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取设备统计
     * 
     * @return 设备统计数据
     */
    @GetMapping("/device/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceStatistics() {
        logger.info("获取设备统计");
        try {
            Map<String, Object> deviceStats = dashboardService.getDeviceStatistics();
            return ResponseEntity.ok(ApiResponse.success(deviceStats));
        } catch (Exception e) {
            logger.error("获取设备统计失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取库存统计
     * 
     * @return 库存统计数据
     */
    @GetMapping("/inventory/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryStatistics() {
        logger.info("获取库存统计");
        try {
            Map<String, Object> inventoryStats = dashboardService.getInventoryStatistics();
            return ResponseEntity.ok(ApiResponse.success(inventoryStats));
        } catch (Exception e) {
            logger.error("获取库存统计失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取库存统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取维护统计
     * 
     * @return 维护统计数据
     */
    @GetMapping("/maintenance/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMaintenanceStatistics() {
        logger.info("获取维护统计");
        try {
            Map<String, Object> maintenanceStats = dashboardService.getMaintenanceStatistics();
            return ResponseEntity.ok(ApiResponse.success(maintenanceStats));
        } catch (Exception e) {
            logger.error("获取维护统计失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取维护统计失败: " + e.getMessage()));
        }
    }

    /**
     * 导出设备报表
     * 
     * @return 导出数据
     */
    @GetMapping("/export/device")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportDeviceReport() {
        logger.info("导出设备报表");
        try {
            // 实际项目中应该生成Excel或CSV文件
            Map<String, Object> deviceStats = dashboardService.getDeviceStatistics();
            return ResponseEntity.ok(ApiResponse.success("设备报表导出成功", deviceStats));
        } catch (Exception e) {
            logger.error("导出设备报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("导出设备报表失败: " + e.getMessage()));
        }
    }

    /**
     * 导出库存报表
     * 
     * @return 导出数据
     */
    @GetMapping("/export/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportInventoryReport() {
        logger.info("导出库存报表");
        try {
            // 实际项目中应该生成Excel或CSV文件
            Map<String, Object> inventoryStats = dashboardService.getInventoryStatistics();
            return ResponseEntity.ok(ApiResponse.success("库存报表导出成功", inventoryStats));
        } catch (Exception e) {
            logger.error("导出库存报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("导出库存报表失败: " + e.getMessage()));
        }
    }

    /**
     * 导出维护报表
     * 
     * @return 导出数据
     */
    @GetMapping("/export/maintenance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportMaintenanceReport() {
        logger.info("导出维护报表");
        try {
            // 实际项目中应该生成Excel或CSV文件
            Map<String, Object> maintenanceStats = dashboardService.getMaintenanceStatistics();
            return ResponseEntity.ok(ApiResponse.success("维护报表导出成功", maintenanceStats));
        } catch (Exception e) {
            logger.error("导出维护报表失败", e);
            return ResponseEntity.ok(ApiResponse.error("导出维护报表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取状态文本
     * 
     * @param status 状态码
     * @return 状态文本
     */
    private String getStatusText(String status) {
        Map<String, String> statusMap = new HashMap<>();
        statusMap.put("IN_STOCK", "在库");
        statusMap.put("INSTALLED", "已安装");
        statusMap.put("MAINTENANCE", "维修中");
        statusMap.put("SCRAPPED", "已报废");
        statusMap.put("IN_TRANSIT", "调拨中");
        statusMap.put("NORMAL", "正常");
        statusMap.put("FAULT", "故障");
        statusMap.put("MAINTENANCE", "维护中");
        return statusMap.getOrDefault(status, status);
    }
}
