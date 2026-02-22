package com.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.service.cache.CacheWarmupService;
import com.backend.service.optimization.PerformanceOptimizationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 系统优化控制器
 *
 * 功能说明：
 * 提供系统优化相关的管理接口
 * 主要功能：
 * 1. 手动触发缓存预热
 * 2. 手动触发性能分析
 * 3. 查看优化建议报告
 * 4. 系统健康检查
 *
 * 访问权限：仅限ADMIN角色
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Slf4j
@RestController
@RequestMapping("/system/optimization")
@RequiredArgsConstructor
@Tag(name = "系统优化", description = "系统性能优化和缓存管理接口")
@SecurityRequirement(name = "bearerAuth")
public class OptimizationController {

    private final CacheWarmupService cacheWarmupService;
    private final PerformanceOptimizationService optimizationService;

    /**
     * 手动触发缓存预热
     *
     * @return 预热结果
     */
    @PostMapping("/cache/warmup")
    @Operation(summary = "手动缓存预热", description = "手动触发所有基础数据缓存的预热")
    public ApiResponse<Map<String, Object>> warmupCache() {
        log.info("手动触发缓存预热");

        CacheWarmupService.WarmupResult result = cacheWarmupService.warmupAllCaches();

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("totalTime", result.getTotalTime() + "ms");
        response.put("results", result.getResults());

        if (!result.isSuccess()) {
            response.put("error", result.getErrorMessage());
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(500, "缓存预热失败");
            errorResponse.setData(response);
            return errorResponse;
        }

        return ApiResponse.success("缓存预热完成", response);
    }

    /**
     * 手动触发性能分析
     *
     * @return 优化报告
     */
    @PostMapping("/analyze")
    @Operation(summary = "手动性能分析", description = "手动触发系统性能分析并生成优化建议")
    public ApiResponse<PerformanceOptimizationService.OptimizationReport> analyzePerformance() {
        log.info("手动触发性能分析");

        PerformanceOptimizationService.OptimizationReport report = optimizationService.manualAnalyze();

        return ApiResponse.success("性能分析完成", report);
    }

    /**
     * 获取优化建议报告
     *
     * @return 优化建议
     */
    @GetMapping("/report")
    @Operation(summary = "获取优化报告", description = "获取最新的性能优化建议报告")
    public ApiResponse<PerformanceOptimizationService.OptimizationReport> getOptimizationReport() {
        PerformanceOptimizationService.OptimizationReport report = optimizationService.manualAnalyze();
        return ApiResponse.success(report);
    }

    /**
     * 系统健康检查
     *
     * @return 健康状态
     */
    @GetMapping("/health")
    @Operation(summary = "系统健康检查", description = "检查系统整体健康状态和性能指标")
    public ApiResponse<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();

        // 获取优化报告
        PerformanceOptimizationService.OptimizationReport report = optimizationService.manualAnalyze();

        health.put("status", report.getSlowApis().isEmpty() && report.getErrorApis().isEmpty() ? "HEALTHY" : "WARNING");
        health.put("slowApiCount", report.getSlowApis().size());
        health.put("errorApiCount", report.getErrorApis().size());
        health.put("highFrequencyApiCount", report.getHighFrequencyApis().size());
        health.put("overallSuggestions", report.getOverallSuggestions());

        return ApiResponse.success(health);
    }
}
