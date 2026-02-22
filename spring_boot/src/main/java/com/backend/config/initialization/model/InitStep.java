/*
 * @file: InitStep.java
 * @description: 初始化步骤 - 定义单个初始化步骤的信息
 * @author: 系统架构团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.config.initialization.model;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * 初始化步骤
 *
 * 功能说明：
 * 定义单个初始化步骤的详细信息，包括步骤名称、
 * 描述、状态和执行时间。
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Data
public class InitStep {

    /**
     * 步骤名称
     */
    private String name;

    /**
     * 步骤描述
     */
    private String description;

    /**
     * 步骤状态
     */
    private InitStatus status;

    /**
     * 步骤序号
     */
    private int stepNumber;

    /**
     * 总步骤数
     */
    private int totalSteps;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 执行耗时(毫秒)
     */
    private long duration;

    /**
     * 默认构造方法
     */
    public InitStep() {
        this.status = InitStatus.STARTED;
        this.startTime = LocalDateTime.now();
    }

    /**
     * 创建初始化步骤
     *
     * @param name        步骤名称
     * @param description 步骤描述
     * @param stepNumber  步骤序号
     */
    public InitStep(String name, String description, int stepNumber) {
        this.name = name;
        this.description = description;
        this.stepNumber = stepNumber;
        this.status = InitStatus.STARTED;
        this.startTime = LocalDateTime.now();
    }

    /**
     * 创建初始化步骤（简化版）
     *
     * @param name       步骤名称
     * @param stepNumber 步骤序号
     * @param totalSteps 总步骤数
     */
    public InitStep(String name, int stepNumber, int totalSteps) {
        this.name = name;
        this.description = name;
        this.stepNumber = stepNumber;
        this.totalSteps = totalSteps;
        this.status = InitStatus.STARTED;
        this.startTime = LocalDateTime.now();
    }

    /**
     * 完成步骤
     *
     * @param duration 执行耗时
     */
    public void complete(long duration) {
        this.duration = duration;
        this.endTime = LocalDateTime.now();
        this.status = InitStatus.COMPLETED;
    }

    /**
     * 标记失败
     */
    public void fail() {
        this.endTime = LocalDateTime.now();
        this.status = InitStatus.FAILED;
    }

    /**
     * 标记跳过
     */
    public void skip() {
        this.endTime = LocalDateTime.now();
        this.status = InitStatus.SKIPPED;
    }
}
