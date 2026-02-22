package com.backend.repository;

import com.backend.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 仓库数据访问层
 *
 * 功能说明：
 * 提供仓库实体的CRUD操作和自定义查询方法
 *
 * 查询方法说明：
 * - 使用Spring Data JPA的派生查询方法命名规范
 * - 复杂查询使用@Query注解自定义JPQL
 * - 分页查询返回Page对象
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    /**
     * 根据仓库编码判断仓库是否存在
     *
     * @param warehouseCode 仓库编码
     * @return 是否存在
     */
    boolean existsByWarehouseCode(String warehouseCode);

    /**
     * 根据仓库编码查询仓库
     *
     * @param warehouseCode 仓库编码
     * @return 仓库对象
     */
    Optional<Warehouse> findByWarehouseCode(String warehouseCode);

    /**
     * 根据仓库名称模糊查询
     *
     * @param warehouseName 仓库名称关键字
     * @return 仓库列表
     */
    List<Warehouse> findByWarehouseNameContaining(String warehouseName);

    /**
     * 根据仓库类型查询
     *
     * @param warehouseType 仓库类型
     * @return 仓库列表
     */
    List<Warehouse> findByWarehouseType(Integer warehouseType);

    /**
     * 根据状态查询仓库
     *
     * @param status 状态
     * @return 仓库列表
     */
    List<Warehouse> findByStatus(Integer status);

    /**
     * 根据行政区划ID查询
     *
     * @param administrativeDivisionId 行政区划ID
     * @return 仓库列表
     */
    List<Warehouse> findByAdministrativeDivisionId(Long administrativeDivisionId);

    /**
     * 多条件分页查询仓库
     *
     * @param keyword 关键字（匹配编码或名称）
     * @param status 状态
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT w FROM Warehouse w WHERE " +
            "(:keyword IS NULL OR w.warehouseCode LIKE %:keyword% OR w.warehouseName LIKE %:keyword%) AND " +
            "(:status IS NULL OR w.status = :status)")
    Page<Warehouse> findByConditions(@Param("keyword") String keyword,
                                     @Param("status") Integer status,
                                     Pageable pageable);

    /**
     * 按状态统计仓库数量
     *
     * @return 状态统计列表
     */
    @Query("SELECT w.status, COUNT(w) FROM Warehouse w GROUP BY w.status")
    List<Object[]> countByStatus();

    /**
     * 查询启用的仓库列表
     *
     * @return 仓库列表
     */
    @Query("SELECT w FROM Warehouse w WHERE w.status = 1 ORDER BY w.createTime DESC")
    List<Warehouse> findActiveWarehouses();

    /**
     * 统计启用的仓库数量
     *
     * @return 数量
     */
    @Query("SELECT COUNT(w) FROM Warehouse w WHERE w.status = 1")
    Long countActiveWarehouses();

    /**
     * 判断编码是否存在（排除指定ID）
     *
     * @param code 编码
     * @param id 排除的ID
     * @return 是否存在
     */
    @Query("SELECT COUNT(w) > 0 FROM Warehouse w WHERE w.warehouseCode = :code AND w.id != :id")
    boolean existsByCodeAndIdNot(@Param("code") String code, @Param("id") Long id);

    /**
     * 判断编码是否存在
     *
     * @param code 编码
     * @return 是否存在
     */
    @Query("SELECT COUNT(w) > 0 FROM Warehouse w WHERE w.warehouseCode = :code")
    boolean existsByCode(@Param("code") String code);

    /**
     * 多条件查询仓库
     *
     * @param name 名称
     * @param code 编码
     * @param type 类型
     * @param status 状态
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT w FROM Warehouse w WHERE " +
            "(:name IS NULL OR w.warehouseName LIKE %:name%) AND " +
            "(:code IS NULL OR w.warehouseCode LIKE %:code%) AND " +
            "(:type IS NULL OR w.warehouseType = :type) AND " +
            "(:status IS NULL OR w.status = :status)")
    Page<Warehouse> findByMultipleConditions(@Param("name") String name,
                                               @Param("code") String code,
                                               @Param("type") Integer type,
                                               @Param("status") Integer status,
                                               Pageable pageable);

    /**
     * 根据负责人查询仓库
     *
     * @param managerId 负责人ID
     * @return 仓库列表
     */
    List<Warehouse> findByManagerId(Long managerId);

    /**
     * 统计有经纬度坐标的仓库数量
     * @return 数量
     */
    long countByLongitudeIsNotNullAndLatitudeIsNotNull();
}
