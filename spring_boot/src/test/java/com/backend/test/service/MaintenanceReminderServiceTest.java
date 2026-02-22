package com.backend.test.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.entity.Device;
import com.backend.entity.MaintenancePlan;
import com.backend.entity.MaintenanceRecord;
import com.backend.repository.DeviceRepository;
import com.backend.repository.MaintenancePlanRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.service.DeviceStatusSyncService;
import com.backend.service.MaintenanceReminderService;

@DisplayName("保养提醒服务测试")
@ExtendWith(MockitoExtension.class)
class MaintenanceReminderServiceTest {

    @Mock
    private MaintenancePlanRepository maintenancePlanRepository;

    @Mock
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private DeviceStatusSyncService deviceStatusSyncService;

    @InjectMocks
    private MaintenanceReminderService reminderService;

    private Device device;
    private MaintenancePlan plan;
    private MaintenanceRecord record;

    @BeforeEach
    void setUp() {
        device = new Device();
        device.setId(1L);
        device.setDeviceCode("DEV001");
        device.setDeviceName("测试设备");

        plan = new MaintenancePlan();
        plan.setId(1L);
        plan.setDeviceId(1L);
        plan.setPlanNo("MP20260213001");
        plan.setPlanName("设备保养计划");
        plan.setCycleDays(30);
        plan.setReminderDays(7);
        plan.setNextMaintenanceDate(LocalDate.now().plusDays(5));
        plan.setStatus(1);
        plan.setAutoCreateRecord(true);

        record = new MaintenanceRecord();
        record.setId(1L);
        record.setDeviceId(1L);
        record.setDeviceCode("DEV001");
        record.setDeviceName("测试设备");
        record.setMaintenanceNo("BY20260213001");
        record.setStatus(0);
    }

