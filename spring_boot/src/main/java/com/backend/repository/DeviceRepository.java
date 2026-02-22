package com.backend.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.Device;
import com.backend.entity.DeviceType;

/**
 * 设备数据访问层
 * 
 * 功能说明：
 * 提供设备实体的CRUD操作和复杂查询功能
 * 
 * 性能优化：
 * - 使用@EntityGraph解决N+1查询问题
 * - 使用索引优化查询性能
 * - 批量操作减少数据库往返
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Repository
public interface DeviceRepository extends JpaRepository<Device, Long>, JpaSpecificationExecutor<Device> {

        /**
         * 查询所有设备（包含关联实体）
         * 
         * 使用@EntityGraph预加载关联实体，避免N+1问题和LazyInitializationException
         * 
         * @return 设备列表
         */
        @Query("SELECT d FROM Device d")
        @EntityGraph(attributePaths = { "deviceType", "area", "bin", "principal", "supplier" })
        List<Device> findAllWithAssociations();

        /**
         * 根据设备编码查询（使用索引）
         * 
         * @param deviceCode 设备编码
         * @return 设备Optional对象
         */
        @EntityGraph(attributePaths = { "deviceType", "area", "bin", "principal", "supplier" })
        Optional<Device> findByDeviceCode(String deviceCode);

        /**
         * 根据设备类型ID查询设备列表
         * 
         * @param typeId 设备类型ID
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        List<Device> findByDeviceTypeId(Long typeId);

        /**
         * 根据仓库ID查询设备列表
         * 
         * @param warehouseId 仓库ID
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        @Query("SELECT d FROM Device d LEFT JOIN d.area a LEFT JOIN a.warehouse w WHERE w.id = :warehouseId")
        List<Device> findByWarehouseId(@Param("warehouseId") Long warehouseId);

        /**
         * 根据区域ID查询设备列表
         * 
         * @param areaId 区域ID
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        List<Device> findByAreaId(Long areaId);

        /**
         * 检查设备编码是否存在
         * 
         * @param deviceCode 设备编码
         * @return true表示存在
         */
        boolean existsByDeviceCode(String deviceCode);

        /**
         * 检查序列号是否存在
         * 
         * @param serialNumber 序列号
         * @return true表示存在
         */
        boolean existsBySerialNumber(String serialNumber);

        /**
         * 多条件分页查询（优化版）
         * 
         * 使用@EntityGraph预加载关联实体，避免N+1问题
         * 
         * @param keyword  关键词（设备名称、编码、型号）
         * @param typeId   设备类型ID
         * @param status   设备状态
         * @param areaId   区域ID
         * @param pageable 分页参数
         * @return 设备分页结果
         */
        @EntityGraph(attributePaths = { "deviceType", "area", "bin" })
        @Query("SELECT d FROM Device d WHERE " +
                        "(:keyword IS NULL OR d.deviceName LIKE %:keyword% OR d.deviceCode LIKE %:keyword% OR d.model LIKE %:keyword%) AND "
                        +
                        "(:typeId IS NULL OR d.typeId = :typeId) AND " +
                        "(:status IS NULL OR d.status = :status) AND " +
                        "(:areaId IS NULL OR d.areaId = :areaId)")
        Page<Device> findByConditions(@Param("keyword") String keyword,
                        @Param("typeId") Long typeId,
                        @Param("status") Integer status,
                        @Param("areaId") Long areaId,
                        Pageable pageable);

        /**
         * 根据状态查询设备列表
         * 
         * @param status 设备状态
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        List<Device> findByStatus(Integer status);

        /**
         * 根据状态统计设备数量
         * 
         * @param status 设备状态
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.status = :status")
        Long countByStatus(@Param("status") Integer status);

        /**
         * 按区域统计设备数量
         * 
         * @return 区域ID和数量的映射列表
         */
        @Query("SELECT a.id as areaId, COUNT(d) as count FROM Device d LEFT JOIN d.area a GROUP BY a.id")
        List<Object[]> countByArea();

        /**
         * 根据区域ID统计设备数量
         * 
         * @param areaId 区域ID
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.areaId = :areaId")
        Long countByAreaId(@Param("areaId") Long areaId);

        /**
         * 按仓库统计设备数量
         * 
         * @return 仓库ID和数量的映射列表
         */
        @Query("SELECT w.id as warehouseId, COUNT(d) as count FROM Device d LEFT JOIN d.area a LEFT JOIN a.warehouse w WHERE w.id IS NOT NULL GROUP BY w.id")
        List<Object[]> countByWarehouseId();

        /**
         * 按设备类型统计数量
         * 
         * @return 类型ID和数量的映射列表
         */
        @Query("SELECT d.typeId as typeId, COUNT(d) as count FROM Device d GROUP BY d.typeId")
        List<Object[]> countByDeviceType();

        /**
         * 根据区域和状态统计设备数量
         * 
         * @param areaId 区域ID
         * @param status 设备状态
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.areaId = :areaId AND d.status = :status")
        Long countDevicesByAreaAndStatus(@Param("areaId") Long areaId, @Param("status") Integer status);

        /**
         * 根据状态统计设备数量
         * 
         * @param status 设备状态
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.status = :status")
        Long countDevicesByStatus(@Param("status") Integer status);

        /**
         * 统计各类型设备数量
         * 
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d")
        Long countDevicesByType();

        /**
         * 按类型统计设备数量（分组）
         * 
         * @return 类型和数量的映射列表
         */
        @Query("SELECT d.typeId, COUNT(d) FROM Device d WHERE d.typeId IS NOT NULL GROUP BY d.typeId")
        List<Object[]> countDevicesByTypeGrouped();

        /**
         * 按状态统计设备数量（分组）
         * 
         * @return 状态和数量的映射列表
         */
        @Query("SELECT d.status, COUNT(d) FROM Device d GROUP BY d.status")
        List<Object[]> countDevicesByStatusGrouped();

        /**
         * 按区域统计设备数量（包含库存值）
         * 
         * @return 区域ID、名称、数量和库存值的映射列表
         */
        @Query("SELECT d.areaId, a.name, COUNT(d), SUM(d.currentStock * d.price) FROM Device d LEFT JOIN d.area a WHERE d.areaId IS NOT NULL GROUP BY d.areaId")
        List<Object[]> countDevicesByAreaWithValue();

        /**
         * 按类型统计设备数量（包含库存值）
         * 
         * @return 类型ID、名称、数量和库存值的映射列表
         */
        @Query("SELECT d.typeId, dt.typeName, COUNT(d), SUM(d.currentStock * d.price) FROM Device d LEFT JOIN DeviceType dt ON d.typeId = dt.id WHERE d.typeId IS NOT NULL GROUP BY d.typeId")
        List<Object[]> countDevicesByTypeWithValue();

        /**
         * 计算总库存价值
         * 
         * @return 总库存价值
         */
        @Query("SELECT SUM(d.currentStock * d.price) FROM Device d WHERE d.currentStock IS NOT NULL AND d.price IS NOT NULL")
        Long calculateTotalInventoryValue();

        /**
         * 根据采购日期范围统计设备数量
         * 
         * @param startDate 开始日期
         * @param endDate 结束日期
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.purchaseDate BETWEEN :startDate AND :endDate")
        Long countDevicesByPurchaseDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

        /**
         * 根据保修状态统计设备数量
         * 
         * @return 保修状态和数量的映射列表
         */
        @Query("SELECT CASE WHEN d.warrantyEnd >= CURRENT_DATE THEN 1 ELSE 0 END, COUNT(d) FROM Device d WHERE d.warrantyEnd IS NOT NULL GROUP BY CASE WHEN d.warrantyEnd >= CURRENT_DATE THEN 1 ELSE 0 END")
        List<Object[]> countDevicesByWarrantyStatus();

        /**
         * 查询库存不足的设备
         * 
         * @param stock 库存阈值
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        List<Device> findByCurrentStockLessThanEqual(Integer stock);

        /**
         * 按设备类型查询设备
         * 
         * @param deviceType 设备类型
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        List<Device> findByDeviceType(DeviceType deviceType);

        /**
         * 根据采购日期之后统计设备数量
         * 
         * @param date 采购日期
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.purchaseDate >= :date")
        Long countByPurchaseDateAfter(@Param("date") LocalDate date);

        /**
         * 按负责人统计设备数量
         *
         * @return 负责人和数量的映射列表
         */
        @Query("SELECT p.id, COUNT(d) FROM Device d LEFT JOIN d.principal p WHERE p IS NOT NULL GROUP BY p.id")
        List<Object[]> countDevicesByPrincipal();

        /**
         * 按使用年限统计设备数量
         * 
         * @return 使用年限和数量的映射列表
         */
        @Query("SELECT " +
                "CASE " +
                "  WHEN d.purchaseDate IS NULL THEN '未知' " +
                "  WHEN YEAR(CURRENT_DATE) - YEAR(d.purchaseDate) < 1 THEN '1年以下' " +
                "  WHEN YEAR(CURRENT_DATE) - YEAR(d.purchaseDate) < 3 THEN '1-3年' " +
                "  WHEN YEAR(CURRENT_DATE) - YEAR(d.purchaseDate) < 5 THEN '3-5年' " +
                "  ELSE '5年以上' " +
                "END, COUNT(d) " +
                "FROM Device d " +
                "GROUP BY " +
                "CASE " +
                "  WHEN d.purchaseDate IS NULL THEN '未知' " +
                "  WHEN YEAR(CURRENT_DATE) - YEAR(d.purchaseDate) < 1 THEN '1年以下' " +
                "  WHEN YEAR(CURRENT_DATE) - YEAR(d.purchaseDate) < 3 THEN '1-3年' " +
                "  WHEN YEAR(CURRENT_DATE) - YEAR(d.purchaseDate) < 5 THEN '3-5年' " +
                "  ELSE '5年以上' " +
                "END")
        List<Object[]> countDevicesByUsageYears();

        /**
         * 查询报废记录
         * 
         * @param status 设备状态
         * @param scrapReason 报废原因
         * @param startTime 开始时间
         * @param endTime 结束时间
         * @param pageable 分页参数
         * @return 设备分页结果
         */
        @Query("SELECT d FROM Device d WHERE d.status = :status " +
                "AND (:scrapReason IS NULL OR d.scrapReason LIKE %:scrapReason%) " +
                "AND (:startTime IS NULL OR d.scrapTime >= :startTime) " +
                "AND (:endTime IS NULL OR d.scrapTime <= :endTime)")
        Page<Device> findScrapRecords(@Param("status") Integer status,
                @Param("scrapReason") String scrapReason,
                @Param("startTime") LocalDateTime startTime,
                @Param("endTime") LocalDateTime endTime,
                Pageable pageable);

        /**
         * 查询库存预警设备（当前库存 <= 最小库存）
         * 
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        @Query("SELECT d FROM Device d WHERE d.currentStock <= d.minStock")
        List<Device> findStockAlertDevices();

        /**
         * 批量更新设备状态
         * 
         * @param ids        设备ID列表
         * @param status     新状态
         * @param updateTime 更新时间
         * @return 更新记录数
         */
        @Modifying
        @Query("UPDATE Device d SET d.status = :status, d.updateTime = :updateTime WHERE d.id IN :ids")
        int batchUpdateStatus(@Param("ids") List<Long> ids,
                        @Param("status") Integer status,
                        @Param("updateTime") LocalDateTime updateTime);

        /**
         * 批量更新设备区域
         * 
         * @param ids        设备ID列表
         * @param areaId     新区域ID
         * @param updateTime 更新时间
         * @return 更新记录数
         */
        @Modifying
        @Query("UPDATE Device d SET d.areaId = :areaId, d.updateTime = :updateTime WHERE d.id IN :ids")
        int batchUpdateArea(@Param("ids") List<Long> ids,
                        @Param("areaId") Long areaId,
                        @Param("updateTime") LocalDateTime updateTime);

        /**
         * 批量删除设备
         * 
         * @param ids 设备ID列表
         * @return 删除记录数
         */
        @Modifying
        @Query("DELETE FROM Device d WHERE d.id IN :ids")
        int batchDelete(@Param("ids") List<Long> ids);

        /**
         * 查询指定时间范围内创建的设备
         * 
         * @param startTime 开始时间
         * @param endTime   结束时间
         * @return 设备列表
         */
        @Query("SELECT d FROM Device d WHERE d.createTime BETWEEN :startTime AND :endTime")
        List<Device> findByCreateTimeBetween(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * 统计指定时间范围内创建的设备数量
         * 
         * @param startTime 开始时间
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.createTime >= :startTime")
        Long countByCreateTimeAfter(@Param("startTime") LocalDateTime startTime);

        /**
         * 根据供应商ID查询设备
         * 
         * @param supplierId 供应商ID
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType", "area" })
        List<Device> findBySupplierId(Long supplierId);

        /**
         * 根据货位ID查询设备
         * 
         * @param binId 货位ID
         * @return 设备列表
         */
        @EntityGraph(attributePaths = { "deviceType" })
        List<Device> findByBinId(Long binId);

        /**
         * 查询需要保养的设备（基于保修结束日期）
         *
         * @param date 日期
         * @return 设备列表
         */
        @Query("SELECT d FROM Device d WHERE d.warrantyEnd IS NOT NULL AND d.warrantyEnd <= :date")
        List<Device> findDevicesNeedingMaintenance(@Param("date") LocalDate date);

        /**
         * 根据状态统计设备数量（字符串状态）
         * 
         * @param status 设备状态字符串
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.status = :status")
        Long countByStatus(@Param("status") String status);

        /**
         * 根据当前库存小于等于指定值统计设备数量
         * 
         * @param stock 库存阈值
         * @return 设备数量
         */
        @Query("SELECT COUNT(d) FROM Device d WHERE d.currentStock <= :stock")
        Long countByCurrentStockLessThanEqual(@Param("stock") Integer stock);

        /**
         * 按状态分组统计设备数量
         * 
         * @return 状态和数量的映射列表
         */
        @Query("SELECT d.status, COUNT(d) FROM Device d GROUP BY d.status")
        List<Object[]> countByStatusGroup();

        /**
         * 按区域ID分组统计设备数量
         *
         * @return 区域ID和数量的映射列表
         */
        @Query("SELECT a.id, COUNT(d) FROM Device d LEFT JOIN d.area a WHERE a.id IS NOT NULL GROUP BY a.id")
        List<Object[]> countByAreaId();

        /**
         * 按设备类型和状态统计设备数量
         *
         * @return 类型ID、状态和数量的映射列表
         */
        @Query("SELECT d.typeId, d.status, COUNT(d) FROM Device d WHERE d.typeId IS NOT NULL GROUP BY d.typeId, d.status")
        List<Object[]> countByDeviceTypeAndStatus();

        /**
         * 查询所有设备的采购日期（仅返回需要的字段，避免N+1问题）
         *
         * @return 采购日期列表
         */
        @Query("SELECT d.purchaseDate FROM Device d")
        List<Object[]> findAllPurchaseDates();
}
