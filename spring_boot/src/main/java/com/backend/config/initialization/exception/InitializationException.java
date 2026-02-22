/*
 * @file: InitializationException.java
 * @description: 初始化异常 - 初始化过程中的自定义异常
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.exception;

/**
 * 初始化异常
 *
 * 功能说明：
 * 在应用程序初始化过程中抛出的自定义异常，用于
 * 标识和处理初始化相关的错误。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
public class InitializationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String stepName;

    /**
     * 创建初始化异常
     *
     * @param message 异常消息
     */
    public InitializationException(String message) {
        super(message);
        this.stepName = null;
    }

/**
     * 创建初始化异常
     *
     * @param stepName 初始化步骤名称
     * @param message  异常消息
     */
    public InitializationException(String stepName, String message) {
        super(message);
        this.stepName = stepName;
    }

    /**
     * 创建初始化异常
     *
     * @param stepName 初始化步骤名称
     * @param message  异常消息
     * @param cause    异常原因
     */
    public InitializationException(String stepName, String message, Throwable cause) {
        super(message, cause);
        this.stepName = stepName;
    }

    /**
     * 创建初始化异常
     *
     * @param message 异常消息
     * @param cause   异常原因
     */
    public InitializationException(String message, Throwable cause) {
        super(message, cause);
        this.stepName = null;
    }

    /**
     * 获取初始化步骤名称
     */
    public String getStepName() {
        return stepName;
    }
}
