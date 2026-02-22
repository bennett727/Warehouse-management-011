package com.backend.test.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import redis.embedded.RedisServer;

import java.io.IOException;

/**
 * 测试专用Redis配置类
 *
 * 功能说明：
 * 为测试提供嵌入式Redis服务器，无需外部Redis实例
 *
 * 特性：
 * - 自动启动嵌入式Redis服务器
 * - 配置Redis连接工厂
 * - 配置RedisTemplate
 * - 测试结束后自动关闭Redis服务器
 *
 * @author 测试开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@TestConfiguration
public class TestRedisConfiguration {

    private static RedisServer redisServer;
    private static final int REDIS_PORT = 6379;
    private static boolean isStarted = false;

    /**
     * 启动嵌入式Redis服务器
     */
    @PostConstruct
    public void startRedis() {
        if (!isStarted) {
            try {
                log.info("正在启动嵌入式Redis服务器...");
                redisServer = new RedisServer(REDIS_PORT);
                redisServer.start();
                isStarted = true;
                log.info("嵌入式Redis服务器已启动，端口: {}", REDIS_PORT);
            } catch (IOException e) {
                log.error("启动嵌入式Redis服务器失败: {}", e.getMessage(), e);
                throw new RuntimeException("无法启动嵌入式Redis服务器", e);
            }
        } else {
            log.info("嵌入式Redis服务器已在运行中");
        }
    }

    /**
     * 停止嵌入式Redis服务器
     */
    @PreDestroy
    public void stopRedis() {
        try {
            if (redisServer != null && redisServer.isActive()) {
                log.info("正在停止嵌入式Redis服务器...");
                redisServer.stop();
                isStarted = false;
                log.info("嵌入式Redis服务器已停止");
            }
        } catch (Exception e) {
            log.warn("停止嵌入式Redis服务器时发生异常: {}", e.getMessage());
        }
    }

    /**
     * 配置Redis连接工厂
     *
     * @return RedisConnectionFactory实例
     */
    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        LettuceConnectionFactory factory = new LettuceConnectionFactory("localhost", REDIS_PORT);
        factory.afterPropertiesSet();
        log.info("RedisConnectionFactory已配置，连接到localhost:{}", REDIS_PORT);
        return factory;
    }

    /**
     * 配置RedisTemplate
     *
     * @param connectionFactory Redis连接工厂
     * @return RedisTemplate实例
     */
    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 设置键的序列化器
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // 设置值的序列化器
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        log.info("RedisTemplate已配置完成");
        return template;
    }

    /**
     * 配置StringRedisTemplate
     *
     * @param connectionFactory Redis连接工厂
     * @return StringRedisTemplate实例
     */
    @Bean
    @Primary
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(connectionFactory);
        template.afterPropertiesSet();
        log.info("StringRedisTemplate已配置完成");
        return template;
    }
}
