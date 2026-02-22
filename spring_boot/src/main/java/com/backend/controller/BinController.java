package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.Bin;
import com.backend.service.bin.BinService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 货位管理控制器
 *
 * 功能说明：
 * 提供货位基础数据管理的RESTful API接口，包括：
 * - 货位列表查询
 * - 货位详情查询
 * - 货位创建
 * - 货位更新
 * - 货位删除
 * - 可用货位查询
 * - 批量创建货位
 *
 * 权限控制：
 * - ADMIN: 所有操作
 * - OPERATOR: 查看和部分操作
 *
 * API路径：/api/bins
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/bins")
@RequiredArgsConstructor
@Tag(name = "货位管理", description = "货位的增删改查、可用货位查询等接口")
public class BinController {

    private final BinService binService;

    /**
     * 获取货位列表
     *
     * 接口说明：
     * 查询货位信息，支持分页
     *
     * 请求示例：
     * GET /api/bins?page=0&pageSize=10
     *
     * @param pageReq 分页参数对象（page/size/sort/order）
     * @return 分页货位列表
     */
    @GetMapping
    @Operation(summary = "获取货位列表", description = "查询货位信息，支持分页和筛选")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Map<String, Object>> getBinList(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "仓库ID") @RequestParam(required = false) Long warehouseId,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "货位类型") @RequestParam(required = false) String type) {
        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    page - 1, size, Sort.by("id").ascending());
            Page<Bin> binPage = binService.getBinList(pageable);
            
            Map<String, Object> result = new HashMap<>();
            result.put("records", binPage.getContent());
            result.put("total", binPage.getTotalElements());
            result.put("page", page);
            result.put("size", size);
            result.put("pages", binPage.getTotalPages());
            
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(500, "获取货位列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取货位详情
     *
     * 接口说明：
     * 根据货位ID查询货位详细信息
     *
     * 请求示例：
     * GET /api/bins/1
     *
     * @param id 货位ID
     * @return 货位详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Bin> getBinById(@PathVariable Long id) {
        Bin bin = binService.getBinById(id);
        if (bin == null) {
            return ApiResponse.error(404, "货位不存在");
        }
        return ApiResponse.success(bin);
    }

    /**
     * 创建货位
     *
     * 接口说明：
     * 创建新的货位记录
     *
     * 请求示例：
     * POST /api/bins
     * {
     *   "code": "A-01-01-01",
     *   "name": "A区01排01列01层",
     *   "areaId": 1,
     *   "rowNo": "01",
     *   "columnNo": "01",
     *   "levelNo": "01",
     *   "capacity": 100,
     *   "status": 1
     * }
     *
     * @param bin 货位信息
     * @return 创建后的货位信息
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Bin> createBin(@RequestBody Bin bin) {
        try {
            Bin created = binService.createBin(bin);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error(500, "创建货位失败: " + e.getMessage());
        }
    }

    /**
     * 更新货位
     *
     * 接口说明：
     * 更新指定货位的信息
     *
     * 请求示例：
     * PUT /api/bins/1
     * {
     *   "code": "A-01-01-01",
     *   "name": "A区01排01列01层（更新）",
     *   "areaId": 1,
     *   "capacity": 150,
     *   "status": 1
     * }
     *
     * @param id 货位ID
     * @param bin 货位信息
     * @return 更新后的货位信息
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Bin> updateBin(@PathVariable Long id, @RequestBody Bin bin) {
        try {
            Bin updated = binService.updateBin(id, bin);
            if (updated == null) {
                return ApiResponse.error(404, "货位不存在");
            }
            return ApiResponse.success(updated);
        } catch (Exception e) {
            return ApiResponse.error(500, "更新货位失败: " + e.getMessage());
        }
    }

    /**
     * 删除货位
     *
     * 接口说明：
     * 删除指定的货位记录
     *
     * 请求示例：
     * DELETE /api/bins/1
     *
     * @param id 货位ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteBin(@PathVariable Long id) {
        try {
            binService.deleteBin(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            return ApiResponse.error(500, "删除货位失败: " + e.getMessage());
        }
    }

    /**
     * 获取可用货位列表
     *
     * 接口说明：
     * 查询所有状态为可用的货位列表
     *
     * 请求示例：
     * GET /api/bins/available
     *
     * @return 可用货位列表
     */
    @GetMapping("/available")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<Bin>> getAvailableBins() {
        List<Bin> bins = binService.getAvailableBins();
        return ApiResponse.success(bins);
    }

    /**
     * 根据区域ID获取货位列表
     *
     * 接口说明：
     * 查询指定区域下的所有货位
     *
     * 请求示例：
     * GET /api/bins/area/1
     *
     * @param areaId 区域ID
     * @return 货位列表
     */
    @GetMapping("/area/{areaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<Bin>> getBinsByAreaId(@PathVariable Long areaId) {
        List<Bin> bins = binService.getBinsByAreaId(areaId);
        return ApiResponse.success(bins);
    }

    /**
     * 批量创建货位
     *
     * 接口说明：
     * 批量创建多个货位记录
     *
     * 请求示例：
     * POST /api/bins/batch
     * [
     *   {
     *     "code": "A-01-01-01",
     *     "name": "A区01排01列01层",
     *     "areaId": 1
     *   },
     *   {
     *     "code": "A-01-01-02",
     *     "name": "A区01排01列02层",
     *     "areaId": 1
     *   }
     * ]
     *
     * @param bins 货位列表
     * @return 创建的货位列表
     */
    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Bin>> batchCreateBins(@RequestBody List<Bin> bins) {
        try {
            List<Bin> created = binService.batchCreateBins(bins);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error(500, "批量创建货位失败: " + e.getMessage());
        }
    }
}
