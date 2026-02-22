package com.backend.util;

import java.util.regex.Pattern;

/**
 * 输入净化工具类
 *
 * 功能说明：
 * 提供SQL注入和XSS攻击防护的输入验证和净化功能
 *
 * 防护策略：
 * 1. SQL注入：过滤危险字符和SQL关键字
 * 2. XSS攻击：HTML转义和JavaScript过滤
 *
 * @author 安全团队
 * @version 1.0
 * @since 2026-02-10
 */
public class InputSanitizer {

    // SQL注入危险字符
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "('|\"|;|--|/\\*|\\*/|\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR\\s+1\\s*=\\s*1|AND\\s+1\\s*=\\s*1)\\b)",
        Pattern.CASE_INSENSITIVE
    );

    // XSS攻击模式
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "(<script.*?>.*?</script>|<.*?javascript:.*?>|on\\w+\\s*=|javascript:|vbscript:|data:text/html)",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    // 危险HTML标签
    private static final Pattern DANGEROUS_HTML_PATTERN = Pattern.compile(
        "<(script|iframe|object|embed|form|input|textarea|style|link|meta|base)[^>]*?>",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * 检查是否包含SQL注入攻击
     *
     * @param input 输入字符串
     * @return true 如果包含SQL注入
     */
    public static boolean containsSqlInjection(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }

    /**
     * 检查是否包含XSS攻击
     *
     * @param input 输入字符串
     * @return true 如果包含XSS攻击
     */
    public static boolean containsXss(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }
        return XSS_PATTERN.matcher(input).find() || DANGEROUS_HTML_PATTERN.matcher(input).find();
    }

    /**
     * 净化SQL输入
     * 移除或转义SQL特殊字符
     *
     * @param input 输入字符串
     * @return 净化后的字符串
     */
    public static String sanitizeForSql(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        // 转义单引号
        return input.replace("'", "''");
    }

    /**
     * 净化HTML输入（XSS防护）
     * 将HTML特殊字符转义为实体
     *
     * @param input 输入字符串
     * @return 净化后的字符串
     */
    public static String sanitizeForHtml(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        StringBuilder sb = new StringBuilder();
        for (char c : input.toCharArray()) {
            switch (c) {
                case '<':
                    sb.append("&lt;");
                    break;
                case '>':
                    sb.append("&gt;");
                    break;
                case '&':
                    sb.append("&amp;");
                    break;
                case '"':
                    sb.append("&quot;");
                    break;
                case '\'':
                    sb.append("&#x27;");
                    break;
                case '/':
                    sb.append("&#x2F;");
                    break;
                default:
                    sb.append(c);
            }
        }
        return sb.toString();
    }

    /**
     * 通用输入净化
     * 同时进行SQL和XSS净化
     *
     * @param input 输入字符串
     * @return 净化后的字符串
     */
    public static String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        // 先进行HTML净化，再进行SQL净化
        String htmlSafe = sanitizeForHtml(input);
        return sanitizeForSql(htmlSafe);
    }

    /**
     * 验证输入是否安全
     * 如果包含攻击模式，抛出异常
     *
     * @param input 输入字符串
     * @param fieldName 字段名称（用于错误消息）
     * @throws SecurityException 如果输入不安全
     */
    public static void validateInput(String input, String fieldName) {
        if (input == null || input.isEmpty()) {
            return;
        }

        if (containsSqlInjection(input)) {
            throw new SecurityException("输入包含非法字符: " + fieldName);
        }

        if (containsXss(input)) {
            throw new SecurityException("输入包含非法脚本: " + fieldName);
        }
    }

    /**
     * 净化搜索关键词
     * 专门用于搜索功能的输入净化
     *
     * @param keyword 搜索关键词
     * @return 净化后的关键词
     */
    public static String sanitizeSearchKeyword(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return keyword;
        }

        // 移除SQL通配符
        String sanitized = keyword.replace("%", "").replace("_", "");

        // 检查SQL注入
        if (containsSqlInjection(sanitized)) {
            throw new SecurityException("搜索关键词包含非法字符");
        }

        return sanitized;
    }
}
