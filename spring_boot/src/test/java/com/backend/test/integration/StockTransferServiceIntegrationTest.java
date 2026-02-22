package com.backend.test.integration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.common.ErrorCode;
import com.backend.entity.Area;
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
import com.backend.service.stock.impl.StockTransferServiceImpl;

@DisplayName("库存调拨服务集成测试")
@ExtendWith(MockitoExtension.class)
class StockTransferServiceIntegrationTest {

    @Mock
    private StockTransferRepository stockTransferRepository;

    @Mock
    private StockTransferItemRepository stockTransferItemRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private BinRepository binRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private DeviceStatusSyncService deviceStatusSyncService;

    private StockTransferServiceImpl transferService;

    private StockTransfer transfer;
    private Device device;
    private Bin sourceBin;
    private Bin targetBin;
    private Inventory sourceInventory;
    private Inventory targetInventory;
    private StockTransferItem transferItem;

    @BeforeEach
    void setUp() {
        transferService = new StockTransferServiceImpl(
                stockTransferRepository,
                stockTransferItemRepository,
                deviceRepository,
                binRepository,
                inventoryRepository,
                deviceStatusSyncService
        );

        Area area = new Area();
        area.setId(1L);
        area.setName("测试区域");

        sourceBin = new Bin();
        sourceBin.setId(1L);
        sourceBin.setCode("BIN-A-01");
        sourceBin.setArea(area);
        sourceBin.setAreaId(1L);

        targetBin = new Bin();
        targetBin.setId(2L);
        targetBin.setCode("BIN-B-02");
        targetBin.setArea(area);
        targetBin.setAreaId(1L);

        device = new Device();
        device.setId(1L);
        device.setDeviceCode("DEV001");
        device.setDeviceName("测试设备");
        device.setBinId(1L);
        device.setBin(sourceBin);

        sourceInventory = new Inventory();
        sourceInventory.setId(1L);
        sourceInventory.setDevice(device);
        sourceInventory.setBin(sourceBin);
        sourceInventory.setQuantity(10);

        targetInventory = new Inventory();
        targetInventory.setId(2L);
        targetInventory.setDevice(device);
        targetInventory.setBin(targetBin);
        targetInventory.setQuantity(0);

        transfer = new StockTransfer();
        transfer.setId(1L);
        transfer.setTransferNo("DB20260213001");
        transfer.setSourceWarehouseId(1L);
        transfer.setTargetWarehouseId(1L);
        transfer.setStatus(0);

        transferItem = new StockTransferItem();
        transferItem.setId(1L);
        transferItem.setTransferId(1L);
        transferItem.setDeviceId(1L);
        transferItem.setDeviceCode("DEV001");
        transferItem.setDeviceName("测试设备");
        transferItem.setSourceBinId(1L);
        transferItem.setSourceBinCode("BIN-A-01");
        transferItem.setTargetBinId(2L);
        transferItem.setTargetBinCode("BIN-B-02");
        transferItem.setQuantity(5);
        transferItem.setStatus(0);
    }

    @Test
    @DisplayName("应成功创建调拨单并添加明细")
    void shouldCreateTransferWithItems() {
        StockTransfer newTransfer = new StockTransfer();
        newTransfer.setSourceWarehouseId(1L);
        newTransfer.setTargetWarehouseId(1L);

        List<StockTransferItem> items = new ArrayList<>();
        StockTransferItem item = new StockTransferItem();
        item.setDeviceId(1L);
        item.setTargetBinId(2L);
        item.setQuantity(5);
        items.add(item);

        when(stockTransferRepository.save(any(StockTransfer.class))).thenAnswer(invocation -> {
            StockTransfer saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(stockTransferItemRepository.save(any(StockTransferItem.class))).thenAnswer(invocation -> {
            StockTransferItem savedItem = invocation.getArgument(0);
            savedItem.setId(1L);
            return savedItem;
        });

        StockTransfer result = transferService.createStockTransferWithItems(newTransfer, items);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo(0);
        assertThat(result.getTransferNo()).isNotNull();

        verify(stockTransferItemRepository).save(any(StockTransferItem.class));
    }

    @Test
    @DisplayName("应成功审核调拨单")
    void shouldApproveTransfer() {
        transfer.setStatus(0);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(stockTransferRepository.save(any(StockTransfer.class))).thenReturn(transfer);

        transferService.approveStockTransfer(1L, 100L);

        assertThat(transfer.getStatus()).isEqualTo(1);
        assertThat(transfer.getApproverId()).isEqualTo(100L);
        assertThat(transfer.getApproveTime()).isNotNull();

        verify(stockTransferRepository).save(transfer);
    }

    @Test
    @DisplayName("重复审核应抛出异常")
    void shouldThrowExceptionWhenApproveTwice() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));

