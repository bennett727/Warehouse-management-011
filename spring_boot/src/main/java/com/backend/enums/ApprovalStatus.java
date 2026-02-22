package com.backend.enums;

public enum ApprovalStatus {
    PENDING(0, "待审批"),
    APPROVED(1, "已批准"),
    REJECTED(2, "已拒绝"),
    CANCELLED(3, "已取消");

    private final int code;
    private final String description;

    ApprovalStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ApprovalStatus fromCode(int code) {
        for (ApprovalStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid approval status code: " + code);
    }
}