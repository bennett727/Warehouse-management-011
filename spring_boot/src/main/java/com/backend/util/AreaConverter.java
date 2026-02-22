package com.backend.util;

import com.backend.entity.Area;
import com.backend.entity.AreaType;
import com.backend.entity.Warehouse;
import com.backend.dto.AreaCreateDTO;
import com.backend.dto.AreaUpdateDTO;
import com.backend.vo.AreaVO;
import org.springframework.stereotype.Component;

@Component
public class AreaConverter {
    
    public AreaVO toVO(Area area) {
        if (area == null) {
            return null;
        }
        
        AreaVO vo = new AreaVO();
        vo.setId(area.getId());
        vo.setCode(area.getCode());
        vo.setName(area.getName());
        vo.setCity(area.getCity() != null ? area.getCity().getName() : null);
        vo.setDistrict(area.getDistrict() != null ? area.getDistrict().getName() : null);
        vo.setLocation(area.getLocation());
        vo.setWarehouseId(area.getWarehouseId());
        vo.setAreaTypeId(area.getAreaTypeId());
        vo.setStatus(area.getStatus());
        vo.setRemark(area.getRemark());
        vo.setCreateTime(area.getCreateTime());
        vo.setUpdateTime(area.getUpdateTime());
        
        if (area.getWarehouse() != null) {
            vo.setWarehouseName(area.getWarehouse().getWarehouseName());
        }
        
        if (area.getAreaType() != null) {
            vo.setAreaTypeName(area.getAreaType().getName());
        }
        
        return vo;
    }

    public Area toEntity(AreaCreateDTO dto, Warehouse warehouse, AreaType areaType) {
        Area area = new Area();
        area.setCode(dto.getCode());
        area.setName(dto.getName());
        area.setLocation(dto.getLocation());
        area.setWarehouseId(dto.getWarehouseId());
        area.setAreaTypeId(dto.getAreaTypeId());
        area.setSort(dto.getSort());
        area.setStatus(dto.getStatus());
        area.setRemark(dto.getRemark());
        
        if (warehouse != null) {
            area.setWarehouse(warehouse);
        }
        
        if (areaType != null) {
            area.setAreaType(areaType);
        }
        
        return area;
    }

    public void updateEntity(Area area, AreaUpdateDTO dto, Warehouse warehouse, AreaType areaType) {
        if (dto.getCode() != null) {
            area.setCode(dto.getCode());
        }
        if (dto.getName() != null) {
            area.setName(dto.getName());
        }
        if (dto.getLocation() != null) {
            area.setLocation(dto.getLocation());
        }
        if (dto.getWarehouseId() != null) {
            area.setWarehouseId(dto.getWarehouseId());
        }
        if (dto.getAreaTypeId() != null) {
            area.setAreaTypeId(dto.getAreaTypeId());
        }
        if (dto.getStatus() != null) {
            area.setStatus(dto.getStatus());
        }
        if (dto.getRemark() != null) {
            area.setRemark(dto.getRemark());
        }
        
        if (warehouse != null) {
            area.setWarehouse(warehouse);
        }
        
        if (areaType != null) {
            area.setAreaType(areaType);
        }
    }
}