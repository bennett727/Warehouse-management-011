package com.backend.config;

import ch.qos.logback.classic.PatternLayout;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.LayoutBase;

import com.backend.util.LogDesensitizationUtil;

/**
 * 脱敏日志布局类
 *
 * 功能说明：
 * 在日志输出前对敏感信息进行脱敏处理
 *
 * 使用方式：
 * 在logback-spring.xml中配置使用此布局类
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
public class DesensitizationLayout extends LayoutBase<ILoggingEvent> {

    private PatternLayout delegate;
    private boolean desensitizationEnabled = true;

    public void setPattern(String pattern) {
        if (delegate == null) {
            delegate = new PatternLayout();
        }
        delegate.setPattern(pattern);
    }

    public void setDesensitizationEnabled(boolean enabled) {
        this.desensitizationEnabled = enabled;
    }

    @Override
    public void start() {
        if (delegate == null) {
            delegate = new PatternLayout();
            delegate.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n");
        }
        delegate.setContext(context);
        delegate.start();
        super.start();
    }

    @Override
    public void stop() {
        if (delegate != null) {
            delegate.stop();
        }
        super.stop();
    }

    @Override
    public String doLayout(ILoggingEvent event) {
        String formattedMessage = delegate.doLayout(event);

        if (desensitizationEnabled) {
            return LogDesensitizationUtil.desensitize(formattedMessage);
        }

        return formattedMessage;
    }
}
