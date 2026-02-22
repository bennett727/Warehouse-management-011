package com.backend.service.stock.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.PageResult;
import com.backend.entity.Bin;
import com.backend.entity.Device;
import com.backend.entity.Inventory;
import com.backend.entity.StockCount;
import com.backend.entity.StockCountItem;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.StockCountItemRepository;
import com.backend.repository.StockCountRepository;
import com.backend.service.DeviceStatusSyncService;
import com.backend.service.stock.StockCountService;

@Service
public class StockCountServiceImpl implements StockCountService {

    private static final Logger logger = LoggerFactory.getLogger(StockCountServiceImpl.class);

    private final StockCountRepository stockCountRepository;
    private final StockCountItemRepository stockCountItemRepository;
    private final InventoryRepository inventoryRepository;
    private final DeviceRepository deviceRepository;
    private final BinRepository binRepository;
    private final DeviceStatusSyncService deviceStatusSyncService;

    public StockCountServiceImpl(StockCountRepository stockCountRepository,
                                   StockCountItemRepository stockCountItemRepository,
                                   InventoryRepository inventoryRepository,
                                   DeviceRepository deviceRepository,
                                   BinRepository binRepository,
                                   DeviceStatusSyncService deviceStatusSyncService) {
        this.stockCountRepository = stockCountRepository;
        this.stockCountItemRepository = stockCountItemRepository;
        this.inventoryRepository = inventoryRepository;
        this.deviceRepository = deviceRepository;
        this.binRepository = binRepository;
        this.deviceStatusSyncService = deviceStatusSyncService;
    }

    @Override
    public List<StockCount> getAllStockCounts() {
        logger.info("获取所有库存盘点");
        return stockCountRepository.findAll();
    }

    @Override
    public StockCount getStockCountById(Long id) {
        logger.info("获取库存盘点详情, ID: {}", id);
        return stockCountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCount", "id", id));
    }

    @Override
    @Transactional
    public StockCount createStockCount(StockCount stockCount) {
        logger.info("创建库存盘点: {}", stockCount);

        stockCount.setCountNo(generateCountNo());
        stockCount.setStatus(0);
        stockCount.setCreateTime(LocalDateTime.now());
        stockCount.setUpdateTime(LocalDateTime.now());

        StockCount saved = stockCountRepository.save(stockCount);
        logger.info("库存盘点创建成功, ID: {}", saved.getId());

        return saved;
    }

    @Transactional
    public StockCount createStockCountWithItems(StockCount stockCount) {
        logger.info("创建库存盘点并生成明细: {}", stockCount);

        stockCount.setCountNo(generateCountNo());
        stockCount.setStatus(0);
        stockCount.setCreateTime(LocalDateTime.now());
        stockCount.setUpdateTime(LocalDateTime.now());

        StockCount saved = stockCountRepository.save(stockCount);

        generateStockCountItems(saved);

        logger.info("库存盘点创建成功并已生成明细, ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public void generateStockCountItems(StockCount stockCount) {
        logger.info("生成盘点明细, 盘点单ID: {}", stockCount.getId());

        List<Inventory> inventories = getInventoriesByScope(stockCount.getWarehouseId(), stockCount.getAreaId());

        for (Inventory inv : inventories) {
            StockCountItem item = new StockCountItem();
            item.setStockCountId(stockCount.getId());
            item.setDeviceId(inv.getDevice().getId());
            item.setDeviceCode(inv.getDevice().getDeviceCode());
            item.setDeviceName(inv.getDevice().getDeviceName());
            item.setBinId(inv.getBin().getId());
            item.setBinCode(inv.getBin().getCode());
            item.setBookQuantity(inv.getQuantity());
            item.setStatus(0);

            stockCountItemRepository.save(item);
        }

        logger.info("盘点明细生成完成, 共 {} 条", inventories.size());
    }

    private List<Inventory> getInventoriesByScope(Long warehouseId, Long areaId) {
        if (areaId != null) {
            return inventoryRepository.findByAreaId(areaId);
        } else if (warehouseId != null) {
            return inventoryRepository.findByWarehouseId(warehouseId);
        } else {
            return inventoryRepository.findAll();
        }
    }

    @Override
    @Transactional
    public StockCount updateStockCount(Long id, StockCount stockCount) {
        logger.info("更新库存盘点, ID: {}", id);

        StockCount existing = stockCountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCount", "id", id));

        if (existing.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能修改待审核状态的盘点单");
        }

        existing.setWarehouseId(stockCount.getWarehouseId());
        existing.setAreaId(stockCount.getAreaId());
        existing.setCountType(stockCount.getCountType());
        existing.setCountDate(stockCount.getCountDate());
        existing.setRemark(stockCount.getRemark());
        existing.setUpdateTime(LocalDateTime.now());

        StockCount updated = stockCountRepository.save(existing);
        logger.info("库存盘点更新成功, ID: {}", updated.getId());

        return updated;
    }

    @Override
    @Transactional
    public void deleteStockCount(Long id) {
        logger.info("删除库存盘点, ID: {}", id);

        StockCount stockCount = stockCountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCount", "id", id));

        if (stockCount.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能删除待审核状态的盘点单");
        }

        stockCountItemRepository.deleteByStockCountId(id);
        stockCountRepository.deleteById(id);
        logger.info("库存盘点删除成功, ID: {}", id);
    }

    @Override
    public PageResult<StockCount> getStockCounts(Pageable pageable) {
        logger.info("分页获取库存盘点");
        Page<StockCount> page = stockCountRepository.findAll(pageable);
        return PageResult.of(page);
    }

    @Override
    @Transactional
    public void executeStockCount(Long id) {
        logger.info("执行库存盘点, ID: {}", id);

        StockCount stockCount = stockCountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCount", "id", id));

        if (stockCount.getStatus() != 1) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能执行已审核的盘点单");
        }

        stockCount.setStatus(2);
        stockCount.setUpdateTime(LocalDateTime.now());
        stockCountRepository.save(stockCount);

        logger.info("库存盘点执行成功, ID: {}", id);
    }

