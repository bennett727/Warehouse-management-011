package com.backend.controller;

import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.backend.entity.Warehouse;
import com.backend.service.warehouse.WarehouseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 仓库管理控制器
 *
 * 功能说明：
 * 提供仓库基础数据管理的RESTful API接口，包括：
 * - 仓库列表查询
 * - 仓库详情查询
 * - 仓库创建
 * - 仓库更新
 * - 仓库删除
 * - 仓库统计信息
 *
 * 权限控制：
 * - ADMIN: 所有操作
 * - OPERATOR: 查看和部分操作
 *
 * API路径：/api/system/warehouses
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@Tag(name = "仓库管理", description = "仓库的增删改查、统计等接口")
public class WarehouseController {

    private final WarehouseService warehouseService;

    /**
     * 获取仓库列表
     *
     * 接口说明：
     * 查询仓库信息，支持分页
     *
     * 请求示例：
     * GET /api/system/warehouses?page=0&pageSize=10
     *
     * @param pageReq 分页参数对象（page/size/sort/order）
     * @return 分页仓库列表
     */
    @GetMapping
    @Operation(summary = "获取仓库列表", description = "查询仓库信息，支持分页")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<PageResult<Warehouse>> getWarehouseList(@Valid PageRequest pageReq) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(
                pageReq.getPage(), pageReq.getSize());
        PageResult<Warehouse> result = warehouseService.getWarehouses(pageable);
        return ApiResponse.success(result);
    }

    /**
     * 获取仓库详情
     *
     * 接口说明：
     * 根据仓库ID查询仓库详细信息
     *
     * 请求示例：
     * GET /api/system/warehouses/1
     *
     * @param id 仓库ID
     * @return 仓库详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取仓库详情", description = "根据仓库ID查询仓库详细信息")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Warehouse> getWarehouseById(
            @Parameter(description = "仓库ID") @PathVariable Long id) {
        Warehouse warehouse = warehouseService.getWarehouseById(id);
        if (warehouse == null) {
            return ApiResponse.error(404, "仓库不存在");
        }
        return ApiResponse.success(warehouse);
    }

    /**
     * 创建仓库
     *
     * 接口说明：
     * 创建新的仓库记录
     *
     * 请求示例：
     * POST /api/system/warehouses
     * {
     * "warehouseCode": "GZ-001",
     * "warehouseName": "广州仓库",
     * "address": "广东省广州市天河区xxx路xxx号",
     * "contactPerson": "张三",
     * "contactPhone": "13800138000",
     * "areaSize": 5000,
     * "capacity": 10000,
     * "status": 1
     * }
     *
     * @param warehouse 仓库信息
     * @return 创建后的仓库信息
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        try {
            Warehouse created = warehouseService.createWarehouse(warehouse);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error(500, "创建仓库失败: " + e.getMessage());
        }
    }

    /**
     * 更新仓库
     *
     * 接口说明：
     * 更新指定仓库的信息
     *
     * 请求示例：
     * PUT /api/system/warehouses/1
     * {
     * "warehouseName": "广州仓库（更新）",
     * "address": "广东省广州市天河区xxx路xxx号",
     * "contactPerson": "张三",
     * "contactPhone": "13800138000",
     * "areaSize": 5000,
     * "capacity": 10000,
     * "status": 1
     * }
     *
     * @param id        仓库ID
     * @param warehouse 仓库信息
     * @return 更新后的仓库信息
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Warehouse> updateWarehouse(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        try {
            Warehouse updated = warehouseService.updateWarehouse(id, warehouse);
            if (updated == null) {
                return ApiResponse.error(404, "仓库不存在");
            }
            return ApiResponse.success(updated);
        } catch (Exception e) {
            return ApiResponse.error(500, "更新仓库失败: " + e.getMessage());
        }
    }

    /**
     * 删除仓库
     *
     * 接口说明：
     * 删除指定的仓库记录
     *
     * 请求示例：
     * DELETE /api/system/warehouses/1
     *
     * @param id 仓库ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteWarehouse(@PathVariable Long id) {
        try {
            warehouseService.deleteWarehouse(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            return ApiResponse.error(500, "删除仓库失败: " + e.getMessage());
        }
    }

    /**
     * 获取仓库统计信息
     *
     * 接口说明：
     * 查询指定仓库的统计信息，包括区域数量、货位数量、设备数量等
     *
     * 请求示例：
     * GET /api/system/warehouses/1/stats
     *
     * @param id 仓库ID
     * @return 仓库统计信息
     */
    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Map<String, Object>> getWarehouseStats(@PathVariable Long id) {
        Map<String, Object> stats = warehouseService.getWarehouseStats(id);
        if (stats == null) {
            return ApiResponse.error(404, "仓库不存在");
        }
        return ApiResponse.success(stats);
    }

    /**
     * 获取所有启用的仓库
     *
     * 接口说明：
     * 查询所有状态为启用的仓库列表，用于下拉选择
     *
     * 请求示例：
     * GET /api/system/warehouses/active
     *
     * @return 启用的仓库列表
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<java.util.List<Warehouse>> getActiveWarehouses() {
        java.util.List<Warehouse> warehouses = warehouseService.getActiveWarehouses();
        return ApiResponse.success(warehouses);
    }

    /**
     * 更新仓库地址
     *
     * 接口说明：
     * 更新仓库的行政区划地址信息
     *
     * 请求示例：
     * PUT /api/system/warehouses/1/address
     * {
     * "provinceId": 440000,
     * "cityId": 440100,
     * "districtId": 440106,
     * "detailAddress": "天河路123号",
     * "longitude": 113.2644,
     * "latitude": 23.1291
     * }
     *
     * @param id      仓库ID
     * @param address 地址信息
     * @return 更新后的仓库信息
     */
    @PutMapping("/{id}/address")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Warehouse> updateWarehouseAddress(@PathVariable Long id,
            @RequestBody Map<String, Object> address) {
        try {
            Warehouse updated = warehouseService.updateWarehouseAddress(id, address);
            if (updated == null) {
                return ApiResponse.error(404, "仓库不存在");
            }
            return ApiResponse.success(updated);
        } catch (Exception e) {
            return ApiResponse.error(500, "更新仓库地址失败: " + e.getMessage());
        }
    }

    /**
     * 按行政区划筛选仓库
     *
     * 接口说明：
     * 根据省市区ID筛选仓库
     *
     * 请求示例：
     * GET /api/system/warehouses/by-division?provinceId=440000&cityId=440100
     *
     * @param provinceId 省份ID（可选）
     * @param cityId     城市ID（可选）
     * @param districtId 区县ID（可选）
     * @return 仓库列表
     */
    @GetMapping("/by-division")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<java.util.List<Warehouse>> getWarehousesByDivision(
            @RequestParam(required = false) Long provinceId,
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) Long districtId) {
        java.util.List<Warehouse> warehouses = warehouseService.getWarehousesByDivision(provinceId, cityId, districtId);
        return ApiResponse.success(warehouses);
    }

    /**
     * 获取仓库概览统计
     *
     * 接口说明：
     * 查询所有仓库的概览统计信息
     *
     * 请求示例：
     * GET /api/system/warehouses/overview/stats
     *
     * @return 仓库概览统计
     */
    @GetMapping("/overview/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Map<String, Object>> getWarehouseOverviewStats() {
        Map<String, Object> stats = warehouseService.getWarehouseOverviewStats();
        return ApiResponse.success(stats);
    }
}
