package com.backend.enums;

public enum BatchStatus {
    IN_STOCK(0, "在库"),
    OUT_STOCK(1, "出库"),
    PARTIAL_OUT(2, "部分出库"),
    EXPIRED(3, "已过期");

    private final Integer code;
    private final String description;

    BatchStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static BatchStatus fromCode(Integer code) {
        for (BatchStatus status : BatchStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown batch status code: " + code);
    }
}