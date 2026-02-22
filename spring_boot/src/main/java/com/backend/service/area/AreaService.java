package com.backend.service.area;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.backend.entity.Area;
import com.backend.enumtype.EntityType.AreaStatus;

/**
 * 区域服务接口
 * 提供区域管理的业务逻辑，包括区域的增删改查、分页查询、状态管理、树形结构构建和三级联动查询等功能
 * 
 * @author Backend Team
 * @version 1.0
 */
public interface AreaService {

    // 增删改查基本操作
    Area saveArea(Area area);

    Optional<Area> getAreaById(Long id);

    List<Area> getAllAreas();

    Area updateArea(Long id, Area areaDetails);

    void deleteArea(Long id);

    // 根据位置查询
    Area getAreaByLocation(String city, String district, String location);

    // 分页查询
    Page<Area> getAreaList(String areaName, String level, Long parentId, Long warehouseId, AreaStatus status, Pageable pageable);

    // 批量删除
    int batchDeleteArea(List<Long> ids);

    // 更新状态
    void updateAreaStatus(Long id, AreaStatus status);

    // 批量更新状态
    int batchUpdateAreaStatus(List<Long> ids, AreaStatus status);

    // 导出数据
    byte[] exportAreaList(String areaName, String level, Long parentId, Long warehouseId, AreaStatus status);

    // 树形结构相关
    List<Map<String, Object>> getAreaTree(AreaStatus status);

    // 根据城市查询区域列表
    List<Area> getAreaListByCity(String city, AreaStatus status);

    // 唯一性校验
    boolean existsByLocation(String city, String district, String location, Long excludeId);

    boolean existsByCode(String code, Long excludeId);

    // 三级联动查询
    List<String> findAllCities();

    List<String> findDistrictsByCity(String city);

    List<String> findLocationsByCityAndDistrict(String city, String district);

    // 区域统计
    Map<String, Object> getAreaStatistics(Long areaId);
}
