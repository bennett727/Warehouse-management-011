/*
 * @file: StockOrderStatus.java
 * @description: 库存订单状态枚举
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0.0
 */
package com.backend.enums;

public enum StockOrderStatus {
    PENDING(0, "待审核"),
    PROCESSING(1, "处理中"),
    APPROVED(2, "已通过"),
    COMPLETED(3, "已完成"),
    REJECTED(4, "已驳回"),
    CANCELLED(5, "已取消");

    private final int code;
    private final String description;

    StockOrderStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static StockOrderStatus fromCode(int code) {
        for (StockOrderStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid stock order status code: " + code);
    }
}
