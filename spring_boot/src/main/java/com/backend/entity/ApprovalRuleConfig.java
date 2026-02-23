package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 审批规则配置实体
 * 用于定义设备状态变更的审批规则
 */
@Getter
@Setter
@Entity
@Table(name = "approval_rule_config")
public class ApprovalRuleConfig extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 规则名称
     */
    @Column(name = "rule_name", length = 100, nullable = false)
    private String ruleName;

    /**
     * 源状态（变更前的状态）
     */
    @Column(name = "from_status", length = 50)
    private String fromStatus;

    /**
     * 目标状态（变更后的状态）
     */
    @Column(name = "to_status", length = 50, nullable = false)
    private String toStatus;

    /**
     * 是否需要审批
     */
    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval = true;

    /**
     * 审批级别（1-一级审批，2-二级审批，3-三级审批）
     */
    @Column(name = "approval_level")
    private Integer approvalLevel = 1;

    /**
     * 一级审批角色
     */
    @Column(name = "level1_approver_role", length = 50)
    private String level1ApproverRole;

    /**
     * 二级审批角色
     */
    @Column(name = "level2_approver_role", length = 50)
    private String level2ApproverRole;

    /**
     * 三级审批角色
     */
    @Column(name = "level3_approver_role", length = 50)
    private String level3ApproverRole;

    /**
     * 是否支持快速审批
     */
    @Column(name = "allow_fast_track")
    private Boolean allowFastTrack = false;

    /**
     * 快速审批角色
     */
    @Column(name = "fast_track_role", length = 50)
    private String fastTrackRole;

    /**
     * 审批超时时间（小时）
     */
    @Column(name = "timeout_hours")
    private Integer timeoutHours = 24;

    /**
     * 超时自动处理方式（AUTO_APPROVE-自动通过，AUTO_REJECT-自动拒绝，NONE-不处理）
     */
    @Column(name = "timeout_action", length = 20)
    private String timeoutAction = "NONE";

    /**
     * 是否启用通知
     */
    @Column(name = "enable_notification")
    private Boolean enableNotification = true;

    /**
     * 通知方式（EMAIL, SMS, SYSTEM）
     */
    @Column(name = "notification_type", length = 100)
    private String notificationType = "SYSTEM";

    /**
     * 规则描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 是否启用
     */
    @Column(name = "enabled")
    private Boolean enabled = true;

    /**
     * 优先级（数字越小优先级越高）
     */
    @Column(name = "priority")
    private Integer priority = 100;

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
