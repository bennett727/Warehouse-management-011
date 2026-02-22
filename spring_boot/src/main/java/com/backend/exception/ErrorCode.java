package com.backend.exception;

import lombok.Getter;

/**
 * 统一错误码枚举
 * 
 * 功能说明：
 * 定义系统中所有错误码，实现错误码标准化管理
 * 
 * 错误码格式：
 * [模块码][功能码][错误序号]
 * 示例：1001001 表示系统模块-通用功能-第1个错误
 * 
 * 模块划分：
 * - 10xx：系统级错误
 * - 11xx：认证授权错误
 * - 20xx：设备管理错误
 * - 21xx：库存管理错误
 * - 22xx：订单管理错误
 * - 23xx：用户管理错误
 * - 30xx：报表统计错误
 * - 40xx：文件操作错误
 * - 50xx：外部接口错误
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Getter
public enum ErrorCode {

    // ==================== 系统级错误 (10xx) ====================
    /**
     * 操作成功
     */
    SUCCESS(200, "操作成功"),

    /**
     * 系统内部错误
     */
    SYSTEM_ERROR(1001001, "系统内部错误，请联系管理员"),

    /**
     * 服务暂不可用
     */
    SERVICE_UNAVAILABLE(1001002, "服务暂不可用，请稍后重试"),

    /**
     * 请求参数错误
     */
    PARAM_ERROR(1001003, "请求参数错误"),

    /**
     * 请求方式不支持
     */
    METHOD_NOT_ALLOWED(1001004, "请求方式不支持"),

    /**
     * 资源不存在
     */
    RESOURCE_NOT_FOUND(1001005, "请求的资源不存在"),

    /**
     * 请求过于频繁
     */
    REQUEST_TOO_FREQUENT(1001006, "请求过于频繁，请稍后再试"),

    /**
     * 操作超时
     */
    OPERATION_TIMEOUT(1001007, "操作超时，请重试"),

    /**
     * 数据版本冲突
     */
    DATA_VERSION_CONFLICT(1001008, "数据已被修改，请刷新后重试"),

    /**
     * 数据库操作失败
     */
    DATABASE_ERROR(1001009, "数据库操作失败"),

    // ==================== 认证授权错误 (11xx) ====================
    /**
     * 未登录或登录已过期
     */
    UNAUTHORIZED(1101001, "未登录或登录已过期，请重新登录"),

    /**
     * 访问被拒绝，权限不足
     */
    ACCESS_DENIED(1101002, "访问被拒绝，权限不足"),

    /**
     * Token无效
     */
    TOKEN_INVALID(1101003, "登录凭证无效，请重新登录"),

    /**
     * Token已过期
     */
    TOKEN_EXPIRED(1101004, "登录已过期，请重新登录"),

    /**
     * 用户名或密码错误
     */
    LOGIN_FAILED(1101005, "用户名或密码错误"),

    /**
     * 账号已被禁用
     */
    ACCOUNT_DISABLED(1101006, "账号已被禁用，请联系管理员"),

    /**
     * 账号已被锁定
     */
    ACCOUNT_LOCKED(1101007, "账号已被锁定，请30分钟后重试"),

    /**
     * 密码错误次数过多
     */
    PASSWORD_ERROR_TOO_MANY(1101008, "密码错误次数过多，请30分钟后重试"),

    /**
     * 验证码错误
     */
    CAPTCHA_ERROR(1101009, "验证码错误或已过期"),

    /**
     * 需要二次认证
     */
    TWO_FACTOR_REQUIRED(1101010, "需要进行二次认证"),

    // ==================== 设备管理错误 (20xx) ====================
    /**
     * 设备不存在
     */
    DEVICE_NOT_FOUND(2001001, "设备不存在"),

    /**
     * 设备编码已存在
     */
    DEVICE_CODE_EXISTS(2001002, "设备编码已存在"),

    /**
     * 设备状态不允许此操作
     */
    DEVICE_STATUS_NOT_ALLOWED(2001003, "当前设备状态不允许此操作"),

    /**
     * 设备已被借用
     */
    DEVICE_ALREADY_BORROWED(2001004, "设备已被借用"),

    /**
     * 设备维修中
     */
    DEVICE_UNDER_MAINTENANCE(2001005, "设备维修中，暂不可用"),

    /**
     * 设备已报废
     */
    DEVICE_SCRAPPED(2001006, "设备已报废"),

    /**
     * 设备类型不存在
     */
    DEVICE_TYPE_NOT_FOUND(2002001, "设备类型不存在"),

    /**
     * 设备类型编码已存在
     */
    DEVICE_TYPE_CODE_EXISTS(2002002, "设备类型编码已存在"),

    /**
     * 设备类型已被使用
     */
    DEVICE_TYPE_IN_USE(2002003, "设备类型已被使用，无法删除"),

    /**
     * 设备状态流转非法
     */
    DEVICE_STATUS_TRANSITION_INVALID(2003001, "设备状态流转非法"),

    /**
     * 设备状态变更需要审批
     */
    DEVICE_STATUS_NEED_APPROVAL(2003002, "设备状态变更需要审批"),

    // ==================== 库存管理错误 (21xx) ====================
    /**
     * 库存不足
     */
    INSUFFICIENT_STOCK(2101001, "库存不足"),

    /**
     * 库存记录不存在
     */
    INVENTORY_NOT_FOUND(2101002, "库存记录不存在"),

    /**
     * 库存已被锁定
     */
    INVENTORY_LOCKED(2101003, "库存已被锁定"),

    /**
     * 库存操作失败
     */
    INVENTORY_OPERATION_FAILED(2101004, "库存操作失败"),

    /**
     * 库存数据不一致
     */
    INVENTORY_DATA_INCONSISTENT(2101005, "库存数据不一致"),

    /**
     * 货位不存在
     */
    BIN_NOT_FOUND(2102001, "货位不存在"),

    /**
     * 货位已满
     */
    BIN_FULL(2102002, "货位已满"),

    /**
     * 货位已被占用
     */
    BIN_OCCUPIED(2102003, "货位已被占用"),

    /**
     * 库区不存在
     */
    AREA_NOT_FOUND(2103001, "库区不存在"),

    /**
     * 库区编码已存在
     */
    AREA_CODE_EXISTS(2103002, "库区编码已存在"),

    // ==================== 订单管理错误 (22xx) ====================
    /**
     * 订单不存在
     */
    ORDER_NOT_FOUND(2201001, "订单不存在"),

    /**
     * 订单状态不允许此操作
     */
    ORDER_STATUS_NOT_ALLOWED(2201002, "当前订单状态不允许此操作"),

    /**
     * 订单号已存在
     */
    ORDER_NO_EXISTS(2201003, "订单号已存在"),

    /**
     * 订单明细为空
     */
    ORDER_ITEMS_EMPTY(2201004, "订单明细不能为空"),

    /**
     * 订单已提交
     */
    ORDER_ALREADY_SUBMITTED(2201005, "订单已提交，请勿重复提交"),

    /**
     * 订单已审核
     */
    ORDER_ALREADY_APPROVED(2201006, "订单已审核"),

    /**
     * 订单已取消
     */
    ORDER_ALREADY_CANCELLED(2201007, "订单已取消"),

    /**
     * 订单已完成
     */
    ORDER_ALREADY_COMPLETED(2201008, "订单已完成"),

    /**
     * 出库单执行失败
     */
    OUTBOUND_FAILED(2202001, "出库单执行失败"),

    /**
     * 入库单执行失败
     */
    INBOUND_FAILED(2202002, "入库单执行失败"),

    /**
     * 调拨单执行失败
     */
    TRANSFER_FAILED(2202003, "调拨单执行失败"),

    // ==================== 用户管理错误 (23xx) ====================
    /**
     * 用户不存在
     */
    USER_NOT_FOUND(2301001, "用户不存在"),

    /**
     * 用户名已存在
     */
    USERNAME_EXISTS(2301002, "用户名已存在"),

    /**
     * 手机号已存在
     */
    PHONE_EXISTS(2301003, "手机号已存在"),

    /**
     * 邮箱已存在
     */
    EMAIL_EXISTS(2301004, "邮箱已存在"),

    /**
     * 原密码错误
     */
    OLD_PASSWORD_ERROR(2301005, "原密码错误"),

    /**
     * 两次密码不一致
     */
    PASSWORD_NOT_MATCH(2301006, "两次密码不一致"),

    /**
     * 密码格式错误
     */
    PASSWORD_FORMAT_ERROR(2301007, "密码格式错误，密码长度8-20位，需包含字母和数字"),

    /**
     * 角色不存在
     */
    ROLE_NOT_FOUND(2302001, "角色不存在"),

    /**
     * 角色编码已存在
     */
    ROLE_CODE_EXISTS(2302002, "角色编码已存在"),

    /**
     * 角色已被使用
     */
    ROLE_IN_USE(2302003, "角色已被使用，无法删除"),

    // ==================== 报表统计错误 (30xx) ====================
    /**
     * 报表生成失败
     */
    REPORT_GENERATE_FAILED(3001001, "报表生成失败"),

    /**
     * 报表不存在
     */
    REPORT_NOT_FOUND(3001002, "报表不存在"),

    /**
     * 数据量过大
     */
    DATA_TOO_LARGE(3001003, "数据量过大，请缩小查询范围"),

    /**
     * 导出格式不支持
     */
    EXPORT_FORMAT_NOT_SUPPORT(3001004, "导出格式不支持"),

    /**
     * 导出失败
     */
    EXPORT_FAILED(3001005, "导出失败"),

    // ==================== 文件操作错误 (40xx) ====================
    /**
     * 文件上传失败
     */
    FILE_UPLOAD_FAILED(4001001, "文件上传失败"),

    /**
     * 文件大小超出限制
     */
    FILE_SIZE_EXCEED(4001002, "文件大小超出限制"),

    /**
     * 文件类型不支持
     */
    FILE_TYPE_NOT_SUPPORT(4001003, "文件类型不支持"),

    /**
     * 文件不存在
     */
    FILE_NOT_FOUND(4001004, "文件不存在"),

    /**
     * 文件读取失败
     */
    FILE_READ_FAILED(4001005, "文件读取失败"),

    /**
     * 文件写入失败
     */
    FILE_WRITE_FAILED(4001006, "文件写入失败"),

    /**
     * 图片上传失败
     */
    IMAGE_UPLOAD_FAILED(4002001, "图片上传失败"),

    /**
     * 图片格式错误
     */
    IMAGE_FORMAT_ERROR(4002002, "图片格式错误"),

    // ==================== 外部接口错误 (50xx) ====================
    /**
     * 外部服务调用失败
     */
    EXTERNAL_SERVICE_ERROR(5001001, "外部服务调用失败"),

    /**
     * 网络连接超时
     */
    NETWORK_TIMEOUT(5001002, "网络连接超时"),

    /**
     * 第三方接口返回错误
     */
    THIRD_PARTY_ERROR(5001003, "第三方接口返回错误"),

    /**
     * 短信发送失败
     */
    SMS_SEND_FAILED(5002001, "短信发送失败"),

    /**
     * 邮件发送失败
     */
    EMAIL_SEND_FAILED(5002002, "邮件发送失败"),

    /**
     * 推送通知失败
     */
    PUSH_NOTIFICATION_FAILED(5002003, "推送通知失败");

    /**
     * 错误码
     */
    private final int code;

    /**
     * 错误消息
     */
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 根据错误码获取枚举
     * 
     * @param code 错误码
     * @return ErrorCode枚举，找不到返回null
     */
    public static ErrorCode getByCode(int code) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.getCode() == code) {
                return errorCode;
            }
        }
        return null;
    }

    /**
     * 判断是否为系统级错误
     * 
     * @return true表示系统级错误
     */
    public boolean isSystemError() {
        return this.code >= 1001000 && this.code < 1100000;
    }

    /**
     * 判断是否为认证授权错误
     * 
     * @return true表示认证授权错误
     */
    public boolean isAuthError() {
        return this.code >= 1101000 && this.code < 1200000;
    }

    /**
     * 判断是否为业务错误
     * 
     * @return true表示业务错误
     */
    public boolean isBusinessError() {
        return this.code >= 2000000 && this.code < 3000000;
    }
}
