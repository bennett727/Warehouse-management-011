package com.backend.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * API性能监控切面
 *
 * 功能说明：
 * 监控所有Controller方法的执行时间，记录API性能指标
 * 主要功能：
 * 1. 记录API请求耗时
 * 2. 统计慢请求（>1秒）
 * 3. 提供性能报告接口
 * 4. 支持动态阈值调整
 *
 * 监控指标：
 * - 请求总数
 * - 平均响应时间
 * - 最大响应时间
 * - 慢请求数量
 * - 请求成功率
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Slf4j
@Aspect
@Component
public class PerformanceMonitorAspect {

    /**
     * 慢请求阈值（毫秒）
     */
    private static final long SLOW_REQUEST_THRESHOLD = 1000;

    /**
     * 性能统计Map
     * key: API路径
     * value: 性能统计信息
     */
    private final ConcurrentHashMap<String, ApiPerformanceStats> performanceStats = new ConcurrentHashMap<>();

    /**
     * 定义切点 - 所有Controller方法
     */
    @Pointcut("execution(* com.backend.controller.*.*(..))")
    public void controllerMethods() {}

    /**
     * 环绕通知 - 监控API性能
     *
     * @param joinPoint 连接点
     * @return 方法返回值
     * @throws Throwable 异常
     */
    @Around("controllerMethods()")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取请求信息
        String apiPath = getApiPath();
        String methodName = joinPoint.getSignature().toShortString();

        // 记录开始时间
        long startTime = System.currentTimeMillis();

        try {
            // 执行目标方法
            Object result = joinPoint.proceed();

            // 计算执行时间
            long executionTime = System.currentTimeMillis() - startTime;

            // 更新性能统计
            updateStats(apiPath, executionTime, true);

            // 记录慢请求
            if (executionTime > SLOW_REQUEST_THRESHOLD) {
                log.warn("慢请求警告: api={}, method={}, time={}ms, args={}",
                        apiPath, methodName, executionTime,
                        Arrays.toString(joinPoint.getArgs()));
            } else {
                log.debug("API执行: api={}, method={}, time={}ms",
                        apiPath, methodName, executionTime);
            }

            return result;

        } catch (Throwable e) {
            // 计算执行时间（即使异常也要记录）
            long executionTime = System.currentTimeMillis() - startTime;
            updateStats(apiPath, executionTime, false);

            log.error("API执行异常: api={}, method={}, time={}ms, error={}",
                    apiPath, methodName, executionTime, e.getMessage());

            throw e;
        }
    }

    /**
     * 获取API路径
     *
     * @return API路径
     */
    private String getApiPath() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getMethod() + " " + request.getRequestURI();
            }
        } catch (Exception e) {
            log.warn("获取API路径失败: {}", e.getMessage());
        }
        return "UNKNOWN";
    }

    /**
     * 更新性能统计
     *
     * @param apiPath      API路径
     * @param responseTime 响应时间
     * @param success      是否成功
     */
    private void updateStats(String apiPath, long responseTime, boolean success) {
        ApiPerformanceStats stats = performanceStats.computeIfAbsent(apiPath, k -> new ApiPerformanceStats());
        stats.recordRequest(responseTime, success);
    }

    /**
     * 获取所有API性能统计
     *
     * @return 性能统计Map
     */
    public ConcurrentHashMap<String, ApiPerformanceStats> getAllStats() {
        return new ConcurrentHashMap<>(performanceStats);
    }

    /**
     * 获取指定API的性能统计
     *
     * @param apiPath API路径
     * @return 性能统计
     */
    public ApiPerformanceStats getStats(String apiPath) {
        return performanceStats.get(apiPath);
    }

    /**
     * 重置所有统计
     */
    public void resetStats() {
        performanceStats.clear();
        log.info("性能统计已重置");
    }

    /**
     * 获取慢请求列表（响应时间>阈值）
     *
     * @return 慢请求统计
     */
    public ConcurrentHashMap<String, ApiPerformanceStats> getSlowRequests() {
        ConcurrentHashMap<String, ApiPerformanceStats> slowRequests = new ConcurrentHashMap<>();
        performanceStats.forEach((api, stats) -> {
            if (stats.getAvgResponseTime() > SLOW_REQUEST_THRESHOLD) {
                slowRequests.put(api, stats);
            }
        });
        return slowRequests;
    }

    /**
     * API性能统计类
     */
    public static class ApiPerformanceStats {
        private final AtomicLong totalRequests = new AtomicLong(0);
        private final AtomicLong successRequests = new AtomicLong(0);
        private final AtomicLong failedRequests = new AtomicLong(0);
        private final AtomicLong totalResponseTime = new AtomicLong(0);
        private final AtomicLong maxResponseTime = new AtomicLong(0);
        private final AtomicLong slowRequests = new AtomicLong(0);

        /**
         * 记录请求
         *
         * @param responseTime 响应时间
         * @param success      是否成功
         */
        public synchronized void recordRequest(long responseTime, boolean success) {
            totalRequests.incrementAndGet();
            totalResponseTime.addAndGet(responseTime);

            if (success) {
                successRequests.incrementAndGet();
            } else {
                failedRequests.incrementAndGet();
            }

            // 更新最大响应时间
            long currentMax = maxResponseTime.get();
            if (responseTime > currentMax) {
                maxResponseTime.compareAndSet(currentMax, responseTime);
            }

            // 记录慢请求
            if (responseTime > SLOW_REQUEST_THRESHOLD) {
                slowRequests.incrementAndGet();
            }
        }

        public long getTotalRequests() {
            return totalRequests.get();
        }

        public long getSuccessRequests() {
            return successRequests.get();
        }

        public long getFailedRequests() {
            return failedRequests.get();
        }

        public long getAvgResponseTime() {
            long total = totalRequests.get();
            return total > 0 ? totalResponseTime.get() / total : 0;
        }

        public long getMaxResponseTime() {
            return maxResponseTime.get();
        }

        public long getSlowRequests() {
            return slowRequests.get();
        }

        public double getSuccessRate() {
            long total = totalRequests.get();
            return total > 0 ? (double) successRequests.get() / total * 100 : 0;
        }

        @Override
        public String toString() {
            return String.format(
                    "ApiPerformanceStats{total=%d, success=%d, failed=%d, avgTime=%dms, maxTime=%dms, slow=%d, successRate=%.2f%%}",
                    getTotalRequests(), getSuccessRequests(), getFailedRequests(),
                    getAvgResponseTime(), getMaxResponseTime(), getSlowRequests(),
                    getSuccessRate()
            );
        }
    }
}
