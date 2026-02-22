package com.backend.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;

/**
 * Redis缓存配置类
 *
 * 功能说明：
 * 配置Spring Cache与Redis的集成，实现多级缓存策略
 * 主要功能：
 * 1. 配置RedisTemplate
 * 2. 配置CacheManager
 * 3. 定义不同缓存区域的过期时间
 * 4. 配置JSON序列化
 *
 * 缓存策略：
 * - device: 设备缓存，10分钟过期
 * - deviceType: 设备类型缓存，30分钟过期
 * - area: 区域缓存，1小时过期
 * - inventory: 库存缓存，5分钟过期
 * - user: 用户缓存，30分钟过期
 * - permission: 权限缓存，1小时过期
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Configuration
@EnableCaching(proxyTargetClass = true)
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = false)
public class CacheConfig {

    /**
     * 缓存名称常量
     */
    public static final String CACHE_DEVICE = "device";
    public static final String CACHE_DEVICE_TYPE = "deviceType";
    public static final String CACHE_AREA = "area";
    public static final String CACHE_INVENTORY = "inventory";
    public static final String CACHE_USER = "user";
    public static final String CACHE_PERMISSION = "permission";
    public static final String CACHE_STOCK_ORDER = "stockOrder";
    public static final String CACHE_SUPPLIER = "supplier";
    public static final String CACHE_BATCH = "batch";
    public static final String CACHE_DEVICE_STATUS_RULE = "deviceStatusRule";

    /**
     * 配置RedisTemplate
     *
     * 功能：配置用于操作Redis的模板
     * 序列化：使用String序列化key，JSON序列化value
     *
     * @param connectionFactory Redis连接工厂
     * @return RedisTemplate
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Key序列化器
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Value序列化器 - 使用JSON
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * 配置CacheManager
     *
     * 功能：配置Spring Cache管理器
     * 特点：
     * 1. 支持不同缓存区域的不同过期时间
     * 2. 使用JSON序列化
     * 3. 禁止缓存null值
     *
     * @param connectionFactory Redis连接工厂
     * @return CacheManager
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // 默认缓存配置
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10)) // 默认10分钟过期
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues(); // 禁止缓存null值

        // 不同缓存区域的配置
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // 设备缓存 - 10分钟
        cacheConfigurations.put(CACHE_DEVICE, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // 设备类型缓存 - 30分钟（变化较少）
        cacheConfigurations.put(CACHE_DEVICE_TYPE, defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // 区域缓存 - 1小时（几乎不变）
        cacheConfigurations.put(CACHE_AREA, defaultConfig.entryTtl(Duration.ofHours(1)));

        // 库存缓存 - 5分钟（变化频繁）
        cacheConfigurations.put(CACHE_INVENTORY, defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // 用户缓存 - 30分钟
        cacheConfigurations.put(CACHE_USER, defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // 权限缓存 - 1小时
        cacheConfigurations.put(CACHE_PERMISSION, defaultConfig.entryTtl(Duration.ofHours(1)));

        // 库存订单缓存 - 10分钟
        cacheConfigurations.put(CACHE_STOCK_ORDER, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // 供应商缓存 - 30分钟
        cacheConfigurations.put(CACHE_SUPPLIER, defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // 批次缓存 - 10分钟
        cacheConfigurations.put(CACHE_BATCH, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // 设备状态规则缓存 - 30分钟（变化较少）
        cacheConfigurations.put(CACHE_DEVICE_STATUS_RULE, defaultConfig.entryTtl(Duration.ofMinutes(30)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }
}
