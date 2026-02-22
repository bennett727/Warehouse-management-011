package com.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.ApprovalRecord;
import com.backend.entity.ApprovalRuleConfig;
import com.backend.entity.StockOrder;
import com.backend.entity.User;
import com.backend.repository.ApprovalRecordRepository;
import com.backend.repository.ApprovalRuleConfigRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MultiLevelApprovalService {

    private final ApprovalRecordRepository approvalRecordRepository;
    private final ApprovalRuleConfigRepository approvalRuleConfigRepository;
    private final StockOrderRepository stockOrderRepository;
    private final UserRepository userRepository;

    public static final String BUSINESS_TYPE_OUTBOUND = "OUTBOUND";
    public static final String BUSINESS_TYPE_INBOUND = "INBOUND";
    public static final String BUSINESS_TYPE_TRANSFER = "TRANSFER";

    public static final int APPROVAL_STATUS_PENDING = 0;
    public static final int APPROVAL_STATUS_APPROVED = 1;
    public static final int APPROVAL_STATUS_REJECTED = 2;
    public static final int APPROVAL_STATUS_CANCELLED = 3;

    public static final int APPROVE_RESULT_PENDING = 0;
    public static final int APPROVE_RESULT_APPROVED = 1;
    public static final int APPROVE_RESULT_REJECTED = 2;

    @Transactional
    public ApprovalRecord createApprovalRequest(Long businessId, String businessType, Long applicantId, String remark) {
        Optional<ApprovalRecord> existing = approvalRecordRepository
                .findByBusinessIdAndBusinessType(businessId, businessType);
        if (existing.isPresent()) {
            log.warn("审批记录已存在：businessId={}, businessType={}", businessId, businessType);
            return existing.get();
        }

        ApprovalRuleConfig rule = findApplicableRule(businessType);
        int totalLevels = rule != null ? rule.getApprovalLevel() : 1;

        User applicant = userRepository.findById(applicantId).orElse(null);
        StockOrder order = stockOrderRepository.findById(businessId).orElse(null);

        ApprovalRecord record = new ApprovalRecord();
        record.setBusinessId(businessId);
        record.setBusinessType(businessType);
        record.setBusinessNo(order != null ? order.getOrderNo() : null);
        record.setApprovalStatus(APPROVAL_STATUS_PENDING);
        record.setCurrentLevel(1);
        record.setTotalLevels(totalLevels);
        record.setApplicantId(applicantId);
        record.setApplicantName(applicant != null ? applicant.getRealName() : null);
        record.setApplyTime(LocalDateTime.now());
        record.setApplyRemark(remark);
        record.setRuleId(rule != null ? rule.getId() : null);
        record.setTimeoutHours(rule != null ? rule.getTimeoutHours() : 24);

        if (rule != null) {
            assignApprovers(record, rule);
        }

        ApprovalRecord saved = approvalRecordRepository.save(record);
        log.info("创建审批请求成功：businessId={}, businessType={}, totalLevels={}", 
                businessId, businessType, totalLevels);
        return saved;
    }

    private void assignApprovers(ApprovalRecord record, ApprovalRuleConfig rule) {
        if (rule.getLevel1ApproverRole() != null) {
            User approver = findUserByRole(rule.getLevel1ApproverRole());
            if (approver != null) {
                record.setLevel1ApproverId(approver.getId());
                record.setLevel1ApproverName(approver.getRealName());
            }
        }
        if (rule.getLevel2ApproverRole() != null && rule.getApprovalLevel() >= 2) {
            User approver = findUserByRole(rule.getLevel2ApproverRole());
            if (approver != null) {
                record.setLevel2ApproverId(approver.getId());
                record.setLevel2ApproverName(approver.getRealName());
            }
        }
        if (rule.getLevel3ApproverRole() != null && rule.getApprovalLevel() >= 3) {
            User approver = findUserByRole(rule.getLevel3ApproverRole());
            if (approver != null) {
                record.setLevel3ApproverId(approver.getId());
                record.setLevel3ApproverName(approver.getRealName());
            }
        }
    }

    private User findUserByRole(String role) {
        List<User> users = userRepository.findByRole(role);
        return users.isEmpty() ? null : users.get(0);
    }

    private ApprovalRuleConfig findApplicableRule(String businessType) {
        List<ApprovalRuleConfig> rules = approvalRuleConfigRepository.findByEnabledTrueOrderByPriorityAsc();
        for (ApprovalRuleConfig rule : rules) {
            if (matchesBusinessType(rule, businessType)) {
                return rule;
            }
        }
        return null;
    }

    private boolean matchesBusinessType(ApprovalRuleConfig rule, String businessType) {
        String toStatus = rule.getToStatus();
        if (toStatus == null) {
            return false;
        }
        return toStatus.equalsIgnoreCase(businessType) || 
               toStatus.equalsIgnoreCase(businessType + "_APPROVAL");
    }

    @Transactional
    public ApprovalRecord approve(Long recordId, Long approverId, Integer level, String remark) {
        ApprovalRecord record = approvalRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("审批记录不存在"));

        if (!record.canApprove(level, approverId)) {
            throw new IllegalStateException("当前用户无权审批或审批级别不正确");
        }

        setApprovalResult(record, level, APPROVE_RESULT_APPROVED, approverId, remark);

        if (level < record.getTotalLevels()) {
            record.setCurrentLevel(level + 1);
            log.info("审批通过，进入下一级：recordId={}, nextLevel={}", recordId, level + 1);
        } else {
            record.setApprovalStatus(APPROVAL_STATUS_APPROVED);
            record.setFinalApproveTime(LocalDateTime.now());
            record.setFinalResult(APPROVE_RESULT_APPROVED);
            log.info("审批全部通过：recordId={}", recordId);
        }

        return approvalRecordRepository.save(record);
    }

    @Transactional
    public ApprovalRecord reject(Long recordId, Long approverId, Integer level, String remark) {
        ApprovalRecord record = approvalRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("审批记录不存在"));

        if (!record.isPending()) {
            throw new IllegalStateException("该审批已处理");
        }

        setApprovalResult(record, level, APPROVE_RESULT_REJECTED, approverId, remark);
        record.setApprovalStatus(APPROVAL_STATUS_REJECTED);
        record.setFinalApproveTime(LocalDateTime.now());
        record.setFinalResult(APPROVE_RESULT_REJECTED);

        log.info("审批驳回：recordId={}, level={}, approverId={}", recordId, level, approverId);
        return approvalRecordRepository.save(record);
    }

    private void setApprovalResult(ApprovalRecord record, Integer level, Integer result, Long approverId, String remark) {
        User approver = userRepository.findById(approverId).orElse(null);
        String approverName = approver != null ? approver.getRealName() : null;
        LocalDateTime now = LocalDateTime.now();

        switch (level) {
            case 1:
                record.setLevel1ApproverId(approverId);
                record.setLevel1ApproverName(approverName);
                record.setLevel1ApproveTime(now);
                record.setLevel1ApproveResult(result);
                record.setLevel1ApproveRemark(remark);
                break;
            case 2:
                record.setLevel2ApproverId(approverId);
                record.setLevel2ApproverName(approverName);
                record.setLevel2ApproveTime(now);
                record.setLevel2ApproveResult(result);
                record.setLevel2ApproveRemark(remark);
                break;
            case 3:
                record.setLevel3ApproverId(approverId);
                record.setLevel3ApproverName(approverName);
                record.setLevel3ApproveTime(now);
                record.setLevel3ApproveResult(result);
                record.setLevel3ApproveRemark(remark);
                break;
        }
    }

    @Transactional
    public void cancelApproval(Long businessId, String businessType) {
        Optional<ApprovalRecord> recordOpt = approvalRecordRepository
                .findByBusinessIdAndBusinessType(businessId, businessType);
        
        if (recordOpt.isPresent()) {
            ApprovalRecord record = recordOpt.get();
            if (record.isPending()) {
                record.setApprovalStatus(APPROVAL_STATUS_CANCELLED);
                approvalRecordRepository.save(record);
                log.info("取消审批：businessId={}, businessType={}", businessId, businessType);
            }
        }
    }

    public Optional<ApprovalRecord> getApprovalRecord(Long businessId, String businessType) {
        return approvalRecordRepository.findByBusinessIdAndBusinessType(businessId, businessType);
    }

    public Optional<ApprovalRecord> getApprovalRecord(Long id) {
        return approvalRecordRepository.findById(id);
    }

    public List<ApprovalRecord> getPendingApprovals(Integer level) {
        return approvalRecordRepository.findPendingByLevel(level);
    }

    public List<ApprovalRecord> getPendingApprovalsForUser(Integer level, Long userId) {
        return approvalRecordRepository.findPendingForUser(level, userId);
    }

    public Page<ApprovalRecord> getApprovalRecords(String businessType, Integer status, Pageable pageable) {
        if (status != null) {
            return approvalRecordRepository.findByBusinessTypeAndStatus(businessType, status, pageable);
        }
        return approvalRecordRepository.findAll(pageable);
    }

    public long countPendingApprovals() {
        return approvalRecordRepository.countPendingApprovals();
    }

    public boolean isFullyApproved(Long businessId, String businessType) {
        Optional<ApprovalRecord> record = getApprovalRecord(businessId, businessType);
        return record.isPresent() && record.get().isApproved();
    }

    public boolean canExecute(Long businessId, String businessType) {
        Optional<ApprovalRecord> record = getApprovalRecord(businessId, businessType);
        return record.map(ApprovalRecord::isApproved).orElse(false);
    }
}
