package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.entity.InventoryAdjustment;
import com.backend.service.inventory.InventoryAdjustmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "库存调整管理", description = "库存调整申请和审批的接口")
@RestController
@RequestMapping("/inventory/adjustment")
public class InventoryAdjustmentController {

    private final InventoryAdjustmentService adjustmentService;

    public InventoryAdjustmentController(InventoryAdjustmentService adjustmentService) {
        this.adjustmentService = adjustmentService;
    }

    @Operation(summary = "获取所有库存调整记录", description = "返回系统中所有库存调整记录（仅管理员）")
    @GetMapping
    public ApiResponse<List<InventoryAdjustment>> getAllAdjustments() {
        List<InventoryAdjustment> adjustments = adjustmentService.getAllAdjustments();
        return ApiResponse.success("获取库存调整记录成功", adjustments);
    }

    @Operation(summary = "根据ID获取库存调整记录", description = "通过调整ID获取详细信息")
    @Parameter(name = "id", description = "调整ID", required = true)
    @GetMapping("/{id}")
    public ApiResponse<InventoryAdjustment> getAdjustmentById(@PathVariable Long id) {
        InventoryAdjustment adjustment = adjustmentService.getAdjustmentById(id);
        return ApiResponse.success("获取库存调整记录成功", adjustment);
    }

    @Operation(summary = "获取我的库存调整记录", description = "获取当前登录用户提交的所有库存调整申请")
    @GetMapping("/my")
    public ApiResponse<List<InventoryAdjustment>> getMyAdjustments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long applicantId = Long.parseLong(authentication.getName());
        List<InventoryAdjustment> adjustments = adjustmentService.getMyAdjustments(applicantId);
        return ApiResponse.success("获取我的库存调整记录成功", adjustments);
    }

    @Operation(summary = "创建库存调整申请", description = "提交新的库存调整申请")
    @PostMapping
    public ApiResponse<InventoryAdjustment> createAdjustment(@RequestBody InventoryAdjustment adjustment) {
        InventoryAdjustment createdAdjustment = adjustmentService.createAdjustment(adjustment);
        return ApiResponse.success("创建库存调整申请成功", createdAdjustment);
    }

    @Operation(summary = "批准库存调整申请", description = "审批并执行库存调整")
    @Parameter(name = "id", description = "调整ID", required = true)
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InventoryAdjustment> approveAdjustment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long approverId = Long.parseLong(authentication.getName());
        String approverName = authentication.getName();
        String comment = request.getOrDefault("comment", "");

        InventoryAdjustment approvedAdjustment = adjustmentService.approveAdjustment(id, comment, approverId, approverName);
        return ApiResponse.success("批准库存调整申请成功", approvedAdjustment);
    }

    @Operation(summary = "删除库存调整记录", description = "删除指定的库存调整记录")
    @Parameter(name = "id", description = "调整ID", required = true)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAdjustment(@PathVariable Long id) {
        adjustmentService.deleteAdjustment(id);
        return ApiResponse.success("删除库存调整记录成功", null);
    }
}