package com.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 初始化配置属性
 *
 * 功能说明：
 * 定义系统初始化相关的配置参数，支持通过application.properties或application.yml进行配置。
 *
 * 配置参数：
 * - app.initialization.enabled: 是否启用初始化（默认true）
 * - app.initialization.skip-core: 是否跳过核心数据初始化（默认false）
 * - app.initialization.skip-business: 是否跳过业务数据初始化（默认false）
 * - app.initialization.skip-test: 是否跳过测试数据初始化（默认true，生产环境）
 * - app.initialization.fail-fast: 初始化失败时是否立即停止（默认true）
 *
 * 使用示例（application.properties）：
 * <pre>
 * # 启用初始化
 * app.initialization.enabled=true
 *
 * # 跳过测试数据（生产环境）
 * app.initialization.skip-test=true
 *
 * # 快速失败模式
 * app.initialization.fail-fast=true
 * </pre>
 *
 * 使用示例（application.yml）：
 * <pre>
 * app:
 *   initialization:
 *     enabled: true
 *     skip-core: false
 *     skip-business: false
 *     skip-test: true
 *     fail-fast: true
 * </pre>
 *
 * @author 系统架构团队
 * @version 1.0.0
 * @since 2026-02-11
 */
@Component
@ConfigurationProperties(prefix = "app.initialization")
public class InitializationProperties {

    private boolean enabled = true;
    private boolean skipCore = false;
    private boolean skipBusiness = false;
    private boolean skipTest = true;
    private boolean failFast = true;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isSkipCore() {
        return skipCore;
    }

    public void setSkipCore(boolean skipCore) {
        this.skipCore = skipCore;
    }

    public boolean isSkipBusiness() {
        return skipBusiness;
    }

    public void setSkipBusiness(boolean skipBusiness) {
        this.skipBusiness = skipBusiness;
    }

    public boolean isSkipTest() {
        return skipTest;
    }

    public void setSkipTest(boolean skipTest) {
        this.skipTest = skipTest;
    }

    public boolean isFailFast() {
        return failFast;
    }

    public void setFailFast(boolean failFast) {
        this.failFast = failFast;
    }

    @Override
    public String toString() {
        return "InitializationProperties{" +
                "enabled=" + enabled +
                ", skipCore=" + skipCore +
                ", skipBusiness=" + skipBusiness +
                ", skipTest=" + skipTest +
                ", failFast=" + failFast +
                '}';
    }
}
