package com.backend.config;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Configuration;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * API限流配置类
 * 
 * 功能说明：
 * 配置基于令牌桶算法的API限流策略
 * 
 * 限流策略：
 * - 全局限流：保护系统整体稳定性
 * - 接口级限流：针对特定接口的限流
 * - 用户级限流：针对单个用户的限流
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Configuration
public class RateLimitConfig {

    /**
     * 限流器名称前缀
     */
    public static final String RATE_LIMITER_PREFIX = "wms:";

    // 限流器缓存
    private final Map<String, RateLimiter> rateLimiterMap = new ConcurrentHashMap<>();

    /**
     * 初始化限流配置
     */
    @PostConstruct
    public void init() {
        log.info("初始化API限流配置");
        
        // 创建默认限流配置
        RateLimiterConfig defaultConfig = RateLimiterConfig.custom()
                .limitForPeriod(100)           // 每周期允许100个请求
                .limitRefreshPeriod(Duration.ofSeconds(1))  // 每秒刷新
                .timeoutDuration(Duration.ofMillis(100))    // 等待时间100ms
                .build();
        
        RateLimiterRegistry registry = RateLimiterRegistry.of(defaultConfig);
        
        // 预创建常用限流器
        createRateLimiter("global", 100, 1);
        createRateLimiter("device:list", 50, 1);
        createRateLimiter("device:detail", 100, 1);
        createRateLimiter("device:create", 20, 1);
        createRateLimiter("device:update", 30, 1);
        createRateLimiter("device:delete", 10, 1);
        createRateLimiter("export", 5, 1);
        createRateLimiter("report", 10, 1);
        
        log.info("API限流配置初始化完成，创建了 {} 个限流器", rateLimiterMap.size());
    }

    /**
     * 创建限流器（不放入map，仅创建实例）
     * 
     * @param name 限流器名称
     * @param limitForPeriod 每周期限制数
     * @param periodSeconds 周期（秒）
     * @return RateLimiter实例
     */
    public RateLimiter createRateLimiter(String name, int limitForPeriod, int periodSeconds) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(limitForPeriod)
                .limitRefreshPeriod(Duration.ofSeconds(periodSeconds))
                .timeoutDuration(Duration.ofMillis(100))
                .build();
        
        RateLimiter rateLimiter = RateLimiter.of(name, config);
        
        log.debug("创建限流器: name={}, limit={}/{}s", name, limitForPeriod, periodSeconds);
        return rateLimiter;
    }

    /**
     * 获取限流器
     * 
     * @param name 限流器名称
     * @return RateLimiter实例
     */
    public RateLimiter getRateLimiter(String name) {
        RateLimiter rateLimiter = rateLimiterMap.get(name);
        if (rateLimiter == null) {
            // 使用同步块避免并发创建
            synchronized (this) {
                rateLimiter = rateLimiterMap.get(name);
                if (rateLimiter == null) {
                    rateLimiter = createRateLimiter(name, 100, 1);
                    rateLimiterMap.put(name, rateLimiter);
                }
            }
        }
        return rateLimiter;
    }

    /**
     * 获取全局限流器
     * 
     * @return RateLimiter实例
     */
    public RateLimiter getGlobalRateLimiter() {
        return getRateLimiter("global");
    }

    /**
     * 获取接口限流器
     * 
     * @param apiPath 接口路径
     * @return RateLimiter实例
     */
    public RateLimiter getApiRateLimiter(String apiPath) {
        String name = apiPath.replace("/", ":");
        return getRateLimiter(name);
    }

    /**
     * 获取用户限流器
     * 
     * @param userId 用户ID
     * @return RateLimiter实例
     */
    public RateLimiter getUserRateLimiter(Long userId) {
        String name = "user:" + userId;
        RateLimiter rateLimiter = rateLimiterMap.get(name);
        if (rateLimiter == null) {
            // 使用同步块避免并发创建
            synchronized (this) {
                rateLimiter = rateLimiterMap.get(name);
                if (rateLimiter == null) {
                    rateLimiter = createRateLimiter(name, 60, 1);  // 每用户每分钟60请求
                    rateLimiterMap.put(name, rateLimiter);
                }
            }
        }
        return rateLimiter;
    }

    /**
     * 检查是否允许请求
     * 
     * @param name 限流器名称
     * @return true表示允许
     */
    public boolean allowRequest(String name) {
        RateLimiter rateLimiter = getRateLimiter(name);
        return rateLimiter.acquirePermission();
    }

    /**
     * 获取限流器状态
     * 
     * @param name 限流器名称
     * @return 限流器状态
     */
    public RateLimiterStatus getStatus(String name) {
        RateLimiter rateLimiter = rateLimiterMap.get(name);
        if (rateLimiter == null) {
            return null;
        }
        
        RateLimiter.Metrics metrics = rateLimiter.getMetrics();
        RateLimiterStatus status = new RateLimiterStatus();
        status.setName(name);
        status.setAvailablePermissions(metrics.getAvailablePermissions());
        status.setNumberOfWaitingThreads(metrics.getNumberOfWaitingThreads());
        
        return status;
    }

    /**
     * 限流器状态类
     */
    @Data
    public static class RateLimiterStatus {
        private String name;
        private int availablePermissions;
        private int numberOfWaitingThreads;
    }
}
