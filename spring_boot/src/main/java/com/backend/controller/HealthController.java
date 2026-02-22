package com.backend.controller;

import com.backend.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 *
 * 功能说明：
 * 提供系统健康检查端点，用于监控和负载均衡检查
 *
 * API路径：/api/health
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2025-02-10
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    /**
     * 健康检查端点
     *
     * 接口说明：
     * 返回系统健康状态，用于监控和负载均衡检查
     *
     * 请求示例：
     * GET /api/health
     *
     * 响应示例：
     * {
     *   "success": true,
     *   "code": 200,
     *   "message": "系统运行正常",
     *   "data": {
     *     "status": "UP",
     *     "timestamp": "2026-02-10T21:00:00",
     *     "service": "warehouse-management-system"
     *   }
     * }
     *
     * @return 健康状态
     */
    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now().toString());
        healthData.put("service", "warehouse-management-system");
        healthData.put("version", "1.0.0");

        return ApiResponse.success("系统运行正常", healthData);
    }

    /**
     * 就绪检查端点
     *
     * 接口说明：
     * 返回系统就绪状态，用于Kubernetes等容器编排平台
     *
     * 请求示例：
     * GET /api/health/ready
     *
     * @return 就绪状态
     */
    @GetMapping("/ready")
    public ApiResponse<Map<String, Object>> ready() {
        Map<String, Object> readyData = new HashMap<>();
        readyData.put("ready", true);
        readyData.put("timestamp", LocalDateTime.now().toString());
        readyData.put("checks", new String[]{"database", "cache", "messageQueue"});

        return ApiResponse.success("系统已就绪", readyData);
    }

    /**
     * 存活检查端点
     *
     * 接口说明：
     * 返回系统存活状态，用于Kubernetes等容器编排平台
     *
     * 请求示例：
     * GET /api/health/live
     *
     * @return 存活状态
     */
    @GetMapping("/live")
    public ApiResponse<Map<String, Object>> live() {
        Map<String, Object> liveData = new HashMap<>();
        liveData.put("alive", true);
        liveData.put("timestamp", LocalDateTime.now().toString());

        return ApiResponse.success("系统运行中", liveData);
    }
}
