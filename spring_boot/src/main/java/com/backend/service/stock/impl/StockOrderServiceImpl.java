package com.backend.service.stock.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.PageResult;
import com.backend.entity.Area;
import com.backend.entity.Bin;
import com.backend.entity.Device;
import com.backend.entity.Inventory;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.service.BusinessRecordLinkageService;
import com.backend.service.stock.StockOrderService;

/**
 * 库存订单服务实现类 - 重构版
 * 
 * 重构记录 2026-02-13:
 * - 支持新的入库流程：创建入库单时创建设备（待入库状态）
 * - 审核通过后设备状态变为在库
 * - 审核拒绝后删除待入库设备
 * - 删除入库单时级联删除待入库设备
 * 
 * 入库单状态流转：
 * - 草稿(0) → 待审核(1) → 已完成(2)
 * 
 * 设备状态对应：
 * - 入库单草稿/待审核 → 设备待入库(-1)
 * - 入库单已完成 → 设备在库(0)
 */
@Slf4j
@Service
public class StockOrderServiceImpl implements StockOrderService {

    private final StockOrderRepository stockOrderRepository;
    private final StockOrderItemRepository stockOrderItemRepository;
    private final DeviceRepository deviceRepository;
    private final InventoryRepository inventoryRepository;
    private final BusinessRecordLinkageService businessRecordLinkageService;
    private final Random random = new Random();

    public StockOrderServiceImpl(StockOrderRepository stockOrderRepository,
            StockOrderItemRepository stockOrderItemRepository,
            DeviceRepository deviceRepository,
            InventoryRepository inventoryRepository,
            BusinessRecordLinkageService businessRecordLinkageService) {
        this.stockOrderRepository = stockOrderRepository;
        this.stockOrderItemRepository = stockOrderItemRepository;
        this.deviceRepository = deviceRepository;
        this.inventoryRepository = inventoryRepository;
        this.businessRecordLinkageService = businessRecordLinkageService;
    }

    @Override
    public List<StockOrder> getAllStockOrders() {
        return stockOrderRepository.findAll();
    }

    @Override
    public StockOrder getStockOrderById(Long id) {
        return stockOrderRepository.findById(id).orElse(null);
    }

    @Override
    public StockOrder getStockOrderByNo(String orderNo) {
        return stockOrderRepository.findByOrderNo(orderNo).orElse(null);
    }

    /**
     * 创建入库单
     * 
     * 新流程：
     * 1. 保存入库单（状态=草稿）
     * 2. 保存入库明细
     * 3. 创建设备（状态=待入库）
     * 
     * 注意：设备在创建入库单时即创建，状态为"待入库"
     */
    @Override
    @Transactional
    public StockOrder createStockOrder(StockOrder stockOrder) {
        // 生成订单号
        if (stockOrder.getOrderNo() == null || stockOrder.getOrderNo().isEmpty()) {
            stockOrder.setOrderNo(generateOrderNo(stockOrder.getOrderType()));
        }
        // 设置初始状态为草稿
        if (stockOrder.getStatus() == null) {
            stockOrder.setStatus(0);
        }
        stockOrder.setCreateTime(LocalDateTime.now());
        stockOrder.setUpdateTime(LocalDateTime.now());

        StockOrder savedOrder = stockOrderRepository.save(stockOrder);

        // 保存订单明细并创建设备
        if (stockOrder.getItems() != null && !stockOrder.getItems().isEmpty()) {
            for (StockOrderItem item : stockOrder.getItems()) {
                item.setStockOrder(savedOrder);
                item.setCreateTime(LocalDateTime.now());
                stockOrderItemRepository.save(item);

                // 如果是入库单，创建设备（待入库状态）
                if (stockOrder.getOrderType() == 1) {
                    createPendingInboundDevice(item, savedOrder);
                }
            }
        }

        return savedOrder;
    }

