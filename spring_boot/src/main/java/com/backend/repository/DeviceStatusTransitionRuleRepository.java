package com.backend.repository;

import com.backend.entity.DeviceStatusTransitionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceStatusTransitionRuleRepository extends JpaRepository<DeviceStatusTransitionRule, Long> {

    List<DeviceStatusTransitionRule> findByFromStatusAndToStatusAndEnabled(Integer fromStatus, Integer toStatus, Boolean enabled);

    List<DeviceStatusTransitionRule> findByFromStatusAndEnabled(Integer fromStatus, Boolean enabled);

    List<DeviceStatusTransitionRule> findByDeviceTypeIdAndEnabled(Long deviceTypeId, Boolean enabled);

    @Query("SELECT r.toStatus FROM DeviceStatusTransitionRule r WHERE r.fromStatus = :fromStatus AND r.enabled = true")
    List<Integer> findAvailableTargetStatuses(@Param("fromStatus") Integer fromStatus);

    @Query("SELECT r FROM DeviceStatusTransitionRule r WHERE r.fromStatus = :fromStatus AND r.toStatus = :toStatus AND r.enabled = true")
    DeviceStatusTransitionRule findByFromStatusAndToStatusAndEnabledTrue(@Param("fromStatus") Integer fromStatus, @Param("toStatus") Integer toStatus);
}