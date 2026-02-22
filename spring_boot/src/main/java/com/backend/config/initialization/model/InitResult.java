/*
 * @file: InitResult.java
 * @description: 初始化结果 - 封装初始化步骤的执行结果
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.model;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * 初始化结果
 *
 * 功能说明：
 * 封装单个初始化步骤的执行结果，包括步骤名称、
 * 执行状态、耗时和消息。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Data
public class InitResult {

    /**
     * 初始化步骤名称
     */
    private String stepName;

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 执行耗时(毫秒)
     */
    private long duration;

    /**
     * 结果消息
     */
    private String message;

    /**
     * 时间戳
     */
    private LocalDateTime timestamp;

    /**
     * 默认构造方法
     */
    public InitResult() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 创建初始化结果
     *
     * @param stepName 步骤名称
     * @param success  是否成功
     * @param duration 执行耗时
     * @param message  结果消息
     */
    public InitResult(String stepName, boolean success, long duration, String message) {
        this.stepName = stepName;
        this.success = success;
        this.duration = duration;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 判断是否成功
     */
    public boolean isSuccess() {
        return success;
    }
}
