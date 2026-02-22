package com.backend.repository;

import com.backend.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 供应商数据访问接口
 * 
 * 功能说明：
 * 提供供应商实体的数据访问操作，包括基本CRUD、分页查询、
 * 条件查询等功能
 * 
 * 查询条件：
 * - 供应商编码、名称、联系人、状态
 * - 支持关键词模糊搜索
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    /**
     * 根据供应商编码查询
     * 
     * @param supplierCode 供应商编码
     * @return 供应商信息
     */
    Optional<Supplier> findBySupplierCode(String supplierCode);

    /**
     * 检查供应商编码是否存在
     * 
     * @param supplierCode 供应商编码
     * @return 是否存在
     */
    boolean existsBySupplierCode(String supplierCode);

    /**
     * 根据状态查询供应商列表
     * 
     * @param status 状态（0-禁用，1-启用）
     * @param pageable 分页参数
     * @return 分页供应商列表
     */
    Page<Supplier> findByStatus(Integer status, Pageable pageable);

    /**
     * 多条件分页查询供应商
     * 
     * 查询条件：
     * - 关键词：匹配供应商编码、名称、联系人
     * - 状态：精确匹配
     * 
     * @param keyword 搜索关键词，可选
     * @param status 状态，可选
     * @param pageable 分页参数
     * @return 分页供应商列表
     */
    @Query("SELECT s FROM Supplier s WHERE " +
            "(:keyword IS NULL OR s.supplierCode LIKE %:keyword% OR " +
            "s.supplierName LIKE %:keyword% OR s.contactPerson LIKE %:keyword%) AND " +
            "(:status IS NULL OR s.status = :status)")
    Page<Supplier> findByConditions(@Param("keyword") String keyword,
            @Param("status") Integer status,
            Pageable pageable);

    /**
     * 统计启用的供应商数量
     * 
     * @return 供应商数量
     */
    long countByStatus(Integer status);
}
