package com.backend.service.approval;

import com.backend.entity.ApprovalRuleConfig;
import com.backend.dto.PageResult;

import java.util.List;
import java.util.Map;

/**
 * 审批规则配置服务接口
 */
public interface ApprovalRuleConfigService {

    /**
     * 创建审批规则
     */
    ApprovalRuleConfig createRule(ApprovalRuleConfig rule, Long creatorId);

    /**
     * 更新审批规则
     */
    ApprovalRuleConfig updateRule(Long id, ApprovalRuleConfig rule, Long updaterId);

    /**
     * 删除审批规则
     */
    void deleteRule(Long id);

    /**
     * 获取审批规则详情
     */
    ApprovalRuleConfig getRuleById(Long id);

    /**
     * 获取所有启用的规则
     */
    List<ApprovalRuleConfig> getAllEnabledRules();

    /**
     * 分页查询规则
     */
    PageResult<ApprovalRuleConfig> getRulesByPage(int page, int size, String ruleName, Boolean enabled);

    /**
     * 查询适用的审批规则
     */
    List<ApprovalRuleConfig> getApplicableRules(String fromStatus, String toStatus);

    /**
     * 获取最高优先级的适用规则
     */
    ApprovalRuleConfig getTopPriorityRule(String fromStatus, String toStatus);

    /**
     * 检查状态变更是否需要审批
     */
    boolean requiresApproval(String fromStatus, String toStatus);

    /**
     * 获取审批级别
     */
    int getApprovalLevel(String fromStatus, String toStatus);

    /**
     * 获取指定级别的审批角色
     */
    String getApproverRole(String fromStatus, String toStatus, int level);

    /**
     * 检查是否支持快速审批
     */
    boolean supportsFastTrack(String fromStatus, String toStatus);

    /**
     * 启用/禁用规则
     */
    ApprovalRuleConfig toggleRule(Long id, boolean enabled, Long updaterId);

    /**
     * 批量更新规则优先级
     */
    void updatePriorities(Map<Long, Integer> priorities, Long updaterId);

    /**
     * 初始化默认规则
     */
    void initializeDefaultRules(Long creatorId);
}
