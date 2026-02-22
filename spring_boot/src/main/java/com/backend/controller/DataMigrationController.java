package com.backend.controller;

import com.backend.common.Result;
import com.backend.util.DataMigrationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 数据迁移管理控制器
 * 用于数据迁移的验证和修复操作
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Slf4j
@RestController
@RequestMapping("/admin/migration")
@RequiredArgsConstructor
@Tag(name = "数据迁移管理", description = "数据迁移验证和修复接口")
@PreAuthorize("hasRole('ADMIN')")
public class DataMigrationController {

    private final DataMigrationUtil dataMigrationUtil;

    /**
     * 获取数据迁移状态摘要
     */
    @GetMapping("/status")
    @Operation(summary = "获取迁移状态", description = "获取数据迁移的整体状态摘要")
    public Result<Map<String, Object>> getMigrationStatus() {
        log.info("获取数据迁移状态");

        String statusText = dataMigrationUtil.getMigrationStatus();

        Map<String, Object> result = new HashMap<>();
        result.put("status", statusText);
        result.put("timestamp", System.currentTimeMillis());

        return Result.success(result);
    }

    /**
     * 验证仓库地址数据
     */
    @GetMapping("/validate/warehouse")
    @Operation(summary = "验证仓库数据", description = "验证仓库地址和坐标数据的完整性")
    public Result<Map<String, Object>> validateWarehouseData() {
        log.info("验证仓库地址数据");

        String report = dataMigrationUtil.validateWarehouseAddressData();

        Map<String, Object> result = new HashMap<>();
        result.put("report", report);
        result.put("timestamp", System.currentTimeMillis());

        return Result.success(result);
    }

    /**
     * 验证功能区类型数据
     */
    @GetMapping("/validate/zone-type")
    @Operation(summary = "验证功能区类型", description = "验证功能区类型数据的完整性")
    public Result<Map<String, Object>> validateZoneTypeData() {
        log.info("验证功能区类型数据");

        String report = dataMigrationUtil.validateZoneTypeData();

        Map<String, Object> result = new HashMap<>();
        result.put("report", report);
        result.put("timestamp", System.currentTimeMillis());

        return Result.success(result);
    }

    /**
     * 修复无效坐标
     */
    @PostMapping("/fix/coordinates")
    @Operation(summary = "修复无效坐标", description = "清除所有无效的经纬度坐标")
    public Result<Map<String, Object>> fixInvalidCoordinates() {
        log.info("修复无效坐标");

        int fixedCount = dataMigrationUtil.fixInvalidCoordinates();

        Map<String, Object> result = new HashMap<>();
        result.put("fixedCount", fixedCount);
        result.put("message", String.format("成功修复 %d 个仓库的无效坐标", fixedCount));
        result.put("timestamp", System.currentTimeMillis());

        return Result.success(result);
    }

    /**
     * 修复缺失的功能区类型
     */
    @PostMapping("/fix/zone-types")
    @Operation(summary = "修复功能区类型", description = "为未设置类型的功能区设置默认类型")
    public Result<Map<String, Object>> fixMissingZoneTypes() {
        log.info("修复缺失的功能区类型");

        int fixedCount = dataMigrationUtil.fixMissingZoneTypes();

        Map<String, Object> result = new HashMap<>();
        result.put("fixedCount", fixedCount);
        result.put("message", String.format("成功为 %d 个功能区设置默认类型", fixedCount));
        result.put("timestamp", System.currentTimeMillis());

        return Result.success(result);
    }

    /**
     * 执行完整验证
     */
    @GetMapping("/validate/all")
    @Operation(summary = "完整验证", description = "执行所有数据验证并返回完整报告")
    public Result<Map<String, Object>> validateAll() {
        log.info("执行完整数据验证");

        Map<String, Object> result = new HashMap<>();
        result.put("status", dataMigrationUtil.getMigrationStatus());
        result.put("warehouseValidation", dataMigrationUtil.validateWarehouseAddressData());
        result.put("zoneTypeValidation", dataMigrationUtil.validateZoneTypeData());
        result.put("timestamp", System.currentTimeMillis());

        return Result.success(result);
    }
}
