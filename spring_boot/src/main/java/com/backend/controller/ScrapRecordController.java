package com.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.controller.base.BaseController;
import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.repository.DeviceRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/devices/scrap-records")
@RequiredArgsConstructor
@Tag(name = "报废记录管理", description = "设备报废记录的查询接口")
public class ScrapRecordController extends BaseController {

    private final DeviceRepository deviceRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN') or hasRole('VIEWER')")
    @Operation(summary = "获取报废记录列表", description = "分页查询设备报废记录列表")
    public ApiResponse<PageResult<Map<String, Object>>> getScrapRecordList(
            @Parameter(description = "关键词（设备编号/名称）") @RequestParam(required = false) String keyword,
            @Parameter(description = "设备类型ID") @RequestParam(required = false) Long typeId,
            @Parameter(description = "区域ID") @RequestParam(required = false) Long areaId,
            @Parameter(description = "开始日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        log.info("获取报废记录列表: keyword={}, typeId={}, areaId={}", keyword, typeId, areaId);

        Pageable pageable = org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(),
                pageReq.getSafeSize(),
                Sort.by(Sort.Direction.DESC, "scrapTime"));

        Page<Device> scrapPage = deviceRepository.findScrapRecords(
                DeviceStatus.SCRAPPED.getCode(),
                keyword,
                startDate,
                endDate,
                pageable);

        List<Map<String, Object>> records = scrapPage.getContent().stream()
                .map(this::convertToMap)
                .toList();

        PageResult<Map<String, Object>> result = PageResult.of(scrapPage, records);

        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN') or hasRole('VIEWER')")
    @Operation(summary = "获取报废记录详情", description = "根据ID查询设备报废记录详情")
    public ApiResponse<Map<String, Object>> getScrapRecordById(
            @Parameter(description = "记录ID") @PathVariable Long id) {
        log.info("获取报废记录详情: id={}", id);

        Device device = deviceRepository.findById(id).orElse(null);
        if (device == null || device.getStatus() != DeviceStatus.SCRAPPED.getCode()) {
            return ApiResponse.error(404, "报废记录不存在");
        }

        return ApiResponse.success(convertToMap(device));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('VIEWER')")
    @Operation(summary = "获取报废统计信息", description = "获取设备报废统计信息")
    public ApiResponse<Map<String, Object>> getScrapStatistics() {
        log.info("获取报废统计信息");

        long totalScrap = deviceRepository.countByStatus(DeviceStatus.SCRAPPED.getCode());

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalScrapCount", totalScrap);
        statistics.put("pendingApproval", 0);
        statistics.put("approved", totalScrap);

        return ApiResponse.success(statistics);
    }

    private Map<String, Object> convertToMap(Device device) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", device.getId());
        map.put("deviceCode", device.getDeviceCode());
        map.put("deviceName", device.getDeviceName());
        map.put("deviceType", device.getDeviceType());
        map.put("status", device.getStatus());
        map.put("statusName", "已报废");
        map.put("scrapReason", device.getScrapReason());
        map.put("scrapTime", device.getScrapTime());
        map.put("areaId", device.getAreaId());
        map.put("areaName", device.getAreaName());
        map.put("warehouseId", device.getWarehouseId());
        map.put("warehouseName", device.getWarehouseName());
        map.put("createTime", device.getCreateTime());
        map.put("updateTime", device.getUpdateTime());
        return map;
    }
}
