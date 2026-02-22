package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.Bin;

/**
 * 货位数据访问接口
 *
 * 功能说明：
 * 提供货位实体的数据访问操作，包括基本的CRUD操作和自定义查询方法
 *
 * 使用场景：
 * - 货位信息的增删改查
 * - 按区域查询货位
 * - 按状态查询货位
 * - 货位容量管理
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface BinRepository extends JpaRepository<Bin, Long> {

        /**
         * 根据货位编码查询货位
         *
         * @param code 货位编码
         * @return 货位信息
         */
        Optional<Bin> findByCode(String code);

        /**
         * 根据区域ID查询货位列表
         *
         * @param areaId 区域ID
         * @return 货位列表
         */
        List<Bin> findByAreaId(Long areaId);

        /**
         * 根据区域ID和状态查询货位列表
         *
         * @param areaId 区域ID
         * @param status 状态
         * @return 货位列表
         */
        List<Bin> findByAreaIdAndStatus(Long areaId, Integer status);

        /**
         * 根据状态查询货位列表
         *
         * @param status 状态
         * @return 货位列表
         */
        List<Bin> findByStatus(Integer status);

        /**
         * 分页查询货位列表（带条件）
         *
         * @param areaId   区域ID
         * @param keyword  关键词（编码或名称）
         * @param status   状态
         * @param pageable 分页参数
         * @return 分页货位列表
         */
        @Query("SELECT b FROM Bin b WHERE " +
                        "(:areaId IS NULL OR b.areaId = :areaId) AND " +
                        "(:keyword IS NULL OR b.code LIKE %:keyword% OR b.name LIKE %:keyword%) AND " +
                        "(:status IS NULL OR b.status = :status)")
        Page<Bin> findByConditions(@Param("areaId") Long areaId,
                        @Param("keyword") String keyword,
                        @Param("status") Integer status,
                        Pageable pageable);

        /**
         * 查询可用货位（容量未满）
         *
         * @param areaId 区域ID
         * @return 可用货位列表
         */
        @Query("SELECT b FROM Bin b WHERE b.areaId = :areaId AND b.usedCapacity < b.capacity AND b.status = 1")
        List<Bin> findAvailableBins(@Param("areaId") Long areaId);

        /**
         * 检查货位编码是否存在
         *
         * @param code 货位编码
         * @return 是否存在
         */
        boolean existsByCode(String code);

        /**
         * 统计区域的货位数量
         *
         * @param areaId 区域ID
         * @return 货位数量
         */
        long countByAreaId(Long areaId);

        /**
         * 统计区域的已使用货位数量
         *
         * @param areaId 区域ID
         * @return 已使用货位数量
         */
        @Query("SELECT COUNT(b) FROM Bin b WHERE b.areaId = :areaId AND b.usedCapacity > 0")
        long countUsedBinsByAreaId(@Param("areaId") Long areaId);
}
