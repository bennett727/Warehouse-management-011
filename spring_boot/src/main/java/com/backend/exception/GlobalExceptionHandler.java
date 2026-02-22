package com.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.backend.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * 全局异常处理器
 *
 * 功能说明：
 * 统一处理系统中所有异常，将异常转换为统一的API响应格式
 *
 * 处理顺序：
 * 1. 业务异常（BusinessException）- 返回业务错误码和消息
 * 2. 认证相关异常 - 返回401/403状态码
 * 3. 参数验证异常 - 返回400状态码和验证错误详情
 * 4. 运行时异常 - 返回400状态码
 * 5. 其他异常 - 返回500状态码
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     *
     * 使用场景：
     * - 业务规则校验失败
     * - 资源不存在
     * - 状态不允许操作
     *
     * @param e 业务异常
     * @return 统一API响应，包含错误码和错误消息
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        if (e.getCode() != null) {
            return ApiResponse.error(Integer.parseInt(e.getCode()), e.getMessage());
        }
        return ApiResponse.error(e.getMessage());
    }

    /**
     * 处理运行时异常
     *
     * 注意：建议逐步替换为BusinessException
     *
     * @param e 运行时异常
     * @return 统一API响应
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);
        // 不暴露内部错误信息，返回通用错误消息
        return ApiResponse.error("请求处理失败，请稍后重试");
    }

    /**
     * 处理认证失败异常
     *
     * @param e 认证失败异常
     * @return 统一API响应，401状态码
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleBadCredentialsException(BadCredentialsException e) {
        log.error("认证失败: {}", e.getMessage());
        return ApiResponse.error(401, "认证失败: " + e.getMessage());
    }

    /**
     * 处理权限不足异常
     *
     * @param e 权限不足异常
     * @return 统一API响应，403状态码
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleAccessDeniedException(AccessDeniedException e) {
        log.error("权限不足: {}", e.getMessage());
        return ApiResponse.error(403, "权限不足，无法访问该资源");
    }

    /**
     * 处理参数验证异常
     *
     * @param e 参数验证异常
     * @return 统一API响应，包含验证错误详情
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("参数验证失败: {}", errors);
        return ApiResponse.error(400, "参数验证失败");
    }

    /**
     * 处理其他所有异常
     *
     * @param e 异常
     * @return 统一API响应，500状态码
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        // 生产环境不暴露详细错误信息
        return ApiResponse.error("系统繁忙，请稍后重试");
    }
}
