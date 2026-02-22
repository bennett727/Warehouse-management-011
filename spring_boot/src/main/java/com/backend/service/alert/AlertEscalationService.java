package com.backend.service.alert;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 告警升级服务
 *
 * 功能说明：
 * 当告警持续未处理时，自动升级通知级别和频率
 *
 * 升级规则：
 * - Level 1 (0-15分钟): 正常告警，发送给相关人员
 * - Level 2 (15-30分钟): 升级告警，增加通知频率，@所有人
 * - Level 3 (30-60分钟): 严重升级，通知管理层
 * - Level 4 (60分钟+): 最高级别，电话通知
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertEscalationService {

    private final AlertService alertService;
    private final DingTalkAlertService dingTalkAlertService;
    private final WeChatAlertService weChatAlertService;

    private final Map<String, AlertEscalation> escalationMap = new ConcurrentHashMap<>();

    private static final int LEVEL_1_THRESHOLD_MINUTES = 0;
    private static final int LEVEL_2_THRESHOLD_MINUTES = 15;
    private static final int LEVEL_3_THRESHOLD_MINUTES = 30;
    private static final int LEVEL_4_THRESHOLD_MINUTES = 60;

    private static final int[] ESCALATION_INTERVALS = {5, 10, 15, 30};

    public void recordAlert(String alertKey, String alertName, String message, AlertService.AlertLevel level) {
        AlertEscalation escalation = escalationMap.computeIfAbsent(alertKey, k -> new AlertEscalation(alertName, message, level));
        escalation.setLastAlertTime(LocalDateTime.now());
        escalation.incrementAlertCount();

        log.debug("记录告警: {} - 次数: {}, 级别: {}", alertName, escalation.getAlertCount(), escalation.getCurrentLevel());
    }

    public void acknowledgeAlert(String alertKey) {
        AlertEscalation escalation = escalationMap.remove(alertKey);
        if (escalation != null) {
            log.info("告警已确认: {} - 持续时间: {}分钟", 
                    escalation.getAlertName(), 
                    Duration.between(escalation.getFirstAlertTime(), LocalDateTime.now()).toMinutes());
        }
    }

    public void resolveAlert(String alertKey, String resolvedBy) {
        AlertEscalation escalation = escalationMap.remove(alertKey);
        if (escalation != null) {
            long durationMinutes = Duration.between(escalation.getFirstAlertTime(), LocalDateTime.now()).toMinutes();
            log.info("告警已解决: {} - 解决人: {}, 持续时间: {}分钟, 告警次数: {}", 
                    escalation.getAlertName(), resolvedBy, durationMinutes, escalation.getAlertCount());
        }
    }

    @Scheduled(fixedRate = 60000)
    public void checkEscalations() {
        LocalDateTime now = LocalDateTime.now();

        escalationMap.forEach((alertKey, escalation) -> {
            int currentLevel = calculateEscalationLevel(escalation, now);

            if (currentLevel > escalation.getCurrentLevel()) {
                escalateAlert(alertKey, escalation, currentLevel);
            }

            if (shouldSendEscalationNotification(escalation, now, currentLevel)) {
                sendEscalationNotification(escalation, currentLevel);
                escalation.setLastNotificationTime(now);
            }
        });
    }

    private int calculateEscalationLevel(AlertEscalation escalation, LocalDateTime now) {
        long minutesSinceFirstAlert = Duration.between(escalation.getFirstAlertTime(), now).toMinutes();

        if (minutesSinceFirstAlert >= LEVEL_4_THRESHOLD_MINUTES) {
            return 4;
        } else if (minutesSinceFirstAlert >= LEVEL_3_THRESHOLD_MINUTES) {
            return 3;
        } else if (minutesSinceFirstAlert >= LEVEL_2_THRESHOLD_MINUTES) {
            return 2;
        }
        return 1;
    }

    private boolean shouldSendEscalationNotification(AlertEscalation escalation, LocalDateTime now, int currentLevel) {
        if (escalation.getLastNotificationTime() == null) {
            return true;
        }

        long minutesSinceLastNotification = Duration.between(escalation.getLastNotificationTime(), now).toMinutes();
        int interval = ESCALATION_INTERVALS[Math.min(currentLevel - 1, ESCALATION_INTERVALS.length - 1)];

        return minutesSinceLastNotification >= interval;
    }

    private void escalateAlert(String alertKey, AlertEscalation escalation, int newLevel) {
        int oldLevel = escalation.getCurrentLevel();
        escalation.setCurrentLevel(newLevel);

        log.warn("告警升级: {} - 从级别{}升级到级别{} - 持续时间: {}分钟", 
                escalation.getAlertName(), oldLevel, newLevel,
                Duration.between(escalation.getFirstAlertTime(), LocalDateTime.now()).toMinutes());

        sendEscalationNotification(escalation, newLevel);
    }

    private void sendEscalationNotification(AlertEscalation escalation, int level) {
        String levelText = getEscalationLevelText(level);
        String title = String.format("【%s】%s", levelText, escalation.getAlertName());
        
        StringBuilder message = new StringBuilder();
        message.append("告警升级通知\n\n");
        message.append("告警名称: ").append(escalation.getAlertName()).append("\n");
        message.append("升级级别: ").append(levelText).append("\n");
        message.append("告警次数: ").append(escalation.getAlertCount()).append("\n");
        message.append("持续时间: ").append(Duration.between(escalation.getFirstAlertTime(), LocalDateTime.now()).toMinutes()).append("分钟\n");
        message.append("原始消息: ").append(escalation.getMessage());

        AlertService.AlertLevel alertLevel = level >= 3 ? AlertService.AlertLevel.CRITICAL : AlertService.AlertLevel.WARNING;

        Map<String, Object> context = Map.of(
                "escalationLevel", level,
                "alertCount", escalation.getAlertCount(),
                "duration", Duration.between(escalation.getFirstAlertTime(), LocalDateTime.now()).toMinutes()
        );

        dingTalkAlertService.sendAlert(alertLevel, title, message.toString(), context);
        weChatAlertService.sendAlert(alertLevel, title, message.toString(), context);
    }

    private String getEscalationLevelText(int level) {
        return switch (level) {
            case 1 -> "一级告警";
            case 2 -> "二级告警-升级";
            case 3 -> "三级告警-严重";
            case 4 -> "四级告警-紧急";
            default -> "未知级别";
        };
    }

    public Map<String, AlertEscalation> getActiveEscalations() {
        return new ConcurrentHashMap<>(escalationMap);
    }

    public int getActiveEscalationCount() {
        return escalationMap.size();
    }

    public void clearAllEscalations() {
        escalationMap.clear();
        log.info("已清除所有告警升级记录");
    }

    public static class AlertEscalation {
        private final String alertName;
        private final String message;
        private final AlertService.AlertLevel originalLevel;
        private final LocalDateTime firstAlertTime;
        private LocalDateTime lastAlertTime;
        private LocalDateTime lastNotificationTime;
        private int alertCount = 0;
        private int currentLevel = 1;

        public AlertEscalation(String alertName, String message, AlertService.AlertLevel originalLevel) {
            this.alertName = alertName;
            this.message = message;
            this.originalLevel = originalLevel;
            this.firstAlertTime = LocalDateTime.now();
            this.lastAlertTime = this.firstAlertTime;
        }

        public String getAlertName() {
            return alertName;
        }

        public String getMessage() {
            return message;
        }

        public AlertService.AlertLevel getOriginalLevel() {
            return originalLevel;
        }

        public LocalDateTime getFirstAlertTime() {
            return firstAlertTime;
        }

        public LocalDateTime getLastAlertTime() {
            return lastAlertTime;
        }

        public void setLastAlertTime(LocalDateTime lastAlertTime) {
            this.lastAlertTime = lastAlertTime;
        }

        public LocalDateTime getLastNotificationTime() {
            return lastNotificationTime;
        }

        public void setLastNotificationTime(LocalDateTime lastNotificationTime) {
            this.lastNotificationTime = lastNotificationTime;
        }

        public int getAlertCount() {
            return alertCount;
        }

        public void incrementAlertCount() {
            this.alertCount++;
        }

        public int getCurrentLevel() {
            return currentLevel;
        }

        public void setCurrentLevel(int currentLevel) {
            this.currentLevel = currentLevel;
        }
    }
}