    @Test
    @DisplayName("应成功创建保养计划")
    void shouldCreateMaintenancePlan() {
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(maintenancePlanRepository.save(any(MaintenancePlan.class))).thenAnswer(invocation -> {
            MaintenancePlan saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        MaintenancePlan result = reminderService.createMaintenancePlan(
                1L, 2, 30, 7, "测试保养计划", 100L, "张三");

        assertThat(result).isNotNull();
        assertThat(result.getPlanNo()).isNotNull();
        assertThat(result.getPlanName()).isEqualTo("测试保养计划");
        assertThat(result.getCycleDays()).isEqualTo(30);
        assertThat(result.getReminderDays()).isEqualTo(7);
        assertThat(result.getStatus()).isEqualTo(1);
        assertThat(result.getCreatorName()).isEqualTo("张三");

        verify(maintenancePlanRepository).save(any(MaintenancePlan.class));
    }

    @Test
    @DisplayName("设备不存在时创建保养计划应抛出异常")
    void shouldThrowExceptionWhenDeviceNotFoundOnCreatePlan() {
        when(deviceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reminderService.createMaintenancePlan(
                999L, 2, 30, 7, "测试计划", 100L, "张三"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("设备不存在");
    }

    @Test
    @DisplayName("应成功从计划创建保养记录")
    void shouldCreateMaintenanceRecordFromPlan() {
        plan.setNextMaintenanceDate(LocalDate.now());

        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenAnswer(invocation -> {
            MaintenanceRecord saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(maintenancePlanRepository.save(any(MaintenancePlan.class))).thenReturn(plan);

        MaintenanceRecord result = reminderService.createMaintenanceRecordFromPlan(plan);

        assertThat(result).isNotNull();
        assertThat(result.getDeviceId()).isEqualTo(1L);
        assertThat(result.getMaintenanceNo()).isNotNull();
        assertThat(result.getStatus()).isEqualTo(0);
        assertThat(result.getRemark()).contains("自动生成");

        verify(maintenanceRecordRepository).save(any(MaintenanceRecord.class));
        verify(maintenancePlanRepository).save(plan);
    }

    @Test
    @DisplayName("应成功完成保养并更新计划")
    void shouldCompleteMaintenance() {
        record.setMaintenanceDate(LocalDate.now());

        when(maintenanceRecordRepository.findById(1L)).thenReturn(Optional.of(record));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenReturn(record);
        when(maintenancePlanRepository.findTopByDeviceIdOrderByCreateTimeDesc(1L)).thenReturn(Optional.of(plan));
        when(maintenancePlanRepository.save(any(MaintenancePlan.class))).thenReturn(plan);
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        doNothing().when(deviceStatusSyncService).syncOnMaintenanceComplete(any(Device.class));

        reminderService.completeMaintenance(1L, "保养完成，设备正常", "李四");

        assertThat(record.getStatus()).isEqualTo(2);
        assertThat(record.getMaintenanceResult()).isEqualTo("保养完成，设备正常");
        assertThat(record.getMaintenancePerson()).isEqualTo("李四");

        verify(maintenanceRecordRepository).save(record);
        verify(maintenancePlanRepository).save(plan);
        verify(deviceStatusSyncService).syncOnMaintenanceComplete(device);
    }

    @Test
    @DisplayName("保养记录不存在时完成保养应抛出异常")
    void shouldThrowExceptionWhenRecordNotFoundOnComplete() {
        when(maintenanceRecordRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reminderService.completeMaintenance(999L, "结果", "张三"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("保养记录不存在");
    }

    @Test
    @DisplayName("应正确获取到期计划列表")
    void shouldGetDuePlans() {
        List<MaintenancePlan> plans = new ArrayList<>();
        plans.add(plan);

        when(maintenancePlanRepository.findDuePlans(any(LocalDate.class))).thenReturn(plans);

        List<MaintenancePlan> result = reminderService.getDuePlans();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("应正确获取需要提醒的计划列表")
    void shouldGetPlansNeedingReminder() {
        List<MaintenancePlan> plans = new ArrayList<>();
        plans.add(plan);

        when(maintenancePlanRepository.findPlansNeedingReminder(any(LocalDate.class))).thenReturn(plans);

        List<MaintenancePlan> result = reminderService.getPlansNeedingReminder();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("应正确统计逾期计划数量")
    void shouldGetOverdueCount() {
        when(maintenancePlanRepository.countOverduePlans(any(LocalDate.class))).thenReturn(5L);

        long count = reminderService.getOverdueCount();

        assertThat(count).isEqualTo(5L);
    }

    @Test
    @DisplayName("定时任务应正确处理保养提醒")
    void shouldCheckMaintenanceReminders() {
        plan.setNextMaintenanceDate(LocalDate.now().plusDays(5));
        List<MaintenancePlan> plans = new ArrayList<>();
        plans.add(plan);

        when(maintenancePlanRepository.findPlansNeedingReminder(any(LocalDate.class))).thenReturn(plans);

        reminderService.checkMaintenanceReminders();

        verify(maintenancePlanRepository).findPlansNeedingReminder(any(LocalDate.class));
    }

    @Test
    @DisplayName("定时任务应处理逾期计划并自动创建记录")
    void shouldProcessOverduePlanAndCreateRecord() {
        plan.setNextMaintenanceDate(LocalDate.now().minusDays(1));
        plan.setAutoCreateRecord(true);
        List<MaintenancePlan> plans = new ArrayList<>();
        plans.add(plan);

        when(maintenancePlanRepository.findPlansNeedingReminder(any(LocalDate.class))).thenReturn(plans);
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(device));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenAnswer(invocation -> {
            MaintenanceRecord saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(maintenancePlanRepository.save(any(MaintenancePlan.class))).thenReturn(plan);

        reminderService.checkMaintenanceReminders();

        verify(maintenanceRecordRepository).save(any(MaintenanceRecord.class));
    }

    @Test
    @DisplayName("定时任务处理异常不应影响其他计划")
    void shouldContinueOnException() {
        MaintenancePlan plan1 = new MaintenancePlan();
        plan1.setId(1L);
        plan1.setDeviceId(1L);
        plan1.setNextMaintenanceDate(LocalDate.now().minusDays(1));
        plan1.setAutoCreateRecord(true);

        List<MaintenancePlan> plans = new ArrayList<>();
        plans.add(plan1);

        when(maintenancePlanRepository.findPlansNeedingReminder(any(LocalDate.class))).thenReturn(plans);
        when(deviceRepository.findById(1L)).thenThrow(new RuntimeException("设备不存在"));

        reminderService.checkMaintenanceReminders();

        verify(maintenancePlanRepository).findPlansNeedingReminder(any(LocalDate.class));
    }
}
