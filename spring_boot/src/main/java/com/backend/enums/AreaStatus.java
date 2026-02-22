/*
 * @file: AreaStatus.java
 * @description: 区域状态枚举
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0.0
 */
package com.backend.enums;

public enum AreaStatus {
    DISABLED(0, "禁用"),
    ACTIVE(1, "启用");

    private final int code;
    private final String description;

    AreaStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static AreaStatus fromCode(int code) {
        for (AreaStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid area status code: " + code);
    }
}
