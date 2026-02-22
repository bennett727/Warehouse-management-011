package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.AdministrativeDivision;

@Repository
public interface AdministrativeDivisionRepository extends JpaRepository<AdministrativeDivision, Long> {

    @Query("SELECT ad FROM AdministrativeDivision ad WHERE ad.level = :level AND ad.status = 1 ORDER BY ad.sort, ad.code")
    List<AdministrativeDivision> findByLevel(@Param("level") Integer level);

    @Query("SELECT ad FROM AdministrativeDivision ad LEFT JOIN ad.parent p WHERE p.id = :parentId AND ad.status = 1 ORDER BY ad.sort, ad.code")
    List<AdministrativeDivision> findByParentId(@Param("parentId") Long parentId);

    @Query("SELECT ad FROM AdministrativeDivision ad WHERE ad.level = 1 AND ad.status = 1 ORDER BY ad.sort")
    List<AdministrativeDivision> findAllProvinces();

    @Query("SELECT ad FROM AdministrativeDivision ad LEFT JOIN ad.parent p WHERE p.id = :provinceId AND ad.level = 2 AND ad.status = 1")
    List<AdministrativeDivision> findCitiesByProvinceId(@Param("provinceId") Long provinceId);

    @Query("SELECT ad FROM AdministrativeDivision ad LEFT JOIN ad.parent p WHERE p.id = :cityId AND ad.level = 3 AND ad.status = 1")
    List<AdministrativeDivision> findDistrictsByCityId(@Param("cityId") Long cityId);

    /**
     * 根据编码查询行政区划
     *
     * @param code 行政区划编码
     * @return 行政区划信息
     */
    Optional<AdministrativeDivision> findByCode(String code);

    /**
     * 根据级别统计行政区划数量
     *
     * @param level 级别 (1-省, 2-市, 3-区县)
     * @return 数量
     */
    @Query("SELECT COUNT(ad) FROM AdministrativeDivision ad WHERE ad.level = :level AND ad.status = 1")
    long countByLevel(@Param("level") Integer level);

    /**
     * 根据级别查询行政区划（按排序号排序）
     *
     * @param level 级别
     * @return 行政区划列表
     */
    List<AdministrativeDivision> findByLevelOrderBySortAsc(Integer level);

    /**
     * 根据父级ID查询行政区划（按排序号排序）
     *
     * @param parentId 父级ID
     * @return 行政区划列表
     */
    List<AdministrativeDivision> findByParentIdOrderBySortAsc(Long parentId);
}
