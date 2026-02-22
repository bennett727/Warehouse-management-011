package com.backend.test.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.entity.Area;
import com.backend.entity.Bin;
import com.backend.entity.Device;
import com.backend.entity.Warehouse;
import com.backend.enums.DeviceStatus;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import com.backend.service.DeviceStatusSyncService;

@DisplayName("设备状态同步服务测试")
@ExtendWith(MockitoExtension.class)
class DeviceStatusSyncServiceTest {

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private BinRepository binRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private DeviceStatusSyncService syncService;

    private Device device;
    private Bin bin;
    private Area area;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        device = new Device();
        device.setId(1L);
        device.setDeviceCode("DEV001");
        device.setDeviceName("测试设备");
        device.setStatus(DeviceStatus.PENDING_INBOUND.getCode());

        warehouse = new Warehouse();
        warehouse.setId(1L);
        warehouse.setWarehouseName("测试仓库");

        area = new Area();
        area.setId(1L);
        area.setName("测试区域");
        area.setWarehouse(warehouse);
        area.setWarehouseId(1L);

        bin = new Bin();
        bin.setId(1L);
        bin.setCode("BIN-A-01");
        bin.setArea(area);
        bin.setAreaId(1L);
    }

    @Test
    @DisplayName("入库时应正确同步设备状态")
    void shouldSyncOnInbound() {
        when(binRepository.findById(1L)).thenReturn(Optional.of(bin));
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnInbound(device, 1L, 100L, "操作员");

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.IN_STOCK.getCode());
        assertThat(device.getBinId()).isEqualTo(1L);
        assertThat(device.getAreaId()).isEqualTo(1L);
        assertThat(device.getBinName()).isEqualTo("BIN-A-01");
        assertThat(device.getInboundPersonName()).isEqualTo("操作员");
        assertThat(device.getInboundTime()).isNotNull();
        assertThat(device.getCurrentLocationType()).isEqualTo(0);

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("入库时货位不存在应抛出异常")
    void shouldThrowExceptionWhenBinNotFoundOnInbound() {
        when(binRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> syncService.syncOnInbound(device, 999L, 100L, "操作员"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("货位不存在");

        verify(deviceRepository, never()).save(any());
    }

    @Test
    @DisplayName("安装出库时应正确同步设备状态")
    void shouldSyncOnInstallOutbound() {
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        device.setBinId(1L);
        device.setBinName("BIN-A-01");
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnInstallOutbound(device, 100L, "操作员",
                "广东省", "深圳市", "南山区", "科技园路1号");

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.IN_USE.getCode());
        assertThat(device.getBinId()).isNull();
        assertThat(device.getBinName()).isNull();
        assertThat(device.getInstallationProvince()).isEqualTo("广东省");
        assertThat(device.getInstallationCity()).isEqualTo("深圳市");
        assertThat(device.getInstallationDistrict()).isEqualTo("南山区");
        assertThat(device.getInstallationAddress()).isEqualTo("科技园路1号");
        assertThat(device.getInstallationLocation()).contains("广东省", "深圳市", "南山区", "科技园路1号");
        assertThat(device.getOutboundPersonName()).isEqualTo("操作员");
        assertThat(device.getOutboundTime()).isNotNull();
        assertThat(device.getCurrentLocationType()).isEqualTo(1);

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("维修出库时应正确同步设备状态")
    void shouldSyncOnRepairOutbound() {
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnRepairOutbound(device, 100L, "操作员");

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.UNDER_REPAIR.getCode());
        assertThat(device.getOutboundPersonName()).isEqualTo("操作员");
        assertThat(device.getOutboundTime()).isNotNull();

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("维修完成回库时应正确同步设备状态")
    void shouldSyncOnRepairComplete() {
        device.setStatus(DeviceStatus.UNDER_REPAIR.getCode());
        when(binRepository.findById(1L)).thenReturn(Optional.of(bin));
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnRepairComplete(device, 1L, 100L, "操作员");

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.IN_STOCK.getCode());
        assertThat(device.getBinId()).isEqualTo(1L);
        assertThat(device.getBinName()).isEqualTo("BIN-A-01");
        assertThat(device.getInboundPersonName()).isEqualTo("操作员");
        assertThat(device.getInboundTime()).isNotNull();

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("保养开始时应正确同步设备状态")
    void shouldSyncOnMaintenanceStart() {
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnMaintenanceStart(device);

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.MAINTENANCE.getCode());

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("保养完成时应正确同步设备状态")
    void shouldSyncOnMaintenanceComplete() {
        device.setStatus(DeviceStatus.MAINTENANCE.getCode());
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnMaintenanceComplete(device);

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.IN_STOCK.getCode());

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("报废时应正确同步设备状态并清理库存")
    void shouldSyncOnScrap() {
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        device.setBinId(1L);
        device.setBinName("BIN-A-01");
        device.setAreaId(1L);
        device.setAreaName("测试区域");
        device.setCurrentLocation("测试仓库 > 测试区域 > BIN-A-01");
        
        when(deviceRepository.save(any(Device.class))).thenReturn(device);
        doNothing().when(inventoryRepository).deleteByDeviceId(1L);

        syncService.syncOnScrap(device, "设备老化");

        assertThat(device.getStatus()).isEqualTo(DeviceStatus.SCRAPPED.getCode());
        assertThat(device.getScrapReason()).isEqualTo("设备老化");
        assertThat(device.getScrapTime()).isNotNull();
        assertThat(device.getBinId()).isNull();
        assertThat(device.getBinName()).isNull();
        assertThat(device.getAreaId()).isNull();
        assertThat(device.getAreaName()).isNull();
        assertThat(device.getCurrentLocation()).isNull();

        verify(inventoryRepository).deleteByDeviceId(1L);
        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("调拨时应正确同步设备位置")
    void shouldSyncOnTransfer() {
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        device.setBinId(1L);
        device.setBinName("BIN-A-01");
        
        Bin targetBin = new Bin();
        targetBin.setId(2L);
        targetBin.setCode("BIN-B-02");
        targetBin.setArea(area);
        targetBin.setAreaId(1L);
        
        when(binRepository.findById(2L)).thenReturn(Optional.of(targetBin));
        when(deviceRepository.save(any(Device.class))).thenReturn(device);

        syncService.syncOnTransfer(device, 2L);

        assertThat(device.getBinId()).isEqualTo(2L);
        assertThat(device.getBinName()).isEqualTo("BIN-B-02");
        assertThat(device.getAreaId()).isEqualTo(1L);

        verify(deviceRepository).save(device);
    }

    @Test
    @DisplayName("调拨时目标货位不存在应抛出异常")
    void shouldThrowExceptionWhenTargetBinNotFound() {
        when(binRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> syncService.syncOnTransfer(device, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("目标货位不存在");

        verify(deviceRepository, never()).save(any());
    }
}
