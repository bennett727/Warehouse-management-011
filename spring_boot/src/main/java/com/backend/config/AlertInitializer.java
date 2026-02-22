package com.backend.config;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

/**
 * 告警初始化器
 *
 * 功能说明：
 * 在Spring上下文初始化完成后，设置AlertLogAppender的ApplicationContext
 * 确保告警服务可以正常工作
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Component
public class AlertInitializer implements ApplicationListener<ContextRefreshedEvent> {

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        ApplicationContext applicationContext = event.getApplicationContext();
        AlertLogAppender.setApplicationContext(applicationContext);
    }
}
