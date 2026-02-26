package com.backend.service.warehouse.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.PageResult;
import com.backend.entity.AdministrativeDivision;
import com.backend.entity.Warehouse;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.AdministrativeDivisionRepository;
import com.backend.repository.WarehouseRepository;
import com.backend.service.warehouse.WarehouseService;

@Service
public class WarehouseServiceImpl implements WarehouseService {
    private static final Logger logger = LoggerFactory.getLogger(WarehouseServiceImpl.class);
    private final WarehouseRepository warehouseRepository;
    private final AdministrativeDivisionRepository divisionRepository;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository,
                                AdministrativeDivisionRepository divisionRepository) {
        this.warehouseRepository = warehouseRepository;
        this.divisionRepository = divisionRepository;
    }

    @Override
    public List<Warehouse> getAllWarehouses() {
        logger.info("获取所有仓库");
        return warehouseRepository.findAll();
    }

    @Override
    public Warehouse getWarehouseById(Long id) {
        logger.info("获取仓库详情, ID: {}", id);
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }

    @Override
    public Warehouse getWarehouseByCode(String code) {
        logger.info("获取仓库详情, 编码: {}", code);
        return warehouseRepository.findByWarehouseCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "code", code));
    }

    @Override
    @Transactional
    public Warehouse createWarehouse(Warehouse warehouse) {
        logger.info("创建仓库: {}", warehouse.getWarehouseName());

        if (warehouseRepository.existsByWarehouseCode(warehouse.getWarehouseCode())) {
            throw new BusinessException(ErrorCode.WAREHOUSE_CODE_EXISTS);
        }

        warehouse.setStatus(1); // 启用状态
        warehouse.setCreateTime(LocalDateTime.now());
        warehouse.setUpdateTime(LocalDateTime.now());

        Warehouse saved = warehouseRepository.save(warehouse);
        logger.info("仓库创建成功, ID: {}", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Warehouse updateWarehouse(Long id, Warehouse warehouse) {
        logger.info("更新仓库, ID: {}", id);

        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        existing.setWarehouseName(warehouse.getWarehouseName());
        existing.setWarehouseType(warehouse.getWarehouseType());
        existing.setAddress(warehouse.getAddress());
        existing.setContactPerson(warehouse.getContactPerson());
        existing.setContactPhone(warehouse.getContactPhone());
        existing.setCapacity(warehouse.getCapacity());
        existing.setAreaSize(warehouse.getAreaSize());
        existing.setUpdateTime(LocalDateTime.now());

        Warehouse updated = warehouseRepository.save(existing);
        logger.info("仓库更新成功, ID: {}", updated.getId());
        return updated;
    }

    @Override
    @Transactional
    public void deleteWarehouse(Long id) {
        logger.info("删除仓库, ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        warehouseRepository.delete(warehouse);
        logger.info("仓库删除成功, ID: {}", id);
    }

    @Override
    public PageResult<Warehouse> getWarehouses(Pageable pageable) {
        logger.info("分页获取仓库");
        Page<Warehouse> page = warehouseRepository.findAll(pageable);
        return PageResult.of(page);
    }

    @Override
    public List<Warehouse> getWarehousesByAdministrativeDivision(Long administrativeDivisionId) {
        logger.info("根据行政区划获取仓库, ID: {}", administrativeDivisionId);
        // 暂时返回所有仓库
        return warehouseRepository.findAll();
    }

    @Override
    public List<Warehouse> getActiveWarehouses() {
        logger.info("获取启用状态的仓库");
        return warehouseRepository.findByStatus(1);
    }

    @Override
    @Transactional
    public void updateWarehouseStatus(Long id, Integer status) {
        logger.info("更新仓库状态, ID: {}, 状态: {}", id, status);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        warehouse.setStatus(status);
        warehouse.setUpdateTime(LocalDateTime.now());
        warehouseRepository.save(warehouse);

        logger.info("仓库状态更新成功, ID: {}", id);
    }

    @Override
    public Map<String, Object> getWarehouseStats(Long id) {
        logger.info("获取仓库统计信息, ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id).orElse(null);
        if (warehouse == null) {
            return null;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("warehouseId", warehouse.getId());
        stats.put("warehouseCode", warehouse.getWarehouseCode());
        stats.put("warehouseName", warehouse.getWarehouseName());
        stats.put("provinceName", warehouse.getProvinceName());
        stats.put("cityName", warehouse.getCityName());
        stats.put("districtName", warehouse.getDistrictName());
        stats.put("fullAddress", warehouse.getFullAddress());
        stats.put("areaCount", 0); // 区域统计可通过扩展AreaService实现
        stats.put("binCount", 0); // 货位统计可通过扩展BinService实现
        stats.put("deviceCount", 0); // 设备统计可通过扩展DeviceService实现
        stats.put("longitude", warehouse.getLongitude());
        stats.put("latitude", warehouse.getLatitude());

        return stats;
    }

    @Override
    @Transactional
    public Warehouse updateWarehouseAddress(Long id, Map<String, Object> address) {
        logger.info("更新仓库地址, ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        Long provinceId = address.get("provinceId") != null ? Long.valueOf(address.get("provinceId").toString()) : null;
        Long cityId = address.get("cityId") != null ? Long.valueOf(address.get("cityId").toString()) : null;
        Long districtId = address.get("districtId") != null ? Long.valueOf(address.get("districtId").toString()) : null;
        String detailAddress = address.get("detailAddress") != null ? address.get("detailAddress").toString() : null;
        Double longitude = address.get("longitude") != null ? Double.valueOf(address.get("longitude").toString()) : null;
        Double latitude = address.get("latitude") != null ? Double.valueOf(address.get("latitude").toString()) : null;

        // 获取行政区划名称
        String provinceName = null;
        String cityName = null;
        String districtName = null;

        if (provinceId != null) {
            AdministrativeDivision province = divisionRepository.findById(provinceId).orElse(null);
            provinceName = province != null ? province.getName() : null;
        }
        if (cityId != null) {
            AdministrativeDivision city = divisionRepository.findById(cityId).orElse(null);
            cityName = city != null ? city.getName() : null;
        }
        if (districtId != null) {
            AdministrativeDivision district = divisionRepository.findById(districtId).orElse(null);
            districtName = district != null ? district.getName() : null;
        }

        // 更新地址信息
        warehouse.updateAddress(provinceId, provinceName, cityId, cityName, districtId, districtName, detailAddress);
        warehouse.setLongitude(longitude);
        warehouse.setLatitude(latitude);
        warehouse.setUpdateTime(LocalDateTime.now());

        Warehouse updated = warehouseRepository.save(warehouse);
        logger.info("仓库地址更新成功, ID: {}", updated.getId());
        return updated;
    }

    @Override
    public List<Warehouse> getWarehousesByDivision(Long provinceId, Long cityId, Long districtId) {
        logger.info("按行政区划筛选仓库, provinceId: {}, cityId: {}, districtId: {}", provinceId, cityId, districtId);

        List<Warehouse> allWarehouses = warehouseRepository.findByStatus(1);

        return allWarehouses.stream()
                .filter(w -> provinceId == null || provinceId.equals(w.getProvinceId()))
                .filter(w -> cityId == null || cityId.equals(w.getCityId()))
                .filter(w -> districtId == null || districtId.equals(w.getDistrictId()))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getWarehouseOverviewStats() {
        logger.info("获取仓库概览统计");

        List<Warehouse> warehouses = warehouseRepository.findAll();

        long totalCount = warehouses.size();
        long activeCount = warehouses.stream().filter(w -> w.getStatus() != null && w.getStatus() == 1).count();
        long inactiveCount = totalCount - activeCount;

        double totalArea = warehouses.stream()
                .filter(w -> w.getAreaSize() != null)
                .mapToDouble(Warehouse::getAreaSize)
                .sum();

        double totalCapacity = warehouses.stream()
                .filter(w -> w.getCapacity() != null)
                .mapToDouble(Warehouse::getCapacity)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", totalCount);
        stats.put("activeCount", activeCount);
        stats.put("inactiveCount", inactiveCount);
        stats.put("totalArea", totalArea);
        stats.put("totalCapacity", totalCapacity);

        return stats;
    }
}
