package com.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Device;
import com.backend.entity.MaintenancePlan;
import com.backend.entity.MaintenanceRecord;
import com.backend.repository.DeviceRepository;
import com.backend.repository.MaintenancePlanRepository;
import com.backend.repository.MaintenanceRecordRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaintenanceReminderService {

    private final MaintenancePlanRepository maintenancePlanRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceStatusSyncService deviceStatusSyncService;

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void checkMaintenanceReminders() {
        log.info("开始执行保养提醒检查...");

        LocalDate today = LocalDate.now();
        LocalDate reminderDate = today.plusDays(7);

        List<MaintenancePlan> plans = maintenancePlanRepository.findPlansNeedingReminder(reminderDate);

        log.info("找到 {} 个需要提醒的保养计划", plans.size());

        for (MaintenancePlan plan : plans) {
            try {
                processMaintenanceReminder(plan);
            } catch (Exception e) {
                log.error("处理保养提醒失败: planId={}, error={}", plan.getId(), e.getMessage(), e);
            }
        }

        log.info("保养提醒检查完成");
    }

    private void processMaintenanceReminder(MaintenancePlan plan) {
        log.info("处理保养提醒: planId={}, deviceId={}, nextDate={}", 
                plan.getId(), plan.getDeviceId(), plan.getNextMaintenanceDate());

        if (plan.getAutoCreateRecord() != null && plan.getAutoCreateRecord()) {
            if (plan.isOverdue() || plan.getNextMaintenanceDate().isEqual(LocalDate.now())) {
                createMaintenanceRecordFromPlan(plan);
            }
        }

        sendReminderNotification(plan);
    }

    @Transactional
    public MaintenanceRecord createMaintenanceRecordFromPlan(MaintenancePlan plan) {
        log.info("从保养计划创建保养记录: planId={}", plan.getId());

        Device device = deviceRepository.findById(plan.getDeviceId())
                .orElseThrow(() -> new RuntimeException("设备不存在: " + plan.getDeviceId()));

        MaintenanceRecord record = new MaintenanceRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());
        record.setMaintenanceNo(generateMaintenanceNo());
        record.setMaintenanceDate(LocalDate.now());
        record.setMaintenanceType(plan.getMaintenanceType());
        record.setStatus(0);
        record.setRemark("由保养计划自动生成: " + plan.getPlanNo());
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        MaintenanceRecord saved = maintenanceRecordRepository.save(record);

        plan.updateAfterMaintenance(LocalDate.now(), saved.getId());
        maintenancePlanRepository.save(plan);

        log.info("保养记录创建成功: recordId={}, planId={}", saved.getId(), plan.getId());
        return saved;
    }

    private void sendReminderNotification(MaintenancePlan plan) {
        log.info("发送保养提醒通知: planId={}, deviceId={}, nextDate={}", 
                plan.getId(), plan.getDeviceId(), plan.getNextMaintenanceDate());

        // TODO: 集成通知服务（邮件、短信、系统消息等）
    }

    @Transactional
    public MaintenancePlan createMaintenancePlan(Long deviceId, Integer maintenanceType, 
                                                   Integer cycleDays, Integer reminderDays,
                                                   String planName, Long creatorId, String creatorName) {
        log.info("创建保养计划: deviceId={}, cycleDays={}", deviceId, cycleDays);

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("设备不存在: " + deviceId));

        MaintenancePlan plan = new MaintenancePlan();
        plan.setDevice(device);
        plan.setDeviceId(deviceId);
        plan.setPlanNo(generatePlanNo());
        plan.setPlanName(planName != null ? planName : device.getDeviceName() + "保养计划");
        plan.setMaintenanceType(maintenanceType != null ? maintenanceType : 2);
        plan.setCycleDays(cycleDays);
        plan.setReminderDays(reminderDays != null ? reminderDays : 7);
        plan.setStatus(1);
        plan.setCreatorId(creatorId);
        plan.setCreatorName(creatorName);

        plan.calculateNextDate();

        return maintenancePlanRepository.save(plan);
    }

    @Transactional
    public void completeMaintenance(Long recordId, String maintenanceResult, String maintainerName) {
        log.info("完成保养: recordId={}", recordId);

        MaintenanceRecord record = maintenanceRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("保养记录不存在: " + recordId));

        record.setStatus(2);
        record.setMaintenanceResult(maintenanceResult);
        record.setMaintenancePerson(maintainerName);
        record.setActualEndTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        maintenanceRecordRepository.save(record);

        MaintenancePlan plan = maintenancePlanRepository.findTopByDeviceIdOrderByCreateTimeDesc(record.getDeviceId())
                .orElse(null);

        if (plan != null) {
            plan.updateAfterMaintenance(record.getMaintenanceDate(), recordId);
            maintenancePlanRepository.save(plan);
        }

        Device device = deviceRepository.findById(record.getDeviceId()).orElse(null);
        if (device != null) {
            deviceStatusSyncService.syncOnMaintenanceComplete(device);
        }

        log.info("保养完成: recordId={}", recordId);
    }

    private String generatePlanNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "MP" + dateStr + String.format("%04d", maintenancePlanRepository.count() + 1);
    }

    private String generateMaintenanceNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "BY" + dateStr + String.format("%04d", maintenanceRecordRepository.count() + 1);
    }

    public List<MaintenancePlan> getDuePlans() {
        return maintenancePlanRepository.findDuePlans(LocalDate.now());
    }

    public List<MaintenancePlan> getPlansNeedingReminder() {
        LocalDate reminderDate = LocalDate.now().plusDays(7);
        return maintenancePlanRepository.findPlansNeedingReminder(reminderDate);
    }

    public long getOverdueCount() {
        return maintenancePlanRepository.countOverduePlans(LocalDate.now());
    }
}
