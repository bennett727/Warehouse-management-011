/*
 * @file: ThreadPoolManager.java
 * @description: 线程池管理器 - 管理系统线程池的初始化和配置
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.component;

import java.util.concurrent.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitResult;

/**
 * 线程池管理器
 *
 * 功能说明：
 * 负责创建和管理应用程序所需的各种线程池，包括
 * 通用任务线程池、定时任务线程池和异步任务线程池。
 *
 * 配置参数：
 * - app.thread-pool.core-size: 核心线程数
 * - app.thread-pool.max-size: 最大线程数
 * - app.thread-pool.queue-capacity: 队列容量
 * - app.thread-pool.keep-alive-seconds: 线程存活时间
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class ThreadPoolManager {

    private static final Logger log = LoggerFactory.getLogger(ThreadPoolManager.class);

    @Autowired
    private Environment environment;

    private ExecutorService generalThreadPool;
    private ScheduledExecutorService scheduledThreadPool;
    private ExecutorService asyncThreadPool;

    /**
     * 通用线程工厂
     */
    private static class GeneralThreadFactory implements ThreadFactory {
        private int count = 0;

        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "general-pool-" + (++count));
        }
    }

    /**
     * 定时任务线程工厂
     */
    private static class ScheduledThreadFactory implements ThreadFactory {
        private int count = 0;

        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "scheduled-pool-" + (++count));
        }
    }

    /**
     * 异步任务线程工厂
     */
    private static class AsyncThreadFactory implements ThreadFactory {
        private int count = 0;

        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "async-pool-" + (++count));
        }
    }

    /**
     * 初始化线程池
     *
     * 创建和配置系统所需的各种线程池
     *
     * @return 初始化结果
     */
    public InitResult initialize() {
        long startTime = System.currentTimeMillis();
        String stepName = "线程池初始化";

        try {
            log.info("[{}] 开始初始化线程池...", stepName);

            // 加载配置
            int coreSize = getIntProperty("app.thread-pool.core-size", 5);
            int maxSize = getIntProperty("app.thread-pool.max-size", 20);
            int queueCapacity = getIntProperty("app.thread-pool.queue-capacity", 100);
            long keepAliveSeconds = getLongProperty("app.thread-pool.keep-alive-seconds", 60);

            log.info("[{}] 线程池配置 - 核心线程数: {}, 最大线程数: {}, 队列容量: {}",
                    stepName, coreSize, maxSize, queueCapacity);

            // 创建通用任务线程池
            generalThreadPool = new ThreadPoolExecutor(
                    coreSize,
                    maxSize,
                    keepAliveSeconds,
                    TimeUnit.SECONDS,
                    new LinkedBlockingQueue<>(queueCapacity),
                    new GeneralThreadFactory(),
                    new ThreadPoolExecutor.CallerRunsPolicy());

            // 创建定时任务线程池
            scheduledThreadPool = Executors.newScheduledThreadPool(
                    Math.max(2, coreSize / 2),
                    new ScheduledThreadFactory());

            // 创建异步任务线程池
            asyncThreadPool = new ThreadPoolExecutor(
                    coreSize,
                    maxSize * 2,
                    keepAliveSeconds,
                    TimeUnit.SECONDS,
                    new LinkedBlockingQueue<>(queueCapacity * 2),
                    new AsyncThreadFactory(),
                    new ThreadPoolExecutor.AbortPolicy());

            // 验证线程池
            validateThreadPools();

            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}] 线程池初始化完成，耗时: {}ms", stepName, duration);

            return new InitResult(stepName, true, duration, "线程池初始化成功");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}] 线程池初始化失败: {}", stepName, e.getMessage(), e);
            return new InitResult(stepName, false, duration, "线程池初始化失败: " + e.getMessage());
        }
    }

    /**
     * 验证线程池
     */
    private void validateThreadPools() {
        if (generalThreadPool == null || generalThreadPool.isShutdown()) {
            throw new IllegalStateException("通用线程池未正确初始化");
        }
        if (scheduledThreadPool == null || scheduledThreadPool.isShutdown()) {
            throw new IllegalStateException("定时任务线程池未正确初始化");
        }
        if (asyncThreadPool == null || asyncThreadPool.isShutdown()) {
            throw new IllegalStateException("异步任务线程池未正确初始化");
        }
    }

    /**
     * 获取整数配置
     */
    private int getIntProperty(String key, int defaultValue) {
        String value = environment.getProperty(key);
        if (value != null) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                log.warn("配置项 {} 格式错误，使用默认值: {}", key, defaultValue);
            }
        }
        return defaultValue;
    }

    /**
     * 获取长整数配置
     */
    private long getLongProperty(String key, long defaultValue) {
        String value = environment.getProperty(key);
        if (value != null) {
            try {
                return Long.parseLong(value);
            } catch (NumberFormatException e) {
                log.warn("配置项 {} 格式错误，使用默认值: {}", key, defaultValue);
            }
        }
        return defaultValue;
    }

    /**
     * 获取通用线程池
     */
    public ExecutorService getGeneralThreadPool() {
        return generalThreadPool;
    }

    /**
     * 获取定时任务线程池
     */
    public ScheduledExecutorService getScheduledThreadPool() {
        return scheduledThreadPool;
    }

    /**
     * 获取异步任务线程池
     */
    public ExecutorService getAsyncThreadPool() {
        return asyncThreadPool;
    }

    /**
     * 关闭所有线程池
     */
    public void shutdown() {
        log.info("正在关闭线程池...");

        if (generalThreadPool != null) {
            generalThreadPool.shutdown();
        }
        if (scheduledThreadPool != null) {
            scheduledThreadPool.shutdown();
        }
        if (asyncThreadPool != null) {
            asyncThreadPool.shutdown();
        }

        log.info("线程池关闭完成");
    }

/**
     * 获取核心线程数
     */
    public int getCorePoolSize() {
        return getIntProperty("app.thread-pool.core-size", 5);
    }
}
