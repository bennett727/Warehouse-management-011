package com.backend.repository;

import com.backend.entity.ScrapRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 报废记录数据访问接口
 *
 * 功能说明：
 * 提供设备报废记录的数据访问操作，支持按设备、报废原因、
 * 日期等条件查询
 *
 * 业务规则：
 * - 报废记录与设备关联
 * - 支持报废状态跟踪
 * - 记录残值和折旧信息
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2026-02-13
 */
@Repository
public interface ScrapRecordRepository extends JpaRepository<ScrapRecord, Long> {

    /**
     * 根据报废单号查询
     *
     * @param scrapNo 报废单号
     * @return 报废记录
     */
    Optional<ScrapRecord> findByScrapNo(String scrapNo);

    /**
     * 根据设备ID查询报废记录
     *
     * @param deviceId 设备ID
     * @param pageable 分页参数
     * @return 分页报废记录列表
     */
    Page<ScrapRecord> findByDeviceId(Long deviceId, Pageable pageable);

    /**
     * 根据状态查询报废记录
     *
     * @param status   状态
     * @param pageable 分页参数
     * @return 分页报废记录列表
     */
    Page<ScrapRecord> findByStatus(Integer status, Pageable pageable);

    /**
     * 根据报废原因查询
     *
     * @param scrapReason 报废原因
     * @param pageable    分页参数
     * @return 分页报废记录列表
     */
    Page<ScrapRecord> findByScrapReason(String scrapReason, Pageable pageable);

    /**
     * 多条件分页查询报废记录
     *
     * @param deviceId    设备ID，可选
     * @param status      状态，可选
     * @param scrapReason 报废原因，可选
     * @param startDate   开始日期，可选
     * @param endDate     结束日期，可选
     * @param pageable    分页参数
     * @return 分页报废记录列表
     */
    @Query("SELECT s FROM ScrapRecord s WHERE " +
            "(:deviceId IS NULL OR s.deviceId = :deviceId) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:scrapReason IS NULL OR s.scrapReason = :scrapReason) AND " +
            "(:startDate IS NULL OR s.scrapDate >= :startDate) AND " +
            "(:endDate IS NULL OR s.scrapDate <= :endDate)")
    Page<ScrapRecord> findByConditions(@Param("deviceId") Long deviceId,
                                       @Param("status") Integer status,
                                       @Param("scrapReason") String scrapReason,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate,
                                       Pageable pageable);

    /**
     * 统计指定状态的报废记录数量
     *
     * @param status 状态
     * @return 记录数量
     */
    long countByStatus(Integer status);

    /**
     * 查询设备的最新报废记录
     *
     * @param deviceId 设备ID
     * @return 报废记录列表（按时间倒序）
     */
    List<ScrapRecord> findByDeviceIdOrderByScrapDateDesc(Long deviceId);

    /**
     * 根据设备ID查询最新的报废记录
     *
     * @param deviceId 设备ID
     * @return 最新的报废记录
     */
    Optional<ScrapRecord> findTopByDeviceIdOrderByScrapDateDesc(Long deviceId);

    /**
     * 根据出库单号查询报废记录
     *
     * @param sourceOrderNo 出库单号
     * @return 报废记录列表
     */
    List<ScrapRecord> findBySourceOrderNo(String sourceOrderNo);

    /**
     * 根据出库单项ID查询报废记录
     *
     * @param sourceOrderItemId 出库单项ID
     * @return 报废记录
     */
    Optional<ScrapRecord> findBySourceOrderItemId(Long sourceOrderItemId);

    /**
     * 统计指定日期范围内的残值总额
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 残值总额
     */
    @Query("SELECT COALESCE(SUM(s.residualValue), 0) FROM ScrapRecord s WHERE " +
            "s.scrapDate >= :startDate AND s.scrapDate <= :endDate")
    java.math.BigDecimal sumResidualValueByDateRange(@Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    /**
     * 根据设备ID查询所有报废记录（不分页）
     *
     * @param deviceId 设备ID
     * @return 报废记录列表
     */
    List<ScrapRecord> findByDeviceId(Long deviceId);
}
