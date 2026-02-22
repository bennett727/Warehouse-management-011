package com.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.controller.base.BaseController;
import com.backend.dto.ApiResponse;
import com.backend.entity.ApprovalRecord;
import com.backend.entity.User;
import com.backend.repository.UserRepository;
import com.backend.service.MultiLevelApprovalService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/approval")
@RequiredArgsConstructor
@Tag(name = "多级审批管理", description = "多级审批相关接口")
public class MultiLevelApprovalController extends BaseController {

    private final MultiLevelApprovalService approvalService;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    @Operation(summary = "获取待审批列表", description = "获取当前用户待处理的审批列表")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<List<ApprovalRecord>> getPendingApprovals(
            @Parameter(description = "审批级别") @RequestParam(required = false) Integer level) {
        Long userId = getCurrentUserId();
        List<ApprovalRecord> records;
        if (level != null) {
            records = approvalService.getPendingApprovalsForUser(level, userId);
        } else {
            records = approvalService.getPendingApprovals(1);
            records.addAll(approvalService.getPendingApprovals(2));
            records.addAll(approvalService.getPendingApprovals(3));
        }
        return ApiResponse.success(records);
    }

    @GetMapping("/list")
    @Operation(summary = "获取审批记录列表", description = "分页获取审批记录列表")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Page<ApprovalRecord>> getApprovalRecords(
            @Parameter(description = "业务类型") @RequestParam(required = false) String businessType,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "页码") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createTime").descending());
        Page<ApprovalRecord> records = approvalService.getApprovalRecords(businessType, status, pageable);
        return ApiResponse.success(records);
    }

    @GetMapping("/detail/{id}")
    @Operation(summary = "获取审批详情", description = "根据ID获取审批记录详情")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<ApprovalRecord> getApprovalDetail(
            @Parameter(description = "审批记录ID") @PathVariable Long id) {
        ApprovalRecord record = approvalService.getApprovalRecord(id)
                .orElseThrow(() -> new IllegalArgumentException("审批记录不存在"));
        return ApiResponse.success(record);
    }

    @GetMapping("/business/{businessType}/{businessId}")
    @Operation(summary = "根据业务ID获取审批记录", description = "根据业务类型和业务ID获取审批记录")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<ApprovalRecord> getByBusinessId(
            @Parameter(description = "业务类型") @PathVariable String businessType,
            @Parameter(description = "业务ID") @PathVariable Long businessId) {
        ApprovalRecord record = approvalService.getApprovalRecord(businessId, businessType)
                .orElseThrow(() -> new IllegalArgumentException("审批记录不存在"));
        return ApiResponse.success(record);
    }

    @PostMapping("/approve/{id}")
    @Operation(summary = "审批通过", description = "审批通过指定级别的审批")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<ApprovalRecord> approve(
            @Parameter(description = "审批记录ID") @PathVariable Long id,
            @Parameter(description = "审批级别") @RequestParam Integer level,
            @RequestBody(required = false) Map<String, String> body) {
        Long userId = getCurrentUserId();
        String remark = body != null ? body.get("remark") : null;
        ApprovalRecord record = approvalService.approve(id, userId, level, remark);
        return ApiResponse.success("审批通过", record);
    }

    @PostMapping("/reject/{id}")
    @Operation(summary = "审批驳回", description = "驳回审批")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<ApprovalRecord> reject(
            @Parameter(description = "审批记录ID") @PathVariable Long id,
            @Parameter(description = "审批级别") @RequestParam Integer level,
            @RequestBody(required = false) Map<String, String> body) {
        Long userId = getCurrentUserId();
        String remark = body != null ? body.get("remark") : null;
        ApprovalRecord record = approvalService.reject(id, userId, level, remark);
        return ApiResponse.success("审批已驳回", record);
    }

    @PostMapping("/cancel/{businessType}/{businessId}")
    @Operation(summary = "取消审批", description = "取消指定业务的审批")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Void> cancelApproval(
            @Parameter(description = "业务类型") @PathVariable String businessType,
            @Parameter(description = "业务ID") @PathVariable Long businessId) {
        approvalService.cancelApproval(businessId, businessType);
        return ApiResponse.success("审批已取消", null);
    }

    @GetMapping("/count/pending")
    @Operation(summary = "获取待审批数量", description = "获取当前待审批的总数量")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Long> countPending() {
        long count = approvalService.countPendingApprovals();
        return ApiResponse.success(count);
    }

    @GetMapping("/can-execute/{businessType}/{businessId}")
    @Operation(summary = "检查是否可执行", description = "检查指定业务是否已通过审批可执行")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Boolean> canExecute(
            @Parameter(description = "业务类型") @PathVariable String businessType,
            @Parameter(description = "业务ID") @PathVariable Long businessId) {
        boolean canExecute = approvalService.canExecute(businessId, businessType);
        return ApiResponse.success(canExecute);
    }
}
