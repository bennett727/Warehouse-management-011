package com.backend.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;

import lombok.extern.slf4j.Slf4j;

/**
 * Redis缓存配置类
 * 
 * 功能说明：
 * 配置Redis缓存管理器和缓存策略
 * 
 * 缓存策略：
 * - 设备列表：5分钟
 * - 设备详情：10分钟
 * - 设备类型：30分钟
 * - 统计数据：15分钟
 * - 字典数据：60分钟
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Configuration
@EnableCaching
public class RedisCacheConfig {

    /**
     * 缓存名称常量
     */
    public static final String CACHE_DEVICE_LIST = "device:list";
    public static final String CACHE_DEVICE_DETAIL = "device:detail";
    public static final String CACHE_DEVICE_TYPE = "device:type";
    public static final String CACHE_DEVICE_STATS = "device:stats";
    public static final String CACHE_AREA_LIST = "area:list";
    public static final String CACHE_WAREHOUSE_LIST = "warehouse:list";
    public static final String CACHE_DICT_DATA = "dict:data";
    public static final String CACHE_USER_INFO = "user:info";

    /**
     * 配置Redis缓存管理器
     * 
     * @param connectionFactory Redis连接工厂
     * @return CacheManager实例
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        log.info("初始化Redis缓存管理器");

        // 配置默认缓存
        RedisCacheConfiguration defaultConfig = createDefaultCacheConfig();

        // 配置特定缓存的过期时间
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // 设备列表缓存 - 5分钟
        cacheConfigurations.put(CACHE_DEVICE_LIST,
                createCacheConfig(Duration.ofMinutes(5)));

        // 设备详情缓存 - 10分钟
        cacheConfigurations.put(CACHE_DEVICE_DETAIL,
                createCacheConfig(Duration.ofMinutes(10)));

        // 设备类型缓存 - 30分钟
        cacheConfigurations.put(CACHE_DEVICE_TYPE,
                createCacheConfig(Duration.ofMinutes(30)));

        // 设备统计缓存 - 15分钟
        cacheConfigurations.put(CACHE_DEVICE_STATS,
                createCacheConfig(Duration.ofMinutes(15)));

        // 区域列表缓存 - 30分钟
        cacheConfigurations.put(CACHE_AREA_LIST,
                createCacheConfig(Duration.ofMinutes(30)));

        // 仓库列表缓存 - 30分钟
        cacheConfigurations.put(CACHE_WAREHOUSE_LIST,
                createCacheConfig(Duration.ofMinutes(30)));

        // 字典数据缓存 - 60分钟
        cacheConfigurations.put(CACHE_DICT_DATA,
                createCacheConfig(Duration.ofMinutes(60)));

        // 用户信息缓存 - 20分钟
        cacheConfigurations.put(CACHE_USER_INFO,
                createCacheConfig(Duration.ofMinutes(20)));

        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();

        log.info("Redis缓存管理器初始化完成，配置了 {} 个缓存", cacheConfigurations.size());
        return cacheManager;
    }

    /**
     * 创建默认缓存配置
     * 
     * @return RedisCacheConfiguration实例
     */
    private RedisCacheConfiguration createDefaultCacheConfig() {
        return createCacheConfig(Duration.ofMinutes(10));
    }

    /**
     * 创建缓存配置
     * 
     * @param ttl 过期时间
     * @return RedisCacheConfiguration实例
     */
    private RedisCacheConfiguration createCacheConfig(Duration ttl) {
        // 配置ObjectMapper以支持类型信息
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();
    }
}
