package com.backend.service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.backend.common.ErrorCode;
import com.backend.exception.BusinessException;

import lombok.extern.slf4j.Slf4j;

/**
 * 简单分布式锁服务（内存实现）
 * 
 * 当Redis禁用时使用本地内存锁
 * 注意：仅适用于单实例部署
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false")
public class SimpleDistributedLockService {

    private final ConcurrentHashMap<String, ReentrantLock> locks = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> lockOwners = new ConcurrentHashMap<>();

    private static final long DEFAULT_EXPIRE_TIME = 30;
    private static final long DEFAULT_WAIT_TIME = 10;

    public String tryLock(String lockKey, long expireTime) {
        String requestId = UUID.randomUUID().toString();
        ReentrantLock lock = locks.computeIfAbsent(lockKey, k -> new ReentrantLock());

        try {
            if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {
                lockOwners.put(lockKey, requestId);
                log.debug("获取锁成功: key={}, requestId={}", lockKey, requestId);
                return requestId;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        log.debug("获取锁失败: key={}", lockKey);
        return null;
    }

    public String tryLock(String lockKey) {
        return tryLock(lockKey, DEFAULT_EXPIRE_TIME);
    }

    public String lock(String lockKey, long waitTime, long expireTime) throws InterruptedException {
        String requestId = UUID.randomUUID().toString();
        ReentrantLock lock = locks.computeIfAbsent(lockKey, k -> new ReentrantLock());

        if (lock.tryLock(waitTime, TimeUnit.SECONDS)) {
            lockOwners.put(lockKey, requestId);
            log.debug("获取锁成功: key={}, requestId={}", lockKey, requestId);
            return requestId;
        }

        log.warn("获取锁超时: key={}", lockKey);
        return null;
    }

    public String lock(String lockKey, long expireTime) throws InterruptedException {
        return lock(lockKey, DEFAULT_WAIT_TIME, expireTime);
    }

    public boolean unlock(String lockKey, String requestId) {
        String owner = lockOwners.get(lockKey);
        if (owner != null && owner.equals(requestId)) {
            ReentrantLock lock = locks.get(lockKey);
            if (lock != null && lock.isHeldByCurrentThread()) {
                lock.unlock();
                lockOwners.remove(lockKey);
                log.debug("释放锁成功: key={}, requestId={}", lockKey, requestId);
                return true;
            }
        }
        log.warn("释放锁失败: key={}, requestId={}", lockKey, requestId);
        return false;
    }

    public boolean renewLock(String lockKey, String requestId, long expireTime) {
        String owner = lockOwners.get(lockKey);
        if (owner != null && owner.equals(requestId)) {
            log.debug("续期锁成功: key={}, requestId={}, expireTime={}", lockKey, requestId, expireTime);
            return true;
        }
        return false;
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
        ReentrantLock lock = locks.get(lockKey);
        return lock != null && lock.isLocked();
    }

    public Long getLockTtl(String lockKey) {
        return isLocked(lockKey) ? DEFAULT_EXPIRE_TIME : -1L;
    }
}
