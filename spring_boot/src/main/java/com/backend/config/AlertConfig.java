package com.backend.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

/**
 * 告警配置类
 * 
 * 功能说明：
 * 配置性能告警阈值和监控基线
 * 
 * 告警规则：
 * - API响应时间超过阈值
 * - 错误率超过阈值
 * - 系统资源使用超过阈值
 * - 业务指标异常
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "wms.alert")
public class AlertConfig {

    /**
     * 是否启用告警
     */
    private boolean enabled = true;

    /**
     * API响应时间告警阈值（毫秒）
     */
    private ApiResponseTimeThreshold apiResponseTime = new ApiResponseTimeThreshold();

    /**
     * 错误率告警阈值
     */
    private ErrorRateThreshold errorRate = new ErrorRateThreshold();

    /**
     * 系统资源告警阈值
     */
    private SystemResourceThreshold systemResource = new SystemResourceThreshold();

    /**
     * 业务指标告警阈值
     */
    private BusinessMetricThreshold businessMetric = new BusinessMetricThreshold();

    /**
     * 告警通知配置
     */
    private NotificationConfig notification = new NotificationConfig();

    /**
     * 告警规则列表
     */
    private List<AlertRule> rules = new ArrayList<>();

    /**
     * API响应时间阈值
     */
    @Data
    public static class ApiResponseTimeThreshold {
        /**
         * 警告阈值（毫秒）
         */
        private int warning = 500;

        /**
         * 严重阈值（毫秒）
         */
        private int critical = 2000;

        /**
         * P95响应时间阈值（毫秒）
         */
        private int p95 = 1000;

        /**
         * P99响应时间阈值（毫秒）
         */
        private int p99 = 3000;
    }

    /**
     * 错误率阈值
     */
    @Data
    public static class ErrorRateThreshold {
        /**
         * 警告阈值（百分比）
         */
        private double warning = 5.0;

        /**
         * 严重阈值（百分比）
         */
        private double critical = 10.0;

        /**
         * 统计时间窗口（分钟）
         */
        private int timeWindow = 5;
    }

    /**
     * 系统资源阈值
     */
    @Data
    public static class SystemResourceThreshold {
        /**
         * CPU使用率警告阈值（百分比）
         */
        private double cpuWarning = 70.0;

        /**
         * CPU使用率严重阈值（百分比）
         */
        private double cpuCritical = 90.0;

        /**
         * 内存使用率警告阈值（百分比）
         */
        private double memoryWarning = 80.0;

        /**
         * 内存使用率严重阈值（百分比）
         */
        private double memoryCritical = 95.0;

        /**
         * 磁盘使用率警告阈值（百分比）
         */
        private double diskWarning = 80.0;

        /**
         * 磁盘使用率严重阈值（百分比）
         */
        private double diskCritical = 90.0;

        /**
         * 数据库连接池使用率警告阈值（百分比）
         */
        private double dbPoolWarning = 70.0;

        /**
         * 数据库连接池使用率严重阈值（百分比）
         */
        private double dbPoolCritical = 90.0;
    }

    /**
     * 业务指标阈值
     */
    @Data
    public static class BusinessMetricThreshold {
        /**
         * 设备数量异常阈值（低于此值告警）
         */
        private int deviceCountMin = 0;

        /**
         * 登录失败率警告阈值（百分比）
         */
        private double loginFailureRateWarning = 20.0;

        /**
         * 登录失败率严重阈值（百分比）
         */
        private double loginFailureRateCritical = 50.0;

        /**
         * 订单处理延迟阈值（毫秒）
         */
        private int orderProcessingDelay = 5000;
    }

    /**
     * 告警通知配置
     */
    @Data
    public static class NotificationConfig {
        /**
         * 是否启用邮件通知
         */
        private boolean emailEnabled = false;

        /**
         * 是否启用WebHook通知
         */
        private boolean webhookEnabled = false;

        /**
         * 告警冷却时间（分钟）
         */
        private int cooldownMinutes = 10;

        /**
         * 邮件接收者
         */
        private String[] emailRecipients = {};

        /**
         * WebHook URL
         */
        private String webhookUrl = "";
    }

    /**
     * 告警级别枚举
     */
    public enum AlertLevel {
        /**
         * 警告级别
         */
        WARNING,
        
        /**
         * 严重级别
         */
        CRITICAL
    }

    /**
     * 告警规则类
     */
    @Data
    public static class AlertRule {
        /**
         * 规则ID
         */
        private String id;
        
        /**
         * 规则名称
         */
        private String name;
        
        /**
         * 匹配模式（正则表达式）
         */
        private String pattern;
        
        /**
         * 错误模式（正则表达式）- 兼容旧代码
         */
        public String getErrorPattern() {
            return pattern;
        }
        
        /**
         * 告警级别
         */
        private AlertLevel level;
        
        /**
         * 告警级别字符串 - 兼容旧代码
         */
        public String getAlertLevel() {
            return level != null ? level.name() : "WARNING";
        }
        
        /**
         * 描述
         */
        private String description;
        
        /**
         * 频率阈值（每分钟）
         */
        private int frequencyThreshold = 10;
        
        /**
         * 阈值 - 兼容旧代码
         */
        public int getThreshold() {
            return frequencyThreshold;
        }
        
        /**
         * 是否启用
         */
        private boolean enabled = true;
    }
}
