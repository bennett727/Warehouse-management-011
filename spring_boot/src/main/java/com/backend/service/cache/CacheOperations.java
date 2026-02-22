package com.backend.service.cache;

import java.util.Collection;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 缓存操作接口
 *
 * 功能说明：
 * 定义统一的缓存操作接口，支持多种缓存实现
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
public interface CacheOperations {

    void set(String key, Object value);

    void set(String key, Object value, long timeout, TimeUnit unit);

    <T> T get(String key);

    Boolean delete(String key);

    Boolean hasKey(String key);

    Boolean expire(String key, long timeout, TimeUnit unit);

    Long getExpire(String key);

    Set<String> keys(String pattern);

    void deleteByPattern(String pattern);

    Long increment(String key, long delta);

    Long decrement(String key, long delta);

    void clear();

    long size();
}
