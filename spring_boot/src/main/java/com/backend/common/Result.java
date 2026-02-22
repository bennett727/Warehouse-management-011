/*
 * @file: Result.java
 * @description: 通用响应结果封装类
 * @author: 开发团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */
package com.backend.common;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

/**
 * 通用响应结果封装类
 *
 * 功能说明：
 * 统一封装API接口的响应结果，包含状态码、消息、数据和时间戳。
 * 提供便捷的成功和失败响应构造方法。
 *
 * 使用示例：
 * - 成功响应：Result.success(data)
 * - 失败响应：Result.error("错误消息")
 * - 带代码的失败：Result.error(500, "服务器错误")
 *
 * @param <T> 响应数据类型
 * @author 开发团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Data
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     * 200 - 成功
     * 其他 - 错误码
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 时间戳
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 私有构造方法
     */
    private Result() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 创建成功响应
     *
     * @param data 响应数据
     * @param <T>  数据类型
     * @return 成功响应结果
     */
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        result.setSuccess(true);
        return result;
    }

    /**
     * 创建成功响应（无数据）
     *
     * @param <T> 数据类型
     * @return 成功响应结果
     */
    public static <T> Result<T> success() {
        return success(null);
    }

    /**
     * 创建成功响应（自定义消息）
     *
     * @param message 成功消息
     * @param data    响应数据
     * @param <T>     数据类型
     * @return 成功响应结果
     */
    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        result.setSuccess(true);
        return result;
    }

    /**
     * 创建失败响应
     *
     * @param message 错误消息
     * @param <T>     数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        result.setSuccess(false);
        return result;
    }

    /**
     * 创建失败响应（自定义状态码）
     *
     * @param code    状态码
     * @param message 错误消息
     * @param <T>     数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setSuccess(false);
        return result;
    }

    /**
     * 创建失败响应（使用错误码枚举）
     *
     * @param errorCode 错误码枚举
     * @param <T>       数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> error(ErrorCode errorCode) {
        Result<T> result = new Result<>();
        result.setCode(errorCode.getCode());
        result.setMessage(errorCode.getMessage());
        result.setSuccess(false);
        return result;
    }

    /**
     * 判断响应是否成功
     *
     * @return true-成功，false-失败
     */
    public boolean isSuccess() {
        return Boolean.TRUE.equals(success);
    }
}
