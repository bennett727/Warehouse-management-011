package com.backend.service.approval.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.PageResult;
import com.backend.entity.ApprovalRuleConfig;
import com.backend.entity.User;
import com.backend.exception.BusinessException;
import com.backend.repository.ApprovalRuleConfigRepository;
import com.backend.repository.UserRepository;
import com.backend.service.approval.ApprovalRuleConfigService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 审批规则配置服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalRuleConfigServiceImpl implements ApprovalRuleConfigService {

    private final ApprovalRuleConfigRepository ruleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ApprovalRuleConfig createRule(ApprovalRuleConfig rule, Long creatorId) {
        log.info("创建审批规则: {}", rule.getRuleName());

        if (ruleRepository.findByRuleName(rule.getRuleName()).isPresent()) {
            throw new BusinessException("规则名称已存在: " + rule.getRuleName());
        }

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new BusinessException("创建人不存在"));

        rule.setCreator(creator);
        rule.setCreatorId(creatorId);
        rule.setCreateTime(LocalDateTime.now());
        rule.setUpdateTime(LocalDateTime.now());

        return ruleRepository.save(rule);
    }

    @Override
    @Transactional
    public ApprovalRuleConfig updateRule(Long id, ApprovalRuleConfig rule, Long updaterId) {
        log.info("更新审批规则: {}", id);

        ApprovalRuleConfig existing = ruleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("规则不存在: " + id));

        if (!existing.getRuleName().equals(rule.getRuleName())) {
            if (ruleRepository.findByRuleName(rule.getRuleName()).isPresent()) {
                throw new BusinessException("规则名称已存在: " + rule.getRuleName());
            }
        }

        User updater = userRepository.findById(updaterId)
                .orElseThrow(() -> new BusinessException("更新人不存在"));

        existing.setRuleName(rule.getRuleName());
        existing.setFromStatus(rule.getFromStatus());
        existing.setToStatus(rule.getToStatus());
        existing.setRequiresApproval(rule.getRequiresApproval());
        existing.setApprovalLevel(rule.getApprovalLevel());
        existing.setLevel1ApproverRole(rule.getLevel1ApproverRole());
        existing.setLevel2ApproverRole(rule.getLevel2ApproverRole());
        existing.setLevel3ApproverRole(rule.getLevel3ApproverRole());
        existing.setAllowFastTrack(rule.getAllowFastTrack());
        existing.setFastTrackRole(rule.getFastTrackRole());
        existing.setTimeoutHours(rule.getTimeoutHours());
        existing.setTimeoutAction(rule.getTimeoutAction());
        existing.setEnableNotification(rule.getEnableNotification());
        existing.setNotificationType(rule.getNotificationType());
        existing.setDescription(rule.getDescription());
        existing.setPriority(rule.getPriority());
        existing.setUpdater(updater);
        existing.setUpdaterId(updaterId);
        existing.setUpdateTime(LocalDateTime.now());

        return ruleRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteRule(Long id) {
        log.info("删除审批规则: {}", id);
        ruleRepository.deleteById(id);
    }

    @Override
    public ApprovalRuleConfig getRuleById(Long id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("规则不存在: " + id));
    }

    @Override
    public List<ApprovalRuleConfig> getAllEnabledRules() {
        return ruleRepository.findByEnabledTrueOrderByPriorityAsc();
    }

    @Override
    public PageResult<ApprovalRuleConfig> getRulesByPage(int page, int size, String ruleName, Boolean enabled) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("priority").ascending());

        Page<ApprovalRuleConfig> pageResult;
        if (ruleName != null && !ruleName.isEmpty()) {
            final Boolean enabledFilter = enabled;
            Specification<ApprovalRuleConfig> spec = (root, query, cb) -> {
                var predicate = cb.like(root.get("ruleName"), "%" + ruleName + "%");
                if (enabledFilter != null) {
                    predicate = cb.and(predicate, cb.equal(root.get("enabled"), enabledFilter));
                }
                return predicate;
            };
            pageResult = ruleRepository.findAll(spec, pageable);
        } else if (enabled != null) {
            Specification<ApprovalRuleConfig> spec = (root, query, cb) -> cb.equal(root.get("enabled"), enabled);
            pageResult = ruleRepository.findAll(spec, pageable);
        } else {
            pageResult = ruleRepository.findAll(pageable);
        }

        return PageResult.of(pageResult.getContent(), pageResult.getTotalElements(), page, size);
    }

    @Override
    public List<ApprovalRuleConfig> getApplicableRules(String fromStatus, String toStatus) {
        return ruleRepository.findApplicableRules(fromStatus, toStatus);
    }

    @Override
    public ApprovalRuleConfig getTopPriorityRule(String fromStatus, String toStatus) {
        return ruleRepository.findTopPriorityRule(fromStatus, toStatus)
                .orElse(null);
    }

    @Override
    public boolean requiresApproval(String fromStatus, String toStatus) {
        ApprovalRuleConfig rule = getTopPriorityRule(fromStatus, toStatus);
        return rule != null && Boolean.TRUE.equals(rule.getRequiresApproval());
    }

    @Override
    public int getApprovalLevel(String fromStatus, String toStatus) {
        ApprovalRuleConfig rule = getTopPriorityRule(fromStatus, toStatus);
        return rule != null && rule.getApprovalLevel() != null ? rule.getApprovalLevel() : 1;
    }

    @Override
    public String getApproverRole(String fromStatus, String toStatus, int level) {
        ApprovalRuleConfig rule = getTopPriorityRule(fromStatus, toStatus);
        if (rule == null) {
            return "ADMIN";
        }

        switch (level) {
            case 1:
                return rule.getLevel1ApproverRole() != null ? rule.getLevel1ApproverRole() : "ADMIN";
            case 2:
                return rule.getLevel2ApproverRole() != null ? rule.getLevel2ApproverRole() : "ADMIN";
            case 3:
                return rule.getLevel3ApproverRole() != null ? rule.getLevel3ApproverRole() : "ADMIN";
            default:
                return "ADMIN";
        }
    }

    @Override
    public boolean supportsFastTrack(String fromStatus, String toStatus) {
        ApprovalRuleConfig rule = getTopPriorityRule(fromStatus, toStatus);
        return rule != null && Boolean.TRUE.equals(rule.getAllowFastTrack());
    }

    @Override
    @Transactional
    public ApprovalRuleConfig toggleRule(Long id, boolean enabled, Long updaterId) {
        log.info("切换规则状态: {}, enabled: {}", id, enabled);

        ApprovalRuleConfig rule = getRuleById(id);
        rule.setEnabled(enabled);

        User updater = userRepository.findById(updaterId)
                .orElseThrow(() -> new BusinessException("更新人不存在"));
        rule.setUpdater(updater);
        rule.setUpdaterId(updaterId);
        rule.setUpdateTime(LocalDateTime.now());

        return ruleRepository.save(rule);
    }

    @Override
    @Transactional
    public void updatePriorities(Map<Long, Integer> priorities, Long updaterId) {
        log.info("批量更新规则优先级");

        User updater = userRepository.findById(updaterId)
                .orElseThrow(() -> new BusinessException("更新人不存在"));

        for (Map.Entry<Long, Integer> entry : priorities.entrySet()) {
            ruleRepository.findById(entry.getKey()).ifPresent(rule -> {
                rule.setPriority(entry.getValue());
                rule.setUpdater(updater);
                rule.setUpdaterId(updaterId);
                rule.setUpdateTime(LocalDateTime.now());
                ruleRepository.save(rule);
            });
        }
    }

    @Override
    @Transactional
    public void initializeDefaultRules(Long creatorId) {
        log.info("初始化默认审批规则");

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new BusinessException("创建人不存在"));

        createDefaultRule("报废审批", null, "4", true, 2, "OPERATOR", "ADMIN", null, creator);
        createDefaultRule("维修审批", "2", "3", true, 1, "OPERATOR", null, null, creator);
        createDefaultRule("恢复使用审批", "3", "2", true, 1, "OPERATOR", null, null, creator);
        createDefaultRule("入库审批", null, "1", false, 1, null, null, null, creator);
        createDefaultRule("出库审批", "1", "2", false, 1, null, null, null, creator);

        log.info("默认审批规则初始化完成");
    }

    private void createDefaultRule(String name, String fromStatus, String toStatus,
            boolean requiresApproval, int level, String level1Role, String level2Role,
            String level3Role, User creator) {

        if (ruleRepository.findByRuleName(name).isPresent()) {
            return;
        }

        ApprovalRuleConfig rule = new ApprovalRuleConfig();
        rule.setRuleName(name);
        rule.setFromStatus(fromStatus);
        rule.setToStatus(toStatus);
        rule.setRequiresApproval(requiresApproval);
        rule.setApprovalLevel(level);
        rule.setLevel1ApproverRole(level1Role);
        rule.setLevel2ApproverRole(level2Role);
        rule.setLevel3ApproverRole(level3Role);
        rule.setAllowFastTrack(false);
        rule.setTimeoutHours(24);
        rule.setTimeoutAction("NONE");
        rule.setEnableNotification(true);
        rule.setNotificationType("SYSTEM");
        rule.setEnabled(true);
        rule.setPriority(100);
        rule.setCreator(creator);
        rule.setCreatorId(creator.getId());
        rule.setCreateTime(LocalDateTime.now());
        rule.setUpdateTime(LocalDateTime.now());

        ruleRepository.save(rule);
    }
}
