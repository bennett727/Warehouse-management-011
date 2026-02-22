package com.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_adjustment", indexes = {
        @Index(name = "idx_adjustment_no", columnList = "adjustment_no"),
        @Index(name = "idx_device_id", columnList = "device_id"),
        @Index(name = "idx_applicant_id", columnList = "applicant_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_create_time", columnList = "create_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class InventoryAdjustment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "adjustment_no", nullable = false, unique = true, length = 50)
    private String adjustmentNo;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "device_code", nullable = false, length = 50)
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @Column(name = "before_quantity", nullable = false)
    private Integer beforeQuantity;

    @Column(name = "after_quantity", nullable = false)
    private Integer afterQuantity;

    @Column(name = "adjustment_quantity", nullable = false)
    private Integer adjustmentQuantity;

    @Column(name = "adjustment_type", nullable = false)
    private Integer adjustmentType;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "applicant_name", nullable = false, length = 50)
    private String applicantName;

    @Column(name = "status", nullable = false)
    private Integer status;

    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "approver_name", length = 50)
    private String approverName;

    @Column(name = "approval_time")
    private LocalDateTime approvalTime;

    @Column(name = "approval_comment", length = 500)
    private String approvalComment;
}