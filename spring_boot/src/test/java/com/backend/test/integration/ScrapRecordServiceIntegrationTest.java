package com.backend.test.integration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.entity.Device;
import com.backend.entity.ScrapRecord;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.ScrapRecordRepository;
import com.backend.service.DeviceStatusSyncService;
import com.backend.service.ScrapRecordService;

@DisplayName("报废记录服务集成测试")
@ExtendWith(MockitoExtension.class)
class ScrapRecordServiceIntegrationTest {

    @Mock
    private ScrapRecordRepository scrapRecordRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private DeviceStatusSyncService deviceStatusSyncService;

    private ScrapRecordService scrapRecordService;

    private Device device;
    private ScrapRecord scrapRecord;

    @BeforeEach
    void setUp() {
        scrapRecordService = new ScrapRecordService(
                scrapRecordRepository,
                deviceRepository,
                inventoryRepository,
                deviceStatusSyncService
        );

        device = new Device();
        device.setId(1L);
        device.setDeviceCode("DEV001");
        device.setDeviceName("测试设备");
        device.setModel("MODEL-A");
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        device.setBinId(1L);
        device.setBinName("BIN-A-01");

        scrapRecord = new ScrapRecord();
        scrapRecord.setId(1L);
        scrapRecord.setDeviceId(1L);
        scrapRecord.setScrapReason("设备老化");
        scrapRecord.setStatus(0);
    }

    @Test
    @DisplayName("应成功创建报废记录")
    void shouldCreateScrapRecord() {
        ScrapRecord newRecord = new ScrapRecord();
        newRecord.setDeviceId(1L);
        newRecord.setScrapReason("设备老化");

        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(scrapRecordRepository.save(any(ScrapRecord.class))).thenAnswer(invocation -> {
            ScrapRecord saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        ScrapRecord result = scrapRecordService.createScrapRecord(newRecord);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(0);
        assertThat(result.getDeviceCode()).isEqualTo("DEV001");
        assertThat(result.getDeviceName()).isEqualTo("测试设备");

        verify(scrapRecordRepository).save(any(ScrapRecord.class));
    }

    @Test
    @DisplayName("已报废设备不能重复报废")
    void shouldNotCreateScrapForAlreadyScrappedDevice() {
        device.setStatus(DeviceStatus.SCRAPPED.getCode());

        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));

        ScrapRecord newRecord = new ScrapRecord();
        newRecord.setDeviceId(1L);

        assertThatThrownBy(() -> scrapRecordService.createScrapRecord(newRecord))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("设备已报废");

        verify(scrapRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("设备不存在时应抛出异常")
    void shouldThrowExceptionWhenDeviceNotFound() {
        when(deviceRepository.findById(999L)).thenReturn(Optional.empty());

        ScrapRecord newRecord = new ScrapRecord();
        newRecord.setDeviceId(999L);

        assertThatThrownBy(() -> scrapRecordService.createScrapRecord(newRecord))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("应成功审批报废并同步设备状态")
    void shouldApproveScrapAndSyncDeviceStatus() {
        scrapRecord.setDevice(device);

        when(scrapRecordRepository.findById(1L)).thenReturn(Optional.of(scrapRecord));
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        doNothing().when(deviceStatusSyncService).syncOnScrap(any(Device.class), anyString());
        when(scrapRecordRepository.save(any(ScrapRecord.class))).thenReturn(scrapRecord);

        ScrapRecord result = scrapRecordService.approveScrap(1L, "管理员", "同意报废");

        assertThat(result.getStatus()).isEqualTo(1);
        assertThat(result.getApprover()).isEqualTo("管理员");
        assertThat(result.getApprovalComment()).isEqualTo("同意报废");
        assertThat(result.getApprovalDate()).isNotNull();

        verify(deviceStatusSyncService).syncOnScrap(device, "设备老化");
        verify(scrapRecordRepository).save(scrapRecord);
    }

    @Test
    @DisplayName("已审批的报废记录不能重复审批")
    void shouldNotApproveAlreadyApprovedScrap() {
        scrapRecord.setStatus(1);

        when(scrapRecordRepository.findById(1L)).thenReturn(Optional.of(scrapRecord));

        assertThatThrownBy(() -> scrapRecordService.approveScrap(1L, "管理员", "同意"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能审批待审批状态");

        verify(deviceStatusSyncService, never()).syncOnScrap(any(), anyString());
    }

    @Test
    @DisplayName("应成功拒绝报废申请")
    void shouldRejectScrap() {
        when(scrapRecordRepository.findById(1L)).thenReturn(Optional.of(scrapRecord));
        when(scrapRecordRepository.save(any(ScrapRecord.class))).thenReturn(scrapRecord);

        ScrapRecord result = scrapRecordService.rejectScrap(1L, "管理员", "设备仍可使用");

        assertThat(result.getStatus()).isEqualTo(2);
        assertThat(result.getApprover()).isEqualTo("管理员");
        assertThat(result.getApprovalComment()).isEqualTo("设备仍可使用");

        verify(scrapRecordRepository).save(scrapRecord);
        verify(deviceStatusSyncService, never()).syncOnScrap(any(), anyString());
    }

    @Test
    @DisplayName("已审批的报废记录不能拒绝")
    void shouldNotRejectAlreadyProcessedScrap() {
        scrapRecord.setStatus(1);

        when(scrapRecordRepository.findById(1L)).thenReturn(Optional.of(scrapRecord));

        assertThatThrownBy(() -> scrapRecordService.rejectScrap(1L, "管理员", "拒绝"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能拒绝待审批状态");
    }

    @Test
    @DisplayName("应成功删除待审批的报废记录")
    void shouldDeletePendingScrapRecord() {
        when(scrapRecordRepository.findById(1L)).thenReturn(Optional.of(scrapRecord));
        doNothing().when(scrapRecordRepository).deleteById(1L);

        scrapRecordService.deleteScrapRecord(1L);

        verify(scrapRecordRepository).deleteById(1L);
    }

    @Test
    @DisplayName("已审批的报废记录不能删除")
    void shouldNotDeleteApprovedScrapRecord() {
        scrapRecord.setStatus(1);

        when(scrapRecordRepository.findById(1L)).thenReturn(Optional.of(scrapRecord));

        assertThatThrownBy(() -> scrapRecordService.deleteScrapRecord(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能删除待审批状态");

        verify(scrapRecordRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("应正确统计待审批数量")
    void shouldCountPendingApproval() {
        when(scrapRecordRepository.countByStatus(0)).thenReturn(5L);

        long count = scrapRecordService.countPendingApproval();

        assertThat(count).isEqualTo(5L);
    }

    @Test
    @DisplayName("应正确统计已审批数量")
    void shouldCountApproved() {
        when(scrapRecordRepository.countByStatus(1)).thenReturn(10L);

        long count = scrapRecordService.countApproved();

        assertThat(count).isEqualTo(10L);
    }
}
