package com.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 仓库管理系统后端应用入口
 * 
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-08
 */
@SpringBootApplication(exclude = {
        RedisAutoConfiguration.class
})
@EntityScan(basePackages = "com.backend.entity")
@EnableCaching(proxyTargetClass = true)
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}