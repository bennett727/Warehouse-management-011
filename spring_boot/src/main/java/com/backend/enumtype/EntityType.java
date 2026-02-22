package com.backend.enumtype;

public enum EntityType {
    ;

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

    public enum AreaStatus {
        ACTIVE(0, "启用"),
        INACTIVE(1, "停用"),
        MAINTENANCE(2, "维护中");

        private final Integer code;
        private final String desc;

        AreaStatus(Integer code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public Integer getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static AreaStatus fromCode(Integer code) {
            for (AreaStatus status : values()) {
                if (status.getCode().equals(code)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid area status code: " + code);
        }
    }

    public enum StockOrderType {
        INBOUND(0, "入库"),
        OUTBOUND(1, "出库"),
        TRANSFER(2, "调拨"),
        COUNT(3, "盘点");

        private final Integer code;
        private final String desc;

        StockOrderType(Integer code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public Integer getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static StockOrderType fromCode(Integer code) {
            for (StockOrderType type : values()) {
                if (type.getCode().equals(code)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid stock order type code: " + code);
        }
    }

    public enum StockOrderStatus {
        PENDING(0, "待处理"),
        PROCESSING(1, "处理中"),
        COMPLETED(2, "已完成"),
        CANCELLED(3, "已取消"),
        APPROVED(4, "已审核"),
        REJECTED(5, "已驳回");

        private final Integer code;
        private final String desc;

        StockOrderStatus(Integer code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public Integer getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static StockOrderStatus fromCode(Integer code) {
            for (StockOrderStatus status : values()) {
                if (status.getCode().equals(code)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid stock order status code: " + code);
        }
    }

    public enum MaintenanceStatus {
        PENDING(0, "待处理"),
        IN_PROGRESS(1, "处理中"),
        COMPLETED(2, "已完成"),
        CANCELLED(3, "已取消");

        private final Integer code;
        private final String desc;

        MaintenanceStatus(Integer code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public Integer getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static MaintenanceStatus fromCode(Integer code) {
            for (MaintenanceStatus status : values()) {
                if (status.getCode().equals(code)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid maintenance status code: " + code);
        }
    }

    public enum BatchStatus {
        IN_STOCK(0, "在库"),
        OUT_STOCK(1, "出库"),
        PARTIAL_OUT(2, "部分出库"),
        EXPIRED(3, "已过期");

        private final Integer code;
        private final String desc;

        BatchStatus(Integer code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public Integer getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static BatchStatus fromCode(Integer code) {
            for (BatchStatus status : values()) {
                if (status.getCode().equals(code)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid batch status code: " + code);
        }
    }
}
