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
import com.backend.service.stock.impl.StockCountServiceImpl;

@DisplayName("库存盘点服务集成测试")
@ExtendWith(MockitoExtension.class)
class StockCountServiceIntegrationTest {

    @Mock
    private StockCountRepository stockCountRepository;

    @Mock
    private StockCountItemRepository stockCountItemRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private BinRepository binRepository;

    @Mock
    private DeviceStatusSyncService deviceStatusSyncService;

    private StockCountServiceImpl stockCountService;

    private StockCount stockCount;
    private Device device;
    private Bin bin;
    private Inventory inventory;
    private List<Inventory> inventories;

    @BeforeEach
    void setUp() {
        stockCountService = new StockCountServiceImpl(
                stockCountRepository,
                stockCountItemRepository,
                inventoryRepository,
                deviceRepository,
                binRepository,
                deviceStatusSyncService
        );

        device = new Device();
        device.setId(1L);
        device.setDeviceCode("DEV001");
        device.setDeviceName("测试设备");

        bin = new Bin();
        bin.setId(1L);
        bin.setCode("BIN-A-01");

        inventory = new Inventory();
        inventory.setId(1L);
        inventory.setDevice(device);
        inventory.setBin(bin);
        inventory.setQuantity(10);

        inventories = new ArrayList<>();
        inventories.add(inventory);

        stockCount = new StockCount();
        stockCount.setId(1L);
        stockCount.setCountNo("PD20260213001");
        stockCount.setStatus(0);
        stockCount.setWarehouseId(1L);
    }

