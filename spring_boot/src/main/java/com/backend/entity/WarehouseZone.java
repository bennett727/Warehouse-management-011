package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * 仓库功能区实体
 *
 * 功能说明：
 * 管理仓库内部的功能分区，如收货区、存储区、拣货区等
 * 支持自定义功能区类型
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Getter
@Setter
@Entity
@Table(name = "warehouse_zone",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "code", name = "uk_zone_code")
       },
       indexes = {
           @Index(name = "idx_zone_warehouse", columnList = "warehouse_id"),
           @Index(name = "idx_zone_type_id", columnList = "zone_type_id"),
           @Index(name = "idx_zone_status", columnList = "status")
       })
public class WarehouseZone extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    @JsonIgnore
    private Warehouse warehouse;

    @Column(name = "warehouse_id", insertable = false, updatable = false)
    private Long warehouseId;

    /**
     * 功能区类型（关联ZoneType）
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_type_id")
    @JsonIgnore
    private ZoneType zoneType;

    @Column(name = "zone_type_id", insertable = false, updatable = false)
    private Long zoneTypeId;

    /**
     * 功能区类型编码（冗余字段，便于查询）
     */
    @Column(name = "zone_type_code", length = 50)
    private String zoneTypeCode;

    /**
     * 功能区类型名称（冗余字段，便于展示）
     */
    @Column(name = "zone_type_name", length = 100)
    private String zoneTypeName;

    @Column(name = "sort")
    private Integer sort = 0;

    @Column(name = "status")
    private Integer status = 1;

    @Column(name = "remark", length = 500)
    private String remark;

    /**
     * 容量限制（可选）
     */
    @Column(name = "capacity")
    private Integer capacity;

    /**
     * 已使用容量
     */
    @Column(name = "used_capacity")
    private Integer usedCapacity = 0;

    /**
     * 获取容量使用率
     */
    public Double getUsageRate() {
        if (capacity == null || capacity == 0) {
            return 0.0;
        }
        return (usedCapacity * 100.0) / capacity;
    }

    /**
     * 是否还有可用容量
     */
    public boolean hasAvailableCapacity() {
        if (capacity == null) {
            return true;
        }
        return usedCapacity < capacity;
    }

    /**
     * 获取可用容量
     */
    public Integer getAvailableCapacity() {
        if (capacity == null) {
            return null;
        }
        return capacity - usedCapacity;
    }

    /**
     * 设置功能区类型
     */
    public void setZoneType(ZoneType zoneType) {
        this.zoneType = zoneType;
        if (zoneType != null) {
            this.zoneTypeId = zoneType.getId();
            this.zoneTypeCode = zoneType.getCode();
            this.zoneTypeName = zoneType.getName();
        }
    }

    /**
     * 获取功能区名称（别名方法）
     */
    public String getZoneName() {
        return this.name;
    }
}
