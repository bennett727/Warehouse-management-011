/*
 * @file: DashboardController.java
 * @description: 仪表盘控制器，提供系统概览、统计数据、最近活动等API接口
 * @author: 开发团队
 * @createTime: 2026-02-10
 * @version: 1.0.0
 */
package com.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.service.dashboard.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 仪表盘控制器
 * 提供仪表盘相关的REST API接口
 */
@RestController
@RequestMapping("/dashboard")
@Tag(name = "仪表盘", description = "系统概览、统计数据、待办任务等接口")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * 获取系统概览数据
     * @return 系统概览数据
     */
    @GetMapping("/overview")
    @Operation(summary = "获取系统概览数据", description = "获取设备、库存、出入库等统计数据")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemOverview() {
        logger.info("获取系统概览数据");
        try {
            Map<String, Object> overview = dashboardService.getSystemOverview();
            
            // 转换数据格式以匹配前端期望
            Map<String, Object> formattedData = new HashMap<>();
            formattedData.put("totalDevices", overview.getOrDefault("deviceCount", 0));
            formattedData.put("inStockDevices", overview.getOrDefault("deviceIdleCount", 0));
            formattedData.put("installedDevices", overview.getOrDefault("deviceInUseCount", 0));
            formattedData.put("repairingDevices", overview.getOrDefault("deviceMaintenanceCount", 0));
            formattedData.put("scrappedDevices", overview.getOrDefault("deviceScrapCount", 0));
            formattedData.put("areaCount", overview.getOrDefault("areaCount", 0));
            formattedData.put("inboundCount", overview.getOrDefault("inboundCount", 0));
            formattedData.put("outboundCount", overview.getOrDefault("outboundCount", 0));
            formattedData.put("pendingMaintenanceCount", overview.getOrDefault("pendingMaintenanceCount", 0));
            formattedData.put("inProgressMaintenanceCount", overview.getOrDefault("inProgressMaintenanceCount", 0));
            formattedData.put("lowStockAlerts", overview.getOrDefault("lowStockCount", 0));
            
            return ResponseEntity.ok(ApiResponse.success(formattedData));
        } catch (Exception e) {
            logger.error("获取系统概览数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取系统概览数据失败: " + e.getMessage()));
        }
    }

    /**
     * 获取统计数据
     * @return 统计数据
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取统计数据", description = "获取系统综合统计数据")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        logger.info("获取统计数据");
        try {
            Map<String, Object> statistics = dashboardService.getStatistics();
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            logger.error("获取统计数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取统计数据失败: " + e.getMessage()));
        }
    }

    /**
     * 获取设备统计数据
     * @return 设备统计数据
     */
    @GetMapping("/statistics/device")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceStatistics() {
        logger.info("获取设备统计数据");
        try {
            Map<String, Object> deviceStats = dashboardService.getDeviceStatistics();
            return ResponseEntity.ok(ApiResponse.success(deviceStats));
        } catch (Exception e) {
            logger.error("获取设备统计数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备统计数据失败: " + e.getMessage()));
        }
    }

    /**
     * 获取最近活动记录
     * @param limit 限制数量，默认10条
     * @return 最近活动记录
     */
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        logger.info("获取最近活动记录, limit: {}", limit);
        try {
            Map<String, Object> activities = dashboardService.getRecentActivities();
            
            // 如果返回的是列表，包装成前端期望的格式
            if (activities.containsKey("activities")) {
                return ResponseEntity.ok(ApiResponse.success(activities));
            } else {
                // 转换格式
                Map<String, Object> formattedData = new HashMap<>();
                formattedData.put("activities", activities.getOrDefault("list", activities));
                formattedData.put("total", activities.getOrDefault("total", 0));
                return ResponseEntity.ok(ApiResponse.success(formattedData));
            }
        } catch (Exception e) {
            logger.error("获取最近活动记录失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取最近活动记录失败: " + e.getMessage()));
        }
    }

    /**
     * 获取库存统计数据
     * @return 库存统计数据
     */
    @GetMapping("/statistics/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryStatistics() {
        logger.info("获取库存统计数据");
        try {
            Map<String, Object> inventoryStats = dashboardService.getInventoryStatistics();
            return ResponseEntity.ok(ApiResponse.success(inventoryStats));
        } catch (Exception e) {
            logger.error("获取库存统计数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取库存统计数据失败: " + e.getMessage()));
        }
    }

    /**
     * 获取维护统计数据
     * @return 维护统计数据
     */
    @GetMapping("/statistics/maintenance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMaintenanceStatistics() {
        logger.info("获取维护统计数据");
        try {
            Map<String, Object> maintenanceStats = dashboardService.getMaintenanceStatistics();
            return ResponseEntity.ok(ApiResponse.success(maintenanceStats));
        } catch (Exception e) {
            logger.error("获取维护统计数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取维护统计数据失败: " + e.getMessage()));
        }
    }

    /**
     * 获取区域分布数据
     * @return 区域分布数据
     */
    @GetMapping("/statistics/area")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAreaDistribution() {
        logger.info("获取区域分布数据");
        try {
            Map<String, Object> areaDistribution = dashboardService.getAreaDistribution();
            return ResponseEntity.ok(ApiResponse.success(areaDistribution));
        } catch (Exception e) {
            logger.error("获取区域分布数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取区域分布数据失败: " + e.getMessage()));
        }
    }

    /**
     * 获取待办事项
     * @return 待办事项列表
     */
    @GetMapping("/tasks")
    @Operation(summary = "获取待办事项", description = "获取待处理的入库、出库、维护等任务")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingTasks() {
        logger.info("获取待办事项");
        try {
            Map<String, Object> tasks = dashboardService.getPendingTasks();
            return ResponseEntity.ok(ApiResponse.success(tasks));
        } catch (Exception e) {
            logger.error("获取待办事项失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取待办事项失败: " + e.getMessage()));
        }
    }

    /**
     * 获取系统健康状态
     * @return 系统健康状态
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth() {
        logger.info("获取系统健康状态");
        try {
            Map<String, Object> health = dashboardService.getSystemHealth();
            return ResponseEntity.ok(ApiResponse.success(health));
        } catch (Exception e) {
            logger.error("获取系统健康状态失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取系统健康状态失败: " + e.getMessage()));
        }
    }
}
