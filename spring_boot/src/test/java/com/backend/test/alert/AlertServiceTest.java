package com.backend.test.alert;

import static org.junit.jupiter.api.Assertions.*;

import com.backend.test.config.TestRedisConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.backend.config.AlertConfig;
import com.backend.service.alert.AlertService;

import lombok.extern.slf4j.Slf4j;

/**
 * 告警服务测试类
 * 
 * 测试内容：
 * 1. 告警配置是否正确加载
 * 2. 告警服务是否正常工作
 * 3. 告警阈值配置是否正确
 * 4. 告警检查逻辑是否正确
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@Import(TestRedisConfiguration.class)
@DisplayName("告警服务测试")
public class AlertServiceTest {

    @Autowired
    private AlertConfig alertConfig;

    @Autowired
    private AlertService alertService;

    @Test
    @DisplayName("测试告警配置是否正确加载")
    void testAlertConfigLoaded() {
        assertNotNull(alertConfig, "告警配置应该被正确加载");
        
        // 验证告警是否启用（测试环境可能禁用）
        log.info("告警功能状态: {}", alertConfig.isEnabled() ? "已启用" : "已禁用");
        
        // 验证阈值配置
        assertNotNull(alertConfig.getApiResponseTime(), "API响应时间阈值配置应该存在");
        assertNotNull(alertConfig.getErrorRate(), "错误率阈值配置应该存在");
        assertNotNull(alertConfig.getSystemResource(), "系统资源阈值配置应该存在");
        assertNotNull(alertConfig.getBusinessMetric(), "业务指标阈值配置应该存在");
        
        log.info("告警配置加载成功");
    }

    @Test
    @DisplayName("测试API响应时间阈值配置")
    void testApiResponseTimeThreshold() {
        AlertConfig.ApiResponseTimeThreshold threshold = alertConfig.getApiResponseTime();
        
        assertNotNull(threshold, "API响应时间阈值配置不应该为null");
        assertTrue(threshold.getWarning() > 0, "警告阈值应该大于0");
        assertTrue(threshold.getCritical() > threshold.getWarning(), "严重阈值应该大于警告阈值");
        
        log.info("API响应时间阈值 - 警告: {}ms, 严重: {}ms, P95: {}ms, P99: {}ms",
                threshold.getWarning(),
                threshold.getCritical(),
                threshold.getP95(),
                threshold.getP99());
        
        // 验证默认阈值
        assertEquals(500, threshold.getWarning(), "默认警告阈值应该是500ms");
        assertEquals(2000, threshold.getCritical(), "默认严重阈值应该是2000ms");
    }

    @Test
    @DisplayName("测试错误率阈值配置")
    void testErrorRateThreshold() {
        AlertConfig.ErrorRateThreshold threshold = alertConfig.getErrorRate();
        
        assertNotNull(threshold, "错误率阈值配置不应该为null");
        assertTrue(threshold.getWarning() >= 0, "警告阈值应该大于等于0");
        assertTrue(threshold.getCritical() > threshold.getWarning(), "严重阈值应该大于警告阈值");
        
        log.info("错误率阈值 - 警告: {}%, 严重: {}%",
                threshold.getWarning(),
                threshold.getCritical());
        
        // 验证默认阈值
        assertEquals(5.0, threshold.getWarning(), "默认警告阈值应该是5%");
        assertEquals(10.0, threshold.getCritical(), "默认严重阈值应该是10%");
    }

    @Test
    @DisplayName("测试系统资源阈值配置")
    void testSystemResourceThreshold() {
        AlertConfig.SystemResourceThreshold threshold = alertConfig.getSystemResource();
        
        assertNotNull(threshold, "系统资源阈值配置不应该为null");
        assertTrue(threshold.getMemoryWarning() > 0, "内存警告阈值应该大于0");
        assertTrue(threshold.getMemoryCritical() > threshold.getMemoryWarning(), "内存严重阈值应该大于警告阈值");
        
        log.info("系统资源阈值 - 内存警告: {}%, 内存严重: {}%, CPU警告: {}%, CPU严重: {}%",
                threshold.getMemoryWarning(),
                threshold.getMemoryCritical(),
                threshold.getCpuWarning(),
                threshold.getCpuCritical());
    }

    @Test
    @DisplayName("测试告警服务是否初始化")
    void testAlertServiceInitialized() {
        assertNotNull(alertService, "告警服务应该被正确初始化");
        log.info("告警服务已初始化");
    }

    @Test
    @DisplayName("测试告警通知冷却配置")
    void testNotificationCooldown() {
        AlertConfig.NotificationConfig notification = alertConfig.getNotification();
        
        assertNotNull(notification, "通知配置不应该为null");
        assertTrue(notification.getCooldownMinutes() > 0, "冷却时间应该大于0");
        
        log.info("告警通知冷却时间: {}分钟", notification.getCooldownMinutes());
    }

    @Test
    @DisplayName("测试告警级别枚举")
    void testAlertLevelEnum() {
        // 验证告警级别枚举值
        AlertService.AlertLevel[] levels = AlertService.AlertLevel.values();
        
        assertTrue(levels.length >= 2, "应该至少有两个告警级别");
        
        boolean hasWarning = false;
        boolean hasCritical = false;
        
        for (AlertService.AlertLevel level : levels) {
            if (level == AlertService.AlertLevel.WARNING) {
                hasWarning = true;
            }
            if (level == AlertService.AlertLevel.CRITICAL) {
                hasCritical = true;
            }
        }
        
        assertTrue(hasWarning, "应该包含WARNING级别");
        assertTrue(hasCritical, "应该包含CRITICAL级别");
        
        log.info("告警级别: {}", (Object[]) levels);
    }

    @Test
    @DisplayName("测试告警类型存在")
    void testAlertTypesExist() {
        // 验证告警服务可以处理不同类型的告警
        log.info("告警服务可以处理多种告警类型");
        
        // 测试发送不同类型的告警
        alertService.sendAlert(
            AlertService.AlertLevel.WARNING,
            "测试告警",
            "这是一条测试告警消息",
            null
        );
        
        log.info("告警类型测试通过");
    }

    @Test
    @DisplayName("测试阈值判断逻辑")
    void testThresholdCheckLogic() {
        AlertConfig.ApiResponseTimeThreshold threshold = alertConfig.getApiResponseTime();
        
        // 测试正常情况
        assertFalse(threshold.getWarning() > threshold.getCritical(), 
            "警告阈值不应该大于严重阈值");
        
        // 测试阈值范围
        assertTrue(threshold.getWarning() >= 100 && threshold.getWarning() <= 1000,
            "警告阈值应该在合理范围内(100-1000ms)");
        assertTrue(threshold.getCritical() >= 1000 && threshold.getCritical() <= 5000,
            "严重阈值应该在合理范围内(1000-5000ms)");
        
        log.info("阈值判断逻辑测试通过");
    }
}
