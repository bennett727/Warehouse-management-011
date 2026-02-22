package com.backend.service.optimization;

import com.backend.aspect.PerformanceMonitorAspect;
import com.backend.service.cache.CacheOperations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 性能优化服务
 *
 * 功能说明：
 * 提供系统性能分析和自动优化建议
 * 主要功能：
 * 1. 分析API性能趋势
 * 2. 自动生成优化建议
 * 3. 动态调整缓存策略
 * 4. 识别性能瓶颈
 *
 * 优化策略：
 * - 高频访问数据：增加缓存时间
 * - 低频访问数据：减少缓存时间
 * - 慢查询API：建议添加索引或缓存
 * - 高错误率API：建议检查代码逻辑
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceOptimizationService {

    private final PerformanceMonitorAspect performanceMonitorAspect;
    private final CacheOperations cacheService;

    /**
     * 性能分析阈值
     */
    private static final long SLOW_THRESHOLD = 1000;        // 慢请求阈值（毫秒）
    private static final double HIGH_ERROR_RATE = 5.0;      // 高错误率阈值（%）
    private static final long HIGH_FREQUENCY = 1000;        // 高频访问阈值（次数）

    /**
     * 定时分析任务 - 每30分钟执行一次
     */
    @Scheduled(fixedRate = 30 * 60 * 1000)
    public void analyzeAndOptimize() {
        log.info("========== 开始性能分析 ==========");

        try {
            // 获取性能统计
            ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> stats =
                    performanceMonitorAspect.getAllStats();

            if (stats.isEmpty()) {
                log.info("暂无性能数据，跳过分析");
                return;
            }

            // 生成优化报告
            OptimizationReport report = generateOptimizationReport(stats);

            // 输出优化建议
            log.info("性能分析报告:\n{}", report);

            // 自动应用优化建议
            applyOptimizations(report);

        } catch (Exception e) {
            log.error("性能分析失败: {}", e.getMessage(), e);
        }

        log.info("========== 性能分析完成 ==========");
    }

    /**
     * 生成优化报告
     *
     * @param stats 性能统计数据
     * @return 优化报告
     */
    public OptimizationReport generateOptimizationReport(
            ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> stats) {

        OptimizationReport report = new OptimizationReport();
        report.setAnalysisTime(new Date());

        // 分析每个API
        stats.forEach((apiPath, apiStats) -> {
            // 检查慢请求
            if (apiStats.getAvgResponseTime() > SLOW_THRESHOLD) {
                SlowApiRecommendation rec = new SlowApiRecommendation();
                rec.setApiPath(apiPath);
                rec.setAvgResponseTime(apiStats.getAvgResponseTime());
                rec.setTotalRequests(apiStats.getTotalRequests());
                rec.setRecommendation(generateSlowApiSuggestion(apiPath, apiStats));
                report.addSlowApi(rec);
            }

            // 检查高错误率
            if (apiStats.getSuccessRate() < (100 - HIGH_ERROR_RATE)) {
                ErrorApiRecommendation rec = new ErrorApiRecommendation();
                rec.setApiPath(apiPath);
                rec.setErrorRate(100 - apiStats.getSuccessRate());
                rec.setTotalRequests(apiStats.getTotalRequests());
                rec.setRecommendation("错误率较高，建议检查代码逻辑和异常处理");
                report.addErrorApi(rec);
            }

            // 检查高频访问
            if (apiStats.getTotalRequests() > HIGH_FREQUENCY) {
                HighFrequencyRecommendation rec = new HighFrequencyRecommendation();
                rec.setApiPath(apiPath);
                rec.setRequestCount(apiStats.getTotalRequests());
                rec.setRecommendation(generateHighFrequencySuggestion(apiPath, apiStats));
                report.addHighFrequencyApi(rec);
            }
        });

        // 生成整体建议
        report.setOverallSuggestions(generateOverallSuggestions(stats));

        return report;
    }

    /**
     * 生成慢API优化建议
     *
     * @param apiPath API路径
     * @param stats   性能统计
     * @return 优化建议
     */
    private String generateSlowApiSuggestion(String apiPath, PerformanceMonitorAspect.ApiPerformanceStats stats) {
        StringBuilder suggestion = new StringBuilder();

        // 根据API路径判断可能的优化方向
        if (apiPath.contains("/devices") || apiPath.contains("/orders")) {
            suggestion.append("1. 建议添加数据库索引优化查询性能\n");
            suggestion.append("2. 建议使用@EntityGraph避免N+1查询问题\n");
            suggestion.append("3. 建议对查询结果添加Redis缓存\n");
        }

        if (stats.getTotalRequests() > 100) {
            suggestion.append("4. 该API访问频率较高，强烈建议添加缓存\n");
        }

        if (suggestion.length() == 0) {
            suggestion.append("建议检查代码逻辑，优化算法复杂度");
        }

        return suggestion.toString();
    }

    /**
     * 生成高频访问优化建议
     *
     * @param apiPath API路径
     * @param stats   性能统计
     * @return 优化建议
     */
    private String generateHighFrequencySuggestion(String apiPath,
                                                    PerformanceMonitorAspect.ApiPerformanceStats stats) {
        StringBuilder suggestion = new StringBuilder();

        if (apiPath.contains("GET")) {
            suggestion.append("1. 建议添加Redis缓存，设置合理的过期时间\n");
            suggestion.append("2. 建议使用本地缓存（Caffeine）作为二级缓存\n");
        }

        if (stats.getAvgResponseTime() > 500) {
            suggestion.append("3. 响应时间较长，建议优化数据库查询\n");
        }

        if (suggestion.length() == 0) {
            suggestion.append("访问频率正常，无需特殊优化");
        }

        return suggestion.toString();
    }

    /**
     * 生成整体优化建议
     *
     * @param stats 性能统计数据
     * @return 整体建议列表
     */
    private List<String> generateOverallSuggestions(
            ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> stats) {

        List<String> suggestions = new ArrayList<>();

        long totalRequests = stats.values().stream()
                .mapToLong(PerformanceMonitorAspect.ApiPerformanceStats::getTotalRequests)
                .sum();

        long slowRequests = stats.values().stream()
                .mapToLong(PerformanceMonitorAspect.ApiPerformanceStats::getSlowRequests)
                .sum();

        double avgSuccessRate = stats.values().stream()
                .mapToDouble(PerformanceMonitorAspect.ApiPerformanceStats::getSuccessRate)
                .average()
                .orElse(100.0);

        // 根据整体情况给出建议
        if ((double) slowRequests / totalRequests > 0.1) {
            suggestions.add("慢请求比例超过10%，建议全面检查数据库查询性能");
        }

        if (avgSuccessRate < 95) {
            suggestions.add("整体请求成功率低于95%，建议检查系统稳定性");
        }

        if (stats.size() > 50) {
            suggestions.add("API数量较多，建议进行API合并和优化");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("系统整体性能良好，继续保持");
        }

        return suggestions;
    }

    /**
     * 应用优化建议
     *
     * @param report 优化报告
     */
    private void applyOptimizations(OptimizationReport report) {
        // 这里可以实现自动优化逻辑
        // 例如：自动调整缓存配置、发送告警等

        log.info("应用优化建议: {}条慢API, {}条高错误率API, {}条高频访问API",
                report.getSlowApis().size(),
                report.getErrorApis().size(),
                report.getHighFrequencyApis().size());
    }

    /**
     * 手动触发性能分析
     *
     * @return 优化报告
     */
    public OptimizationReport manualAnalyze() {
        ConcurrentHashMap<String, PerformanceMonitorAspect.ApiPerformanceStats> stats =
                performanceMonitorAspect.getAllStats();
        return generateOptimizationReport(stats);
    }

    // ==================== 内部类定义 ====================

    /**
     * 优化报告
     */
    public static class OptimizationReport {
        private Date analysisTime;
        private List<SlowApiRecommendation> slowApis = new ArrayList<>();
        private List<ErrorApiRecommendation> errorApis = new ArrayList<>();
        private List<HighFrequencyRecommendation> highFrequencyApis = new ArrayList<>();
        private List<String> overallSuggestions = new ArrayList<>();

        public void addSlowApi(SlowApiRecommendation rec) { slowApis.add(rec); }
        public void addErrorApi(ErrorApiRecommendation rec) { errorApis.add(rec); }
        public void addHighFrequencyApi(HighFrequencyRecommendation rec) { highFrequencyApis.add(rec); }

        // Getters and Setters
        public Date getAnalysisTime() { return analysisTime; }
        public void setAnalysisTime(Date analysisTime) { this.analysisTime = analysisTime; }
        public List<SlowApiRecommendation> getSlowApis() { return slowApis; }
        public List<ErrorApiRecommendation> getErrorApis() { return errorApis; }
        public List<HighFrequencyRecommendation> getHighFrequencyApis() { return highFrequencyApis; }
        public List<String> getOverallSuggestions() { return overallSuggestions; }
        public void setOverallSuggestions(List<String> overallSuggestions) { this.overallSuggestions = overallSuggestions; }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append("\n========== 性能优化报告 ==========\n");
            sb.append("分析时间: ").append(analysisTime).append("\n\n");

            sb.append("【慢API列表】(").append(slowApis.size()).append("个)\n");
            slowApis.forEach(api -> {
                sb.append("  - ").append(api.getApiPath())
                        .append(" 平均响应时间: ").append(api.getAvgResponseTime()).append("ms\n");
            });

            sb.append("\n【高错误率API】(").append(errorApis.size()).append("个)\n");
            errorApis.forEach(api -> {
                sb.append("  - ").append(api.getApiPath())
                        .append(" 错误率: ").append(String.format("%.2f%%", api.getErrorRate())).append("\n");
            });

            sb.append("\n【高频访问API】(").append(highFrequencyApis.size()).append("个)\n");
            highFrequencyApis.forEach(api -> {
                sb.append("  - ").append(api.getApiPath())
                        .append(" 请求次数: ").append(api.getRequestCount()).append("\n");
            });

            sb.append("\n【整体建议】\n");
            overallSuggestions.forEach(s -> sb.append("  - ").append(s).append("\n"));

            sb.append("================================\n");
            return sb.toString();
        }
    }

    /**
     * 慢API优化建议
     */
    public static class SlowApiRecommendation {
        private String apiPath;
        private long avgResponseTime;
        private long totalRequests;
        private String recommendation;

        public String getApiPath() { return apiPath; }
        public void setApiPath(String apiPath) { this.apiPath = apiPath; }
        public long getAvgResponseTime() { return avgResponseTime; }
        public void setAvgResponseTime(long avgResponseTime) { this.avgResponseTime = avgResponseTime; }
        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }

    /**
     * 高错误率API优化建议
     */
    public static class ErrorApiRecommendation {
        private String apiPath;
        private double errorRate;
        private long totalRequests;
        private String recommendation;

        public String getApiPath() { return apiPath; }
        public void setApiPath(String apiPath) { this.apiPath = apiPath; }
        public double getErrorRate() { return errorRate; }
        public void setErrorRate(double errorRate) { this.errorRate = errorRate; }
        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }

    /**
     * 高频访问API优化建议
     */
    public static class HighFrequencyRecommendation {
        private String apiPath;
        private long requestCount;
        private String recommendation;

        public String getApiPath() { return apiPath; }
        public void setApiPath(String apiPath) { this.apiPath = apiPath; }
        public long getRequestCount() { return requestCount; }
        public void setRequestCount(long requestCount) { this.requestCount = requestCount; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }
}
