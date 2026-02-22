package com.backend.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * 数据迁移执行器
 * 
 * 用途：执行入库流程重构的数据迁移脚本
 * 执行时机：应用启动时自动检测并执行
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2026-02-13
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========== 开始执行数据迁移 ==========");
        
        try {
            // 检查是否已执行过迁移
            if (isMigrationExecuted()) {
                log.info("数据迁移已执行过，跳过");
                return;
            }
            
            // 步骤1：备份数据
            backupData();
            
            // 步骤2：创建审批记录
            createApprovalRecords();
            
            // 步骤3：验证数据一致性
            validateDataConsistency();
            
            // 步骤4：记录迁移完成
            recordMigration();
            
            log.info("========== 数据迁移执行完成 ==========");
        } catch (Exception e) {
            log.error("数据迁移执行失败: {}", e.getMessage(), e);
            throw new RuntimeException("数据迁移失败", e);
        }
    }

    /**
     * 检查是否已执行过迁移
     */
    private boolean isMigrationExecuted() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM data_migration_log WHERE migration_version = ?",
                Integer.class,
                "20250213_1"
            );
            return count != null && count > 0;
        } catch (Exception e) {
            // 表不存在，需要创建
            createMigrationLogTable();
            return false;
        }
    }

    /**
     * 创建迁移日志表
     */
    private void createMigrationLogTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS data_migration_log (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                migration_version VARCHAR(50) NOT NULL,
                migration_name VARCHAR(200) NOT NULL,
                executed_at TIMESTAMP NOT NULL,
                execution_time_ms BIGINT,
                status VARCHAR(20) NOT NULL,
                error_message TEXT,
                UNIQUE KEY uk_version (migration_version)
            )
            """;
        jdbcTemplate.execute(sql);
        log.info("迁移日志表创建完成");
    }

    /**
     * 备份数据
     */
    private void backupData() {
        log.info("步骤1：备份原始数据...");
        
        try {
            // 创建设备备份表
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS device_backup_20250213 AS
                SELECT * FROM device
                """);
            
            // 创建入库单备份表
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS stock_order_backup_20250213 AS
                SELECT * FROM stock_order
                """);
            
            log.info("数据备份完成");
        } catch (Exception e) {
            log.warn("备份表已存在，跳过备份: {}", e.getMessage());
        }
    }

    /**
     * 为历史入库单创建审批记录
     */
    private void createApprovalRecords() {
        log.info("步骤2：为历史入库单创建审批记录...");
        
        // 检查device_status_approval表是否存在
        try {
            jdbcTemplate.queryForObject("SELECT 1 FROM device_status_approval LIMIT 1", Integer.class);
        } catch (Exception e) {
            log.info("device_status_approval表不存在，跳过审批记录创建");
            return;
        }
        
        String sql = """
            INSERT INTO device_status_approval (
                device_id,
                order_type,
                from_status,
                to_status,
                reason,
                applicant_id,
                applicant_name,
                apply_time,
                approver_id,
                approver_name,
                approval_time,
                approval_remark,
                status,
                create_time,
                update_time
            )
            SELECT
                d.id as device_id,
                0 as order_type,
                -1 as from_status,
                0 as to_status,
                '历史数据迁移：自动审批' as reason,
                so.operator_id as applicant_id,
                so.operator_name as applicant_name,
                so.create_time as apply_time,
                so.auditor_id as approver_id,
                so.auditor_name as approver_name,
                so.audit_time as approval_time,
                '系统自动迁移历史数据' as approval_remark,
                1 as status,
                NOW() as create_time,
                NOW() as update_time
            FROM device d
            INNER JOIN stock_order_item soi ON d.id = soi.device_id
            INNER JOIN stock_order so ON soi.stock_order_id = so.id
            WHERE so.order_type = 0
              AND so.status = 2
              AND d.status = 0
              AND NOT EXISTS (
                  SELECT 1 FROM device_status_approval dsa
                  WHERE dsa.device_id = d.id AND dsa.order_type = 0
              )
            """;
        
        int affectedRows = jdbcTemplate.update(sql);
        log.info("创建了 {} 条审批记录", affectedRows);
    }

    /**
     * 验证数据一致性
     */
    private void validateDataConsistency() {
        log.info("步骤3：验证数据一致性...");
        
        // 检查孤儿设备
        Integer orphanCount = jdbcTemplate.queryForObject("""
            SELECT COUNT(*) FROM device d
            WHERE d.status = 0
              AND NOT EXISTS (
                  SELECT 1 FROM stock_order_item soi
                  WHERE soi.device_id = d.id
              )
            """, Integer.class);
        
        if (orphanCount != null && orphanCount > 0) {
            log.warn("发现 {} 个孤儿设备（在库但无入库记录）", orphanCount);
        } else {
            log.info("未发现孤儿设备");
        }
        
        // 统计各状态设备数量
        log.info("设备状态统计：");
        jdbcTemplate.query("""
            SELECT
                CASE status
                    WHEN -1 THEN '待入库'
                    WHEN 0 THEN '在库'
                    WHEN 1 THEN '使用中'
                    WHEN 2 THEN '维护中'
                    WHEN 3 THEN '已报废'
                    ELSE '未知'
                END as status_name,
                status,
                COUNT(*) as count
            FROM device
            GROUP BY status
            ORDER BY status
            """, rs -> {
                log.info("  {} ({}): {} 个", 
                    rs.getString("status_name"),
                    rs.getInt("status"),
                    rs.getLong("count"));
            });
    }

    /**
     * 记录迁移完成
     */
    private void recordMigration() {
        log.info("步骤4：记录迁移完成...");
        
        jdbcTemplate.update("""
            INSERT INTO data_migration_log (
                migration_version,
                migration_name,
                executed_at,
                execution_time_ms,
                status
            ) VALUES (?, ?, ?, ?, ?)
            """,
            "20250213_1",
            "Migrate PendingInbound Status",
            LocalDateTime.now(),
            0,
            "SUCCESS"
        );
        
        log.info("迁移记录已保存");
    }
}
