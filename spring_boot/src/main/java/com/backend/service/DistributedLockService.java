package com.backend.service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import com.backend.common.ErrorCode;
import com.backend.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = true)
public class DistributedLockService {

    private final StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "lock:";
    private static final long DEFAULT_EXPIRE_TIME = 30;
    private static final long DEFAULT_WAIT_TIME = 10;

    public String tryLock(String lockKey, long expireTime) {
        String key = LOCK_PREFIX + lockKey;
        String requestId = UUID.randomUUID().toString();

        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, requestId, expireTime, TimeUnit.SECONDS);

        if (Boolean.TRUE.equals(success)) {
            log.debug("获取锁成功: key={}, requestId={}", key, requestId);
            return requestId;
        }

        log.debug("获取锁失败: key={}", key);
        return null;
    }

    public String tryLock(String lockKey) {
        return tryLock(lockKey, DEFAULT_EXPIRE_TIME);
    }

    public String lock(String lockKey, long waitTime, long expireTime) throws InterruptedException {
        String requestId = UUID.randomUUID().toString();
        String key = LOCK_PREFIX + lockKey;

        long endTime = System.currentTimeMillis() + waitTime * 1000;

        while (System.currentTimeMillis() < endTime) {
            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, requestId, expireTime, TimeUnit.SECONDS);

            if (Boolean.TRUE.equals(success)) {
                log.debug("获取锁成功: key={}, requestId={}", key, requestId);
                return requestId;
            }

            Thread.sleep(100);
        }

        log.warn("获取锁超时: key={}", key);
        return null;
    }

    public String lock(String lockKey, long expireTime) throws InterruptedException {
        return lock(lockKey, DEFAULT_WAIT_TIME, expireTime);
    }

    public boolean unlock(String lockKey, String requestId) {
        String key = LOCK_PREFIX + lockKey;

        String luaScript = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "    return redis.call('del', KEYS[1]) " +
                "else " +
                "    return 0 " +
                "end";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(luaScript);
        redisScript.setResultType(Long.class);

        Long result = redisTemplate.execute(redisScript,
                java.util.Collections.singletonList(key),
                requestId);

        boolean success = result != null && result > 0;
        if (success) {
            log.debug("释放锁成功: key={}, requestId={}", key, requestId);
        } else {
            log.warn("释放锁失败: key={}, requestId={}", key, requestId);
        }

        return success;
    }

    public boolean renewLock(String lockKey, String requestId, long expireTime) {
        String key = LOCK_PREFIX + lockKey;

        String luaScript = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "    return redis.call('expire', KEYS[1], ARGV[2]) " +
                "else " +
                "    return 0 " +
                "end";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(luaScript);
        redisScript.setResultType(Long.class);

        Long result = redisTemplate.execute(redisScript,
                java.util.Collections.singletonList(key),
                requestId,
                String.valueOf(expireTime));

        boolean success = result != null && result > 0;
        if (success) {
            log.debug("续期锁成功: key={}, requestId={}, expireTime={}", key, requestId, expireTime);
        }

        return success;
    }

    public <T> T executeWithLock(String lockKey, Supplier<T> supplier) {
        String requestId = tryLock(lockKey);

        if (requestId == null) {
            throw new BusinessException(ErrorCode.LOCK_ACQUIRE_FAILED);
        }

        try {
            return supplier.get();
        } finally {
            unlock(lockKey, requestId);
        }
    }

    public <T> T executeWithLock(String lockKey, long waitTime, Supplier<T> supplier) throws InterruptedException {
        String requestId = lock(lockKey, waitTime, DEFAULT_EXPIRE_TIME);

        if (requestId == null) {
            throw new BusinessException(ErrorCode.LOCK_ACQUIRE_TIMEOUT);
        }

        try {
            return supplier.get();
        } finally {
            unlock(lockKey, requestId);
        }
    }

    public boolean isLocked(String lockKey) {
        String key = LOCK_PREFIX + lockKey;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public Long getLockTtl(String lockKey) {
        String key = LOCK_PREFIX + lockKey;
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }
}