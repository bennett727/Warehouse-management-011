package com.backend.util;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 日志脱敏工具类
 *
 * 功能说明：
 * 对日志内容中的敏感信息进行脱敏处理，防止敏感信息泄露
 *
 * 脱敏规则：
 * - 密码：完全隐藏
 * - 手机号：保留前3后4位
 * - 身份证号：保留前4后4位
 * - 银行卡号：保留前4后4位
 * - 邮箱：保留前3字符和@后域名
 * - Token：保留前8位
 * - IP地址：保留前2段
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-19
 */
public class LogDesensitizationUtil {

    private static final Set<String> SENSITIVE_KEYS = new HashSet<>();

    static {
        SENSITIVE_KEYS.add("password");
        SENSITIVE_KEYS.add("pwd");
        SENSITIVE_KEYS.add("passwd");
        SENSITIVE_KEYS.add("secret");
        SENSITIVE_KEYS.add("token");
        SENSITIVE_KEYS.add("accessToken");
        SENSITIVE_KEYS.add("refreshToken");
        SENSITIVE_KEYS.add("apiKey");
        SENSITIVE_KEYS.add("apiSecret");
        SENSITIVE_KEYS.add("privateKey");
        SENSITIVE_KEYS.add("credential");
        SENSITIVE_KEYS.add("auth");
        SENSITIVE_KEYS.add("authorization");
    }

    private static final Pattern PHONE_PATTERN = Pattern.compile("(1[3-9]\\d)\\d{4}(\\d{4})");
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("(\\d{4})\\d{10}(\\d{4})");
    private static final Pattern BANK_CARD_PATTERN = Pattern.compile("(\\d{4})\\d{8,12}(\\d{4})");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("(\\w{0,3})\\w*(@\\w+\\.\\w+)");
    private static final Pattern TOKEN_PATTERN = Pattern.compile("(Bearer\\s+\\w{8})\\w+");
    private static final Pattern IP_PATTERN = Pattern.compile("(\\d{1,3}\\.\\d{1,3})\\.\\d{1,3}\\.\\d{1,3}");

    private static final Pattern KEY_VALUE_PATTERN = Pattern.compile(
            "(password|pwd|passwd|secret|token|accessToken|refreshToken|apiKey|apiSecret|privateKey|credential)\\s*[=:]\\s*([^\\s,;\\]}]+)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern JSON_FIELD_PATTERN = Pattern.compile(
            "\"(password|pwd|passwd|secret|token|accessToken|refreshToken|apiKey|apiSecret|privateKey|credential)\"\\s*:\\s*\"([^\"]+)\"",
            Pattern.CASE_INSENSITIVE);

    public static String desensitize(String message) {
        if (message == null || message.isEmpty()) {
            return message;
        }

        String result = message;

        result = desensitizeKeyValue(result);
        result = desensitizeJsonFields(result);
        result = desensitizePhone(result);
        result = desensitizeIdCard(result);
        result = desensitizeBankCard(result);
        result = desensitizeEmail(result);
        result = desensitizeToken(result);
        result = desensitizeIp(result);

        return result;
    }

    public static String desensitizeKeyValue(String message) {
        if (message == null) {
            return message;
        }

        Matcher matcher = KEY_VALUE_PATTERN.matcher(message);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String key = matcher.group(1);
            String value = matcher.group(2);
            String desensitizedValue = desensitizeByType(key, value);
            matcher.appendReplacement(sb, key + "=" + desensitizedValue);
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    public static String desensitizeJsonFields(String message) {
        if (message == null) {
            return message;
        }

        Matcher matcher = JSON_FIELD_PATTERN.matcher(message);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String key = matcher.group(1);
            String value = matcher.group(2);
            String desensitizedValue = desensitizeByType(key, value);
            matcher.appendReplacement(sb, "\"" + key + "\":\"" + desensitizedValue + "\"");
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    public static String desensitizePhone(String message) {
        if (message == null) {
            return message;
        }
        return PHONE_PATTERN.matcher(message).replaceAll("$1****$2");
    }

    public static String desensitizeIdCard(String message) {
        if (message == null) {
            return message;
        }
        return ID_CARD_PATTERN.matcher(message).replaceAll("$1**********$2");
    }

    public static String desensitizeBankCard(String message) {
        if (message == null) {
            return message;
        }
        return BANK_CARD_PATTERN.matcher(message).replaceAll("$1********$2");
    }

    public static String desensitizeEmail(String message) {
        if (message == null) {
            return message;
        }
        return EMAIL_PATTERN.matcher(message).replaceAll("$1***$2");
    }

    public static String desensitizeToken(String message) {
        if (message == null) {
            return message;
        }
        return TOKEN_PATTERN.matcher(message).replaceAll("$1********");
    }

    public static String desensitizeIp(String message) {
        if (message == null) {
            return message;
        }
        return IP_PATTERN.matcher(message).replaceAll("$1.*.*");
    }

    private static String desensitizeByType(String key, String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }

        String lowerKey = key.toLowerCase();

        if (lowerKey.contains("password") || lowerKey.contains("pwd") || lowerKey.contains("passwd")) {
            return "******";
        }

        if (lowerKey.contains("secret") || lowerKey.contains("key") || lowerKey.contains("credential")) {
            return maskMiddle(value, 4, 4);
        }

        if (lowerKey.contains("token")) {
            return maskMiddle(value, 8, 0);
        }

        return "******";
    }

    private static String maskMiddle(String value, int keepStart, int keepEnd) {
        if (value == null || value.length() <= keepStart + keepEnd) {
            return "******";
        }

        StringBuilder masked = new StringBuilder();
        masked.append(value.substring(0, keepStart));

        int maskLength = value.length() - keepStart - keepEnd;
        for (int i = 0; i < maskLength && i < 6; i++) {
            masked.append("*");
        }

        if (keepEnd > 0) {
            masked.append(value.substring(value.length() - keepEnd));
        }

        return masked.toString();
    }

    public static boolean isSensitiveKey(String key) {
        if (key == null) {
            return false;
        }
        return SENSITIVE_KEYS.contains(key.toLowerCase());
    }

    public static String desensitizeValue(String key, String value) {
        if (!isSensitiveKey(key)) {
            return value;
        }
        return desensitizeByType(key, value);
    }
}
