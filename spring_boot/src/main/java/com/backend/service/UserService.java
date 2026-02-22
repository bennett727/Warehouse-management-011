package com.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.dto.PageResult;
import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.exception.BusinessException;
import com.backend.repository.RoleRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 用户管理服务类
 * 
 * 功能说明：
 * 1. 用户信息的增删改查操作
 * 2. 用户角色分配与管理
 * 3. 用户状态管理（启用/禁用）
 * 4. 密码重置功能
 * 
 * 使用场景：
 * - 系统管理员管理用户账户
 * - 用户个人资料维护
 * - 权限分配与调整
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    /** 用户数据访问接口 */
    private final UserRepository userRepository;

    /** 角色数据访问接口 */
    private final RoleRepository roleRepository;

    /** 密码加密器 */
    private final PasswordEncoder passwordEncoder;

    /**
     * 获取用户列表（支持分页和条件查询）
     * 
     * 查询条件：
     * - 用户名模糊匹配
     * - 真实姓名模糊匹配
     * - 状态精确匹配
     * 
     * 返回数据包含：
     * - 用户基本信息
     * - 关联的角色列表
     * - 创建和更新时间
     * 
     * @param keyword  搜索关键词（用户名或真实姓名）
     * @param status   用户状态（0-禁用，1-启用）
     * @param pageable 分页参数
     * @return 分页用户列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getUserList(String keyword, Integer status, Pageable pageable) {
        // 根据条件查询用户分页数据
        Page<User> page = userRepository.findByConditions(keyword, null, status, pageable);

        // 将用户实体转换为前端需要的格式
        List<Map<String, Object>> records = page.getContent().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("realName", user.getRealName());
            map.put("email", user.getEmail());
            map.put("phone", user.getPhone());
            map.put("status", user.getStatus());
            map.put("lastLoginTime", user.getLastLoginTime());
            map.put("createTime", user.getCreateTime());
            map.put("updateTime", user.getUpdateTime());

            // 转换角色列表为简单格式
            List<Map<String, Object>> roles = user.getRoles().stream().map(role -> {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("roleName", role.getRoleName());
                roleMap.put("roleCode", role.getRoleCode());
                return roleMap;
            }).collect(Collectors.toList());
            map.put("roles", roles);

            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    /**
     * 根据ID获取用户详情
     * 
     * 使用场景：
     * - 编辑用户时加载用户信息
     * - 查看用户详情页面
     * 
     * @param id 用户ID
     * @return 用户详细信息
     * @throws RuntimeException 用户不存在时抛出异常
     */
    public ApiResponse<Map<String, Object>> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("realName", user.getRealName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("status", user.getStatus());
        map.put("lastLoginTime", user.getLastLoginTime());
        map.put("createTime", user.getCreateTime());
        map.put("updateTime", user.getUpdateTime());

        // 包含角色ID列表，用于前端角色选择
        List<Long> roleIds = user.getRoles().stream()
                .map(Role::getId)
                .collect(Collectors.toList());
        map.put("roleIds", roleIds);

        // 包含角色详细信息
        List<Map<String, Object>> roles = user.getRoles().stream().map(role -> {
            Map<String, Object> roleMap = new HashMap<>();
            roleMap.put("id", role.getId());
            roleMap.put("roleName", role.getRoleName());
            roleMap.put("roleCode", role.getRoleCode());
            return roleMap;
        }).collect(Collectors.toList());
        map.put("roles", roles);

        return ApiResponse.success(map);
    }

    /**
     * 创建新用户
     * 
     * 业务规则：
     * 1. 用户名必须唯一
     * 2. 邮箱必须唯一（如果提供）
     * 3. 初始密码默认为"123456"并加密存储
     * 4. 可以分配多个角色
     * 
     * @param user    用户信息
     * @param roleIds 角色ID列表
     * @return 创建成功的用户信息
     */
    @Transactional
    public ApiResponse<Map<String, Object>> createUser(User user, List<Long> roleIds) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(user.getUsername())) {
            return ApiResponse.error(400, "用户名已存在");
        }

        // 检查邮箱是否已存在（邮箱不为空时）
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            return ApiResponse.error(400, "邮箱已被使用");
        }

        // 设置默认密码并加密
        user.setPassword(passwordEncoder.encode("123456"));
        // 默认启用状态
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        // 分配角色
        if (roleIds != null && !roleIds.isEmpty()) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
            user.setRoles(roles);
        }

        User saved = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("username", saved.getUsername());

        return ApiResponse.success("用户创建成功", result);
    }

    /**
     * 更新用户信息
     * 
     * 可更新字段：
     * - 真实姓名
     * - 邮箱
     * - 电话
     * - 状态
     * - 角色分配
     * 
     * 注意：用户名和密码不可通过此方法修改
     * 
     * @param id      用户ID
     * @param user    更新的用户信息
     * @param roleIds 新的角色ID列表
     * @return 更新结果
     */
    @Transactional
    public ApiResponse<Void> updateUser(Long id, User user, List<Long> roleIds) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 检查邮箱是否被其他用户使用
        if (user.getEmail() != null && !user.getEmail().equals(existing.getEmail())
                && userRepository.existsByEmail(user.getEmail())) {
            return ApiResponse.error(400, "邮箱已被使用");
        }

        // 更新用户信息
        existing.setRealName(user.getRealName());
        existing.setEmail(user.getEmail());
        existing.setPhone(user.getPhone());
        existing.setStatus(user.getStatus());
        existing.setUpdateTime(LocalDateTime.now());

        // 更新角色分配
        if (roleIds != null) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
            existing.setRoles(roles);
        }

        userRepository.save(existing);
        return ApiResponse.success("用户更新成功", null);
    }

    /**
     * 删除用户
     * 
     * 安全考虑：
     * - 物理删除用户记录
     * - 同时删除用户与角色的关联关系
     * - 建议：生产环境可考虑改为逻辑删除
     * 
     * @param id 用户ID
     * @return 删除结果
     */
    @Transactional
    public ApiResponse<Void> deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        userRepository.delete(user);
        return ApiResponse.success("用户删除成功", null);
    }

    /**
     * 重置用户密码
     * 
     * 业务规则：
     * - 将密码重置为默认值"123456"
     * - 用户下次登录后应提示修改密码
     * 
     * @param id 用户ID
     * @return 重置结果
     */
    @Transactional
    public ApiResponse<Void> resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode("123456"));
        user.setUpdateTime(LocalDateTime.now());
        userRepository.save(user);

        return ApiResponse.success("密码重置成功", null);
    }

    /**
     * 修改用户状态（启用/禁用）
     * 
     * 使用场景：
     * - 临时禁用用户账户
     * - 重新启用已禁用的账户
     * 
     * @param id     用户ID
     * @param status 目标状态（0-禁用，1-启用）
     * @return 修改结果
     */
    @Transactional
    public ApiResponse<Void> updateUserStatus(Long id, Integer status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.setStatus(status);
        user.setUpdateTime(LocalDateTime.now());
        userRepository.save(user);

        String message = status == 1 ? "用户已启用" : "用户已禁用";
        return ApiResponse.success(message, null);
    }
}
