package com.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.dto.PageResult;
import com.backend.entity.AdministrativeDivision;
import com.backend.entity.Area;
import com.backend.entity.Device;
import com.backend.entity.DeviceType;
import com.backend.entity.OperationLog;
import com.backend.entity.Supplier;
import com.backend.entity.SystemConfig;
import com.backend.entity.Warehouse;
import com.backend.exception.BusinessException;
import com.backend.repository.AdministrativeDivisionRepository;
import com.backend.repository.AreaRepository;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceTypeRepository;
import com.backend.repository.OperationLogRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.repository.SupplierRepository;
import com.backend.repository.SystemConfigRepository;
import com.backend.repository.WarehouseRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 系统管理服务类
 * 
 * 功能说明：
 * 1. 行政区划管理 - 省市区三级结构
 * 2. 仓库区域管理 - 仓库、区域、货位管理
 * 3. 设备类型管理 - 设备分类体系
 * 4. 供应商管理 - 供应商信息管理
 * 5. 系统配置管理 - 系统参数配置
 * 6. 操作日志查询 - 系统操作记录
 * 
 * 使用场景：
 * - 系统基础数据维护
 * - 仓库结构配置
 * - 设备分类管理
 * - 供应商信息维护
 * - 系统参数调整
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemService {

    /** 行政区划数据访问接口 */
    private final AdministrativeDivisionRepository divisionRepository;

    /** 仓库数据访问接口 */
    private final WarehouseRepository warehouseRepository;

    /** 区域数据访问接口 */
    private final AreaRepository areaRepository;

    /** 货位数据访问接口 */
    private final BinRepository binRepository;

    /** 设备类型数据访问接口 */
    private final DeviceTypeRepository deviceTypeRepository;

    /** 供应商数据访问接口 */
    private final SupplierRepository supplierRepository;

    /** 系统配置数据访问接口 */
    private final SystemConfigRepository systemConfigRepository;

    /** 操作日志数据访问接口 */
    private final OperationLogRepository operationLogRepository;

    /** 设备数据访问接口 */
    private final DeviceRepository deviceRepository;

    /** 库存订单数据访问接口 */
    private final StockOrderRepository stockOrderRepository;

    // ==================== 行政区划管理 ====================

    /**
     * 获取行政区划树
     * 
     * 查询逻辑：
     * 1. 如果parentId为null，查询省级行政区
     * 2. 否则查询指定父级下的子行政区
     * 3. 返回树形结构数据
     * 
     * @param parentId 父级ID
     * @return 行政区划列表
     */
    public ApiResponse<List<Map<String, Object>>> getDivisionTree(Long parentId) {
        List<AdministrativeDivision> divisions;
        if (parentId == null) {
            divisions = divisionRepository.findAllProvinces();
        } else {
            divisions = divisionRepository.findByParentId(parentId);
        }

        List<Map<String, Object>> result = divisions.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("code", d.getCode());
            map.put("name", d.getName());
            map.put("parentId", d.getParentId());
            map.put("level", d.getLevel());
            map.put("hasChildren", d.getChildren() != null && !d.getChildren().isEmpty());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(result);
    }

    // ==================== 仓库管理 ====================

    /**
     * 获取仓库列表
     * 
     * @param keyword  搜索关键词
     * @param status   状态
     * @param pageable 分页参数
     * @return 分页仓库列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getWarehouseList(String keyword, Integer status,
            Pageable pageable) {
        Page<Warehouse> page = warehouseRepository.findByConditions(keyword, status, pageable);

        List<Map<String, Object>> records = page.getContent().stream().map(w -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", w.getId());
            map.put("warehouseCode", w.getWarehouseCode());
            map.put("name", w.getWarehouseName());
            map.put("address", w.getAddress());
            map.put("manager", w.getManager() != null ? w.getManager().getRealName() : null);
            map.put("phone", w.getContactPhone());
            map.put("status", w.getStatus());
            map.put("createTime", w.getCreateTime());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    @Transactional
    public ApiResponse<Map<String, Object>> createWarehouse(Warehouse warehouse) {
        if (warehouseRepository.existsByWarehouseCode(warehouse.getWarehouseCode())) {
            return ApiResponse.error(400, "仓库编码已存在");
        }

        warehouse.setStatus(1);
        warehouse.setCreateTime(LocalDateTime.now());
        warehouse.setUpdateTime(LocalDateTime.now());

        Warehouse saved = warehouseRepository.save(warehouse);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("warehouseCode", saved.getWarehouseCode());

        return ApiResponse.success("仓库创建成功", result);
    }

    // ==================== 区域管理 ====================

    /**
     * 获取区域列表
     * 
     * @param warehouseId 仓库ID
     * @param keyword     搜索关键词
     * @param pageable    分页参数
     * @return 分页区域列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getAreaList(Long warehouseId, String keyword,
            Pageable pageable) {
        Page<Area> page = areaRepository.findByConditions(warehouseId, keyword, pageable);

        List<Map<String, Object>> records = page.getContent().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("areaCode", a.getCode());
            map.put("name", a.getName());
            map.put("warehouseId", a.getWarehouseId());
            map.put("warehouseName", a.getWarehouse() != null ? a.getWarehouse().getWarehouseName() : null);
            map.put("description", a.getRemark());
            map.put("status", a.getStatus());
            map.put("createTime", a.getCreateTime());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    @Transactional
    public ApiResponse<Map<String, Object>> createArea(Area area) {
        if (areaRepository.existsByCode(area.getCode())) {
            return ApiResponse.error(400, "区域编码已存在");
        }

        area.setStatus(1);
        area.setCreateTime(LocalDateTime.now());
        area.setUpdateTime(LocalDateTime.now());

        Area saved = areaRepository.save(area);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("areaCode", saved.getCode());

        return ApiResponse.success("区域创建成功", result);
    }

    // ==================== 设备类型管理 ====================

    /**
     * 获取设备类型列表
     * 
     * @return 设备类型列表
     */
    public ApiResponse<List<Map<String, Object>>> getDeviceTypeList() {
        List<DeviceType> types = deviceTypeRepository.findAll();

        List<Map<String, Object>> result = types.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("typeCode", t.getTypeCode());
            map.put("typeName", t.getTypeName());
            map.put("parentId", t.getParentId());
            map.put("description", t.getDescription());
            map.put("status", t.getStatus());
            map.put("createTime", t.getCreateTime());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(result);
    }

    /**
     * 获取设备类型树
     * 
     * 返回设备类型的层级结构，支持多级分类
     * 
     * @param parentId 父级ID
     * @return 设备类型树
     */
    public ApiResponse<List<Map<String, Object>>> getDeviceTypeTree(Long parentId) {
        List<DeviceType> types;
        if (parentId == null) {
            types = deviceTypeRepository.findByParentIdIsNull();
        } else {
            types = deviceTypeRepository.findByParentId(parentId);
        }

        List<Map<String, Object>> result = types.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("typeCode", t.getTypeCode());
            map.put("typeName", t.getTypeName());
            map.put("parentId", t.getParentId());
            map.put("description", t.getDescription());
            map.put("status", t.getStatus());
            map.put("hasChildren", t.getChildren() != null && !t.getChildren().isEmpty());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(result);
    }

    /**
     * 获取所有设备类型
     * 
     * 返回所有设备类型的列表，用于下拉选择等场景
     * 
     * @return 设备类型列表
     */
    public ApiResponse<List<DeviceType>> getAllDeviceTypes() {
        List<DeviceType> types = deviceTypeRepository.findAll();
        return ApiResponse.success(types);
    }

    public ApiResponse<List<Map<String, Object>>> getDeviceTypeSummary() {
        List<Object[]> typeStats = deviceRepository.countByDeviceTypeAndStatus();
        Map<Long, Map<String, Object>> typeSummaryMap = new HashMap<>();

        for (Object[] stat : typeStats) {
            Long typeId = (Long) stat[0];
            Integer status = (Integer) stat[1];
            Long count = (Long) stat[2];

            typeSummaryMap.computeIfAbsent(typeId, k -> {
                Map<String, Object> summary = new HashMap<>();
                summary.put("typeId", typeId);
                summary.put("totalStock", 0L);
                summary.put("inStockCount", 0L);
                summary.put("installedCount", 0L);
                summary.put("repairingCount", 0L);
                return summary;
            });

            Map<String, Object> summary = typeSummaryMap.get(typeId);
            summary.put("totalStock", (Long) summary.get("totalStock") + count);

            if (status != null) {
                if (status == 0) {
                    summary.put("inStockCount", (Long) summary.get("inStockCount") + count);
                } else if (status == 1) {
                    summary.put("installedCount", (Long) summary.get("installedCount") + count);
                } else if (status == 2) {
                    summary.put("repairingCount", (Long) summary.get("repairingCount") + count);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>(typeSummaryMap.values());

        for (Map<String, Object> summary : result) {
            Long typeId = (Long) summary.get("typeId");
            DeviceType type = deviceTypeRepository.findById(typeId).orElse(null);
            if (type != null) {
                summary.put("typeName", type.getTypeName());
            } else {
                summary.put("typeName", "未知类型");
            }
        }

        return ApiResponse.success(result);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> createDeviceType(DeviceType deviceType) {
        if (deviceTypeRepository.existsByTypeCode(deviceType.getTypeCode())) {
            return ApiResponse.error(400, "类型编码已存在");
        }

        deviceType.setCreateTime(LocalDateTime.now());
        deviceType.setUpdateTime(LocalDateTime.now());

        DeviceType saved = deviceTypeRepository.save(deviceType);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("typeCode", saved.getTypeCode());

        return ApiResponse.success("设备类型创建成功", result);
    }

    // ==================== 供应商管理 ====================

    /**
     * 获取供应商列表
     * 
     * @param keyword  搜索关键词
     * @param status   状态
     * @param pageable 分页参数
     * @return 分页供应商列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getSupplierList(String keyword, Integer status,
            Pageable pageable) {
        Page<Supplier> page = supplierRepository.findByConditions(keyword, status, pageable);

        List<Map<String, Object>> records = page.getContent().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("supplierCode", s.getSupplierCode());
            map.put("supplierName", s.getSupplierName());
            map.put("name", s.getName());
            map.put("contactPerson", s.getContactPerson());
            map.put("phone", s.getPhone());
            map.put("email", s.getEmail());
            map.put("address", s.getAddress());
            map.put("status", s.getStatus());
            map.put("createTime", s.getCreateTime());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    @Transactional
    public ApiResponse<Map<String, Object>> createSupplier(Supplier supplier) {
        if (supplierRepository.existsBySupplierCode(supplier.getSupplierCode())) {
            return ApiResponse.error(400, "供应商编码已存在");
        }

        supplier.setStatus(1);
        supplier.setCreateTime(LocalDateTime.now());
        supplier.setUpdateTime(LocalDateTime.now());

        Supplier saved = supplierRepository.save(supplier);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("supplierCode", saved.getSupplierCode());

        return ApiResponse.success("供应商创建成功", result);
    }

    // ==================== 系统配置管理 ====================

    /**
     * 获取系统配置列表
     * 
     * @param configKey 配置键
     * @param pageable  分页参数
     * @return 分页配置列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getSystemConfigs(String configKey, Pageable pageable) {
        Page<SystemConfig> page;
        if (configKey != null && !configKey.isEmpty()) {
            page = systemConfigRepository.findByConfigKeyContaining(configKey, pageable);
        } else {
            page = systemConfigRepository.findAll(pageable);
        }

        List<Map<String, Object>> records = page.getContent().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("configKey", c.getConfigKey());
            map.put("configValue", c.getConfigValue());
            map.put("description", c.getDescription());
            map.put("createTime", c.getCreateTime());
            map.put("updateTime", c.getUpdateTime());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    @Transactional
    public ApiResponse<Void> updateSystemConfig(Long id, String configValue, String description) {
        SystemConfig config = systemConfigRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "配置不存在"));

        config.setConfigValue(configValue);
        if (description != null) {
            config.setDescription(description);
        }
        config.setUpdateTime(LocalDateTime.now());

        systemConfigRepository.save(config);
        return ApiResponse.success("配置更新成功", null);
    }

    @Transactional
    public ApiResponse<Void> saveOrUpdateConfigs(List<Map<String, Object>> configs) {
        if (configs == null || configs.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "配置列表不能为空");
        }

        for (Map<String, Object> configData : configs) {
            Long id = configData.get("id") != null ? Long.valueOf(configData.get("id").toString()) : null;
            String configKey = (String) configData.get("configKey");
            String configValue = (String) configData.get("configValue");
            String description = (String) configData.get("description");

            if (id != null) {
                SystemConfig config = systemConfigRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "配置不存在: " + id));
                config.setConfigValue(configValue);
                if (description != null) {
                    config.setDescription(description);
                }
                config.setUpdateTime(LocalDateTime.now());
                systemConfigRepository.save(config);
            } else if (configKey != null && !configKey.isEmpty()) {
                SystemConfig config = systemConfigRepository.findByConfigKey(configKey)
                        .orElse(new SystemConfig());
                config.setConfigKey(configKey);
                config.setConfigValue(configValue);
                if (description != null) {
                    config.setDescription(description);
                }
                config.setUpdateTime(LocalDateTime.now());
                systemConfigRepository.save(config);
            }
        }

        return ApiResponse.success("配置保存成功", null);
    }

    // ==================== 操作日志管理 ====================

    /**
     * 获取操作日志列表
     * 
     * @param username      用户名
     * @param operationType 操作类型
     * @param startTime     开始时间
     * @param endTime       结束时间
     * @param pageable      分页参数
     * @return 分页日志列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getOperationLogs(
            String username, String operationType,
            LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {

        Page<OperationLog> page;
        if (username != null && !username.isEmpty()) {
            page = operationLogRepository.findByUsernameContaining(username, pageable);
        } else if (operationType != null && !operationType.isEmpty()) {
            page = operationLogRepository.findByOperationContaining(operationType, pageable);
        } else if (startTime != null && endTime != null) {
            page = operationLogRepository.findByCreateTimeBetween(startTime, endTime, pageable);
        } else {
            page = operationLogRepository.findAll(pageable);
        }

        List<Map<String, Object>> records = page.getContent().stream().map(log -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", log.getId());
            map.put("userId", log.getUserId());
            map.put("username", log.getUsername());
            map.put("operation", log.getOperation());
            map.put("method", log.getMethod());
            map.put("params", log.getParams());
            map.put("ip", log.getIp());
            map.put("userAgent", log.getUserAgent());
            map.put("executeTime", log.getExecuteTime());
            map.put("status", log.getStatus());
            map.put("errorMsg", log.getErrorMsg());
            map.put("createTime", log.getCreateTime());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    // ==================== 综合报表 ====================

    /**
     * 获取系统概览统计
     * 
     * 统计维度：
     * - 设备总数及状态分布
     * - 库存总量及变化趋势
     * - 本月订单统计
     * - 待处理维修/维护数量
     * 
     * @return 系统概览数据
     */
    public ApiResponse<Map<String, Object>> getSystemOverview() {
        Map<String, Object> overview = new HashMap<>();

        // 设备统计 - 使用前端需要的字段名
        long totalDevices = deviceRepository.count();
        long inStockDevices = deviceRepository.countByStatus("IN_STORAGE");
        long repairingDevices = deviceRepository.countByStatus("MAINTENANCE");
        long warningDevices = deviceRepository.countByCurrentStockLessThanEqual(10);

        overview.put("totalDevices", totalDevices);
        overview.put("inStockDevices", inStockDevices);
        overview.put("repairingDevices", repairingDevices);
        overview.put("warningDevices", warningDevices);
        overview.put("lowStockAlerts", warningDevices);

        // 趋势数据（模拟，后续可以从历史记录表获取）
        Map<String, Object> trendData = new HashMap<>();
        trendData.put("totalDevicesTrend", 5.2);
        trendData.put("inStockTrend", 3.8);
        trendData.put("repairingTrend", -12.5);
        trendData.put("warningTrend", 2.1);
        overview.put("trendData", trendData);

        // 本月订单统计
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        long monthOrders = stockOrderRepository.countByCreateTimeAfter(monthStart);
        overview.put("monthOrders", monthOrders);

        // 仓库统计
        long totalWarehouses = warehouseRepository.count();
        long activeWarehouses = warehouseRepository.countActiveWarehouses();

        Map<String, Long> warehouseStats = new HashMap<>();
        warehouseStats.put("total", totalWarehouses);
        warehouseStats.put("active", activeWarehouses);
        overview.put("warehouses", warehouseStats);

        // 供应商统计
        long totalSuppliers = supplierRepository.count();
        overview.put("suppliers", totalSuppliers);

        return ApiResponse.success(overview);
    }

    /**
     * 获取库存报表
     * 
     * 报表内容：
     * - 各仓库库存分布
     * - 各类型设备库存
     * - 库存预警（低库存设备）
     * - 库存周转率
     * 
     * @return 库存报表数据
     */
    public ApiResponse<Map<String, Object>> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();

        // 设备状态分布 - 用于饼图
        List<Map<String, Object>> deviceStatusDistribution = deviceRepository.countByStatusGroup().stream()
                .map(obj -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("status", obj[0]);
                    map.put("name", getStatusName((String) obj[0]));
                    map.put("count", obj[1]);
                    map.put("value", obj[1]);
                    return map;
                })
                .collect(Collectors.toList());
        report.put("deviceStatusDistribution", deviceStatusDistribution);

        // 按区域统计库存 - 用于区域分布图
        List<Object[]> areaStats = deviceRepository.countByAreaId();
        List<Map<String, Object>> areaDistribution = areaStats.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            Area area = areaRepository.findById((Long) obj[0]).orElse(null);
            map.put("areaId", obj[0]);
            map.put("name", area != null ? area.getName() : "未知区域");
            map.put("areaName", area != null ? area.getName() : "未知区域");
            map.put("deviceCount", obj[1]);
            map.put("count", obj[1]);
            map.put("value", obj[1]);
            return map;
        }).collect(Collectors.toList());
        report.put("areaDistribution", areaDistribution);

        // 按类型统计 - 用于类型分布
        List<Object[]> typeStats = deviceRepository.countByDeviceType();
        List<Map<String, Object>> typeDistribution = typeStats.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            DeviceType type = deviceTypeRepository.findById((Long) obj[0]).orElse(null);
            map.put("typeId", obj[0]);
            map.put("name", type != null ? type.getTypeName() : "未知类型");
            map.put("typeName", type != null ? type.getTypeName() : "未知类型");
            map.put("count", obj[1]);
            map.put("value", obj[1]);
            return map;
        }).collect(Collectors.toList());
        report.put("typeDistribution", typeDistribution);

        // 业务统计 - 用于业务记录统计图
        List<Map<String, Object>> businessStatistics = new java.util.ArrayList<>();
        businessStatistics.add(Map.of("type", "INSTALL", "name", "安装", "count",
                deviceRepository.countByStatus("INSTALLED"), "value", deviceRepository.countByStatus("INSTALLED")));
        businessStatistics
                .add(Map.of("type", "REPAIR", "name", "维修", "count", repairingDevices(), "value", repairingDevices()));
        businessStatistics.add(Map.of("type", "MAINTENANCE", "name", "保养", "count", maintenanceDevices(), "value",
                maintenanceDevices()));
        businessStatistics.add(Map.of("type", "SCRAP", "name", "报废", "count",
                deviceRepository.countByStatus("SCRAPPED"), "value", deviceRepository.countByStatus("SCRAPPED")));
        businessStatistics.add(Map.of("type", "TRANSFER", "name", "调拨", "count",
                deviceRepository.countByStatus("IN_TRANSIT"), "value", deviceRepository.countByStatus("IN_TRANSIT")));
        report.put("businessStatistics", businessStatistics);

        // 趋势数据 - 用于趋势图
        Map<String, Object> trendData = new HashMap<>();
        trendData.put("months", List.of("1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"));
        // 模拟数据，后续可以从历史记录表获取真实数据
        trendData.put("inbound", List.of(120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 260, 280));
        trendData.put("outbound", List.of(220, 182, 191, 234, 290, 330, 310, 201, 154, 190, 230, 250));
        trendData.put("stock", List.of(856, 806, 716, 616, 416, 316, 216, 197, 234, 278, 308, 338));
        report.put("trendData", trendData);

        // 库存预警（库存为0或低于阈值的设备）
        List<Device> lowStockDevices = deviceRepository.findByCurrentStockLessThanEqual(10);
        report.put("lowStockCount", lowStockDevices.size());
        report.put("lowStockDevices", lowStockDevices.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("deviceCode", d.getDeviceCode());
            map.put("deviceName", d.getDeviceName());
            map.put("currentStock", d.getCurrentStock());
            return map;
        }).collect(Collectors.toList()));

        return ApiResponse.success(report);
    }

    // 辅助方法：获取状态名称
    private String getStatusName(String status) {
        Map<String, String> statusNames = new HashMap<>();
        statusNames.put("IN_STORAGE", "在库");
        statusNames.put("INSTALLED", "已安装");
        statusNames.put("MAINTENANCE", "维修中");
        statusNames.put("SCRAPPED", "已报废");
        statusNames.put("IN_TRANSIT", "调拨中");
        statusNames.put("NORMAL", "正常");
        statusNames.put("FAULT", "故障");
        return statusNames.getOrDefault(status, status);
    }

    // 辅助方法：获取维修中设备数量
    private long repairingDevices() {
        return deviceRepository.countByStatus("MAINTENANCE");
    }

    // 辅助方法：获取保养中设备数量
    private long maintenanceDevices() {
        return deviceRepository.countByStatus("MAINTENANCE");
    }
}
