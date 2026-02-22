package com.backend.service;

import com.backend.common.ErrorCode;
import com.backend.entity.Area;
import com.backend.enumtype.EntityType.AreaStatus;
import com.backend.exception.BusinessException;
import com.backend.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 区域服务类
 */
@Service
public class AreaService {

    @Autowired
    private AreaRepository areaRepository;

    /**
     * 保存区域
     */
    @Transactional
    public Area saveArea(Area area) {
        return areaRepository.save(area);
    }

    /**
     * 根据ID获取区域
     */
    public Optional<Area> getAreaById(Long id) {
        return areaRepository.findById(id);
    }

    /**
     * 根据名称获取区域
     */
    public Area getAreaByName(String name) {
        return areaRepository.findByName(name).orElse(null);
    }

    /**
     * 获取所有区域
     */
    public List<Area> getAllAreas() {
        return areaRepository.findAll();
    }

    /**
     * 获取区域列表（分页）
     */
    public Page<Area> getAreaList(String areaName, String level, Long parentId, AreaStatus status, Pageable pageable) {
        if (areaName != null && !areaName.isEmpty()) {
            return areaRepository.findByNameContaining(areaName, pageable);
        }
        if (status != null) {
            return areaRepository.findByStatus(status.getCode(), pageable);
        }
        return areaRepository.findAll(pageable);
    }

    /**
     * 更新区域
     */
    @Transactional
    public Area updateArea(Long id, Area areaDetails) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.AREA_NOT_FOUND));

        if (areaDetails.getCity() != null) {
            area.setCityDivision(areaDetails.getCity());
        }
        if (areaDetails.getDistrict() != null) {
            area.setDistrictDivision(areaDetails.getDistrict());
        }
        if (areaDetails.getLocation() != null) {
            area.setLocation(areaDetails.getLocation());
        }
        if (areaDetails.getCode() != null) {
            area.setCode(areaDetails.getCode());
        }
        if (areaDetails.getSort() != null) {
            area.setSort(areaDetails.getSort());
        }
        if (areaDetails.getStatus() != null) {
            area.setStatus(areaDetails.getStatus());
        }
        if (areaDetails.getRemark() != null) {
            area.setRemark(areaDetails.getRemark());
        }

        return areaRepository.save(area);
    }

    /**
     * 删除区域
     */
    @Transactional
    public void deleteArea(Long id) {
        areaRepository.deleteById(id);
    }

    /**
     * 批量删除区域
     */
    @Transactional
    public int batchDeleteArea(List<Long> ids) {
        areaRepository.deleteAllById(ids);
        return ids.size();
    }

    /**
     * 更新区域状态
     */
    @Transactional
    public void updateAreaStatus(Long id, AreaStatus status) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.AREA_NOT_FOUND));
        area.setStatus(status.getCode());
        areaRepository.save(area);
    }

    /**
     * 检查是否有子区域
     */
    public boolean hasChildren(Long id) {
        return false;
    }

    /**
     * 导出区域列表
     */
    public byte[] exportAreaList(String areaName, String level, Long parentId, AreaStatus status) {
        return new byte[0];
    }

    /**
     * 获取区域树
     */
    public List<Map<String, Object>> getAreaTree(AreaStatus status) {
        List<Area> areas = status != null ? areaRepository.findByStatus(status.getCode()) : areaRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Area area : areas) {
            Map<String, Object> map = new HashMap<>();
            String cityName = area.getCity() != null ? area.getCity().getName() : "";
            String districtName = area.getDistrict() != null ? area.getDistrict().getName() : "";
            map.put("id", area.getId());
            map.put("name", cityName + "-" + districtName + "-" + (area.getLocation() != null ? area.getLocation() : ""));
            map.put("city", area.getCity());
            map.put("district", area.getDistrict());
            map.put("location", area.getLocation());
            map.put("status", area.getStatus());
            result.add(map);
        }
        return result;
    }

    /**
     * 获取子区域列表
     */
    public List<Area> getChildAreaList(Long parentId, AreaStatus status) {
        return Collections.emptyList();
    }

    /**
     * 根据名称检查是否存在
     */
    public boolean existsByName(String name, Long excludeId) {
        return false;
    }

/**
 * 根据编码检查是否存在
 */
public boolean existsByCode(String code, Long excludeId) {
        if (excludeId == null) {
            return areaRepository.existsByCode(code);
        }
        return areaRepository.existsByCodeAndIdNot(code, excludeId);
    }
}
