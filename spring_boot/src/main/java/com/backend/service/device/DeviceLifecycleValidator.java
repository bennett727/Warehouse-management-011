package com.backend.service.device;

import com.backend.entity.Device;

/**
 * 设备生命周期验证器接口
 *
 * 功能说明：
 * 提供设备生命周期各阶段的验证方法，包括创建、更新、删除等操作的验证
 *
 * 使用场景：
 * - 设备创建前的数据验证
 * - 设备更新前的状态验证
 * - 设备删除前的依赖检查
 * - 设备状态转换的合法性验证
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
public interface DeviceLifecycleValidator {

    /**
     * 验证设备是否可以删除
     *
     * 验证规则：
     * 1. 设备不能有关联的库存订单
     * 2. 设备不能处于借出状态
     * 3. 设备不能有待处理的维护任务
     *
     * @param device 设备对象
     * @throws IllegalStateException 如果设备不能删除
     */
    static void validateDeviceForDeletion(Device device) {
        if (device == null) {
            throw new IllegalArgumentException("设备对象不能为空");
        }

        // 检查设备状态
        if (device.getStatus() != null) {
            int status = device.getStatus();
            // 如果设备处于借出状态，不能删除
            if (status == 2) { // BORROWED = 2
                throw new IllegalStateException("设备处于借出状态，无法删除");
            }
        }

        // 其他验证逻辑可以根据业务需求添加
        // 例如：检查是否有未完成的库存订单、维护任务等
    }

    /**
     * 验证设备状态转换是否合法
     *
     * @param device       设备对象
     * @param targetStatus 目标状态
     * @throws IllegalStateException 如果状态转换不合法
     */
    static void validateStatusTransition(Device device, int targetStatus) {
        if (device == null) {
            throw new IllegalArgumentException("设备对象不能为空");
        }

        Integer currentStatus = device.getStatus();
        if (currentStatus == null) {
            currentStatus = 0; // 默认状态
        }

        // 定义允许的状态转换
        // 0: 在库, 1: 出库, 2: 借出, 3: 维修中, 4: 报废
        boolean isValid = switch (currentStatus) {
            case 0 -> // 在库 -> 任意状态
                true;
            case 1 -> // 出库 -> 只能在库或报废
                targetStatus == 0 || targetStatus == 4;
            case 2 -> // 借出 -> 只能在库
                targetStatus == 0;
            case 3 -> // 维修中 -> 只能在库或报废
                targetStatus == 0 || targetStatus == 4;
            case 4 -> // 报废 -> 不能再转换
                false;
            default -> true;
        };

        if (!isValid) {
            throw new IllegalStateException(
                    String.format("设备状态从 %d 转换为 %d 不合法", currentStatus, targetStatus));
        }
    }

    /**
     * 验证设备数据完整性
     *
     * @param device 设备对象
     * @throws IllegalArgumentException 如果数据不完整
     */
    static void validateDeviceData(Device device) {
        if (device == null) {
            throw new IllegalArgumentException("设备对象不能为空");
        }

        if (device.getDeviceCode() == null || device.getDeviceCode().trim().isEmpty()) {
            throw new IllegalArgumentException("设备编码不能为空");
        }

        if (device.getDeviceName() == null || device.getDeviceName().trim().isEmpty()) {
            throw new IllegalArgumentException("设备名称不能为空");
        }

        if (device.getDeviceType() == null) {
            throw new IllegalArgumentException("设备类型不能为空");
        }
    }
}
