package com.backend.repository;

import com.backend.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 权限数据访问接口
 * 
 * 功能说明：
 * 提供权限实体的数据访问操作，支持按权限编码、类型、
 * 父级ID等条件查询
 * 
 * 业务规则：
 * - 权限支持层级结构
 * - 权限类型包括：菜单、按钮、接口
 * - 支持按状态筛选
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    /**
     * 根据权限编码查询
     * 
     * @param permissionCode 权限编码
     * @return 权限信息
     */
    Optional<Permission> findByPermissionCode(String permissionCode);

    /**
     * 检查权限编码是否存在
     * 
     * @param permissionCode 权限编码
     * @return 是否存在
     */
    boolean existsByPermissionCode(String permissionCode);

    /**
     * 根据父级ID查询子权限
     * 
     * @param parentId 父级ID
     * @return 权限列表
     */
    List<Permission> findByParentId(Long parentId);

    /**
     * 根据父级ID和状态查询
     * 
     * @param parentId 父级ID
     * @param status   状态
     * @return 权限列表
     */
    List<Permission> findByParentIdAndStatus(Long parentId, Integer status);

    /**
     * 根据类型查询权限
     * 
     * @param type 类型（menu-菜单，button-按钮，api-接口）
     * @return 权限列表
     */
    List<Permission> findByType(String type);

    /**
     * 根据状态查询权限列表
     * 
     * @param status 状态（0-禁用，1-启用）
     * @return 权限列表
     */
    List<Permission> findByStatus(Integer status);

    /**
     * 根据状态查询并按排序号排序
     * 
     * @param status 状态
     * @return 排序后的权限列表
     */
    List<Permission> findByStatusOrderBySortOrderAsc(Integer status);

    /**
     * 根据父级ID查询并按排序号排序
     * 
     * @param parentId 父级ID
     * @return 排序后的权限列表
     */
    List<Permission> findByParentIdOrderBySortOrderAsc(Long parentId);

    /**
     * 查询所有启用的权限并按排序号排序
     * 
     * @return 排序后的权限列表
     */
    @Query("SELECT p FROM Permission p WHERE p.status = 1 ORDER BY p.sortOrder ASC")
    List<Permission> findAllActiveOrderBySortOrder();

    /**
     * 根据权限编码列表查询
     * 
     * @param permissionCodes 权限编码列表
     * @return 权限列表
     */
    @Query("SELECT p FROM Permission p WHERE p.permissionCode IN :codes")
    List<Permission> findByPermissionCodes(@Param("codes") List<String> permissionCodes);
}
