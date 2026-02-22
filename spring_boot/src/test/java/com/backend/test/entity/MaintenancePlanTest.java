package com.backend.test.entity;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.backend.entity.MaintenancePlan;

@DisplayName("保养计划实体测试")
class MaintenancePlanTest {

    private MaintenancePlan plan;

    @BeforeEach
    void setUp() {
        plan = new MaintenancePlan();
        plan.setId(1L);
        plan.setPlanNo("MP-2026-001");
        plan.setPlanName("设备定期保养计划");
        plan.setCycleDays(30);
        plan.setReminderDays(7);
    }

    @Test
    @DisplayName("应正确判断保养提醒是否到期")
    void shouldCheckIfReminderDue() {
        plan.setNextMaintenanceDate(LocalDate.now().plusDays(5));
        plan.setReminderDays(7);
        
        assertThat(plan.isReminderDue()).isTrue();
    }

    @Test
    @DisplayName("应正确判断保养提醒未到期")
    void shouldCheckIfReminderNotDue() {
        plan.setNextMaintenanceDate(LocalDate.now().plusDays(10));
        plan.setReminderDays(7);
        
        assertThat(plan.isReminderDue()).isFalse();
    }

    @Test
    @DisplayName("当下次保养日期为空时提醒应未到期")
    void shouldReturnFalseWhenNextDateIsNull() {
        plan.setNextMaintenanceDate(null);
        
        assertThat(plan.isReminderDue()).isFalse();
    }

    @Test
    @DisplayName("应正确判断保养是否逾期")
    void shouldCheckIfOverdue() {
        plan.setNextMaintenanceDate(LocalDate.now().minusDays(1));
        
        assertThat(plan.isOverdue()).isTrue();
    }

    @Test
    @DisplayName("应正确判断保养未逾期")
    void shouldCheckIfNotOverdue() {
        plan.setNextMaintenanceDate(LocalDate.now().plusDays(1));
        
        assertThat(plan.isOverdue()).isFalse();
    }

    @Test
    @DisplayName("当下次保养日期为空时不应逾期")
    void shouldNotBeOverdueWhenNextDateIsNull() {
        plan.setNextMaintenanceDate(null);
        
        assertThat(plan.isOverdue()).isFalse();
    }

    @Test
    @DisplayName("应正确更新保养后状态")
    void shouldUpdateAfterMaintenance() {
        LocalDate maintenanceDate = LocalDate.now();
        Long recordId = 100L;
        
        plan.updateAfterMaintenance(maintenanceDate, recordId);
        
        assertThat(plan.getLastMaintenanceDate()).isEqualTo(maintenanceDate);
        assertThat(plan.getLastMaintenanceRecordId()).isEqualTo(recordId);
        assertThat(plan.getNextMaintenanceDate()).isEqualTo(maintenanceDate.plusDays(30));
        assertThat(plan.getTotalMaintenanceCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("多次保养应正确累计次数")
    void shouldAccumulateMaintenanceCount() {
        plan.setTotalMaintenanceCount(2);
        
        plan.updateAfterMaintenance(LocalDate.now(), 100L);
        
        assertThat(plan.getTotalMaintenanceCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("应正确计算下次保养日期")
    void shouldCalculateNextDate() {
        plan.setLastMaintenanceDate(LocalDate.now());
        plan.setCycleDays(30);
        
        plan.calculateNextDate();
        
        assertThat(plan.getNextMaintenanceDate()).isEqualTo(LocalDate.now().plusDays(30));
    }

    @Test
    @DisplayName("当周期为空或零时不应计算下次日期")
    void shouldNotCalculateNextDateWhenCycleIsInvalid() {
        plan.setLastMaintenanceDate(LocalDate.now());
        plan.setCycleDays(null);
        
        plan.calculateNextDate();
        
        assertThat(plan.getNextMaintenanceDate()).isNull();
        
        plan.setCycleDays(0);
        plan.calculateNextDate();
        
        assertThat(plan.getNextMaintenanceDate()).isNull();
    }

    @Test
    @DisplayName("默认值应正确设置")
    void shouldHaveCorrectDefaultValues() {
        MaintenancePlan newPlan = new MaintenancePlan();
        
        assertThat(newPlan.getReminderDays()).isEqualTo(7);
        assertThat(newPlan.getStatus()).isEqualTo(1);
        assertThat(newPlan.getTotalMaintenanceCount()).isEqualTo(0);
        assertThat(newPlan.getAutoCreateRecord()).isTrue();
    }
}
