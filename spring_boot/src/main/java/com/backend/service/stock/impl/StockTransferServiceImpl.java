package com.backend.service.stock.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import com.backend.entity.StockTransfer;
import com.backend.entity.StockTransferItem;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.StockTransferItemRepository;
import com.backend.repository.StockTransferRepository;
import com.backend.service.DeviceStatusSyncService;
import com.backend.service.stock.StockTransferService;

@Service
public class StockTransferServiceImpl implements StockTransferService {

    private static final Logger logger = LoggerFactory.getLogger(StockTransferServiceImpl.class);

    private final StockTransferRepository stockTransferRepository;
    private final StockTransferItemRepository stockTransferItemRepository;
    private final DeviceRepository deviceRepository;
    private final BinRepository binRepository;
    private final InventoryRepository inventoryRepository;
    private final DeviceStatusSyncService deviceStatusSyncService;

    public StockTransferServiceImpl(StockTransferRepository stockTransferRepository,
                                     StockTransferItemRepository stockTransferItemRepository,
                                     DeviceRepository deviceRepository,
                                     BinRepository binRepository,
                                     InventoryRepository inventoryRepository,
                                     DeviceStatusSyncService deviceStatusSyncService) {
        this.stockTransferRepository = stockTransferRepository;
        this.stockTransferItemRepository = stockTransferItemRepository;
        this.deviceRepository = deviceRepository;
        this.binRepository = binRepository;
        this.inventoryRepository = inventoryRepository;
        this.deviceStatusSyncService = deviceStatusSyncService;
    }

    @Override
    public List<StockTransfer> getAllStockTransfers() {
        logger.info("获取所有库存调拨");
        return stockTransferRepository.findAll();
    }

    @Override
    public StockTransfer getStockTransferById(Long id) {
        logger.info("获取库存调拨详情, ID: {}", id);
        return stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", id));
    }

    @Override
    @Transactional
    public StockTransfer createStockTransfer(Map<String, Object> stockTransferData) {
        logger.info("创建库存调拨: {}", stockTransferData);

        StockTransfer transfer = new StockTransfer();
        transfer.setTransferNo(generateTransferNo());
        transfer.setSourceWarehouseId(((Number) stockTransferData.get("sourceWarehouseId")).longValue());
        transfer.setSourceAreaId(((Number) stockTransferData.get("sourceAreaId")).longValue());
        transfer.setTargetWarehouseId(((Number) stockTransferData.get("targetWarehouseId")).longValue());
        transfer.setTargetAreaId(((Number) stockTransferData.get("targetAreaId")).longValue());
        transfer.setStatus(0);
        transfer.setOperatorId(((Number) stockTransferData.get("operatorId")).longValue());
        transfer.setCreateTime(LocalDateTime.now());
        transfer.setUpdateTime(LocalDateTime.now());

        StockTransfer saved = stockTransferRepository.save(transfer);
        logger.info("库存调拨创建成功, ID: {}", saved.getId());

        return saved;
    }

