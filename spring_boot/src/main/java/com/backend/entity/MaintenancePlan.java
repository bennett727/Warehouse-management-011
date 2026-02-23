package com.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "maintenance_plan",
       indexes = {
           @Index(name = "idx_plan_device", columnList = "device_id"),
           @Index(name = "idx_plan_next_date", columnList = "next_maintenance_date"),
           @Index(name = "idx_plan_status", columnList = "status")
       })
public class MaintenancePlan extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    @Column(name = "plan_no", unique = true, length = 50)
    private String planNo;

    @Column(name = "plan_name", length = 100)
    private String planName;

    @Column(name = "maintenance_type")
    private Integer maintenanceType;

    @Column(name = "cycle_days")
    private Integer cycleDays;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    @Column(name = "reminder_days")
    private Integer reminderDays = 7;

    @Column(name = "status")
    private Integer status = 1;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Column(name = "last_maintenance_record_id")
    private Long lastMaintenanceRecordId;

    @Column(name = "total_maintenance_count")
    private Integer totalMaintenanceCount = 0;

    @Column(name = "auto_create_record")
    private Boolean autoCreateRecord = true;

    @Column(name = "remark", length = 500)
    private String remark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    @JsonIgnore
    private User creator;

    @Column(name = "creator_id", insertable = false, updatable = false)
    private Long creatorId;

    @Column(name = "creator_name", length = 50)
    private String creatorName;

    public boolean isReminderDue() {
        if (nextMaintenanceDate == null || reminderDays == null) {
            return false;
        }
        LocalDate reminderDate = nextMaintenanceDate.minusDays(reminderDays);
        return !LocalDate.now().isBefore(reminderDate);
    }

    public boolean isOverdue() {
        if (nextMaintenanceDate == null) {
            return false;
        }
        return LocalDate.now().isAfter(nextMaintenanceDate);
    }

    public void updateAfterMaintenance(LocalDate maintenanceDate, Long recordId) {
        this.lastMaintenanceDate = maintenanceDate;
        this.lastMaintenanceRecordId = recordId;
        if (cycleDays != null && cycleDays > 0) {
            this.nextMaintenanceDate = maintenanceDate.plusDays(cycleDays);
        }
        this.totalMaintenanceCount = (this.totalMaintenanceCount == null ? 0 : this.totalMaintenanceCount) + 1;
    }

    public void calculateNextDate() {
        if (lastMaintenanceDate != null && cycleDays != null && cycleDays > 0) {
            this.nextMaintenanceDate = lastMaintenanceDate.plusDays(cycleDays);
        }
    }
}
