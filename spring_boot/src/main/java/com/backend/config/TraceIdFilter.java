package com.backend.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.UUID;

/**
 * 链路追踪过滤器
 *
 * 功能说明：
 * 为每个请求生成或传递TraceId，用于分布式链路追踪
 *
 * TraceId传递方式：
 * 1. 从请求头 X-Trace-Id 获取（支持上游服务传递）
 * 2. 自动生成新的TraceId
 *
 * MDC上下文：
 * - traceId: 链路追踪ID
 * - userId: 当前用户ID（如果已登录）
 * - requestUri: 请求URI
 * - clientIp: 客户端IP地址
 *
 * 日志格式配置：
 * 在logback-spring.xml中使用 %X{traceId} 输出
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter implements Filter {

    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String TRACE_ID_MDC_KEY = "traceId";
    public static final String USER_ID_MDC_KEY = "userId";
    public static final String REQUEST_URI_MDC_KEY = "requestUri";
    public static final String CLIENT_IP_MDC_KEY = "clientIp";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        try {
            String traceId = getOrGenerateTraceId(httpRequest);
            MDC.put(TRACE_ID_MDC_KEY, traceId);

            httpResponse.setHeader(TRACE_ID_HEADER, traceId);

            MDC.put(REQUEST_URI_MDC_KEY, httpRequest.getRequestURI());

            String clientIp = getClientIp(httpRequest);
            MDC.put(CLIENT_IP_MDC_KEY, clientIp);

            String userId = extractUserId(httpRequest);
            if (StringUtils.hasText(userId)) {
                MDC.put(USER_ID_MDC_KEY, userId);
            }

            chain.doFilter(request, response);

        } finally {
            MDC.remove(TRACE_ID_MDC_KEY);
            MDC.remove(USER_ID_MDC_KEY);
            MDC.remove(REQUEST_URI_MDC_KEY);
            MDC.remove(CLIENT_IP_MDC_KEY);
        }
    }

    @Override
    public void destroy() {
    }

    private String getOrGenerateTraceId(HttpServletRequest request) {
        String traceId = request.getHeader(TRACE_ID_HEADER);

        if (!StringUtils.hasText(traceId)) {
            traceId = request.getHeader("X-Request-Id");
        }

        if (!StringUtils.hasText(traceId)) {
            traceId = generateTraceId();
        }

        return traceId;
    }

    private String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (isValidIp(ip)) {
            if (ip.contains(",")) {
                ip = ip.split(",")[0].trim();
            }
            return ip;
        }

        ip = request.getHeader("X-Real-IP");
        if (isValidIp(ip)) {
            return ip;
        }

        ip = request.getHeader("Proxy-Client-IP");
        if (isValidIp(ip)) {
            return ip;
        }

        ip = request.getHeader("WL-Proxy-Client-IP");
        if (isValidIp(ip)) {
            return ip;
        }

        return request.getRemoteAddr();
    }

    private boolean isValidIp(String ip) {
        return StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip);
    }

    private String extractUserId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr != null) {
            return String.valueOf(userIdAttr);
        }
        return null;
    }

    public static String getCurrentTraceId() {
        return MDC.get(TRACE_ID_MDC_KEY);
    }

    public static void setTraceId(String traceId) {
        if (StringUtils.hasText(traceId)) {
            MDC.put(TRACE_ID_MDC_KEY, traceId);
        }
    }

    public static void clearTraceId() {
        MDC.remove(TRACE_ID_MDC_KEY);
    }
}