        assertThatThrownBy(() -> transferService.approveStockTransfer(1L, 100L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能审核待审核状态的调拨单");
    }

    @Test
    @DisplayName("应成功执行调拨并更新库存")
    void shouldExecuteTransferAndUpdateInventory() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(stockTransferItemRepository.findByTransferId(1L)).thenReturn(List.of(transferItem));
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 1L)).thenReturn(Optional.of(sourceInventory));
        when(binRepository.findById(2L)).thenReturn(Optional.of(targetBin));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 2L)).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(targetInventory);
        when(stockTransferItemRepository.save(any(StockTransferItem.class))).thenReturn(transferItem);
        when(stockTransferRepository.save(any(StockTransfer.class))).thenReturn(transfer);
        doNothing().when(deviceStatusSyncService).syncOnTransfer(any(Device.class), eq(2L));

        transferService.executeStockTransfer(1L);

        assertThat(transfer.getStatus()).isEqualTo(2);
        assertThat(transfer.getTransferDate()).isNotNull();

        verify(inventoryRepository, times(2)).save(any(Inventory.class));
        verify(deviceStatusSyncService).syncOnTransfer(any(Device.class), eq(2L));
    }

    @Test
    @DisplayName("调拨执行时源库存应正确扣减")
    void shouldDecreaseSourceInventoryOnTransfer() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(stockTransferItemRepository.findByTransferId(1L)).thenReturn(List.of(transferItem));
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 1L)).thenReturn(Optional.of(sourceInventory));
        when(binRepository.findById(2L)).thenReturn(Optional.of(targetBin));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 2L)).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(targetInventory);
        when(stockTransferItemRepository.save(any(StockTransferItem.class))).thenReturn(transferItem);
        when(stockTransferRepository.save(any(StockTransfer.class))).thenReturn(transfer);
        doNothing().when(deviceStatusSyncService).syncOnTransfer(any(Device.class), eq(2L));

        transferService.executeStockTransfer(1L);

        assertThat(sourceInventory.getQuantity()).isEqualTo(5);
        verify(inventoryRepository).save(sourceInventory);
    }

    @Test
    @DisplayName("调拨执行时目标库存应正确增加")
    void shouldIncreaseTargetInventoryOnTransfer() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(stockTransferItemRepository.findByTransferId(1L)).thenReturn(List.of(transferItem));
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 1L)).thenReturn(Optional.of(sourceInventory));
        when(binRepository.findById(2L)).thenReturn(Optional.of(targetBin));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 2L)).thenReturn(Optional.of(targetInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(targetInventory);
        when(stockTransferItemRepository.save(any(StockTransferItem.class))).thenReturn(transferItem);
        when(stockTransferRepository.save(any(StockTransfer.class))).thenReturn(transfer);
        doNothing().when(deviceStatusSyncService).syncOnTransfer(any(Device.class), eq(2L));

        transferService.executeStockTransfer(1L);

        assertThat(targetInventory.getQuantity()).isEqualTo(5);
        verify(inventoryRepository).save(targetInventory);
    }

    @Test
    @DisplayName("调拨单状态不正确时执行应抛出异常")
    void shouldThrowExceptionWhenStatusInvalidForExecute() {
        transfer.setStatus(0);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));

        assertThatThrownBy(() -> transferService.executeStockTransfer(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能执行已审核的调拨单");
    }

    @Test
    @DisplayName("应成功添加调拨明细")
    void shouldAddTransferItem() {
        transfer.setStatus(0);

        StockTransferItem newItem = new StockTransferItem();
        newItem.setDeviceId(1L);
        newItem.setTargetBinId(2L);
        newItem.setQuantity(3);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(stockTransferItemRepository.save(any(StockTransferItem.class))).thenAnswer(invocation -> {
            StockTransferItem saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        StockTransferItem result = transferService.addTransferItem(1L, newItem);

        assertThat(result).isNotNull();
        assertThat(result.getTransferId()).isEqualTo(1L);
        assertThat(result.getDeviceCode()).isEqualTo("DEV001");
        assertThat(result.getSourceBinId()).isEqualTo(1L);

        verify(stockTransferItemRepository).save(any(StockTransferItem.class));
    }

    @Test
    @DisplayName("已审核的调拨单不能添加明细")
    void shouldNotAddItemToApprovedTransfer() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));

        StockTransferItem newItem = new StockTransferItem();
        newItem.setDeviceId(1L);

        assertThatThrownBy(() -> transferService.addTransferItem(1L, newItem))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能向待审核的调拨单添加明细");
    }

    @Test
    @DisplayName("应成功删除调拨单及其明细")
    void shouldDeleteTransferWithItems() {
        transfer.setStatus(0);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        doNothing().when(stockTransferItemRepository).deleteByTransferId(1L);
        doNothing().when(stockTransferRepository).deleteById(1L);

        transferService.deleteStockTransfer(1L);

        verify(stockTransferItemRepository).deleteByTransferId(1L);
        verify(stockTransferRepository).deleteById(1L);
    }

    @Test
    @DisplayName("已审核的调拨单不能删除")
    void shouldNotDeleteApprovedTransfer() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));

        assertThatThrownBy(() -> transferService.deleteStockTransfer(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能删除待审核状态的调拨单");

        verify(stockTransferRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("调拨设备不存在应抛出异常")
    void shouldThrowExceptionWhenDeviceNotFound() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(stockTransferItemRepository.findByTransferId(1L)).thenReturn(List.of(transferItem));
        when(deviceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transferService.executeStockTransfer(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("目标货位不存在应抛出异常")
    void shouldThrowExceptionWhenTargetBinNotFound() {
        transfer.setStatus(1);

        when(stockTransferRepository.findById(1L)).thenReturn(Optional.of(transfer));
        when(stockTransferItemRepository.findByTransferId(1L)).thenReturn(List.of(transferItem));
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 1L)).thenReturn(Optional.of(sourceInventory));
        when(binRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transferService.executeStockTransfer(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
