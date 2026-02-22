package com.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 告警规则配置类
 *
 * 功能说明：
 * 统一管理系统告警规则配置，支持多种告警渠道和灵活的告警规则
 *
 * 配置方式：
 * 1. application.properties 配置文件
 * 2. 环境变量覆盖
 *
 * 支持的告警渠道：
 * - 钉钉
 * - 企业微信
 * - 邮件
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "alert.rule")
public class AlertRuleConfig {

    private boolean enabled = true;

    private DingTalk dingTalk = new DingTalk();

    private WeChat weChat = new WeChat();

    private Email email = new Email();

    private List<AlertRule> rules = new ArrayList<>();

    private int defaultCooldownMinutes = 5;

    private int maxAlertsPerHour = 100;

    @Data
    public static class DingTalk {
        private boolean enabled = false;
        private String webhook;
        private String secret;
        private String atMobiles;
        private String atUserIds;
        private boolean atAll = false;
    }

    @Data
    public static class WeChat {
        private boolean enabled = false;
        private String webhook;
        private String mentionedList;
        private String mentionedMobileList;
    }

    @Data
    public static class Email {
        private boolean enabled = false;
        private List<String> recipients = new ArrayList<>();
        private String subjectPrefix = "[WMS告警]";
    }

    @Data
    public static class AlertRule {
        private String name;
        private String description;
        private String errorPattern;
        private int threshold = 5;
        private int timeWindowMinutes = 5;
        private List<String> channels = new ArrayList<>();
        private int cooldownMinutes = 5;
        private AlertLevel level = AlertLevel.ERROR;
        private String alertLevel = "ERROR";
        private boolean enabled = true;
        private Map<String, Object> metadata = new HashMap<>();
    }

    public enum AlertLevel {
        INFO("信息", "🔵"),
        WARNING("警告", "🟡"),
        ERROR("错误", "🔴"),
        CRITICAL("严重", "🚨");

        private final String displayName;
        private final String icon;

        AlertLevel(String displayName, String icon) {
            this.displayName = displayName;
            this.icon = icon;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getIcon() {
            return icon;
        }
    }

    public static AlertRule createDefaultErrorRule() {
        AlertRule rule = new AlertRule();
        rule.setName("默认错误告警");
        rule.setErrorPattern(".*ERROR.*");
        rule.setThreshold(5);
        rule.setTimeWindowMinutes(5);
        rule.setCooldownMinutes(5);
        rule.setLevel(AlertLevel.ERROR);
        rule.setEnabled(true);
        return rule;
    }

    public static AlertRule createDefaultCriticalRule() {
        AlertRule rule = new AlertRule();
        rule.setName("严重错误告警");
        rule.setErrorPattern(".*(OutOfMemoryError|StackOverflowError|DatabaseConnectionFailed).*");
        rule.setThreshold(1);
        rule.setTimeWindowMinutes(1);
        rule.setCooldownMinutes(10);
        rule.setLevel(AlertLevel.CRITICAL);
        rule.setEnabled(true);
        return rule;
    }

    public static AlertRule createBusinessErrorRule() {
        AlertRule rule = new AlertRule();
        rule.setName("业务异常告警");
        rule.setErrorPattern(".*BusinessException.*");
        rule.setThreshold(10);
        rule.setTimeWindowMinutes(10);
        rule.setCooldownMinutes(5);
        rule.setLevel(AlertLevel.WARNING);
        rule.setEnabled(true);
        return rule;
    }
}
