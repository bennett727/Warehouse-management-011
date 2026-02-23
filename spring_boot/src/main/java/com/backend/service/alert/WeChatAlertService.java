package com.backend.service.alert;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.config.AlertRuleConfig;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 企业微信告警通知服务
 *
 * 功能说明：
 * 实现企业微信机器人WebHook告警通知
 *
 * 特性：
 * - 支持Markdown格式消息
 * - 支持@指定人员
 * - 异步发送，不阻塞主流程
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WeChatAlertService {

    private final AlertRuleConfig alertRuleConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final int WECHAT_SUCCESS_CODE = 0;

    @Async
    public CompletableFuture<Boolean> sendAlert(AlertService.AlertLevel level, String title, String message, Map<String, Object> context) {
        AlertRuleConfig.WeChat weChat = alertRuleConfig.getWeChat();

        if (!weChat.isEnabled()) {
            log.debug("企业微信告警未启用");
            return CompletableFuture.completedFuture(false);
        }

        if (weChat.getWebhook() == null || weChat.getWebhook().isEmpty()) {
            log.warn("企业微信WebHook地址未配置");
            return CompletableFuture.completedFuture(false);
        }

        try {
            Map<String, Object> requestBody = buildMarkdownMessage(level, title, message, weChat);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            log.debug("发送企业微信告警: {} - {}", title, message);

            String response = restTemplate.postForObject(weChat.getWebhook(), entity, String.class);
            boolean success = parseResponse(response);

            if (success) {
                log.info("企业微信告警发送成功: {}", title);
            } else {
                log.warn("企业微信告警发送失败: {}", response);
            }

            return CompletableFuture.completedFuture(success);

        } catch (Exception e) {
            log.error("发送企业微信告警异常: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    private Map<String, Object> buildMarkdownMessage(AlertService.AlertLevel level, String title, String message, AlertRuleConfig.WeChat weChat) {
        Map<String, Object> body = new HashMap<>();
        body.put("msgtype", "markdown");

        String levelIcon = level == AlertService.AlertLevel.CRITICAL ? "🔴" : "🟡";
        String levelText = level == AlertService.AlertLevel.CRITICAL ? "严重" : "警告";

        StringBuilder markdownContent = new StringBuilder();
        markdownContent.append("### ").append(levelIcon).append(" ").append(title).append("\n");
        markdownContent.append("> 告警级别: **").append(levelText).append("**\n");
        markdownContent.append("> 告警内容: ").append(message).append("\n");
        markdownContent.append("> 告警时间: ").append(java.time.LocalDateTime.now().toString()).append("\n");
        markdownContent.append("> 系统: WMS仓库管理系统");

        if (weChat.getMentionedList() != null && !weChat.getMentionedList().isEmpty()) {
            markdownContent.append("\n\n<@").append(weChat.getMentionedList().replace(",", "> <@")).append(">");
        }

        Map<String, Object> markdown = new HashMap<>();
        markdown.put("content", markdownContent.toString());
        body.put("markdown", markdown);

        return body;
    }

    private boolean parseResponse(String response) {
        if (response == null) {
            return false;
        }

        try {
            Map<String, Object> responseMap = objectMapper.readValue(response, new TypeReference<Map<String, Object>>() {
                private static final long serialVersionUID = 1L;
            });
            Object errcode = responseMap.get("errcode");
            return errcode != null && WECHAT_SUCCESS_CODE == ((Number) errcode).intValue();
        } catch (Exception e) {
            log.error("解析企业微信响应失败: {}", e.getMessage());
            return false;
        }
    }

    public boolean testConnection() {
        AlertRuleConfig.WeChat weChat = alertRuleConfig.getWeChat();

        if (!weChat.isEnabled()) {
            log.info("企业微信告警未启用");
            return false;
        }

        try {
            CompletableFuture<Boolean> result = sendAlert(
                    AlertService.AlertLevel.WARNING,
                    "告警测试",
                    "这是一条测试告警消息，用于验证企业微信告警配置是否正确。",
                    null);

            return result.get();
        } catch (Exception e) {
            log.error("测试企业微信告警失败", e);
            return false;
        }
    }
}
