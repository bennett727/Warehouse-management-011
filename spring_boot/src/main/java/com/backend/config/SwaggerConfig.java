package com.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

/**
 * Swagger/OpenAPI 配置类
 * 
 * 功能说明：
 * 配置API文档生成，提供可视化的API接口文档
 * 
 * 访问地址：
 * - Swagger UI: /api/swagger-ui.html
 * - OpenAPI JSON: /api/v3/api-docs
 * 
 * 安全认证：
 * 支持JWT Token认证，在Swagger UI中可以直接测试受保护的接口
 * 
 * 文档特性：
 * - 自动扫描所有Controller生成文档
 * - 支持请求参数、响应格式的详细说明
 * - 支持接口分组显示
 * - 支持在线测试接口
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Configuration
public class SwaggerConfig {

        @Value("${server.port:8080}")
        private String serverPort;

        /**
         * 配置OpenAPI
         * 
         * 设置API文档的基本信息和安全配置
         * 
         * @return OpenAPI配置对象
         */
        @Bean
        public OpenAPI customOpenAPI() {
                // API基本信息
                Info info = new Info()
                                .title("仓库管理系统 API 文档")
                                .description("仓库管理系统（WMS）后端API接口文档，提供设备管理、库存管理、订单管理等功能接口")
                                .version("2.0.0")
                                .contact(new Contact()
                                                .name("技术支持团队")
                                                .email("tech.support@company.com")
                                                .url("https://www.company.com"))
                                .license(new License()
                                                .name("Apache 2.0")
                                                .url("https://www.apache.org/licenses/LICENSE-2.0"));

                // 服务器配置
                Server localServer = new Server()
                                .url("http://localhost:" + serverPort + "/api")
                                .description("本地开发环境");

                Server devServer = new Server()
                                .url("https://dev-api.company.com/api")
                                .description("测试环境");

                Server prodServer = new Server()
                                .url("https://api.company.com/api")
                                .description("生产环境");

                List<Server> servers = Arrays.asList(localServer, devServer, prodServer);

                // 安全配置（JWT Token）
                SecurityScheme securityScheme = new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("请输入JWT Token，格式：Bearer {token}");

                SecurityRequirement securityRequirement = new SecurityRequirement()
                                .addList("JWT");

                Components components = new Components()
                                .addSecuritySchemes("JWT", securityScheme);

                return new OpenAPI()
                                .info(info)
                                .servers(servers)
                                .components(components)
                                .addSecurityItem(securityRequirement);
        }
}
