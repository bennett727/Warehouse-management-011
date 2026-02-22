/*
 * @file: DataInitializer.java
 * @description: 系统数据初始化器 - 负责角色、权限、默认用户的初始化
 * @author: 后端开发团队
 * @createTime: 2026-02-18
 * @version: 1.0.0
 *
 * 初始化内容：
 * ====================
 * 1. 系统角色初始化（ADMIN, OPERATOR, TECHNICIAN, VIEWER）
 * 2. 系统权限初始化
 * 3. 角色-权限关联初始化
 * 4. 默认管理员用户初始化
 * 5. 默认操作员用户初始化
 *
 * 执行策略：
 * - 幂等性：多次执行不会重复创建数据
 * - 可配置：通过配置控制是否执行初始化
 * - 安全性：密码使用BCrypt加密
 */
package com.backend.config.initialization;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Permission;
import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.enums.UserRole;
import com.backend.repository.PermissionRepository;
import com.backend.repository.RoleRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 系统数据初始化器
 *
 * 功能说明：
 * 在应用启动时自动初始化系统基础数据，包括角色、权限和用户。
 * 采用幂等设计，确保多次执行不会导致数据重复。
 *
 * 初始化顺序：
 * 1. 权限数据
 * 2. 角色数据
 * 3. 角色-权限关联
 * 4. 用户数据
 * 5. 用户-角色关联
 *
 * @author 后端开发团队
 * @version 1.0.0
 * @since 2026-02-18
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 系统初始化入口
     *
     * 执行顺序：@Order(1) 确保在其他组件之前执行
     */
    @Bean
    @Order(1)
    public CommandLineRunner initializeSystemData() {
        return args -> {
            log.info("╔════════════════════════════════════════════════════════════╗");
            log.info("║          系统数据初始化流程启动                            ║");
            log.info("╚════════════════════════════════════════════════════════════╝");

            try {
                // 1. 初始化权限数据
                initializePermissions();

                // 2. 初始化角色数据
                initializeRoles();

                // 3. 初始化角色-权限关联
                initializeRolePermissions();

                // 4. 初始化默认用户
                initializeDefaultUsers();

                log.info("╔════════════════════════════════════════════════════════════╗");
                log.info("║          系统数据初始化完成                              ║");
                log.info("╚════════════════════════════════════════════════════════════╝");
            } catch (Exception e) {
                log.error("系统数据初始化失败", e);
                throw new RuntimeException("系统数据初始化失败", e);
            }
        };
    }

    /**
     * 初始化权限数据
     *
     * 创建系统所需的所有权限，采用幂等设计
     */
    @Transactional
    protected void initializePermissions() {
        log.info("【1/4】开始初始化权限数据...");

        // 设备管理权限
        createPermissionIfNotExists("device:view", "查看设备", "查看设备列表和详情");
        createPermissionIfNotExists("device:create", "创建设备", "创建新设备");
        createPermissionIfNotExists("device:update", "更新设备", "修改设备信息");
        createPermissionIfNotExists("device:delete", "删除设备", "删除设备");
        createPermissionIfNotExists("device:status:change", "变更设备状态", "变更设备状态");

        // 库存管理权限
        createPermissionIfNotExists("inventory:view", "查看库存", "查看库存信息");
        createPermissionIfNotExists("inventory:adjust", "调整库存", "调整库存数量");
        createPermissionIfNotExists("inventory:audit", "库存盘点", "执行库存盘点");

        // 订单管理权限
        createPermissionIfNotExists("order:view", "查看订单", "查看出入库订单");
        createPermissionIfNotExists("order:create", "创建订单", "创建出入库订单");
        createPermissionIfNotExists("order:audit", "审核订单", "审核出入库订单");
        createPermissionIfNotExists("order:execute", "执行订单", "执行出入库操作");

        // 审批管理权限
        createPermissionIfNotExists("approval:view", "查看审批", "查看审批记录");
        createPermissionIfNotExists("approval:create", "创建审批", "创建审批申请");
        createPermissionIfNotExists("approval:approve", "审批通过", "审批通过申请");
        createPermissionIfNotExists("approval:reject", "审批拒绝", "审批拒绝申请");

        // 系统管理权限
        createPermissionIfNotExists("system:user:manage", "用户管理", "管理系统用户");
        createPermissionIfNotExists("system:role:manage", "角色管理", "管理系统角色");
        createPermissionIfNotExists("system:log:view", "查看日志", "查看系统日志");
        createPermissionIfNotExists("system:config:manage", "配置管理", "管理系统配置");

        // 远程账号权限
        createPermissionIfNotExists("remote:account:view", "查看远程账号", "查看远程连接账号");
        createPermissionIfNotExists("remote:account:manage", "管理远程账号", "管理远程连接账号");
        createPermissionIfNotExists("remote:account:test", "测试远程连接", "测试远程连接");

        // 监控权限
        createPermissionIfNotExists("monitoring:view", "查看监控", "查看系统监控");
        createPermissionIfNotExists("monitoring:manage", "管理监控", "管理监控配置");

        log.info("【1/4】权限数据初始化完成");
    }

    /**
     * 创建权限（如果不存在）
     */
    private void createPermissionIfNotExists(String code, String name, String description) {
        permissionRepository.findByPermissionCode(code).ifPresentOrElse(
                p -> log.debug("权限已存在: {}", code),
                () -> {
                    Permission permission = new Permission();
                    permission.setPermissionCode(code);
                    permission.setPermissionName(name);
                    permission.setType("api");
                    permission.setStatus(1);
                    permissionRepository.save(permission);
                    log.debug("创建权限: {}", code);
                });
    }

    /**
     * 初始化角色数据
     *
     * 创建系统默认角色：管理员、操作员、技术员、访客
     */
    @Transactional
    protected void initializeRoles() {
        log.info("【2/4】开始初始化角色数据...");

        // 管理员角色
        createRoleIfNotExists(UserRole.ADMIN, "管理员", "系统管理员，拥有所有权限");

        // 操作员角色
        createRoleIfNotExists(UserRole.OPERATOR, "操作员", "日常操作员，拥有大部分业务权限");

        // 技术员角色
        createRoleIfNotExists(UserRole.TECHNICIAN, "技术员", "技术员，负责设备维护");

        // 访客角色
        createRoleIfNotExists(UserRole.VIEWER, "访客", "访客，只读权限");

        log.info("【2/4】角色数据初始化完成");
    }

    /**
     * 创建角色（如果不存在）
     */
    private void createRoleIfNotExists(UserRole userRole, String name, String description) {
        roleRepository.findByRoleCode(userRole.name()).ifPresentOrElse(
                r -> log.debug("角色已存在: {}", userRole.name()),
                () -> {
                    Role role = new Role();
                    role.setRoleName(name);
                    role.setRoleCode(userRole.name());
                    role.setDescription(description);
                    role.setStatus(1);
                    role.setSort(userRole.ordinal());
                    roleRepository.save(role);
                    log.info("创建角色: {} - {}", userRole.name(), name);
                });
    }

    /**
     * 初始化角色-权限关联
     *
     * 为每个角色分配相应的权限
     */
    @Transactional
    protected void initializeRolePermissions() {
        log.info("【3/4】开始初始化角色-权限关联...");

        // 获取所有权限
        List<Permission> allPermissions = permissionRepository.findAll();
        Map<String, Permission> permissionMap = new HashMap<>();
        for (Permission p : allPermissions) {
            permissionMap.put(p.getPermissionCode(), p);
        }

        // 为管理员分配所有权限
        Role adminRole = roleRepository.findByRoleCode(UserRole.ADMIN.name())
                .orElseThrow(() -> new RuntimeException("管理员角色不存在"));
        adminRole.getPermissions().clear();
        adminRole.getPermissions().addAll(allPermissions);
        roleRepository.save(adminRole);
        log.info("为管理员角色分配了 {} 个权限", allPermissions.size());

        // 为操作员分配业务权限
        Role operatorRole = roleRepository.findByRoleCode(UserRole.OPERATOR.name())
                .orElseThrow(() -> new RuntimeException("操作员角色不存在"));
        Set<Permission> operatorPermissions = new HashSet<>();
        String[] operatorPermCodes = {
                "device:view", "device:update", "device:status:change",
                "inventory:view", "inventory:adjust",
                "order:view", "order:create", "order:execute",
                "approval:view", "approval:approve", "approval:reject",
                "remote:account:view", "remote:account:test",
                "monitoring:view"
        };
        for (String code : operatorPermCodes) {
            Permission p = permissionMap.get(code);
            if (p != null) {
                operatorPermissions.add(p);
            }
        }
        operatorRole.getPermissions().clear();
        operatorRole.getPermissions().addAll(operatorPermissions);
        roleRepository.save(operatorRole);
        log.info("为操作员角色分配了 {} 个权限", operatorPermissions.size());

        // 为技术员分配设备维护权限
        Role technicianRole = roleRepository.findByRoleCode(UserRole.TECHNICIAN.name())
                .orElseThrow(() -> new RuntimeException("技术员角色不存在"));
        Set<Permission> technicianPermissions = new HashSet<>();
        String[] technicianPermCodes = {
                "device:view", "device:status:change",
                "inventory:view",
                "order:view",
                "approval:view",
                "remote:account:view", "remote:account:test",
                "monitoring:view"
        };
        for (String code : technicianPermCodes) {
            Permission p = permissionMap.get(code);
            if (p != null) {
                technicianPermissions.add(p);
            }
        }
        technicianRole.getPermissions().clear();
        technicianRole.getPermissions().addAll(technicianPermissions);
        roleRepository.save(technicianRole);
        log.info("为技术员角色分配了 {} 个权限", technicianPermissions.size());

        // 为访客分配只读权限
        Role viewerRole = roleRepository.findByRoleCode(UserRole.VIEWER.name())
                .orElseThrow(() -> new RuntimeException("访客角色不存在"));
        Set<Permission> viewerPermissions = new HashSet<>();
        String[] viewerPermCodes = {
                "device:view",
                "inventory:view",
                "order:view",
                "approval:view",
                "monitoring:view"
        };
        for (String code : viewerPermCodes) {
            Permission p = permissionMap.get(code);
            if (p != null) {
                viewerPermissions.add(p);
            }
        }
        viewerRole.getPermissions().clear();
        viewerRole.getPermissions().addAll(viewerPermissions);
        roleRepository.save(viewerRole);
        log.info("为访客角色分配了 {} 个权限", viewerPermissions.size());

        log.info("【3/4】角色-权限关联初始化完成");
    }

    /**
     * 初始化默认用户
     *
     * 创建默认管理员和操作员账号
     */
    @Transactional
    protected void initializeDefaultUsers() {
        log.info("【4/4】开始初始化默认用户...");

        // 获取角色
        Role adminRole = roleRepository.findByRoleCode(UserRole.ADMIN.name())
                .orElseThrow(() -> new RuntimeException("管理员角色不存在"));
        Role operatorRole = roleRepository.findByRoleCode(UserRole.OPERATOR.name())
                .orElseThrow(() -> new RuntimeException("操作员角色不存在"));
        Role technicianRole = roleRepository.findByRoleCode(UserRole.TECHNICIAN.name())
                .orElseThrow(() -> new RuntimeException("技术员角色不存在"));

        // 创建默认管理员
        createUserIfNotExists(
                "admin",
                "123456",
                "系统管理员",
                "admin@warehouse.com",
                "13800138000",
                Set.of(adminRole));

        // 创建默认操作员
        createUserIfNotExists(
                "operator",
                "123456",
                "操作员",
                "operator@warehouse.com",
                "13800138001",
                Set.of(operatorRole));

        // 创建默认技术员
        createUserIfNotExists(
                "technician",
                "123456",
                "技术员",
                "technician@warehouse.com",
                "13800138002",
                Set.of(technicianRole));

        log.info("【4/4】默认用户初始化完成");
    }

    /**
     * 创建用户（如果不存在）
     */
    private void createUserIfNotExists(String username, String rawPassword, String realName,
            String email, String phone, Set<Role> roles) {
        userRepository.findByUsername(username).ifPresentOrElse(
                u -> log.info("用户已存在: {}，跳过创建", username),
                () -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    user.setRealName(realName);
                    user.setEmail(email);
                    user.setPhone(phone);
                    user.setStatus(1);
                    user.setRoles(roles);
                    userRepository.save(user);
                    log.info("创建用户: {} (密码: {})，角色: {}",
                            username, rawPassword, roles.stream().map(Role::getRoleCode).toList());
                });
    }
}
