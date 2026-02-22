package com.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket配置类
 * 
 * 功能说明：
 * 配置WebSocket实时通信，支持库存实时更新、通知推送等功能
 * 
 * 通信协议：
 * - 使用STOMP协议作为WebSocket的子协议
 * - 支持发布/订阅模式
 * - 支持点对点消息
 * 
 * 使用场景：
 * - 库存实时更新：库存变动时推送给相关用户
 * - 订单状态通知：订单状态变更时通知相关人员
 * - 系统公告：向所有在线用户推送系统公告
 * - 报表完成通知：异步报表生成完成后通知用户
 * 
 * 连接地址：
 * - WebSocket端点：/ws
 * - SockJS端点：/ws/sockjs（用于不支持WebSocket的浏览器）
 * 
 * 消息代理：
 * - /topic：广播消息前缀
 * - /queue：点对点消息前缀
 * - /app：应用消息前缀（客户端发送消息时使用）
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 配置消息代理
     * 
     * 设置消息路由前缀和代理目的地
     * 
     * @param registry 消息代理注册表
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 启用简单的内存消息代理
        // /topic 用于广播消息
        // /queue 用于点对点消息
        registry.enableSimpleBroker("/topic", "/queue");
        
        // 设置应用消息前缀
        // 客户端发送消息到 /app/xxx，会被路由到对应的@MessageMapping方法
        registry.setApplicationDestinationPrefixes("/app");
        
        // 设置用户消息前缀
        // 用于点对点消息，/user/{userId}/queue/xxx
        registry.setUserDestinationPrefix("/user");
        
        log.info("WebSocket消息代理配置完成");
    }

    /**
     * 注册STOMP端点
     * 
     * 配置WebSocket连接端点
     * 
     * @param registry STOMP端点注册表
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册WebSocket端点
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // 允许跨域，生产环境应限制具体域名
                .withSockJS();  // 启用SockJS回退选项
        
        log.info("WebSocket端点注册完成：/ws");
    }
}
