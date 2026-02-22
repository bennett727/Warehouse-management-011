package com.backend.service.cache;

import java.util.Collection;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 缓存服务（Redis实现）
 * 
 * 功能说明：
 * 提供统一的缓存操作接口，基于Redis实现
 * 
 * 支持功能：
 * - 基本的缓存CRUD操作
 * - 缓存过期时间设置
 * - 缓存批量操作
 * - 缓存统计信息
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(RedisTemplate.class)
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = false)
public class CacheService implements CacheOperations {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 设置缓存
     * 
     * @param key   缓存键
     * @param value 缓存值
     */
    public void set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            log.debug("设置缓存: key={}", key);
        } catch (Exception e) {
            log.error("设置缓存失败: key={}", key, e);
        }
    }

    /**
     * 设置缓存（带过期时间）
     * 
     * @param key     缓存键
     * @param value   缓存值
     * @param timeout 过期时间
     * @param unit    时间单位
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
            log.debug("设置缓存: key={}, timeout={} {}", key, timeout, unit);
        } catch (Exception e) {
            log.error("设置缓存失败: key={}", key, e);
        }
    }

    /**
     * 获取缓存
     * 
     * @param key 缓存键
     * @return 缓存值
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            log.debug("获取缓存: key={}, hit={}", key, value != null);
            return (T) value;
        } catch (Exception e) {
            log.error("获取缓存失败: key={}", key, e);
            return null;
        }
    }

    /**
     * 删除缓存
     * 
     * @param key 缓存键
     * @return true表示删除成功
     */
    @Override
    public Boolean delete(String key) {
        try {
            Boolean result = redisTemplate.delete(key);
            log.debug("删除缓存: key={}", key);
            return result;
        } catch (Exception e) {
            log.error("删除缓存失败: key={}", key, e);
            return false;
        }
    }

    /**
     * 批量删除缓存
     * 
     * @param keys 缓存键集合
     * @return 删除的缓存数量
     */
    public long delete(Collection<String> keys) {
        try {
            Long count = redisTemplate.delete(keys);
            log.debug("批量删除缓存: count={}, keys={}", count, keys);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("批量删除缓存失败", e);
            return 0;
        }
    }

    /**
     * 判断缓存是否存在
     * 
     * @param key 缓存键
     * @return true表示存在
     */
    @Override
    public Boolean hasKey(String key) {
        try {
            Boolean result = redisTemplate.hasKey(key);
            return result;
        } catch (Exception e) {
            log.error("检查缓存存在失败: key={}", key, e);
            return false;
        }
    }

    /**
     * 设置缓存过期时间
     * 
     * @param key     缓存键
     * @param timeout 过期时间
     * @param unit    时间单位
     * @return true表示设置成功
     */
    @Override
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        try {
            Boolean result = redisTemplate.expire(key, timeout, unit);
            return result;
        } catch (Exception e) {
            log.error("设置缓存过期时间失败: key={}", key, e);
            return false;
        }
    }

    /**
     * 获取缓存过期时间
     * 
     * @param key 缓存键
     * @return 过期时间（秒）
     */
    public Long getExpire(String key) {
        try {
            return redisTemplate.getExpire(key);
        } catch (Exception e) {
            log.error("获取缓存过期时间失败: key={}", key, e);
            return null;
        }
    }

    /**
     * 根据模式匹配获取缓存键
     * 
     * @param pattern 匹配模式
     * @return 缓存键集合
     */
    public Set<String> keys(String pattern) {
        try {
            return redisTemplate.keys(pattern);
        } catch (Exception e) {
            log.error("获取缓存键失败: pattern={}", pattern, e);
            return null;
        }
    }

    /**
     * 清空所有缓存
     */
    public void clear() {
        try {
            redisTemplate.getConnectionFactory()
                    .getConnection()
                    .flushDb();
            log.info("清空所有缓存");
        } catch (Exception e) {
            log.error("清空缓存失败", e);
        }
    }

    @Override
    public void deleteByPattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("按模式删除缓存: pattern={}, count={}", pattern, keys.size());
            }
        } catch (Exception e) {
            log.error("按模式删除缓存失败: pattern={}", pattern, e);
        }
    }

    @Override
    public Long increment(String key, long delta) {
        try {
            return redisTemplate.opsForValue().increment(key, delta);
        } catch (Exception e) {
            log.error("缓存自增失败: key={}", key, e);
            return null;
        }
    }

    @Override
    public Long decrement(String key, long delta) {
        try {
            return redisTemplate.opsForValue().decrement(key, delta);
        } catch (Exception e) {
            log.error("缓存自减失败: key={}", key, e);
            return null;
        }
    }

    @Override
    public long size() {
        try {
            Long size = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .dbSize();
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("获取缓存大小失败", e);
            return 0;
        }
    }

    /**
     * 获取缓存统计信息
     * 
     * @return 统计信息
     */
    public CacheStats getStats() {
        try {
            CacheStats stats = new CacheStats();
            Set<String> keys = redisTemplate.keys("*");
            stats.setTotalKeys(keys != null ? keys.size() : 0);
            return stats;
        } catch (Exception e) {
            log.error("获取缓存统计信息失败", e);
            return new CacheStats();
        }
    }

    /**
     * 缓存统计信息类
     */
    public static class CacheStats {
        private int totalKeys;
        private long usedMemory;
        private long maxMemory;
        private double hitRate;

        public int getTotalKeys() {
            return totalKeys;
        }

        public void setTotalKeys(int totalKeys) {
            this.totalKeys = totalKeys;
        }

        public long getUsedMemory() {
            return usedMemory;
        }

        public void setUsedMemory(long usedMemory) {
            this.usedMemory = usedMemory;
        }

        public long getMaxMemory() {
            return maxMemory;
        }

        public void setMaxMemory(long maxMemory) {
            this.maxMemory = maxMemory;
        }

        public double getHitRate() {
            return hitRate;
        }

        public void setHitRate(double hitRate) {
            this.hitRate = hitRate;
        }
    }
}
