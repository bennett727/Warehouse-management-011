package com.backend.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.constants.ApiPathConstants.SystemApi;
import com.backend.controller.base.BaseController;
import com.backend.dto.ApiResponse;
import com.backend.dto.AreaStatusSingleUpdateDTO;
import com.backend.dto.AreaStatusUpdateDTO;
import com.backend.dto.BatchOperationDTO;
import com.backend.entity.Area;
import com.backend.enumtype.EntityType.AreaStatus;
import com.backend.exception.ResourceNotFoundException;
import com.backend.service.area.AreaService;
import com.backend.util.PageResponseBuilder;
import com.backend.validation.PageNumber;
import com.backend.validation.PageSize;
import com.backend.validation.PositiveLong;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping(SystemApi.AREAS)
@SecurityRequirement(name = "Bearer Authentication")
public class AreaController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(AreaController.class);

    private final AreaService service;

    public AreaController(AreaService areaService) {
        super();
        this.service = areaService;
    }

    /**
     * 创建区域
     *
     * @param area 区域实体对象
     * @return 创建成功的区域信息
     */
    @PostMapping
    @Operation(summary = "创建区域", description = "创建新的区域信息")
    public ApiResponse<Area> create(@Valid @RequestBody Area area) {
        logger.info("创建区域: 城市={}, 区={}, 位置={}", area.getCity(), area.getDistrict(), area.getLocation());
        Area savedArea = this.service.saveArea(area);
        logger.info("区域创建成功: {}", savedArea.getId());
        return ApiResponse.success("创建成功", savedArea);
    }

    /**
     * 获取区域列表（支持分页）
     *
     * @param pageNum  页码
     * @param pageSize 每页大小
     * @param areaName 区域名称
     * @param level    区域级别
     * @param parentId 父级区域ID
     * @param status   状态
     * @return 分页区域列表
     */
    @GetMapping("/list")
    @Operation(summary = "获取区域列表", description = "分页获取区域列表，支持多种查询条件")
    public ApiResponse<Map<String, Object>> getAreaList(
            @RequestParam(defaultValue = "1") @PageNumber int page,
            @RequestParam(defaultValue = "10") @PageSize(max = 100) int pageSize,
            @RequestParam(required = false) String areaName,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Integer status) {
        logger.info("获取区域列表，页码: {}, 每页大小: {}, 区域名称: {}, 级别: {}, 父级ID: {}, 仓库ID: {}, 状态: {}",
                page, pageSize, areaName, level, parentId, warehouseId, status);

        try {
            int pageZeroBased = convertToZeroBasedPage(page);
            Pageable pageable = PageRequest.of(pageZeroBased, pageSize, Sort.by("id").ascending());
            logger.info("调用areaService.getAreaList方法");
            AreaStatus areaStatus = status != null ? AreaStatus.fromCode(status) : null;
            Page<Area> areaPage = service.getAreaList(areaName, level, parentId, warehouseId, areaStatus, pageable);

            if (areaPage == null) {
                logger.warn("service.getAreaList返回null，返回空结果");
                Map<String, Object> emptyResult = Map.of(
                        "records", Collections.emptyList(),
                        "total", 0L,
                        "page", page,
                        "pageSize", pageSize,
                        "totalPages", 0);
                return ApiResponse.success(emptyResult);
            }

            logger.info("service.getAreaList方法调用完成，返回记录数: {}", areaPage.getContent().size());
            logger.info("成功获取区域列表，记录数: {}", areaPage.getContent().size());

            Map<String, Object> result = PageResponseBuilder.buildPageResponse(areaPage, page, pageSize);
            return ApiResponse.success(result);
        } catch (Exception e) {
            logger.error("获取区域列表时发生错误: ", e);
            throw e;
        }
    }

    /**
     * 获取所有区域列表（不分页）
     *
     * @return 区域列表
     */
    @GetMapping
    @Operation(summary = "获取所有区域", description = "获取所有区域列表（不分页）")
    public ApiResponse<List<Area>> getAllAreas() {
        logger.info("获取所有区域列表");
        List<Area> areas = service.getAllAreas();
        return ApiResponse.success(areas);
    }

    /**
     * 获取所有区域列表（兼容路径）
     *
     * @return 区域列表
     */
    @GetMapping("/all")
    @Operation(summary = "获取所有区域（兼容路径）", description = "获取所有区域列表（不分页）")
    public ApiResponse<List<Area>> getAllAreasCompat() {
        logger.info("获取所有区域列表（兼容路径）");
        List<Area> areas = service.getAllAreas();
        return ApiResponse.success(areas);
    }

    /**
     * 根据ID获取区域
     *
     * @param id 区域ID
     * @return 区域详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取区域详情", description = "根据ID获取区域详情")
    public ApiResponse<Area> getById(@PathVariable Long id) {
        logger.info("根据ID获取区域: {}", id);
        Area area = service.getAreaById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Area", "id", id));
        return ApiResponse.success(area);
    }

    /**
     * 根据城市-区-位置组合获取区域
     *
     * @param city     城市
     * @param district 区
     * @param location 位置
     * @return 区域详情
     */
    @GetMapping("/location/{city}/{district}/{location}")
    @Operation(summary = "根据位置获取区域", description = "根据城市-区-位置组合查找区域")
    public ApiResponse<Area> getAreaByLocation(@PathVariable String city, @PathVariable String district,
            @PathVariable String location) {
        logger.info("根据位置获取区域: 城市={}, 区={}, 位置={}", city, district, location);
        Area area = service.getAreaByLocation(city, district, location);
        if (area == null) {
            throw new ResourceNotFoundException("Area", "location", city + "/" + district + "/" + location);
        }
        return ApiResponse.success(area);
    }

    /**
     * 更新区域
     *
     * @param id          区域ID
     * @param areaDetails 区域更新信息
     * @return 更新后的区域信息
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新区域", description = "更新指定ID的区域信息")
    public ApiResponse<Area> update(@PathVariable Long id, @Valid @RequestBody Area areaDetails) {
        logger.info("更新区域: {}", id);
        Area updatedArea = service.updateArea(id, areaDetails);
        logger.info("区域更新成功: {}", updatedArea.getId());
        return ApiResponse.success("更新成功", updatedArea);
    }

    /**
     * 删除区域
     *
     * @param id 区域ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除区域", description = "删除指定ID的区域")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        logger.info("删除区域: {}", id);
        service.deleteArea(id);
        logger.info("区域删除成功: {}", id);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 批量删除区域
     *
     * @param request 包含区域ID数组的请求
     * @return 删除结果
     */
    @PostMapping("/batch-delete")
    @Operation(summary = "批量删除区域", description = "批量删除多个区域")
    public ApiResponse<Void> batchDeleteArea(@Valid @RequestBody BatchOperationDTO request) {
        List<Long> ids = request.getAreaIds();
        logger.info("批量删除区域，数量: {}", ids.size());
        int deletedCount = service.batchDeleteArea(ids);
        logger.info("批量删除区域成功，删除数量: {}", deletedCount);
        return ApiResponse.success("成功删除" + deletedCount + "个区域", null);
    }

    /**
     * 批量删除区域（兼容旧路径）
     *
     * @param request 包含区域ID数组的请求
     * @return 删除结果
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除区域（兼容旧路径）", description = "批量删除多个区域")
    public ApiResponse<Void> batchDeleteAreaOld(@Valid @RequestBody BatchOperationDTO request) {
        return batchDeleteArea(request);
    }

    /**
     * 更新区域状态
     *
     * @param id        区域ID
     * @param statusDTO 状态（1启用，0禁用）
     * @return 更新结果
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新区域状态", description = "更新区域的启用/禁用状态")
    public ApiResponse<Void> updateAreaStatus(@PathVariable @PositiveLong Long id,
            @RequestBody AreaStatusSingleUpdateDTO statusDTO) {
        logger.info("更新区域状态，ID: {}, 状态: {}", id, statusDTO.getStatus());
        AreaStatus areaStatus = statusDTO.getStatus() != null ? AreaStatus.fromCode(statusDTO.getStatus()) : null;
        service.updateAreaStatus(id, areaStatus);
        logger.info("区域状态更新成功: {}", id);
        return ApiResponse.success("更新成功", null);
    }

    /**
     * 批量更新区域状态
     *
     * @param request 包含区域ID数组和状态的请求
     * @return 更新结果
     */
    @PostMapping("/batch-update-status")
    @Operation(summary = "批量更新区域状态", description = "批量更新多个区域的启用/禁用状态")
    public ApiResponse<Void> batchUpdateAreaStatus(@Valid @RequestBody AreaStatusUpdateDTO request) {
        List<Long> ids = request.getAreaIds();
        AreaStatus status = request.getStatus() != null ? AreaStatus.fromCode(request.getStatus()) : null;

        logger.info("批量更新区域状态，数量: {}, 状态: {}", ids.size(), status);
        int updatedCount = service.batchUpdateAreaStatus(ids, status);
        logger.info("批量更新区域状态成功，更新数量: {}", updatedCount);
        return ApiResponse.success("成功更新" + updatedCount + "个区域的状态", null);
    }

    /**
     * 导出区域列表
     *
     * @param areaName 区域名称
     * @param level    区域级别
     * @param parentId 父级区域ID
     * @param status   状态
     * @return 文件流
     */
    @GetMapping("/export")
    @Operation(summary = "导出区域列表", description = "导出区域数据为Excel文件")
    public ResponseEntity<byte[]> exportAreaList(
            @RequestParam(required = false) String areaName,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Integer status) {
        logger.info("导出区域列表，条件: 区域名称={}, 级别={}, 父级ID={}, 仓库ID={}, 状态={}",
                areaName, level, parentId, warehouseId, status);

        AreaStatus areaStatus = status != null ? AreaStatus.fromCode(status) : null;
        byte[] excelBytes = service.exportAreaList(areaName, level, parentId, warehouseId, areaStatus);
        String fileName = "区域数据_" + System.currentTimeMillis() + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", fileName);

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    /**
     * 获取区域树
     *
     * @param status 状态过滤（可选）
     * @return 区域树结构
     */
    @GetMapping("/tree")
    @Operation(summary = "获取区域树", description = "获取区域的树形结构数据")
    public ApiResponse<List<Map<String, Object>>> getAreaTree(@RequestParam(required = false) Integer status) {
        logger.info("获取区域树，状态过滤: {}", status);
        AreaStatus areaStatus = status != null ? AreaStatus.fromCode(status) : null;
        List<Map<String, Object>> areaTree = service.getAreaTree(areaStatus);
        return ApiResponse.success(areaTree);
    }

    /**
     * 根据城市获取区域列表
     *
     * @param city   城市名称
     * @param status 状态过滤（可选）
     * @return 区域列表
     */
    @GetMapping("/city/{city}")
    @Operation(summary = "根据城市获取区域列表", description = "获取指定城市的区域列表")
    public ApiResponse<List<Area>> getAreaListByCity(@PathVariable String city,
            @RequestParam(required = false) Integer status) {
        logger.info("根据城市获取区域列表，城市: {}, 状态过滤: {}", city, status);
        AreaStatus areaStatus = status != null ? AreaStatus.fromCode(status) : null;
        List<Area> areas = service.getAreaListByCity(city, areaStatus);
        return ApiResponse.success(areas);
    }

    /**
     * 校验区域位置是否存在
     *
     * @param city     城市
     * @param district 区
     * @param location 位置
     * @param id       区域ID（编辑时传入，排除当前记录）
     * @return 校验结果
     */
    @GetMapping("/check-location")
    @Operation(summary = "校验区域位置", description = "校验城市-区-位置组合是否已存在")
    public ApiResponse<Map<String, Boolean>> checkAreaLocationExists(@RequestParam String city,
            @RequestParam String district,
            @RequestParam String location,
            @RequestParam(required = false) Long id) {
        logger.info("校验区域位置是否存在: 城市={}, 区={}, 位置={}, ID: {}", city, district, location, id);
        boolean exists = service.existsByLocation(city, district, location, id);
        return ApiResponse.success(Map.of("exists", exists));
    }

    /**
     * 校验区域代码是否存在
     *
     * @param code 区域代码
     * @param id   区域ID（编辑时传入，排除当前记录）
     * @return 校验结果
     */
    @GetMapping("/check-code")
    @Operation(summary = "校验区域代码", description = "校验区域代码是否已存在")
    public ApiResponse<Map<String, Boolean>> checkAreaCodeExists(@RequestParam String code,
            @RequestParam(required = false) Long id) {
        logger.info("校验区域代码是否存在: {}, ID: {}", code, id);
        boolean exists = service.existsByCode(code, id);
        return ApiResponse.success(Map.of("exists", exists));
    }

    /**
     * 根据父区域ID获取子区域列表
     *
     * @param parentId 父区域ID
     * @return 子区域列表
     */
    @GetMapping("/{parentId}/children")
    @Operation(summary = "获取子区域列表", description = "根据父区域ID获取子区域列表")
    public ApiResponse<List<Area>> getChildAreas(@PathVariable Long parentId) {
        logger.info("获取子区域列表，父区域ID: {}", parentId);

        // 根据父区域ID获取父区域信息
        Area parentArea = service.getAreaById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Area", "id", parentId));

        // 获取与父区域同城市同区的所有区域作为子区域（简化实现）
        List<Area> areas = service.getAllAreas();
        List<Area> childAreas = areas.stream()
                .filter(area -> parentArea.getCity().equals(area.getCity()) &&
                        parentArea.getDistrict().equals(area.getDistrict()))
                .collect(Collectors.toList());

        return ApiResponse.success(childAreas);
    }

    /**
     * 根据父区域ID获取子区域列表（兼容旧路径）
     *
     * @param parentId 父区域ID
     * @return 子区域列表
     */
    @GetMapping("/children/{parentId}")
    @Operation(summary = "获取子区域列表（兼容旧路径）", description = "根据父区域ID获取子区域列表")
    public ApiResponse<List<Area>> getChildAreasOld(@PathVariable Long parentId) {
        // 调用相同的逻辑
        return getChildAreas(parentId);
    }

    /**
     * 获取所有城市列表（用于三级联动）
     *
     * @return 城市列表
     */
    @GetMapping("/cities")
    @Operation(summary = "获取城市列表", description = "获取所有启用的城市列表")
    public ApiResponse<List<String>> getAllCities() {
        logger.info("获取所有城市列表");
        List<String> cities = service.findAllCities();
        return ApiResponse.success(cities);
    }

    /**
     * 根据城市获取区县列表（用于三级联动）
     *
     * @param city 城市名称
     * @return 区县列表
     */
    @GetMapping("/districts/{city}")
    @Operation(summary = "获取区县列表", description = "根据城市获取启用的区县列表")
    public ApiResponse<List<String>> getDistrictsByCity(@PathVariable String city) {
        logger.info("根据城市获取区县列表: 城市={}", city);
        List<String> districts = service.findDistrictsByCity(city);
        return ApiResponse.success(districts);
    }

    /**
     * 根据城市和区县获取位置列表（用于三级联动）
     *
     * @param city     城市名称
     * @param district 区县名称
     * @return 位置列表
     */
    @GetMapping("/locations/{city}/{district}")
    @Operation(summary = "获取位置列表", description = "根据城市和区县获取启用的位置列表")
    public ApiResponse<List<String>> getLocationsByCityAndDistrict(@PathVariable String city,
            @PathVariable String district) {
        logger.info("根据城市和区县获取位置列表: 城市={}, 区县={}", city, district);
        List<String> locations = service.findLocationsByCityAndDistrict(city, district);
        return ApiResponse.success(locations);
    }

    /**
     * 获取区域统计信息
     *
     * @param id 区域ID
     * @return 区域统计信息
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "获取区域统计信息", description = "获取指定区域的设备统计信息")
    public ApiResponse<Map<String, Object>> getAreaStatistics(@PathVariable @PositiveLong Long id) {
        logger.info("获取区域统计信息，区域ID: {}", id);
        Map<String, Object> statistics = service.getAreaStatistics(id);
        return ApiResponse.success(statistics);
    }
}
