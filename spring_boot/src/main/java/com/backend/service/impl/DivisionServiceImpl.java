package com.backend.service.impl;

import com.backend.entity.AdministrativeDivision;
import com.backend.repository.AdministrativeDivisionRepository;
import com.backend.service.DivisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 行政区划服务实现类
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Service
@RequiredArgsConstructor
public class DivisionServiceImpl implements DivisionService {

    private final AdministrativeDivisionRepository divisionRepository;

    @Override
    public List<AdministrativeDivision> getDivisionTree(Long parentId) {
        if (parentId == null) {
            // 查询所有省级行政区
            return divisionRepository.findByLevelOrderBySortAsc(1);
        } else {
            // 查询指定父级下的子级
            return divisionRepository.findByParentIdOrderBySortAsc(parentId);
        }
    }

    @Override
    public List<AdministrativeDivision> getProvinces() {
        return divisionRepository.findByLevelOrderBySortAsc(1);
    }

    @Override
    public List<AdministrativeDivision> getCities(Long provinceId) {
        return divisionRepository.findByParentIdOrderBySortAsc(provinceId);
    }

    @Override
    public List<AdministrativeDivision> getDistricts(Long cityId) {
        return divisionRepository.findByParentIdOrderBySortAsc(cityId);
    }

    @Override
    public AdministrativeDivision getDivisionById(Long id) {
        return divisionRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public AdministrativeDivision createDivision(AdministrativeDivision division) {
        // 设置级别
        if (division.getParentId() == null) {
            division.setLevel(1); // 省级
        } else {
            AdministrativeDivision parent = divisionRepository.findById(division.getParentId()).orElse(null);
            if (parent != null) {
                division.setLevel(parent.getLevel() + 1);
            }
        }
        
        // 设置默认状态
        if (division.getStatus() == null) {
            division.setStatus(1);
        }
        
        return divisionRepository.save(division);
    }

    @Override
    @Transactional
    public AdministrativeDivision updateDivision(Long id, AdministrativeDivision division) {
        AdministrativeDivision existing = divisionRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        
        // 更新字段
        if (division.getCode() != null) {
            existing.setCode(division.getCode());
        }
        if (division.getName() != null) {
            existing.setName(division.getName());
        }
        if (division.getSort() != null) {
            existing.setSort(division.getSort());
        }
        if (division.getStatus() != null) {
            existing.setStatus(division.getStatus());
        }
        
        return divisionRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteDivision(Long id) {
        // 检查是否有子级
        List<AdministrativeDivision> children = divisionRepository.findByParentIdOrderBySortAsc(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("该行政区划下有子级，无法删除");
        }
        
        divisionRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getDivisionStats(Long id) {
        Map<String, Object> stats = new HashMap<>();
        
        AdministrativeDivision division = divisionRepository.findById(id).orElse(null);
        if (division == null) {
            return stats;
        }
        
        // 下级区划数量
        List<AdministrativeDivision> children = divisionRepository.findByParentIdOrderBySortAsc(id);
        stats.put("childrenCount", children.size());
        
        // 关联仓库数量、设备安装数量等统计可通过扩展StatisticsService实现
        stats.put("warehouseCount", 0);
        stats.put("deviceCount", 0);
        
        return stats;
    }
}
