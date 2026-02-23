package com.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "device_status_approval", indexes = {
    @Index(name = "idx_device_id", columnList = "device_id"),
    @Index(name = "idx_applicant_id", columnList = "applicant_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_create_time", columnList = "create_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class DeviceStatusApproval extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "device_code", nullable = false, length = 50)
    private String deviceCode;

    @Column(name = "from_status", nullable = false)
    private Integer fromStatus;

    @Column(name = "to_status", nullable = false)
    private Integer toStatus;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "applicant_name", nullable = false, length = 50)
    private String applicantName;

    @Column(name = "reason", length = 500)
    private String reason;

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