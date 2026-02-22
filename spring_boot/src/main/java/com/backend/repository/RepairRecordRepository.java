package com.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.RepairRecord;

/**
 * 维修记录数据访问接口
 * 
 * 功能说明：
 * 提供设备维修记录的数据访问操作，支持按设备、状态、
 * 日期等条件查询
 * 
 * 业务规则：
 * - 维修记录与设备关联
 * - 支持维修状态跟踪
 * - 支持维修费用统计
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface RepairRecordRepository extends JpaRepository<RepairRecord, Long> {

        /**
         * 根据维修单号查询
         * 
         * @param repairNo 维修单号
         * @return 维修记录
         */
        Optional<RepairRecord> findByRepairNo(String repairNo);

        /**
         * 根据设备ID查询维修记录
         * 
         * @param deviceId 设备ID
         * @param pageable 分页参数
         * @return 分页维修记录列表
         */
        Page<RepairRecord> findByDeviceId(Long deviceId, Pageable pageable);

        /**
         * 根据维修人ID查询
         * 
         * @param repairerId 维修人ID
         * @param pageable   分页参数
         * @return 分页维修记录列表
         */
        Page<RepairRecord> findByRepairerId(Long repairerId, Pageable pageable);

        /**
         * 根据状态查询维修记录
         * 
         * @param status   状态（0-待维修，1-维修中，2-已完成）
         * @param pageable 分页参数
         * @return 分页维修记录列表
         */
        Page<RepairRecord> findByStatus(Integer status, Pageable pageable);

        /**
         * 多条件分页查询维修记录
         * 
         * @param deviceId  设备ID，可选
         * @param status    状态，可选
         * @param startDate 开始日期，可选
         * @param endDate   结束日期，可选
         * @param pageable  分页参数
         * @return 分页维修记录列表
         */
        @Query("SELECT r FROM RepairRecord r WHERE " +
                        "(:deviceId IS NULL OR r.device.id = :deviceId) AND " +
                        "(:status IS NULL OR r.status = :status) AND " +
                        "(:startDate IS NULL OR r.repairDate >= :startDate) AND " +
                        "(:endDate IS NULL OR r.repairDate <= :endDate)")
        Page<RepairRecord> findByConditions(@Param("deviceId") Long deviceId,
                        @Param("status") Integer status,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);

        /**
         * 统计指定状态的维修记录数量
         * 
         * @param status 状态
         * @return 记录数量
         */
        long countByStatus(Integer status);

        /**
         * 查询设备的最新维修记录
         * 
         * @param deviceId 设备ID
         * @return 维修记录列表（按时间倒序）
         */
        List<RepairRecord> findByDeviceIdOrderByRepairDateDesc(Long deviceId);

        /**
         * 统计指定日期范围内的维修费用
         * 
         * @param startDate 开始日期
         * @param endDate   结束日期
         * @return 总维修费用
         */
        @Query("SELECT SUM(r.repairCost) FROM RepairRecord r WHERE " +
                        "r.repairDate >= :startDate AND r.repairDate <= :endDate AND r.status = 2")
        java.math.BigDecimal sumRepairCostByDateRange(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT COUNT(r) FROM RepairRecord r WHERE r.repairStartTime >= :startTime")
        Long countByRepairStartTimeAfter(@Param("startTime") java.time.LocalDateTime startTime);
}
