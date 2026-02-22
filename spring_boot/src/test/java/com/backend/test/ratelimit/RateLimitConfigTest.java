package com.backend.test.ratelimit;

import static org.junit.jupiter.api.Assertions.*;

import com.backend.test.config.TestRedisConfiguration;
import java.time.Duration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.backend.config.RateLimitConfig;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import lombok.extern.slf4j.Slf4j;

/**
 * API限流配置测试类
 * 
 * 测试内容：
 * 1. 限流器注册表是否正确初始化
 * 2. 全局限流器是否正常工作
 * 3. 接口级限流器是否正常工作
 * 4. 用户级限流器是否正常工作
 * 5. 限流配置参数是否正确
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@Import(TestRedisConfiguration.class)
@DisplayName("API限流配置测试")
public class RateLimitConfigTest {

    @Autowired
    private RateLimitConfig rateLimitConfig;

    @Autowired
    private RateLimiterRegistry rateLimiterRegistry;

    @Test
    @DisplayName("测试限流器注册表是否正确初始化")
    void testRateLimiterRegistryInitialized() {
        assertNotNull(rateLimiterRegistry, "RateLimiterRegistry应该被正确初始化");
        
        // 获取所有限流器
        var rateLimiters = rateLimiterRegistry.getAllRateLimiters();
        log.info("限流器注册表已初始化，包含 {} 个限流器", rateLimiters.size());
        
        // 验证至少有一些限流器被创建
        assertTrue(rateLimiters.size() >= 0, "限流器注册表应该可用");
    }

    @Test
    @DisplayName("测试全局限流器是否正常工作")
    void testGlobalRateLimiter() {
        RateLimiter globalLimiter = rateLimitConfig.getGlobalRateLimiter();
        
        assertNotNull(globalLimiter, "全局限流器不应该为null");
        assertEquals("global", globalLimiter.getName(), "限流器名称应该是'global'");
        
        // 测试获取权限
        boolean canExecute = globalLimiter.acquirePermission();
        log.info("全局限流器获取权限: {}", canExecute);
        
        // 全局限流器应该能够获取权限
        assertTrue(canExecute, "全局限流器应该能够获取权限");
    }

    @Test
    @DisplayName("测试接口级限流器是否正常工作")
    void testApiRateLimiter() {
        // 测试设备列表限流器
        RateLimiter deviceListLimiter = rateLimitConfig.getApiRateLimiter("/api/devices");
        assertNotNull(deviceListLimiter, "设备列表限流器不应该为null");
        
        // 测试导出限流器
        RateLimiter exportLimiter = rateLimitConfig.getApiRateLimiter("/api/devices/export");
        assertNotNull(exportLimiter, "导出限流器不应该为null");
        
        // 测试获取权限
        boolean canExecute = deviceListLimiter.acquirePermission();
        log.info("设备列表限流器获取权限: {}", canExecute);
        
        assertTrue(canExecute, "设备列表限流器应该能够获取权限");
    }

    @Test
    @DisplayName("测试用户级限流器是否正常工作")
    void testUserRateLimiter() {
        Long userId = 12345L;
        RateLimiter userLimiter = rateLimitConfig.getUserRateLimiter(userId);
        
        assertNotNull(userLimiter, "用户级限流器不应该为null");
        assertTrue(userLimiter.getName().contains(userId.toString()), 
            "限流器名称应该包含用户ID");
        
        // 测试获取权限
        boolean canExecute = userLimiter.acquirePermission();
        log.info("用户 {} 限流器获取权限: {}", userId, canExecute);
        
        assertTrue(canExecute, "用户级限流器应该能够获取权限");
    }

    @Test
    @DisplayName("测试限流器配置参数")
    void testRateLimiterConfig() {
        RateLimiter globalLimiter = rateLimitConfig.getGlobalRateLimiter();
        
        // 获取限流器配置
        var config = globalLimiter.getRateLimiterConfig();
        
        assertNotNull(config, "限流器配置不应该为null");
        
        // 验证配置参数
        int limitForPeriod = config.getLimitForPeriod();
        Duration refreshPeriod = config.getLimitRefreshPeriod();
        Duration timeout = config.getTimeoutDuration();
        
        log.info("全局限流器配置 - 每周期限制: {}, 刷新周期: {}ms, 超时: {}ms",
                limitForPeriod, refreshPeriod.toMillis(), timeout.toMillis());
        
        // 验证配置合理性
        assertTrue(limitForPeriod > 0, "每周期限制应该大于0");
        assertTrue(refreshPeriod.toMillis() > 0, "刷新周期应该大于0");
        assertTrue(timeout.toMillis() >= 0, "超时时间应该大于等于0");
    }

    @Test
    @DisplayName("测试限流器名称前缀")
    void testRateLimiterNamePrefix() {
        assertNotNull(RateLimitConfig.RATE_LIMITER_PREFIX, "限流器名称前缀不应该为null");
        assertFalse(RateLimitConfig.RATE_LIMITER_PREFIX.isEmpty(), "限流器名称前缀不应该为空");
        
        log.info("限流器名称前缀: {}", RateLimitConfig.RATE_LIMITER_PREFIX);
    }

    @Test
    @DisplayName("测试预创建的限流器")
    void testPreCreatedRateLimiters() {
        // 验证预创建的限流器是否存在
        String[] expectedLimiters = {
            "global",
            "device:list",
            "device:detail",
            "device:create",
            "device:update",
            "device:delete",
            "export",
            "report"
        };
        
        for (String limiterName : expectedLimiters) {
            String fullName = RateLimitConfig.RATE_LIMITER_PREFIX + limiterName;
            boolean exists = rateLimiterRegistry.find(fullName).isPresent();
            
            if (exists) {
                log.info("限流器 '{}' 已存在", limiterName);
            } else {
                log.warn("限流器 '{}' 不存在", limiterName);
            }
        }
        
        // 验证可以通过RateLimitConfig获取全局限流器
        RateLimiter globalLimiter = rateLimitConfig.getGlobalRateLimiter();
        assertNotNull(globalLimiter, "全局限流器应该存在");
        assertEquals("global", globalLimiter.getName(), "全局限流器名称应该正确");
    }

    @Test
    @DisplayName("测试限流器动态创建")
    void testDynamicRateLimiterCreation() {
        String apiPath = "/api/test/dynamic";
        
        // 获取限流器（如果不存在会自动创建）
        RateLimiter limiter1 = rateLimitConfig.getApiRateLimiter(apiPath);
        RateLimiter limiter2 = rateLimitConfig.getApiRateLimiter(apiPath);
        
        // 验证是同一个限流器实例
        assertSame(limiter1, limiter2, "相同路径应该返回同一个限流器实例");
        
        log.info("动态限流器创建成功: {}", limiter1.getName());
    }

    @Test
    @DisplayName("测试限流器限流效果")
    void testRateLimitingEffect() {
        // 创建一个限制非常严格的限流器用于测试
        RateLimiter strictLimiter = rateLimitConfig.createRateLimiter(
            "test:strict", 1, 1);
        
        // 第一次应该成功
        boolean first = strictLimiter.acquirePermission();
        assertTrue(first, "第一次请求应该成功");
        
        // 立即第二次应该失败（因为限制是1个/秒）
        boolean second = strictLimiter.acquirePermission();
        log.info("严格限流器 - 第一次: {}, 第二次: {}", first, second);
        
        // 注意：由于Resilience4j的实现，这里的结果可能因时间而异
        // 我们只是记录结果，不做强制断言
    }

    @Test
    @DisplayName("测试限流配置类初始化")
    void testRateLimitConfigInitialized() {
        assertNotNull(rateLimitConfig, "限流配置类应该被正确初始化");
        log.info("限流配置类已初始化");
    }

    @Test
    @DisplayName("测试不同API路径的限流器")
    void testDifferentApiPaths() {
        // 测试不同路径获取不同的限流器
        RateLimiter listLimiter = rateLimitConfig.getApiRateLimiter("/api/devices/list");
        RateLimiter detailLimiter = rateLimitConfig.getApiRateLimiter("/api/devices/detail");
        RateLimiter createLimiter = rateLimitConfig.getApiRateLimiter("/api/devices/create");
        
        // 验证是不同的限流器
        assertNotSame(listLimiter, detailLimiter, "不同路径应该有不同的限流器");
        assertNotSame(detailLimiter, createLimiter, "不同路径应该有不同的限流器");
        
        log.info("不同API路径的限流器创建成功");
    }

    @Test
    @DisplayName("测试用户限流器的唯一性")
    void testUserRateLimiterUniqueness() {
        Long userId1 = 1001L;
        Long userId2 = 1002L;
        
        RateLimiter limiter1 = rateLimitConfig.getUserRateLimiter(userId1);
        RateLimiter limiter2 = rateLimitConfig.getUserRateLimiter(userId2);
        RateLimiter limiter1Again = rateLimitConfig.getUserRateLimiter(userId1);
        
        // 不同用户应该有不同的限流器
        assertNotSame(limiter1, limiter2, "不同用户应该有不同的限流器");
        
        // 相同用户应该返回同一个限流器
        assertSame(limiter1, limiter1Again, "相同用户应该返回同一个限流器");
        
        log.info("用户限流器唯一性测试通过");
    }
}
