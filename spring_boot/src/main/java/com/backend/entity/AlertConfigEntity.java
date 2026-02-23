package com.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "alert_config")
public class AlertConfigEntity extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "threshold")
    private Integer threshold;

    @Column(name = "status")
    private Integer status = 1;

    @Column(name = "notify_methods", length = 200)
    private String notifyMethods;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "device_type_id")
    private Long deviceTypeId;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "min_value")
    private Integer minValue;

    @Column(name = "max_value")
    private Integer maxValue;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes = 30;

    @Column(name = "last_triggered_at")
    private java.time.LocalDateTime lastTriggeredAt;

    @Column(name = "trigger_count")
    private Integer triggerCount = 0;
}
