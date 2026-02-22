package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.enums.DeviceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 设备状态字典控制器
 * 提供设备状态字典数据
 */
@Slf4j
@RestController
@RequestMapping("/devices/status")
@RequiredArgsConstructor
public class DeviceStatusDictionaryController {

    /**
     * 获取设备状态列表
     * 返回所有可用的设备状态
     *
     * @return 状态列表
     */
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getDeviceStatusList() {
        log.info("获取设备状态字典列表");
        
        List<Map<String, Object>> statusList = new ArrayList<>();
        
        for (DeviceStatus status : DeviceStatus.values()) {
            Map<String, Object> statusMap = new HashMap<>();
            statusMap.put("statusCode", status.getCode());
            statusMap.put("statusName", status.getDescription());
            statusMap.put("description", status.getDescription());
            statusMap.put("sortOrder", status.getCode() + 10);
            statusMap.put("isActive", true);
            statusList.add(statusMap);
        }
        
        return ApiResponse.success(statusList);
    }
}
