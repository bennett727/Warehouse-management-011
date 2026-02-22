package com.backend.exception;

/**
 * 安全异常
 *
 * 功能说明：
 * 用于处理安全相关的异常，如SQL注入、XSS攻击等
 *
 * @author 安全团队
 * @version 1.0
 * @since 2026-02-10
 */
public class SecurityException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public SecurityException(String message) {
        super(message);
    }

    public SecurityException(String message, Throwable cause) {
        super(message, cause);
    }
}
