package com.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.DeviceType;
import com.backend.entity.Supplier;
import com.backend.service.SystemService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 系统管理控制器
 *
 * 功能说明：
 * 提供系统基础数据管理和报表统计的RESTful API接口，包括：
 * - 行政区划管理
 * - 仓库区域管理
 * - 设备类型管理
 * - 供应商管理
 * - 系统配置管理
 * - 操作日志查询
 * - 综合报表统计
 *
 * 权限控制：
 * - ADMIN: 所有操作
 * - OPERATOR: 查看和部分操作
 * - TECHNICIAN: 查看
 *
 * API路径：/api/system
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@RestController
@RequestMapping("/system")
@RequiredArgsConstructor
public class SystemController {

    /** 系统管理服务 */
    private final SystemService systemService;

    // ==================== 行政区划接口 ====================
    // 注意：行政区划接口已移至 DivisionController (/system/divisions)

    // ==================== 仓库区域接口 ====================
    // 注意：仓库接口已移至 WarehouseController (/warehouses)
    // 注意：区域接口已移至 AreaController (/areas)

    // ==================== 设备类型接口 ====================

    /**
     * 获取设备类型树
     *
     * 接口说明：
     * 获取设备类型的层级结构，支持多级分类
     *
     * 请求示例：
     * GET /api/system/device-types?parentId=1
     *
     * @param parentId 父级ID，可选
     * @return 设备类型树
     */
    @GetMapping("/device-types")
    public ApiResponse<List<Map<String, Object>>> getDeviceTypeTree(@RequestParam(required = false) Long parentId) {
        return systemService.getDeviceTypeTree(parentId);
    }

    @GetMapping("/device-types/all")
    public ApiResponse<List<DeviceType>> getAllDeviceTypes() {
        return systemService.getAllDeviceTypes();
    }

    @GetMapping("/device-types/summary")
    public ApiResponse<List<Map<String, Object>>> getDeviceTypeSummary() {
        return systemService.getDeviceTypeSummary();
    }

    @PostMapping("/device-types")
    public ApiResponse<Map<String, Object>> createDeviceType(@RequestBody DeviceType deviceType) {
        return systemService.createDeviceType(deviceType);
    }

    // ==================== 供应商接口 ====================

