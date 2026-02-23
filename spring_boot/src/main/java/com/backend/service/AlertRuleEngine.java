package com.backend.service;

import com.backend.config.AlertConfig;
import com.backend.config.AlertConfig.AlertLevel;
import com.backend.config.AlertConfig.AlertRule;
import com.backend.service.alert.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 告警规则引擎
 *
 * 功能说明：
 * 根据预定义的规则匹配错误信息，决定是否发送告警
 *
 * 规则类型：
 * - 错误模式匹配：基于正则表达式匹配错误消息
 * - 频率阈值：基于错误出现频率触发告警
 * - 时间窗口：在特定时间段内聚合错误
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertRuleEngine {

    private final AlertConfig alertConfig;
    private final AlertService alertService;

    private final Map<String, ErrorCounter> errorCounters = new java.util.concurrent.ConcurrentHashMap<>();

    @Async
    public void evaluateError(String errorMessage, String stackTrace, Map<String, Object> context) {
        if (!alertConfig.isEnabled()) {
            return;
        }

        List<AlertRule> matchedRules = matchRules(errorMessage, stackTrace);

        if (matchedRules.isEmpty()) {
            return;
        }

        for (AlertRule rule : matchedRules) {
            processRule(rule, errorMessage, context);
        }
    }

    public List<AlertRule> matchRules(String errorMessage, String stackTrace) {
        List<AlertRule> matchedRules = new ArrayList<>();

        for (AlertRule rule : alertConfig.getRules()) {
            if (!rule.isEnabled()) {
                continue;
            }

            if (matchesRule(errorMessage, stackTrace, rule)) {
                matchedRules.add(rule);
            }
        }

        return matchedRules;
    }

    private boolean matchesRule(String errorMessage, String stackTrace, AlertRule rule) {
        try {
            Pattern pattern = Pattern.compile(rule.getErrorPattern(), Pattern.CASE_INSENSITIVE);

            if (errorMessage != null && pattern.matcher(errorMessage).find()) {
                return true;
            }

            if (stackTrace != null && pattern.matcher(stackTrace).find()) {
                return true;
            }

        } catch (Exception e) {
            log.warn("规则匹配失败 [{}]: {}", rule.getName(), e.getMessage());
        }

        return false;
    }

    private void processRule(AlertRule rule, String errorMessage, Map<String, Object> context) {
        String ruleKey = rule.getName();

        ErrorCounter counter = errorCounters.computeIfAbsent(ruleKey, k -> new ErrorCounter());

        counter.increment();

        if (shouldTriggerAlert(rule, counter)) {
            triggerAlert(rule, errorMessage, context);
            counter.reset();
        }
    }

    private boolean shouldTriggerAlert(AlertRule rule, ErrorCounter counter) {
        int threshold = rule.getThreshold();
        if (threshold <= 0) {
            return true;
        }

        return counter.getCount() >= threshold;
    }

    private void triggerAlert(AlertRule rule, String errorMessage, Map<String, Object> context) {
        AlertService.AlertLevel level = determineAlertLevel(rule);

        String title = buildAlertTitle(rule);

        String message = buildAlertMessage(rule, errorMessage);

        Map<String, Object> enrichedContext = enrichContext(context, rule);

        alertService.sendAlert(level, title, message, enrichedContext);

        log.info("告警已触发 [规则: {}] [级别: {}]", rule.getName(), level);
    }

    private AlertService.AlertLevel determineAlertLevel(AlertRule rule) {
        try {
            String levelStr = rule.getAlertLevel();
            if ("CRITICAL".equalsIgnoreCase(levelStr)) {
                return AlertService.AlertLevel.CRITICAL;
            }
            return AlertService.AlertLevel.WARNING;
        } catch (Exception e) {
            return AlertService.AlertLevel.CRITICAL;
        }
    }

    private String buildAlertTitle(AlertRule rule) {
        return "规则告警: " + rule.getName();
    }

    private String buildAlertMessage(AlertRule rule, String errorMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("规则: ").append(rule.getName()).append("\n");
        sb.append("描述: ").append(rule.getDescription()).append("\n");
        sb.append("错误: ").append(errorMessage);

        return sb.toString();
    }

    private Map<String, Object> enrichContext(Map<String, Object> context, AlertRule rule) {
        Map<String, Object> enriched = new java.util.HashMap<>(context);
        enriched.put("ruleName", rule.getName());
        enriched.put("ruleDescription", rule.getDescription());
        enriched.put("ruleThreshold", rule.getThreshold());
        return enriched;
    }

    public void addDynamicRule(AlertRule rule) {
        List<AlertRule> rules = new ArrayList<>(alertConfig.getRules());
        rules.add(rule);
        alertConfig.setRules(rules);
        log.info("动态添加告警规则: {}", rule.getName());
    }

    public void removeDynamicRule(String ruleName) {
        List<AlertRule> rules = new ArrayList<>(alertConfig.getRules());
        rules.removeIf(r -> r.getName().equals(ruleName));
        alertConfig.setRules(rules);
        log.info("移除告警规则: {}", ruleName);
    }

    public List<AlertRule> getActiveRules() {
        return alertConfig.getRules().stream()
                .filter(AlertRule::isEnabled)
                .toList();
    }

    public void resetCounters() {
        errorCounters.clear();
        log.info("告警计数器已重置");
    }

    private static class ErrorCounter {
        private int count = 0;
        private long firstOccurrence = System.currentTimeMillis();

        public synchronized void increment() {
            count++;
        }

        public synchronized int getCount() {
            return count;
        }

        public synchronized long getFirstOccurrence() {
            return firstOccurrence;
        }

public synchronized void reset() {
            count = 0;
            firstOccurrence = System.currentTimeMillis();
        }
    }
}
