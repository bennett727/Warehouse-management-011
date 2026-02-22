package com.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import com.backend.entity.ZoneType;
import com.backend.service.ZoneTypeService;

import lombok.RequiredArgsConstructor;

/**
 * 功能区类型管理控制器
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@RestController
@RequestMapping("/zone-types")
@RequiredArgsConstructor
public class ZoneTypeController {

    private final ZoneTypeService zoneTypeService;

    /**
     * 分页查询功能区类型列表
     *
     * @param page     页码
     * @param size     每页大小
     * @param keyword  关键词
     * @param status   状态
     * @param isSystem 是否系统预设
     * @return 分页结果
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Page<ZoneType>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Boolean isSystem) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sort").ascending());
        Page<ZoneType> result = zoneTypeService.findByConditions(keyword, status, isSystem, pageable);
        return ApiResponse.success(result);
    }

    /**
     * 获取所有启用的功能区类型
     *
     * @return 类型列表
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<ZoneType>> getActiveTypes() {
        List<ZoneType> types = zoneTypeService.findAllActive();
        return ApiResponse.success(types);
    }

    /**
     * 获取所有功能区类型
     *
     * @return 类型列表
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<ZoneType>> getAllTypes() {
        List<ZoneType> types = zoneTypeService.findAll();
        return ApiResponse.success(types);
    }

    /**
     * 根据ID查询功能区类型
     *
     * @param id 类型ID
     * @return 类型信息
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<ZoneType> getById(@PathVariable Long id) {
        ZoneType zoneType = zoneTypeService.findById(id).orElse(null);
        if (zoneType == null) {
            return ApiResponse.error(404, "功能区类型不存在");
        }
        return ApiResponse.success(zoneType);
    }

    /**
     * 创建功能区类型
     *
     * @param zoneType 类型信息
     * @return 创建后的类型
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ZoneType> create(@RequestBody ZoneType zoneType) {
        try {
            ZoneType created = zoneTypeService.createZoneType(zoneType);
            return ApiResponse.success(created);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "创建功能区类型失败: " + e.getMessage());
        }
    }

    /**
     * 更新功能区类型
     *
     * @param id       类型ID
     * @param zoneType 类型信息
     * @return 更新后的类型
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ZoneType> update(@PathVariable Long id, @RequestBody ZoneType zoneType) {
        try {
            ZoneType updated = zoneTypeService.updateZoneType(id, zoneType);
            return ApiResponse.success(updated);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新功能区类型失败: " + e.getMessage());
        }
    }

    /**
     * 删除功能区类型
     *
     * @param id 类型ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        try {
            zoneTypeService.deleteZoneType(id);
            return ApiResponse.success();
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "删除功能区类型失败: " + e.getMessage());
        }
    }

    /**
     * 更新功能区类型状态
     *
     * @param id     类型ID
     * @param status 状态
     * @return 更新后的类型
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ZoneType> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        try {
            ZoneType updated = zoneTypeService.updateStatus(id, status);
            return ApiResponse.success(updated);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新状态失败: " + e.getMessage());
        }
    }

    /**
     * 获取功能区类型统计
     *
     * @return 统计信息
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Map<String, Object>> getStats() {
        List<ZoneType> allTypes = zoneTypeService.findAll();
        List<ZoneType> activeTypes = zoneTypeService.findAllActive();

        long systemCount = allTypes.stream().filter(ZoneType::getIsSystem).count();
        long customCount = allTypes.stream().filter(t -> !t.getIsSystem()).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", allTypes.size());
        stats.put("activeCount", activeTypes.size());
        stats.put("systemCount", systemCount);
        stats.put("customCount", customCount);

        return ApiResponse.success(stats);
    }

    /**
     * 初始化系统预设类型
     *
     * @return 操作结果
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> initializeSystemTypes() {
        try {
            zoneTypeService.initializeSystemTypes();
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error(500, "初始化系统预设类型失败: " + e.getMessage());
        }
    }
}
