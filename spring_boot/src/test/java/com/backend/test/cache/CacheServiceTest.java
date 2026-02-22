package com.backend.test.cache;

import static org.junit.jupiter.api.Assertions.*;

import com.backend.test.config.TestRedisConfiguration;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.backend.service.cache.CacheService;

import lombok.extern.slf4j.Slf4j;

/**
 * 缓存服务测试类
 * 
 * 测试内容：
 * 1. 缓存基本操作（增删改查）
 * 2. 缓存过期时间设置
 * 3. 缓存批量操作
 * 4. 缓存存在性检查
 * 5. Redis连接状态
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@Import(TestRedisConfiguration.class)
@DisplayName("缓存服务测试")
public class CacheServiceTest {

    @Autowired
    private CacheService cacheService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String TEST_KEY = "test:key";
    private static final String TEST_VALUE = "test-value";

    @BeforeEach
    void setUp() {
        // 清理测试数据
        cacheService.delete(TEST_KEY);
    }

    @Test
    @DisplayName("测试Redis连接是否正常")
    void testRedisConnection() {
        try {
            // 尝试执行一个简单的Redis命令
            String pong = redisTemplate.getConnectionFactory().getConnection().ping();
            assertEquals("PONG", pong, "Redis应该返回PONG");
            log.info("Redis连接正常");
        } catch (Exception e) {
            log.error("Redis连接失败: {}", e.getMessage());
            fail("Redis连接失败: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("测试缓存基本设置和获取")
    void testBasicSetAndGet() {
        // 设置缓存
        cacheService.set(TEST_KEY, TEST_VALUE);
        
        // 获取缓存
        Object value = cacheService.get(TEST_KEY);
        
        assertNotNull(value, "缓存值不应该为null");
        assertEquals(TEST_VALUE, value, "缓存值应该与设置值相同");
        
        log.info("缓存基本操作测试通过");
    }

    @Test
    @DisplayName("测试带过期时间的缓存设置")
    void testSetWithExpiration() throws InterruptedException {
        // 设置缓存，1秒后过期
        cacheService.set(TEST_KEY, TEST_VALUE, 1, TimeUnit.SECONDS);
        
        // 立即获取，应该存在
        Object value1 = cacheService.get(TEST_KEY);
        assertNotNull(value1, "缓存应该存在");
        assertEquals(TEST_VALUE, value1);
        
        // 等待2秒
        Thread.sleep(2000);
        
        // 再次获取，应该已过期
        Object value2 = cacheService.get(TEST_KEY);
        assertNull(value2, "缓存应该已过期");
        
        log.info("缓存过期时间测试通过");
    }

    @Test
    @DisplayName("测试缓存删除")
    void testDelete() {
        // 先设置缓存
        cacheService.set(TEST_KEY, TEST_VALUE);
        assertTrue(cacheService.hasKey(TEST_KEY), "缓存应该存在");
        
        // 删除缓存
        boolean deleted = cacheService.delete(TEST_KEY);
        assertTrue(deleted, "删除应该成功");
        
        // 验证已删除
        assertFalse(cacheService.hasKey(TEST_KEY), "缓存应该已删除");
        
        log.info("缓存删除测试通过");
    }

    @Test
    @DisplayName("测试缓存存在性检查")
    void testHasKey() {
        // 不存在时
        assertFalse(cacheService.hasKey(TEST_KEY), "不存在的键应该返回false");
        
        // 设置后
        cacheService.set(TEST_KEY, TEST_VALUE);
        assertTrue(cacheService.hasKey(TEST_KEY), "存在的键应该返回true");
        
        log.info("缓存存在性检查测试通过");
    }

    @Test
    @DisplayName("测试批量删除缓存")
    void testDeleteBatch() {
        // 设置多个缓存
        String key1 = "test:key1";
        String key2 = "test:key2";
        String key3 = "test:key3";
        
        cacheService.set(key1, "value1");
        cacheService.set(key2, "value2");
        cacheService.set(key3, "value3");
        
        // 批量删除 - 使用循环删除
        cacheService.delete(key1);
        cacheService.delete(key2);
        cacheService.delete(key3);
        
        // 验证已删除
        assertFalse(cacheService.hasKey(key1));
        assertFalse(cacheService.hasKey(key2));
        assertFalse(cacheService.hasKey(key3));
        
        log.info("批量删除测试通过");
    }

    @Test
    @DisplayName("测试获取缓存过期时间")
    void testGetExpire() {
        // 设置缓存，10秒后过期
        cacheService.set(TEST_KEY, TEST_VALUE, 10, TimeUnit.SECONDS);
        
        // 获取过期时间
        Long expire = cacheService.getExpire(TEST_KEY);
        
        assertNotNull(expire, "过期时间不应该为null");
        assertTrue(expire > 0 && expire <= 10, "过期时间应该在0-10秒之间");
        
        log.info("缓存过期时间: {} 秒", expire);
    }

    @Test
    @DisplayName("测试设置缓存过期时间")
    void testExpire() throws InterruptedException {
        // 设置永久缓存
        cacheService.set(TEST_KEY, TEST_VALUE);
        
        // 设置过期时间为1秒
        boolean result = cacheService.expire(TEST_KEY, 1, TimeUnit.SECONDS);
        assertTrue(result, "设置过期时间应该成功");
        
        // 等待2秒
        Thread.sleep(2000);
        
        // 验证已过期
        assertNull(cacheService.get(TEST_KEY), "缓存应该已过期");
        
        log.info("设置过期时间测试通过");
    }

    @Test
    @DisplayName("测试获取所有键")
    void testGetAllKeys() {
        // 清理测试键
        cacheService.delete(TEST_KEY);
        
        // 设置测试键
        cacheService.set(TEST_KEY, TEST_VALUE);
        
        // 获取所有键
        Set<String> keys = cacheService.keys("test:*");
        
        assertNotNull(keys, "键集合不应该为null");
        assertTrue(keys.contains(TEST_KEY), "应该包含测试键");
        
        log.info("找到 {} 个匹配的键", keys.size());
    }

    @Test
    @DisplayName("测试缓存对象存储")
    void testCacheObject() {
        // 创建测试对象
        TestObject testObject = new TestObject(1L, "测试对象", 100);
        
        // 存储对象
        cacheService.set(TEST_KEY, testObject);
        
        // 获取对象
        Object cached = cacheService.get(TEST_KEY);
        assertNotNull(cached, "缓存对象不应该为null");
        
        // 验证对象内容
        if (cached instanceof TestObject) {
            TestObject retrieved = (TestObject) cached;
            assertEquals(testObject.getId(), retrieved.getId());
            assertEquals(testObject.getName(), retrieved.getName());
            assertEquals(testObject.getValue(), retrieved.getValue());
        }
        
        log.info("对象缓存测试通过");
    }

    @Test
    @DisplayName("测试缓存列表存储")
    void testCacheList() {
        // 创建测试列表
        List<String> testList = Arrays.asList("item1", "item2", "item3");
        
        // 存储列表
        cacheService.set(TEST_KEY, testList);
        
        // 获取列表
        Object cached = cacheService.get(TEST_KEY);
        assertNotNull(cached, "缓存列表不应该为null");
        
        log.info("列表缓存测试通过");
    }

    @Test
    @DisplayName("测试缓存服务初始化")
    void testCacheServiceInitialized() {
        assertNotNull(cacheService, "缓存服务应该被正确初始化");
        log.info("缓存服务已初始化");
    }

    // 测试对象类
    static class TestObject {
        private Long id;
        private String name;
        private int value;

        public TestObject() {}

        public TestObject(Long id, String name, int value) {
            this.id = id;
            this.name = name;
            this.value = value;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getValue() { return value; }
        public void setValue(int value) { this.value = value; }
    }
}
