package com.backend.common;

/**
 * 错误码枚举
 *
 * 功能说明：
 * 定义系统中所有业务错误码，便于统一错误处理和国际化支持
 *
 * 错误码规则：
 * - 0: 成功
 * - 1-999: 通用错误
 * - 1000-1999: 设备相关错误
 * - 2000-2999: 仓库相关错误
 * - 3000-3999: 区域相关错误
 * - 4000-4999: 批次相关错误
 * - 5000-5999: 用户相关错误
 * - 6000-6999: 角色相关错误
 * - 7000-7999: 订单相关错误
 * - 8000-8999: 记录相关错误
 * - 9000-9999: 系统相关错误
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
public enum ErrorCode {

    // ==================== 通用错误 (0-999) ====================
    SUCCESS(0, "成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "服务器内部错误"),
    PARAM_ERROR(1000, "参数错误"),
    OPERATION_FAILED(1001, "操作失败"),

    // ==================== 设备相关错误 (1000-1999) ====================
    DEVICE_NOT_FOUND(1001, "设备不存在"),
    DEVICE_CODE_EXISTS(1002, "设备编码已存在"),
    DEVICE_STOCK_INSUFFICIENT(1003, "设备库存不足"),
    DEVICE_IN_USE(1004, "设备正在使用中"),
    INVALID_STATUS_TRANSITION(1005, "无效的状态转换"),
    INVALID_STATUS(1006, "状态无效"),
    DEVICE_STATUS_TRANSITION_INVALID(1007, "设备状态转换无效"),
    DEVICE_STATUS_NEED_APPROVAL(1008, "设备状态转换需要审批"),
    INVALID_DEVICE_STATUS(1009, "设备状态无效"),

    // ==================== 仓库相关错误 (2000-2999) ====================
    WAREHOUSE_NOT_FOUND(2001, "仓库不存在"),
    WAREHOUSE_CODE_EXISTS(2002, "仓库编码已存在"),

    // ==================== 区域相关错误 (3000-3999) ====================
    AREA_NOT_FOUND(3001, "区域不存在"),
    AREA_CODE_EXISTS(3002, "区域编码已存在"),

    // ==================== 批次相关错误 (4000-4999) ====================
    BATCH_NOT_FOUND(4001, "批次不存在"),
    BATCH_CODE_EXISTS(4002, "批次编码已存在"),
    BATCH_STOCK_INSUFFICIENT(4003, "批次库存不足"),

    // ==================== 库存相关错误 (4500-4999) ====================
    INVENTORY_NOT_FOUND(4501, "库存记录不存在"),
    INVENTORY_INSUFFICIENT(4502, "库存不足"),

    // ==================== 用户相关错误 (5000-5999) ====================
    USER_NOT_FOUND(5001, "用户不存在"),
    USER_EXISTS(5002, "用户已存在"),
    INVALID_PASSWORD(5003, "密码错误"),

    // ==================== 角色相关错误 (6000-6999) ====================
    ROLE_NOT_FOUND(6001, "角色不存在"),
    ROLE_EXISTS(6002, "角色已存在"),

    // ==================== 订单相关错误 (7000-7999) ====================
    ORDER_NOT_FOUND(7001, "订单不存在"),
    ORDER_STATUS_INVALID(7002, "订单状态无效"),
    ORDER_STATUS_NOT_DRAFT(7003, "只有草稿状态的订单可以提交"),
    ORDER_STATUS_NOT_PENDING(7004, "只有待审核状态的订单可以审核"),
    ORDER_CANNOT_CANCEL(7005, "已审核或已完成的订单不能取消"),

    // ==================== 记录相关错误 (8000-8999) ====================
    RECORD_NOT_FOUND(8001, "记录不存在"),
    INSTALL_RECORD_NOT_FOUND(8002, "安装记录不存在"),
    REPAIR_RECORD_NOT_FOUND(8003, "维修记录不存在"),
    MAINTENANCE_RECORD_NOT_FOUND(8004, "维护记录不存在"),

    // ==================== 系统相关错误 (9000-9999) ====================
    CONFIG_NOT_FOUND(9001, "配置不存在"),
    LOCK_ACQUIRE_FAILED(9002, "获取锁失败"),
    LOCK_ACQUIRE_TIMEOUT(9003, "获取锁超时"),
    FILE_NOT_FOUND(9004, "文件不存在"),
    FILE_DOWNLOAD_ERROR(9005, "文件下载失败"),
    FILE_NAME_INVALID(9006, "文件名非法"),
    DTO_CONVERT_ERROR(9007, "DTO转换失败"),
    ENTITY_CONVERT_ERROR(9008, "Entity转换失败");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
