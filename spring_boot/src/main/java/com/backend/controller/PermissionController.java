package com.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.entity.Permission;
import com.backend.service.PermissionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Tag(name = "权限管理", description = "权限的增删改查、权限树等接口")
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @Operation(summary = "获取所有权限", description = "获取所有权限列表")
    public ApiResponse<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ApiResponse.success(permissions);
    }

    @GetMapping("/tree")
    @Operation(summary = "获取权限树", description = "获取树形结构的权限列表")
    public ApiResponse<List<Map<String, Object>>> getPermissionTree() {
        List<Map<String, Object>> tree = permissionService.getPermissionTree();
        return ApiResponse.success(tree);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取权限详情", description = "根据ID获取权限详情")
    public ApiResponse<Permission> getPermissionById(@PathVariable Long id) {
        Permission permission = permissionService.getPermissionById(id);
        return ApiResponse.success(permission);
    }

    @PostMapping
    @Operation(summary = "创建权限", description = "创建新的权限")
    public ApiResponse<Permission> createPermission(@Valid @RequestBody Permission permission) {
        Permission created = permissionService.createPermission(permission);
        return ApiResponse.success("权限创建成功", created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新权限", description = "更新指定权限")
    public ApiResponse<Permission> updatePermission(
            @PathVariable Long id,
            @Valid @RequestBody Permission permission) {
        Permission updated = permissionService.updatePermission(id, permission);
        return ApiResponse.success("权限更新成功", updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除权限", description = "删除指定权限")
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ApiResponse.success("权限删除成功", null);
    }
}
