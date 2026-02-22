package com.backend.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor
@SuppressWarnings("deprecation")
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String corsAllowedOrigins;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String corsAllowedMethods;

    @Value("${cors.allowed-headers:*}")
    private String corsAllowedHeaders;

    @Value("${cors.allow-credentials:true}")
    private Boolean corsAllowCredentials;

    @Value("${cors.max-age:3600}")
    private Long corsMaxAge;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        // 添加安全头部
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"))
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .xssProtection(xss -> xss.disable()) // CSP已提供XSS保护
                        .contentTypeOptions(contentTypeOptions -> {
                        })
                        .referrerPolicy(referrer -> referrer.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicyHeader(permissions -> permissions.policy(
                                "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(), sync-xhr=(), ambient-light-sensor=(), accelerometer=(), midi=(), notifications=(), push=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()")))
                .authorizeHttpRequests(auth -> auth
                        // 认证相关接口（包含context-path前缀）
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/error").permitAll() // 允许访问错误页面，避免403掩盖真实错误
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/error-report", "/api/performance-report").permitAll()
                        .requestMatchers("/error-report", "/performance-report").permitAll()
                        .requestMatchers("/api/swagger-ui/**", "/api/v3/api-docs/**", "/api/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/actuator/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/health", "/api/health/**").permitAll() // 健康检查端点
                        .requestMatchers("/health", "/health/**").permitAll()
                        .requestMatchers("/api/system/health").permitAll()
                        .requestMatchers("/system/health").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 系统管理模块 - 仅管理员可访问
                        .requestMatchers("/api/system/users/**").hasRole("ADMIN")
                        .requestMatchers("/system/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/system/roles/**").hasRole("ADMIN")
                        .requestMatchers("/system/roles/**").hasRole("ADMIN")
                        .requestMatchers("/api/roles/**").hasRole("ADMIN")
                        .requestMatchers("/roles/**").hasRole("ADMIN")
                        .requestMatchers("/api/system/logs/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers("/system/logs/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers("/api/system/configs/**").hasRole("ADMIN")
                        .requestMatchers("/system/configs/**").hasRole("ADMIN")

                        // 数据迁移和初始化 - 仅管理员可访问
                        .requestMatchers("/api/data-migration/**").hasRole("ADMIN")
                        .requestMatchers("/data-migration/**").hasRole("ADMIN")

                        // 测试环境：放宽所有API权限，允许已认证用户访问所有接口
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(corsAllowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList(corsAllowedMethods.split(",")));
        configuration.setAllowedHeaders(Arrays.asList(corsAllowedHeaders.split(",")));
        configuration.setAllowCredentials(corsAllowCredentials);
        configuration.setMaxAge(corsMaxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
