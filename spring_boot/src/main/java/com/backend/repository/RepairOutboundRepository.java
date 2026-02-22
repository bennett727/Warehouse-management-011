package com.backend.repository;

import com.backend.entity.RepairOutbound;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 修复出库数据访问接口
 *
 * 功能说明：
 * 提供设备修复出库的数据访问操作，支持按设备、状态、
 * 日期等条件查询
 *
 * 业务规则：
 * - 修复出库与设备关联
 * - 支持修复状态跟踪
 * - 支持修复费用统计
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface RepairOutboundRepository extends JpaRepository<RepairOutbound, Long>, JpaSpecificationExecutor<RepairOutbound> {

    /**
     * 根据修复出库单号查询
     *
     * @param repairNo 修复出库单号
     * @return 修复出库记录
     */
    Optional<RepairOutbound> findByRepairNo(String repairNo);

    /**
     * 根据设备ID查询修复出库记录
     *
     * @param deviceId 设备ID
     * @param pageable 分页参数
     * @return 分页修复出库记录列表
     */
    Page<RepairOutbound> findByDeviceId(Long deviceId, Pageable pageable);

    /**
     * 根据状态查询修复出库记录
     *
     * @param status 状态
     * @param pageable 分页参数
     * @return 分页修复出库记录列表
     */
    Page<RepairOutbound> findByStatus(Integer status, Pageable pageable);

    /**
     * 根据修复人员ID查询
     *
     * @param repairPersonId 修复人员ID
     * @param pageable 分页参数
     * @return 分页修复出库记录列表
     */
    Page<RepairOutbound> findByRepairPersonId(Long repairPersonId, Pageable pageable);

    /**
     * 查询指定时间范围内的修复出库记录
     *
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param pageable 分页参数
     * @return 分页修复出库记录列表
     */
    @Query("SELECT r FROM RepairOutbound r WHERE r.outboundTime BETWEEN :startTime AND :endTime")
    Page<RepairOutbound> findByOutboundTimeBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);

    /**
     * 统计指定状态的修复出库数量
     *
     * @param status 状态
     * @return 数量
     */
    long countByStatus(Integer status);

    /**
     * 查询指定设备的最新修复出库记录
     *
     * @param deviceId 设备ID
     * @return 修复出库记录
     */
    @Query("SELECT r FROM RepairOutbound r WHERE r.deviceId = :deviceId ORDER BY r.createTime DESC")
    List<RepairOutbound> findLatestByDeviceId(@Param("deviceId") Long deviceId, Pageable pageable);
}
