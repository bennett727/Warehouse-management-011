/*
 * @file: LogSystemInitializer.java
 * @description: 日志系统初始化器 - 初始化和配置日志系统
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitResult;

/**
 * 日志系统初始化器
 *
 * 功能说明：
 * 负责初始化应用程序的日志系统，包括创建日志目录、
 * 配置日志级别和验证日志系统可用性。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class LogSystemInitializer {

    private static final Logger log = LoggerFactory.getLogger(LogSystemInitializer.class);

    @Autowired
    private Environment environment;

    /**
     * 初始化日志系统
     *
     * @return 初始化结果
     */
    public InitResult initialize() {
        long startTime = System.currentTimeMillis();
        String stepName = "日志系统初始化";

        try {
            log.info("[{}] 开始初始化日志系统...", stepName);

            // 1. 创建日志目录
            createLogDirectory();

            // 2. 验证日志级别配置
            validateLogLevels();

            // 3. 测试日志输出
            testLogOutput();

            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}] 日志系统初始化完成，耗时: {}ms", stepName, duration);

            return new InitResult(stepName, true, duration, "日志系统初始化成功");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}] 日志系统初始化失败: {}", stepName, e.getMessage(), e);
            return new InitResult(stepName, false, duration, "日志系统初始化失败: " + e.getMessage());
        }
    }

    /**
     * 创建日志目录
     */
    private void createLogDirectory() throws Exception {
        String logFilePath = environment.getProperty("logging.file.name", "logs/application.log");
        Path logPath = Paths.get(logFilePath);
        Path logDir = logPath.getParent();

        if (logDir != null && !Files.exists(logDir)) {
            Files.createDirectories(logDir);
            log.info("创建日志目录: {}", logDir.toAbsolutePath());
        }
    }

    /**
     * 验证日志级别配置
     */
    private void validateLogLevels() {
        String rootLevel = environment.getProperty("logging.level.root", "INFO");
        String appLevel = environment.getProperty("logging.level.com.backend", "INFO");

        log.debug("日志级别配置 - root: {}, app: {}", rootLevel, appLevel);
    }

    /**
     * 测试日志输出
     */
    private void testLogOutput() {
        log.debug("DEBUG级别日志测试");
        log.info("INFO级别日志测试");
        log.warn("WARN级别日志测试");

        log.info("日志系统测试完成");
    }
}
