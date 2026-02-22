package com.backend.repository;

import com.backend.entity.StockTransfer;
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
 * 库存调拨数据访问接口
 * 
 * 功能说明：
 * 提供库存调拨记录的数据访问操作，支持按源仓库、目标仓库、
 * 状态等条件查询
 * 
 * 业务规则：
 * - 调拨记录包含源仓库和目标仓库信息
 * - 支持调拨状态跟踪
 * - 支持调拨类型区分
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {

        /**
         * 根据调拨单号查询
         * 
         * @param transferNo 调拨单号
         * @return 调拨记录
         */
        Optional<StockTransfer> findByTransferNo(String transferNo);

        /**
         * 根据源仓库ID查询
         * 
         * @param sourceWarehouseId 源仓库ID
         * @param pageable          分页参数
         * @return 分页调拨记录列表
         */
        Page<StockTransfer> findBySourceWarehouseId(Long sourceWarehouseId, Pageable pageable);

        /**
         * 根据目标仓库ID查询
         * 
         * @param targetWarehouseId 目标仓库ID
         * @param pageable          分页参数
         * @return 分页调拨记录列表
         */
        Page<StockTransfer> findByTargetWarehouseId(Long targetWarehouseId, Pageable pageable);

        /**
         * 根据状态查询
         * 
         * @param status   状态
         * @param pageable 分页参数
         * @return 分页调拨记录列表
         */
        Page<StockTransfer> findByStatus(Integer status, Pageable pageable);

        /**
         * 根据调拨类型查询
         * 
         * @param transferType 调拨类型
         * @param pageable     分页参数
         * @return 分页调拨记录列表
         */
        Page<StockTransfer> findByTransferType(Integer transferType, Pageable pageable);

        /**
         * 多条件分页查询调拨记录
         * 
         * @param sourceWarehouseId 源仓库ID，可选
         * @param targetWarehouseId 目标仓库ID，可选
         * @param status            状态，可选
         * @param transferType      调拨类型，可选
         * @param startTime         开始时间，可选
         * @param endTime           结束时间，可选
         * @param pageable          分页参数
         * @return 分页调拨记录列表
         */
        @Query("SELECT t FROM StockTransfer t WHERE " +
                        "(:sourceWarehouseId IS NULL OR t.sourceWarehouseId = :sourceWarehouseId) AND " +
                        "(:targetWarehouseId IS NULL OR t.targetWarehouseId = :targetWarehouseId) AND " +
                        "(:status IS NULL OR t.status = :status) AND " +
                        "(:transferType IS NULL OR t.transferType = :transferType) AND " +
                        "(:startTime IS NULL OR t.createTime >= :startTime) AND " +
                        "(:endTime IS NULL OR t.createTime <= :endTime)")
        Page<StockTransfer> findByConditions(@Param("sourceWarehouseId") Long sourceWarehouseId,
                        @Param("targetWarehouseId") Long targetWarehouseId,
                        @Param("status") Integer status,
                        @Param("transferType") Integer transferType,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        Pageable pageable);

        /**
         * 统计指定状态的调拨记录数量
         * 
         * @param status 状态
         * @return 记录数量
         */
        long countByStatus(Integer status);

        /**
         * 查询涉及指定仓库的所有调拨记录
         * 
         * @param warehouseId 仓库ID
         * @param pageable    分页参数
         * @return 分页调拨记录列表
         */
        @Query("SELECT t FROM StockTransfer t WHERE " +
                        "t.sourceWarehouseId = :warehouseId OR t.targetWarehouseId = :warehouseId")
        Page<StockTransfer> findByWarehouseId(@Param("warehouseId") Long warehouseId, Pageable pageable);

        /**
         * 查询指定日期范围内的调拨记录
         * 
         * @param startTime 开始时间
         * @param endTime   结束时间
         * @return 调拨记录列表
         */
        List<StockTransfer> findByCreateTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
}
