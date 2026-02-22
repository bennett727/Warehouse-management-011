package com.backend.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * 日志监控工具类
 * 用于监控日志文件大小、错误数量、磁盘空间等
 * 支持定时报告和告警
 */
@Component
public class LogMonitor {

    private static final Logger logger = LoggerFactory.getLogger(LogMonitor.class);
    private static final Logger alertLogger = LoggerFactory.getLogger("ALERT_LOGGER");

    @Value("${logging.file.path:logs}")
    private String logPath;

    @Value("${log.monitor.disk.threshold:80}")
    private int diskThreshold; // 磁盘使用率阈值（%）

    @Value("${log.monitor.error.threshold:100}")
    private int errorThreshold; // 错误数量阈值

    private final Map<String, Long> lastErrorCounts = new HashMap<>();
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /**
     * 初始化日志监控
     */
    @PostConstruct
    public void init() {
        logger.info("日志监控系统初始化完成，监控路径: {}", logPath);
        // 初始化错误计数
        lastErrorCounts.put("error", 0L);
    }

    /**
     * 定时监控任务（每5分钟执行一次）
     */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void monitor() {
        try {
            // 检查日志目录
            Path logDir = Paths.get(logPath);
            if (!Files.exists(logDir)) {
                logger.warn("日志目录不存在: {}", logPath);
                return;
            }

            // 监控磁盘空间
            checkDiskSpace();

            // 监控日志文件大小
            checkLogFileSizes(logDir.toFile());

            // 监控错误日志
            checkErrorLogs(logDir.toFile());

            // 生成监控报告
            generateReport(logDir.toFile());

        } catch (Exception e) {
            logger.error("日志监控任务执行失败", e);
        }
    }

    /**
     * 检查磁盘空间
     */
    private void checkDiskSpace() {
        File logDir = new File(logPath);
        long totalSpace = logDir.getTotalSpace();
        long freeSpace = logDir.getFreeSpace();
        long usedSpace = totalSpace - freeSpace;
        double usagePercent = (double) usedSpace / totalSpace * 100;

        logger.debug("磁盘空间使用: {}%, 剩余: {}MB", String.format("%.2f", usagePercent), freeSpace / 1024 / 1024);

        if (usagePercent > diskThreshold) {
            String alertMsg = String.format("磁盘空间告警: 使用率 %.2f%%, 超过阈值 %d%%", usagePercent, diskThreshold);
            alertLogger.error(alertMsg);
            logger.warn(alertMsg);
        }
    }

    /**
     * 检查日志文件大小
     */
    private void checkLogFileSizes(File logDir) {
        File[] logFiles = logDir.listFiles((dir, name) -> name.endsWith(".log"));
        if (logFiles == null)
            return;

        long totalSize = 0;
        for (File file : logFiles) {
            long size = file.length();
            totalSize += size;

            // 单个文件超过100MB告警
            if (size > 100 * 1024 * 1024) {
                String alertMsg = String.format("日志文件过大: %s (%.2f MB)",
                        file.getName(), size / 1024.0 / 1024.0);
                alertLogger.error(alertMsg);
                logger.warn(alertMsg);
            }
        }

        logger.debug("日志文件总大小: {}MB", totalSize / 1024 / 1024);
    }

    /**
     * 检查错误日志
     */
    private void checkErrorLogs(File logDir) {
        File errorLog = new File(logDir, "warehouse-management-system-error.log");
        if (!errorLog.exists()) {
            return;
        }

        long currentErrorCount = countErrorsInFile(errorLog);
        long lastCount = lastErrorCounts.getOrDefault("error", 0L);
        long newErrors = currentErrorCount - lastCount;

        if (newErrors > 0) {
            logger.info("检测到 {} 条新错误日志", newErrors);

            if (newErrors > errorThreshold) {
                String alertMsg = String.format("错误日志告警: 新增 %d 条错误，超过阈值 %d", newErrors, errorThreshold);
                alertLogger.error(alertMsg);
                logger.error(alertMsg);
            }
        }

        lastErrorCounts.put("error", currentErrorCount);
    }

    /**
     * 统计文件中的错误数量
     */
    private long countErrorsInFile(File file) {
        AtomicLong count = new AtomicLong(0);
        try {
            Files.lines(file.toPath()).forEach(line -> {
                if (line.contains("ERROR")) {
                    count.incrementAndGet();
                }
            });
        } catch (IOException e) {
            logger.error("读取错误日志文件失败", e);
        }
        return count.get();
    }

    /**
     * 生成监控报告
     */
    private void generateReport(File logDir) {
        StringBuilder report = new StringBuilder();
        report.append("\n========== 日志监控报告 ==========\n");
        report.append("时间: ").append(dateFormat.format(new Date())).append("\n");
        report.append("日志路径: ").append(logPath).append("\n");

        // 统计各日志文件
        File[] logFiles = logDir.listFiles((dir, name) -> name.endsWith(".log"));
        if (logFiles != null && logFiles.length > 0) {
            report.append("\n日志文件统计:\n");
            for (File file : logFiles) {
                String size = formatFileSize(file.length());
                report.append(String.format("  - %s: %s\n", file.getName(), size));
            }
        }

        // 统计归档文件
        File archiveDir = new File(logDir, "archive");
        if (archiveDir.exists()) {
            File[] archiveFiles = archiveDir.listFiles((dir, name) -> name.endsWith(".log"));
            if (archiveFiles != null) {
                report.append(String.format("\n归档文件数量: %d\n", archiveFiles.length));
            }
        }

        report.append("================================\n");
        logger.info(report.toString());
    }

    /**
     * 格式化文件大小
     */
    private String formatFileSize(long size) {
        if (size < 1024)
            return size + " B";
        if (size < 1024 * 1024)
            return String.format("%.2f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024)
            return String.format("%.2f MB", size / 1024.0 / 1024.0);
        return String.format("%.2f GB", size / 1024.0 / 1024.0 / 1024.0);
    }

    /**
     * 手动触发日志清理（每天凌晨2点执行）
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldLogs() {
        logger.info("开始清理过期日志文件...");
        // 清理逻辑由logback的maxHistory自动处理
        logger.info("日志清理任务完成");
    }

    /**
     * 获取日志统计信息（供API调用）
     */
    public Map<String, Object> getLogStatistics() {
        Map<String, Object> stats = new HashMap<>();

        try {
            Path logDir = Paths.get(logPath);
            if (!Files.exists(logDir)) {
                stats.put("error", "日志目录不存在");
                return stats;
            }

            // 统计日志文件
            File[] logFiles = logDir.toFile().listFiles((dir, name) -> name.endsWith(".log"));
            long totalSize = 0;
            int fileCount = 0;

            if (logFiles != null) {
                fileCount = logFiles.length;
                for (File file : logFiles) {
                    totalSize += file.length();
                }
            }

            stats.put("logPath", logPath);
            stats.put("fileCount", fileCount);
            stats.put("totalSize", formatFileSize(totalSize));
            stats.put("timestamp", dateFormat.format(new Date()));

            // 错误统计
            File errorLog = new File(logPath, "warehouse-management-system-error.log");
            if (errorLog.exists()) {
                stats.put("errorCount", countErrorsInFile(errorLog));
            }

        } catch (Exception e) {
            stats.put("error", e.getMessage());
        }

        return stats;
    }
}
