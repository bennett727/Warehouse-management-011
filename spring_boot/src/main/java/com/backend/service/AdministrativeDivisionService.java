package com.backend.service;

import com.backend.entity.AdministrativeDivision;
import com.backend.repository.AdministrativeDivisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdministrativeDivisionService {

    private final AdministrativeDivisionRepository divisionRepository;

    public List<AdministrativeDivision> getDivisionTree(Integer level, Long parentId) {
        List<AdministrativeDivision> allDivisions;
        
        if (level != null) {
            allDivisions = divisionRepository.findByLevel(level);
        } else if (parentId != null) {
            allDivisions = divisionRepository.findByParentId(parentId);
        } else {
            allDivisions = divisionRepository.findAll();
        }
        
        return buildTree(allDivisions);
    }

    private List<AdministrativeDivision> buildTree(List<AdministrativeDivision> divisions) {
        Map<Long, AdministrativeDivision> divisionMap = divisions.stream()
                .collect(Collectors.toMap(AdministrativeDivision::getId, d -> d));
        
        List<AdministrativeDivision> roots = new ArrayList<>();
        
        for (AdministrativeDivision division : divisions) {
            if (division.getParentId() == null) {
                roots.add(division);
            } else {
                AdministrativeDivision parent = divisionMap.get(division.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(division);
                }
            }
        }
        
        return roots;
    }

    public List<AdministrativeDivision> getByLevel(Integer level) {
        return divisionRepository.findByLevelOrderBySortAsc(level);
    }

    public List<AdministrativeDivision> getByParentId(Long parentId) {
        return divisionRepository.findByParentIdOrderBySortAsc(parentId);
    }

    public AdministrativeDivision getById(Long id) {
        return divisionRepository.findById(id).orElse(null);
    }

    public AdministrativeDivision getByCode(String code) {
        return divisionRepository.findByCode(code).orElse(null);
    }

    @Transactional
    public AdministrativeDivision create(AdministrativeDivision division) {
        if (division.getCode() == null || division.getCode().isEmpty()) {
            throw new RuntimeException("行政区划编码不能为空");
        }
        if (division.getName() == null || division.getName().isEmpty()) {
            throw new RuntimeException("行政区划名称不能为空");
        }
        if (division.getLevel() == null) {
            throw new RuntimeException("行政区划级别不能为空");
        }
        
        Optional<AdministrativeDivision> existing = divisionRepository.findByCode(division.getCode());
        if (existing.isPresent()) {
            throw new RuntimeException("行政区划编码已存在: " + division.getCode());
        }
        
        return divisionRepository.save(division);
    }

    @Transactional
    public AdministrativeDivision update(Long id, AdministrativeDivision division) {
        Optional<AdministrativeDivision> existingOpt = divisionRepository.findById(id);
        if (!existingOpt.isPresent()) {
            return null;
        }
        
        AdministrativeDivision existing = existingOpt.get();
        existing.setName(division.getName());
        existing.setSort(division.getSort());
        existing.setStatus(division.getStatus());
        
        return divisionRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        List<AdministrativeDivision> children = divisionRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("该行政区划存在下级区划，无法删除");
        }
        divisionRepository.deleteById(id);
    }

    public Map<String, Object> getStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        long provinceCount = divisionRepository.countByLevel(1);
        long cityCount = divisionRepository.countByLevel(2);
        long districtCount = divisionRepository.countByLevel(3);
        long totalCount = divisionRepository.count();
        
        statistics.put("provinceCount", provinceCount);
        statistics.put("cityCount", cityCount);
        statistics.put("districtCount", districtCount);
        statistics.put("totalCount", totalCount);
        
        return statistics;
    }

    @Transactional
    public Map<String, Object> batchImport(List<AdministrativeDivision> divisions) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> failMessages = new ArrayList<>();
        
        for (AdministrativeDivision division : divisions) {
            try {
                Optional<AdministrativeDivision> existing = divisionRepository.findByCode(division.getCode());
                if (existing.isPresent()) {
                    AdministrativeDivision toUpdate = existing.get();
                    toUpdate.setName(division.getName());
                    toUpdate.setLevel(division.getLevel());
                    toUpdate.setParentId(division.getParentId());
                    toUpdate.setSort(division.getSort());
                    divisionRepository.save(toUpdate);
                } else {
                    divisionRepository.save(division);
                }
                successCount++;
            } catch (Exception e) {
                failCount++;
                failMessages.add(division.getName() + ": " + e.getMessage());
            }
        }
        
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failMessages", failMessages);
        
        return result;
    }

    public Map<String, Object> getCascadeInfo(Long provinceId, Long cityId, Long districtId) {
        Map<String, Object> cascadeInfo = new HashMap<>();
        
        AdministrativeDivision province = divisionRepository.findById(provinceId).orElse(null);
        AdministrativeDivision city = divisionRepository.findById(cityId).orElse(null);
        AdministrativeDivision district = divisionRepository.findById(districtId).orElse(null);
        
        if (province != null) {
            cascadeInfo.put("provinceName", province.getName());
            cascadeInfo.put("provinceCode", province.getCode());
        }
        if (city != null) {
            cascadeInfo.put("cityName", city.getName());
            cascadeInfo.put("cityCode", city.getCode());
        }
        if (district != null) {
            cascadeInfo.put("districtName", district.getName());
            cascadeInfo.put("districtCode", district.getCode());
        }
        
        String fullAddress = String.format("%s%s%s",
                province != null ? province.getName() : "",
                city != null ? city.getName() : "",
                district != null ? district.getName() : "");
        cascadeInfo.put("fullAddress", fullAddress);
        
        return cascadeInfo;
    }
}
