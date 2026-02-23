package com.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "performance_log", indexes = {
    @Index(name = "idx_metric_type", columnList = "metric_type"),
    @Index(name = "idx_page_url", columnList = "page_url"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_create_time", columnList = "create_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class PerformanceLog extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(name = "metric_name", nullable = false, length = 100)
    private String metricName;

    @Column(name = "metric_value", nullable = false)
    private Double metricValue;

    @Column(name = "metric_unit", length = 20)
    private String metricUnit;

    @Column(name = "page_url", length = 500)
    private String pageUrl;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", length = 50)
    private String userName;

    @Column(name = "browser_info", length = 200)
    private String browserInfo;

    @Column(name = "os_info", length = 200)
    private String osInfo;

    @Column(name = "network_type", length = 50)
    private String networkType;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;
}