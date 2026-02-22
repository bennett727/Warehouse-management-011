package com.backend.service.device.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.DeviceDTO;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.entity.DeviceType;
import com.backend.entity.InstallationRecord;
import com.backend.entity.MaintenanceRecord;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.repository.AreaRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceTypeRepository;
import com.backend.repository.InstallationRecordRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.service.base.AbstractCrudService;
import com.backend.service.device.DeviceQueryService;

import jakarta.persistence.criteria.Predicate;

/**
 * 设备查询服务实现
 * 提供各种设备信息查询功能
 */
@Service
@Primary
public class DeviceQueryServiceImpl extends AbstractCrudService<Device, Long> implements DeviceQueryService {
    private static final Logger logger = LoggerFactory.getLogger(DeviceQueryServiceImpl.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final DeviceRepository deviceRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final AreaRepository areaRepository;
    private final InstallationRecordRepository installationRecordRepository;

    public DeviceQueryServiceImpl(DeviceRepository deviceRepository,
            DeviceTypeRepository deviceTypeRepository,
            MaintenanceRecordRepository maintenanceRecordRepository,
            AreaRepository areaRepository,
            InstallationRecordRepository installationRecordRepository) {
        super(deviceRepository, "设备");
        this.deviceRepository = deviceRepository;
        this.deviceTypeRepository = deviceTypeRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.areaRepository = areaRepository;
        this.installationRecordRepository = installationRecordRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "deviceQuery", key = "'criteria:' + #page + ':' + #size + ':' + #typeId + ':' + #statusList?.hashCode() + ':' + #areaId + ':' + #keyword?.hashCode() + ':' + #deviceCode?.hashCode() + ':' + #deviceName?.hashCode() + ':' + #manufacturer?.hashCode() + ':' + #model?.hashCode() + ':' + #installStartDate?.hashCode() + ':' + #installEndDate?.hashCode() + ':' + #orderBy + ':' + #orderDirection")
    public Page<Device> findDevicesByCriteria(int page, int size, Long typeId, List<Integer> statusList,
            Long areaId, String keyword, String deviceCode, String deviceName,
            String manufacturer, String model, String installStartDate,
            String installEndDate, String orderBy,
            Sort.Direction orderDirection) {
        logger.info(
                "按条件查询设备，page={}, size={}, typeId={}, areaId={}, keyword={}, deviceCode={}, deviceName={}, manufacturer={}, model={}",
                page, size, typeId, areaId, keyword, deviceCode, deviceName, manufacturer, model);

        try {
            Sort sort = createSort(orderBy, orderDirection);
            Pageable pageable = PageRequest.of(page, size, sort);

            SearchParams searchParams = processSearchParams(keyword, deviceCode, deviceName, manufacturer, model);

            String combinedKeyword = searchParams.keyword;
            if (combinedKeyword == null || combinedKeyword.isEmpty()) {
                combinedKeyword = searchParams.deviceCode;
                if (combinedKeyword == null || combinedKeyword.isEmpty()) {
                    combinedKeyword = searchParams.deviceName;
                }
            }

            Page<Device> result = deviceRepository.findByConditions(combinedKeyword, typeId,
                    statusList != null && !statusList.isEmpty() ? statusList.get(0) : null, areaId, pageable);

            // 确保关联实体被加载
            result.getContent().forEach(device -> {
                if (device.getDeviceType() != null) {
                    device.getDeviceType().getTypeName();
                }
                if (device.getArea() != null) {
                    device.getArea().getName();
                }
                if (device.getBin() != null) {
                    device.getBin().getCode();
                }
            });

            return result;
        } catch (Exception e) {
            logger.error("按条件查询设备失败: {}", e.getMessage());
            return Page.empty();
        }
    }

    private Sort createSort(String orderBy, Sort.Direction orderDirection) {
        if (orderBy != null && !orderBy.trim().isEmpty() && orderDirection != null) {
            List<String> validSortFields = List.of("id", "deviceCode", "name", "purchaseDate", "price", "updateTime");
            if (validSortFields.contains(orderBy)) {
                return Sort.by(orderDirection, orderBy);
            }
        }
        return Sort.by(Sort.Direction.DESC, "updateTime");
    }

    private SearchParams processSearchParams(String keyword, String deviceCode, String deviceName,
            String manufacturer, String model) {
        SearchParams params = new SearchParams();
        params.keyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        params.deviceCode = (deviceCode != null && !deviceCode.trim().isEmpty()) ? deviceCode.trim() : null;
        params.deviceName = (deviceName != null && !deviceName.trim().isEmpty()) ? deviceName.trim() : null;
        params.manufacturer = (manufacturer != null && !manufacturer.trim().isEmpty()) ? manufacturer.trim() : null;
        params.model = (model != null && !model.trim().isEmpty()) ? model.trim() : null;
        return params;
    }

    private DateRange parseDateRange(String startDateStr, String endDateStr) {
        DateRange range = new DateRange();
        if (startDateStr != null && !startDateStr.trim().isEmpty()) {
            range.startDate = LocalDate.parse(startDateStr, DATE_FORMATTER).atStartOfDay();
        }
        if (endDateStr != null && !endDateStr.trim().isEmpty()) {
            range.endDate = LocalDate.parse(endDateStr, DATE_FORMATTER).atTime(23, 59, 59);
        }
        return range;
    }

    private static class SearchParams {
        String keyword;
        String deviceCode;
        String deviceName;
        String manufacturer;
        String model;
    }

    private static class DateRange {
        LocalDateTime startDate;
        LocalDateTime endDate;
    }

    @Cacheable(value = "deviceStatistics", key = "#areaId")
    public Map<String, Integer> getDeviceStatisticsByArea(Long areaId) {
        logger.info("获取区域设备统计: areaId={}", areaId);
        Map<String, Integer> statistics = new HashMap<>();

        try {
            statistics.put("totalDevices", Math.toIntExact(deviceRepository.countByAreaId(areaId)));
            statistics.put("inStockCount", Math.toIntExact(
                    deviceRepository.countDevicesByAreaAndStatus(areaId, DeviceStatus.IN_STOCK.getCode())));
            statistics.put("installedCount", Math.toIntExact(
                    deviceRepository.countDevicesByAreaAndStatus(areaId, DeviceStatus.IN_USE.getCode())));
            statistics.put("repairingCount", Math.toIntExact(
                    deviceRepository.countDevicesByAreaAndStatus(areaId, DeviceStatus.MAINTENANCE.getCode())));
            statistics.put("scrappedCount", Math.toIntExact(
                    deviceRepository.countDevicesByAreaAndStatus(areaId, DeviceStatus.SCRAPPED.getCode())));
        } catch (Exception e) {
            logger.error("获取区域设备统计失败: {}", e.getMessage());
        }

        return statistics;
    }

    @Override
    @Cacheable(value = "deviceStatistics")
    public Map<String, Integer> getDeviceStatistics() {
        logger.info("获取所有设备统计");
        Map<String, Integer> statistics = new HashMap<>();

        try {
            // 获取所有设备的总数和各种状态的数量
            int totalDevices = Math.toIntExact(deviceRepository.count());
            int pendingInboundCount = Math.toIntExact(deviceRepository.countDevicesByStatus(DeviceStatus.PENDING_INBOUND.getCode()));
            int inStockCount = Math.toIntExact(deviceRepository.countDevicesByStatus(DeviceStatus.IN_STOCK.getCode()));
            int installedCount = Math.toIntExact(deviceRepository.countDevicesByStatus(DeviceStatus.IN_USE.getCode()));
            int repairingCount = Math.toIntExact(deviceRepository.countDevicesByStatus(DeviceStatus.MAINTENANCE.getCode()));
            int scrappedCount = Math.toIntExact(deviceRepository.countDevicesByStatus(DeviceStatus.SCRAPPED.getCode()));

            statistics.put("totalDevices", totalDevices);
            statistics.put("pendingInboundCount", pendingInboundCount);  // 新增：待入库设备数
            statistics.put("inStockCount", inStockCount);
            statistics.put("installedCount", installedCount);
            statistics.put("repairingCount", repairingCount);
            statistics.put("scrappedCount", scrappedCount);

            // 活跃设备：排除已报废和待入库的设备
            int activeDevices = totalDevices - scrappedCount - pendingInboundCount;
            statistics.put("activeDevices", activeDevices);

            statistics.put("totalAreas", Math.toIntExact(areaRepository.count()));
            statistics.put("totalInventory", inStockCount);
            statistics.put("totalRepairs", repairingCount);

            // 兼容性字段（用于旧版接口）
            statistics.put("total", totalDevices);
            statistics.put("inUse", installedCount);
            statistics.put("idle", inStockCount);
            statistics.put("maintenance", repairingCount);
            statistics.put("scrap", scrappedCount);
        } catch (Exception e) {
            logger.error("获取设备统计失败: {}", e.getMessage());
            // 如果出错，返回默认值
            statistics.put("totalDevices", 0);
            statistics.put("pendingInboundCount", 0);
            statistics.put("inStockCount", 0);
            statistics.put("installedCount", 0);
            statistics.put("repairingCount", 0);
            statistics.put("scrappedCount", 0);
            statistics.put("activeDevices", 0);
            statistics.put("totalAreas", 0);
            statistics.put("totalInventory", 0);
            statistics.put("totalRepairs", 0);
            statistics.put("total", 0);
            statistics.put("inUse", 0);
            statistics.put("idle", 0);
            statistics.put("maintenance", 0);
            statistics.put("scrap", 0);
        }

        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceDTO> getLowStockDevices(Integer threshold) {
        logger.info("获取库存不足设备，阈值: {}", threshold);
        try {
            List<Device> devices = deviceRepository.findByCurrentStockLessThanEqual(threshold);
            return devices.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("获取库存不足设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceDTO> getExpiredDevices() {
        logger.info("获取已过期设备");
        try {
            // 使用预加载关联实体的查询方法，避免N+1问题
            List<Device> devices = deviceRepository.findAllWithAssociations().stream()
                    .filter(d -> d.getWarrantyEnd() != null && d.getWarrantyEnd().isBefore(java.time.LocalDate.now()))
                    .collect(Collectors.toList());
            return devices.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("获取已过期设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "deviceTypeStats")
    public Map<String, Long> getDeviceTypeStats() {
        logger.info("获取设备类型统计");
        Map<String, Long> stats = new HashMap<>();

        try {
            // 使用JOIN查询一次性获取设备类型统计，避免N+1问题
            List<Object[]> results = deviceRepository.countDevicesByTypeWithValue();

            for (Object[] result : results) {
                if (result.length >= 2) {
                    String typeName = (String) result[1]; // 类型名称
                    Long count = (Long) result[2]; // 设备数量
                    if (typeName != null) {
                        stats.put(typeName, count);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("获取设备类型统计失败: {}", e.getMessage());
        }

        return stats;
    }

    public Map<String, Object> getDevicesByCondition(String deviceCode, String deviceName, String deviceType,
            String status, String keyword, Pageable pageable) {
        logger.info("根据条件获取设备列表，deviceCode={}, deviceName={}, deviceType={}, status={}, keyword={}",
                deviceCode, deviceName, deviceType, status, keyword);

        try {
            Page<Device> devicePage = executeQuery(deviceCode, deviceName, deviceType, status, keyword, pageable);
            return buildResultMap(devicePage);
        } catch (Exception e) {
            logger.error("根据条件获取设备列表失败: {}", e.getMessage());
            return buildErrorResultMap(pageable);
        }
    }

    private Page<Device> executeQuery(String deviceCode, String deviceName, String deviceType,
            String status, String keyword, Pageable pageable) {
        boolean hasDeviceCode = deviceCode != null && !deviceCode.trim().isEmpty();
        boolean hasDeviceName = deviceName != null && !deviceName.trim().isEmpty();
        boolean hasDeviceType = deviceType != null && !deviceType.isEmpty();
        boolean hasStatus = status != null && !status.isEmpty();
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();

        if (hasKeyword && !hasDeviceCode && !hasDeviceName && !hasDeviceType && !hasStatus) {
            return deviceRepository.findByConditions(keyword.trim(), null, null, null, pageable);
        }

        if (hasDeviceCode && !hasDeviceName && !hasDeviceType && !hasStatus && !hasKeyword) {
            return deviceRepository.findByConditions(deviceCode.trim(), null, null, null, pageable);
        }

        if (hasDeviceName && !hasDeviceCode && !hasDeviceType && !hasStatus && !hasKeyword) {
            return deviceRepository.findByConditions(deviceName.trim(), null, null, null, pageable);
        }

        if (hasStatus && hasDeviceType && !hasDeviceCode && !hasDeviceName && !hasKeyword) {
            return queryByStatusAndType(deviceType, status, pageable);
        }

        if (hasStatus && !hasDeviceCode && !hasDeviceName && !hasDeviceType && !hasKeyword) {
            return queryByStatus(status, pageable);
        }

        return queryBySpecification(hasDeviceCode, hasDeviceName, hasDeviceType, hasStatus, hasKeyword,
                deviceCode, deviceName, deviceType, status, keyword, pageable);
    }

    private Page<Device> queryByStatusAndType(String deviceType, String status, Pageable pageable) {
        try {
            Long typeId = Long.parseLong(deviceType);
            Integer statusCode = Integer.parseInt(status);
            return deviceRepository.findByConditions(null, typeId, statusCode, null, pageable);
        } catch (NumberFormatException e) {
            logger.warn("无效的设备类型或状态: deviceType={}, status={}", deviceType, status);
            return Page.empty();
        }
    }

    private Page<Device> queryByStatus(String status, Pageable pageable) {
        try {
            Integer statusCode = Integer.parseInt(status);
            List<Device> devices = deviceRepository.findByStatus(statusCode);
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), devices.size());
            List<Device> pageContent = devices.subList(start, end);
            return new PageImpl<>(pageContent, pageable, devices.size());
        } catch (IllegalArgumentException e) {
            logger.warn("无效的设备状态: {}", status);
            return Page.empty();
        }
    }

    private Page<Device> queryBySpecification(boolean hasDeviceCode, boolean hasDeviceName, boolean hasDeviceType,
            boolean hasStatus, boolean hasKeyword, String deviceCode, String deviceName, String deviceType,
            String status, String keyword, Pageable pageable) {
        Specification<Device> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasDeviceCode) {
                predicates.add(cb.equal(root.get("deviceCode"), deviceCode.trim()));
            }

            if (hasDeviceName) {
                predicates.add(cb.like(root.get("name"), "%" + deviceName.trim() + "%"));
            }

            if (hasDeviceType) {
                try {
                    Long typeId = Long.parseLong(deviceType);
                    predicates.add(cb.equal(root.get("type").get("id"), typeId));
                } catch (NumberFormatException e) {
                    logger.warn("无效的设备类型: {}", deviceType);
                }
            }

            if (hasStatus) {
                try {
                    Integer statusCode = Integer.parseInt(status);
                    DeviceStatus deviceStatus = DeviceStatus.fromCode(statusCode);
                    predicates.add(cb.equal(root.get("status"), deviceStatus.getCode()));
                } catch (IllegalArgumentException e) {
                    logger.warn("无效的设备状态: {}", status);
                }
            }

            if (hasKeyword) {
                String searchKeyword = "%" + keyword.trim() + "%";
                predicates.add(cb.or(
                        cb.like(root.get("deviceCode"), searchKeyword),
                        cb.like(root.get("name"), searchKeyword)));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return deviceRepository.findAll(spec, pageable);
    }

    private Map<String, Object> buildResultMap(Page<Device> devicePage) {
        Map<String, Object> pageResult = new HashMap<String, Object>();
        pageResult.put("content", devicePage.getContent());
        pageResult.put("totalElements", devicePage.getTotalElements());
        pageResult.put("totalPages", devicePage.getTotalPages());
        pageResult.put("currentPage", devicePage.getPageable().getPageNumber() + 1);
        pageResult.put("pageSize", devicePage.getPageable().getPageSize());
        pageResult.put("hasNext", devicePage.hasNext());
        pageResult.put("hasPrevious", devicePage.hasPrevious());

        logger.info("根据条件获取设备列表成功，共{}条记录", devicePage.getTotalElements());
        return pageResult;
    }

    private Map<String, Object> buildErrorResultMap(Pageable pageable) {
        Map<String, Object> errorPageResult = new HashMap<String, Object>();
        errorPageResult.put("content", new ArrayList<Device>());
        errorPageResult.put("totalElements", 0L);
        errorPageResult.put("totalPages", 0);
        errorPageResult.put("currentPage", 1);
        errorPageResult.put("pageSize", pageable.getPageSize());
        errorPageResult.put("hasNext", false);
        errorPageResult.put("hasPrevious", false);
        return errorPageResult;
    }

    public Map<String, Object> getDevicesByConditionWithFrontendFormat(String deviceCode, String deviceName,
            String deviceType, String status, String keyword, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        Map<String, Object> deviceResult = getDevicesByCondition(deviceCode, deviceName, deviceType, status, keyword,
                pageable);

        Map<String, Object> frontendResult = new HashMap<>();
        frontendResult.put("records", deviceResult.get("content"));
        frontendResult.put("total", deviceResult.get("totalElements"));
        frontendResult.put("page", page);
        frontendResult.put("pageSize", pageSize);
        frontendResult.put("totalPages", deviceResult.get("totalPages"));

        return frontendResult;
    }

    public List<Integer> processStatusList(String statusStr) {
        if (statusStr == null || statusStr.isEmpty()) {
            return new ArrayList<>();
        }

        String[] statusArray = statusStr.split(",");
        try {
            return Arrays.stream(statusArray)
                    .map(Integer::parseInt)
                    .toList();
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "状态参数格式不合法，请提供有效的整数状态值");
        }
    }

    public Sort.Direction processSortDirection(String orderDirection) {
        Sort.Direction direction = Sort.Direction.ASC;
        if ("desc".equalsIgnoreCase(orderDirection)) {
            direction = Sort.Direction.DESC;
        }
        return direction;
    }

    public Map<String, Object> findDevicesByCriteria(int pageNum, int pageSize, Long typeId, String status, Long areaId,
            String keyword, String deviceCode, String deviceName, String manufacturer,
            String model, String installStartDate, String installEndDate,
            String orderBy, String orderDirection) {
        List<Integer> statusList = processStatusList(status);

        Sort.Direction direction = processSortDirection(orderDirection);

        Page<Device> devicesPage = findDevicesByCriteria(
                pageNum - 1,
                pageSize,
                typeId,
                statusList,
                areaId,
                keyword,
                deviceCode,
                deviceName,
                manufacturer,
                model,
                installStartDate,
                installEndDate,
                orderBy,
                direction);

        return Map.of(
                "records", devicesPage.getContent(),
                "total", devicesPage.getTotalElements(),
                "pageNum", pageNum,
                "pageSize", pageSize);
    }

    public DeviceStatus processDeviceStatus(Object statusObj) {
        if (statusObj == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "状态值不能为空，请提供有效的设备状态");
        }

        Integer status;
        try {
            if (statusObj instanceof Integer) {
                status = (Integer) statusObj;
            } else if (statusObj instanceof String) {
                String statusStr = ((String) statusObj).trim();
                if (statusStr.isEmpty()) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR, "状态值不能为空字符串");
                }
                try {
                    status = Integer.parseInt(statusStr);
                } catch (NumberFormatException e) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR, "状态值格式不合法，请提供有效的整数值");
                }
            } else {
                throw new BusinessException(ErrorCode.PARAM_ERROR, "状态值类型不合法，仅支持整数或字符串类型的整数值");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("状态值类型转换异常: {}", e.getMessage());
            throw new BusinessException(ErrorCode.PARAM_ERROR, "处理状态值时发生错误，请检查输入格式");
        }

        if (status < -1 || status > 5) {
            throw new BusinessException(ErrorCode.PARAM_ERROR,
                    "无效的设备状态值，有效状态值为: -1(待入库), 0(在库), 1(使用中), 2(已安装), 3(维护中), 4(维修中), 5(已报废)");
        }

        try {
            return DeviceStatus.fromCode(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "无效的设备状态值: " + status + "，请提供有效的状态代码");
        }
    }

    public Map<String, Object> getDeviceByIdForFrontend(Long id) {
        Optional<Device> deviceOptional = deviceRepository.findById(id);
        if (deviceOptional.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "设备不存在");
            result.put("data", null);
            return result;
        }

        Device device = deviceOptional.get();
        Map<String, Object> deviceMap = convertDeviceToFrontendMap(device);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "获取设备详情成功");
        result.put("data", deviceMap);
        return result;
    }

    public Map<String, Object> getDeviceByDeviceCodeForFrontend(String deviceCode) {
        Optional<Device> deviceOptional = deviceRepository.findByDeviceCode(deviceCode);
        if (deviceOptional.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "设备不存在");
            result.put("data", null);
            return result;
        }

        Device device = deviceOptional.get();
        Map<String, Object> deviceMap = convertDeviceToFrontendMap(device);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "获取设备详情成功");
        result.put("data", deviceMap);
        return result;
    }

    /**
     * 将Device实体转换为前端需要的Map格式
     *
     * @param device 设备实体
     * @return 前端需要的Map格式数据
     */
    private Map<String, Object> convertDeviceToFrontendMap(Device device) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", device.getId());
        result.put("deviceCode", device.getDeviceCode());
        result.put("deviceName", device.getDeviceName());
        result.put("deviceType", device.getDeviceType());
        result.put("status", device.getStatus());
        result.put("statusName", DeviceStatus.fromCode(device.getStatus()).getDescription());
        result.put("areaId", device.getArea() != null ? device.getArea().getId() : null);
        result.put("principalId", device.getPrincipal() != null ? device.getPrincipal().getId() : null);
        result.put("purchaseDate", device.getPurchaseDate());
        result.put("manufactureDate", device.getProductionDate());
        result.put("warrantyPeriod", device.getWarrantyPeriod());
        result.put("description", device.getDescription());
        result.put("location", device.getArea() != null ? device.getArea().getLocation() : null);
        result.put("specifications", device.getSpecifications());
        result.put("manufacturer", device.getManufacturer());
        result.put("supplier", device.getManufacturer());
        result.put("price", device.getPrice());
        result.put("serialNumber", device.getSerialNumber());
        result.put("createdAt", device.getCreateTime());
        result.put("updatedAt", device.getUpdateTime());
        return result;
    }

    @Override
    @Cacheable(value = "deviceStatusStats")
    public Map<String, Long> getDeviceStatusStats() {
        logger.info("获取设备状态统计");
        Map<String, Long> stats = new HashMap<String, Long>();

        try {
            // 获取按设备状态分组的统计数据
            List<Object[]> results = deviceRepository.countDevicesByStatusGrouped();

            // 转换结果格式
            for (Object[] result : results) {
                if (result.length == 2 && result[0] != null && result[1] != null) {
                    DeviceStatus status = DeviceStatus.fromCode(((Number) result[0]).intValue());
                    Long count = ((Number) result[1]).longValue();

                    stats.put(status.getDescription(), count);
                }
            }
        } catch (Exception e) {
            logger.error("获取设备状态统计失败: {}", e.getMessage(), e);
        }

        return stats;
    }

    @Override
    @Cacheable(value = "inventoryStatistics")
    public Map<String, Object> getInventoryStatistics() {
        logger.info("开始获取库存统计数据");
        Map<String, Object> statistics = new HashMap<>();

        try {
            // 按设备状态统计数量
            Map<String, Long> statusDistribution = new HashMap<>();
            List<Object[]> statusStats = deviceRepository.countDevicesByStatusGrouped();
            logger.info("按设备状态统计数据获取成功，共 {} 条记录", statusStats.size());

            for (Object[] statusResult : statusStats) {
                if (statusResult.length == 2 && statusResult[0] != null && statusResult[1] != null) {
                    DeviceStatus status = DeviceStatus.fromCode(((Number) statusResult[0]).intValue());
                    Long count = ((Number) statusResult[1]).longValue();
                    statusDistribution.put(status.getDescription(), count);
                    logger.debug("设备状态 {} 统计数量: {}", status.getDescription(), count);
                }
            }
            statistics.put("statusDistribution", statusDistribution);

            // 按设备类型统计数量
            Map<String, Long> typeDistribution = new HashMap<>();
            List<Object[]> typeStats = deviceRepository.countDevicesByTypeGrouped();
            logger.info("按设备类型统计数据获取成功，共 {} 条记录", typeStats.size());

            for (Object[] typeResult : typeStats) {
                if (typeResult.length == 2 && typeResult[0] != null && typeResult[1] != null) {
                    com.backend.entity.DeviceType deviceType = (com.backend.entity.DeviceType) typeResult[0];
                    Long count = ((Number) typeResult[1]).longValue();
                    typeDistribution.put(deviceType.getTypeName(), count);
                    logger.debug("设备类型 {} 统计数量: {}", deviceType.getTypeName(), count);
                }
            }
            statistics.put("typeDistribution", typeDistribution);

        } catch (Exception e) {
            logger.error("获取库存统计数据失败: {}", e.getMessage(), e);
        }

        return statistics;
    }

    @Override
    @Cacheable(value = "enhancedInventoryStatistics")
    public Map<String, Object> getEnhancedInventoryStatistics() {
        logger.info("开始获取增强的库存统计数据");
        Map<String, Object> statistics = new HashMap<>();

        try {
            // 基础统计
            statistics.put("basicStatistics", getInventoryStatistics());

            // 库存价值统计
            statistics.put("valueStatistics", getInventoryValueStatistics());

            // 保修状态统计
            statistics.put("warrantyStatistics", getWarrantyStatusStatistics());

            // 使用年限统计
            statistics.put("usageYearsStatistics", getUsageYearsStatistics());

            // 购入趋势（最近12个月）
            statistics.put("purchaseTrend", getPurchaseTrendStatistics(12));

            // 区域设备统计
            Map<String, Object> areaStats = new HashMap<>();
            List<Object[]> areaStatsList = deviceRepository.countDevicesByAreaWithValue();
            List<Map<String, Object>> areaData = new ArrayList<>();

            for (Object[] areaStat : areaStatsList) {
                Map<String, Object> areaItem = new HashMap<>();
                areaItem.put("areaId", areaStat[0]);
                areaItem.put("areaName", areaStat[1]);
                areaItem.put("deviceCount", areaStat[2]);
                areaItem.put("totalValue", areaStat[3]);
                areaData.add(areaItem);
            }
            areaStats.put("areaDistribution", areaData);
            statistics.put("areaStatistics", areaStats);

            // 设备类型价值统计
            Map<String, Object> typeStats = new HashMap<>();
            List<Object[]> typeStatsList = deviceRepository.countDevicesByTypeWithValue();
            List<Map<String, Object>> typeData = new ArrayList<>();

            for (Object[] typeStat : typeStatsList) {
                Map<String, Object> typeItem = new HashMap<>();
                typeItem.put("typeId", typeStat[0]);
                typeItem.put("typeName", typeStat[1]);
                typeItem.put("deviceCount", typeStat[2]);
                typeItem.put("totalValue", typeStat[3]);
                typeData.add(typeItem);
            }
            typeStats.put("typeDistribution", typeData);
            statistics.put("typeValueStatistics", typeStats);

            // 即将过保修期的设备（30天内）
            List<Map<String, Object>> expiringDevices = getDevicesExpiringSoon(30);
            statistics.put("expiringDevices", expiringDevices);

            logger.info("获取增强的库存统计数据成功");
        } catch (Exception e) {
            logger.error("获取增强的库存统计数据失败: {}", e.getMessage(), e);
        }

        return statistics;
    }

    @Cacheable(value = "inventoryValueStatistics")
    public Map<String, Object> getInventoryValueStatistics() {
        logger.info("开始获取库存价值统计");
        Map<String, Object> valueStatistics = new HashMap<>();

        try {
            Long totalValue = deviceRepository.calculateTotalInventoryValue();
            valueStatistics.put("totalValue",
                    totalValue != null ? java.math.BigDecimal.valueOf(totalValue) : java.math.BigDecimal.ZERO);

            // 按设备类型统计价值
            List<Object[]> typeValueStats = deviceRepository.countDevicesByTypeWithValue();
            List<Map<String, Object>> typeValueData = new ArrayList<>();

            for (Object[] typeStat : typeValueStats) {
                Map<String, Object> typeItem = new HashMap<>();
                typeItem.put("typeId", typeStat[0]);
                typeItem.put("typeName", typeStat[1]);
                typeItem.put("deviceCount", typeStat[2]);
                Object valueObj = typeStat[3];
                if (valueObj instanceof Long) {
                    typeItem.put("totalValue", java.math.BigDecimal.valueOf((Long) valueObj));
                } else if (valueObj instanceof java.math.BigDecimal) {
                    typeItem.put("totalValue", valueObj);
                } else {
                    typeItem.put("totalValue", java.math.BigDecimal.ZERO);
                }
                typeValueData.add(typeItem);
            }
            valueStatistics.put("typeValueDistribution", typeValueData);

            // 按区域统计价值
            List<Object[]> areaValueStats = deviceRepository.countDevicesByAreaWithValue();
            List<Map<String, Object>> areaValueData = new ArrayList<>();

            for (Object[] areaStat : areaValueStats) {
                Map<String, Object> areaItem = new HashMap<>();
                areaItem.put("areaId", areaStat[0]);
                areaItem.put("areaName", areaStat[1]);
                areaItem.put("deviceCount", areaStat[2]);
                areaItem.put("totalValue", areaStat[3] != null ? areaStat[3] : java.math.BigDecimal.ZERO);
                areaValueData.add(areaItem);
            }
            valueStatistics.put("areaValueDistribution", areaValueData);

            logger.info("获取库存价值统计成功");
        } catch (Exception e) {
            logger.error("获取库存价值统计失败: {}", e.getMessage(), e);
        }

        return valueStatistics;
    }

    @Override
    @Cacheable(value = "purchaseTrendStatistics", key = "#months")
    public List<Map<String, Object>> getPurchaseTrendStatistics(int months) {
        logger.info("开始获取购入趋势统计，months={}", months);
        List<Map<String, Object>> purchaseTrend = new ArrayList<>();

        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusMonths(months);

            for (int i = 0; i < months; i++) {
                LocalDate monthStart = startDate.plusMonths(i);
                LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

                Long count = deviceRepository.countDevicesByPurchaseDateRange(monthStart, monthEnd);

                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("yyyy-MM")));
                monthData.put("count", count != null ? count : 0);
                purchaseTrend.add(monthData);
            }

            logger.info("获取购入趋势统计成功");
        } catch (Exception e) {
            logger.error("获取购入趋势统计失败: {}", e.getMessage(), e);
        }

        return purchaseTrend;
    }

    @Cacheable(value = "warrantyStatusStatistics")
    public Map<String, Object> getWarrantyStatusStatistics() {
        logger.info("开始获取保修状态统计");
        Map<String, Object> warrantyStatistics = new HashMap<>();

        try {
            List<Object[]> warrantyStats = deviceRepository.countDevicesByWarrantyStatus();

            Long inWarrantyCount = 0L;
            Long outWarrantyCount = 0L;

            for (Object[] stat : warrantyStats) {
                if (stat.length == 2 && stat[0] != null && stat[1] != null) {
                    LocalDate warrantyEnd = (LocalDate) stat[0];
                    Long count = ((Number) stat[1]).longValue();

                    if (warrantyEnd.isAfter(LocalDate.now()) || warrantyEnd.isEqual(LocalDate.now())) {
                        inWarrantyCount += count;
                    } else {
                        outWarrantyCount += count;
                    }
                }
            }

            warrantyStatistics.put("inWarrantyCount", inWarrantyCount);
            warrantyStatistics.put("outWarrantyCount", outWarrantyCount);

            // 计算保修覆盖率
            Long total = inWarrantyCount + outWarrantyCount;
            if (total > 0) {
                double coverageRate = (double) inWarrantyCount / total * 100;
                warrantyStatistics.put("coverageRate", String.format("%.2f", coverageRate));
            } else {
                warrantyStatistics.put("coverageRate", "0.00");
            }

            logger.info("获取保修状态统计成功");
        } catch (Exception e) {
            logger.error("获取保修状态统计失败: {}", e.getMessage(), e);
        }

        return warrantyStatistics;
    }

    @Override
    public List<Map<String, Object>> getDevicesExpiringSoon(int days) {
        logger.info("开始获取即将过保修期的设备列表，days={}", days);
        List<Map<String, Object>> expiringDevices = new ArrayList<>();

        try {
            LocalDate today = LocalDate.now();
            LocalDate expiryDate = today.plusDays(days);

            Specification<Device> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                predicates.add(cb.isNotNull(root.get("warrantyEnd")));
                predicates.add(cb.greaterThanOrEqualTo(root.get("warrantyEnd"), today));
                predicates.add(cb.lessThanOrEqualTo(root.get("warrantyEnd"), expiryDate));

                return cb.and(predicates.toArray(new Predicate[0]));
            };

            List<Device> devices = deviceRepository.findAll(spec);

            for (Device device : devices) {
                Map<String, Object> deviceMap = new HashMap<>();
                deviceMap.put("id", device.getId());
                deviceMap.put("deviceCode", device.getDeviceCode());
                deviceMap.put("name", device.getDeviceName());
                deviceMap.put("warrantyEnd", device.getWarrantyEnd());

                long daysLeft = ChronoUnit.DAYS.between(today, device.getWarrantyEnd());
                deviceMap.put("daysLeft", daysLeft);

                expiringDevices.add(deviceMap);
            }

            expiringDevices.sort(Comparator.comparing(d -> (Long) d.get("daysLeft")));

            logger.info("获取即将过保修期的设备列表成功，共 {} 条记录", expiringDevices.size());
        } catch (Exception e) {
            logger.error("获取即将过保修期的设备列表失败: {}", e.getMessage(), e);
        }

        return expiringDevices;
    }

    @Cacheable(value = "usageYearsStatistics")
    public Map<String, Object> getUsageYearsStatistics() {
        logger.info("开始获取使用年限统计");
        Map<String, Object> usageYearsStatistics = new HashMap<>();

        try {
            // 只查询需要字段，避免加载整个实体，减少内存占用
            List<Object[]> deviceData = deviceRepository.findAllPurchaseDates();
            Map<String, Long> usageDistribution = new HashMap<>();

            for (Object[] data : deviceData) {
                LocalDate purchaseDate = (LocalDate) data[0];
                if (purchaseDate != null) {
                    long years = java.time.temporal.ChronoUnit.YEARS.between(
                            purchaseDate, java.time.LocalDate.now());
                    String usageRange;
                    if (years < 1) {
                        usageRange = "1年以内";
                    } else if (years < 3) {
                        usageRange = "1-3年";
                    } else if (years < 5) {
                        usageRange = "3-5年";
                    } else if (years < 10) {
                        usageRange = "5-10年";
                    } else {
                        usageRange = "10年以上";
                    }
                    usageDistribution.put(usageRange, usageDistribution.getOrDefault(usageRange, 0L) + 1);
                }
            }

            usageYearsStatistics.put("usageDistribution", usageDistribution);

            logger.info("获取使用年限统计成功");
        } catch (Exception e) {
            logger.error("获取使用年限统计失败: {}", e.getMessage(), e);
        }

        return usageYearsStatistics;
    }

    public List<Device> getAllDevices(Map<String, String> params) {
        logger.info("获取所有设备列表，参数: {}", params);

        try {
            // 构建查询条件
            org.springframework.data.jpa.domain.Specification<Device> spec = (root, query, cb) -> {
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

                // 解析并添加查询条件
                if (params.containsKey("deviceCode")) {
                    predicates.add(cb.like(root.get("deviceCode"), "%" + params.get("deviceCode") + "%"));
                }
                if (params.containsKey("name")) {
                    predicates.add(cb.like(root.get("name"), "%" + params.get("name") + "%"));
                }
                if (params.containsKey("type")) {
                    try {
                        Long typeId = Long.parseLong(params.get("type"));
                        DeviceType deviceType = deviceTypeRepository.findById(typeId).orElse(null);
                        if (deviceType != null) {
                            predicates.add(cb.equal(root.get("type"), deviceType));
                        }
                    } catch (NumberFormatException e) {
                        logger.warn("无效的设备类型ID: {}", params.get("type"));
                    }
                }
                if (params.containsKey("status")) {
                    try {
                        Integer statusCode = Integer.parseInt(params.get("status"));
                        DeviceStatus deviceStatus = DeviceStatus.fromCode(statusCode);
                        predicates.add(cb.equal(root.get("status"), deviceStatus.getCode()));
                    } catch (IllegalArgumentException e) {
                        logger.warn("无效的设备状态: {}", params.get("status"));
                    }
                }
                if (params.containsKey("areaId")) {
                    try {
                        Long areaId = Long.parseLong(params.get("areaId"));
                        predicates.add(cb.equal(root.get("area").get("id"), areaId));
                    } catch (IllegalArgumentException e) {
                        logger.warn("无效的区域ID: {}", params.get("areaId"));
                    }
                }

                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };

            // 执行查询
            return deviceRepository.findAll(spec);
        } catch (Exception e) {
            logger.error("获取所有设备列表失败: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public Map<String, Object> getDevicesByArea(Long areaId, String deviceType, String status, String keyword,
            org.springframework.data.domain.Pageable pageable) {
        logger.info("根据区域获取设备列表，areaId={}, deviceType={}, status={}, keyword={}",
                areaId, deviceType, status, keyword);

        try {
            // 构建查询条件
            org.springframework.data.jpa.domain.Specification<Device> spec = (root, query, cb) -> {
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

                // 区域筛选
                if (areaId != null) {
                    predicates.add(cb.equal(root.get("area").get("id"), areaId));
                }

                // 设备类型筛选
                if (deviceType != null && !deviceType.isEmpty()) {
                    try {
                        Long typeId = Long.parseLong(deviceType);
                        DeviceType typeEntity = deviceTypeRepository.findById(typeId).orElse(null);
                        if (typeEntity != null) {
                            predicates.add(cb.equal(root.get("type"), typeEntity));
                        }
                    } catch (NumberFormatException e) {
                        logger.warn("无效的设备类型ID: {}", deviceType);
                    }
                }

                // 设备状态筛选
                if (status != null && !status.isEmpty()) {
                    try {
                        Integer statusCode = Integer.parseInt(status);
                        DeviceStatus deviceStatus = DeviceStatus.fromCode(statusCode);
                        predicates.add(cb.equal(root.get("status"), deviceStatus.getCode()));
                    } catch (IllegalArgumentException e) {
                        logger.warn("无效的设备状态: {}", status);
                    }
                }

                // 关键词搜索（设备编号或名称）
                if (keyword != null && !keyword.trim().isEmpty()) {
                    String searchKeyword = "%" + keyword.trim() + "%";
                    predicates.add(cb.or(
                            cb.like(root.get("deviceCode"), searchKeyword),
                            cb.like(root.get("name"), searchKeyword)));
                }

                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };

            // 执行分页查询
            Page<Device> devicePage = deviceRepository.findAll(spec, pageable);

            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("content", devicePage.getContent());
            result.put("totalElements", devicePage.getTotalElements());
            result.put("totalPages", devicePage.getTotalPages());
            result.put("currentPage", devicePage.getPageable().getPageNumber() + 1);
            result.put("pageSize", devicePage.getPageable().getPageSize());
            result.put("hasNext", devicePage.hasNext());
            result.put("hasPrevious", devicePage.hasPrevious());

            return result;
        } catch (Exception e) {
            logger.error("根据区域获取设备列表失败: {}", e.getMessage());
            // 如果出错，返回空的分页结果
            Map<String, Object> result = new HashMap<>();
            result.put("content", new ArrayList<>());
            result.put("totalElements", 0L);
            result.put("totalPages", 0);
            result.put("currentPage", pageable.getPageNumber() + 1);
            result.put("pageSize", pageable.getPageSize());
            result.put("hasNext", false);
            result.put("hasPrevious", false);
            return result;
        }
    }

    // 实现与DeviceService接口匹配的getDevicesByArea方法，接受Integer类型的page和size参数
    public Map<String, Object> getDevicesByArea(Long areaId, String deviceType, String status, String keyword,
            Integer page, Integer size) {
        logger.info("根据区域获取设备列表（Integer参数版本），areaId={}, deviceType={}, status={}, keyword={}, page={}, size={}",
                areaId, deviceType, status, keyword, page, size);

        try {
            // 转换Integer参数为Pageable对象
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    (page != null && page > 0) ? (page - 1) : 0, // 转换为0-based页码
                    (size != null && size > 0) ? size : 10); // 默认每页10条

            // 调用现有的Pageable版本的方法
            return getDevicesByArea(areaId, deviceType, status, keyword, pageable);
        } catch (Exception e) {
            logger.error("根据区域获取设备列表（Integer参数版本）失败: {}", e.getMessage());
            // 如果出错，返回空的分页结果
            Map<String, Object> result = new HashMap<>();
            result.put("content", new ArrayList<>());
            result.put("totalElements", 0L);
            result.put("totalPages", 0);
            result.put("currentPage", (page != null && page > 0) ? page : 1);
            result.put("pageSize", (size != null && size > 0) ? size : 10);
            result.put("hasNext", false);
            result.put("hasPrevious", false);
            return result;
        }
    }

    public Page<Device> getDevicesByStatus(Integer status, int page, int size) {
        logger.info("按状态分页查询设备，status={}, page={}, size={}", status, page, size);

        try {
            // 如果Repository直接支持枚举参数，这里应该直接调用findByStatus方法
            // 但由于使用了Specification，我们需要确保映射正确
            DeviceStatus deviceStatus = status != null ? DeviceStatus.fromCode(status) : null;

            // 构建查询条件
            org.springframework.data.jpa.domain.Specification<Device> spec = (root, query, cb) -> {
                if (deviceStatus != null) {
                    // 注意：这里需要根据数据库映射情况来决定使用枚举值还是其code值
                    return cb.equal(root.get("status"), deviceStatus.getCode());
                }
                return null;
            };

            // 默认按更新时间降序排序
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    page, size,
                    org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                            "updateTime"));

            return deviceRepository.findAll(spec, pageable);
        } catch (Exception e) {
            logger.error("按状态分页查询设备失败: {}", e.getMessage());
            return Page.empty();
        }
    }

    @Override
    public List<DeviceDTO> getDevicesByStatus(Integer status) {
        logger.info("按设备状态查询: status={}", status);
        try {
            List<Device> devices = deviceRepository.findByStatus(status);
            return devices.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("按设备状态查询时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByProvince(String province) {
        logger.info("按省份查询设备: province={}", province);
        try {
            // 简化版本：直接返回所有设备，不进行省份筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按省份查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByCity(String city) {
        logger.info("按城市查询设备: city={}", city);
        try {
            // 简化版本：直接返回所有设备，不进行城市筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按城市查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByDistrict(String district) {
        logger.info("按区县查询设备: district={}", district);
        try {
            // 简化版本：直接返回所有设备，不进行区县筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按区县查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByProvinceAndCity(String province, String city) {
        logger.info("按省份和城市查询设备: province={}, city={}", province, city);
        try {
            // 简化版本：直接返回所有设备，不进行省市筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按省份和城市查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByProvinceAndCityAndDistrict(String province, String city, String district) {
        logger.info("按省市区域查询设备: province={}, city={}, district={}", province, city, district);
        try {
            // 简化版本：直接返回所有设备，不进行区域筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按省市区域查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByAreaId(Long areaId) {
        logger.info("按区域查询设备: areaId={}", areaId);
        try {
            // 简化版本：直接返回所有设备，不进行区域筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按区域查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Device> getDevicesByPrincipalId(Long principalId) {
        logger.info("按负责人查询设备: principalId={}", principalId);
        try {
            // 简化版本：直接返回所有设备，不进行负责人筛选
            return deviceRepository.findAll();
        } catch (Exception e) {
            logger.error("按负责人查询设备时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<DeviceDTO> getDevicesByType(Integer type) {
        logger.info("按设备类型查询: type={}", type);
        try {
            List<Device> devices = deviceRepository.findByDeviceTypeId(Long.valueOf(type));
            return devices.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("按设备类型查询时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDeviceAlerts(Map<String, String> params) {
        logger.info("获取设备预警列表，查询参数: {}", params);
        try {
            List<Map<String, Object>> alerts = new ArrayList<>();

            // 获取所有设备
            List<Device> devices = deviceRepository.findAll();

            // 获取所有维护记录
            List<MaintenanceRecord> allMaintenanceRecords = maintenanceRecordRepository.findAll();

            // 按设备ID分组维护记录
            Map<Long, List<MaintenanceRecord>> recordsByDevice = allMaintenanceRecords.stream()
                    .collect(Collectors.groupingBy(MaintenanceRecord::getDeviceId));

            // 遍历设备，根据最后维护日期判断是否需要维护提醒
            for (Device device : devices) {
                List<MaintenanceRecord> maintenanceRecords = recordsByDevice.get(device.getId());
                if (maintenanceRecords != null && !maintenanceRecords.isEmpty()) {
                    // 找到最新的维护记录
                    MaintenanceRecord latestRecord = maintenanceRecords.stream()
                            .filter(record -> record.getActualStartTime() != null)
                            .max(Comparator.comparing(MaintenanceRecord::getActualStartTime))
                            .orElse(null);

                    if (latestRecord != null) {
                        LocalDate lastMaintenance = latestRecord.getActualStartTime().toLocalDate();
                        LocalDate today = LocalDate.now();

                        // 计算距离上次维护的天数
                        long daysSinceLastMaintenance = ChronoUnit.DAYS.between(lastMaintenance, today);

                        // 如果距离上次维护超过180天，添加维护提醒
                        if (daysSinceLastMaintenance >= 180) {
                            Map<String, Object> alert = new HashMap<>();
                            alert.put("id", device.getId());
                            alert.put("deviceId", device.getId());
                            alert.put("deviceName", device.getDeviceName());
                            alert.put("deviceCode", device.getDeviceCode());
                            alert.put("alertType", "需要维护");
                            alert.put("alertLevel", "中级");
                            alert.put("alertTime", LocalDateTime.now().format(DATE_TIME_FORMATTER));
                            alert.put("description", "设备已超过" + daysSinceLastMaintenance + "天未维护，请及时安排维护");
                            alert.put("status", "未处理");
                            alerts.add(alert);
                        }
                    }
                }
            }

            // 获取故障类型的维护记录（维护类型为1表示故障维修）
            List<MaintenanceRecord> faultRecords = allMaintenanceRecords.stream()
                    .filter(record -> record.getMaintenanceType() != null && record.getMaintenanceType() == 1)
                    .collect(Collectors.toList());

            for (MaintenanceRecord record : faultRecords) {
                if (record.getDevice() != null) {
                    Device device = record.getDevice();
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("id", record.getId());
                    alert.put("deviceId", device.getId());
                    alert.put("deviceName", device.getDeviceName());
                    alert.put("deviceCode", device.getDeviceCode());
                    alert.put("alertType", "设备故障");
                    alert.put("alertLevel", "高级");
                    alert.put("alertTime", record.getCreateTime().format(DATE_TIME_FORMATTER));
                    alert.put("description", "设备故障：" + record.getMaintenanceContent());
                    alert.put("status", "未处理");
                    alerts.add(alert);
                }
            }

            // 按预警时间倒序排序
            alerts.sort((a1, a2) -> {
                String time1 = (String) a1.get("alertTime");
                String time2 = (String) a2.get("alertTime");
                return time2.compareTo(time1);
            });

            return alerts;
        } catch (Exception e) {
            logger.error("获取设备预警列表时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "recentOutboundStats", key = "#days")
    public long getRecentOutboundStats(int days) {
        logger.info("获取近{}天出库量统计", days);
        try {
            LocalDate startDate = LocalDate.now().minusDays(days);
            // 实际项目中，应该从出库记录表中查询
            // 这里假设设备的购入日期即为出库日期
            return deviceRepository.countByPurchaseDateAfter(startDate);
        } catch (Exception e) {
            logger.error("获取出库量统计时出错: {}", e.getMessage());
            return 0;
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "recentMaintenanceStats", key = "#days")
    public long getRecentMaintenanceStats(int days) {
        logger.info("获取近{}天维修量统计", days);
        try {
            LocalDate startDate = LocalDate.now().minusDays(days);
            // 从维修记录表中查询近days天的维修记录数
            return maintenanceRecordRepository.countByCreateTimeAfter(startDate.atStartOfDay());
        } catch (Exception e) {
            logger.error("获取维修量统计时出错: {}", e.getMessage());
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public Page<Device> getScrapRecords(int page, int pageSize, String deviceCode, LocalDateTime startDate,
            LocalDateTime endDate) {
        logger.info("获取设备报废记录，page={}, pageSize={}, deviceCode={}, startDate={}, endDate={}",
                page, pageSize, deviceCode, startDate, endDate);
        try {
            // 创建分页对象，按报废时间倒序排列
            Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "scrapTime"));

            // 调用Repository查询报废记录
            Page<Device> scrapRecords = deviceRepository.findScrapRecords(
                    DeviceStatus.SCRAPPED.getCode(),
                    deviceCode,
                    startDate,
                    endDate,
                    pageable);

            logger.info("查询到{}条报废记录", scrapRecords.getTotalElements());
            return scrapRecords;
        } catch (Exception e) {
            logger.error("获取报废记录时出错: {}", e.getMessage());
            // 返回空的分页结果
            return new PageImpl<>(new ArrayList<>(), PageRequest.of(page, pageSize), 0);
        }
    }

    @Override
    @Cacheable(value = "areaInventoryStatistics")
    public List<Map<String, Object>> getAreaInventoryStatistics() {
        logger.info("获取区域库存统计（含价值）");
        List<Map<String, Object>> statistics = new ArrayList<>();

        try {
            List<Object[]> results = deviceRepository.countDevicesByAreaWithValue();

            for (Object[] result : results) {
                Map<String, Object> stat = new HashMap<>();
                stat.put("areaId", result[0]);
                stat.put("areaName", result[1]);
                stat.put("deviceCount", result[2]);
                stat.put("totalValue", result[3] != null ? result[3] : java.math.BigDecimal.ZERO);
                statistics.add(stat);
            }

            logger.info("获取区域库存统计成功，共{}条记录", statistics.size());
        } catch (Exception e) {
            logger.error("获取区域库存统计失败: {}", e.getMessage());
        }

        return statistics;
    }

    @Override
    @Cacheable(value = "deviceTypeInventoryStatistics")
    public List<Map<String, Object>> getDeviceTypeInventoryStatistics() {
        logger.info("获取设备类型库存统计（含价值）");
        List<Map<String, Object>> statistics = new ArrayList<>();

        try {
            List<Object[]> results = deviceRepository.countDevicesByTypeWithValue();

            for (Object[] result : results) {
                Map<String, Object> stat = new HashMap<>();
                stat.put("typeId", result[0]);
                stat.put("typeName", result[1]);
                stat.put("deviceCount", result[2]);
                stat.put("totalValue", result[3] != null ? result[3] : java.math.BigDecimal.ZERO);
                statistics.add(stat);
            }

            logger.info("获取设备类型库存统计成功，共{}条记录", statistics.size());
        } catch (Exception e) {
            logger.error("获取设备类型库存统计失败: {}", e.getMessage());
        }

        return statistics;
    }

    @Override
    @Cacheable(value = "principalDeviceStatistics")
    public List<Map<String, Object>> getPrincipalDeviceStatistics() {
        logger.info("获取负责人设备统计");
        List<Map<String, Object>> statistics = new ArrayList<>();

        try {
            List<Device> devices = deviceRepository.findAll();
            Map<Long, Map<String, Object>> principalStats = new HashMap<>();

            for (Device device : devices) {
                if (device.getPrincipal() != null) {
                    Long principalId = device.getPrincipal().getId();
                    String principalName = device.getPrincipal().getRealName();

                    if (!principalStats.containsKey(principalId)) {
                        Map<String, Object> stat = new HashMap<>();
                        stat.put("principalId", principalId);
                        stat.put("principalName", principalName);
                        stat.put("deviceCount", 0L);
                        principalStats.put(principalId, stat);
                    }

                    Map<String, Object> stat = principalStats.get(principalId);
                    stat.put("deviceCount", (Long) stat.get("deviceCount") + 1);
                }
            }

            statistics.addAll(principalStats.values());

            logger.info("获取负责人设备统计成功，共{}条记录", statistics.size());
        } catch (Exception e) {
            logger.error("获取负责人设备统计失败: {}", e.getMessage());
        }

        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<DeviceDTO> searchDevices(String keyword, Pageable pageable) {
        logger.info("搜索设备，关键词: {}, 分页: {}", keyword, pageable);
        try {
            Specification<Device> spec = (root, query, cb) -> cb.conjunction();

            if (keyword != null && !keyword.trim().isEmpty()) {
                spec = spec.and((root, query, cb) -> cb.or(
                        cb.like(root.get("deviceName"), "%" + keyword + "%"),
                        cb.like(root.get("deviceCode"), "%" + keyword + "%"),
                        cb.like(root.get("specifications"), "%" + keyword + "%")));
            }

            Page<Device> devices = deviceRepository.findAll(spec, pageable);
            List<DeviceDTO> dtoList = devices.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            logger.info("搜索设备完成，共找到{}条记录", devices.getTotalElements());
            return PageResult.of(devices, dtoList);
        } catch (Exception e) {
            logger.error("搜索设备时出错: {}", e.getMessage());
            return PageResult.empty(pageable.getPageSize());
        }
    }

    @Transactional(readOnly = true)
    public Device getDeviceByIdForQuery(Long id) {
        logger.info("根据ID获取设备详情，ID: {}", id);
        try {
            Optional<Device> deviceOpt = deviceRepository.findById(id);
            if (deviceOpt.isPresent()) {
                logger.info("成功获取设备详情");
                return deviceOpt.get();
            } else {
                logger.warn("未找到ID为{}的设备", id);
                return null;
            }
        } catch (Exception e) {
            logger.error("获取设备详情时出错: {}", e.getMessage());
            return null;
        }
    }

    @Transactional
    public Device updateDevice(Device device) {
        logger.info("更新设备信息，设备ID: {}", device.getId());
        try {
            // 检查设备是否存在
            if (!deviceRepository.existsById(device.getId())) {
                logger.warn("设备不存在，ID: {}", device.getId());
                return null;
            }

            // 保存更新后的设备信息
            Device updatedDevice = deviceRepository.save(device);
            logger.info("设备信息更新成功");
            return updatedDevice;
        } catch (Exception e) {
            logger.error("更新设备信息时出错: {}", e.getMessage());
            return null;
        }
    }

    public long getTotalDeviceCount() {
        logger.info("获取设备总数");
        try {
            return deviceRepository.count();
        } catch (Exception e) {
            logger.error("获取设备总数时出错: {}", e.getMessage());
            return 0;
        }
    }

    public long getInStockDeviceCount() {
        logger.info("获取在库设备数量");
        try {
            return deviceRepository.countByStatus(DeviceStatus.IN_STOCK.getCode());
        } catch (Exception e) {
            logger.error("获取在库设备数量时出错: {}", e.getMessage());
            return 0;
        }
    }

    public long getAvailableDeviceCount() {
        logger.info("获取可用设备数量");
        try {
            return deviceRepository.countByStatus(DeviceStatus.IN_STOCK.getCode());
        } catch (Exception e) {
            logger.error("获取可用设备数量时出错: {}", e.getMessage());
            return 0;
        }
    }

    public long getInstalledDeviceCount() {
        logger.info("获取已安装设备数量");
        try {
            return deviceRepository.countByStatus(DeviceStatus.IN_USE.getCode());
        } catch (Exception e) {
            logger.error("获取已安装设备数量时出错: {}", e.getMessage());
            return 0;
        }
    }

    public long getRepairingDeviceCount() {
        logger.info("获取维修中设备数量");
        try {
            return deviceRepository.countByStatus(DeviceStatus.MAINTENANCE.getCode());
        } catch (Exception e) {
            logger.error("获取维修中设备数量时出错: {}", e.getMessage());
            return 0;
        }
    }

    public long getScrappedDeviceCount() {
        logger.info("获取已报废设备数量");
        try {
            return deviceRepository.countByStatus(DeviceStatus.SCRAPPED.getCode());
        } catch (Exception e) {
            logger.error("获取已报废设备数量时出错: {}", e.getMessage());
            return 0;
        }
    }

    public List<Map<String, Object>> getDeviceTypes() {
        logger.info("获取设备类型列表");
        try {
            List<DeviceType> deviceTypes = deviceTypeRepository.findAll();
            return deviceTypes.stream()
                    .map(type -> {
                        Map<String, Object> typeMap = new HashMap<>();
                        typeMap.put("id", type.getId());
                        typeMap.put("name", type.getTypeName());
                        typeMap.put("code", type.getTypeCode());
                        return typeMap;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("获取设备类型列表时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<DeviceDTO> getDevices(Pageable pageable) {
        logger.info("分页获取设备列表，页码: {}, 大小: {}", pageable.getPageNumber(), pageable.getPageSize());
        try {
            Page<Device> page = deviceRepository.findAll(pageable);
            List<DeviceDTO> dtoList = page.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return PageResult.of(page, dtoList);
        } catch (Exception e) {
            logger.error("分页获取设备列表时出错: {}", e.getMessage());
            return PageResult.empty();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DeviceDTO getDeviceById(Long id) {
        logger.info("根据ID获取设备，ID: {}", id);
        try {
            Device device = deviceRepository.findById(id).orElse(null);
            return device != null ? convertToDTO(device) : null;
        } catch (Exception e) {
            logger.error("根据ID获取设备时出错: {}", e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DeviceDTO getDeviceByCode(String deviceCode) {
        logger.info("根据设备编号获取设备，编号: {}", deviceCode);
        try {
            Device device = deviceRepository.findByDeviceCode(deviceCode).orElse(null);
            return device != null ? convertToDTO(device) : null;
        } catch (Exception e) {
            logger.error("根据设备编号获取设备时出错: {}", e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceDTO> getDevicesByWarehouse(Integer warehouseId) {
        logger.info("根据仓库获取设备列表，仓库ID: {}", warehouseId);
        try {
            List<Device> devices = deviceRepository.findByWarehouseId(warehouseId.longValue());
            return devices.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("根据仓库获取设备列表时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceDTO> getDevicesByArea(Integer areaId) {
        logger.info("根据区域获取设备列表，区域ID: {}", areaId);
        try {
            List<Device> devices = deviceRepository.findByAreaId(areaId.longValue());
            return devices.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("根据区域获取设备列表时出错: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private DeviceDTO convertToDTO(Device device) {
        DeviceDTO dto = new DeviceDTO();
        dto.setId(device.getId());
        dto.setDeviceCode(device.getDeviceCode());
        dto.setDeviceName(device.getDeviceName());
        dto.setDeviceModel(device.getModel());
        dto.setDeviceSpec(device.getSpecifications());
        dto.setManufacturer(device.getManufacturer());
        dto.setDeviceTypeId(device.getTypeId() != null ? device.getTypeId().intValue() : null);
        if (device.getDeviceType() != null) {
            dto.setDeviceTypeName(device.getDeviceType().getTypeName());
        }
        dto.setStatus(device.getStatus());
        dto.setStatusName(getStatusName(device.getStatus()));
        dto.setCurrentStock(device.getCurrentStock());
        dto.setTotalStock(device.getCurrentStock());

        // 区域和货位信息
        dto.setAreaId(device.getAreaId() != null ? device.getAreaId().intValue() : null);
        if (device.getArea() != null) {
            dto.setAreaName(device.getArea().getName());
            // 从区域获取仓库信息
            if (device.getArea().getWarehouse() != null) {
                dto.setWarehouseId(device.getArea().getWarehouse().getId().intValue());
                dto.setWarehouseName(device.getArea().getWarehouse().getWarehouseName());
            }
        }

        // 货位信息
        dto.setBinId(device.getBinId() != null ? device.getBinId().intValue() : null);
        if (device.getBin() != null) {
            dto.setBinName(device.getBin().getName());
        }

        // 日期信息
        if (device.getPurchaseDate() != null) {
            dto.setPurchaseDate(device.getPurchaseDate().toString());
        }
        if (device.getProductionDate() != null) {
            dto.setProductionDate(device.getProductionDate());
        }
        if (device.getWarrantyStart() != null) {
            dto.setWarrantyStart(device.getWarrantyStart());
        }
        if (device.getWarrantyEnd() != null) {
            dto.setWarrantyEnd(device.getWarrantyEnd());
        }
        dto.setWarrantyPeriod(device.getWarrantyPeriod() != null ? device.getWarrantyPeriod().toString() : null);

        // 价格和规格
        dto.setPurchasePrice(device.getPurchasePrice() != null ? device.getPurchasePrice().doubleValue() : null);
        dto.setPrice(device.getPrice() != null ? device.getPrice().doubleValue() : null);
        dto.setRemark(device.getDescription());

        // 新增字段
        dto.setSerialNumber(device.getSerialNumber());
        dto.setAssetCode(device.getSupplierBatchNo());
        dto.setSpecifications(device.getSpecifications());
        dto.setImageUrl(device.getImageUrl());
        dto.setDescription(device.getDescription());

        // 负责人信息
        if (device.getPrincipal() != null) {
            dto.setPrincipalId(device.getPrincipal().getId());
            dto.setPrincipalName(device.getPrincipal().getRealName() != null ? device.getPrincipal().getRealName()
                    : device.getPrincipal().getUsername());
        }

        // 供应商信息
        dto.setSupplierId(device.getSupplierId());
        if (device.getSupplier() != null) {
            dto.setSupplierName(device.getSupplier().getName());
        }

        // 安装位置信息 - 从安装记录表中获取
        loadInstallationInfo(device.getId(), dto);

        dto.setCreateTime(device.getCreateTime());
        dto.setUpdateTime(device.getUpdateTime());
        return dto;
    }

    /**
     * 从安装记录中加载安装信息
     * 
     * @param deviceId 设备ID
     * @param dto      设备DTO
     */
    private void loadInstallationInfo(Long deviceId, DeviceDTO dto) {
        try {
            Optional<InstallationRecord> latestRecord = installationRecordRepository
                    .findTopByDeviceIdOrderByInstallDateDesc(deviceId);

            if (latestRecord.isPresent()) {
                InstallationRecord record = latestRecord.get();
                dto.setInstallationLocation(record.getInstallLocation());

                // 如果安装记录中有安装人信息
                if (record.getInstaller() != null) {
                    // 注意：这里不覆盖设备的负责人信息，安装人可能不同于设备负责人
                    // 如果需要显示安装人，需要在DTO中新增字段
                }
            }
        } catch (Exception e) {
            logger.warn("加载设备安装信息失败，设备ID: {}", deviceId, e);
        }
    }

    private String getStatusName(Integer status) {
        if (status == null)
            return "未知";
        switch (status) {
            case -1:
                return "已停用";
            case 0:
                return "待入库";
            case 1:
                return "在库";
            case 2:
                return "出库中";
            case 3:
                return "维修中";
            case 4:
                return "报废";
            default:
                return "未知";
        }
    }
}