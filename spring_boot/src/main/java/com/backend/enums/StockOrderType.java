/*
 * @file: StockOrderType.java
 * @description: 库存订单类型枚举
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0.0
 */
package com.backend.enums;

public enum StockOrderType {
    INBOUND(0, "入库"),
    OUTBOUND(1, "出库"),
    STOCK_COUNT(2, "盘点"),
    TRANSFER(3, "调拨");

    private final int code;
    private final String description;

    StockOrderType(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static StockOrderType fromCode(int code) {
        for (StockOrderType type : values()) {
            if (type.code == code) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid stock order type code: " + code);
    }
}
