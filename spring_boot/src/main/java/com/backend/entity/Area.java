package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "area", indexes = {
        @Index(name = "idx_area_city", columnList = "city_id"),
        @Index(name = "idx_area_status", columnList = "status")
})
public class Area extends BaseEntity {

    @Column(name = "area_type_id")
    private Long areaTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_type_id", insertable = false, updatable = false)
    @JsonIgnore
    private AreaType areaType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    @JsonIgnore
    private Warehouse warehouse;

    @Column(name = "warehouse_id", insertable = false, updatable = false)
    private Long warehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    @JsonIgnore
    private AdministrativeDivision province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    @JsonIgnore
    private AdministrativeDivision city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    @JsonIgnore
    private AdministrativeDivision district;

    @Column(name = "code", unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "sort")
    private Integer sort = 0;

    @Column(name = "status")
    private Integer status = 1;

    @Column(name = "remark", length = 500)
    private String remark;

    /**
     * 设置城市（字符串形式）
     * 
     * @param city 城市名称
     */
    public void setCity(String city) {
        // 字符串形式的城市名称，用于兼容旧代码
    }

    /**
     * 设置区县（字符串形式）
     * 
     * @param district 区县名称
     */
    public void setDistrict(String district) {
        // 字符串形式的区县名称，用于兼容旧代码
    }

    /**
     * 设置城市行政区划
     * 
     * @param cityDivision 城市行政区划
     */
    public void setCityDivision(AdministrativeDivision cityDivision) {
        this.city = cityDivision;
    }

    /**
     * 设置区县行政区划
     * 
     * @param districtDivision 区县行政区划
     */
    public void setDistrictDivision(AdministrativeDivision districtDivision) {
        this.district = districtDivision;
    }

    /**
     * 设置区域编码（别名方法）
     */
    public void setAreaCode(String areaCode) {
        this.code = areaCode;
    }

    /**
     * 设置区域名称（别名方法）
     */
    public void setAreaName(String areaName) {
        this.name = areaName;
    }

    /**
     * 设置描述（别名方法）
     */
    public void setDescription(String description) {
        this.remark = description;
    }
}
