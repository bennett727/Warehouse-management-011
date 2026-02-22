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

import com.backend.entity.InstallationRecord;

/**
 * 安装记录数据访问接口
 * 
 * 功能说明：
 * 提供设备安装记录的数据访问操作，支持按设备、安装人、
 * 日期等条件查询
 * 
 * 业务规则：
 * - 安装记录与设备关联
 * - 支持安装状态跟踪
 * - 记录安装位置信息
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface InstallationRecordRepository extends JpaRepository<InstallationRecord, Long> {

        /**
         * 根据安装单号查询
         * 
         * @param installNo 安装单号
         * @return 安装记录
         */
        Optional<InstallationRecord> findByInstallNo(String installNo);

        /**
         * 根据设备ID查询安装记录
         * 
         * @param deviceId 设备ID
         * @param pageable 分页参数
         * @return 分页安装记录列表
         */
        Page<InstallationRecord> findByDeviceId(Long deviceId, Pageable pageable);

        /**
         * 根据安装人ID查询
         * 
         * @param installerId 安装人ID
         * @param pageable    分页参数
         * @return 分页安装记录列表
         */
        Page<InstallationRecord> findByInstallerId(Long installerId, Pageable pageable);

        /**
         * 根据状态查询安装记录
         * 
         * @param status   状态（0-待安装，1-安装中，2-已完成）
         * @param pageable 分页参数
         * @return 分页安装记录列表
         */
        Page<InstallationRecord> findByStatus(Integer status, Pageable pageable);

        /**
         * 多条件分页查询安装记录
         * 
         * @param deviceId  设备ID，可选
         * @param status    状态，可选
         * @param startDate 开始日期，可选
         * @param endDate   结束日期，可选
         * @param pageable  分页参数
         * @return 分页安装记录列表
         */
        @Query("SELECT i FROM InstallationRecord i WHERE " +
                        "(:deviceId IS NULL OR i.deviceId = :deviceId) AND " +
                        "(:status IS NULL OR i.status = :status) AND " +
                        "(:startDate IS NULL OR i.installDate >= :startDate) AND " +
                        "(:endDate IS NULL OR i.installDate <= :endDate)")
        Page<InstallationRecord> findByConditions(@Param("deviceId") Long deviceId,
                        @Param("status") Integer status,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);

        /**
         * 统计指定状态的安装记录数量
         * 
         * @param status 状态
         * @return 记录数量
         */
        long countByStatus(Integer status);

        /**
         * 查询设备的最新安装记录
         *
         * @param deviceId 设备ID
         * @return 安装记录列表（按时间倒序）
         */
        List<InstallationRecord> findByDeviceIdOrderByInstallDateDesc(Long deviceId);

        /**
         * 根据设备ID查询最新的安装记录
         *
         * @param deviceId 设备ID
         * @return 最新的安装记录
         */
        Optional<InstallationRecord> findTopByDeviceIdOrderByInstallDateDesc(Long deviceId);

        /**
         * 根据安装位置查询
         * 
         * @param installLocation 安装位置
         * @param pageable        分页参数
         * @return 分页安装记录列表
         */
        Page<InstallationRecord> findByInstallLocationContaining(String installLocation, Pageable pageable);

        /**
         * 根据设备ID查询所有安装记录（不分页）
         * 
         * @param deviceId 设备ID
         * @return 安装记录列表
         */
        List<InstallationRecord> findByDeviceId(Long deviceId);

        /**
         * 根据出库单号查询安装记录
         * 
         * @param sourceOrderNo 出库单号
         * @return 安装记录列表
         */
        List<InstallationRecord> findBySourceOrderNo(String sourceOrderNo);
}
