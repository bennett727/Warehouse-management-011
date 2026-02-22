/*
 * @file: DeviceStatus.java
 * @description: 设备状态枚举（优化版）
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 2.0.0
 */
package com.backend.enums;

/**
 * 设备生命周期状态枚举（优化版）
 * 简化为5种核心状态，简化业务复杂度
 *
 * 状态流转：待入库(-1) → 在库(0) → 使用中(1) → 维护中(2) → 已报废(3)
 */
public enum DeviceStatus {
    PENDING_INBOUND(-1, "待入库"),   // 采购后、入库前
    IN_STOCK(0, "在库"),             // 库存中可领用
    IN_USE(1, "使用中"),             // 已安装并运行（合并原"使用中"和"已安装"）
    MAINTENANCE(2, "维护中"),        // 计划维护或故障维修（合并原"维护中"和"维修中"）
    SCRAPPED(3, "已报废"),           // 生命周期结束
    UNDER_REPAIR(4, "维修中"),       // 修复出库中的设备
    NORMAL(5, "正常");               // 正常状态（用于修复完成）

    private final int code;
    private final String description;

    DeviceStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static DeviceStatus fromCode(int code) {
        for (DeviceStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid device status code: " + code);
    }

    /**
     * 检查状态是否为有效状态（用于数据迁移后的验证）
     */
    public static boolean isValidCode(int code) {
        for (DeviceStatus status : values()) {
            if (status.code == code) {
                return true;
            }
        }
        return false;
    }
}
