package com.backend.controller;

import com.backend.common.Result;
import com.backend.entity.WarehouseZone;
import com.backend.service.WarehouseZoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 仓库功能区管理控制器
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Slf4j
@RestController
@RequestMapping("/warehouse-zones")
@RequiredArgsConstructor
@Tag(name = "仓库功能区管理", description = "管理仓库内部的功能分区")
public class WarehouseZoneController {

    private final WarehouseZoneService warehouseZoneService;

    /**
     * 分页查询功能区列表
     */
    @GetMapping
    @Operation(summary = "查询功能区列表", description = "分页查询仓库功能区列表")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public Result<Map<String, Object>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long zoneTypeId,
            @RequestParam(required = false) Integer status) {
        log.info("查询功能区列表, page={}, size={}, keyword={}, warehouseId={}, zoneTypeId={}, status={}",
                page, size, keyword, warehouseId, zoneTypeId, status);

        Pageable pageable = PageRequest.of(page, size, Sort.by("sort").ascending());
        Page<WarehouseZone> zonePage = warehouseZoneService.findZones(pageable, keyword, warehouseId, zoneTypeId, status);

        Map<String, Object> result = new HashMap<>();
        result.put("content", zonePage.getContent());
        result.put("totalElements", zonePage.getTotalElements());
        result.put("totalPages", zonePage.getTotalPages());
        result.put("number", zonePage.getNumber());
        result.put("size", zonePage.getSize());

        return Result.success(result);
    }

    /**
     * 根据ID查询功能区详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询功能区详情", description = "根据ID查询功能区详细信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public Result<WarehouseZone> getById(
            @Parameter(description = "功能区ID") @PathVariable Long id) {
        log.info("查询功能区详情, id={}", id);
        WarehouseZone zone = warehouseZoneService.findById(id);
        return Result.success(zone);
    }

    /**
     * 根据仓库ID查询功能区列表
     */
    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "查询仓库功能区", description = "根据仓库ID查询该仓库的所有功能区")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public Result<List<WarehouseZone>> getByWarehouseId(
            @Parameter(description = "仓库ID") @PathVariable Long warehouseId) {
        log.info("查询仓库功能区, warehouseId={}", warehouseId);
        List<WarehouseZone> zones = warehouseZoneService.findByWarehouseId(warehouseId);
        return Result.success(zones);
    }

    /**
     * 创建功能区
     */
    @PostMapping
    @Operation(summary = "创建功能区", description = "创建新的仓库功能区")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<WarehouseZone> create(@RequestBody WarehouseZone zone) {
        log.info("创建功能区: {}", zone.getCode());
        WarehouseZone createdZone = warehouseZoneService.createZone(zone);
        return Result.success(createdZone);
    }

    /**
     * 更新功能区
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新功能区", description = "更新功能区信息")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<WarehouseZone> update(
            @Parameter(description = "功能区ID") @PathVariable Long id,
            @RequestBody WarehouseZone zone) {
        log.info("更新功能区, id={}", id);
        WarehouseZone updatedZone = warehouseZoneService.updateZone(id, zone);
        return Result.success(updatedZone);
    }

    /**
     * 删除功能区
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除功能区", description = "删除指定的功能区")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(
            @Parameter(description = "功能区ID") @PathVariable Long id) {
        log.info("删除功能区, id={}", id);
        warehouseZoneService.deleteZone(id);
        return Result.success();
    }

    /**
     * 更新功能区状态
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新功能区状态", description = "启用或停用功能区")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<WarehouseZone> updateStatus(
            @Parameter(description = "功能区ID") @PathVariable Long id,
            @RequestParam Integer status) {
        log.info("更新功能区状态, id={}, status={}", id, status);
        WarehouseZone zone = warehouseZoneService.updateStatus(id, status);
        return Result.success(zone);
    }

    /**
     * 获取统计信息
     */
    @GetMapping("/stats")
    @Operation(summary = "获取统计信息", description = "获取功能区统计信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public Result<Map<String, Object>> getStatistics() {
        log.info("获取功能区统计信息");
        Map<String, Object> stats = warehouseZoneService.getStatistics();
        return Result.success(stats);
    }
}
