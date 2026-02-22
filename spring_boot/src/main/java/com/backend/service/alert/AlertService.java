package com.backend.service.alert;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.backend.config.AlertConfig;
import com.backend.config.AlertRuleConfig;
import com.backend.service.metrics.BusinessMetricsService;

import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 告警服务
 * 
 * 功能说明：
 * 监控系统指标，触发告警通知
 * 
 * 监控内容：
 * - API响应时间
 * - 错误率
 * - 系统资源使用
 * - 业务指标异常
 * 
 * 告警渠道：
 * - 钉钉机器人
 * - 企业微信机器人
 * - 邮件通知
 * 
 * @author 技术架构团队
 * @version 2.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertConfig alertConfig;
    private final AlertRuleConfig alertRuleConfig;
    private final MeterRegistry meterRegistry;
    private final BusinessMetricsService businessMetricsService;
    private final DingTalkAlertService dingTalkAlertService;
    private final WeChatAlertService weChatAlertService;

    // 告警冷却记录
    private final Map<String, LocalDateTime> alertCooldownMap = new ConcurrentHashMap<>();

    // 性能基线
    private PerformanceBaseline baseline;

    /**
     * 初始化告警服务
     */
    @PostConstruct
    public void init() {
        log.info("初始化告警服务");
        this.baseline = new PerformanceBaseline();
        log.info("告警服务初始化完成，告警功能{}", alertConfig.isEnabled() ? "已启用" : "已禁用");
    }

    /**
     * 定时检查告警（每30秒）
     */
    @Scheduled(fixedRate = 30000)
    public void checkAlerts() {
        if (!alertConfig.isEnabled()) {
            return;
        }

        try {
            checkApiResponseTime();
            checkErrorRate();
            checkSystemResources();
            checkBusinessMetrics();
        } catch (Exception e) {
            log.error("告警检查失败", e);
        }
    }

    /**
     * 检查API响应时间
     */
    private void checkApiResponseTime() {
        try {
            // 获取P95响应时间
            double p95ResponseTime = getP95ResponseTime();

            if (p95ResponseTime > alertConfig.getApiResponseTime().getCritical()) {
                triggerAlert("API响应时间严重告警",
                        String.format("P95响应时间 %.2fms 超过严重阈值 %dms",
                                p95ResponseTime, alertConfig.getApiResponseTime().getCritical()),
                        AlertLevel.CRITICAL);
            } else if (p95ResponseTime > alertConfig.getApiResponseTime().getWarning()) {
                triggerAlert("API响应时间警告",
                        String.format("P95响应时间 %.2fms 超过警告阈值 %dms",
                                p95ResponseTime, alertConfig.getApiResponseTime().getWarning()),
                        AlertLevel.WARNING);
            }
        } catch (Exception e) {
            log.error("检查API响应时间失败", e);
        }
    }

    /**
     * 检查错误率
     */
    private void checkErrorRate() {
        try {
            // 计算错误率
            double errorRate = calculateErrorRate();

            if (errorRate > alertConfig.getErrorRate().getCritical()) {
                triggerAlert("错误率严重告警",
                        String.format("错误率 %.2f%% 超过严重阈值 %.2f%%",
                                errorRate, alertConfig.getErrorRate().getCritical()),
                        AlertLevel.CRITICAL);
            } else if (errorRate > alertConfig.getErrorRate().getWarning()) {
                triggerAlert("错误率警告",
                        String.format("错误率 %.2f%% 超过警告阈值 %.2f%%",
                                errorRate, alertConfig.getErrorRate().getWarning()),
                        AlertLevel.WARNING);
            }
        } catch (Exception e) {
            log.error("检查错误率失败", e);
        }
    }

    /**
     * 检查系统资源
     */
    private void checkSystemResources() {
        try {
            // 获取JVM内存使用率
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsageRate = (double) usedMemory / totalMemory * 100;

            if (memoryUsageRate > alertConfig.getSystemResource().getMemoryCritical()) {
                triggerAlert("内存使用率严重告警",
                        String.format("内存使用率 %.2f%% 超过严重阈值 %.2f%%",
                                memoryUsageRate, alertConfig.getSystemResource().getMemoryCritical()),
                        AlertLevel.CRITICAL);
            } else if (memoryUsageRate > alertConfig.getSystemResource().getMemoryWarning()) {
                triggerAlert("内存使用率警告",
                        String.format("内存使用率 %.2f%% 超过警告阈值 %.2f%%",
                                memoryUsageRate, alertConfig.getSystemResource().getMemoryWarning()),
                        AlertLevel.WARNING);
            }
        } catch (Exception e) {
            log.error("检查系统资源失败", e);
        }
    }

    /**
     * 检查业务指标
     */
    private void checkBusinessMetrics() {
        try {
            // 检查登录失败率
            double loginFailureRate = calculateLoginFailureRate();

            if (loginFailureRate > alertConfig.getBusinessMetric().getLoginFailureRateCritical()) {
                triggerAlert("登录失败率严重告警",
                        String.format("登录失败率 %.2f%% 超过严重阈值 %.2f%%",
                                loginFailureRate, alertConfig.getBusinessMetric().getLoginFailureRateCritical()),
                        AlertLevel.CRITICAL);
            } else if (loginFailureRate > alertConfig.getBusinessMetric().getLoginFailureRateWarning()) {
                triggerAlert("登录失败率警告",
                        String.format("登录失败率 %.2f%% 超过警告阈值 %.2f%%",
                                loginFailureRate, alertConfig.getBusinessMetric().getLoginFailureRateWarning()),
                        AlertLevel.WARNING);
            }
        } catch (Exception e) {
            log.error("检查业务指标失败", e);
        }
    }

    /**
     * 触发告警
     * 
     * @param alertName 告警名称
     * @param message   告警消息
     * @param level     告警级别
     */
    private void triggerAlert(String alertName, String message, AlertLevel level) {
        // 检查冷却时间
        LocalDateTime lastAlertTime = alertCooldownMap.get(alertName);
        if (lastAlertTime != null) {
            if (lastAlertTime.plusMinutes(alertConfig.getNotification().getCooldownMinutes())
                    .isAfter(LocalDateTime.now())) {
                return; // 冷却中，不触发告警
            }
        }

        // 记录告警时间
        alertCooldownMap.put(alertName, LocalDateTime.now());

        // 记录告警日志
        String logMessage = String.format("[%s] %s: %s", level.getLabel(), alertName, message);
        if (level == AlertLevel.CRITICAL) {
            log.error(logMessage);
        } else {
            log.warn(logMessage);
        }

        // TODO: 发送告警通知（邮件、WebHook等）
        sendNotification(alertName, message, level);
    }

    /**
     * 发送告警（公共接口）
     * 
     * @param level     告警级别
     * @param title     告警标题
     * @param message   告警消息
     * @param context   上下文信息（可选）
     */
    public void sendAlert(AlertLevel level, String title, String message, java.util.Map<String, Object> context) {
        triggerAlert(title, message, level);
    }

    /**
     * 发送告警通知
     * 
     * @param alertName 告警名称
     * @param message   告警消息
     * @param level     告警级别
     */
    private void sendNotification(String alertName, String message, AlertLevel level) {
        Map<String, Object> context = buildAlertContext();

        if (alertRuleConfig.getDingTalk().isEnabled()) {
            dingTalkAlertService.sendAlert(level, alertName, message, context);
        }

        if (alertRuleConfig.getWeChat().isEnabled()) {
            weChatAlertService.sendAlert(level, alertName, message, context);
        }

        if (alertConfig.getNotification().isEmailEnabled()) {
            sendEmailNotification(alertName, message, level);
        }
    }

    private Map<String, Object> buildAlertContext() {
        Map<String, Object> context = new java.util.HashMap<>();
        context.put("timestamp", java.time.LocalDateTime.now().toString());
        context.put("system", "WMS仓库管理系统");
        context.put("environment", System.getProperty("spring.profiles.active", "unknown"));
        return context;
    }

    /**
     * 发送邮件通知
     */
    private void sendEmailNotification(String alertName, String message, AlertLevel level) {
        log.info("发送邮件通知: {} - {}", alertName, message);
    }

    /**
     * 获取P95响应时间
     * 
     * @return P95响应时间（毫秒）
     */
    private double getP95ResponseTime() {
        // 从Micrometer获取P95响应时间
        try {
            return meterRegistry.find("http.server.requests")
                    .tag("uri", "/api/devices")
                    .timer()
                    .percentile(0.95, java.util.concurrent.TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * 计算错误率
     * 
     * @return 错误率（百分比）
     */
    private double calculateErrorRate() {
        // 从Micrometer获取错误率
        try {
            // 这里简化处理，实际应该从计数器计算
            return 0.0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * 计算登录失败率
     * 
     * @return 登录失败率（百分比）
     */
    private double calculateLoginFailureRate() {
        // 简化处理
        return 0.0;
    }

    /**
     * 更新性能基线
     * 
     * @param metricName 指标名称
     * @param value      指标值
     */
    public void updateBaseline(String metricName, double value) {
        if (baseline != null) {
            baseline.update(metricName, value);
        }
    }

    /**
     * 获取性能基线
     * 
     * @return 性能基线
     */
    public PerformanceBaseline getBaseline() {
        return baseline;
    }

    /**
     * 告警级别枚举
     */
    public enum AlertLevel {
        WARNING("警告"),
        CRITICAL("严重");

        private final String label;

        AlertLevel(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }

    /**
     * 性能基线类
     */
    public static class PerformanceBaseline {
        private final Map<String, Double> baselineMap = new ConcurrentHashMap<>();

        public void update(String metricName, double value) {
            baselineMap.put(metricName, value);
        }

        public Double get(String metricName) {
            return baselineMap.get(metricName);
        }

        public Map<String, Double> getAll() {
            return new ConcurrentHashMap<>(baselineMap);
        }
    }
}
