/*
 * @file: ConfigFileParser.java
 * @description: 配置文件解析器 - 解析和验证配置文件
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
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.env.PropertySource;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitResult;

/**
 * 配置文件解析器
 *
 * 功能说明：
 * 负责解析和验证应用程序的配置文件，收集配置属性
 * 并验证配置的有效性。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class ConfigFileParser {

    private static final Logger log = LoggerFactory.getLogger(ConfigFileParser.class);

    @Autowired
    private Environment environment;

    private final Map<String, Object> configurationProperties = new HashMap<>();

    /**
     * 解析配置文件
     *
     * @return 初始化结果
     */
    public InitResult parse() {
        long startTime = System.currentTimeMillis();
        String stepName = "配置文件解析";

        try {
            log.info("[{}] 开始解析配置文件...", stepName);

            // 1. 收集配置属性
            collectConfigurationProperties();

            // 2. 验证必要配置
            validateRequiredConfigurations();

            // 3. 汇总配置信息
            summarizeConfiguration();

            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}] 配置文件解析完成，耗时: {}ms", stepName, duration);

            return new InitResult(stepName, true, duration, "配置文件解析成功");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}] 配置文件解析失败: {}", stepName, e.getMessage(), e);
            return new InitResult(stepName, false, duration, "配置文件解析失败: " + e.getMessage());
        }
    }

    /**
     * 收集配置属性
     */
    private void collectConfigurationProperties() {
        if (environment instanceof ConfigurableEnvironment) {
            ConfigurableEnvironment configurableEnv = (ConfigurableEnvironment) environment;

            for (PropertySource<?> propertySource : configurableEnv.getPropertySources()) {
                if (propertySource instanceof EnumerablePropertySource) {
                    EnumerablePropertySource<?> enumerableSource = (EnumerablePropertySource<?>) propertySource;
                    String[] propertyNames = enumerableSource.getPropertyNames();

                    for (String propertyName : propertyNames) {
                        Object value = enumerableSource.getProperty(propertyName);
                        configurationProperties.put(propertyName, value);
                    }
                }
            }
        }

        log.debug("收集到 {} 个配置属性", configurationProperties.size());
    }

    /**
     * 验证必要配置
     */
    private void validateRequiredConfigurations() {
        String[][] requiredConfigs = {
            {"spring.application.name", "应用名称"},
            {"server.port", "服务器端口"},
            {"spring.datasource.url", "数据库URL"},
            {"jwt.secret", "JWT密钥"}
        };

        for (String[] config : requiredConfigs) {
            String value = environment.getProperty(config[0]);
            if (value == null || value.isEmpty()) {
                log.warn("必要配置项 {} ({}) 未设置", config[0], config[1]);
            }
        }
    }

    /**
     * 汇总配置信息
     */
    private void summarizeConfiguration() {
        String appName = environment.getProperty("spring.application.name");
        String port = environment.getProperty("server.port");
        String[] activeProfiles = environment.getActiveProfiles();

        log.info("应用配置汇总:");
        log.info("  - 应用名称: {}", appName);
        log.info("  - 服务端口: {}", port);
        log.info("  - 活动配置: {}", String.join(", ", activeProfiles));
    }

    /**
     * 获取配置属性
     */
    public Map<String, Object> getConfigurationProperties() {
        return new HashMap<>(configurationProperties);
    }

    /**
     * 获取配置项数量
     */
    public int getConfigCount() {
        return configurationProperties.size();
    }
}
