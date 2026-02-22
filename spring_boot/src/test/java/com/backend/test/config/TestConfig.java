package com.backend.test.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Test Configuration
 *
 * Excludes problematic components from test context
 */
@TestConfiguration
@ComponentScan(
    basePackages = "com.backend",
    excludeFilters = {
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = "com.backend.aspect.*"
        ),
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = "com.backend.config.JacksonConfig"
        ),
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = "com.backend.controller.OptimizationController"
        ),
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = "com.backend.service.cache.CacheWarmupService"
        )
    }
)
public class TestConfig {
}
