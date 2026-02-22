package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.DeviceStatusTransitionRule;
import com.backend.service.devicestatus.DeviceStatusTransitionRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "设备状态转换规则管理", description = "设备状态转换规则的增删改查和验证接口")
@RestController
@RequestMapping("/device-status-transition-rules")
public class DeviceStatusTransitionRuleController {

    private final DeviceStatusTransitionRuleService ruleService;

    public DeviceStatusTransitionRuleController(DeviceStatusTransitionRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @Operation(summary = "获取所有设备状态转换规则", description = "返回系统中所有设备状态转换规则列表")
    @GetMapping
    public ApiResponse<List<DeviceStatusTransitionRule>> getAllRules() {
        List<DeviceStatusTransitionRule> rules = ruleService.getAllRules();
        return ApiResponse.success("获取设备状态转换规则成功", rules);
    }

    @Operation(summary = "根据ID获取设备状态转换规则", description = "通过规则ID获取详细信息")
    @Parameter(name = "id", description = "规则ID", required = true)
    @GetMapping("/{id}")
    public ApiResponse<DeviceStatusTransitionRule> getRuleById(@PathVariable Long id) {
        DeviceStatusTransitionRule rule = ruleService.getRuleById(id);
        return ApiResponse.success("获取设备状态转换规则成功", rule);
    }

    @Operation(summary = "根据设备类型获取状态转换规则", description = "获取指定设备类型的所有状态转换规则")
    @Parameter(name = "deviceTypeId", description = "设备类型ID", required = true)
    @GetMapping("/device-type/{deviceTypeId}")
    public ApiResponse<List<DeviceStatusTransitionRule>> getRulesByDeviceType(@PathVariable Long deviceTypeId) {
        List<DeviceStatusTransitionRule> rules = ruleService.getRulesByDeviceType(deviceTypeId);
        return ApiResponse.success("获取设备类型的状态转换规则成功", rules);
    }

    @Operation(summary = "获取可转换的目标状态", description = "根据源状态获取所有可转换的目标状态列表")
    @Parameter(name = "fromStatus", description = "源状态代码", required = true)
    @GetMapping("/available-target-statuses")
    public ApiResponse<List<Integer>> getAvailableTargetStatuses(@RequestParam Integer fromStatus) {
        List<Integer> targetStatuses = ruleService.getAvailableTargetStatuses(fromStatus);
        return ApiResponse.success("获取可转换的目标状态成功", targetStatuses);
    }

    @Operation(summary = "验证规则", description = "验证设备状态转换规则的有效性")
    @PostMapping("/validate")
    public ApiResponse<Map<String, Object>> validateRule(@RequestBody DeviceStatusTransitionRule rule) {
        Map<String, Object> result = ruleService.validate(rule);
        return ApiResponse.success("规则验证完成", result);
    }

    @Operation(summary = "验证状态转换", description = "验证指定的状态转换是否有效")
    @Parameter(name = "fromStatus", description = "源状态代码", required = true)
    @Parameter(name = "toStatus", description = "目标状态代码", required = true)
    @Parameter(name = "deviceTypeId", description = "设备类型ID（可选）", required = false)
    @GetMapping("/validate-transition")
    public ApiResponse<Map<String, Object>> validateTransition(
            @RequestParam Integer fromStatus,
            @RequestParam Integer toStatus,
            @RequestParam(required = false) Long deviceTypeId) {
        Map<String, Object> result = ruleService.validateTransition(fromStatus, toStatus, deviceTypeId);
        return ApiResponse.success("状态转换验证完成", result);
    }

    @Operation(summary = "创建设备状态转换规则", description = "创建新的设备状态转换规则")
    @PostMapping
    public ApiResponse<DeviceStatusTransitionRule> createRule(@RequestBody DeviceStatusTransitionRule rule) {
        DeviceStatusTransitionRule createdRule = ruleService.createRule(rule);
        return ApiResponse.success("创建设备状态转换规则成功", createdRule);
    }

    @Operation(summary = "更新设备状态转换规则", description = "更新指定的设备状态转换规则")
    @Parameter(name = "id", description = "规则ID", required = true)
    @PutMapping("/{id}")
    public ApiResponse<DeviceStatusTransitionRule> updateRule(
            @PathVariable Long id,
            @RequestBody DeviceStatusTransitionRule rule) {
        DeviceStatusTransitionRule updatedRule = ruleService.updateRule(id, rule);
        return ApiResponse.success("更新设备状态转换规则成功", updatedRule);
    }

    @Operation(summary = "删除设备状态转换规则", description = "删除指定的设备状态转换规则")
    @Parameter(name = "id", description = "规则ID", required = true)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRule(@PathVariable Long id) {
        ruleService.deleteRule(id);
        return ApiResponse.success("删除设备状态转换规则成功", null);
    }

    @Operation(summary = "批量删除设备状态转换规则", description = "批量删除多个设备状态转换规则")
    @DeleteMapping("/batch")
    public ApiResponse<Void> batchDeleteRules(@RequestBody List<Long> ids) {
        ruleService.batchDeleteRules(ids);
        return ApiResponse.success("批量删除设备状态转换规则成功", null);
    }
}