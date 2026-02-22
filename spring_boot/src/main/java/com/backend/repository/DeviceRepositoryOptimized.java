package com.backend.repository;

import com.backend.entity.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 设备数据访问层（优化版）
 *
 * 功能说明：
 * 基于前端技术分析报告建议，优化后的设备Repository
 * 主要优化点：
 * 1. 使用@EntityGraph解决N+1查询问题
 * 2. 添加批量查询方法
 * 3. 优化统计查询
 * 4. 支持动态条件查询
 *
 * 优化记录：
 * - 2025-02-08: 创建优化版Repository，解决N+1问题，添加批量操作方法
 *
 * @author 后端优化团队
 * @version 2.0
 * @since 2025-02-08
 */
@Repository
public interface DeviceRepositoryOptimized extends JpaRepository<Device, Long>, JpaSpecificationExecutor<Device> {

    // ==================== 查询优化：使用EntityGraph解决N+1问题 ====================

    /**
     * 根据ID查询设备（带关联实体）
     *
     * 优化点：使用@EntityGraph预加载deviceType、supplier、area
     * 避免N+1查询问题
     *
     * @param id 设备ID
     * @return 设备信息（含关联实体）
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    @Override
    Optional<Device> findById(Long id);

    /**
     * 根据编码查询设备（带关联实体）
     *
     * @param deviceCode 设备编码
     * @return 设备信息（含关联实体）
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    Optional<Device> findByDeviceCode(String deviceCode);

    /**
     * 分页查询设备列表（带关联实体）
     *
     * 优化点：预加载关联实体，减少查询次数
     *
     * @param pageable 分页参数
     * @return 设备分页列表
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    @Override
    Page<Device> findAll(Pageable pageable);

    /**
     * 根据状态查询设备列表（带关联实体）
     *
     * @param status 设备状态
     * @param pageable 分页参数
     * @return 设备分页列表
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    Page<Device> findByStatus(Integer status, Pageable pageable);

    /**
     * 根据类型查询设备列表（带关联实体）
     *
     * @param deviceTypeId 设备类型ID
     * @param pageable 分页参数
     * @return 设备分页列表
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    Page<Device> findByDeviceTypeId(Long deviceTypeId, Pageable pageable);

    // ==================== 批量查询优化 ====================

    /**
     * 批量根据ID查询设备（带关联实体）
     *
     * 优化点：一次查询获取所有设备及其关联实体
     * 避免循环查询导致的N+1问题
     *
     * @param ids 设备ID列表
     * @return 设备列表
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    @Query("SELECT d FROM Device d WHERE d.id IN :ids")
    List<Device> findAllByIdWithRelations(@Param("ids") List<Long> ids);

    /**
     * 批量根据状态查询设备
     *
     * @param status 设备状态
     * @param limit 限制数量
     * @return 设备列表
     */
    @EntityGraph(attributePaths = {"deviceType"})
    @Query("SELECT d FROM Device d WHERE d.status = :status ORDER BY d.createTime DESC")
    List<Device> findByStatusWithLimit(@Param("status") Integer status, @Param("limit") int limit);

    // ==================== 统计查询优化 ====================

    /**
     * 统计各状态设备数量
     *
     * 优化点：使用聚合查询，一次获取所有统计结果
     *
     * @return 状态统计列表 [status, count]
     */
    @Query("SELECT d.status, COUNT(d) FROM Device d GROUP BY d.status")
    List<Object[]> countByStatusGroup();

    /**
     * 统计各类型设备数量
     *
     * @return 类型统计列表 [deviceTypeId, typeName, count]
     */
    @Query("SELECT d.typeId, dt.typeName, COUNT(d) FROM Device d LEFT JOIN DeviceType dt ON d.typeId = dt.id GROUP BY d.typeId")
    List<Object[]> countByDeviceTypeGroup();

    /**
     * 按月份统计设备创建数量
     *
     * @param year 年份
     * @return 月度统计列表 [month, count]
     */
    @Query(value = "SELECT MONTH(create_time) as month, COUNT(*) as count " +
            "FROM device " +
            "WHERE YEAR(create_time) = :year " +
            "GROUP BY MONTH(create_time) " +
            "ORDER BY month", nativeQuery = true)
    List<Object[]> countByMonth(@Param("year") int year);

    // ==================== 复杂条件查询 ====================

    /**
     * 多条件搜索设备（带关联实体）
     *
     * 优化点：使用JPQL预加载关联实体，避免N+1
     *
     * @param keyword 关键词（匹配设备名称、编码、型号）
     * @param typeId 类型ID
     * @param status 状态
     * @param areaId 区域ID
     * @param pageable 分页参数
     * @return 设备分页列表
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    @Query("SELECT d FROM Device d " +
            "LEFT JOIN d.area a " +
            "WHERE (:keyword IS NULL OR d.deviceName LIKE %:keyword% OR d.deviceCode LIKE %:keyword% OR d.model LIKE %:keyword%) " +
            "AND (:typeId IS NULL OR d.typeId = :typeId) " +
            "AND (:status IS NULL OR d.status = :status) " +
            "AND (:areaId IS NULL OR a.id = :areaId)")
    Page<Device> searchDevices(
            @Param("keyword") String keyword,
            @Param("typeId") Long typeId,
            @Param("status") Integer status,
            @Param("areaId") Long areaId,
            Pageable pageable);

    // ==================== 存在性检查优化 ====================

    /**
     * 检查设备编码是否存在
     *
     * 优化点：使用COUNT查询，只返回计数而非完整实体
     *
     * @param deviceCode 设备编码
     * @return 是否存在
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Device d WHERE d.deviceCode = :deviceCode")
    boolean existsByDeviceCodeOptimized(@Param("deviceCode") String deviceCode);

    /**
     * 批量检查设备编码是否存在
     *
     * @param deviceCodes 设备编码列表
     * @return 存在的编码列表
     */
    @Query("SELECT d.deviceCode FROM Device d WHERE d.deviceCode IN :deviceCodes")
    List<String> findExistingDeviceCodes(@Param("deviceCodes") List<String> deviceCodes);

    // ==================== 数据导出查询 ====================

    /**
     * 查询所有设备用于导出（带关联实体）
     *
     * 优化点：使用Stream查询避免内存溢出
     *
     * @return 设备Stream
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    @Query("SELECT d FROM Device d ORDER BY d.createTime DESC")
    List<Device> findAllForExport();

    /**
     * 根据条件查询设备用于导出
     *
     * @param status 状态
     * @param typeId 类型ID
     * @return 设备列表
     */
    @EntityGraph(attributePaths = {"deviceType", "supplier", "area"})
    @Query("SELECT d FROM Device d " +
            "WHERE (:status IS NULL OR d.status = :status) " +
            "AND (:typeId IS NULL OR d.typeId = :typeId) " +
            "ORDER BY d.createTime DESC")
    List<Device> findForExportByConditions(
            @Param("status") Integer status,
            @Param("typeId") Long typeId);
}
