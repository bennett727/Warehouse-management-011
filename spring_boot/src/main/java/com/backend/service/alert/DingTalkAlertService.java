package com.backend.service.alert;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

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
 * 钉钉告警通知服务
 *
 * 功能说明：
 * 实现钉钉机器人WebHook告警通知
 *
 * 特性：
 * - 支持Markdown格式消息
 * - 支持签名验证
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
public class DingTalkAlertService {

    private final AlertRuleConfig alertRuleConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String DINGTALK_SUCCESS_CODE = "0";

    @Async
    public CompletableFuture<Boolean> sendAlert(AlertService.AlertLevel level, String title, String message, Map<String, Object> context) {
        AlertRuleConfig.DingTalk dingTalk = alertRuleConfig.getDingTalk();

        if (!dingTalk.isEnabled()) {
            log.debug("钉钉告警未启用");
            return CompletableFuture.completedFuture(false);
        }

        if (dingTalk.getWebhook() == null || dingTalk.getWebhook().isEmpty()) {
            log.warn("钉钉WebHook地址未配置");
            return CompletableFuture.completedFuture(false);
        }

        try {
            String webhookUrl = buildWebhookUrl(dingTalk);
            Map<String, Object> requestBody = buildMarkdownMessage(level, title, message, dingTalk);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            log.debug("发送钉钉告警: {} - {}", title, message);

            String response = restTemplate.postForObject(webhookUrl, entity, String.class);
            boolean success = parseResponse(response);

            if (success) {
                log.info("钉钉告警发送成功: {}", title);
            } else {
                log.warn("钉钉告警发送失败: {}", response);
            }

            return CompletableFuture.completedFuture(success);

        } catch (Exception e) {
            log.error("发送钉钉告警异常: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    private String buildWebhookUrl(AlertRuleConfig.DingTalk dingTalk) {
        String webhook = dingTalk.getWebhook();

        if (dingTalk.getSecret() != null && !dingTalk.getSecret().isEmpty()) {
            try {
                long timestamp = System.currentTimeMillis();
                String stringToSign = timestamp + "\n" + dingTalk.getSecret();
                String sign = generateSign(stringToSign, dingTalk.getSecret());

                webhook = webhook + "&timestamp=" + timestamp + "&sign=" + sign;
            } catch (Exception e) {
                log.error("生成钉钉签名失败", e);
            }
        }

        return webhook;
    }

    private String generateSign(String stringToSign, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] signData = mac.doFinal(stringToSign.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(signData);
    }

    private Map<String, Object> buildMarkdownMessage(AlertService.AlertLevel level, String title, String message, AlertRuleConfig.DingTalk dingTalk) {
        Map<String, Object> body = new HashMap<>();
        body.put("msgtype", "markdown");

        String levelIcon = level == AlertService.AlertLevel.CRITICAL ? "🔴" : "🟡";
        String levelText = level == AlertService.AlertLevel.CRITICAL ? "严重" : "警告";

        StringBuilder markdownContent = new StringBuilder();
        markdownContent.append("### ").append(levelIcon).append(" ").append(title).append("\n\n");
        markdownContent.append("**告警级别**: ").append(levelText).append("\n\n");
        markdownContent.append("**告警内容**: ").append(message).append("\n\n");
        markdownContent.append("**告警时间**: ").append(java.time.LocalDateTime.now().toString()).append("\n\n");
        markdownContent.append("**系统**: WMS仓库管理系统");

        Map<String, Object> markdown = new HashMap<>();
        markdown.put("title", title);
        markdown.put("text", markdownContent.toString());
        body.put("markdown", markdown);

        Map<String, Object> at = new HashMap<>();
        if (dingTalk.getAtMobiles() != null && !dingTalk.getAtMobiles().isEmpty()) {
            at.put("atMobiles", dingTalk.getAtMobiles().split(","));
        }
        if (dingTalk.getAtUserIds() != null && !dingTalk.getAtUserIds().isEmpty()) {
            at.put("atUserIds", dingTalk.getAtUserIds().split(","));
        }
        at.put("isAtAll", dingTalk.isAtAll());
        body.put("at", at);

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
            return errcode != null && DINGTALK_SUCCESS_CODE.equals(errcode.toString());
        } catch (Exception e) {
            log.error("解析钉钉响应失败: {}", e.getMessage());
            return false;
        }
    }

    public boolean testConnection() {
        AlertRuleConfig.DingTalk dingTalk = alertRuleConfig.getDingTalk();

        if (!dingTalk.isEnabled()) {
            log.info("钉钉告警未启用");
            return false;
        }

        try {
            CompletableFuture<Boolean> result = sendAlert(
                    AlertService.AlertLevel.WARNING,
                    "告警测试",
                    "这是一条测试告警消息，用于验证钉钉告警配置是否正确。",
                    null);

            return result.get();
        } catch (Exception e) {
            log.error("测试钉钉告警失败", e);
            return false;
        }
    }
}
