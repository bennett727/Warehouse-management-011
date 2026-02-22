package com.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC配置类
 *
 * 功能说明：
 * 配置Spring MVC相关功能，包括：
 * - 跨域配置（CORS）
 * - 资源映射
 * - 消息转换器
 *
 * 安全说明：
 * - CORS配置只允许特定域名访问，防止跨域攻击
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 配置跨域访问
     *
     * @param registry CORS注册表
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "X-Request-Id")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * 配置静态资源处理器
     *
     * 优化记录：
     * - 2026-02-11: 添加静态资源映射配置，解决报表资源404问题
     *
     * @param registry 资源处理器注册表
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源映射，确保报表API不会被误认为是静态资源请求
        // 所有API请求都应该由Controller处理，而不是静态资源处理器
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}
