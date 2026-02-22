package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.ErrorLog;
import com.backend.repository.ErrorLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Tag(name = "错误监控", description = "前端错误报告收集接口")
@RestController
@RequestMapping("/error-report")
public class ErrorReportController {

    private static final Logger logger = LoggerFactory.getLogger(ErrorReportController.class);

    private final ErrorLogRepository errorLogRepository;

    public ErrorReportController(ErrorLogRepository errorLogRepository) {
        this.errorLogRepository = errorLogRepository;
    }

    @Operation(summary = "提交错误报告", description = "接收并保存前端上报的错误信息")
    @PostMapping
    public ApiResponse<Void> reportError(@RequestBody Map<String, Object> errorData) {
        try {
            logger.info("收到错误报告: {}", errorData.get("errorMessage"));

            ErrorLog errorLog = new ErrorLog();

            errorLog.setErrorType((String) errorData.getOrDefault("errorType", "UNKNOWN"));
            errorLog.setErrorMessage((String) errorData.get("errorMessage"));
            errorLog.setErrorStack((String) errorData.get("errorStack"));
            errorLog.setErrorUrl((String) errorData.get("errorUrl"));
            errorLog.setUserAgent((String) errorData.get("userAgent"));
            errorLog.setBrowserInfo((String) errorData.get("browserInfo"));
            errorLog.setOsInfo((String) errorData.get("osInfo"));

            Object userIdObj = errorData.get("userId");
            if (userIdObj != null) {
                errorLog.setUserId(Long.valueOf(userIdObj.toString()));
            }
            errorLog.setUserName((String) errorData.get("userName"));

            errorLog.setAdditionalInfo((String) errorData.get("additionalInfo"));
            errorLog.setResolved(false);
            errorLog.setCreateTime(LocalDateTime.now());

            errorLogRepository.save(errorLog);

            logger.info("错误报告保存成功，ID: {}", errorLog.getId());
            return ApiResponse.success("错误报告已保存", null);

        } catch (Exception e) {
            logger.error("保存错误报告失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "保存错误报告失败");
        }
    }
}