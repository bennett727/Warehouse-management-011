package com.backend.entity;

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
@Table(name = "approval_record", indexes = {
        @Index(name = "idx_business_id", columnList = "business_id"),
        @Index(name = "idx_business_type", columnList = "business_type"),
        @Index(name = "idx_approval_status", columnList = "approval_status"),
        @Index(name = "idx_current_level", columnList = "current_level")
})
public class ApprovalRecord extends BaseEntity {

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "business_type", nullable = false, length = 50)
    private String businessType;

    @Column(name = "business_no", length = 50)
    private String businessNo;

    @Column(name = "approval_status", nullable = false)
    private Integer approvalStatus = 0;

    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    @Column(name = "total_levels", nullable = false)
    private Integer totalLevels = 1;

    @Column(name = "applicant_id")
    private Long applicantId;

    @Column(name = "applicant_name", length = 100)
    private String applicantName;

    @Column(name = "apply_time")
    private LocalDateTime applyTime;

    @Column(name = "apply_remark", length = 500)
    private String applyRemark;

    @Column(name = "level1_approver_id")
    private Long level1ApproverId;

    @Column(name = "level1_approver_name", length = 100)
    private String level1ApproverName;

    @Column(name = "level1_approve_time")
    private LocalDateTime level1ApproveTime;

    @Column(name = "level1_approve_result")
    private Integer level1ApproveResult;

    @Column(name = "level1_approve_remark", length = 500)
    private String level1ApproveRemark;

    @Column(name = "level2_approver_id")
    private Long level2ApproverId;

    @Column(name = "level2_approver_name", length = 100)
    private String level2ApproverName;

    @Column(name = "level2_approve_time")
    private LocalDateTime level2ApproveTime;

    @Column(name = "level2_approve_result")
    private Integer level2ApproveResult;

    @Column(name = "level2_approve_remark", length = 500)
    private String level2ApproveRemark;

    @Column(name = "level3_approver_id")
    private Long level3ApproverId;

    @Column(name = "level3_approver_name", length = 100)
    private String level3ApproverName;

    @Column(name = "level3_approve_time")
    private LocalDateTime level3ApproveTime;

    @Column(name = "level3_approve_result")
    private Integer level3ApproveResult;

    @Column(name = "level3_approve_remark", length = 500)
    private String level3ApproveRemark;

    @Column(name = "final_approve_time")
    private LocalDateTime finalApproveTime;

    @Column(name = "final_result")
    private Integer finalResult;

    @Column(name = "urgency_level", length = 20)
    private String urgencyLevel = "normal";

    @Column(name = "timeout_hours")
    private Integer timeoutHours = 24;

    @Column(name = "rule_id")
    private Long ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", insertable = false, updatable = false)
    @JsonIgnore
    private User applicant;

    public boolean isPending() {
        return approvalStatus == 0;
    }

    public boolean isApproved() {
        return approvalStatus == 1;
    }

    public boolean isRejected() {
        return approvalStatus == 2;
    }

    public boolean isCancelled() {
        return approvalStatus == 3;
    }

    public boolean needsLevelApproval(int level) {
        return currentLevel == level && isPending();
    }

    public boolean canApprove(int level, Long userId) {
        if (!isPending()) {
            return false;
        }
        return currentLevel == level && getTotalLevels() >= level;
    }
}
