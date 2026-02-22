package com.backend.enums;

public enum UserRole {
    ADMIN(0, "管理员"),
    OPERATOR(1, "操作员"),
    TECHNICIAN(2, "技术员"),
    VIEWER(3, "查看者");

    private final Integer code;
    private final String desc;

    UserRole(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public Integer getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }

    public static UserRole fromCode(Integer code) {
        for (UserRole role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid user role code: " + code);
    }
}
