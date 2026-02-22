/*
 * @file: InitializationEventPublisher.java
 * @description: 初始化事件发布器 - 发布初始化相关事件
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import com.backend.config.initialization.model.InitStatus;

/**
 * 初始化事件发布器
 *
 * 功能说明：
 * 负责发布应用程序初始化过程中的各种事件，便于
 * 其他组件监听和响应初始化状态变化。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Component
public class InitializationEventPublisher {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * 发布初始化事件
     *
     * @param source  事件源
     * @param status  初始化状态
     * @param message 事件消息
     */
    public void publishEvent(Object source, InitStatus status, String message) {
        InitializationEvent event = new InitializationEvent(source, status, message);
        eventPublisher.publishEvent(event);
    }

    /**
     * 发布初始化开始事件
     */
    public void publishStartedEvent(Object source) {
        publishEvent(source, InitStatus.STARTED, "系统初始化开始");
    }

    /**
     * 发布初始化完成事件
     */
    public void publishCompletedEvent(Object source) {
        publishEvent(source, InitStatus.COMPLETED, "系统初始化完成");
    }

    /**
     * 发布初始化失败事件
     */
    public void publishFailedEvent(Object source, String errorMessage) {
        publishEvent(source, InitStatus.FAILED, "系统初始化失败: " + errorMessage);
    }
}
