package com.backend.entity;

import java.math.BigDecimal;
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

/**
 * 报废记录实体
 *
 * 设计说明：
 * 1. 本实体是报废业务的唯一数据源，存储所有报废相关信息
 * 2. 通过sourceOrderId和sourceOrderItemId关联出库单
 * 3. 避免与StockOrderItem的字段重复
 *
 * @author 开发团队
 * @since 2026-02-13
 */
@Getter
@Setter
@Entity
@Table(name = "scrap_record", indexes = {
        @Index(name = "idx_scrap_device", columnList = "device_id"),
        @Index(name = "idx_scrap_order", columnList = "source_order_id"),
        @Index(name = "idx_scrap_order_item", columnList = "source_order_item_id"),
        @Index(name = "idx_scrap_status", columnList = "status"),
        @Index(name = "idx_scrap_date", columnList = "scrap_date")
})
public class ScrapRecord extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    /**
     * 报废单号
     */
    @Column(name = "scrap_no", unique = true, length = 50)
    private String scrapNo;

    /**
     * 报废日期
     */
    @Column(name = "scrap_date")
    private LocalDate scrapDate;

    /**
     * 报废原因
     * 1: 设备老化, 2: 技术淘汰, 3: 损坏无法修复, 4: 性能不达标, 5: 其他
     */
    @Column(name = "scrap_reason", length = 50)
    private String scrapReason;

    /**
     * 报废原因详细说明
     */
    @Column(name = "scrap_reason_detail", columnDefinition = "TEXT")
    private String scrapReasonDetail;

    /**
     * 残值
     */
    @Column(name = "residual_value", precision = 15, scale = 2)
    private BigDecimal residualValue;

    /**
     * 原值
     */
    @Column(name = "original_value", precision = 15, scale = 2)
    private BigDecimal originalValue;

    /**
     * 评估人员
     */
    @Column(name = "evaluator", length = 50)
    private String evaluator;

    /**
     * 评估日期
     */
    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;

    /**
     * 处理方式
     * 1: 回收, 2: 销毁, 3: 捐赠, 4: 其他
     */
    @Column(name = "disposal_method", length = 50)
    private String disposalMethod;

    /**
     * 处理日期
     */
    @Column(name = "disposal_date")
    private LocalDate disposalDate;

    /**
     * 处理人员
     */
    @Column(name = "disposal_person", length = 50)
    private String disposalPerson;

    /**
     * 环保处理证明编号
     */
    @Column(name = "environmental_cert_no", length = 100)
    private String environmentalCertNo;

    /**
     * 报废状态
     * 0: 待审批, 1: 审批通过, 2: 已报废, 3: 已处理, 4: 已取消
     */
    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "remark", length = 500)
    private String remark;

    // ==================== 出库关联字段 ====================
    // 用于出库-报废联动机制，建立与出库单的关系

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
    // 用于记录报废时的设备信息（防止设备信息变更后历史记录不准确）

    @Column(name = "device_code", length = 50)
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @Column(name = "device_model", length = 100)
    private String deviceModel;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    /**
     * 设备购买日期
     */
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    /**
     * 设备使用年限
     */
    @Column(name = "service_years")
    private Integer serviceYears;

    // ==================== 审批字段 ====================

    /**
     * 审批人
     */
    @Column(name = "approver", length = 50)
    private String approver;

    /**
     * 审批日期
     */
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    /**
     * 审批意见
     */
    @Column(name = "approval_comment", length = 500)
    private String approvalComment;

    // ==================== 便捷方法 ====================

    /**
     * 计算折旧金额
     */
    public BigDecimal getDepreciationAmount() {
        if (originalValue == null || residualValue == null) {
            return BigDecimal.ZERO;
        }
        return originalValue.subtract(residualValue);
    }

    /**
     * 是否已完成报废
     */
    public boolean isCompleted() {
        return Integer.valueOf(2).equals(status) || Integer.valueOf(3).equals(status);
    }

    /**
     * 是否已处理
     */
    public boolean isDisposed() {
        return Integer.valueOf(3).equals(status);
    }

    /**
     * 计算使用年限
     */
    public Integer calculateServiceYears() {
        if (purchaseDate == null || scrapDate == null) {
            return null;
        }
        return scrapDate.getYear() - purchaseDate.getYear();
    }
}
