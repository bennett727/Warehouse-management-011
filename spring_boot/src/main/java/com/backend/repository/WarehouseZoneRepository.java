package com.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.WarehouseZone;

/**
 * 仓库功能区数据访问层
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Repository
public interface WarehouseZoneRepository extends JpaRepository<WarehouseZone, Long> {

    /**
     * 根据仓库ID查询功能区列表
     *
     * @param warehouseId 仓库ID
     * @return 功能区列表
     */
    List<WarehouseZone> findByWarehouseIdOrderBySortAsc(Long warehouseId);

    /**
     * 根据仓库ID和状态查询功能区列表
     *
     * @param warehouseId 仓库ID
     * @param status      状态
     * @return 功能区列表
     */
    List<WarehouseZone> findByWarehouseIdAndStatusOrderBySortAsc(Long warehouseId, Integer status);

    /**
     * 根据功能区类型编码查询
     *
     * @param zoneTypeCode 功能区类型编码
     * @return 功能区列表
     */
    List<WarehouseZone> findByZoneTypeCode(String zoneTypeCode);

    /**
     * 根据编码查询功能区
     *
     * @param code 编码
     * @return 功能区
     */
    WarehouseZone findByCode(String code);

    /**
     * 分页查询功能区列表
     *
     * @param warehouseId 仓库ID
     * @param zoneType    功能区类型
     * @param status      状态
     * @param keyword     关键词
     * @param pageable    分页参数
     * @return 分页结果
     */
    @Query("SELECT z FROM WarehouseZone z WHERE " +
            "(:warehouseId IS NULL OR z.warehouseId = :warehouseId) AND " +
            "(:zoneTypeCode IS NULL OR z.zoneTypeCode = :zoneTypeCode) AND " +
            "(:status IS NULL OR z.status = :status) AND " +
            "(:keyword IS NULL OR z.name LIKE %:keyword% OR z.code LIKE %:keyword%)")
    Page<WarehouseZone> findByConditions(@Param("warehouseId") Long warehouseId,
            @Param("zoneTypeCode") String zoneTypeCode,
            @Param("status") Integer status,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * 根据仓库ID统计功能区数量
     *
     * @param warehouseId 仓库ID
     * @return 数量
     */
    long countByWarehouseId(Long warehouseId);

    /**
     * 根据仓库ID和状态统计功能区数量
     *
     * @param warehouseId 仓库ID
     * @param status      状态
     * @return 数量
     */
    long countByWarehouseIdAndStatus(Long warehouseId, Integer status);

    /**
     * 统计已关联类型的功能区数量
     * @return 数量
     */
    long countByZoneTypeIdIsNotNull();

    /**
     * 根据名称或编码模糊查询
     * @param name 名称
     * @param code 编码
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<WarehouseZone> findByNameContainingOrCodeContaining(String name, String code, Pageable pageable);

    /**
     * 根据仓库ID分页查询
     * @param warehouseId 仓库ID
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<WarehouseZone> findByWarehouseId(Long warehouseId, Pageable pageable);

    /**
     * 根据仓库ID和功能区类型ID分页查询
     * @param warehouseId 仓库ID
     * @param zoneTypeId 功能区类型ID
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<WarehouseZone> findByWarehouseIdAndZoneTypeId(Long warehouseId, Long zoneTypeId, Pageable pageable);

    /**
     * 根据仓库ID和状态分页查询
     * @param warehouseId 仓库ID
     * @param status 状态
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<WarehouseZone> findByWarehouseIdAndStatus(Long warehouseId, Integer status, Pageable pageable);

    /**
     * 根据功能区类型ID分页查询
     * @param zoneTypeId 功能区类型ID
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<WarehouseZone> findByZoneTypeId(Long zoneTypeId, Pageable pageable);

    /**
     * 根据状态分页查询
     * @param status 状态
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<WarehouseZone> findByStatus(Integer status, Pageable pageable);

    /**
     * 检查编码是否存在
     * @param code 编码
     * @return 是否存在
     */
    boolean existsByCode(String code);

    /**
     * 根据状态统计数量
     * @param status 状态
     * @return 数量
     */
    long countByStatus(Integer status);
}
