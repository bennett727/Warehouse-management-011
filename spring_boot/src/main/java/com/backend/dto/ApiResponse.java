package com.backend.dto;

import java.time.LocalDateTime;

import com.backend.common.ErrorCode;
import com.backend.common.ResultCode;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 统一API响应格式
 * 
 * 功能说明：
 * 统一封装所有API接口的响应结构，确保前后端数据交互的一致性
 * 
 * 响应格式：
 * {
 * "success": true/false, // 操作是否成功
 * "code": 200, // 业务状态码
 * "message": "操作成功", // 提示信息
 * "data": { ... }, // 业务数据（可选）
 * "timestamp": "2024-01-01T12:00:00" // 响应时间戳
 * }
 * 
 * 使用示例：
 * - 成功响应：ApiResponse.success(data)
 * - 错误响应：ApiResponse.error(ErrorCode.DEVICE_NOT_FOUND)
 * - 自定义消息：ApiResponse.success("自定义消息", data)
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * 操作是否成功
     */
    private Boolean success;

    /**
     * 业务状态码
     * 200 - 成功
     * 400 - 请求参数错误
     * 401 - 未授权
     * 403 - 禁止访问
     * 404 - 资源不存在
     * 500 - 服务器内部错误
     * 1000+ - 业务错误码
     */
    private Integer code;

    /**
     * 提示信息
     */
    private String message;

    /**
     * 业务数据
     */
    private T data;

    /**
     * 响应时间戳
     */
    private LocalDateTime timestamp;

    /**
     * 请求追踪ID（用于日志追踪）
     */
    private String traceId;

    /**
     * 私有构造方法
     */
    private ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    // Getter方法
    public Boolean getSuccess() {
        return success;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getTraceId() {
        return traceId;
    }

    // Setter方法
    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setData(T data) {
        this.data = data;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }

    /**
     * 创建成功响应
     * 
     * @param data 业务数据
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setCode(200);
        response.setMessage("操作成功");
        response.setData(data);
        return response;
    }

    /**
     * 创建成功响应（自定义消息）
     * 
     * @param message 自定义消息
     * @param data    业务数据
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setCode(200);
        response.setMessage(message);
        response.setData(data);
        return response;
    }

    /**
     * 创建成功响应（无数据）
     * 
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> success() {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setCode(200);
        response.setMessage("操作成功");
        return response;
    }

    /**
     * 创建错误响应
     * 
     * @param errorCode 错误码枚举
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setCode(errorCode.getCode());
        response.setMessage(errorCode.getMessage());
        return response;
    }

    /**
     * 创建错误响应（自定义消息）
     * 
     * @param errorCode 错误码枚举
     * @param message   自定义消息
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setCode(errorCode.getCode());
        response.setMessage(message);
        return response;
    }

    /**
     * 创建错误响应（使用HTTP状态码）
     * 
     * @param code    HTTP状态码
     * @param message 错误消息
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> error(Integer code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setCode(code);
        response.setMessage(message);
        return response;
    }

    /**
     * 创建错误响应（仅消息，使用默认错误码500）
     *
     * @param message 错误消息
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setCode(500);
        response.setMessage(message);
        return response;
    }

    /**
     * 创建错误响应（使用ResultCode）
     *
     * @param resultCode 结果码枚举
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<T> error(ResultCode resultCode) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setCode(resultCode.getCode());
        response.setMessage(resultCode.getMessage());
        return response;
    }

    /**
     * 创建分页成功响应
     * 
     * @param pageResult 分页结果
     * @return ApiResponse对象
     */
    public static <T> ApiResponse<PageResult<T>> success(PageResult<T> pageResult) {
        ApiResponse<PageResult<T>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setCode(200);
        response.setMessage("操作成功");
        response.setData(pageResult);
        return response;
    }

    /**
     * 设置追踪ID
     * 
     * @param traceId 追踪ID
     * @return 当前对象（链式调用）
     */
    public ApiResponse<T> withTraceId(String traceId) {
        this.setTraceId(traceId);
        return this;
    }

    /**
     * 判断响应是否成功
     * 
     * @return true表示成功
     */
    public boolean isSuccessful() {
        return Boolean.TRUE.equals(this.success) && this.code != null && this.code == 200;
    }
}
