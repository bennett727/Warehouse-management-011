/*
 * @file: DatabaseConnectionInitializer.java
 * @description: 数据库连接初始化器 - 初始化和验证数据库连接
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.component;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitResult;

/**
 * 数据库连接初始化器
 *
 * 功能说明：
 * 负责初始化数据库连接，验证数据库连接池配置，
 * 并测试数据库连接的可用性。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class DatabaseConnectionInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionInitializer.class);

    @Autowired
    private Environment environment;

    @Autowired(required = false)
    private DataSource dataSource;

    /**
     * 初始化数据库连接
     *
     * @return 初始化结果
     */
    public InitResult initialize() {
        long startTime = System.currentTimeMillis();
        String stepName = "数据库连接初始化";

        try {
            log.info("[{}] 开始初始化数据库连接...", stepName);

            // 1. 检查数据源配置
            if (dataSource == null) {
                log.warn("[{}] 数据源未配置，跳过数据库连接初始化", stepName);
                return new InitResult(stepName, true, 0, "数据源未配置，跳过初始化");
            }

            // 2. 测试数据库连接
            testDatabaseConnection();

            // 3. 获取数据库元数据
            collectDatabaseMetadata();

            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}] 数据库连接初始化完成，耗时: {}ms", stepName, duration);

            return new InitResult(stepName, true, duration, "数据库连接初始化成功");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}] 数据库连接初始化失败: {}", stepName, e.getMessage(), e);
            return new InitResult(stepName, false, duration, "数据库连接初始化失败: " + e.getMessage());
        }
    }

    /**
     * 测试数据库连接
     */
    private void testDatabaseConnection() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                log.info("数据库连接测试成功");
            } else {
                throw new SQLException("数据库连接无效");
            }
        }
    }

    /**
     * 收集数据库元数据
     */
    private void collectDatabaseMetadata() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            String databaseProductName = metaData.getDatabaseProductName();
            String databaseProductVersion = metaData.getDatabaseProductVersion();
            String driverName = metaData.getDriverName();
            String driverVersion = metaData.getDriverVersion();

            log.info("数据库信息:");
            log.info("  - 数据库产品: {} {}", databaseProductName, databaseProductVersion);
            log.info("  - 驱动程序: {} {}", driverName, driverVersion);
        }
    }

    /**
     * 获取连接池大小
     */
    public int getPoolSize() {
        return 10; // 默认连接池大小
    }
}
