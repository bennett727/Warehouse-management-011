package com.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * 数据修复配置类
 * 应用启动时执行数据修复脚本
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataFixConfig {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 应用启动时执行数据修复
     */
    @PostConstruct
    public void executeDataFix() {
        try {
            log.info("开始执行数据修复脚本...");

            // 1. 修复设备类型
            fixDeviceType();

            // 2. 迁移设备状态
            migrateDeviceStatus();

            // 3. 添加入出库信息字段
            migrateInventoryFields();

            log.info("数据修复完成");

        } catch (Exception e) {
            log.error("数据修复失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 修复设备类型
     */
    private void fixDeviceType() {
        try {
            Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM device WHERE type_id IS NULL",
                Long.class
            );

            if (count != null && count > 0) {
                log.info("发现 {} 个没有类型的设备，开始修复...", count);

                try (Connection connection = dataSource.getConnection()) {
                    ScriptUtils.executeSqlScript(connection,
                        new ClassPathResource("db/data-fix.sql"));
                }

                log.info("设备类型修复完成");
            } else {
                log.info("没有发现需要修复的设备类型数据");
            }

            // 验证修复结果
            Long nullTypeCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM device WHERE type_id IS NULL",
                Long.class
            );
            Long totalDevices = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM device",
                Long.class
            );
            log.info("设备类型验证结果: 总设备数={}, 无类型设备数={}",
                totalDevices != null ? totalDevices : 0,
                nullTypeCount != null ? nullTypeCount : 0);

        } catch (Exception e) {
            log.error("设备类型修复失败: {}", e.getMessage());
        }
    }

    /**
     * 迁移设备状态
     * 将旧状态值迁移到新的5种状态
     */
    private void migrateDeviceStatus() {
        try {
            log.info("开始检查设备状态迁移...");

            // 检查是否存在需要迁移的旧状态
            Long oldStatusCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM device WHERE status IN (2, 4, 5)",
                Long.class
            );

            if (oldStatusCount != null && oldStatusCount > 0) {
                log.info("发现 {} 个设备需要状态迁移...", oldStatusCount);

                // 统计迁移前状态分布
                log.info("迁移前状态分布:");
                jdbcTemplate.query(
                    "SELECT status, COUNT(*) as count FROM device GROUP BY status ORDER BY status",
                    (rs, rowNum) -> {
                        log.info("  状态 {}: {} 个设备", rs.getInt("status"), rs.getLong("count"));
                        return null;
                    }
                );

                // 执行状态迁移脚本
                try (Connection connection = dataSource.getConnection()) {
                    ScriptUtils.executeSqlScript(connection,
                        new ClassPathResource("db/status-migration.sql"));
                }

                log.info("设备状态迁移完成");

                // 验证迁移结果
                log.info("迁移后状态分布:");
                jdbcTemplate.query(
                    "SELECT status, COUNT(*) as count FROM device GROUP BY status ORDER BY status",
                    (rs, rowNum) -> {
                        log.info("  状态 {}: {} 个设备", rs.getInt("status"), rs.getLong("count"));
                        return null;
                    }
                );

                // 检查是否有无效状态
                Long invalidCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM device WHERE status NOT IN (-1, 0, 1, 2, 3)",
                    Long.class
                );
                if (invalidCount != null && invalidCount > 0) {
                    log.warn("警告：仍有 {} 个设备处于无效状态", invalidCount);
                } else {
                    log.info("状态验证通过：所有设备状态均有效");
                }

            } else {
                log.info("没有发现需要迁移的设备状态数据");
            }

        } catch (Exception e) {
            log.error("设备状态迁移失败: {}", e.getMessage());
        }
    }

    /**
     * 迁移出入库信息字段
     * 添加出入库相关字段到 device 表
     */
    private void migrateInventoryFields() {
        try {
            log.info("开始检查出入库信息字段...");

            // 检查字段是否已存在
            boolean hasInboundFields = checkColumnExists("device", "inbound_person_id");
            boolean hasOutboundFields = checkColumnExists("device", "outbound_person_id");
            boolean hasLocationFields = checkColumnExists("device", "current_location");

            if (!hasInboundFields || !hasOutboundFields || !hasLocationFields) {
                log.info("发现需要添加的出入库字段，开始执行迁移...");

                // 执行字段迁移脚本
                try (Connection connection = dataSource.getConnection()) {
                    ScriptUtils.executeSqlScript(connection,
                        new ClassPathResource("db/inventory-fields-migration.sql"));
                }

                log.info("出入库字段迁移完成");

                // 验证迁移结果
                Long totalDevices = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM device",
                    Long.class
                );
                Long devicesWithLocation = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM device WHERE current_location IS NOT NULL",
                    Long.class
                );

                log.info("出入库字段验证结果: 总设备数={}, 有位置信息的设备数={}",
                    totalDevices != null ? totalDevices : 0,
                    devicesWithLocation != null ? devicesWithLocation : 0);
            } else {
                log.info("出入库字段已存在，跳过迁移");
            }

        } catch (Exception e) {
            log.error("出入库字段迁移失败: {}", e.getMessage());
        }
    }

    /**
     * 检查表中是否存在指定列
     */
    private boolean checkColumnExists(String tableName, String columnName) {
        try {
            jdbcTemplate.queryForObject(
                "SELECT 1 FROM information_schema.columns " +
                "WHERE table_name = ? AND column_name = ? LIMIT 1",
                Integer.class,
                tableName, columnName
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 验证数据修复结果
     */
    private void verifyDataFix() {
        try {
            Long nullTypeCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM device WHERE type_id IS NULL",
                Long.class
            );

            Long totalDevices = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM device",
                Long.class
            );

            log.info("数据验证结果: 总设备数={}, 无类型设备数={}",
                totalDevices != null ? totalDevices : 0,
                nullTypeCount != null ? nullTypeCount : 0);

        } catch (Exception e) {
            log.error("数据验证失败: {}", e.getMessage());
        }
    }
}
