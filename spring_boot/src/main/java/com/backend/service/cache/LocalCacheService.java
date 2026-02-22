package com.backend.service.cache;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 本地缓存服务
 *
 * 功能说明：
 * 当Redis不可用时，提供本地内存缓存作为备选方案
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@Primary
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false", matchIfMissing = true)
public class LocalCacheService implements CacheOperations {

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @Override
    public void set(String key, Object value) {
        cache.put(key, new CacheEntry(value, null));
        log.debug("本地缓存设置: key={}", key);
    }

    @Override
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        long expireTime = System.currentTimeMillis() + unit.toMillis(timeout);
        cache.put(key, new CacheEntry(value, expireTime));
        log.debug("本地缓存设置: key={}, 过期时间={}ms", key, unit.toMillis(timeout));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return null;
        }

        if (entry.expireTime != null && System.currentTimeMillis() > entry.expireTime) {
            cache.remove(key);
            return null;
        }

        return (T) entry.value;
    }

    @Override
    public Boolean delete(String key) {
        return cache.remove(key) != null;
    }

    @Override
    public Boolean hasKey(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return false;
        }

        if (entry.expireTime != null && System.currentTimeMillis() > entry.expireTime) {
            cache.remove(key);
            return false;
        }

        return true;
    }

    @Override
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return false;
        }

        entry.expireTime = System.currentTimeMillis() + unit.toMillis(timeout);
        return true;
    }

    @Override
    public Long getExpire(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null || entry.expireTime == null) {
            return -1L;
        }

        long remaining = entry.expireTime - System.currentTimeMillis();
        return remaining > 0 ? remaining : -2L;
    }

    @Override
    public Set<String> keys(String pattern) {
        return cache.keySet();
    }

    @Override
    public void deleteByPattern(String pattern) {
        cache.keySet().removeIf(key -> key.matches(pattern.replace("*", ".*")));
    }

    @Override
    public Long increment(String key, long delta) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            cache.put(key, new CacheEntry(delta, null));
            return delta;
        }

        if (entry.value instanceof Number) {
            long newValue = ((Number) entry.value).longValue() + delta;
            entry.value = newValue;
            return newValue;
        }

        throw new IllegalArgumentException("缓存值不是数字类型");
    }

    @Override
    public Long decrement(String key, long delta) {
        return increment(key, -delta);
    }

    @Override
    public void clear() {
        cache.clear();
        log.info("本地缓存已清空");
    }

    @Override
    public long size() {
        return cache.size();
    }

    public void cleanupExpired() {
        long now = System.currentTimeMillis();
        cache.entrySet().removeIf(entry -> entry.getValue().expireTime != null && now > entry.getValue().expireTime);
    }

    private static class CacheEntry {
        Object value;
        Long expireTime;

        CacheEntry(Object value, Long expireTime) {
            this.value = value;
            this.expireTime = expireTime;
        }
    }
}