    /**
     * 获取供应商列表
     *
     * 接口说明：
     * 查询供应商信息，支持关键词搜索和状态筛选
     *
     * 请求示例：
     * GET /api/system/suppliers?keyword=科技&status=1&page=1&size=10
     *
     * @param keyword 搜索关键词，可选
     * @param status  状态（0-禁用，1-启用），可选
     * @param pageReq 分页参数对象（page/size/sort/order）
     * @return 分页供应商列表
     */
    @GetMapping("/suppliers")
    public ApiResponse<PageResult<Map<String, Object>>> getSupplierList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return systemService.getSupplierList(keyword, status, pageable);
    }

    /**
     * 创建供应商
     *
     * 接口说明：
     * 创建新的供应商信息
     *
     * 请求示例：
     * POST /api/system/suppliers
     * {
     * "supplierCode": "SUP001",
     * "name": "某某科技有限公司",
     * "contactPerson": "张三",
     * "contactPhone": "13800138000",
     * "email": "contact@example.com",
     * "address": "北京市海淀区xxx路xxx号"
     * }
     *
     * @param supplier 供应商信息
     * @return 创建结果
     */
    @PostMapping("/suppliers")
    public ApiResponse<Map<String, Object>> createSupplier(@RequestBody Supplier supplier) {
        return systemService.createSupplier(supplier);
    }

    // ==================== 系统配置接口 ====================

    /**
     * 获取系统配置列表
     *
     * 接口说明：
     * 查询系统配置参数
     *
     * 请求示例：
     * GET /api/system/configs?configKey=system.name&page=1&size=10
     *
     * @param configKey 配置键，可选
     * @param pageReq   分页参数对象（page/size/sort/order）
     * @return 配置列表
     */
    @GetMapping("/configs")
    public ApiResponse<PageResult<Map<String, Object>>> getSystemConfigs(
            @RequestParam(required = false) String configKey,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return systemService.getSystemConfigs(configKey, pageable);
    }

    /**
     * 更新系统配置
     *
     * 接口说明：
     * 更新系统配置参数值
     *
     * 请求示例：
     * PUT /api/system/configs/1
     * {
     * "configValue": "新值",
     * "description": "配置说明"
     * }
     *
     * @param id      配置ID
     * @param request 更新请求
     * @return 更新结果
     */
    @PutMapping("/configs/{id}")
    public ApiResponse<Void> updateSystemConfig(@PathVariable Long id, @RequestBody UpdateConfigRequest request) {
        return systemService.updateSystemConfig(id, request.getConfigValue(), request.getDescription());
    }

    /**
     * 批量保存或更新系统配置
     *
     * 接口说明：
     * 批量保存或更新系统配置参数值
     *
     * 请求示例：
     * POST /api/system/configs/batch
     * [
     * {
     * "id": 1,
     * "configValue": "新值",
     * "description": "配置说明"
     * },
     * {
     * "configKey": "system.name",
     * "configValue": "系统名称",
     * "description": "系统名称配置"
     * }
     * ]
     *
     * @param configs 配置列表
     * @return 保存结果
     */
    @PostMapping("/configs/batch")
    public ApiResponse<Void> saveOrUpdateConfigs(@RequestBody List<Map<String, Object>> configs) {
        return systemService.saveOrUpdateConfigs(configs);
    }

    // ==================== 操作日志接口 ====================

    /**
     * 获取操作日志列表
     *
     * 接口说明：
     * 查询系统操作日志，支持多条件筛选
     *
     * 请求示例：
     * GET
     * /api/system/logs?username=admin&operationType=CREATE&startTime=2025-01-01&page=1&size=10
     *
     * @param username      用户名，可选
     * @param operationType 操作类型，可选
     * @param startTime     开始时间，可选
     * @param endTime       结束时间，可选
     * @param pageReq       分页参数对象（page/size/sort/order）
     * @return 分页日志列表
     */
    @GetMapping("/logs")
    public ApiResponse<PageResult<Map<String, Object>>> getOperationLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return systemService.getOperationLogs(username, operationType, startTime, endTime, pageable);
    }

    // ==================== 健康检查接口 ====================

    /**
     * 健康检查端点
     *
     * 接口说明：
     * 提供系统健康状态检查，用于监控和负载均衡
     *
     * 请求示例：
     * GET /api/system/health
     *
     * @return 健康状态
     */
    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success("系统运行正常", Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis()));
    }

    // ==================== 报表统计接口 ====================

    /**
     * 获取系统概览
     *
     * 接口说明：
     * 获取系统整体运行情况的统计数据
     *
     * 返回数据：
     * - 设备统计（总数、在用、维修中）
     * - 本月订单数
     * - 仓库统计（总数、启用数）
     * - 供应商总数
     *
     * 请求示例：
     * GET /api/system/overview
     *
     * @return 系统概览数据
     */
    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getSystemOverview() {
        return systemService.getSystemOverview();
    }

    /**
     * 获取库存报表
     *
     * 接口说明：
     * 获取库存相关的统计报表数据
     *
     * 返回数据：
     * - 各区域库存分布
     * - 各类型设备分布
     * - 库存预警数量
     *
     * 请求示例：
     * GET /api/system/reports/inventory
     *
     * @return 库存报表数据
     */
    @GetMapping("/reports/inventory")
    public ApiResponse<Map<String, Object>> getInventoryReport() {
        return systemService.getInventoryReport();
    }

    /**
     * 根据PageRequest构建JPA Pageable对象
     *
     * @param pageReq 分页请求对象
     * @return JPA Pageable对象
     */
    private Pageable buildPageable(PageRequest pageReq) {
        if (pageReq.getSort() != null && !pageReq.getSort().isEmpty()) {
            org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(pageReq.getValidOrder())
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;
            return org.springframework.data.domain.PageRequest.of(
                    pageReq.getJpaPage(), pageReq.getSafeSize(),
                    org.springframework.data.domain.Sort.by(direction, pageReq.getSort()));
        }
        return org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(), pageReq.getSafeSize());
    }

    // ==================== 请求对象 ====================

    /**
     * 更新配置请求对象
     */
    public static class UpdateConfigRequest {
        private String configValue;
        private String description;

        public String getConfigValue() {
            return configValue;
        }

        public void setConfigValue(String configValue) {
            this.configValue = configValue;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
