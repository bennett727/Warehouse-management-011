package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "alert_threshold")
public class AlertThreshold extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    @Column(name = "min_threshold")
    private Integer minThreshold;

    @Column(name = "max_threshold")
    private Integer maxThreshold;

    @Column(name = "warning_level")
    private Integer warningLevel = 1;

    @Column(name = "enabled")
    private Integer enabled = 1;
}
