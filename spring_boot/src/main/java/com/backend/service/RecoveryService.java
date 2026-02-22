package com.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

/**
 * 异常恢复服务
 *
 * 功能说明：
 * 提供统一的异常恢复机制，支持自动重试、降级处理和恢复策略
 *
 * 特性：
 * - 自动重试：支持配置重试次数和间隔
 * - 降级处理：当重试失败时执行降级逻辑
 * - 恢复策略：定义不同类型异常的恢复方式
 * - 状态监控：记录恢复操作的状态和结果
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
public class RecoveryService {

    private final Map<String, RecoveryStats> recoveryStatsMap = new ConcurrentHashMap<>();

    private static final int DEFAULT_MAX_RETRIES = 3;
    private static final long DEFAULT_RETRY_DELAY_MS = 1000;
    private static final double DEFAULT_BACKOFF_MULTIPLIER = 2.0;

    public <T> T executeWithRetry(String operationName, Supplier<T> operation, RecoveryConfig config) {
        config = config != null ? config : RecoveryConfig.defaultConfig();

        int maxRetries = config.getMaxRetries();
        long retryDelay = config.getRetryDelayMs();
        double backoffMultiplier = config.getBackoffMultiplier();

        AtomicInteger attempt = new AtomicInteger(0);
        Exception lastException = null;

        while (attempt.get() < maxRetries) {
            try {
                T result = operation.get();
                recordSuccess(operationName, attempt.get());
                return result;

            } catch (Exception e) {
                lastException = e;
                int currentAttempt = attempt.incrementAndGet();

                log.warn("操作失败 [{}] 第{}次尝试: {}", operationName, currentAttempt, e.getMessage());

                if (currentAttempt < maxRetries) {
                    long delay = calculateDelay(retryDelay, backoffMultiplier, currentAttempt);
                    sleep(delay);
                }
            }
        }

        recordFailure(operationName, maxRetries);

        if (config.getFallback() != null) {
            log.info("执行降级策略 [{}]", operationName);
            try {
                @SuppressWarnings("unchecked")
                T fallbackResult = (T) config.getFallback().apply(lastException);
                return fallbackResult;
            } catch (Exception e) {
                log.error("降级策略执行失败 [{}]: {}", operationName, e.getMessage());
            }
        }

        throw new RecoveryException("操作失败，已达到最大重试次数: " + operationName, lastException);
    }

    @Async
    public void executeAsyncWithRetry(String operationName, Runnable operation, RecoveryConfig config) {
        executeWithRetry(operationName, () -> {
            operation.run();
            return null;
        }, config);
    }

    public <T> T executeWithFallback(String operationName, Supplier<T> operation, Supplier<T> fallback) {
        try {
            T result = operation.get();
            recordSuccess(operationName, 1);
            return result;

        } catch (Exception e) {
            log.warn("操作失败 [{}], 执行降级: {}", operationName, e.getMessage());
            recordFallback(operationName);

            if (fallback != null) {
                try {
                    return fallback.get();
                } catch (Exception fe) {
                    log.error("降级操作失败 [{}]: {}", operationName, fe.getMessage());
                    recordFailure(operationName, 1);
                    throw new RecoveryException("降级操作失败", fe);
                }
            }

            throw new RecoveryException("操作失败且无降级策略", e);
        }
    }

    public boolean isHealthy(String operationName) {
        RecoveryStats stats = recoveryStatsMap.get(operationName);
        if (stats == null) {
            return true;
        }

        double failureRate = stats.getFailureRate();
        return failureRate < 0.5;
    }

    public Map<String, RecoveryStats> getAllStats() {
        return new ConcurrentHashMap<>(recoveryStatsMap);
    }

    public RecoveryStats getStats(String operationName) {
        return recoveryStatsMap.get(operationName);
    }

    public void resetStats(String operationName) {
        recoveryStatsMap.remove(operationName);
        log.info("重置恢复统计: {}", operationName);
    }

    public void resetAllStats() {
        recoveryStatsMap.clear();
        log.info("重置所有恢复统计");
    }

    private long calculateDelay(long baseDelay, double multiplier, int attempt) {
        return (long) (baseDelay * Math.pow(multiplier, attempt - 1));
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void recordSuccess(String operationName, int attempts) {
        RecoveryStats stats = recoveryStatsMap.computeIfAbsent(operationName, k -> new RecoveryStats());
        stats.recordSuccess(attempts);
    }

    private void recordFailure(String operationName, int attempts) {
        RecoveryStats stats = recoveryStatsMap.computeIfAbsent(operationName, k -> new RecoveryStats());
        stats.recordFailure(attempts);
    }

    private void recordFallback(String operationName) {
        RecoveryStats stats = recoveryStatsMap.computeIfAbsent(operationName, k -> new RecoveryStats());
        stats.recordFallback();
    }

    public static class RecoveryConfig {
        private int maxRetries = DEFAULT_MAX_RETRIES;
        private long retryDelayMs = DEFAULT_RETRY_DELAY_MS;
        private double backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER;
        private java.util.function.Function<Exception, Object> fallback;

        public static RecoveryConfig defaultConfig() {
            return new RecoveryConfig();
        }

        public RecoveryConfig maxRetries(int maxRetries) {
            this.maxRetries = maxRetries;
            return this;
        }

        public RecoveryConfig retryDelayMs(long retryDelayMs) {
            this.retryDelayMs = retryDelayMs;
            return this;
        }

        public RecoveryConfig backoffMultiplier(double backoffMultiplier) {
            this.backoffMultiplier = backoffMultiplier;
            return this;
        }

        @SuppressWarnings("unchecked")
        public <T> RecoveryConfig fallback(Supplier<T> fallback) {
            this.fallback = e -> fallback.get();
            return this;
        }

        public RecoveryConfig fallbackFunction(java.util.function.Function<Exception, Object> fallback) {
            this.fallback = fallback;
            return this;
        }

        public int getMaxRetries() {
            return maxRetries;
        }

        public long getRetryDelayMs() {
            return retryDelayMs;
        }

        public double getBackoffMultiplier() {
            return backoffMultiplier;
        }

        public java.util.function.Function<Exception, Object> getFallback() {
            return fallback;
        }
    }

    public static class RecoveryStats {
        private final AtomicInteger totalAttempts = new AtomicInteger(0);
        private final AtomicInteger successCount = new AtomicInteger(0);
        private final AtomicInteger failureCount = new AtomicInteger(0);
        private final AtomicInteger fallbackCount = new AtomicInteger(0);
        private volatile long lastSuccessTime = 0;
        private volatile long lastFailureTime = 0;

        public void recordSuccess(int attempts) {
            totalAttempts.addAndGet(attempts);
            successCount.incrementAndGet();
            lastSuccessTime = System.currentTimeMillis();
        }

        public void recordFailure(int attempts) {
            totalAttempts.addAndGet(attempts);
            failureCount.incrementAndGet();
            lastFailureTime = System.currentTimeMillis();
        }

        public void recordFallback() {
            fallbackCount.incrementAndGet();
        }

        public int getTotalAttempts() {
            return totalAttempts.get();
        }

        public int getSuccessCount() {
            return successCount.get();
        }

        public int getFailureCount() {
            return failureCount.get();
        }

        public int getFallbackCount() {
            return fallbackCount.get();
        }

        public double getFailureRate() {
            int total = successCount.get() + failureCount.get();
            if (total == 0) {
                return 0.0;
            }
            return (double) failureCount.get() / total;
        }

        public long getLastSuccessTime() {
            return lastSuccessTime;
        }

        public long getLastFailureTime() {
            return lastFailureTime;
        }
    }

    public static class RecoveryException extends RuntimeException {
        public RecoveryException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
