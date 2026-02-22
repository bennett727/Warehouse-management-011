package com.backend.common;

/**
 * 统一错误码枚举
 * 
 * 设计说明：
 * 1. 错误码采用分层设计，便于快速定位问题来源
 * 2. 1xxx - 通用错误
 * 3. 2xxx - 认证授权错误
 * 4. 3xxx - 用户模块错误
 * 5. 4xxx - 设备模块错误
 * 6. 5xxx - 库存模块错误
 * 7. 6xxx - 订单模块错误
 * 8. 7xxx - 系统模块错误
 * 9. 8xxx - 文件模块错误
 * 10. 9xxx - 外部服务错误
 * 
 * 使用规范：
 * - 新增错误码时需在此枚举中定义
 * - 错误消息应清晰描述问题原因
 * - 避免使用过于笼统的错误码
 */
public enum ResultCode {

    /**
     * 通用成功状态码
     */
    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),

    /**
     * 1xxx - 通用错误
     */
    PARAM_ERROR(1001, "参数错误"),
    PARAM_EMPTY(1002, "参数为空"),
    PARAM_TYPE_ERROR(1003, "参数类型错误"),
    PARAM_FORMAT_ERROR(1004, "参数格式错误"),
    VALIDATE_ERROR(1005, "参数验证失败"),
    REQUEST_METHOD_ERROR(1006, "请求方式错误"),
    REQUEST_TOO_FREQUENT(1007, "请求过于频繁"),
    RESOURCE_NOT_FOUND(1008, "资源不存在"),
    RESOURCE_EXISTED(1009, "资源已存在"),

    /**
     * 2xxx - 认证授权错误
     */
    UNAUTHORIZED(2001, "未登录或登录已过期"),
    FORBIDDEN(2002, "无访问权限"),
    TOKEN_INVALID(2003, "Token无效"),
    TOKEN_EXPIRED(2004, "Token已过期"),
    ACCOUNT_DISABLED(2005, "账号已被禁用"),
    ACCOUNT_LOCKED(2006, "账号已被锁定"),
    PASSWORD_ERROR(2007, "密码错误"),
    PASSWORD_EXPIRED(2008, "密码已过期"),
    CAPTCHA_ERROR(2009, "验证码错误"),
    CAPTCHA_EXPIRED(2010, "验证码已过期"),

    /**
     * 3xxx - 用户模块错误
     */
    USER_NOT_EXIST(3001, "用户不存在"),
    USER_EXISTED(3002, "用户已存在"),
    USERNAME_EXISTED(3003, "用户名已存在"),
    EMAIL_EXISTED(3004, "邮箱已存在"),
    PHONE_EXISTED(3005, "手机号已存在"),
    OLD_PASSWORD_ERROR(3006, "原密码错误"),
    PASSWORD_NOT_MATCH(3007, "两次密码不一致"),

    /**
     * 4xxx - 设备模块错误
     */
    DEVICE_NOT_EXIST(4001, "设备不存在"),
    DEVICE_CODE_EXISTED(4002, "设备编号已存在"),
    DEVICE_STATUS_ERROR(4003, "设备状态错误"),
    DEVICE_TYPE_NOT_EXIST(4004, "设备类型不存在"),
    DEVICE_TYPE_CODE_EXISTED(4005, "设备类型编码已存在"),
    DEVICE_IN_USE(4006, "设备正在使用中"),
    DEVICE_MAINTENANCE(4007, "设备维护中"),
    DEVICE_OFFLINE(4008, "设备已离线"),

    /**
     * 5xxx - 库存模块错误
     */
    INVENTORY_NOT_EXIST(5001, "库存记录不存在"),
    INVENTORY_INSUFFICIENT(5002, "库存不足"),
    INVENTORY_OVER_LIMIT(5003, "库存超出上限"),
    WAREHOUSE_NOT_EXIST(5004, "仓库不存在"),
    WAREHOUSE_CODE_EXISTED(5005, "仓库编码已存在"),
    WAREHOUSE_FULL(5006, "仓库已满"),
    AREA_NOT_EXIST(5007, "区域不存在"),
    LOCATION_NOT_EXIST(5008, "库位不存在"),
    LOCATION_OCCUPIED(5009, "库位已被占用"),

    /**
     * 6xxx - 订单模块错误
     */
    ORDER_NOT_EXIST(6001, "订单不存在"),
    ORDER_STATUS_ERROR(6002, "订单状态错误"),
    ORDER_CANNOT_CANCEL(6003, "订单无法取消"),
    ORDER_CANNOT_MODIFY(6004, "订单无法修改"),
    ORDER_ITEM_EMPTY(6005, "订单明细为空"),
    ORDER_APPROVE_ERROR(6006, "订单审批失败"),

    /**
     * 7xxx - 系统模块错误
     */
    CONFIG_NOT_EXIST(7001, "配置项不存在"),
    CONFIG_KEY_EXISTED(7002, "配置键已存在"),
    DICT_NOT_EXIST(7003, "字典项不存在"),
    DICT_CODE_EXISTED(7004, "字典编码已存在"),
    LOG_NOT_EXIST(7005, "日志不存在"),
    SCHEDULE_ERROR(7006, "定时任务执行失败"),

    /**
     * 8xxx - 文件模块错误
     */
    FILE_UPLOAD_ERROR(8001, "文件上传失败"),
    FILE_DOWNLOAD_ERROR(8002, "文件下载失败"),
    FILE_NOT_EXIST(8003, "文件不存在"),
    FILE_SIZE_EXCEED(8004, "文件大小超出限制"),
    FILE_TYPE_ERROR(8005, "文件类型错误"),
    FILE_NAME_EMPTY(8006, "文件名为空"),

    /**
     * 9xxx - 外部服务错误
     */
    EXTERNAL_SERVICE_ERROR(9001, "外部服务调用失败"),
    EXTERNAL_TIMEOUT(9002, "外部服务超时"),
    EXTERNAL_RESPONSE_ERROR(9003, "外部服务响应错误"),

    /**
     * 数据库错误
     */
    DATABASE_ERROR(10001, "数据库操作失败"),
    DATA_INTEGRITY_ERROR(10002, "数据完整性错误"),
    DATA_DUPLICATE_ERROR(10003, "数据重复"),

    /**
     * 系统错误
     */
    SYSTEM_ERROR(11001, "系统内部错误"),
    SYSTEM_BUSY(11002, "系统繁忙"),
    SYSTEM_MAINTENANCE(11003, "系统维护中");

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 错误消息
     */
    private final String message;

    /**
     * 构造方法
     * 
     * @param code    错误码
     * @param message 错误消息
     */
    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 根据错误码获取枚举
     * 
     * @param code 错误码
     * @return 对应的枚举，找不到返回null
     */
    public static ResultCode getByCode(Integer code) {
        for (ResultCode resultCode : values()) {
            if (resultCode.getCode().equals(code)) {
                return resultCode;
            }
        }
        return null;
    }

    /**
     * 获取错误码
     * 
     * @return 错误码
     */
    public Integer getCode() {
        return code;
    }

    /**
     * 获取错误消息
     * 
     * @return 错误消息
     */
    public String getMessage() {
        return message;
    }
}
