package com.backend.dto;

import lombok.Data;

/**
 * 统一分页请求参数
 *
 * 功能说明：
 * 统一封装所有列表查询接口的分页参数，确保前后端分页交互的一致性
 *
 * 参数说明：
 * - page: 当前页码，从1开始计数
 * - size: 每页记录数，默认10条
 * - sort: 排序字段名称
 * - order: 排序方向，asc(升序)或desc(降序)
 *
 * 使用示例：
 * GET /devices?page=1&size=20&sort=createdAt&order=desc
 *
 * 优化说明：
 * 1. 统一分页参数命名，避免前后端不一致
 * 2. 提供合理的默认值，减少前端传参负担
 * 3. 支持多字段排序（扩展预留）
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Data
public class PageRequest {

    /**
     * 当前页码
     * 从1开始计数，符合前端使用习惯
     * 默认值为1
     */
    private Integer page = 1;

    /**
     * 每页记录数
     * 默认10条，最大允许100条
     * 防止一次性查询过多数据导致性能问题
     */
    private Integer size = 10;

    /**
     * 排序字段
     * 对应实体类的属性名（驼峰命名）
     * 示例：createdAt、deviceCode、name
     */
    private String sort;

    /**
     * 排序方向
     * asc - 升序（从小到大）
     * desc - 降序（从大到小）
     * 默认desc，符合业务习惯（最新数据在前）
     */
    private String order = "desc";

    /**
     * 获取JPA分页查询的页码（从0开始）
     * 限制最大页码为10000，防止深度分页性能问题
     *
     * @return 从0开始的页码
     */
    public int getJpaPage() {
        if (page == null || page <= 0) {
            return 0;
        }
        // 限制最大页码为10000，防止深度分页性能问题
        return Math.min(page - 1, 9999);
    }

    /**
     * 获取安全的每页记录数
     * 限制最大100条，防止内存溢出
     * 限制最小1条，防止无效查询
     *
     * @return 安全的每页记录数
     */
    public int getSafeSize() {
        if (size == null) {
            return 10;
        }
        // 防止负数或零值
        if (size <= 0) {
            return 10;
        }
        // 限制最大100条，防止内存溢出
        return Math.min(size, 100);
    }

    /**
     * 验证排序方向是否有效
     *
     * @return 有效的排序方向
     */
    public String getValidOrder() {
        if ("asc".equalsIgnoreCase(order)) {
            return "asc";
        }
        return "desc";
    }

    /**
     * 构建排序字符串
     * 用于JPA排序或MyBatis排序
     *
     * @return 排序字符串，如 "createdAt desc"
     */
    public String buildSortString() {
        if (sort == null || sort.trim().isEmpty()) {
            return null;
        }
        return sort + " " + getValidOrder();
    }

    /**
     * 计算偏移量
     * 用于手动分页查询
     *
     * @return 偏移量
     */
    public int getOffset() {
        return getJpaPage() * getSafeSize();
    }
}