    @Test
    @DisplayName("应成功创建盘点单并生成明细")
    void shouldCreateStockCountWithItems() {
        StockCount newCount = new StockCount();
        newCount.setWarehouseId(1L);

        when(stockCountRepository.save(any(StockCount.class))).thenAnswer(invocation -> {
            StockCount saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(inventoryRepository.findByWarehouseId(1L)).thenReturn(inventories);
        when(stockCountItemRepository.save(any(StockCountItem.class))).thenAnswer(invocation -> {
            StockCountItem item = invocation.getArgument(0);
            item.setId(1L);
            return item;
        });

        StockCount result = stockCountService.createStockCountWithItems(newCount);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo(0);
        assertThat(result.getCountNo()).isNotNull();

        verify(stockCountItemRepository).save(any(StockCountItem.class));
    }

    @Test
    @DisplayName("应成功执行盘点明细")
    void shouldCountItem() {
        StockCountItem item = new StockCountItem();
        item.setId(1L);
        item.setStockCountId(1L);
        item.setDeviceId(1L);
        item.setBinId(1L);
        item.setBookQuantity(10);
        item.setStatus(0);

        when(stockCountItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(stockCountItemRepository.save(any(StockCountItem.class))).thenReturn(item);

        stockCountService.countItem(1L, 12, "盘盈2件", 100L, "张三");

        assertThat(item.getActualQuantity()).isEqualTo(12);
        assertThat(item.getDifference()).isEqualTo(2);
        assertThat(item.getDifferenceType()).isEqualTo(1);
        assertThat(item.getStatus()).isEqualTo(1);
        assertThat(item.getCounterName()).isEqualTo("张三");
        assertThat(item.getCountTime()).isNotNull();

        verify(stockCountItemRepository).save(item);
    }

    @Test
    @DisplayName("应正确处理盘亏情况")
    void shouldHandleLossDifference() {
        StockCountItem item = new StockCountItem();
        item.setId(1L);
        item.setStockCountId(1L);
        item.setDeviceId(1L);
        item.setBinId(1L);
        item.setBookQuantity(10);
        item.setStatus(0);

        when(stockCountItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(stockCountItemRepository.save(any(StockCountItem.class))).thenReturn(item);

        stockCountService.countItem(1L, 8, "盘亏2件", 100L, "张三");

        assertThat(item.getDifference()).isEqualTo(-2);
        assertThat(item.getDifferenceType()).isEqualTo(2);
    }

    @Test
    @DisplayName("盘点明细不存在应抛出异常")
    void shouldThrowExceptionWhenItemNotFound() {
        when(stockCountItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockCountService.countItem(999L, 10, "测试", 100L, "张三"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("应成功完成盘点并调整库存")
    void shouldCompleteStockCountAndAdjustInventory() {
        stockCount.setStatus(2);

        StockCountItem item1 = new StockCountItem();
        item1.setId(1L);
        item1.setStockCountId(1L);
        item1.setDeviceId(1L);
        item1.setBinId(1L);
        item1.setDeviceCode("DEV001");
        item1.setBookQuantity(10);
        item1.setActualQuantity(12);
        item1.setDifference(2);
        item1.setDifferenceType(1);
        item1.setStatus(1);

        StockCountItem item2 = new StockCountItem();
        item2.setId(2L);
        item2.setStockCountId(1L);
        item2.setDeviceId(2L);
        item2.setBinId(1L);
        item2.setDeviceCode("DEV002");
        item2.setBookQuantity(5);
        item2.setActualQuantity(5);
        item2.setDifference(0);
        item2.setDifferenceType(0);
        item2.setStatus(1);

        List<StockCountItem> items = List.of(item1, item2);

        when(stockCountRepository.findById(1L)).thenReturn(Optional.of(stockCount));
        when(stockCountItemRepository.findByStockCountId(1L)).thenReturn(items);
        when(inventoryRepository.findByDeviceIdAndBinId(1L, 1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);
        when(stockCountItemRepository.saveAll(anyList())).thenReturn(items);
        when(stockCountRepository.save(any(StockCount.class))).thenReturn(stockCount);

        stockCountService.completeStockCount(1L);

        assertThat(stockCount.getStatus()).isEqualTo(3);
        assertThat(item1.getStatus()).isEqualTo(2);
        assertThat(item2.getStatus()).isEqualTo(1);

        verify(inventoryRepository).save(any(Inventory.class));
        verify(stockCountRepository).save(stockCount);
    }

    @Test
    @DisplayName("盘点单状态不正确时完成盘点应抛出异常")
    void shouldThrowExceptionWhenStatusInvalidForComplete() {
        stockCount.setStatus(0);

        when(stockCountRepository.findById(1L)).thenReturn(Optional.of(stockCount));

        assertThatThrownBy(() -> stockCountService.completeStockCount(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能处理已完成的盘点单");
    }

    @Test
    @DisplayName("应成功审核盘点单")
    void shouldApproveStockCount() {
        stockCount.setStatus(0);

        when(stockCountRepository.findById(1L)).thenReturn(Optional.of(stockCount));
        when(stockCountRepository.save(any(StockCount.class))).thenReturn(stockCount);

        stockCountService.approveStockCount(1L, 100L);

        assertThat(stockCount.getStatus()).isEqualTo(1);
        assertThat(stockCount.getApproverId()).isEqualTo(100L);
        assertThat(stockCount.getApproveTime()).isNotNull();

        verify(stockCountRepository).save(stockCount);
    }

    @Test
    @DisplayName("重复审核应抛出异常")
    void shouldThrowExceptionWhenApproveTwice() {
        stockCount.setStatus(1);

        when(stockCountRepository.findById(1L)).thenReturn(Optional.of(stockCount));

        assertThatThrownBy(() -> stockCountService.approveStockCount(1L, 100L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能审核待审核状态的盘点单");
    }

    @Test
    @DisplayName("应成功删除盘点单及其明细")
    void shouldDeleteStockCountWithItems() {
        stockCount.setStatus(0);

        when(stockCountRepository.findById(1L)).thenReturn(Optional.of(stockCount));
        doNothing().when(stockCountItemRepository).deleteByStockCountId(1L);
        doNothing().when(stockCountRepository).deleteById(1L);

        stockCountService.deleteStockCount(1L);

        verify(stockCountItemRepository).deleteByStockCountId(1L);
        verify(stockCountRepository).deleteById(1L);
    }

    @Test
    @DisplayName("已审核的盘点单不能删除")
    void shouldNotDeleteApprovedStockCount() {
        stockCount.setStatus(1);

        when(stockCountRepository.findById(1L)).thenReturn(Optional.of(stockCount));

        assertThatThrownBy(() -> stockCountService.deleteStockCount(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能删除待审核状态的盘点单");

        verify(stockCountRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("应正确获取盘点统计信息")
    void shouldGetStockCountStatistics() {
        when(stockCountItemRepository.countByStockCountId(1L)).thenReturn(10L);
        when(stockCountItemRepository.countByStockCountIdAndCounted(1L)).thenReturn(8L);
        when(stockCountItemRepository.countByStockCountIdAndHasDifference(1L)).thenReturn(3L);

        long total = stockCountService.getItemCount(1L);
        long counted = stockCountService.getCountedItemCount(1L);
        long diff = stockCountService.getDifferenceItemCount(1L);

        assertThat(total).isEqualTo(10L);
        assertThat(counted).isEqualTo(8L);
        assertThat(diff).isEqualTo(3L);
    }
}
