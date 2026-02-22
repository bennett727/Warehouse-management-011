package com.backend.repository;

import com.backend.entity.StockCount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 库存盘点数据访问接口
 * 
 * 功能说明：
 * 提供库存盘点记录的数据访问操作，支持按仓库、区域、
 * 状态等条件查询
 * 
 * 业务规则：
 * - 盘点记录与仓库、区域关联
 * - 支持盘点状态跟踪
 * - 支持盘点类型区分（全盘、抽盘）
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface StockCountRepository extends JpaRepository<StockCount, Long> {

        /**
         * 根据盘点单号查询
         * 
         * @param countNo 盘点单号
         * @return 盘点记录
         */
        Optional<StockCount> findByCountNo(String countNo);

        /**
         * 根据仓库ID查询
         * 
         * @param warehouseId 仓库ID
         * @param pageable    分页参数
         * @return 分页盘点记录列表
         */
        Page<StockCount> findByWarehouseId(Long warehouseId, Pageable pageable);

        /**
         * 根据区域ID查询
         * 
         * @param areaId   区域ID
         * @param pageable 分页参数
         * @return 分页盘点记录列表
         */
        Page<StockCount> findByAreaId(Long areaId, Pageable pageable);

        /**
         * 根据状态查询
         * 
         * @param status   状态（0-待盘点，1-盘点中，2-已完成）
         * @param pageable 分页参数
         * @return 分页盘点记录列表
         */
        Page<StockCount> findByStatus(Integer status, Pageable pageable);

        /**
         * 根据盘点类型查询
         * 
         * @param countType 盘点类型（1-全盘，2-抽盘）
         * @param pageable  分页参数
         * @return 分页盘点记录列表
         */
        Page<StockCount> findByCountType(Integer countType, Pageable pageable);

        /**
         * 根据操作人ID查询
         * 
         * @param operatorId 操作人ID
         * @param pageable   分页参数
         * @return 分页盘点记录列表
         */
        Page<StockCount> findByOperatorId(Long operatorId, Pageable pageable);

        /**
         * 多条件分页查询盘点记录
         * 
         * @param warehouseId 仓库ID，可选
         * @param areaId      区域ID，可选
         * @param status      状态，可选
         * @param countType   盘点类型，可选
         * @param operatorId  操作人ID，可选
         * @param startTime   开始时间，可选
         * @param endTime     结束时间，可选
         * @param pageable    分页参数
         * @return 分页盘点记录列表
         */
        @Query("SELECT c FROM StockCount c WHERE " +
                        "(:warehouseId IS NULL OR c.warehouseId = :warehouseId) AND " +
                        "(:areaId IS NULL OR c.areaId = :areaId) AND " +
                        "(:status IS NULL OR c.status = :status) AND " +
                        "(:countType IS NULL OR c.countType = :countType) AND " +
                        "(:operatorId IS NULL OR c.operatorId = :operatorId) AND " +
                        "(:startTime IS NULL OR c.countDate >= :startTime) AND " +
                        "(:endTime IS NULL OR c.countDate <= :endTime)")
        Page<StockCount> findByConditions(@Param("warehouseId") Long warehouseId,
                        @Param("areaId") Long areaId,
                        @Param("status") Integer status,
                        @Param("countType") Integer countType,
                        @Param("operatorId") Long operatorId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        Pageable pageable);

        /**
         * 统计指定状态的盘点记录数量
         * 
         * @param status 状态
         * @return 记录数量
         */
        long countByStatus(Integer status);

        /**
         * 查询指定日期范围内的盘点记录
         * 
         * @param startTime 开始时间
         * @param endTime   结束时间
         * @return 盘点记录列表
         */
        List<StockCount> findByCountDateBetween(LocalDateTime startTime, LocalDateTime endTime);

        /**
         * 统计指定仓库的盘点次数
         * 
         * @param warehouseId 仓库ID
         * @return 盘点次数
         */
        long countByWarehouseId(Long warehouseId);
}
