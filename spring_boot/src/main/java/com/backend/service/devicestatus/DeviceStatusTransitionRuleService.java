package com.backend.service.devicestatus;

import com.backend.entity.DeviceStatusTransitionRule;

import java.util.List;
import java.util.Map;

public interface DeviceStatusTransitionRuleService {

    List<DeviceStatusTransitionRule> getAllRules();

    DeviceStatusTransitionRule getRuleById(Long id);

    DeviceStatusTransitionRule createRule(DeviceStatusTransitionRule rule);

    DeviceStatusTransitionRule updateRule(Long id, DeviceStatusTransitionRule rule);

    void deleteRule(Long id);

    void batchDeleteRules(List<Long> ids);

    List<DeviceStatusTransitionRule> getRulesByDeviceType(Long deviceTypeId);

    List<Integer> getAvailableTargetStatuses(Integer fromStatus);

    Map<String, Object> validateTransition(Integer fromStatus, Integer toStatus, Long deviceTypeId);

    Map<String, Object> validate(DeviceStatusTransitionRule rule);
}