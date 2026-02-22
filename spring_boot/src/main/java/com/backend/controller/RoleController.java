package com.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.Permission;
import com.backend.entity.Role;
import com.backend.service.PermissionService;
import com.backend.service.RoleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 角色管理控制器
 * 
 * 功能说明：
 * 提供角色管理的RESTful API接口，包括角色的增删改查、权限分配等功能
 * 
 * API路径：/api/roles
 * 
 * 权限控制：
 * - 查询操作：ADMIN, OPERATOR
 * - 写操作：ADMIN
 * - 删除操作：ADMIN
 * 
 * @author 后端开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "角色管理", description = "角色的增删改查、权限分配等接口")
public class RoleController {

    private final RoleService roleService;
    private final PermissionService permissionService;

    /**
     * 创建角色
     * 
     * @param role 角色信息
     * @return 创建后的角色
     */
    @PostMapping
    @Operation(summary = "创建角色", description = "创建新的角色信息")
    public ApiResponse<Role> createRole(
            @Valid @RequestBody Role role) {
        log.info("创建角色: roleCode={}, roleName={}", role.getRoleCode(), role.getRoleName());
        Role createdRole = roleService.createRole(role);
        return ApiResponse.success("角色创建成功", createdRole);
    }

    /**
     * 更新角色
     * 
     * @param roleId 角色ID
     * @param role   角色信息
     * @return 更新后的角色
     */
    @PutMapping("/{roleId}")
    @Operation(summary = "更新角色", description = "更新指定角色的信息")
    public ApiResponse<Role> updateRole(
            @Parameter(description = "角色ID") @PathVariable Long roleId,
            @Valid @RequestBody Role role) {
        log.info("更新角色: roleId={}", roleId);
        Role updatedRole = roleService.updateRole(roleId, role);
        return ApiResponse.success("角色更新成功", updatedRole);
    }

    /**
     * 删除角色
     * 
     * @param roleId 角色ID
     * @return 操作结果
     */
    @DeleteMapping("/{roleId}")
    @Operation(summary = "删除角色", description = "删除指定角色")
    public ApiResponse<Void> deleteRole(
            @Parameter(description = "角色ID") @PathVariable Long roleId) {
        log.info("删除角色: roleId={}", roleId);
        roleService.deleteRole(roleId);
        return ApiResponse.success("角色删除成功", null);
    }

    /**
     * 根据ID查询角色
     * 
     * @param roleId 角色ID
     * @return 角色信息
     */
    @GetMapping("/{roleId}")
    @Operation(summary = "查询角色详情", description = "根据ID查询角色详细信息")
    public ApiResponse<Role> getRoleById(
            @Parameter(description = "角色ID") @PathVariable Long roleId) {
        Role role = roleService.getRoleById(roleId);
        return ApiResponse.success(role);
    }

    /**
     * 根据编码查询角色
     * 
     * @param roleCode 角色编码
     * @return 角色信息
     */
    @GetMapping("/code/{roleCode}")
    @Operation(summary = "根据编码查询角色", description = "根据角色编码查询角色信息")
    public ApiResponse<Role> getRoleByCode(
            @Parameter(description = "角色编码") @PathVariable String roleCode) {
        Role role = roleService.getRoleByCode(roleCode);
        return ApiResponse.success(role);
    }

    /**
     * 分页查询角色列表
     * 
     * @param keyword 关键词（可选）
     * @param status  状态（可选）
     * @param pageReq 分页参数
     * @return 分页结果
     */
    @GetMapping
    @Operation(summary = "查询角色列表", description = "分页查询角色列表，支持关键词和状态筛选")
    public ApiResponse<PageResult<Role>> getRoleList(
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Valid PageRequest pageReq) {

        // 构建JPA分页对象
        Pageable pageable = buildPageable(pageReq);

        log.info("查询角色列表: keyword={}, status={}, page={}, size={}",
                keyword, status, pageReq.getPage(), pageReq.getSize());

        var result = roleService.getRoleList(keyword, status, pageable);
        return ApiResponse.success(PageResult.of(result));
    }

    /**
     * 获取所有角色列表
     * 
     * @return 角色列表
     */
    @GetMapping("/all")
    @Operation(summary = "获取所有角色", description = "获取所有角色列表，不分页")
    public ApiResponse<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ApiResponse.success(roles);
    }

    @GetMapping("/{roleId}/permissions")
    @Operation(summary = "获取角色权限", description = "获取指定角色的权限列表，包含是否已分配的标记")
    public ApiResponse<List<Map<String, Object>>> getRolePermissions(
            @Parameter(description = "角色ID") @PathVariable Long roleId) {
        log.info("获取角色权限: roleId={}", roleId);
        List<Map<String, Object>> permissions = permissionService.getPermissionsWithCheckedByRoleId(roleId);
        return ApiResponse.success(permissions);
    }

    /**
     * 为角色分配权限
     * 
     * @param roleId       角色ID
     * @param permissions 权限列表
     * @return 更新后的角色
     */
    @PostMapping("/{roleId}/permissions")
    @Operation(summary = "分配权限", description = "为指定角色分配权限")
    public ApiResponse<Role> assignPermissions(
            @Parameter(description = "角色ID") @PathVariable Long roleId,
            @Valid @RequestBody java.util.Set<Permission> permissions) {
        log.info("为角色分配权限: roleId={}, permissionCount={}", roleId, permissions.size());
        Role updatedRole = roleService.assignPermissions(roleId, permissions);
        return ApiResponse.success("权限分配成功", updatedRole);
    }

    /**
     * 检查角色编码是否存在
     * 
     * @param roleCode 角色编码
     * @return 检查结果
     */
    @GetMapping("/check-code")
    @Operation(summary = "检查角色编码", description = "检查角色编码是否已存在")
    public ApiResponse<Boolean> checkRoleCode(
            @Parameter(description = "角色编码") @RequestParam String roleCode) {
        boolean exists = roleService.existsByRoleCode(roleCode);
        return ApiResponse.success(exists);
    }

    /**
     * 检查角色名称是否存在
     * 
     * @param roleName 角色名称
     * @return 检查结果
     */
    @GetMapping("/check-name")
    @Operation(summary = "检查角色名称", description = "检查角色名称是否已存在")
    public ApiResponse<Boolean> checkRoleName(
            @Parameter(description = "角色名称") @RequestParam String roleName) {
        boolean exists = roleService.existsByRoleName(roleName);
        return ApiResponse.success(exists);
    }

    /**
     * 根据PageRequest构建JPA Pageable对象
     * 
     * @param pageReq 统一分页请求
     * @return JPA分页对象
     */
    private Pageable buildPageable(PageRequest pageReq) {
        // 构建排序
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by("createTime").descending(); // 默认排序

        if (pageReq.getSort() != null && !pageReq.getSort().trim().isEmpty()) {
            org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(pageReq.getOrder())
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;
            // 字段名映射：将前端的createdAt映射到后端的createTime
            String sortField = pageReq.getSort();
            if ("createdAt".equals(sortField)) {
                sortField = "createTime";
            }
            sort = org.springframework.data.domain.Sort.by(direction, sortField);
        }

        // 构建分页对象（JPA页码从0开始）
        return org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(),
                pageReq.getSafeSize(),
                sort);
    }
}