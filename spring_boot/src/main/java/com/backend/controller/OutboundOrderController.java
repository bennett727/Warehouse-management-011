package com.backend.controller;

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
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.StockOrder;
import com.backend.service.stock.StockOrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/stock/orders")
@RequiredArgsConstructor
@Tag(name = "出库订单管理", description = "出库订单的创建、查询等接口（兼容旧版API）")
public class OutboundOrderController extends BaseController {

    private final StockOrderService orderService;

    @GetMapping("/outbound/list")
    @Operation(summary = "查询出库订单列表", description = "分页查询出库订单列表（兼容旧版API）")
    public ApiResponse<PageResult<StockOrder>> getOutboundOrderList(
            @Parameter(description = "订单类型") @RequestParam(required = false) Integer orderType,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Valid PageRequest pageReq) {
        log.info("查询出库订单列表: orderType={}, status={}", orderType, status);
        Pageable pageable = buildPageable(pageReq);
        PageResult<StockOrder> result = orderService.getStockOrders(pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/outbound/detail/{id}")
    @Operation(summary = "查询出库订单详情", description = "根据ID查询出库订单详细信息（兼容旧版API）")
    public ApiResponse<StockOrder> getOutboundOrderDetail(
            @Parameter(description = "订单ID") @PathVariable Long id) {
        log.info("查询出库订单详情: id={}", id);
        StockOrder order = orderService.getStockOrderById(id);
        return ApiResponse.success(order);
    }

    @PostMapping("/outbound/save")
    @Operation(summary = "创建出库订单", description = "创建新的出库订单（兼容旧版API）")
    public ApiResponse<StockOrder> createOutboundOrder(
            @Valid @RequestBody StockOrder order) {
        log.info("创建出库订单: outboundType={}", order.getOutboundType());
        order.setOrderType(2);
        StockOrder createdOrder = orderService.createStockOrder(order);
        return ApiResponse.success("出库订单创建成功", createdOrder);
    }

    @PostMapping("/outbound/update/{id}")
    @Operation(summary = "更新出库订单", description = "更新出库订单信息（兼容旧版API）")
    public ApiResponse<StockOrder> updateOutboundOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Valid @RequestBody StockOrder order) {
        log.info("更新出库订单: id={}", id);
        StockOrder updatedOrder = orderService.updateStockOrder(id, order);
        return ApiResponse.success("出库订单更新成功", updatedOrder);
    }

    @PostMapping("/outbound/delete/{id}")
    @Operation(summary = "删除出库订单", description = "删除出库订单（兼容旧版API）")
    public ApiResponse<Void> deleteOutboundOrder(
            @Parameter(description = "订单ID") @PathVariable Long id) {
        log.info("删除出库订单: id={}", id);
        orderService.deleteStockOrder(id);
        return ApiResponse.success("出库订单删除成功", null);
    }

    @GetMapping("/inbound/list")
    @Operation(summary = "查询入库订单列表", description = "分页查询入库订单列表（兼容旧版API）")
    public ApiResponse<PageResult<StockOrder>> getInboundOrderList(
            @Parameter(description = "订单类型") @RequestParam(required = false) Integer orderType,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Valid PageRequest pageReq) {
        log.info("查询入库订单列表: orderType={}, status={}", orderType, status);
        Pageable pageable = buildPageable(pageReq);
        PageResult<StockOrder> result = orderService.getStockOrders(pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/inbound/detail/{id}")
    @Operation(summary = "查询入库订单详情", description = "根据ID查询入库订单详细信息（兼容旧版API）")
    public ApiResponse<StockOrder> getInboundOrderDetail(
            @Parameter(description = "订单ID") @PathVariable Long id) {
        log.info("查询入库订单详情: id={}", id);
        StockOrder order = orderService.getStockOrderById(id);
        return ApiResponse.success(order);
    }

    @PostMapping("/inbound/save-with-device")
    @Operation(summary = "创建入库订单", description = "创建新的入库订单（兼容旧版API）")
    public ApiResponse<StockOrder> createInboundOrder(
            @Valid @RequestBody StockOrder order) {
        log.info("创建入库订单: inboundType={}", order.getOutboundType());
        order.setOrderType(1);
        StockOrder createdOrder = orderService.createStockOrder(order);
        return ApiResponse.success("入库订单创建成功", createdOrder);
    }

    @PostMapping("/inbound/update/{id}")
    @Operation(summary = "更新入库订单", description = "更新入库订单信息（兼容旧版API）")
    public ApiResponse<StockOrder> updateInboundOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Valid @RequestBody StockOrder order) {
        log.info("更新入库订单: id={}", id);
        StockOrder updatedOrder = orderService.updateStockOrder(id, order);
        return ApiResponse.success("入库订单更新成功", updatedOrder);
    }

    @PostMapping("/inbound/delete/{id}")
    @Operation(summary = "删除入库订单", description = "删除入库订单（兼容旧版API）")
    public ApiResponse<Void> deleteInboundOrder(
            @Parameter(description = "订单ID") @PathVariable Long id) {
        log.info("删除入库订单: id={}", id);
        orderService.deleteStockOrder(id);
        return ApiResponse.success("入库订单删除成功", null);
    }

    @GetMapping("/generate-order-no")
    @Operation(summary = "生成订单号", description = "生成新的订单号（兼容旧版API）")
    public ApiResponse<String> generateOrderNo(
            @Parameter(description = "订单类型") @RequestParam(required = false) String type) {
        log.info("生成订单号: type={}", type);
        String orderNo = "SO" + System.currentTimeMillis();
        return ApiResponse.success("订单号生成成功", orderNo);
    }

    @PostMapping("/{id}/audit")
    @Operation(summary = "审核订单", description = "审核订单（兼容旧版API）")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StockOrder> auditOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Parameter(description = "状态") @RequestParam Integer status,
            @Parameter(description = "审核人ID") @RequestParam Long auditId) {
        log.info("审核订单: id={}, status={}", id, status);
        StockOrder order = orderService.approveOrder(id, status == 1, auditId, null);
        return ApiResponse.success("订单审核成功", order);
    }
}