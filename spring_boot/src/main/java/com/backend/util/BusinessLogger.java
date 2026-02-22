package com.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 业务日志记录工具类
 *
 * 功能说明：
 * 提供统一的业务操作日志记录接口，便于追踪业务流程和审计。
 * 所有日志都会记录到 warehouse-management-system-business.log 文件中。
 *
 * 使用场景：
 * 1. 数据初始化记录
 * 2. 库存变更记录
 * 3. 设备状态变更记录
 * 4. 用户操作记录
 * 5. 系统关键业务事件
 *
 * 使用示例：
 * <pre>
 * BusinessLogger.info("设备管理", "创建设备", "设备编码: DEV001, 名称: 服务器");
 * BusinessLogger.warn("库存管理", "库存预警", "设备ID: 1, 当前库存: 5, 预警阈值: 10");
 * BusinessLogger.error("订单处理", "创建订单失败", "订单号: ORD001", exception);
 * </pre>
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-09
 */
public class BusinessLogger {

    /**
     * 业务日志记录器
     */
    private static final Logger logger = LoggerFactory.getLogger(BusinessLogger.class);

    /**
     * 日期时间格式化器
     */
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 私有构造方法，防止实例化
     */
    private BusinessLogger() {
        throw new UnsupportedOperationException("工具类不能实例化");
    }

    /**
     * 记录INFO级别业务日志
     *
     * @param module   业务模块名称（如：设备管理、库存管理、用户管理）
     * @param action   操作类型（如：创建、更新、删除、查询）
     * @param message  日志消息内容
     */
    public static void info(String module, String action, String message) {
        logger.info(formatLog(module, action, message));
    }

    /**
     * 记录INFO级别业务日志（带业务对象ID）
     *
     * @param module     业务模块名称
     * @param action     操作类型
     * @param businessId 业务对象ID
     * @param message    日志消息内容
     */
    public static void info(String module, String action, String businessId, String message) {
        logger.info(formatLog(module, action, businessId, message));
    }

    /**
     * 记录WARN级别业务日志
     *
     * @param module   业务模块名称
     * @param action   操作类型
     * @param message  日志消息内容
     */
    public static void warn(String module, String action, String message) {
        logger.warn(formatLog(module, action, message));
    }

    /**
     * 记录WARN级别业务日志（带异常）
     *
     * @param module   业务模块名称
     * @param action   操作类型
     * @param message  日志消息内容
     * @param e        异常对象
     */
    public static void warn(String module, String action, String message, Throwable e) {
        logger.warn(formatLog(module, action, message), e);
    }

    /**
     * 记录ERROR级别业务日志
     *
     * @param module   业务模块名称
     * @param action   操作类型
     * @param message  日志消息内容
     */
    public static void error(String module, String action, String message) {
        logger.error(formatLog(module, action, message));
    }

    /**
     * 记录ERROR级别业务日志（带异常）
     *
     * @param module   业务模块名称
     * @param action   操作类型
     * @param message  日志消息内容
     * @param e        异常对象
     */
    public static void error(String module, String action, String message, Throwable e) {
        logger.error(formatLog(module, action, message), e);
    }

    /**
     * 记录DEBUG级别业务日志
     *
     * @param module   业务模块名称
     * @param action   操作类型
     * @param message  日志消息内容
     */
    public static void debug(String module, String action, String message) {
        logger.debug(formatLog(module, action, message));
    }

    /**
     * 记录数据初始化日志
     *
     * @param dataType 数据类型（如：行政区划、角色、用户）
     * @param count    初始化数量
     */
    public static void logInitialization(String dataType, int count) {
        info("数据初始化", "初始化完成", String.format("%s: %d条", dataType, count));
    }

    /**
     * 记录库存变更日志
     *
     * @param deviceId  设备ID
     * @param deviceName 设备名称
     * @param changeQty 变更数量（正数为入库，负数为出库）
     * @param beforeQty 变更前数量
     * @param afterQty  变更后数量
     */
    public static void logInventoryChange(Long deviceId, String deviceName, int changeQty, int beforeQty, int afterQty) {
        String action = changeQty > 0 ? "入库" : "出库";
        info("库存管理", action,
            String.format("设备ID: %d, 名称: %s, 变更: %d, 变更前: %d, 变更后: %d",
                deviceId, deviceName, changeQty, beforeQty, afterQty));
    }

    /**
     * 记录设备状态变更日志
     *
     * @param deviceId    设备ID
     * @param deviceName  设备名称
     * @param oldStatus   原状态
     * @param newStatus   新状态
     */
    public static void logDeviceStatusChange(Long deviceId, String deviceName, String oldStatus, String newStatus) {
        info("设备管理", "状态变更",
            String.format("设备ID: %d, 名称: %s, 状态: %s -> %s", deviceId, deviceName, oldStatus, newStatus));
    }

    /**
     * 记录用户登录日志
     *
     * @param username 用户名
     * @param success  是否登录成功
     * @param ip       IP地址
     */
    public static void logUserLogin(String username, boolean success, String ip) {
        String result = success ? "成功" : "失败";
        info("用户管理", "用户登录", String.format("用户: %s, 结果: %s, IP: %s", username, result, ip));
    }

    /**
     * 记录用户操作日志
     *
     * @param username 用户名
     * @param module   操作模块
     * @param action   操作类型
     * @param target   操作对象
     */
    public static void logUserOperation(String username, String module, String action, String target) {
        info("用户管理", "操作记录", String.format("用户: %s, 模块: %s, 操作: %s, 对象: %s", username, module, action, target));
    }

    /**
     * 格式化日志消息（基础格式）
     *
     * @param module   业务模块
     * @param action   操作类型
     * @param message  消息内容
     * @return 格式化后的日志字符串
     */
    private static String formatLog(String module, String action, String message) {
        return String.format("[%s] [%s] %s - %s", module, action, LocalDateTime.now().format(formatter), message);
    }

    /**
     * 格式化日志消息（带业务ID格式）
     *
     * @param module     业务模块
     * @param action     操作类型
     * @param businessId 业务对象ID
     * @param message    消息内容
     * @return 格式化后的日志字符串
     */
    private static String formatLog(String module, String action, String businessId, String message) {
        return String.format("[%s] [%s] [ID:%s] %s - %s", module, action, businessId,
            LocalDateTime.now().format(formatter), message);
    }
}
