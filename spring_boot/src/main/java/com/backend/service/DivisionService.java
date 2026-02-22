package com.backend.service;

import com.backend.entity.AdministrativeDivision;

import java.util.List;
import java.util.Map;

/**
 * 行政区划服务接口
 *
 * @author 开发团队
 * @since 2026-02-12
 */
public interface DivisionService {

    /**
     * 获取行政区划树
     *
     * @param parentId 父级ID
     * @return 行政区划列表
     */
    List<AdministrativeDivision> getDivisionTree(Long parentId);

    /**
     * 获取所有省份
     *
     * @return 省份列表
     */
    List<AdministrativeDivision> getProvinces();

    /**
     * 获取指定省份下的城市
     *
     * @param provinceId 省份ID
     * @return 城市列表
     */
    List<AdministrativeDivision> getCities(Long provinceId);

    /**
     * 获取指定城市下的区县
     *
     * @param cityId 城市ID
     * @return 区县列表
     */
    List<AdministrativeDivision> getDistricts(Long cityId);

    /**
     * 根据ID获取行政区划
     *
     * @param id 行政区划ID
     * @return 行政区划信息
     */
    AdministrativeDivision getDivisionById(Long id);

    /**
     * 创建行政区划
     *
     * @param division 行政区划信息
     * @return 创建的行政区划
     */
    AdministrativeDivision createDivision(AdministrativeDivision division);

    /**
     * 更新行政区划
     *
     * @param id 行政区划ID
     * @param division 行政区划信息
     * @return 更新后的行政区划
     */
    AdministrativeDivision updateDivision(Long id, AdministrativeDivision division);

    /**
     * 删除行政区划
     *
     * @param id 行政区划ID
     */
    void deleteDivision(Long id);

    /**
     * 获取行政区划统计信息
     *
     * @param id 行政区划ID
     * @return 统计信息
     */
    Map<String, Object> getDivisionStats(Long id);
}
