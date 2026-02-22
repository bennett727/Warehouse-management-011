package com.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.config.MeterFilter;
import io.micrometer.prometheus.PrometheusMeterRegistry;
import lombok.extern.slf4j.Slf4j;

/**
 * 性能监控指标配置类
 * 
 * 功能说明：
 * 配置Micrometer指标收集和Prometheus导出
 * 
 * 监控指标：
 * - HTTP请求指标：响应时间、请求次数、错误率
 * - 数据库指标：查询时间、连接池状态
 * - JVM指标：内存使用、GC情况、线程状态
 * - 业务指标：设备数量、订单统计
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Configuration
public class MetricsConfig {

    /**
     * 配置Timed切面，支持@Timed注解
     * 
     * @param registry 指标注册表
     * @return TimedAspect实例
     */
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        log.info("初始化TimedAspect，支持@Timed注解性能监控");
        return new TimedAspect(registry);
    }

    /**
     * 配置指标过滤器
     * 排除敏感端点的指标收集
     * 
     * @return MeterFilter实例
     */
    @Bean
    public MeterFilter meterFilter() {
        return MeterFilter.deny(id -> {
            String uri = id.getTag("uri");
            // 排除敏感端点和静态资源
            return uri != null && (
                uri.startsWith("/actuator") ||
                uri.startsWith("/swagger") ||
                uri.startsWith("/api-docs") ||
                uri.startsWith("/webjars") ||
                uri.endsWith(".js") ||
                uri.endsWith(".css") ||
                uri.endsWith(".png") ||
                uri.endsWith(".ico")
            );
        });
    }

    /**
     * 配置Prometheus注册表
     * 
     * @return PrometheusMeterRegistry实例
     */
    @Bean
    public PrometheusMeterRegistry prometheusMeterRegistry() {
        log.info("初始化Prometheus指标注册表");
        return new PrometheusMeterRegistry(io.micrometer.prometheus.PrometheusConfig.DEFAULT);
    }
}
