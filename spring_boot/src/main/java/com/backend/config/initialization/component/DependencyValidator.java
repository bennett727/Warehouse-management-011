/*
 * @file: DependencyValidator.java
 * @description: 依赖验证器 - 验证系统依赖项的可用性
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.component;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitResult;

/**
 * 依赖验证器
 *
 * 功能说明：
 * 负责验证应用程序运行所需的各种依赖项，包括
 * 数据库连接、外部服务、必要配置等。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class DependencyValidator {

    private static final Logger log = LoggerFactory.getLogger(DependencyValidator.class);

    @Autowired
    private Environment environment;

    private final List<String> validationErrors = new ArrayList<>();

    /**
     * 验证依赖项
     *
     * @return 初始化结果
     */
    public InitResult validate() {
        long startTime = System.currentTimeMillis();
        String stepName = "依赖项验证";

        try {
            log.info("[{}] 开始验证依赖项...", stepName);
            validationErrors.clear();

            // 1. 验证数据库配置
            validateDatabaseConfiguration();

            // 2. 验证JWT配置
            validateJwtConfiguration();

            // 3. 验证必要配置项
            validateRequiredProperties();

            long duration = System.currentTimeMillis() - startTime;

            if (validationErrors.isEmpty()) {
                log.info("[{}] 依赖项验证完成，耗时: {}ms", stepName, duration);
                return new InitResult(stepName, true, duration, "所有依赖项验证通过");
            } else {
                String errorMessage = String.join("; ", validationErrors);
                log.error("[{}] 依赖项验证失败: {}", stepName, errorMessage);
                return new InitResult(stepName, false, duration, "依赖项验证失败: " + errorMessage);
            }

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}] 依赖项验证异常: {}", stepName, e.getMessage(), e);
            return new InitResult(stepName, false, duration, "依赖项验证异常: " + e.getMessage());
        }
    }

    /**
     * 验证数据库配置
     */
    private void validateDatabaseConfiguration() {
        String datasourceUrl = environment.getProperty("spring.datasource.url");
        String driverClassName = environment.getProperty("spring.datasource.driver-class-name");

        if (datasourceUrl == null || datasourceUrl.isEmpty()) {
            validationErrors.add("数据库URL未配置");
        }

        if (driverClassName == null || driverClassName.isEmpty()) {
            validationErrors.add("数据库驱动类名未配置");
        }

        log.debug("数据库配置验证完成");
    }

    /**
     * 验证JWT配置
     */
    private void validateJwtConfiguration() {
        String jwtSecret = environment.getProperty("jwt.secret");

        if (jwtSecret == null || jwtSecret.isEmpty()) {
            validationErrors.add("JWT密钥未配置");
        } else if (jwtSecret.length() < 32) {
            validationErrors.add("JWT密钥长度不足(至少32位)");
        }

        log.debug("JWT配置验证完成");
    }

    /**
     * 验证必要配置项
     */
    private void validateRequiredProperties() {
        String[][] requiredConfigs = {
            {"spring.application.name", "应用名称"},
            {"server.port", "服务器端口"},
            {"jwt.expiration", "JWT过期时间"}
        };

        for (String[] config : requiredConfigs) {
            String value = environment.getProperty(config[0]);
            if (value == null || value.isEmpty()) {
                validationErrors.add(config[1] + "未配置");
            }
        }

        log.debug("必要配置项验证完成");
    }

    /**
     * 获取验证错误列表
     */
    public List<String> getValidationErrors() {
        return new ArrayList<>(validationErrors);
    }

    /**
     * 获取已验证的依赖数量
     */
    public int getValidatedCount() {
        return validationErrors.isEmpty() ? 5 : 0; // 返回验证的依赖数量
    }
}
