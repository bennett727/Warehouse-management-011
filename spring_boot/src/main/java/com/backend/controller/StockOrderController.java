package com.backend.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.controller.base.BaseController;
import com.backend.dto.ApiResponse;
import com.backend.dto.BatchOperationRequest;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.service.stock.StockOrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 订单管理控制器（统一优化版）
 *
 * 功能说明：
 * 提供出入库订单管理的RESTful API接口，包括订单的创建、审核、执行等功能
 *
 * 优化记录：
 * - 2025-02-08: 统一优化版本
 * 1. 统一分页参数（page/size/sort/order）
 * 2. 标准化批量操作接口
 * 3. 优化API路径设计
 * 4. 完善Swagger文档
 *
 * API路径：/api/orders
 *
 * 权限控制：
 * - 查询操作：ADMIN, OPERATOR, TECHNICIAN
 * - 创建/更新：ADMIN, OPERATOR
 * - 审核/执行：ADMIN, OPERATOR
 * - 取消订单：ADMIN
 *
 * @author 后端优化团队
 * @version 3.0
 * @since 2025-02-08
 */
@Slf4j
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "订单管理", description = "出入库订单的创建、审核、执行等接口（统一优化版）")
public class StockOrderController extends BaseController {

    private final StockOrderService orderService;

    // ==================== 订单CRUD接口 ====================

    /**
     * 创建订单
     *
     * @param order 订单信息
     * @return 创建后的订单
     */
    @PostMapping
    @Operation(summary = "创建订单", description = "创建新的出入库订单")
    public ApiResponse<StockOrder> createOrder(
            @Valid @RequestBody StockOrder order) {
        log.info("创建订单: orderType={}", order.getOrderType());
        StockOrder createdOrder = orderService.createStockOrder(order);
        return ApiResponse.success("订单创建成功", createdOrder);
    }

    /**
     * 根据ID查询订单
     *
     * @param orderId 订单ID
     * @return 订单信息
     */
    @GetMapping("/{orderId}")
    @Operation(summary = "查询订单详情", description = "根据ID查询订单详细信息")
    public ApiResponse<StockOrder> getOrderById(
            @Parameter(description = "订单ID") @PathVariable Long orderId) {
        StockOrder order = orderService.getStockOrderById(orderId);
        return ApiResponse.success(order);
    }

    /**
     * 根据订单号查询订单
     *
     * @param orderNo 订单号
     * @return 订单信息
     */
    @GetMapping("/no/{orderNo}")
    @Operation(summary = "根据订单号查询", description = "根据订单号查询订单信息")
    public ApiResponse<StockOrder> getOrderByNo(
            @Parameter(description = "订单号") @PathVariable String orderNo) {
        StockOrder order = orderService.getStockOrderByNo(orderNo);
        return ApiResponse.success(order);
    }

    /**
     * 分页查询订单列表（统一优化版）
     *
     * 优化点：
     * 1. 使用统一分页参数对象PageRequest（page/size/sort/order）
     * 2. 页码从1开始，符合前端使用习惯
     * 3. 支持动态排序
     * 4. 限制最大每页100条
     *
     * @param orderType 订单类型
     * @param status    状态
     * @param keyword   关键词
     * @param pageReq   统一分页参数
     * @return 分页结果
     */
    @GetMapping
    @Operation(summary = "查询订单列表", description = "分页查询订单列表，支持统一分页参数和动态排序")
    public ApiResponse<PageResult<StockOrder>> getOrderList(
            @Parameter(description = "订单类型：1-入库单 2-出库单 3-调拨单 4-盘点单") @RequestParam(required = false) Integer orderType,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Valid PageRequest pageReq) {

        Pageable pageable = buildPageable(pageReq);
        PageResult<StockOrder> result = orderService.getStockOrders(pageable);
        return ApiResponse.success(result);
    }

    /**
     * 获取订单明细
     *
     * @param orderId 订单ID
     * @return 明细列表
     */
    @GetMapping("/{orderId}/items")
    @Operation(summary = "获取订单明细", description = "获取指定订单的明细列表")
    public ApiResponse<List<StockOrderItem>> getOrderItems(
            @Parameter(description = "订单ID") @PathVariable Long orderId) {
        List<StockOrderItem> items = orderService.getStockOrderItems(orderId);
        return ApiResponse.success(items);
    }

    // ==================== 统一批量操作接口 ====================

    /**
     * 批量取消订单
     *
     * 优化点：
     * 1. 使用统一批量操作请求对象BatchOperationRequest
     * 2. 限制单次最多100条
     * 3. 返回详细的操作结果
     *
     * @param request 批量操作请求
     * @return 操作结果
     */
    @PostMapping("/batch/cancel")
    @Operation(summary = "批量取消订单", description = "批量取消订单，单次最多100条")
    public ApiResponse<BatchOperationResult> batchCancelOrders(
            @Valid @RequestBody BatchOperationRequest request) {

        log.info("批量取消订单: count={}", request.getCount());

        List<Long> safeIds = request.getSafeIds();
        BatchOperationResult result = new BatchOperationResult();

        int successCount = 0;
        int failCount = 0;

        for (Long orderId : safeIds) {
            try {
                orderService.cancelOrder(orderId, getCurrentUserId(), request.getReason());
                successCount++;
            } catch (Exception e) {
                log.warn("取消订单失败: orderId={}, error={}", orderId, e.getMessage());
                failCount++;
                result.addFailedItem(orderId, e.getMessage());
            }
        }

        result.setTotal(safeIds.size());
        result.setSuccessCount(successCount);
        result.setFailCount(failCount);

        return ApiResponse.success(
                String.format("批量取消完成：成功%d条，失败%d条", successCount, failCount),
                result);
    }

