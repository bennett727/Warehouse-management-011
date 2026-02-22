package com.backend.exception;

import com.backend.common.ErrorCode;

public class BusinessException extends RuntimeException {
    private String code;

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = String.valueOf(errorCode.getCode());
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.code = String.valueOf(errorCode.getCode());
    }

    public String getCode() {
        return code;
    }
}