    /**
     * 创建待入库设备
     * 
     * 设备状态：-1（待入库）
     * 设备在入库单创建时即创建，但处于待入库状态
     */
    private void createPendingInboundDevice(StockOrderItem item, StockOrder order) {
        Device device = new Device();
        device.setDeviceCode(generateDeviceCode());
        // 从item的device获取设备名称和型号，如果没有则使用默认值
        Device itemDevice = item.getDevice();
        if (itemDevice != null) {
            device.setDeviceName(
                    itemDevice.getDeviceName() != null ? itemDevice.getDeviceName() : "设备-" + order.getOrderNo());
            device.setModel(itemDevice.getModel());
        } else {
            device.setDeviceName("设备-" + order.getOrderNo());
        }
        device.setStatus(DeviceStatus.PENDING_INBOUND.getCode()); // 待入库状态
        device.setCurrentStock(0); // 待入库设备库存为0
        device.setCreateTime(LocalDateTime.now());
        device.setUpdateTime(LocalDateTime.now());

        // 设置仓库、区域、货位信息（从item获取）
        if (item.getAreaId() != null) {
            device.setAreaId(item.getAreaId());
            // 从area获取仓库信息
            Area area = item.getArea();
            if (area != null) {
                device.setAreaName(area.getName());
                if (area.getWarehouse() != null) {
                    device.setWarehouseId(area.getWarehouse().getId());
                    device.setWarehouseName(area.getWarehouse().getWarehouseName());
                }
            }
        }
        if (item.getBinId() != null) {
            device.setBinId(item.getBinId());
            Bin bin = item.getBin();
            if (bin != null) {
                device.setBinName(bin.getCode());
            }
        }

        // 设置供应商信息
        if (order.getSupplierName() != null) {
            device.setSupplierName(order.getSupplierName());
        }
        device.setPurchaseDate(order.getOrderDate() != null ? order.getOrderDate() : LocalDate.now());

        device = deviceRepository.save(device);

        // 更新明细的设备ID
        item.setDevice(device);
        item.setDeviceId(device.getId());
        stockOrderItemRepository.save(item);
    }

