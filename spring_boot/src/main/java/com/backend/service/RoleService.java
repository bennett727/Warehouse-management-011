package com.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Permission;
import com.backend.entity.Role;
import com.backend.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 角色服务类
 * 
 * 功能说明：
 * 提供角色管理的业务逻辑实现，包括角色的增删改查、权限分配等功能
 * 
 * @author 后端开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    /**
     * 创建角色
     * 
     * @param role 角色信息
     * @return 创建后的角色
     */
    @Transactional
    public Role createRole(Role role) {
        log.info("创建角色: roleCode={}, roleName={}", role.getRoleCode(), role.getRoleName());
        
        // 检查角色编码是否已存在
        if (roleRepository.existsByRoleCode(role.getRoleCode())) {
            throw new RuntimeException("角色编码已存在: " + role.getRoleCode());
        }
        
        // 检查角色名称是否已存在
        if (roleRepository.existsByRoleName(role.getRoleName())) {
            throw new RuntimeException("角色名称已存在: " + role.getRoleName());
        }
        
        return roleRepository.save(role);
    }

    /**
     * 更新角色
     * 
     * @param roleId 角色ID
     * @param role   角色信息
     * @return 更新后的角色
     */
    @Transactional
    public Role updateRole(Long roleId, Role role) {
        log.info("更新角色: roleId={}", roleId);
        
        Role existingRole = getRoleById(roleId);
        
        // 如果角色编码发生变化，检查新编码是否已存在
        if (!existingRole.getRoleCode().equals(role.getRoleCode()) 
                && roleRepository.existsByRoleCode(role.getRoleCode())) {
            throw new RuntimeException("角色编码已存在: " + role.getRoleCode());
        }
        
        // 如果角色名称发生变化，检查新名称是否已存在
        if (!existingRole.getRoleName().equals(role.getRoleName()) 
                && roleRepository.existsByRoleName(role.getRoleName())) {
            throw new RuntimeException("角色名称已存在: " + role.getRoleName());
        }
        
        // 更新角色信息
        existingRole.setRoleName(role.getRoleName());
        existingRole.setRoleCode(role.getRoleCode());
        existingRole.setDescription(role.getDescription());
        existingRole.setStatus(role.getStatus());
        existingRole.setSort(role.getSort());
        
        return roleRepository.save(existingRole);
    }

    /**
     * 删除角色
     * 
     * @param roleId 角色ID
     */
    @Transactional
    public void deleteRole(Long roleId) {
        log.info("删除角色: roleId={}", roleId);
        
        Role role = getRoleById(roleId);
        roleRepository.delete(role);
    }

    /**
     * 根据ID查询角色
     * 
     * @param roleId 角色ID
     * @return 角色信息
     */
    public Role getRoleById(Long roleId) {
        Optional<Role> roleOpt = roleRepository.findById(roleId);
        if (!roleOpt.isPresent()) {
            throw new RuntimeException("角色不存在: " + roleId);
        }
        return roleOpt.get();
    }

    /**
     * 根据角色编码查询角色
     * 
     * @param roleCode 角色编码
     * @return 角色信息
     */
    public Role getRoleByCode(String roleCode) {
        Optional<Role> roleOpt = roleRepository.findByRoleCode(roleCode);
        if (!roleOpt.isPresent()) {
            throw new RuntimeException("角色不存在: " + roleCode);
        }
        return roleOpt.get();
    }

    /**
     * 分页查询角色列表
     * 
     * @param keyword 关键词（可选）
     * @param status  状态（可选）
     * @param pageable 分页参数
     * @return 分页结果
     */
    public Page<Role> getRoleList(String keyword, Integer status, Pageable pageable) {
        log.info("查询角色列表: keyword={}, status={}, page={}, size={}", 
                keyword, status, pageable.getPageNumber(), pageable.getPageSize());
        
        // 这里可以根据实际需求添加更复杂的查询逻辑
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 按关键词搜索
            if (status != null) {
                return roleRepository.findByRoleNameContainingIgnoreCaseAndStatus(keyword, status, pageable);
            } else {
                return roleRepository.findByRoleNameContainingIgnoreCase(keyword, pageable);
            }
        } else {
            // 不使用关键词搜索
            if (status != null) {
                return roleRepository.findByStatus(status, pageable);
            } else {
                return roleRepository.findAll(pageable);
            }
        }
    }

    /**
     * 获取所有角色列表
     * 
     * @return 角色列表
     */
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * 为角色分配权限
     * 
     * @param roleId       角色ID
     * @param permissions 权限列表
     * @return 更新后的角色
     */
    @Transactional
    public Role assignPermissions(Long roleId, Set<Permission> permissions) {
        log.info("为角色分配权限: roleId={}, permissionCount={}", roleId, permissions.size());
        
        Role role = getRoleById(roleId);
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }

    /**
     * 检查角色编码是否存在
     * 
     * @param roleCode 角色编码
     * @return 是否存在
     */
    public boolean existsByRoleCode(String roleCode) {
        return roleRepository.existsByRoleCode(roleCode);
    }

    /**
     * 检查角色名称是否存在
     * 
     * @param roleName 角色名称
     * @return 是否存在
     */
    public boolean existsByRoleName(String roleName) {
        return roleRepository.existsByRoleName(roleName);
    }
}