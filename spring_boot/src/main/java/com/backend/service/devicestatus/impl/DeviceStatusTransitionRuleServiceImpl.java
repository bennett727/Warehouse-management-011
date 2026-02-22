package com.backend.service.devicestatus.impl;

import com.backend.config.CacheConfig;
import com.backend.entity.DeviceStatusTransitionRule;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.DeviceStatusTransitionRuleRepository;
import com.backend.service.devicestatus.DeviceStatusTransitionRuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DeviceStatusTransitionRuleServiceImpl implements DeviceStatusTransitionRuleService {

    private static final Logger logger = LoggerFactory.getLogger(DeviceStatusTransitionRuleServiceImpl.class);

    private final DeviceStatusTransitionRuleRepository ruleRepository;

    public DeviceStatusTransitionRuleServiceImpl(DeviceStatusTransitionRuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_DEVICE_STATUS_RULE, key = "'all'")
    public List<DeviceStatusTransitionRule> getAllRules() {
        logger.info("获取所有设备状态转换规则");
        return ruleRepository.findAll();
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_DEVICE_STATUS_RULE, key = "#id")
    public DeviceStatusTransitionRule getRuleById(Long id) {
        logger.info("获取设备状态转换规则，ID: {}", id);
        return ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceStatusTransitionRule", "id", id));
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_DEVICE_STATUS_RULE, allEntries = true)
    public DeviceStatusTransitionRule createRule(DeviceStatusTransitionRule rule) {
        logger.info("创建设备状态转换规则: {} -> {}", rule.getFromStatus(), rule.getToStatus());

        validateRule(rule);

        rule.setEnabled(true);
        if (rule.getPriority() == null) {
            rule.setPriority(0);
        }

        DeviceStatusTransitionRule savedRule = ruleRepository.save(rule);
        logger.info("设备状态转换规则创建成功，ID: {}", savedRule.getId());

        return savedRule;
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_DEVICE_STATUS_RULE, allEntries = true)
    public DeviceStatusTransitionRule updateRule(Long id, DeviceStatusTransitionRule rule) {
        logger.info("更新设备状态转换规则，ID: {}", id);

        DeviceStatusTransitionRule existingRule = getRuleById(id);

        existingRule.setRuleName(rule.getRuleName());
        existingRule.setFromStatus(rule.getFromStatus());
        existingRule.setToStatus(rule.getToStatus());
        existingRule.setDeviceTypeId(rule.getDeviceTypeId());
        existingRule.setRequiresApproval(rule.getRequiresApproval());
        existingRule.setApprovalRole(rule.getApprovalRole());
        existingRule.setDescription(rule.getDescription());
        existingRule.setEnabled(rule.getEnabled());
        existingRule.setPriority(rule.getPriority());

        validateRule(existingRule);

        DeviceStatusTransitionRule updatedRule = ruleRepository.save(existingRule);
        logger.info("设备状态转换规则更新成功，ID: {}", updatedRule.getId());

        return updatedRule;
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_DEVICE_STATUS_RULE, allEntries = true)
    public void deleteRule(Long id) {
        logger.info("删除设备状态转换规则，ID: {}", id);

        if (!ruleRepository.existsById(id)) {
            throw new ResourceNotFoundException("DeviceStatusTransitionRule", "id", id);
        }

        ruleRepository.deleteById(id);
        logger.info("设备状态转换规则删除成功，ID: {}", id);
    }

    @Override
    @Transactional
    public void batchDeleteRules(List<Long> ids) {
        logger.info("批量删除设备状态转换规则，数量: {}", ids.size());

        for (Long id : ids) {
            if (!ruleRepository.existsById(id)) {
                throw new ResourceNotFoundException("DeviceStatusTransitionRule", "id", id);
            }
        }

        ruleRepository.deleteAllById(ids);
        logger.info("批量删除设备状态转换规则成功，数量: {}", ids.size());
    }

    @Override
    public List<DeviceStatusTransitionRule> getRulesByDeviceType(Long deviceTypeId) {
        logger.info("获取设备类型的状态转换规则，设备类型ID: {}", deviceTypeId);
        return ruleRepository.findByDeviceTypeIdAndEnabled(deviceTypeId, true);
    }

    @Override
    public List<Integer> getAvailableTargetStatuses(Integer fromStatus) {
        logger.info("获取可转换的目标状态，源状态: {}", fromStatus);
        return ruleRepository.findAvailableTargetStatuses(fromStatus);
    }

    @Override
    public Map<String, Object> validateTransition(Integer fromStatus, Integer toStatus, Long deviceTypeId) {
        logger.info("验证状态转换: {} -> {}, 设备类型: {}", fromStatus, toStatus, deviceTypeId);

        Map<String, Object> result = new HashMap<>();

        try {
            DeviceStatus fromStatusEnum = DeviceStatus.fromCode(fromStatus);
            DeviceStatus toStatusEnum = DeviceStatus.fromCode(toStatus);

            result.put("fromStatus", fromStatusEnum.getDescription());
            result.put("toStatus", toStatusEnum.getDescription());
            result.put("valid", false);

            DeviceStatusTransitionRule rule = ruleRepository.findByFromStatusAndToStatusAndEnabledTrue(fromStatus, toStatus);

            if (rule == null) {
                result.put("message", "状态转换规则不存在或未启用");
                return result;
            }

            if (deviceTypeId != null && !deviceTypeId.equals(rule.getDeviceTypeId())) {
                result.put("message", "状态转换规则不适用于此设备类型");
                return result;
            }

            result.put("valid", true);
            result.put("requiresApproval", rule.getRequiresApproval());
            result.put("approvalRole", rule.getApprovalRole());
            result.put("message", "状态转换有效");

        } catch (IllegalArgumentException e) {
            result.put("valid", false);
            result.put("message", "无效的设备状态代码");
        }

        return result;
    }

    @Override
    public Map<String, Object> validate(DeviceStatusTransitionRule rule) {
        Map<String, Object> result = new HashMap<>();

        try {
            DeviceStatus.fromCode(rule.getFromStatus());
            DeviceStatus.fromCode(rule.getToStatus());

            if (rule.getFromStatus().equals(rule.getToStatus())) {
                throw new BusinessException("源状态和目标状态不能相同");
            }

            result.put("valid", true);
            result.put("message", "规则验证通过");

        } catch (IllegalArgumentException e) {
            result.put("valid", false);
            result.put("message", "无效的设备状态代码");
        } catch (BusinessException e) {
            result.put("valid", false);
            result.put("message", e.getMessage());
        }

        return result;
    }

    private void validateRule(DeviceStatusTransitionRule rule) {
        try {
            DeviceStatus.fromCode(rule.getFromStatus());
            DeviceStatus.fromCode(rule.getToStatus());

            if (rule.getFromStatus().equals(rule.getToStatus())) {
                throw new BusinessException("源状态和目标状态不能相同");
            }

        } catch (IllegalArgumentException e) {
            throw new BusinessException("无效的设备状态代码");
        }
    }
}