    @Transactional
    public StockTransfer createStockTransferWithItems(StockTransfer transfer, List<StockTransferItem> items) {
        logger.info("创建库存调拨并添加明细");

        transfer.setTransferNo(generateTransferNo());
        transfer.setStatus(0);
        transfer.setCreateTime(LocalDateTime.now());
        transfer.setUpdateTime(LocalDateTime.now());

        StockTransfer saved = stockTransferRepository.save(transfer);

        for (StockTransferItem item : items) {
            item.setTransferId(saved.getId());
            Device device = deviceRepository.findById(item.getDeviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Device", "id", item.getDeviceId()));
            item.setDeviceCode(device.getDeviceCode());
            item.setDeviceName(device.getDeviceName());
            item.setSourceBinId(device.getBinId());
            if (device.getBin() != null) {
                item.setSourceBinCode(device.getBin().getCode());
            }
            item.setStatus(0);
            stockTransferItemRepository.save(item);
        }

        logger.info("库存调拨创建成功并已添加明细, ID: {}", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public StockTransfer updateStockTransfer(Long id, Map<String, Object> stockTransferData) {
        logger.info("更新库存调拨, ID: {}", id);

        StockTransfer existing = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", id));

        if (existing.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能修改待审核状态的调拨单");
        }

        if (stockTransferData.containsKey("sourceWarehouseId")) {
            existing.setSourceWarehouseId(((Number) stockTransferData.get("sourceWarehouseId")).longValue());
        }
        if (stockTransferData.containsKey("sourceAreaId")) {
            existing.setSourceAreaId(((Number) stockTransferData.get("sourceAreaId")).longValue());
        }
        if (stockTransferData.containsKey("targetWarehouseId")) {
            existing.setTargetWarehouseId(((Number) stockTransferData.get("targetWarehouseId")).longValue());
        }
        if (stockTransferData.containsKey("targetAreaId")) {
            existing.setTargetAreaId(((Number) stockTransferData.get("targetAreaId")).longValue());
        }
        if (stockTransferData.containsKey("remark")) {
            existing.setRemark((String) stockTransferData.get("remark"));
        }
        existing.setUpdateTime(LocalDateTime.now());

        StockTransfer updated = stockTransferRepository.save(existing);
        logger.info("库存调拨更新成功, ID: {}", updated.getId());

        return updated;
    }

    @Override
    @Transactional
    public void deleteStockTransfer(Long id) {
        logger.info("删除库存调拨, ID: {}", id);

        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", id));

        if (transfer.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能删除待审核状态的调拨单");
        }

        stockTransferItemRepository.deleteByTransferId(id);
        stockTransferRepository.deleteById(id);
        logger.info("库存调拨删除成功, ID: {}", id);
    }

    @Override
    public PageResult<StockTransfer> getStockTransfers(Pageable pageable) {
        logger.info("分页获取库存调拨");
        Page<StockTransfer> page = stockTransferRepository.findAll(pageable);
        return PageResult.of(page);
    }

    @Override
    @Transactional
    public void executeStockTransfer(Long id) {
        logger.info("执行库存调拨, ID: {}", id);

        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", id));

        if (transfer.getStatus() != 1) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能执行已审核的调拨单");
        }

        List<StockTransferItem> items = stockTransferItemRepository.findByTransferId(id);

        for (StockTransferItem item : items) {
            executeTransferItem(transfer, item);
        }

        transfer.setStatus(2);
        transfer.setTransferDate(LocalDateTime.now());
        transfer.setUpdateTime(LocalDateTime.now());
        stockTransferRepository.save(transfer);

        logger.info("库存调拨执行成功, ID: {}", id);
    }

    private void executeTransferItem(StockTransfer transfer, StockTransferItem item) {
        logger.info("执行调拨明细, 设备ID: {}, 目标货位ID: {}", item.getDeviceId(), item.getTargetBinId());

        Device device = deviceRepository.findById(item.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", item.getDeviceId()));

        Long sourceBinId = item.getSourceBinId();
        Long targetBinId = item.getTargetBinId();

        if (sourceBinId != null) {
            Inventory sourceInv = inventoryRepository.findByDeviceIdAndBinId(device.getId(), sourceBinId)
                    .orElse(null);
            if (sourceInv != null) {
                int newQty = sourceInv.getQuantity() - item.getQuantity();
                if (newQty <= 0) {
                    inventoryRepository.delete(sourceInv);
                } else {
                    sourceInv.setQuantity(newQty);
                    inventoryRepository.save(sourceInv);
                }
            }
        }

        Bin targetBin = binRepository.findById(targetBinId)
                .orElseThrow(() -> new ResourceNotFoundException("Bin", "id", targetBinId));

        Inventory targetInv = inventoryRepository.findByDeviceIdAndBinId(device.getId(), targetBinId)
                .orElseGet(() -> {
                    Inventory inv = new Inventory();
                    inv.setDevice(device);
                    inv.setBin(targetBin);
                    inv.setQuantity(0);
                    return inv;
                });

        targetInv.setQuantity(targetInv.getQuantity() + item.getQuantity());
        inventoryRepository.save(targetInv);

        deviceStatusSyncService.syncOnTransfer(device, targetBinId);

        item.setStatus(1);
        item.setTransferTime(LocalDateTime.now());
        stockTransferItemRepository.save(item);

        logger.info("调拨明细执行完成, 设备: {}, 新货位: {}", device.getDeviceCode(), targetBin.getCode());
    }

    @Override
    @Transactional
    public void approveStockTransfer(Long id, Long approverId) {
        logger.info("审核库存调拨, ID: {}, 审核人: {}", id, approverId);

        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", id));

        if (transfer.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能审核待审核状态的调拨单");
        }

        transfer.setStatus(1);
        transfer.setApproverId(approverId);
        transfer.setApproveTime(LocalDateTime.now());
        transfer.setUpdateTime(LocalDateTime.now());
        stockTransferRepository.save(transfer);

        logger.info("库存调拨审核成功, ID: {}", id);
    }

    public List<StockTransferItem> getTransferItems(Long transferId) {
        return stockTransferItemRepository.findByTransferIdOrderByDeviceCode(transferId);
    }

    public StockTransferItem addTransferItem(Long transferId, StockTransferItem item) {
        StockTransfer transfer = stockTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", transferId));

        if (transfer.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能向待审核的调拨单添加明细");
        }

        item.setTransferId(transferId);
        Device device = deviceRepository.findById(item.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", item.getDeviceId()));
        item.setDeviceCode(device.getDeviceCode());
        item.setDeviceName(device.getDeviceName());
        item.setSourceBinId(device.getBinId());
        if (device.getBin() != null) {
            item.setSourceBinCode(device.getBin().getCode());
        }
        item.setStatus(0);

        return stockTransferItemRepository.save(item);
    }

    public void removeTransferItem(Long itemId) {
        StockTransferItem item = stockTransferItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransferItem", "id", itemId));

        StockTransfer transfer = stockTransferRepository.findById(item.getTransferId())
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", item.getTransferId()));

        if (transfer.getStatus() != 0) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "只能从待审核的调拨单删除明细");
        }

        stockTransferItemRepository.deleteById(itemId);
    }

    private String generateTransferNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "DB" + dateStr + String.format("%04d", stockTransferRepository.count() + 1);
    }
}
