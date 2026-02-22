package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * 维修记录实体
 *
 * 设计说明：
 * 1. 本实体是维修业务的唯一数据源，存储所有维修相关信息
 * 2. 通过sourceOrderId和sourceOrderItemId关联出库单
 * 3. 避免与StockOrderItem的字段重复
 *
 * @author 开发团队
 * @since 2026-02-13
 */
@Getter
@Setter
@Entity
@Table(name = "repair_record", indexes = {
        @Index(name = "idx_repair_device", columnList = "device_id"),
        @Index(name = "idx_repair_order", columnList = "source_order_id"),
        @Index(name = "idx_repair_order_item", columnList = "source_order_item_id"),
        @Index(name = "idx_repair_status", columnList = "status")
})
public class RepairRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    /**
     * 维修单号
     */
    @Column(name = "repair_no", unique = true, length = 50)
    private String repairNo;

    /**
     * 故障描述
     */
    @Column(name = "fault_description", columnDefinition = "TEXT")
    private String faultDescription;

    /**
     * 故障类型
     */
    @Column(name = "fault_type", length = 50)
    private String faultType;

    /**
     * 故障等级
     */
    @Column(name = "fault_level", length = 50)
    private String faultLevel;

    /**
     * 维修内容
     */
    @Column(name = "repair_content", columnDefinition = "TEXT")
    private String repairContent;

    /**
     * 维修措施
     */
    @Column(name = "repair_measures", columnDefinition = "TEXT")
    private String repairMeasures;

    /**
     * 维修人员姓名
     */
    @Column(name = "repair_person", length = 50)
    private String repairPerson;

    /**
     * 维修结果
     */
    @Column(name = "repair_result", length = 255)
    private String repairResult;

    /**
     * 维修费用
     */
    @Column(name = "repair_cost", precision = 15, scale = 2)
    private BigDecimal repairCost;

    /**
     * 维修日期
     */
    @Column(name = "repair_date")
    private LocalDate repairDate;

    /**
     * 维修开始时间
     */
    @Column(name = "repair_start_time")
    private LocalDateTime repairStartTime;

    /**
     * 维修结束时间
     */
    @Column(name = "repair_end_time")
    private LocalDateTime repairEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repairer_id")
    @JsonIgnore
    private User repairer;

    @Column(name = "repairer_id", insertable = false, updatable = false)
    private Long repairerId;

    /**
     * 维修状态
     * 0: 待维修, 1: 维修中, 2: 维修完成, 3: 维修失败, 4: 无法修复
     */
    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "remark", length = 500)
    private String remark;

    // ==================== 出库关联字段 ====================
    // 用于出库-维修联动机制，建立与出库单的关系

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
    // 用于记录维修时的设备信息（防止设备信息变更后历史记录不准确）

    @Column(name = "device_code", length = 50)
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    // ==================== 维修地点字段 ====================

    /**
     * 维修地点
     */
    @Column(name = "repair_location", length = 500)
    private String repairLocation;

    /**
     * 预计完成日期
     */
    @Column(name = "estimated_complete_date")
    private LocalDate estimatedCompleteDate;

    // ==================== 便捷方法 ====================

    /**
     * 计算维修时长（小时）
     */
    public Double getRepairDurationHours() {
        if (repairStartTime == null || repairEndTime == null) {
            return null;
        }
        return java.time.Duration.between(repairStartTime, repairEndTime).toMinutes() / 60.0;
    }

    /**
     * 是否已完成维修
     */
    public boolean isCompleted() {
        return Integer.valueOf(2).equals(status);
    }

    /**
     * 是否无法修复
     */
    public boolean isUnrepairable() {
        return Integer.valueOf(4).equals(status);
    }
}
