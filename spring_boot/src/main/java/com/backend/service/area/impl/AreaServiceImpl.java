package com.backend.service.area.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.backend.entity.Area;
import com.backend.enumtype.EntityType.AreaStatus;
import com.backend.exception.BusinessException;
import com.backend.repository.AreaRepository;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.WarehouseRepository;
import com.backend.service.area.AreaService;
import com.backend.service.base.AbstractCrudService;

@Service
public class AreaServiceImpl extends AbstractCrudService<Area, Long> implements AreaService {
    private static final Logger logger = LoggerFactory.getLogger(AreaServiceImpl.class);
    private final AreaRepository areaRepository;
    private final DeviceRepository deviceRepository;
    private final WarehouseRepository warehouseRepository;
    private final BinRepository binRepository;

    public AreaServiceImpl(AreaRepository areaRepository,
            DeviceRepository deviceRepository,
            WarehouseRepository warehouseRepository,
            BinRepository binRepository) {
        super(areaRepository, "区域");
        this.areaRepository = areaRepository;
        this.deviceRepository = deviceRepository;
        this.warehouseRepository = warehouseRepository;
        this.binRepository = binRepository;
    }

    @Override
    public Map<String, Object> getAreaStatistics(Long areaId) {
        Map<String, Object> stats = new HashMap<>();

        if (areaId != null) {
            Area area = areaRepository.findById(areaId).orElse(null);
            if (area != null) {
                stats.put("areaId", area.getId());
                stats.put("areaName", area.getName());
                stats.put("areaCode", area.getCode());
                stats.put("warehouseId", area.getWarehouseId());
                stats.put("status", area.getStatus());

                // 设备统计
                Long deviceCount = deviceRepository.countByAreaId(areaId);
                stats.put("deviceCount", deviceCount);

                // 货位统计
                long binCount = binRepository.countByAreaId(areaId);
                long usedBinCount = binRepository.countUsedBinsByAreaId(areaId);
                stats.put("binCount", binCount);
                stats.put("usedBinCount", usedBinCount);
                stats.put("availableBinCount", binCount - usedBinCount);
            }
        } else {
            Long totalAreas = areaRepository.count();
            Long activeAreas = areaRepository.countByStatus(1);
            stats.put("totalAreas", totalAreas);
            stats.put("activeAreas", activeAreas);
            stats.put("inactiveAreas", totalAreas - activeAreas);
        }

        return stats;
    }

    @Override
    public List<String> findAllCities() {
        return areaRepository.findAllCities();
    }

    @Override
    public List<String> findDistrictsByCity(String city) {
        return areaRepository.findDistrictsByCity(city);
    }

    @Override
    public List<String> findLocationsByCityAndDistrict(String city, String district) {
        return areaRepository.findLocationsByCityAndDistrict(city, district);
    }

    @Override
    public boolean existsByCode(String code, Long excludeId) {
        if (excludeId == null) {
            return areaRepository.existsByCode(code);
        }
        return areaRepository.existsByCodeAndIdNot(code, excludeId);
    }

    @Override
    public boolean existsByLocation(String city, String district, String location, Long excludeId) {
        return areaRepository.existsByLocation(city, district, location, excludeId);
    }

    @Override
    public Area saveArea(Area area) {
        return areaRepository.save(area);
    }

    @Override
    public Optional<Area> getAreaById(Long id) {
        return areaRepository.findById(id);
    }

    @Override
    public List<Area> getAllAreas() {
        return areaRepository.findAll();
    }

    @Override
    public Area updateArea(Long id, Area areaDetails) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("区域不存在: " + id));

        if (areaDetails.getCode() != null) {
            area.setCode(areaDetails.getCode());
        }
        if (areaDetails.getName() != null) {
            area.setName(areaDetails.getName());
        }
        if (areaDetails.getLocation() != null) {
            area.setLocation(areaDetails.getLocation());
        }
        if (areaDetails.getStatus() != null) {
            area.setStatus(areaDetails.getStatus());
        }
        if (areaDetails.getSort() != null) {
            area.setSort(areaDetails.getSort());
        }
        if (areaDetails.getRemark() != null) {
            area.setRemark(areaDetails.getRemark());
        }

        return areaRepository.save(area);
    }

    @Override
    public void deleteArea(Long id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("区域不存在: " + id));
        areaRepository.delete(area);
    }

    @Override
    public Area getAreaByLocation(String city, String district, String location) {
        return areaRepository.findByCityAndDistrictAndLocation(city, district, location).orElse(null);
    }

    @Override
    public Page<Area> getAreaList(String areaName, String level, Long parentId, Long warehouseId, AreaStatus status,
            Pageable pageable) {
        return areaRepository.findByConditions(warehouseId, areaName, pageable);
    }

    @Override
    public int batchDeleteArea(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            if (areaRepository.existsById(id)) {
                areaRepository.deleteById(id);
                count++;
            }
        }
        return count;
    }

    @Override
    public void updateAreaStatus(Long id, AreaStatus status) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("区域不存在: " + id));
        area.setStatus(status.getCode());
        areaRepository.save(area);
    }

    @Override
    public int batchUpdateAreaStatus(List<Long> ids, AreaStatus status) {
        int count = 0;
        for (Long id : ids) {
            Area area = areaRepository.findById(id).orElse(null);
            if (area != null) {
                area.setStatus(status.getCode());
                areaRepository.save(area);
                count++;
            }
        }
        return count;
    }

    @Override
    public byte[] exportAreaList(String areaName, String level, Long parentId, Long warehouseId, AreaStatus status) {
        throw new BusinessException("导出功能暂未实现");
    }

    @Override
    public List<Map<String, Object>> getAreaTree(AreaStatus status) {
        throw new BusinessException("树形结构功能暂未实现");
    }

    @Override
    public List<Area> getAreaListByCity(String city, AreaStatus status) {
        return areaRepository.findByCityNameAndStatus(city, status.getCode());
    }
}
