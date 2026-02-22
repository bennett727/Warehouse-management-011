/*
 * @file: InitStatus.java
 * @description: 初始化状态枚举 - 定义初始化过程的各种状态
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.model;

/**
 * 初始化状态枚举
 *
 * 功能说明：
 * 定义应用程序初始化过程中的各种状态，用于
 * 跟踪和监控初始化进度。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
public enum InitStatus {

    /**
     * 初始化已开始
     */
    STARTED("已开始"),

    /**
     * 初始化进行中
     */
    IN_PROGRESS("进行中"),

    /**
     * 初始化已完成
     */
    COMPLETED("已完成"),

    /**
     * 初始化失败
     */
    FAILED("失败"),

    /**
     * 初始化已跳过
     */
    SKIPPED("已跳过");

    private final String description;

    InitStatus(String description) {
        this.description = description;
    }

    /**
     * 获取状态描述
     */
    public String getDescription() {
        return description;
    }
}
