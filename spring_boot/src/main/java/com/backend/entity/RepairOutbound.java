package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 修复出库实体类
 * 用于管理设备修复出库流程
 */
@Getter
@Setter
@Entity
@Table(name = "repair_outbound")
public class RepairOutbound extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 修复出库单号
     */
    @Column(name = "repair_no", unique = true, length = 50)
    private String repairNo;

    /**
     * 关联设备
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    /**
     * 关联库存订单
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_order_id")
    @JsonIgnore
    private StockOrder stockOrder;

    @Column(name = "stock_order_id", insertable = false, updatable = false)
    private Long stockOrderId;

    /**
     * 故障描述
     */
    @Column(name = "fault_description", columnDefinition = "TEXT")
    private String faultDescription;

    /**
     * 故障图片（JSON格式存储）
     */
    @Column(name = "fault_images", columnDefinition = "TEXT")
    private String faultImages;

    /**
     * 修复人员
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_person_id")
    @JsonIgnore
    private User repairPerson;

    @Column(name = "repair_person_id", insertable = false, updatable = false)
    private Long repairPersonId;

    /**
     * 出库人员
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    @JsonIgnore
    private User operator;

    @Column(name = "operator_id", insertable = false, updatable = false)
    private Long operatorId;

    /**
     * 预计修复天数
     */
    @Column(name = "estimated_days")
    private Integer estimatedDays;

    /**
     * 修复地点（INTERNAL-内部，EXTERNAL-外部）
     */
    @Column(name = "repair_location", length = 20)
    private String repairLocation;

    /**
     * 外部维修单位
     */
    @Column(name = "repair_vendor", length = 200)
    private String repairVendor;

    /**
     * 修复状态
     * 0-待出库，1-已出库，2-修复中，3-修复完成，4-已入库，-1-已取消
     */
    @Column(name = "status")
    private Integer status = 0;

    /**
     * 出库时间
     */
    @Column(name = "outbound_time")
    private LocalDateTime outboundTime;

    /**
     * 预计完成时间
     */
    @Column(name = "estimated_complete_time")
    private LocalDateTime estimatedCompleteTime;

    /**
     * 实际完成时间
     */
    @Column(name = "actual_complete_time")
    private LocalDateTime actualCompleteTime;

    /**
     * 修复结果
     */
    @Column(name = "repair_result", columnDefinition = "TEXT")
    private String repairResult;

    /**
     * 实际修复费用
     */
    @Column(name = "actual_cost", precision = 15, scale = 2)
    private BigDecimal actualCost;

    /**
     * 修复后图片（JSON格式存储）
     */
    @Column(name = "repair_images", columnDefinition = "TEXT")
    private String repairImages;

    /**
     * 备注
     */
    @Column(name = "remark", length = 500)
    private String remark;

    /**
     * 关联维修记录
     * 建立RepairOutbound和RepairRecord的一对一关系
     */
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "repair_record_id")
    @JsonIgnore
    private RepairRecord repairRecord;

    @Column(name = "repair_record_id", insertable = false, updatable = false)
    private Long repairRecordId;

    /**
     * 创建人
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    @JsonIgnore
    private User creator;

    @Column(name = "creator_id", insertable = false, updatable = false)
    private Long creatorId;

    /**
     * 更新人
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updater_id")
    @JsonIgnore
    private User updater;

    @Column(name = "updater_id", insertable = false, updatable = false)
    private Long updaterId;
}
