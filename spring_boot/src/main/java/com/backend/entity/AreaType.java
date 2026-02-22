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

@Getter
@Setter
@Entity
@Table(name = "area_type",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "code", name = "uk_area_type_code"),
           @UniqueConstraint(columnNames = "name", name = "uk_area_type_name")
       },
       indexes = {
           @Index(name = "idx_area_type_status", columnList = "status"),
           @Index(name = "idx_area_type_sort", columnList = "sort")
       })
public class AreaType extends BaseEntity {

    @NotBlank(message = "区域类型名称不能为空")
    @Size(max = 100, message = "区域类型名称长度不能超过100个字符")
    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @NotBlank(message = "区域类型编码不能为空")
    @Size(max = 50, message = "区域类型编码长度不能超过50个字符")
    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    @Column(length = 500)
    private String description;

    @NotNull(message = "状态不能为空")
    @Column(nullable = false)
    private Integer status = 1;

    @Column
    private Integer sort = 0;

    @OneToMany(mappedBy = "areaType", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Area> areas = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public Set<Area> getAreas() {
        return areas;
    }

    public void setAreas(Set<Area> areas) {
        this.areas = areas;
    }
}
