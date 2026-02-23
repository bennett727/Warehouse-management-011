package com.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "device_status_transition_rule", indexes = {
    @Index(name = "idx_from_to_status", columnList = "from_status, to_status"),
    @Index(name = "idx_device_type_id", columnList = "device_type_id"),
    @Index(name = "idx_enabled", columnList = "enabled")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class DeviceStatusTransitionRule extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;

    @Column(name = "from_status", nullable = false)
    private Integer fromStatus;

    @Column(name = "to_status", nullable = false)
    private Integer toStatus;

    @Column(name = "device_type_id")
    private Long deviceTypeId;

    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval;

    @Column(name = "approval_role")
    private String approvalRole;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "priority")
    private Integer priority;
}