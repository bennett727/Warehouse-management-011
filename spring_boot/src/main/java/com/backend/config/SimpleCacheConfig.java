package com.backend.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 简单内存缓存配置类
 * 当Redis禁用时使用ConcurrentHashMap作为缓存
 */
@Configuration
@EnableCaching(proxyTargetClass = true)
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false")
public class SimpleCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                "device", "deviceType", "area", "inventory",
                "user", "permission", "stockOrder", "supplier",
                "batch", "deviceStatusRule", "dashboard",
                "deviceQuery", "deviceStatistics", "deviceTypeStats",
                "deviceStatusStats", "inventoryStatistics", "enhancedInventoryStatistics",
                "inventoryValueStatistics", "purchaseTrendStatistics", "warrantyStatusStatistics",
                "usageYearsStatistics", "recentOutboundStats", "recentMaintenanceStats",
                "areaInventoryStatistics", "deviceTypeInventoryStatistics", "principalDeviceStatistics");
    }
}
