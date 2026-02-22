package com.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Permission;
import com.backend.entity.Role;
import com.backend.repository.PermissionRepository;
import com.backend.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public List<Permission> getActivePermissions() {
        return permissionRepository.findAllActiveOrderBySortOrder();
    }

    public List<Map<String, Object>> getPermissionTree() {
        List<Permission> allPermissions = permissionRepository.findAllActiveOrderBySortOrder();
        return buildTree(allPermissions, 0L);
    }

    private List<Map<String, Object>> buildTree(List<Permission> permissions, Long parentId) {
        List<Map<String, Object>> tree = new ArrayList<>();
        
        for (Permission permission : permissions) {
            if (parentId.equals(permission.getParentId())) {
                Map<String, Object> node = new HashMap<>();
                node.put("id", permission.getId());
                node.put("label", permission.getPermissionName());
                node.put("code", permission.getPermissionCode());
                node.put("type", permission.getType());
                node.put("path", permission.getPath());
                node.put("sortOrder", permission.getSortOrder());
                node.put("status", permission.getStatus());
                
                List<Map<String, Object>> children = buildTree(permissions, permission.getId());
                if (!children.isEmpty()) {
                    node.put("children", children);
                }
                
                tree.add(node);
            }
        }
        
        return tree;
    }

    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("权限不存在: " + id));
    }

    @Transactional
    public Permission createPermission(Permission permission) {
        log.info("创建权限: code={}, name={}", permission.getPermissionCode(), permission.getPermissionName());
        
        if (permissionRepository.existsByPermissionCode(permission.getPermissionCode())) {
            throw new RuntimeException("权限编码已存在: " + permission.getPermissionCode());
        }
        
        return permissionRepository.save(permission);
    }

    @Transactional
    public Permission updatePermission(Long id, Permission permission) {
        log.info("更新权限: id={}", id);
        
        Permission existing = getPermissionById(id);
        
        if (!existing.getPermissionCode().equals(permission.getPermissionCode())) {
            if (permissionRepository.existsByPermissionCode(permission.getPermissionCode())) {
                throw new RuntimeException("权限编码已存在: " + permission.getPermissionCode());
            }
        }
        
        existing.setPermissionName(permission.getPermissionName());
        existing.setPermissionCode(permission.getPermissionCode());
        existing.setType(permission.getType());
        existing.setPath(permission.getPath());
        existing.setParentId(permission.getParentId());
        existing.setSortOrder(permission.getSortOrder());
        existing.setStatus(permission.getStatus());
        
        return permissionRepository.save(existing);
    }

    @Transactional
    public void deletePermission(Long id) {
        log.info("删除权限: id={}", id);
        
        List<Permission> children = permissionRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("存在子权限，无法删除");
        }
        
        permissionRepository.deleteById(id);
    }

    public List<Permission> getPermissionsByRoleId(Long roleId) {
        return permissionRepository.findAll();
    }

    public List<Map<String, Object>> getPermissionsWithCheckedByRoleId(Long roleId) {
        List<Permission> allPermissions = permissionRepository.findAllActiveOrderBySortOrder();
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("角色不存在: " + roleId));
        
        Set<Long> rolePermissionIds = role.getPermissions().stream()
                .map(Permission::getId)
                .collect(Collectors.toSet());
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Permission permission : allPermissions) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", permission.getId());
            item.put("permissionName", permission.getPermissionName());
            item.put("permissionCode", permission.getPermissionCode());
            item.put("type", permission.getType());
            item.put("path", permission.getPath());
            item.put("parentId", permission.getParentId());
            item.put("sortOrder", permission.getSortOrder());
            item.put("status", permission.getStatus());
            item.put("checked", rolePermissionIds.contains(permission.getId()));
            result.add(item);
        }
        
        return result;
    }
}
