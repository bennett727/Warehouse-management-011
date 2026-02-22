package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.DeviceStatusApproval;
import com.backend.service.devicestatus.DeviceStatusApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "设备状态审批管理", description = "设备状态变更申请的审批流程管理接口")
@RestController
@RequestMapping("/device-status-approvals")
public class DeviceStatusApprovalController {

    private final DeviceStatusApprovalService approvalService;

    public DeviceStatusApprovalController(DeviceStatusApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @Operation(summary = "获取所有审批记录", description = "返回系统中所有设备状态审批记录（仅管理员和操作员）")
    @GetMapping
    public ApiResponse<List<DeviceStatusApproval>> getAllApprovals() {
        List<DeviceStatusApproval> approvals = approvalService.getAllApprovals();
        return ApiResponse.success("获取设备状态审批记录成功", approvals);
    }

    @Operation(summary = "根据ID获取审批记录", description = "通过审批ID获取详细信息")
    @Parameter(name = "id", description = "审批ID", required = true)
    @GetMapping("/{id}")
    public ApiResponse<DeviceStatusApproval> getApprovalById(@PathVariable Long id) {
        DeviceStatusApproval approval = approvalService.getApprovalById(id);
        return ApiResponse.success("获取设备状态审批记录成功", approval);
    }

    @Operation(summary = "获取待审批列表", description = "获取所有待审批的设备状态变更申请")
    @GetMapping("/pending")
    public ApiResponse<List<DeviceStatusApproval>> getPendingApprovals() {
        List<DeviceStatusApproval> approvals = approvalService.getPendingApprovals();
        return ApiResponse.success("获取待审批的设备状态审批记录成功", approvals);
    }

    @Operation(summary = "获取我的审批记录", description = "获取当前登录用户提交的所有审批申请")
    @GetMapping("/my")
    public ApiResponse<List<DeviceStatusApproval>> getMyApprovals() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long applicantId = Long.parseLong(authentication.getName());
        List<DeviceStatusApproval> approvals = approvalService.getMyApprovals(applicantId);
        return ApiResponse.success("获取我的设备状态审批记录成功", approvals);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = approvalService.getStats();
        return ApiResponse.success("获取设备状态审批统计成功", stats);
    }

    @PostMapping
    public ApiResponse<DeviceStatusApproval> createApproval(@RequestBody DeviceStatusApproval approval) {
        DeviceStatusApproval createdApproval = approvalService.createApproval(approval);
        return ApiResponse.success("创建设备状态审批申请成功", createdApproval);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DeviceStatusApproval> approveApproval(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long approverId = Long.parseLong(authentication.getName());
        String approverName = authentication.getName();
        String comment = request.getOrDefault("comment", "");

        DeviceStatusApproval approvedApproval = approvalService.approveApproval(id, comment, approverId, approverName);
        return ApiResponse.success("批准设备状态审批申请成功", approvedApproval);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DeviceStatusApproval> rejectApproval(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long approverId = Long.parseLong(authentication.getName());
        String approverName = authentication.getName();
        String comment = request.getOrDefault("comment", "");

        DeviceStatusApproval rejectedApproval = approvalService.rejectApproval(id, comment, approverId, approverName);
        return ApiResponse.success("拒绝设备状态审批申请成功", rejectedApproval);
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<DeviceStatusApproval> cancelApproval(@PathVariable Long id) {
        DeviceStatusApproval cancelledApproval = approvalService.cancelApproval(id);
        return ApiResponse.success("取消设备状态审批申请成功", cancelledApproval);
    }

    @PostMapping("/batch")
    public ApiResponse<Void> batchApprove(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) request.get("ids");
        String action = (String) request.get("action");
        String comment = (String) request.getOrDefault("comment", "");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long approverId = Long.parseLong(authentication.getName());
        String approverName = authentication.getName();

        if ("approve".equals(action)) {
            approvalService.batchApprove(ids, comment, approverId, approverName);
            return ApiResponse.success("批量批准设备状态审批申请成功", null);
        } else if ("reject".equals(action)) {
            approvalService.batchReject(ids, comment, approverId, approverName);
            return ApiResponse.success("批量拒绝设备状态审批申请成功", null);
        } else {
            return ApiResponse.error(400, "无效的操作类型");
        }
    }
}