    @Override
    @Transactional
    public void approveStockCount(Long id, Long approverId) {
        logger.info("审核库存盘点, ID: {}, 审核人: {}", id, approverId);

        StockCount stockCount = stockCountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCount", "id", id));

        if (stockCount.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能审核待审核状态的盘点单");
        }

        stockCount.setStatus(1);
        stockCount.setApproverId(approverId);
        stockCount.setApproveTime(LocalDateTime.now());
        stockCount.setUpdateTime(LocalDateTime.now());
        stockCountRepository.save(stockCount);

        logger.info("库存盘点审核成功, ID: {}", id);
    }

    @Transactional
    public void countItem(Long itemId, Integer actualQuantity, String differenceReason, Long counterId, String counterName) {
        logger.info("盘点明细, ID: {}, 实盘数量: {}", itemId, actualQuantity);

        StockCountItem item = stockCountItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockCountItem", "id", itemId));

        item.setActualQuantity(actualQuantity);
        item.calculateDifference();
        item.setDifferenceReason(differenceReason);
        item.setStatus(1);
        item.setCountTime(LocalDateTime.now());
        item.setCounterId(counterId);
        item.setCounterName(counterName);

        stockCountItemRepository.save(item);
        logger.info("盘点明细完成, ID: {}, 差异: {}", itemId, item.getDifference());
    }

    @Transactional
    public void completeStockCount(Long stockCountId) {
        logger.info("完成库存盘点并调整库存, ID: {}", stockCountId);

        StockCount stockCount = stockCountRepository.findById(stockCountId)
                .orElseThrow(() -> new ResourceNotFoundException("StockCount", "id", stockCountId));

        if (stockCount.getStatus() != 2) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能处理已完成的盘点单");
        }

        List<StockCountItem> items = stockCountItemRepository.findByStockCountId(stockCountId);

        for (StockCountItem item : items) {
            if (item.hasDifference()) {
                adjustInventory(item);
                item.setStatus(2);
            } else {
                item.setStatus(1);
            }
        }

        stockCountItemRepository.saveAll(items);
        stockCount.setStatus(3);
        stockCount.setUpdateTime(LocalDateTime.now());
        stockCountRepository.save(stockCount);

        logger.info("库存盘点完成并已调整库存, ID: {}", stockCountId);
    }

    private void adjustInventory(StockCountItem item) {
        logger.info("调整库存, 设备ID: {}, 货位ID: {}, 差异: {}", 
                item.getDeviceId(), item.getBinId(), item.getDifference());

        Inventory inventory = inventoryRepository.findByDeviceIdAndBinId(item.getDeviceId(), item.getBinId())
                .orElseGet(() -> {
                    Inventory inv = new Inventory();
                    Device device = deviceRepository.findById(item.getDeviceId())
                            .orElseThrow(() -> new ResourceNotFoundException("Device", "id", item.getDeviceId()));
                    Bin bin = binRepository.findById(item.getBinId())
                            .orElseThrow(() -> new ResourceNotFoundException("Bin", "id", item.getBinId()));
                    inv.setDevice(device);
                    inv.setBin(bin);
                    inv.setQuantity(0);
                    return inv;
                });

        inventory.setQuantity(item.getActualQuantity());
        inventoryRepository.save(inventory);

        logger.info("库存调整完成, 设备: {}, 新数量: {}", item.getDeviceCode(), item.getActualQuantity());
    }

    public List<StockCountItem> getStockCountItems(Long stockCountId) {
        return stockCountItemRepository.findByStockCountIdOrderByDeviceCode(stockCountId);
    }

    public StockCountItem getStockCountItem(Long itemId) {
        return stockCountItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockCountItem", "id", itemId));
    }

    public long getItemCount(Long stockCountId) {
        return stockCountItemRepository.countByStockCountId(stockCountId);
    }

    public long getCountedItemCount(Long stockCountId) {
        return stockCountItemRepository.countByStockCountIdAndCounted(stockCountId);
    }

    public long getDifferenceItemCount(Long stockCountId) {
        return stockCountItemRepository.countByStockCountIdAndHasDifference(stockCountId);
    }

    private String generateCountNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "PD" + dateStr + String.format("%04d", stockCountRepository.count() + 1);
    }
}
