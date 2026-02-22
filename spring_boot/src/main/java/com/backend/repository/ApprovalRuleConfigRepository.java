package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.ApprovalRuleConfig;

/**
 * 审批规则配置数据访问接口
 */
@Repository
public interface ApprovalRuleConfigRepository
        extends JpaRepository<ApprovalRuleConfig, Long>, JpaSpecificationExecutor<ApprovalRuleConfig> {

    /**
     * 查询所有启用的规则
     */
    List<ApprovalRuleConfig> findByEnabledTrueOrderByPriorityAsc();

    /**
     * 根据状态变更查询规则
     */
    @Query("SELECT r FROM ApprovalRuleConfig r WHERE " +
            "r.enabled = true AND " +
            "(:fromStatus IS NULL OR r.fromStatus IS NULL OR r.fromStatus = :fromStatus) AND " +
            "r.toStatus = :toStatus " +
            "ORDER BY r.priority ASC")
    List<ApprovalRuleConfig> findApplicableRules(
            @Param("fromStatus") String fromStatus,
            @Param("toStatus") String toStatus);

    /**
     * 查询指定状态变更的最高优先级规则
     */
    @Query("SELECT r FROM ApprovalRuleConfig r WHERE " +
            "r.enabled = true AND " +
            "(:fromStatus IS NULL OR r.fromStatus IS NULL OR r.fromStatus = :fromStatus) AND " +
            "r.toStatus = :toStatus " +
            "ORDER BY r.priority ASC LIMIT 1")
    Optional<ApprovalRuleConfig> findTopPriorityRule(
            @Param("fromStatus") String fromStatus,
            @Param("toStatus") String toStatus);

    /**
     * 根据规则名称查询
     */
    Optional<ApprovalRuleConfig> findByRuleName(String ruleName);

    /**
     * 查询需要审批的规则
     */
    List<ApprovalRuleConfig> findByRequiresApprovalTrueAndEnabledTrue();

    /**
     * 查询支持快速审批的规则
     */
    List<ApprovalRuleConfig> findByAllowFastTrackTrueAndEnabledTrue();
}
