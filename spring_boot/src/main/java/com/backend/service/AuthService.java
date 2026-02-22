package com.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.dto.request.LoginRequest;
import com.backend.entity.User;
import com.backend.exception.BusinessException;
import com.backend.repository.UserRepository;
import com.backend.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Map<String, Object>> login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(request.getUsername());

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("用户不存在"));

            user.setLastLoginTime(LocalDateTime.now());
            userRepository.save(user);

            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", accessToken);
            result.put("refreshToken", refreshToken);
            result.put("tokenType", "Bearer");
            result.put("expiresIn", jwtTokenProvider.getExpirationTime(accessToken) / 1000);

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("realName", user.getRealName());
            userInfo.put("email", user.getEmail());
            userInfo.put("phone", user.getPhone());
            userInfo.put("avatar", user.getAvatar());
            userInfo.put("roles", user.getRoles().stream()
                    .map(r -> r.getRoleCode().toUpperCase())
                    .collect(Collectors.toList()));

            result.put("userInfo", userInfo);

            return ApiResponse.success("登录成功", result);
        } catch (BadCredentialsException e) {
            return ApiResponse.error(401, "用户名或密码错误");
        } catch (Exception e) {
            log.error("登录失败", e);
            return ApiResponse.error("登录失败: " + e.getMessage());
        }
    }

    public ApiResponse<Void> logout() {
        SecurityContextHolder.clearContext();
        return ApiResponse.success("登出成功", null);
    }

    public ApiResponse<Map<String, Object>> refreshToken(String refreshToken) {
        try {
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                return ApiResponse.error(401, "刷新令牌无效或已过期");
            }

            String username = jwtTokenProvider.extractUsername(refreshToken);
            String newAccessToken = jwtTokenProvider.generateToken(username);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", newAccessToken);
            result.put("refreshToken", newRefreshToken);
            result.put("tokenType", "Bearer");
            result.put("expiresIn", jwtTokenProvider.getExpirationTime(newAccessToken) / 1000);

            return ApiResponse.success("刷新成功", result);
        } catch (Exception e) {
            log.error("刷新令牌失败", e);
            return ApiResponse.error(401, "刷新令牌失败");
        }
    }

    public ApiResponse<Map<String, Object>> getUserInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("realName", user.getRealName());
        userInfo.put("email", user.getEmail());
        userInfo.put("phone", user.getPhone());
        userInfo.put("avatar", user.getAvatar());
        userInfo.put("roles", user.getRoles().stream()
                .map(r -> r.getRoleCode().toUpperCase())
                .collect(Collectors.toList()));
        userInfo.put("permissions", user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getPermissionCode())
                .distinct()
                .collect(Collectors.toList()));

        return ApiResponse.success(userInfo);
    }
}
