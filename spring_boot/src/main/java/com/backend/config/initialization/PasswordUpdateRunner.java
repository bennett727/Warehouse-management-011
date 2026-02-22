/*
 * @file: PasswordUpdateRunner.java
 * @description: 密码更新工具 - 用于更新现有用户的密码为123456
 * @author: 后端开发团队
 * @createTime: 2026-02-18
 * @version: 1.0.0
 */
package com.backend.config.initialization;

import com.backend.entity.User;
import com.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 密码更新工具
 * 用于将现有用户的密码更新为123456
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(2) // 在DataInitializer之后执行
public class PasswordUpdateRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║          开始更新用户密码                                ║");
        log.info("╚════════════════════════════════════════════════════════════╝");

        // 更新管理员密码
        updatePassword("admin", "123456");
        // 更新操作员密码
        updatePassword("operator", "123456");
        // 更新技术员密码
        updatePassword("technician", "123456");

        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║          用户密码更新完成                              ║");
        log.info("╚════════════════════════════════════════════════════════════╝");
    }

    private void updatePassword(String username, String newPassword) {
        userRepository.findByUsername(username).ifPresent(user -> {
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userRepository.save(user);
            log.info("用户 [{}] 的密码已更新为: {}", username, newPassword);
        });
    }
}
