package com.backend.service;

import com.backend.config.AlertConfig;
import com.backend.service.alert.AlertService;
import com.backend.service.alert.AlertService.AlertLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.ThreadMXBean;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 性能监控服务
 *
 * 功能说明：
 * 收集和记录系统性能指标，支持告警和日志输出
 *
 * 监控指标：
 * - JVM内存使用情况
 * - CPU使用率
 * - 线程状态
 * - 方法执行时间
 * - 数据库连接池状态
 * - HTTP请求统计
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceMonitorService {

    private final AlertService alertService;

    private final Map<String, MethodStats> methodStatsMap = new ConcurrentHashMap<>();
    private final Map<String, RequestStats> requestStatsMap = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> counterMap = new ConcurrentHashMap<>();

    private static final double MEMORY_WARNING_THRESHOLD = 0.8;
    private static final double MEMORY_CRITICAL_THRESHOLD = 0.9;
    private static final double CPU_WARNING_THRESHOLD = 0.8;
    private static final long SLOW_METHOD_THRESHOLD_MS = 1000;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void recordMethodExecution(String methodName, long executionTimeMs, boolean success) {
        MethodStats stats = methodStatsMap.computeIfAbsent(methodName, k -> new MethodStats());
        stats.record(executionTimeMs, success);

        if (executionTimeMs > SLOW_METHOD_THRESHOLD_MS) {
            log.warn("慢方法检测 [{}] 执行时间: {}ms", methodName, executionTimeMs);
        }
    }

    public void recordRequest(String endpoint, long responseTimeMs, int statusCode) {
        RequestStats stats = requestStatsMap.computeIfAbsent(endpoint, k -> new RequestStats());
        stats.record(responseTimeMs, statusCode);
    }

    public void incrementCounter(String counterName) {
        counterMap.computeIfAbsent(counterName, k -> new AtomicLong(0)).incrementAndGet();
    }

    public void decrementCounter(String counterName) {
        counterMap.computeIfAbsent(counterName, k -> new AtomicLong(0)).decrementAndGet();
    }

    public long getCounter(String counterName) {
        AtomicLong counter = counterMap.get(counterName);
        return counter != null ? counter.get() : 0;
    }

    @Async
    public void logPerformanceSnapshot() {
        PerformanceSnapshot snapshot = captureSnapshot();

        log.info("=== 性能监控快照 [{}] ===", LocalDateTime.now().format(formatter));
        log.info("内存使用: {}/{} MB ({})",
                snapshot.getUsedMemoryMB(),
                snapshot.getMaxMemoryMB(),
                formatPercent(snapshot.getMemoryUsagePercent()));
        log.info("CPU使用率: {}", formatPercent(snapshot.getCpuUsage()));
        log.info("活跃线程: {}", snapshot.getActiveThreads());
        log.info("总请求数: {}", snapshot.getTotalRequests());
        log.info("平均响应时间: {}ms", snapshot.getAvgResponseTimeMs());
        log.info("错误率: {}", formatPercent(snapshot.getErrorRate()));
    }

    @Scheduled(fixedRate = 60000)
    public void monitorSystemHealth() {
        PerformanceSnapshot snapshot = captureSnapshot();

        checkMemoryUsage(snapshot);
        checkCpuUsage(snapshot);
        checkErrorRate(snapshot);
    }

    @Scheduled(fixedRate = 300000)
    public void generatePerformanceReport() {
        logPerformanceSnapshot();

        logMethodStats();
        logRequestStats();
    }

    private void checkMemoryUsage(PerformanceSnapshot snapshot) {
        double memoryUsage = snapshot.getMemoryUsagePercent();

        if (memoryUsage >= MEMORY_CRITICAL_THRESHOLD) {
            log.error("内存使用率过高: {}", formatPercent(memoryUsage));
            alertService.sendAlert(
                    AlertLevel.CRITICAL,
                    "内存使用率严重告警",
                    "内存使用率: " + formatPercent(memoryUsage),
                    Map.of(
                            "usedMemoryMB", snapshot.getUsedMemoryMB(),
                            "maxMemoryMB", snapshot.getMaxMemoryMB(),
                            "memoryUsagePercent", memoryUsage
                    )
            );
        } else if (memoryUsage >= MEMORY_WARNING_THRESHOLD) {
            log.warn("内存使用率警告: {}", formatPercent(memoryUsage));
            alertService.sendAlert(
                    AlertLevel.WARNING,
                    "内存使用率警告",
                    "内存使用率: " + formatPercent(memoryUsage),
                    Map.of("memoryUsagePercent", memoryUsage)
            );
        }
    }

    private void checkCpuUsage(PerformanceSnapshot snapshot) {
        double cpuUsage = snapshot.getCpuUsage();

        if (cpuUsage >= CPU_WARNING_THRESHOLD) {
            log.warn("CPU使用率过高: {}", formatPercent(cpuUsage));
            alertService.sendAlert(
                    AlertLevel.WARNING,
                    "CPU使用率过高",
                    "CPU使用率: " + formatPercent(cpuUsage),
                    Map.of("cpuUsage", cpuUsage)
            );
        }
    }

    private void checkErrorRate(PerformanceSnapshot snapshot) {
        double errorRate = snapshot.getErrorRate();

        if (errorRate > 0.1) {
            log.warn("错误率过高: {}", formatPercent(errorRate));
            alertService.sendAlert(
                    AlertLevel.WARNING,
                    "错误率过高",
                    "错误率: " + formatPercent(errorRate),
                    Map.of("errorRate", errorRate)
            );
        }
    }

    private void logMethodStats() {
        if (methodStatsMap.isEmpty()) {
            return;
        }

        log.info("=== 方法执行统计 ===");
        methodStatsMap.forEach((method, stats) -> {
            if (stats.getTotalCalls() > 0) {
                log.info("方法 [{}]: 调用{}次, 平均{}ms, 最大{}ms, 成功率{}",
                        method,
                        stats.getTotalCalls(),
                        stats.getAvgExecutionTime(),
                        stats.getMaxExecutionTime(),
                        formatPercent(stats.getSuccessRate()));
            }
        });
    }

    private void logRequestStats() {
        if (requestStatsMap.isEmpty()) {
            return;
        }

        log.info("=== 请求统计 ===");
        requestStatsMap.forEach((endpoint, stats) -> {
            if (stats.getTotalRequests() > 0) {
                log.info("端点 [{}]: 请求{}次, 平均{}ms, 最大{}ms, 错误率{}",
                        endpoint,
                        stats.getTotalRequests(),
                        stats.getAvgResponseTime(),
                        stats.getMaxResponseTime(),
                        formatPercent(stats.getErrorRate()));
            }
        });
    }

    public PerformanceSnapshot captureSnapshot() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();

        Runtime runtime = Runtime.getRuntime();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        long maxMemory = runtime.maxMemory();

        double cpuUsage = getCpuUsage(osBean);

        long totalRequests = requestStatsMap.values().stream()
                .mapToLong(RequestStats::getTotalRequests)
                .sum();

        double avgResponseTime = requestStatsMap.values().stream()
                .filter(s -> s.getTotalRequests() > 0)
                .mapToDouble(RequestStats::getAvgResponseTime)
                .average()
                .orElse(0);

        double errorRate = calculateOverallErrorRate();

        return PerformanceSnapshot.builder()
                .timestamp(LocalDateTime.now())
                .usedMemoryBytes(usedMemory)
                .maxMemoryBytes(maxMemory)
                .memoryUsagePercent((double) usedMemory / maxMemory)
                .cpuUsage(cpuUsage)
                .activeThreads(threadBean.getThreadCount())
                .totalRequests(totalRequests)
                .avgResponseTimeMs(avgResponseTime)
                .errorRate(errorRate)
                .build();
    }

    private double getCpuUsage(OperatingSystemMXBean osBean) {
        try {
            if (osBean instanceof com.sun.management.OperatingSystemMXBean sunOsBean) {
                return sunOsBean.getProcessCpuLoad();
            }
        } catch (Exception e) {
            log.debug("无法获取CPU使用率: {}", e.getMessage());
        }
        return osBean.getSystemLoadAverage();
    }

    private double calculateOverallErrorRate() {
        long totalRequests = requestStatsMap.values().stream()
                .mapToLong(RequestStats::getTotalRequests)
                .sum();

        if (totalRequests == 0) {
            return 0;
        }

        long errorRequests = requestStatsMap.values().stream()
                .mapToLong(RequestStats::getErrorCount)
                .sum();

        return (double) errorRequests / totalRequests;
    }

    private String formatPercent(double value) {
        return String.format("%.2f%%", value * 100);
    }

    public Map<String, MethodStats> getMethodStats() {
        return new ConcurrentHashMap<>(methodStatsMap);
    }

    public Map<String, RequestStats> getRequestStats() {
        return new ConcurrentHashMap<>(requestStatsMap);
    }

    public void resetStats() {
        methodStatsMap.clear();
        requestStatsMap.clear();
        counterMap.clear();
        log.info("性能统计已重置");
    }

    @Data
    @lombok.Builder
    public static class PerformanceSnapshot {
        private LocalDateTime timestamp;
        private long usedMemoryBytes;
        private long maxMemoryBytes;
        private double memoryUsagePercent;
        private double cpuUsage;
        private int activeThreads;
        private long totalRequests;
        private double avgResponseTimeMs;
        private double errorRate;

        public long getUsedMemoryMB() {
            return usedMemoryBytes / (1024 * 1024);
        }

        public long getMaxMemoryMB() {
            return maxMemoryBytes / (1024 * 1024);
        }
    }

    @Data
    public static class MethodStats {
        private final AtomicLong totalCalls = new AtomicLong(0);
        private final AtomicLong successCalls = new AtomicLong(0);
        private final AtomicLong totalExecutionTime = new AtomicLong(0);
        private final AtomicLong maxExecutionTime = new AtomicLong(0);

        public void record(long executionTimeMs, boolean success) {
            totalCalls.incrementAndGet();
            totalExecutionTime.addAndGet(executionTimeMs);

            if (success) {
                successCalls.incrementAndGet();
            }

            long currentMax = maxExecutionTime.get();
            if (executionTimeMs > currentMax) {
                maxExecutionTime.compareAndSet(currentMax, executionTimeMs);
            }
        }

        public long getTotalCalls() {
            return totalCalls.get();
        }

        public long getAvgExecutionTime() {
            long calls = totalCalls.get();
            return calls > 0 ? totalExecutionTime.get() / calls : 0;
        }

        public long getMaxExecutionTime() {
            return maxExecutionTime.get();
        }

        public double getSuccessRate() {
            long calls = totalCalls.get();
            return calls > 0 ? (double) successCalls.get() / calls : 1.0;
        }
    }

    @Data
    public static class RequestStats {
        private final AtomicLong totalRequests = new AtomicLong(0);
        private final AtomicLong errorRequests = new AtomicLong(0);
        private final AtomicLong totalResponseTime = new AtomicLong(0);
        private final AtomicLong maxResponseTime = new AtomicLong(0);

        public void record(long responseTimeMs, int statusCode) {
            totalRequests.incrementAndGet();
            totalResponseTime.addAndGet(responseTimeMs);

            if (statusCode >= 400) {
                errorRequests.incrementAndGet();
            }

            long currentMax = maxResponseTime.get();
            if (responseTimeMs > currentMax) {
                maxResponseTime.compareAndSet(currentMax, responseTimeMs);
            }
        }

        public long getTotalRequests() {
            return totalRequests.get();
        }

        public long getErrorCount() {
            return errorRequests.get();
        }

        public long getAvgResponseTime() {
            long requests = totalRequests.get();
            return requests > 0 ? totalResponseTime.get() / requests : 0;
        }

        public long getMaxResponseTime() {
            return maxResponseTime.get();
        }

        public double getErrorRate() {
            long requests = totalRequests.get();
            return requests > 0 ? (double) errorRequests.get() / requests : 0;
        }
    }
}
