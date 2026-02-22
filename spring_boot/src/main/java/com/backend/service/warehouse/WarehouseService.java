package com.backend.service.warehouse;

import com.backend.entity.Warehouse;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

public interface WarehouseService {
    List<Warehouse> getAllWarehouses();
    Warehouse getWarehouseById(Long id);
    Warehouse getWarehouseByCode(String code);
    Warehouse createWarehouse(Warehouse warehouse);
    Warehouse updateWarehouse(Long id, Warehouse warehouse);
    void deleteWarehouse(Long id);
    PageResult<Warehouse> getWarehouses(Pageable pageable);
    List<Warehouse> getWarehousesByAdministrativeDivision(Long administrativeDivisionId);
    List<Warehouse> getActiveWarehouses();
    void updateWarehouseStatus(Long id, Integer status);
    
    /**
     * 获取仓库统计信息
     * @param id 仓库ID
     * @return 统计信息
     */
    Map<String, Object> getWarehouseStats(Long id);
    
    /**
     * 更新仓库地址
     * @param id 仓库ID
     * @param address 地址信息
     * @return 更新后的仓库
     */
    Warehouse updateWarehouseAddress(Long id, Map<String, Object> address);
    
    /**
     * 按行政区划筛选仓库
     * @param provinceId 省份ID
     * @param cityId 城市ID
     * @param districtId 区县ID
     * @return 仓库列表
     */
    List<Warehouse> getWarehousesByDivision(Long provinceId, Long cityId, Long districtId);
    
    /**
     * 获取仓库概览统计
     * @return 概览统计信息
     */
    Map<String, Object> getWarehouseOverviewStats();
}