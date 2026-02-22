package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.AdministrativeDivision;
import com.backend.service.DivisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 行政区划管理控制器
 *
 * 功能说明：
 * 提供省市区三级行政区划的RESTful API接口，包括：
 * - 行政区划树查询
 * - 省市区级联查询
 * - 行政区划增删改查
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@RestController
@RequestMapping("/system/divisions")
@RequiredArgsConstructor
public class DivisionController {

    private final DivisionService divisionService;

    /**
     * 获取行政区划树
     *
     * @param parentId 父级ID（null表示查询省级）
     * @return 行政区划列表
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<AdministrativeDivision>> getDivisionTree(
            @RequestParam(required = false) Long parentId) {
        List<AdministrativeDivision> divisions = divisionService.getDivisionTree(parentId);
        return ApiResponse.success(divisions);
    }

    /**
     * 获取所有省份
     *
     * @return 省份列表
     */
    @GetMapping("/provinces")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<AdministrativeDivision>> getProvinces() {
        List<AdministrativeDivision> provinces = divisionService.getProvinces();
        return ApiResponse.success(provinces);
    }

    /**
     * 获取指定省份下的城市
     *
     * @param provinceId 省份ID
     * @return 城市列表
     */
    @GetMapping("/{provinceId}/cities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<AdministrativeDivision>> getCities(@PathVariable Long provinceId) {
        List<AdministrativeDivision> cities = divisionService.getCities(provinceId);
        return ApiResponse.success(cities);
    }

    /**
     * 获取指定城市下的区县
     *
     * @param cityId 城市ID
     * @return 区县列表
     */
    @GetMapping("/cities/{cityId}/districts")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<AdministrativeDivision>> getDistricts(@PathVariable Long cityId) {
        List<AdministrativeDivision> districts = divisionService.getDistricts(cityId);
        return ApiResponse.success(districts);
    }

    /**
     * 根据ID获取行政区划
     *
     * @param id 行政区划ID
     * @return 行政区划信息
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<AdministrativeDivision> getDivisionById(@PathVariable Long id) {
        AdministrativeDivision division = divisionService.getDivisionById(id);
        if (division == null) {
            return ApiResponse.error(404, "行政区划不存在");
        }
        return ApiResponse.success(division);
    }

    /**
     * 创建行政区划
     *
     * @param division 行政区划信息
     * @return 创建结果
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdministrativeDivision> createDivision(@RequestBody AdministrativeDivision division) {
        try {
            AdministrativeDivision created = divisionService.createDivision(division);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error(500, "创建行政区划失败: " + e.getMessage());
        }
    }

    /**
     * 更新行政区划
     *
     * @param id 行政区划ID
     * @param division 行政区划信息
     * @return 更新结果
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdministrativeDivision> updateDivision(
            @PathVariable Long id,
            @RequestBody AdministrativeDivision division) {
        try {
            AdministrativeDivision updated = divisionService.updateDivision(id, division);
            if (updated == null) {
                return ApiResponse.error(404, "行政区划不存在");
            }
            return ApiResponse.success(updated);
        } catch (Exception e) {
            return ApiResponse.error(500, "更新行政区划失败: " + e.getMessage());
        }
    }

    /**
     * 删除行政区划
     *
     * @param id 行政区划ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteDivision(@PathVariable Long id) {
        try {
            divisionService.deleteDivision(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            return ApiResponse.error(500, "删除行政区划失败: " + e.getMessage());
        }
    }

    /**
     * 获取行政区划统计信息
     *
     * @param id 行政区划ID
     * @return 统计信息
     */
    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<java.util.Map<String, Object>> getDivisionStats(@PathVariable Long id) {
        java.util.Map<String, Object> stats = divisionService.getDivisionStats(id);
        return ApiResponse.success(stats);
    }
}