    // ==================== 订单流程接口 ====================

    /**
     * 提交订单审核
     *
     * @param orderId 订单ID
     * @param request 提交请求
     * @return 更新后的订单
     */
    @PostMapping("/{orderId}/submit")
    @Operation(summary = "提交订单审核", description = "将草稿状态的订单提交审核")
    public ApiResponse<StockOrder> submitOrder(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @RequestBody SubmitOrderRequest request) {
        log.info("提交订单审核: orderId={}", orderId);
        StockOrder order = orderService.submitOrder(orderId, request.getOperatorId());
        return ApiResponse.success("订单提交成功", order);
    }

    /**
     * 审核订单
     *
     * @param orderId 订单ID
     * @param request 审核请求
     * @return 更新后的订单
     */
    @PostMapping("/{orderId}/approve")
    @Operation(summary = "审核订单", description = "审核待审核状态的订单")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StockOrder> approveOrder(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @Valid @RequestBody ApproveOrderRequest request) {
        log.info("审核订单: orderId={}, approved={}", orderId, request.isApproved());
        StockOrder order = orderService.approveOrder(orderId, request.isApproved(),
                request.getApproverId(), request.getRemark());
        String message = request.isApproved() ? "订单审核通过" : "订单已拒绝";
        return ApiResponse.success(message, order);
    }

    /**
     * 执行订单
     *
     * @param orderId 订单ID
     * @param request 执行请求
     * @return 执行结果
     */
    @PostMapping("/{orderId}/execute")
    @Operation(summary = "执行订单", description = "执行已审核状态的订单，进行库存操作")
    public ApiResponse<StockOrderService.OrderExecuteResult> executeOrder(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @RequestBody ExecuteOrderRequest request) {
        log.info("执行订单: orderId={}", orderId);
        StockOrderService.OrderExecuteResult result = orderService.executeOrder(orderId, request.getOperatorId());
        if (result.isSuccess()) {
            return ApiResponse.success("订单执行成功", result);
        } else {
            return ApiResponse.error(500, result.getMessage());
        }
    }

    /**
     * 取消订单
     *
     * @param orderId 订单ID
     * @param request 取消请求
     * @return 更新后的订单
     */
    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "取消订单", description = "取消订单（仅限草稿或待审核状态）")
    public ApiResponse<StockOrder> cancelOrder(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @RequestBody CancelOrderRequest request) {
        log.info("取消订单: orderId={}", orderId);
        StockOrder order = orderService.cancelOrder(orderId, getCurrentUserId(), request.getReason());
        return ApiResponse.success("订单已取消", order);
    }

    // ==================== 订单统计接口 ====================

    /**
     * 获取订单统计
     *
     * @return 订单统计结果
     */
    @GetMapping("/statistics")
    @Operation(summary = "订单统计", description = "获取订单数量统计（按类型和状态）")
    public ApiResponse<StockOrderService.OrderStatistics> getOrderStatistics() {
        StockOrderService.OrderStatistics statistics = orderService.getOrderStatistics();
        return ApiResponse.success(statistics);
    }

    // ==================== 辅助方法 ====================

    // ==================== 内部请求类 ====================

    /**
     * 提交订单请求
     */
    public static class SubmitOrderRequest {
        private Long operatorId;

        public Long getOperatorId() {
            return operatorId;
        }

        public void setOperatorId(Long operatorId) {
            this.operatorId = operatorId;
        }
    }

    /**
     * 审核订单请求
     */
    public static class ApproveOrderRequest {
        private boolean approved;
        private Long approverId;
        private String remark;

        public boolean isApproved() {
            return approved;
        }

        public void setApproved(boolean approved) {
            this.approved = approved;
        }

        public Long getApproverId() {
            return approverId;
        }

        public void setApproverId(Long approverId) {
            this.approverId = approverId;
        }

        public String getRemark() {
            return remark;
        }

        public void setRemark(String remark) {
            this.remark = remark;
        }
    }

    /**
     * 执行订单请求
     */
    public static class ExecuteOrderRequest {
        private Long operatorId;

        public Long getOperatorId() {
            return operatorId;
        }

        public void setOperatorId(Long operatorId) {
            this.operatorId = operatorId;
        }
    }

    /**
     * 取消订单请求
     */
    public static class CancelOrderRequest {
        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    /**
     * 批量操作结果
     */
    public static class BatchOperationResult {
        private int total;
        private int successCount;
        private int failCount;
        private java.util.Map<Long, String> failedItems = new java.util.HashMap<>();

        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }

        public int getSuccessCount() {
            return successCount;
        }

        public void setSuccessCount(int successCount) {
            this.successCount = successCount;
        }

        public int getFailCount() {
            return failCount;
        }

        public void setFailCount(int failCount) {
            this.failCount = failCount;
        }

        public java.util.Map<Long, String> getFailedItems() {
            return failedItems;
        }

        public void setFailedItems(java.util.Map<Long, String> failedItems) {
            this.failedItems = failedItems;
        }

        public void addFailedItem(Long id, String reason) {
            failedItems.put(id, reason);
        }
    }
}