    @Override
    @Transactional
    public StockOrder updateStockOrder(Long id, StockOrder stockOrder) {
        StockOrder existingOrder = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 只能更新草稿状态的订单
        if (existingOrder.getStatus() != 0) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_NOT_DRAFT);
        }

        existingOrder.setOrderDate(stockOrder.getOrderDate());
        existingOrder.setSupplier(stockOrder.getSupplier());
        existingOrder.setOperatorName(stockOrder.getOperatorName());
        existingOrder.setRemark(stockOrder.getRemark());
        existingOrder.setTotalQuantity(stockOrder.getTotalQuantity());
        existingOrder.setUpdateTime(LocalDateTime.now());

        StockOrder savedOrder = stockOrderRepository.save(existingOrder);

        // 更新订单明细 - 先删除旧的，再添加新的
        if (stockOrder.getItems() != null) {
            // 删除旧的明细和关联的待入库设备
            List<StockOrderItem> oldItems = stockOrderItemRepository.findByStockOrderId(id);
            for (StockOrderItem oldItem : oldItems) {
                // 删除关联的待入库设备
                if (oldItem.getDeviceId() != null) {
                    Device device = deviceRepository.findById(oldItem.getDeviceId()).orElse(null);
                    if (device != null && device.getStatus() == DeviceStatus.PENDING_INBOUND.getCode()) {
                        deviceRepository.delete(device);
                    }
                }
            }
            stockOrderItemRepository.deleteAll(oldItems);

            // 添加新的明细并创建设备
            for (StockOrderItem item : stockOrder.getItems()) {
                item.setStockOrder(savedOrder);
                item.setCreateTime(LocalDateTime.now());
                stockOrderItemRepository.save(item);

                // 如果是入库单，创建设备（待入库状态）
                if (savedOrder.getOrderType() == 1) {
                    createPendingInboundDevice(item, savedOrder);
                }
            }
        }

        return savedOrder;
    }

    /**
     * 删除入库单
     * 
     * 新流程：
     * 1. 删除入库单明细
     * 2. 级联删除关联的待入库设备
     * 3. 删除入库单
     */
    @Override
    @Transactional
    public void deleteStockOrder(Long id) {
        StockOrder order = stockOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 只能删除草稿状态的订单
        if (order.getStatus() != 0) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_NOT_DRAFT);
        }

        // 删除订单明细和关联的待入库设备
        List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(id);
        for (StockOrderItem item : items) {
            // 删除关联的待入库设备
            if (item.getDeviceId() != null) {
                Device device = deviceRepository.findById(item.getDeviceId()).orElse(null);
                if (device != null && device.getStatus() == DeviceStatus.PENDING_INBOUND.getCode()) {
                    deviceRepository.delete(device);
                }
            }
        }
        stockOrderItemRepository.deleteAll(items);

        stockOrderRepository.deleteById(id);
    }

    @Override
    public PageResult<StockOrder> getStockOrders(Pageable pageable) {
        Page<StockOrder> page = stockOrderRepository.findAll(pageable);
        return PageResult.of(page);
    }

    @Override
    public List<StockOrderItem> getStockOrderItems(Long orderId) {
        return stockOrderItemRepository.findByStockOrderId(orderId);
    }

    /**
     * 提交审核
     * 
     * 入库单状态：草稿(0) → 待审核(1)
     * 设备状态：保持待入库(-1)
     */
    @Override
    @Transactional
    public StockOrder submitOrder(Long orderId, Long operatorId) {
        StockOrder order = stockOrderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != 0) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_NOT_DRAFT);
        }

        order.setStatus(1); // 待审核
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
     *   - 入库单(orderType=1)：直接完成，设备入库
     *   - 出库单(orderType=2)：自动执行出库并创建业务记录
     *   - 调拨单(orderType=3)：自动执行调拨
     * - 审核拒绝：退回草稿状态
     */
    @Override
    @Transactional
    public StockOrder approveOrder(Long orderId, boolean approved, Long auditorId, String remark) {
        StockOrder order = stockOrderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != 1) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_NOT_PENDING);
        }

        if (approved) {
            order.setAuditorId(auditorId);
            order.setAuditTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());

            Integer orderType = order.getOrderType();
            if (orderType == null) {
                orderType = 2;
            }

            switch (orderType) {
                case 1:
                    order.setStatus(2);
                    processInboundDevicesToStock(order);
                    break;
                case 2:
                    executeOutboundOrder(order, auditorId);
                    break;
                case 3:
                    executeTransferOrder(order, auditorId);
                    break;
                default:
                    order.setStatus(2);
            }
        } else {
            order.setStatus(0);
            order.setUpdateTime(LocalDateTime.now());

            if (order.getOrderType() == 1) {
                deletePendingInboundDevices(order);
            }
        }

        return stockOrderRepository.save(order);
    }

    private void executeOutboundOrder(StockOrder order, Long operatorId) {
        List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(order.getId());
        
        int successCount = 0;
        int failCount = 0;
        
        for (StockOrderItem item : items) {
            try {
                Device device = item.getDevice();
                if (device == null && item.getDeviceId() != null) {
                    device = deviceRepository.findById(item.getDeviceId())
                            .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
                }
                
                if (device == null) {
                    failCount++;
                    continue;
                }
                
                int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                int currentStock = device.getCurrentStock() != null ? device.getCurrentStock() : 0;
                
                if (currentStock < quantity) {
                    failCount++;
                    continue;
                }
                
                device.setCurrentStock(currentStock - quantity);
                device.setUpdateTime(LocalDateTime.now());
                deviceRepository.save(device);
                
                if (!businessRecordLinkageService.hasBusinessRecord(item)) {
                    businessRecordLinkageService.createBusinessRecord(order, item, device);
                }
                
                item.setActualQuantity(quantity);
                item.setUpdateTime(LocalDateTime.now());
                stockOrderItemRepository.save(item);
                
                successCount++;
            } catch (Exception e) {
                failCount++;
            }
        }
        
        order.setStatus(3);
        order.setExecuteTime(LocalDateTime.now());
    }

    private void executeTransferOrder(StockOrder order, Long operatorId) {
        List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(order.getId());
        
        for (StockOrderItem item : items) {
            try {
                item.setActualQuantity(item.getQuantity());
                item.setUpdateTime(LocalDateTime.now());
                stockOrderItemRepository.save(item);
            } catch (Exception e) {
                log.error("执行调拨订单明细失败: itemId={}, error={}", item.getId(), e.getMessage());
            }
        }

        order.setStatus(3);
        order.setExecuteTime(LocalDateTime.now());
    }

    /**
     * 处理入库设备变为在库状态
     * 
     * 1. 更新设备状态为在库
     * 2. 更新设备库存
     * 3. 创建库存记录
     */
    private void processInboundDevicesToStock(StockOrder order) {
        List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(order.getId());

        for (StockOrderItem item : items) {
            if (item.getDeviceId() == null) {
                continue;
            }

            Device device = deviceRepository.findById(item.getDeviceId()).orElse(null);
            if (device == null) {
                continue;
            }

            // 更新设备状态为在库
            device.setStatus(DeviceStatus.IN_STOCK.getCode());
            device.setCurrentStock(item.getQuantity());
            device.setUpdateTime(LocalDateTime.now());
            deviceRepository.save(device);

            // 创建库存记录
            if (item.getBinId() != null) {
                Inventory inventory = new Inventory();
                inventory.setDevice(device);
                Bin bin = new Bin();
                bin.setId(item.getBinId());
                inventory.setBin(bin);
                inventory.setQuantity(item.getQuantity());
                inventory.setBatchNo(order.getOrderNo());
                inventory.setUnitPrice(item.getUnitPrice());
                inventory.setStatus(1);
                inventoryRepository.save(inventory);
            }

            // 更新明细的实际数量
            item.setActualQuantity(item.getQuantity());
            item.setUpdateTime(LocalDateTime.now());
            stockOrderItemRepository.save(item);
        }
    }

    /**
     * 删除待入库设备
     * 
     * 审核拒绝时调用，删除关联的待入库状态设备
     */
    private void deletePendingInboundDevices(StockOrder order) {
        List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(order.getId());

        for (StockOrderItem item : items) {
            if (item.getDeviceId() == null) {
                continue;
            }

            Device device = deviceRepository.findById(item.getDeviceId()).orElse(null);
            if (device != null && device.getStatus() == DeviceStatus.PENDING_INBOUND.getCode()) {
                // 删除设备
                deviceRepository.delete(device);

                // 清空明细的设备ID
                item.setDeviceId(null);
                item.setDevice(null);
                stockOrderItemRepository.save(item);
            }
        }
    }

    @Override
    @Transactional
    public StockOrder cancelOrder(Long orderId, Long operatorId, String reason) {
        StockOrder order = stockOrderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == 2) {
            throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        // 如果取消待审核的入库单，需要删除待入库设备
        if (order.getStatus() == 1 && order.getOrderType() == 1) {
            deletePendingInboundDevices(order);
        }

        order.setStatus(-1); // 已取消
        order.setOperatorId(operatorId);
        order.setUpdateTime(LocalDateTime.now());
        return stockOrderRepository.save(order);
    }

    /**
     * 执行订单 - 已废弃
     * 
     * 新流程中，审核通过即完成入库，不需要单独的"执行"步骤
     * 保留此方法用于兼容旧代码和出库单处理
     */
    @Override
    @Transactional
    public OrderExecuteResult executeOrder(Long orderId, Long operatorId) {
        OrderExecuteResult result = new OrderExecuteResult();

        try {
            StockOrder order = stockOrderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

            // 入库单在新流程中不需要执行步骤
            if (order.getOrderType() == 1) {
                result.setSuccess(false);
                result.setMessage("入库单在审核通过时已自动完成，无需执行");
                return result;
            }

            // 出库单处理
            if (order.getStatus() != 2) {
                result.setSuccess(false);
                result.setMessage("订单状态不是已完成，无法执行");
                return result;
            }

            // 获取订单明细
            List<StockOrderItem> items = stockOrderItemRepository.findByStockOrderId(orderId);
            if (items == null || items.isEmpty()) {
                result.setSuccess(false);
                result.setMessage("订单没有明细，无法执行");
                return result;
            }

            int processedCount = 0;
            int failedCount = 0;

            // 处理出库明细
            for (StockOrderItem item : items) {
                try {
                    processOutboundItem(item, order);
                    processedCount++;
                } catch (Exception e) {
                    failedCount++;
                }
            }

            result.setSuccess(true);
            result.setMessage(String.format("订单执行成功：成功%d条，失败%d条", processedCount, failedCount));
            result.setProcessedCount(processedCount);
            result.setFailedCount(failedCount);

        } catch (BusinessException e) {
            result.setSuccess(false);
            result.setMessage(e.getMessage());
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("订单执行失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 处理出库明细 - 减少库存并创建业务记录
     */
    private void processOutboundItem(StockOrderItem item, StockOrder order) {
        Device device = item.getDevice();
        if (device == null && item.getDeviceId() != null) {
            device = deviceRepository.findById(item.getDeviceId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
        }

        if (device == null) {
            throw new BusinessException(ErrorCode.DEVICE_NOT_FOUND);
        }

        // 检查设备状态 - 只允许在库状态的设备出库
        Integer deviceStatus = device.getStatus();
        if (deviceStatus == null || deviceStatus != DeviceStatus.IN_STOCK.getCode()) {
            String statusDesc = deviceStatus != null ? DeviceStatus.fromCode(deviceStatus).getDescription() : "未知";
            throw new BusinessException(String.valueOf(ErrorCode.BAD_REQUEST.getCode()),
                    String.format("设备[%s]当前状态为[%s]，只有在库状态的设备才能出库",
                            device.getDeviceCode(), statusDesc));
        }

        // 减少设备库存
        int newStock = device.getCurrentStock() - item.getQuantity();
        if (newStock < 0) {
            throw new BusinessException(ErrorCode.INVENTORY_INSUFFICIENT);
        }
        device.setCurrentStock(newStock);
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        // 减少货位库存
        Long binId = item.getBinId();
        if (binId != null) {
            Inventory inventory = inventoryRepository.findByDeviceIdAndBinId(device.getId(), binId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.INVENTORY_NOT_FOUND));

            int newQuantity = inventory.getQuantity() - item.getQuantity();
            if (newQuantity < 0) {
                throw new BusinessException(ErrorCode.INVENTORY_INSUFFICIENT);
            }

            inventory.setQuantity(newQuantity);
            inventory.setUpdateTime(LocalDateTime.now());
            inventoryRepository.save(inventory);
        }

        // 更新明细的实际数量
        item.setActualQuantity(item.getQuantity());
        item.setUpdateTime(LocalDateTime.now());
        stockOrderItemRepository.save(item);

        // 使用BusinessRecordLinkageService创建业务记录
        businessRecordLinkageService.createBusinessRecord(order, item, device);
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo(Integer orderType) {
        String prefix = switch (orderType) {
            case 1 -> "IN";
            case 2 -> "OUT";
            case 3 -> "TRF";
            case 4 -> "CNT";
            default -> "ORD";
        };
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomStr = String.format("%04d", random.nextInt(10000));
        return prefix + timestamp + randomStr;
    }

    /**
     * 生成设备编码
     */
    private String generateDeviceCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomStr = String.format("%06d", random.nextInt(1000000));
        return "DEV" + timestamp + randomStr;
    }

    @Override
    public OrderStatistics getOrderStatistics() {
        OrderStatistics statistics = new OrderStatistics();
        List<StockOrder> orders = stockOrderRepository.findAll();
        statistics.setTotalCount(orders.size());
        statistics.setDraftCount((int) orders.stream().filter(o -> o.getStatus() == 0).count());
        statistics.setPendingCount((int) orders.stream().filter(o -> o.getStatus() == 1).count());
        statistics.setApprovedCount((int) orders.stream().filter(o -> o.getStatus() == 2).count());
        statistics.setCompletedCount((int) orders.stream().filter(o -> o.getStatus() == 2).count()); // 已完成=已审核
        statistics.setCancelledCount((int) orders.stream().filter(o -> o.getStatus() == -1).count());
        return statistics;
    }
}
