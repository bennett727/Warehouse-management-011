package com.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageResult;
import com.backend.entity.ApprovalRuleConfig;
import com.backend.service.approval.ApprovalRuleConfigService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 审批规则配置控制器
 */
@RestController
@RequestMapping("/approval-rules")
@RequiredArgsConstructor
@Tag(name = "审批规则配置", description = "设备状态变更审批规则管理接口")
public class ApprovalRuleConfigController {

    private final ApprovalRuleConfigService ruleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建审批规则", description = "创建新的审批规则配置")
    public ApiResponse<ApprovalRuleConfig> createRule(
            @Parameter(description = "审批规则") @RequestBody ApprovalRuleConfig rule,
            @Parameter(description = "创建人ID") @RequestParam Long creatorId) {
        ApprovalRuleConfig created = ruleService.createRule(rule, creatorId);
        return ApiResponse.success(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新审批规则", description = "更新指定的审批规则配置")
    public ApiResponse<ApprovalRuleConfig> updateRule(
            @Parameter(description = "规则ID") @PathVariable Long id,
            @Parameter(description = "审批规则") @RequestBody ApprovalRuleConfig rule,
            @Parameter(description = "更新人ID") @RequestParam Long updaterId) {
        ApprovalRuleConfig updated = ruleService.updateRule(id, rule, updaterId);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除审批规则", description = "删除指定的审批规则配置")
    public ApiResponse<Void> deleteRule(
            @Parameter(description = "规则ID") @PathVariable Long id) {
        ruleService.deleteRule(id);
        return ApiResponse.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取审批规则详情", description = "获取指定审批规则的详细信息")
    public ApiResponse<ApprovalRuleConfig> getRuleById(
            @Parameter(description = "规则ID") @PathVariable Long id) {
        ApprovalRuleConfig rule = ruleService.getRuleById(id);
        return ApiResponse.success(rule);
    }

    @GetMapping("/enabled")
    @Operation(summary = "获取所有启用的规则", description = "获取所有启用状态的审批规则列表")
    public ApiResponse<List<ApprovalRuleConfig>> getAllEnabledRules() {
        List<ApprovalRuleConfig> rules = ruleService.getAllEnabledRules();
        return ApiResponse.success(rules);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询规则", description = "分页查询审批规则列表")
    public ApiResponse<PageResult<ApprovalRuleConfig>> getRulesByPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "规则名称") @RequestParam(required = false) String ruleName,
            @Parameter(description = "是否启用") @RequestParam(required = false) Boolean enabled) {
        PageResult<ApprovalRuleConfig> result = ruleService.getRulesByPage(page, size, ruleName, enabled);
        return ApiResponse.success(result);
    }

    @GetMapping("/applicable")
    @Operation(summary = "查询适用的审批规则", description = "根据状态变更查询适用的审批规则")
    public ApiResponse<List<ApprovalRuleConfig>> getApplicableRules(
            @Parameter(description = "源状态") @RequestParam(required = false) String fromStatus,
            @Parameter(description = "目标状态") @RequestParam String toStatus) {
        List<ApprovalRuleConfig> rules = ruleService.getApplicableRules(fromStatus, toStatus);
        return ApiResponse.success(rules);
    }

    @GetMapping("/check-approval")
    @Operation(summary = "检查是否需要审批", description = "检查指定状态变更是否需要审批")
    public ApiResponse<Map<String, Object>> checkApprovalRequired(
            @Parameter(description = "源状态") @RequestParam(required = false) String fromStatus,
            @Parameter(description = "目标状态") @RequestParam String toStatus) {
        boolean requires = ruleService.requiresApproval(fromStatus, toStatus);
        int level = ruleService.getApprovalLevel(fromStatus, toStatus);
        boolean fastTrack = ruleService.supportsFastTrack(fromStatus, toStatus);

        return ApiResponse.success(Map.of(
                "requiresApproval", requires,
                "approvalLevel", level,
                "supportsFastTrack", fastTrack));
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "启用/禁用规则", description = "切换审批规则的启用状态")
    public ApiResponse<Void> toggleRule(
            @Parameter(description = "规则ID") @PathVariable Long id,
            @Parameter(description = "是否启用") @RequestParam boolean enabled,
            @Parameter(description = "更新人ID") @RequestParam Long updaterId) {
        ruleService.toggleRule(id, enabled, updaterId);
        return ApiResponse.success();
    }

    @PutMapping("/priorities")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "批量更新优先级", description = "批量更新审批规则的优先级")
    public ApiResponse<Void> updatePriorities(
            @Parameter(description = "优先级映射") @RequestBody Map<Long, Integer> priorities,
            @Parameter(description = "更新人ID") @RequestParam Long updaterId) {
        ruleService.updatePriorities(priorities, updaterId);
        return ApiResponse.success();
    }

    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "初始化默认规则", description = "初始化系统默认的审批规则配置")
    public ApiResponse<Void> initializeDefaultRules(
            @Parameter(description = "创建人ID") @RequestParam Long creatorId) {
        ruleService.initializeDefaultRules(creatorId);
        return ApiResponse.success();
    }
}
