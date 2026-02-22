/*
 * @file: EnvironmentConfigurator.java
 * @description: 环境配置器 - 配置和管理应用程序环境变量
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.component;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitResult;

/**
 * 环境配置器
 *
 * 功能说明：
 * 负责配置和管理应用程序的环境变量，包括系统属性、
 * 环境变量和配置文件中的属性。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class EnvironmentConfigurator {

    private static final Logger log = LoggerFactory.getLogger(EnvironmentConfigurator.class);

    @Autowired
    private Environment environment;

    private final Map<String, String> environmentVariables = new HashMap<>();

    /**
     * 配置环境变量
     *
     * @return 初始化结果
     */
    public InitResult configure() {
        long startTime = System.currentTimeMillis();
        String stepName = "环境变量配置";

        try {
            log.info("[{}] 开始配置环境变量...", stepName);

            // 1. 收集系统环境变量
            collectSystemEnvironment();

            // 2. 收集系统属性
            collectSystemProperties();

            // 3. 验证必要配置
            validateRequiredConfigurations();

            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}] 环境变量配置完成，耗时: {}ms", stepName, duration);

            return new InitResult(stepName, true, duration, "环境变量配置成功");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}] 环境变量配置失败: {}", stepName, e.getMessage(), e);
            return new InitResult(stepName, false, duration, "环境变量配置失败: " + e.getMessage());
        }
    }

    /**
     * 收集系统环境变量
     */
    private void collectSystemEnvironment() {
        Map<String, String> env = System.getenv();
        environmentVariables.putAll(env);
        log.debug("收集到 {} 个系统环境变量", env.size());
    }

    /**
     * 收集系统属性
     */
    private void collectSystemProperties() {
        String[] keys = {
            "java.version",
            "java.vendor",
            "os.name",
            "os.version",
            "user.name",
            "user.dir"
        };

        for (String key : keys) {
            String value = System.getProperty(key);
            if (value != null) {
                environmentVariables.put(key, value);
            }
        }

        log.debug("收集到系统属性: java.version={}, os.name={}",
                System.getProperty("java.version"),
                System.getProperty("os.name"));
    }

    /**
     * 验证必要配置
     */
    private void validateRequiredConfigurations() {
        String[] requiredProperties = {
            "spring.application.name",
            "server.port"
        };

        for (String property : requiredProperties) {
            String value = environment.getProperty(property);
            if (value == null || value.isEmpty()) {
                log.warn("必要配置项 {} 未设置", property);
            }
        }
    }

    /**
     * 获取环境变量
     */
    public String getEnvironmentVariable(String key) {
        return environmentVariables.get(key);
    }

    /**
     * 获取所有环境变量
     */
    public Map<String, String> getAllEnvironmentVariables() {
        return new HashMap<>(environmentVariables);
    }
}
