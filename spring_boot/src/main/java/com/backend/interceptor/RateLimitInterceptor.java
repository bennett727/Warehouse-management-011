package com.backend.interceptor;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.backend.config.RateLimitConfig;
import com.backend.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.github.resilience4j.ratelimiter.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * API限流拦截器
 * 
 * 功能说明：
 * 拦截HTTP请求，执行限流检查
 * 
 * 限流策略：
 * 1. 全局限流：所有请求先经过全局限流检查
 * 2. 接口级限流：根据请求路径进行限流
 * 3. 用户级限流：根据用户ID进行限流
 * 
 * 限流响应：
 * - 429 Too Many Requests
 * - 返回JSON格式的错误信息
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitConfig rateLimitConfig;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestUri = request.getRequestURI();
        String clientIp = getClientIp(request);
        
        log.debug("限流检查: uri={}, ip={}", requestUri, clientIp);

        // 1. 全局限流检查
        if (!checkGlobalRateLimit(response)) {
            return false;
        }

        // 2. 接口级限流检查
        if (!checkApiRateLimit(requestUri, response)) {
            return false;
        }

        // 3. 用户级限流检查（如果已登录）
        Long userId = getCurrentUserId(request);
        if (userId != null && !checkUserRateLimit(userId, response)) {
            return false;
        }

        return true;
    }

    /**
     * 检查全局限流
     * 
     * @param response HTTP响应
     * @return true表示通过检查
     */
    private boolean checkGlobalRateLimit(HttpServletResponse response) throws IOException {
        RateLimiter globalLimiter = rateLimitConfig.getGlobalRateLimiter();
        
        if (!globalLimiter.acquirePermission()) {
            log.warn("全局限流触发");
            sendRateLimitResponse(response, "系统繁忙，请稍后再试");
            return false;
        }
        
        return true;
    }

    /**
     * 检查接口级限流
     * 
     * @param requestUri 请求URI
     * @param response HTTP响应
     * @return true表示通过检查
     */
    private boolean checkApiRateLimit(String requestUri, HttpServletResponse response) throws IOException {
        // 跳过某些不需要限流的路径
        if (isExcludedPath(requestUri)) {
            return true;
        }

        RateLimiter apiLimiter = rateLimitConfig.getApiRateLimiter(requestUri);
        
        if (!apiLimiter.acquirePermission()) {
            log.warn("接口限流触发: uri={}", requestUri);
            sendRateLimitResponse(response, "该接口请求过于频繁，请稍后再试");
            return false;
        }
        
        return true;
    }

    /**
     * 检查用户级限流
     * 
     * @param userId 用户ID
     * @param response HTTP响应
     * @return true表示通过检查
     */
    private boolean checkUserRateLimit(Long userId, HttpServletResponse response) throws IOException {
        RateLimiter userLimiter = rateLimitConfig.getUserRateLimiter(userId);
        
        if (!userLimiter.acquirePermission()) {
            log.warn("用户限流触发: userId={}", userId);
            sendRateLimitResponse(response, "您的请求过于频繁，请稍后再试");
            return false;
        }
        
        return true;
    }

    /**
     * 发送限流响应
     * 
     * @param response HTTP响应
     * @param message 提示信息
     */
    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);  // Too Many Requests
        response.setContentType("application/json;charset=UTF-8");
        
        ApiResponse<?> apiResponse = ApiResponse.error(429, message);
        String jsonResponse = objectMapper.writeValueAsString(apiResponse);
        
        response.getWriter().write(jsonResponse);
    }

    /**
     * 判断是否是不需要限流的路径
     * 
     * @param requestUri 请求URI
     * @return true表示不需要限流
     */
    private boolean isExcludedPath(String requestUri) {
        // 健康检查、静态资源等不需要限流
        return requestUri.startsWith("/actuator") ||
               requestUri.startsWith("/health") ||
               requestUri.startsWith("/swagger") ||
               requestUri.startsWith("/api-docs") ||
               requestUri.startsWith("/webjars") ||
               requestUri.endsWith(".js") ||
               requestUri.endsWith(".css") ||
               requestUri.endsWith(".png") ||
               requestUri.endsWith(".ico");
    }

    /**
     * 获取客户端IP
     * 
     * @param request HTTP请求
     * @return 客户端IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理情况，取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    /**
     * 获取当前用户ID
     * 
     * @param request HTTP请求
     * @return 用户ID，未登录返回null
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        // 从请求属性中获取用户ID（由JWT过滤器设置）
        Object userId = request.getAttribute("userId");
        if (userId instanceof Long) {
            return (Long) userId;
        }
        return null;
    }
}
