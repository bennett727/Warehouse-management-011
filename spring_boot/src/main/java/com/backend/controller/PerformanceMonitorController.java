package com.backend.controller;

import com.backend.aspect.PerformanceMonitorAspect;
import com.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 性能监控控制器
 *
 * 功能说明：
 * 提供API性能监控数据的查询和管理接口
 * 主要功能：
 * 1. 获取所有API性能统计
 * 2. 获取慢请求列表
 * 3. 重置性能统计
 * 4. 获取系统健康状态
 *
 * 访问权限：仅限ADMIN角色
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Slf4j
@RestController
@RequestMapping("/monitor/performance")
@RequiredArgsConstructor
@Tag(name = "性能监控", description = "API性能监控和统计接口")
@SecurityRequirement(name = "bearerAuth")
public class PerformanceMonitorController {

    private final PerformanceMonitorAspect performanceMonitorAspect;

    /**
     * 获取所有API性能统计
     *
     * @return 性能统计数据
     */
    @GetMapping("/stats")
    @Operation(summary = "获取API性能统计", description = "获取所有API的性能统计数据")
    public ApiResponse<Map<String, Object>> getAllStats() {
        ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> stats =
                performanceMonitorAspect.getAllStats();

        Map<String, Object> result = new HashMap<>();
        result.put("totalApis", stats.size());
        result.put("stats", stats.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Map.of(
                                "totalRequests", e.getValue().getTotalRequests(),
                                "successRequests", e.getValue().getSuccessRequests(),
                                "failedRequests", e.getValue().getFailedRequests(),
                                "avgResponseTime", e.getValue().getAvgResponseTime(),
                                "maxResponseTime", e.getValue().getMaxResponseTime(),
                                "slowRequests", e.getValue().getSlowRequests(),
                                "successRate", String.format("%.2f%%", e.getValue().getSuccessRate())
                        )
                )));

        return ApiResponse.success(result);
    }

    /**
     * 获取慢请求列表
     *
     * @return 慢请求统计
     */
    @GetMapping("/slow-requests")
    @Operation(summary = "获取慢请求列表", description = "获取响应时间超过阈值的API列表")
    public ApiResponse<Map<String, Object>> getSlowRequests() {
        ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> slowRequests =
                performanceMonitorAspect.getSlowRequests();

        Map<String, Object> result = new HashMap<>();
        result.put("slowApiCount", slowRequests.size());
        result.put("slowApis", slowRequests.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Map.of(
                                "avgResponseTime", e.getValue().getAvgResponseTime() + "ms",
                                "maxResponseTime", e.getValue().getMaxResponseTime() + "ms",
                                "totalRequests", e.getValue().getTotalRequests()
                        )
                )));

        return ApiResponse.success(result);
    }

    /**
     * 重置性能统计
     *
     * @return 操作结果
     */
    @PostMapping("/reset")
    @Operation(summary = "重置性能统计", description = "清空所有API性能统计数据")
    public ApiResponse<Void> resetStats() {
        performanceMonitorAspect.resetStats();
        return ApiResponse.success("性能统计已重置", null);
    }

    /**
     * 获取系统健康状态
     *
     * @return 健康状态报告
     */
    @GetMapping("/health")
    @Operation(summary = "系统健康检查", description = "获取系统整体健康状态报告")
    public ApiResponse<Map<String, Object>> getHealthStatus() {
        ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> stats =
                performanceMonitorAspect.getAllStats();

        long totalRequests = stats.values().stream()
                .mapToLong(PerformanceMonitorAspect.ApiPerformanceStats::getTotalRequests)
                .sum();

        long totalSlowRequests = stats.values().stream()
                .mapToLong(PerformanceMonitorAspect.ApiPerformanceStats::getSlowRequests)
                .sum();

        double avgSuccessRate = stats.values().stream()
                .mapToDouble(PerformanceMonitorAspect.ApiPerformanceStats::getSuccessRate)
                .average()
                .orElse(100.0);

        long slowApiCount = stats.values().stream()
                .filter(s -> s.getAvgResponseTime() > 1000)
                .count();

        Map<String, Object> health = new HashMap<>();
        health.put("status", avgSuccessRate > 95 && slowApiCount < 5 ? "HEALTHY" : "WARNING");
        health.put("totalRequests", totalRequests);
        health.put("slowRequests", totalSlowRequests);
        health.put("avgSuccessRate", String.format("%.2f%%", avgSuccessRate));
        health.put("slowApiCount", slowApiCount);
        health.put("totalApis", stats.size());

        // 健康建议
        if (avgSuccessRate < 95) {
            health.put("suggestion", "请求成功率较低，建议检查错误日志");
        } else if (slowApiCount > 5) {
            health.put("suggestion", "慢请求API较多，建议优化数据库查询或增加缓存");
        } else {
            health.put("suggestion", "系统运行正常");
        }

        return ApiResponse.success(health);
    }
}
