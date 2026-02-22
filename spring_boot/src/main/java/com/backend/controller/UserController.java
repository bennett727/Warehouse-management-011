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
import com.backend.entity.User;
import com.backend.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 用户管理控制器
 * 提供用户查询、创建、更新、删除等操作
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户的增删改查等接口")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "获取用户列表", description = "查询用户信息，支持关键词搜索和状态筛选")
    public ApiResponse<PageResult<Map<String, Object>>> getUserList(
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态（0-禁用，1-启用）") @RequestParam(required = false) Integer status,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return userService.getUserList(keyword, status, pageable);
    }

    private Pageable buildPageable(PageRequest pageReq) {
        if (pageReq.getSort() != null && !pageReq.getSort().isEmpty()) {
            org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(pageReq.getValidOrder())
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;
            return org.springframework.data.domain.PageRequest.of(
                    pageReq.getJpaPage(), pageReq.getSafeSize(),
                    org.springframework.data.domain.Sort.by(direction, pageReq.getSort()));
        }
        return org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(), pageReq.getSafeSize());
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> createUser(@RequestBody Map<String, Object> request) {
        User user = new User();
        user.setUsername((String) request.get("username"));
        user.setRealName((String) request.get("realName"));
        user.setEmail((String) request.get("email"));
        user.setPhone((String) request.get("phone"));
        @SuppressWarnings("unchecked")
        List<Long> roleIds = (List<Long>) request.get("roleIds");
        return userService.createUser(user, roleIds);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        User user = new User();
        user.setId(id);
        user.setRealName((String) request.get("realName"));
        user.setEmail((String) request.get("email"));
        user.setPhone((String) request.get("phone"));
        @SuppressWarnings("unchecked")
        List<Long> roleIds = (List<Long>) request.get("roleIds");
        return userService.updateUser(id, user, roleIds);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        return userService.updateUserStatus(id, status);
    }

    @PutMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable Long id) {
        return userService.resetPassword(id);
    }
}
