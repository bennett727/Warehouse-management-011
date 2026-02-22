package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.PerformanceLog;
import com.backend.repository.PerformanceLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Tag(name = "性能监控", description = "前端性能数据收集接口")
@RestController
@RequestMapping("/performance-report")
public class PerformanceReportController {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceReportController.class);

    private final PerformanceLogRepository performanceLogRepository;

    public PerformanceReportController(PerformanceLogRepository performanceLogRepository) {
        this.performanceLogRepository = performanceLogRepository;
    }

    @Operation(summary = "提交性能报告", description = "接收并保存前端上报的性能指标数据")
    @PostMapping
    public ApiResponse<Void> reportPerformance(@RequestBody Map<String, Object> performanceData) {
        try {
            logger.info("收到性能报告: {} - {}", performanceData.get("metricType"), performanceData.get("metricName"));

            PerformanceLog performanceLog = new PerformanceLog();

            performanceLog.setMetricType((String) performanceData.get("metricType"));
            performanceLog.setMetricName((String) performanceData.get("metricName"));

            Object metricValueObj = performanceData.get("metricValue");
            if (metricValueObj != null) {
                performanceLog.setMetricValue(Double.valueOf(metricValueObj.toString()));
            }

            performanceLog.setMetricUnit((String) performanceData.get("metricUnit"));
            performanceLog.setPageUrl((String) performanceData.get("pageUrl"));
            performanceLog.setBrowserInfo((String) performanceData.get("browserInfo"));
            performanceLog.setOsInfo((String) performanceData.get("osInfo"));
            performanceLog.setNetworkType((String) performanceData.get("networkType"));
            performanceLog.setDeviceType((String) performanceData.get("deviceType"));

            Object userIdObj = performanceData.get("userId");
            if (userIdObj != null) {
                performanceLog.setUserId(Long.valueOf(userIdObj.toString()));
            }
            performanceLog.setUserName((String) performanceData.get("userName"));

            performanceLog.setAdditionalInfo((String) performanceData.get("additionalInfo"));
            performanceLog.setCreateTime(LocalDateTime.now());

            performanceLogRepository.save(performanceLog);

            logger.info("性能报告保存成功，ID: {}", performanceLog.getId());
            return ApiResponse.success("性能报告已保存", null);

        } catch (Exception e) {
            logger.error("保存性能报告失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "保存性能报告失败");
        }
    }
}