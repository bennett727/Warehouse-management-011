package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

/**
 * 功能区类型实体
 *
 * 功能说明：
 * 管理仓库功能区的类型定义，支持自定义类型
 * 系统预设类型：收货区、存储区、拣货区、发货区、退货区、质检区、维修区、暂存区
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Getter
@Setter
@Entity
@Table(name = "zone_type",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "code", name = "uk_zone_type_code"),
           @UniqueConstraint(columnNames = "name", name = "uk_zone_type_name")
       },
       indexes = {
           @Index(name = "idx_zone_type_status", columnList = "status"),
           @Index(name = "idx_zone_type_sort", columnList = "sort"),
           @Index(name = "idx_zone_type_is_system", columnList = "is_system")
       })
public class ZoneType extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "类型名称不能为空")
    @Size(max = 100, message = "类型名称长度不能超过100个字符")
    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

    @NotBlank(message = "类型编码不能为空")
    @Size(max = 50, message = "类型编码长度不能超过50个字符")
    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    @Column(name = "description", length = 500)
    private String description;

    @NotNull(message = "状态不能为空")
    @Column(name = "status", nullable = false)
    private Integer status = 1;

    @Column(name = "sort")
    private Integer sort = 0;

    /**
     * 是否系统预设类型
     * 系统预设类型不允许删除，只能停用
     */
    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    /**
     * 图标标识
     */
    @Column(name = "icon", length = 50)
    private String icon;

    /**
     * 颜色标识（用于前端展示）
     */
    @Column(name = "color", length = 20)
    private String color;

    @OneToMany(mappedBy = "zoneType", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<WarehouseZone> zones = new HashSet<>();

    /**
     * 获取使用数量
     */
    public int getUsageCount() {
        return zones != null ? zones.size() : 0;
    }

    /**
     * 是否可以删除
     * 系统预设类型或使用中的类型不能删除
     */
    public boolean isDeletable() {
        return !isSystem && getUsageCount() == 0;
    }
}
