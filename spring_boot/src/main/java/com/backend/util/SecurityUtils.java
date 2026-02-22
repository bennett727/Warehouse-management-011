/*
 * @file: SecurityUtils.java
 * @description: 安全工具类 - 提供权限校验、用户信息获取等通用方法
 * @author: 后端开发团队
 * @createTime: 2026-02-18
 * @version: 1.0.0
 *
 * 功能说明：
 * ====================
 * 1. 获取当前登录用户信息
 * 2. 检查用户角色
 * 3. 检查用户权限
 * 4. 获取当前用户ID
 * 5. 判断用户是否已认证
 */
package com.backend.util;

import com.backend.entity.User;
import com.backend.enums.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 安全工具类
 *
 * 功能说明：
 * 提供与Spring Security集成的工具方法，简化权限校验和用户信息获取。
 *
 * 使用示例：
 * ```java
 * // 获取当前用户名
 * String username = SecurityUtils.getCurrentUsername();
 *
 * // 检查是否有管理员角色
 * if (SecurityUtils.hasRole("ADMIN")) {
 *     // 执行管理员操作
 * }
 *
 * // 检查是否有特定权限
 * if (SecurityUtils.hasPermission("device:create")) {
 *     // 创建设备
 * }
 * ```
 *
 * @author 后端开发团队
 * @version 1.0.0
 * @since 2026-02-18
 */
@Slf4j
public class SecurityUtils {

    /**
     * 获取当前认证信息
     *
     * @return 认证信息Optional
     */
    public static Optional<Authentication> getAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .filter(auth -> !(auth.getPrincipal() instanceof String && "anonymousUser".equals(auth.getPrincipal())));
    }

    /**
     * 获取当前登录用户名
     *
     * @return 用户名，如果未登录返回null
     */
    public static String getCurrentUsername() {
        return getAuthentication()
                .map(Authentication::getPrincipal)
                .map(principal -> {
                    if (principal instanceof UserDetails) {
                        return ((UserDetails) principal).getUsername();
                    }
                    return principal.toString();
                })
                .orElse(null);
    }

    /**
     * 获取当前用户详情
     *
     * @return UserDetails Optional
     */
    public static Optional<UserDetails> getCurrentUserDetails() {
        return getAuthentication()
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof UserDetails)
                .map(principal -> (UserDetails) principal);
    }

    /**
     * 获取当前用户的所有角色
     *
     * @return 角色集合
     */
    public static Set<String> getCurrentUserRoles() {
        return getAuthentication()
                .map(Authentication::getAuthorities)
                .stream()
                .flatMap(Collection::stream)
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5)) // 移除 ROLE_ 前缀
                .collect(Collectors.toSet());
    }

    /**
     * 获取当前用户的所有权限
     *
     * @return 权限集合
     */
    public static Set<String> getCurrentUserPermissions() {
        return getAuthentication()
                .map(Authentication::getAuthorities)
                .stream()
                .flatMap(Collection::stream)
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .collect(Collectors.toSet());
    }

    /**
     * 检查当前用户是否有指定角色
     *
     * @param role 角色名称（不需要ROLE_前缀）
     * @return true表示有该角色
     */
    public static boolean hasRole(String role) {
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getAuthentication()
                .map(Authentication::getAuthorities)
                .stream()
                .flatMap(Collection::stream)
                .map(GrantedAuthority::getAuthority)
                .anyMatch(roleWithPrefix::equals);
    }

    /**
     * 检查当前用户是否有任意指定角色
     *
     * @param roles 角色名称数组
     * @return true表示有任意一个角色
     */
    public static boolean hasAnyRole(String... roles) {
        Set<String> userRoles = getCurrentUserRoles();
        for (String role : roles) {
            if (userRoles.contains(role.toUpperCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查当前用户是否有所有指定角色
     *
     * @param roles 角色名称数组
     * @return true表示有所有角色
     */
    public static boolean hasAllRoles(String... roles) {
        Set<String> userRoles = getCurrentUserRoles();
        for (String role : roles) {
            if (!userRoles.contains(role.toUpperCase())) {
                return false;
            }
        }
        return true;
    }

    /**
     * 检查当前用户是否有指定权限
     *
     * @param permission 权限字符串
     * @return true表示有该权限
     */
    public static boolean hasPermission(String permission) {
        return getCurrentUserPermissions().contains(permission);
    }

    /**
     * 检查当前用户是否有任意指定权限
     *
     * @param permissions 权限字符串数组
     * @return true表示有任意一个权限
     */
    public static boolean hasAnyPermission(String... permissions) {
        Set<String> userPermissions = getCurrentUserPermissions();
        for (String permission : permissions) {
            if (userPermissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查当前用户是否是管理员
     *
     * @return true表示是管理员
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * 检查当前用户是否是操作员
     *
     * @return true表示是操作员
     */
    public static boolean isOperator() {
        return hasRole("OPERATOR");
    }

    /**
     * 检查当前用户是否是技术员
     *
     * @return true表示是技术员
     */
    public static boolean isTechnician() {
        return hasRole("TECHNICIAN");
    }

    /**
     * 检查当前用户是否已认证
     *
     * @return true表示已认证
     */
    public static boolean isAuthenticated() {
        return getAuthentication().isPresent();
    }

    /**
     * 检查当前用户是否是匿名用户
     *
     * @return true表示是匿名用户
     */
    public static boolean isAnonymous() {
        return !isAuthenticated();
    }

    /**
     * 获取当前用户的角色级别
     *
     * @return 角色级别，数字越小权限越高
     */
    public static int getRoleLevel() {
        if (isAdmin()) {
            return 1;
        }
        if (isOperator()) {
            return 2;
        }
        if (isTechnician()) {
            return 3;
        }
        return 99; // 访客或其他
    }

    /**
     * 验证用户是否有权访问指定数据
     *
     * 管理员可以访问所有数据，其他用户只能访问自己的数据
     *
     * @param dataOwnerId 数据所有者ID
     * @param currentUserId 当前用户ID
     * @return true表示有权访问
     */
    public static boolean canAccessData(Long dataOwnerId, Long currentUserId) {
        if (isAdmin()) {
            return true;
        }
        return dataOwnerId != null && dataOwnerId.equals(currentUserId);
    }

    /**
     * 清除当前安全上下文
     *
     * 用于登出等场景
     */
    public static void clearContext() {
        SecurityContextHolder.clearContext();
        log.debug("安全上下文已清除");
    }

    /**
     * 私有构造方法，防止实例化
     */
    private SecurityUtils() {
        throw new UnsupportedOperationException("工具类不能实例化");
    }
}
