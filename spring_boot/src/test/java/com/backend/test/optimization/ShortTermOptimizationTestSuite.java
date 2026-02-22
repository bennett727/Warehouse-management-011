package com.backend.test.optimization;

import com.backend.test.config.TestRedisConfiguration;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;
import org.springframework.context.annotation.Import;

/**
 * 短期优化测试套件
 * 
 * 运行所有短期优化相关的测试：
 * 1. 性能监控测试 (com.backend.test.metrics)
 * 2. 告警功能测试 (com.backend.test.alert)
 * 3. Redis缓存测试 (com.backend.test.cache)
 * 4. API限流测试 (com.backend.test.ratelimit)
 * 
 * 使用方法：
 * 1. 在IDE中直接运行此类
 * 2. 使用Maven: mvn test -Dtest=ShortTermOptimizationTestSuite
 * 3. 使用Gradle: gradle test --tests ShortTermOptimizationTestSuite
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Suite
@SuiteDisplayName("短期优化功能测试套件")
@SelectPackages({
    "com.backend.test.metrics",
    "com.backend.test.alert",
    "com.backend.test.cache",
    "com.backend.test.ratelimit"
})
@Import(TestRedisConfiguration.class)
public class ShortTermOptimizationTestSuite {
    // 测试套件类，不需要实现任何方法
    // 所有测试逻辑在选中的包中
}
