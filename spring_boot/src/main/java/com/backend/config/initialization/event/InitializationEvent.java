/*
 * @file: InitializationEvent.java
 * @description: 初始化事件 - 用于在初始化过程中发布事件
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.event;

import org.springframework.context.ApplicationEvent;

import com.backend.config.initialization.model.InitStatus;

/**
 * 初始化事件
 *
 * 功能说明：
 * 在应用程序初始化过程中发布的事件，用于通知监听器
 * 初始化状态的变化。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
public class InitializationEvent extends ApplicationEvent {

    private static final long serialVersionUID = 1L;

    private final InitStatus status;
    private final String message;

    /**
     * 创建初始化事件
     *
     * @param source  事件源
     * @param status  初始化状态
     * @param message 事件消息
     */
    public InitializationEvent(Object source, InitStatus status, String message) {
        super(source);
        this.status = status;
        this.message = message;
    }

    /**
     * 获取初始化状态
     */
    public InitStatus getStatus() {
        return status;
    }

    /**
     * 获取事件消息
     */
    public String getMessage() {
        return message;
    }
}
