package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 保养记录实体
 *
 * 设计说明：
 * 1. 本实体是保养业务的唯一数据源，存储所有保养相关信息
 * 2. 通过sourceOrderId和sourceOrderItemId关联出库单
 * 3. 避免与StockOrderItem的字段重复
 *
 * @author 开发团队
 * @since 2026-02-13
 */
@Getter
@Setter
@Entity
@Table(name = "maintenance_record", indexes = {
        @Index(name = "idx_maint_device", columnList = "device_id"),
        @Index(name = "idx_maint_order", columnList = "source_order_id"),
        @Index(name = "idx_maint_order_item", columnList = "source_order_item_id"),
        @Index(name = "idx_maint_status", columnList = "status")
})
public class MaintenanceRecord extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    /**
     * 保养单号
     */
    @Column(name = "maintenance_no", unique = true, length = 50)
    private String maintenanceNo;

    /**
     * 保养类型
     * 1: 日常保养, 2: 定期保养, 3: 大修, 4: 预防性维护
     */
    @Column(name = "maintenance_type")
    private Integer maintenanceType;

    /**
     * 保养内容
     */
    @Column(name = "maintenance_content", columnDefinition = "TEXT")
    private String maintenanceContent;

    /**
     * 计划开始时间
     */
    @Column(name = "planned_start_time")
    private LocalDateTime plannedStartTime;

    /**
     * 计划结束时间
     */
    @Column(name = "planned_end_time")
    private LocalDateTime plannedEndTime;

    /**
     * 实际开始时间
     */
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    /**
     * 实际结束时间
     */
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    /**
     * 保养人员姓名
     */
    @Column(name = "maintenance_person", length = 50)
    private String maintenancePerson;

    /**
     * 预计费用
     */
    @Column(name = "estimated_cost", precision = 15, scale = 2)
    private BigDecimal estimatedCost;

    /**
     * 实际费用
     */
    @Column(name = "actual_cost", precision = 15, scale = 2)
    private BigDecimal actualCost;

    /**
     * 保养结果
     */
    @Column(name = "maintenance_result", length = 255)
    private String maintenanceResult;

    /**
     * 保养周期（天）
     */
    @Column(name = "maintenance_cycle")
    private Integer maintenanceCycle;

    /**
     * 下次保养时间
     */
    @Column(name = "next_maintenance_time")
    private LocalDateTime nextMaintenanceTime;

    /**
     * 保养日期
     */
    @Column(name = "maintenance_date")
    private LocalDate maintenanceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintainer_id")
    @JsonIgnore
    private User maintainer;

    @Column(name = "maintainer_id", insertable = false, updatable = false)
    private Long maintainerId;

    /**
     * 下次保养日期
     */
    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    /**
     * 处理状态
     */
    @Column(name = "process_status")
    private Integer processStatus;

    /**
     * 保养状态
     * 0: 待保养, 1: 保养中, 2: 保养完成, 3: 保养取消
     */
    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "remark", length = 500)
    private String remark;

    // ==================== 出库关联字段 ====================
    // 用于出库-保养联动机制，建立与出库单的关系

    /**
     * 关联出库单ID
     */
    @Column(name = "source_order_id")
    private Long sourceOrderId;

    /**
     * 关联出库单项ID
     */
    @Column(name = "source_order_item_id")
    private Long sourceOrderItemId;

    /**
     * 关联出库单号（冗余，便于查询）
     */
    @Column(name = "source_order_no", length = 50)
    private String sourceOrderNo;

    // ==================== 设备信息冗余字段 ====================
    // 用于记录保养时的设备信息（防止设备信息变更后历史记录不准确）

    @Column(name = "device_code", length = 50)
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    // ==================== 便捷方法 ====================

    /**
     * 计算保养时长（小时）
     */
    public Double getMaintenanceDurationHours() {
        if (actualStartTime == null || actualEndTime == null) {
            return null;
        }
        return java.time.Duration.between(actualStartTime, actualEndTime).toMinutes() / 60.0;
    }

    /**
     * 是否已完成保养
     */
    public boolean isCompleted() {
        return Integer.valueOf(2).equals(status);
    }

    /**
     * 计算下次保养日期
     */
    public void calculateNextMaintenanceDate() {
        if (this.maintenanceDate != null && this.maintenanceCycle != null) {
            this.nextMaintenanceDate = this.maintenanceDate.plusDays(this.maintenanceCycle);
            this.nextMaintenanceTime = this.nextMaintenanceDate.atStartOfDay();
        }
    }
}
