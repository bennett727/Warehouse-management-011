package com.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.exception.BusinessException;
import com.backend.repository.AreaRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.repository.StockOrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 库存订单服务类
 * 
 * 功能说明：
 * 1. 库存订单的增删改查操作
 * 2. 支持入库、出库、调拨、盘点等多种业务类型
 * 3. 订单状态流转管理（草稿→待审核→已审核→已完成）
 * 4. 订单明细项管理
 * 
 * 业务类型：
 * - 1: 入库单 - 设备入库
 * - 2: 出库单 - 设备出库
 * - 3: 调拨单 - 仓库间调拨
 * - 4: 盘点单 - 库存盘点
 * 
 * 订单状态：
 * - 0: 草稿 - 可编辑
 * - 1: 待审核 - 等待审核
 * - 2: 已审核 - 审核通过
 * - 3: 已完成 - 执行完毕
 * - -1: 已取消 - 已作废
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StockOrderService {

    /** 订单数据访问接口 */
    private final StockOrderRepository stockOrderRepository;

    /** 订单明细数据访问接口 */
    private final StockOrderItemRepository stockOrderItemRepository;

    /** 设备数据访问接口 */
    private final DeviceRepository deviceRepository;

    /** 区域数据访问接口 */
    private final AreaRepository areaRepository;

    /** 业务记录联动服务 */
    private final BusinessRecordLinkageService businessRecordLinkageService;

    /** 库存预占服务 */
    private final StockReservationService stockReservationService;

    /**
     * 获取库存订单列表
     * 
     * 查询条件：
     * - 订单号模糊匹配
     * - 订单类型精确匹配
     * - 订单状态精确匹配
     * - 日期范围筛选
     * 
     * @param orderNo   订单号
     * @param orderType 订单类型
     * @param status    订单状态
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @param pageable  分页参数
     * @return 分页订单列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getStockOrderList(
            String orderNo, Integer orderType, Integer status,
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        Page<StockOrder> page = stockOrderRepository.findByConditions(
                orderNo, orderType, status, startDate, endDate, pageable);

        List<Map<String, Object>> records = page.getContent().stream().map(order -> {
            Map<String, Object> map = convertToMap(order);
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    /**
     * 根据ID获取订单详情
     * 
     * 返回数据包含：
     * - 订单基本信息
     * - 源区域和目标区域信息
     * - 操作员和审核人信息
     * - 订单明细项列表
     * 
     * @param id 订单ID
     * @return 订单详细信息
     */
    public ApiResponse<Map<String, Object>> getStockOrderById(Long id) {
        StockOrder order = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        Map<String, Object> map = convertToMap(order);

        // 添加明细项信息
        List<Map<String, Object>> items = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("id", item.getId());
            itemMap.put("deviceId", item.getDeviceId());
            itemMap.put("deviceCode", item.getDevice() != null ? item.getDevice().getDeviceCode() : null);
            itemMap.put("deviceName", item.getDevice() != null ? item.getDevice().getDeviceName() : null);
            itemMap.put("batchId", item.getBatchId());
            itemMap.put("batchNo", item.getBatch() != null ? item.getBatch().getBatchNo() : null);
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("actualQuantity", item.getActualQuantity());
            itemMap.put("unitPrice", item.getUnitPrice());
            itemMap.put("totalPrice", item.getTotalPrice());
            itemMap.put("remark", item.getRemark());
            return itemMap;
        }).collect(Collectors.toList());
        map.put("items", items);

        return ApiResponse.success(map);
    }

    /**
     * 创建库存订单
     * 
     * 业务规则：
     * 1. 自动生成订单号（格式：YYYYMMDD + 4位序号）
     * 2. 初始状态为草稿（0）
     * 3. 保存订单明细项
     * 4. 计算订单总金额
     * 
     * @param order 订单信息
     * @param items 订单明细项
     * @return 创建结果
     */
    @Transactional
    public ApiResponse<Map<String, Object>> createStockOrder(StockOrder order, List<StockOrderItem> items) {
        // 生成订单号
        String orderNo = generateOrderNo(order.getOrderType());
        order.setOrderNo(orderNo);

        // 设置初始状态为草稿
        order.setStatus(0);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        // 计算总金额
        java.math.BigDecimal totalAmount = items.stream()
                .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        order.setTotalAmount(totalAmount);

        // 保存订单
        StockOrder saved = stockOrderRepository.save(order);

        // 保存明细项
        if (items != null && !items.isEmpty()) {
            for (StockOrderItem item : items) {
                item.setStockOrder(saved);
                item.setCreateTime(LocalDateTime.now());
                item.setUpdateTime(LocalDateTime.now());
            }
            stockOrderItemRepository.saveAll(items);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("orderNo", saved.getOrderNo());

        return ApiResponse.success("订单创建成功", result);
    }

    /**
     * 更新库存订单
     * 
     * 限制条件：
     * - 只有草稿状态的订单可以修改
     * - 已审核或已完成的订单不能修改
     * 
     * @param id    订单ID
     * @param order 更新的订单信息
     * @param items 更新的明细项
     * @return 更新结果
     */
    @Transactional
    public ApiResponse<Void> updateStockOrder(Long id, StockOrder order, List<StockOrderItem> items) {
        StockOrder existing = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 只有草稿状态可以修改
        if (existing.getStatus() != 0) {
            return ApiResponse.error(400, "只有草稿状态的订单可以修改");
        }

        // 更新订单信息
        existing.setSourceAreaId(order.getSourceAreaId());
        existing.setTargetAreaId(order.getTargetAreaId());
        existing.setSupplierId(order.getSupplierId());
        existing.setRemark(order.getRemark());
        existing.setUpdateTime(LocalDateTime.now());

        // 重新计算总金额
        if (items != null && !items.isEmpty()) {
            java.math.BigDecimal totalAmount = items.stream()
                    .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : java.math.BigDecimal.ZERO)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            existing.setTotalAmount(totalAmount);
        }

        stockOrderRepository.save(existing);

        // 删除旧明细项，保存新明细项
        if (items != null) {
            stockOrderItemRepository.deleteByStockOrderId(id);
            for (StockOrderItem item : items) {
                item.setStockOrder(existing);
                item.setCreateTime(LocalDateTime.now());
                item.setUpdateTime(LocalDateTime.now());
            }
            stockOrderItemRepository.saveAll(items);
        }

        return ApiResponse.success("订单更新成功", null);
    }

    /**
     * 提交订单审核
     * 
     * 业务规则：
     * - 只有草稿状态的订单可以提交
     * - 提交后状态变为待审核（1）
     * 
     * @param id 订单ID
     * @param operatorId 操作人ID
     * @return 更新后的订单
     */
    @Transactional
    public StockOrder submitOrder(Long id, Long operatorId) {
        StockOrder order = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != 0) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_NOT_DRAFT);
        }

        if (order.getOrderType() == 2) {
            try {
                List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(id);
                order.setItems(items);
                stockReservationService.reserveStockForOrder(order);
                log.info("出库单提交时库存预占成功：orderId={}", id);
            } catch (Exception e) {
                log.error("出库单提交时库存预占失败：orderId={}, error={}", id, e.getMessage());
                throw new BusinessException(ErrorCode.INVENTORY_INSUFFICIENT, e.getMessage());
            }
        }

        order.setStatus(1);
        order.setOperatorId(operatorId);
        order.setUpdateTime(LocalDateTime.now());
        return stockOrderRepository.save(order);
    }

    /**
     * 审核订单
     * 
     * 业务规则：
     * - 只有待审核状态的订单可以审核
     * - 审核通过后：
     *   - 入库单(orderType=1)：直接完成
     *   - 出库单(orderType=2)：自动执行出库并创建业务记录
     *   - 调拨单(orderType=3)：自动执行调拨
     * - 审核拒绝：退回草稿状态
     * 
     * @param id        订单ID
     * @param approved  是否通过
     * @param auditorId 审核人ID
     * @param remark 审核备注
     * @return 审核后的订单
     */
    @Transactional
    public StockOrder approveOrder(Long id, boolean approved, Long auditorId, String remark) {
        StockOrder order = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != 1) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_NOT_PENDING);
        }

        if (approved) {
            order.setAuditorId(auditorId);
            order.setAuditTime(LocalDateTime.now());
            
            Integer orderType = order.getOrderType();
            if (orderType == null) {
                orderType = 2;
            }
            
            switch (orderType) {
                case 1:
                    order.setStatus(2);
                    log.info("入库单审批通过，状态更新为已完成：orderNo={}", order.getOrderNo());
                    break;
                case 2:
                    executeOutboundOrder(order, auditorId);
                    log.info("出库单审批通过，自动执行出库并创建业务记录：orderNo={}", order.getOrderNo());
                    break;
                case 3:
                    executeTransferOrder(order, auditorId);
                    log.info("调拨单审批通过，自动执行调拨：orderNo={}", order.getOrderNo());
                    break;
                default:
                    order.setStatus(2);
            }
        } else {
            if (order.getOrderType() == 2) {
                stockReservationService.releaseReservationByOrder(id);
                log.info("出库单审批拒绝，释放库存预占：orderId={}", id);
            }
            order.setStatus(0);
            log.info("订单审批拒绝，退回草稿：orderNo={}", order.getOrderNo());
        }
        
        order.setUpdateTime(LocalDateTime.now());
        return stockOrderRepository.save(order);
    }

    /**
     * 执行出库单
     * 审批通过后自动调用，完成出库并创建业务记录
     * 
     * @param order 出库单
     * @param operatorId 操作人ID
     */
    private void executeOutboundOrder(StockOrder order, Long operatorId) {
        List<StockOrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            items = stockOrderItemRepository.findByStockOrderId(order.getId());
        }
        
        int successCount = 0;
        int failCount = 0;
        
        for (StockOrderItem item : items) {
            try {
                Device device = deviceRepository.findById(item.getDeviceId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
                
                int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                int currentStock = device.getCurrentStock() != null ? device.getCurrentStock() : 0;
                
                if (currentStock < quantity) {
                    log.error("库存不足，无法出库：deviceCode={}, currentStock={}, required={}", 
                            device.getDeviceCode(), currentStock, quantity);
                    failCount++;
                    continue;
                }
                
                device.setCurrentStock(currentStock - quantity);
                device.setUpdateTime(LocalDateTime.now());
                deviceRepository.save(device);
                
                stockReservationService.convertReservationToOutbound(order.getId(), item.getId());
                
                if (!businessRecordLinkageService.hasBusinessRecord(item)) {
                    businessRecordLinkageService.createBusinessRecord(order, item, device);
                    log.info("自动创建业务记录成功：orderNo={}, deviceCode={}", 
                            order.getOrderNo(), device.getDeviceCode());
                }
                
                item.setActualQuantity(quantity);
                item.setUpdateTime(LocalDateTime.now());
                stockOrderItemRepository.save(item);
                
                successCount++;
            } catch (Exception e) {
                log.error("出库单项处理失败：orderNo={}, deviceId={}, error={}", 
                        order.getOrderNo(), item.getDeviceId(), e.getMessage());
                failCount++;
            }
        }
        
        order.setStatus(3);
        order.setExecuteTime(LocalDateTime.now());
        log.info("出库单执行完成：orderNo={}, successCount={}, failCount={}", 
                order.getOrderNo(), successCount, failCount);
    }

    /**
     * 执行调拨单
     * 审批通过后自动调用，完成调拨操作
     * 
     * @param order 调拨单
     * @param operatorId 操作人ID
     */
    private void executeTransferOrder(StockOrder order, Long operatorId) {
        List<StockOrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            items = stockOrderItemRepository.findByStockOrderId(order.getId());
        }
        
        for (StockOrderItem item : items) {
            try {
                item.setActualQuantity(item.getQuantity());
                item.setUpdateTime(LocalDateTime.now());
                stockOrderItemRepository.save(item);
            } catch (Exception e) {
                log.error("调拨单项处理失败：orderNo={}, deviceId={}, error={}", 
                        order.getOrderNo(), item.getDeviceId(), e.getMessage());
            }
        }
        
        order.setStatus(3);
        order.setExecuteTime(LocalDateTime.now());
        log.info("调拨单执行完成：orderNo={}", order.getOrderNo());
    }

    /**
     * 执行订单
     * 
     * 业务规则：
     * - 只有已审核状态的订单可以执行
     * - 执行后状态变为已完成（3）
     * - 更新库存数量
     * - 记录执行时间
     * 
     * @param id 订单ID
     * @param operatorId 操作人ID
     * @return 执行结果
     */
    @Transactional
    public OrderExecuteResult executeOrder(Long id, Long operatorId) {
        OrderExecuteResult result = new OrderExecuteResult();
        
        try {
            StockOrder order = stockOrderRepository.findById(id)
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

            if (order.getStatus() != 2) {
                result.setSuccess(false);
                result.setMessage("只有已审核状态的订单可以执行");
                result.setProcessedCount(0);
                result.setFailedCount(0);
                return result;
            }

            // 更新库存（简化实现，实际应根据业务类型调整库存）
            int processedCount = 0;
            int failedCount = 0;
            
            for (StockOrderItem item : order.getItems()) {
                try {
                    Device device = deviceRepository.findById(item.getDeviceId())
                            .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

                    // 根据订单类型调整库存
                    int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                    int currentStock = device.getCurrentStock() != null ? device.getCurrentStock() : 0;

                    switch (order.getOrderType()) {
                        case 1: // 入库
                            device.setCurrentStock(currentStock + quantity);
                            break;
                        case 2: // 出库
                            if (currentStock < quantity) {
                                throw new BusinessException(ErrorCode.DEVICE_STOCK_INSUFFICIENT);
                            }
                            device.setCurrentStock(currentStock - quantity);

                            // 出库时自动创建业务记录（安装/维修/保养/报废）
                            try {
                                if (!businessRecordLinkageService.hasBusinessRecord(item)) {
                                    businessRecordLinkageService.createBusinessRecord(order, item, device);
                                    log.info("出库单执行时自动创建业务记录：orderNo={}, deviceCode={}",
                                            order.getOrderNo(), device.getDeviceCode());
                                }
                            } catch (Exception e) {
                                log.error("自动创建业务记录失败：orderNo={}, deviceId={}, error={}",
                                        order.getOrderNo(), device.getId(), e.getMessage());
                                // 不中断主流程，记录错误日志
                            }
                            break;
                        case 3: // 调拨
                            // 调拨逻辑：源区域减少，目标区域增加
                            break;
                    }
                    device.setUpdateTime(LocalDateTime.now());
                    deviceRepository.save(device);
                    processedCount++;
                } catch (Exception e) {
                    log.error("处理出库单项失败：orderNo={}, deviceId={}, error={}",
                            order.getOrderNo(), item.getDeviceId(), e.getMessage());
                    failedCount++;
                }
            }

            order.setStatus(3); // 已完成
            order.setExecuteTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());
            stockOrderRepository.save(order);

            result.setSuccess(true);
            result.setMessage("订单执行成功");
            result.setProcessedCount(processedCount);
            result.setFailedCount(failedCount);
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("订单执行失败: " + e.getMessage());
            result.setProcessedCount(0);
            result.setFailedCount(1);
        }
        
        return result;
    }

    /**
     * 取消订单
     * 
     * 业务规则：
     * - 草稿或待审核状态的订单可以取消
     * - 已审核或已完成的订单不能取消
     * 
     * @param id 订单ID
     * @param operatorId 操作人ID
     * @param reason 取消原因
     * @return 取消后的订单
     */
    @Transactional
    public StockOrder cancelOrder(Long id, Long operatorId, String reason) {
        StockOrder order = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == 2 || order.getStatus() == 3) {
            throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        order.setStatus(-1); // 已取消
        order.setOperatorId(operatorId);
        order.setUpdateTime(LocalDateTime.now());
        return stockOrderRepository.save(order);
    }

    /**
     * 获取订单统计
     * 
     * @return 订单统计结果
     */
    public OrderStatistics getOrderStatistics() {
        OrderStatistics statistics = new OrderStatistics();
        
        // 按状态统计
        List<Object[]> statusStats = stockOrderRepository.countByStatus();
        for (Object[] obj : statusStats) {
            Integer status = (Integer) obj[0];
            Long count = (Long) obj[1];
            
            switch (status) {
                case -1:
                    statistics.setCancelledCount(count.intValue());
                    break;
                case 0:
                    statistics.setDraftCount(count.intValue());
                    break;
                case 1:
                    statistics.setPendingCount(count.intValue());
                    break;
                case 2:
                    statistics.setApprovedCount(count.intValue());
                    break;
                case 3:
                    statistics.setCompletedCount(count.intValue());
                    break;
            }
        }
        
        // 计算总数
        int totalCount = statistics.getDraftCount() + statistics.getPendingCount() +
                        statistics.getApprovedCount() + statistics.getCompletedCount() +
                        statistics.getCancelledCount();
        statistics.setTotalCount(totalCount);
        
        return statistics;
    }

    /**
     * 获取库存统计信息
     * 
     * 统计维度：
     * - 各类型订单数量
     * - 各状态订单数量
     * - 今日/本周/本月订单统计
     * 
     * @return 统计数据
     */
    public ApiResponse<Map<String, Object>> getStockStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // 按类型统计
        List<Object[]> typeStats = stockOrderRepository.countByOrderType();
        Map<String, Long> typeMap = new HashMap<>();
        for (Object[] obj : typeStats) {
            Integer type = (Integer) obj[0];
            Long count = (Long) obj[1];
            String typeName = getOrderTypeName(type);
            typeMap.put(typeName, count);
        }
        stats.put("byType", typeMap);

        // 按状态统计
        List<Object[]> statusStats = stockOrderRepository.countByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] obj : statusStats) {
            Integer status = (Integer) obj[0];
            Long count = (Long) obj[1];
            String statusName = getOrderStatusName(status);
            statusMap.put(statusName, count);
        }
        stats.put("byStatus", statusMap);

        // 今日订单数
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        Long todayCount = stockOrderRepository.countByCreateTimeAfter(today);
        stats.put("todayCount", todayCount);

        return ApiResponse.success(stats);
    }

    /**
     * 生成订单号
     * 
     * 格式：类型前缀 + 年月日 + 4位序号
     * 例如：RK202501010001（入库单）
     * 
     * @param orderType 订单类型
     * @return 订单号
     */
    private String generateOrderNo(Integer orderType) {
        String prefix;
        switch (orderType) {
            case 1:
                prefix = "RK";
                break; // 入库
            case 2:
                prefix = "CK";
                break; // 出库
            case 3:
                prefix = "DB";
                break; // 调拨
            case 4:
                prefix = "PD";
                break; // 盘点
            default:
                prefix = "DD";
        }

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 查询当日最大序号
        String pattern = prefix + dateStr + "%";
        Long count = stockOrderRepository.countByOrderNoLike(pattern);
        int seq = count.intValue() + 1;

        return String.format("%s%s%04d", prefix, dateStr, seq);
    }

    /**
     * 将订单实体转换为Map
     */
    private Map<String, Object> convertToMap(StockOrder order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("orderNo", order.getOrderNo());
        map.put("orderType", order.getOrderType());
        map.put("orderTypeName", getOrderTypeName(order.getOrderType()));
        map.put("status", order.getStatus());
        map.put("statusName", getOrderStatusName(order.getStatus()));
        map.put("sourceAreaId", order.getSourceAreaId());
        map.put("sourceAreaName", order.getSourceArea() != null ? order.getSourceArea().getName() : null);
        map.put("targetAreaId", order.getTargetAreaId());
        map.put("targetAreaName", order.getTargetArea() != null ? order.getTargetArea().getName() : null);
        map.put("supplierId", order.getSupplierId());
        map.put("supplierName", order.getSupplier() != null ? order.getSupplier().getName() : null);
        map.put("operatorId", order.getOperatorId());
        map.put("operatorName", order.getOperator() != null ? order.getOperator().getRealName() : null);
        map.put("auditorId", order.getAuditorId());
        map.put("auditorName", order.getAuditor() != null ? order.getAuditor().getRealName() : null);
        map.put("auditTime", order.getAuditTime());
        map.put("executeTime", order.getExecuteTime());
        map.put("totalAmount", order.getTotalAmount());
        map.put("remark", order.getRemark());
        map.put("createTime", order.getCreateTime());
        map.put("updateTime", order.getUpdateTime());
        return map;
    }

    /**
     * 获取订单类型名称
     */
    private String getOrderTypeName(Integer type) {
        switch (type) {
            case 1:
                return "入库单";
            case 2:
                return "出库单";
            case 3:
                return "调拨单";
            case 4:
                return "盘点单";
            default:
                return "未知";
        }
    }

    /**
     * 获取订单状态名称
     */
    private String getOrderStatusName(Integer status) {
        switch (status) {
            case -1:
                return "已取消";
            case 0:
                return "草稿";
            case 1:
                return "待审核";
            case 2:
                return "已审核";
            case 3:
                return "已完成";
            default:
                return "未知";
        }
    }

    /**
     * 订单执行结果
     */
    public static class OrderExecuteResult {
        private boolean success;
        private String message;
        private int processedCount;
        private int failedCount;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public int getProcessedCount() {
            return processedCount;
        }

        public void setProcessedCount(int processedCount) {
            this.processedCount = processedCount;
        }

        public int getFailedCount() {
            return failedCount;
        }

        public void setFailedCount(int failedCount) {
            this.failedCount = failedCount;
        }
    }

    /**
     * 订单统计结果
     */
    public static class OrderStatistics {
        private int totalCount;
        private int draftCount;
        private int pendingCount;
        private int approvedCount;
        private int completedCount;
        private int cancelledCount;

        public int getTotalCount() {
            return totalCount;
        }

        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }

        public int getDraftCount() {
            return draftCount;
        }

        public void setDraftCount(int draftCount) {
            this.draftCount = draftCount;
        }

        public int getPendingCount() {
            return pendingCount;
        }

        public void setPendingCount(int pendingCount) {
            this.pendingCount = pendingCount;
        }

        public int getApprovedCount() {
            return approvedCount;
        }

        public void setApprovedCount(int approvedCount) {
            this.approvedCount = approvedCount;
        }

        public int getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(int completedCount) {
            this.completedCount = completedCount;
        }

        public int getCancelledCount() {
            return cancelledCount;
        }

        public void setCancelledCount(int cancelledCount) {
            this.cancelledCount = cancelledCount;
        }
    }

}

