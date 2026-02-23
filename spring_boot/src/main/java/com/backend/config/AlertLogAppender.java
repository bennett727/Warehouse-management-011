package com.backend.config;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.MDC;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import com.backend.service.alert.AlertService;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.ThrowableProxy;
import ch.qos.logback.core.AppenderBase;

/**
 * 错误日志告警Appender
 *
 * 功能说明：
 * 当发生ERROR级别日志时，自动发送告警通知
 * 通过AlertService统一处理告警发送
 *
 * 特性：
 * - 支持多种告警渠道（钉钉、企业微信、邮件）
 * - 告警频率控制
 * - 异步发送，不阻塞主流程
 * - 支持TraceId链路追踪
 *
 * @author 后端开发团队
 * @version 2.0
 * @since 2026-02-19
 */
@Component
public class AlertLogAppender extends AppenderBase<ILoggingEvent> {

    private final ExecutorService executorService = Executors.newFixedThreadPool(2);
    private final Map<String, Long> lastAlertTimeMap = new ConcurrentHashMap<>();
    private static final long DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

    private static ApplicationContext applicationContext;
    private static volatile boolean initialized = false;

    public static void setApplicationContext(ApplicationContext ctx) {
        applicationContext = ctx;
        initialized = true;
    }

    @Override
    protected void append(ILoggingEvent event) {
        if (event.getLevel() != Level.ERROR) {
            return;
        }

        String loggerName = event.getLoggerName();
        String alertKey = loggerName + ":" + event.getFormattedMessage().hashCode();

        if (!shouldSendAlert(alertKey)) {
            return;
        }

        @SuppressWarnings("java:S2144")
        var future = executorService.submit(() -> processAlert(event));
    }

    private boolean shouldSendAlert(String alertKey) {
        long currentTime = System.currentTimeMillis();
        Long lastTime = lastAlertTimeMap.get(alertKey);

        if (lastTime == null || currentTime - lastTime > DEFAULT_COOLDOWN_MS) {
            lastAlertTimeMap.put(alertKey, currentTime);
            return true;
        }
        return false;
    }

    private void processAlert(ILoggingEvent event) {
        try {
            if (!initialized || applicationContext == null) {
                sendAlertDirectly(event);
                return;
            }

            AlertService alertService = applicationContext.getBean(AlertService.class);
            AlertRuleConfig alertRuleConfig = applicationContext.getBean(AlertRuleConfig.class);

            if (!alertRuleConfig.isEnabled()) {
                return;
            }

            String message = event.getFormattedMessage();
            String stackTrace = null;

            if (event.getThrowableProxy() != null) {
                ThrowableProxy proxy = (ThrowableProxy) event.getThrowableProxy();
                stackTrace = buildStackTrace(proxy);
            }

            Map<String, Object> context = buildContext(event);

            boolean isCritical = isCriticalError(event);
            AlertService.AlertLevel level = isCritical ? AlertService.AlertLevel.CRITICAL : AlertService.AlertLevel.WARNING;
            String fullMessage = stackTrace != null ? message + "\n" + stackTrace : message;
            alertService.sendAlert(level, "系统错误告警", fullMessage, context);

        } catch (Exception e) {
            addError("处理告警失败", e);
        }
    }

    private void sendAlertDirectly(ILoggingEvent event) {
        addInfo("AlertService未初始化，跳过告警: " + event.getFormattedMessage());
    }

    private String buildStackTrace(ThrowableProxy proxy) {
        StringBuilder sb = new StringBuilder();
        sb.append(proxy.getClassName()).append(": ").append(proxy.getMessage());
        return sb.toString();
    }

    private Map<String, Object> buildContext(ILoggingEvent event) {
        Map<String, Object> context = new HashMap<>();
        context.put("logger", event.getLoggerName());
        context.put("thread", event.getThreadName());
        context.put("level", event.getLevel().toString());

        String traceId = MDC.get(TraceIdFilter.TRACE_ID_MDC_KEY);
        if (traceId != null) {
            context.put("traceId", traceId);
        }

        String userId = MDC.get(TraceIdFilter.USER_ID_MDC_KEY);
        if (userId != null) {
            context.put("userId", userId);
        }

        String clientIp = MDC.get(TraceIdFilter.CLIENT_IP_MDC_KEY);
        if (clientIp != null) {
            context.put("clientIp", clientIp);
        }

        return context;
    }

    private boolean isCriticalError(ILoggingEvent event) {
        String message = event.getFormattedMessage();
        String loggerName = event.getLoggerName();

        if (message == null) {
            return false;
        }

        String[] criticalPatterns = {
                "OutOfMemoryError",
                "StackOverflowError",
                "DatabaseConnectionFailed",
                "ConnectionPoolExhausted",
                "DiskFull",
                "ServiceUnavailable"
        };

        for (String pattern : criticalPatterns) {
            if (message.contains(pattern)) {
                return true;
            }
        }

        if (event.getThrowableProxy() != null) {
            ThrowableProxy proxy = (ThrowableProxy) event.getThrowableProxy();
            String className = proxy.getClassName();
            for (String pattern : criticalPatterns) {
                if (className.contains(pattern)) {
                    return true;
                }
            }
        }

        return false;
    }

    @Override
    public void stop() {
        super.stop();
        executorService.shutdown();
    }
}
