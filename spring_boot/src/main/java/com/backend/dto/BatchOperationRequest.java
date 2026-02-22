package com.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * 批量操作请求基类
 *
 * 功能说明：
 * 统一封装批量操作（删除、更新状态、审批等）的请求参数
 * 避免为每种批量操作单独定义请求类
 *
 * 支持的操作类型：
 * - 批量删除：传入ID列表，执行批量删除
 * - 批量更新状态：传入ID列表和目标状态
 * - 批量审批：传入ID列表和审批结果
 *
 * 安全控制：
 * 1. 单次操作最大限制100条记录
 * 2. ID列表不能为空
 * 3. 操作前进行权限校验
 *
 * 使用示例：
 * 批量删除：{ "ids": [1, 2, 3] }
 * 批量更新状态：{ "ids": [1, 2, 3], "status": 1, "reason": "批量启用" }
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Data
public class BatchOperationRequest {

    /**
     * 操作对象ID列表
     * 不能为空，最多100个ID
     */
    @NotEmpty(message = "操作对象ID列表不能为空")
    private List<Long> ids;

    /**
     * 目标状态
     * 用于批量更新状态操作
     * 可选字段
     */
    private Integer status;

    /**
     * 操作原因/备注
     * 用于记录批量操作的原因
     * 可选字段
     */
    private String reason;

    /**
     * 审批结果
     * true - 通过
     * false - 拒绝
     * 用于批量审批操作
     */
    private Boolean approved;

    /**
     * 获取安全的ID列表
     * 限制最大数量，防止内存溢出和性能问题
     *
     * @return 安全的ID列表
     */
    public List<Long> getSafeIds() {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        // 限制最大100条
        if (ids.size() > 100) {
            return ids.subList(0, 100);
        }
        return ids;
    }

    /**
     * 获取操作数量
     *
     * @return ID数量
     */
    public int getCount() {
        return ids != null ? ids.size() : 0;
    }

    /**
     * 验证是否为有效的批量操作
     *
     * @return 是否有效
     */
    public boolean isValid() {
        return ids != null && !ids.isEmpty() && ids.size() <= 100;
    }
}
