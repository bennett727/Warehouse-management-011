package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "warehouse")
public class Warehouse extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "warehouse_code", nullable = false, unique = true, length = 50)
    private String warehouseCode;

    @Column(name = "warehouse_name", nullable = false, length = 100)
    private String warehouseName;

    @Column(name = "address", length = 255)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnore
    private User manager;

    @Column(name = "status")
    private Integer status = 1;

    @Column(name = "warehouse_type")
    private Integer warehouseType;

    @Column(name = "administrative_division_id")
    private Long administrativeDivisionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    @JsonIgnore
    private AdministrativeDivision province;

    @Column(name = "province_id", insertable = false, updatable = false)
    private Long provinceId;

    @Column(name = "province_name", length = 50)
    private String provinceName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    @JsonIgnore
    private AdministrativeDivision city;

    @Column(name = "city_id", insertable = false, updatable = false)
    private Long cityId;

    @Column(name = "city_name", length = 50)
    private String cityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    @JsonIgnore
    private AdministrativeDivision district;

    @Column(name = "district_id", insertable = false, updatable = false)
    private Long districtId;

    @Column(name = "district_name", length = 50)
    private String districtName;

    @Column(name = "detail_address", length = 255)
    private String detailAddress;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "contact_person", length = 50)
    private String contactPerson;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "area_size")
    private Double areaSize;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "create_time")
    private java.time.LocalDateTime createTime;

    @Column(name = "update_time")
    private java.time.LocalDateTime updateTime;

    public enum WarehouseStatus {
        ACTIVE(1, "启用"),
        INACTIVE(0, "停用");

        private final Integer code;
        private final String description;

        WarehouseStatus(Integer code, String description) {
            this.code = code;
            this.description = description;
        }

        public Integer getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum WarehouseType {
        MAIN(1, "主仓库"),
        BRANCH(2, "分仓库"),
        TEMPORARY(3, "临时仓库");

        private final Integer code;
        private final String description;

        WarehouseType(Integer code, String description) {
            this.code = code;
            this.description = description;
        }

        public Integer getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 获取完整地址
     *
     * @return 完整地址字符串
     */
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (provinceName != null) {
            sb.append(provinceName);
        }
        if (cityName != null) {
            sb.append(cityName);
        }
        if (districtName != null) {
            sb.append(districtName);
        }
        if (detailAddress != null) {
            sb.append(detailAddress);
        }
        return sb.toString();
    }

    /**
     * 更新地址信息
     *
     * @param provinceId   省份ID
     * @param provinceName 省份名称
     * @param cityId       城市ID
     * @param cityName     城市名称
     * @param districtId   区县ID
     * @param districtName 区县名称
     * @param detailAddress 详细地址
     */
    public void updateAddress(Long provinceId, String provinceName,
                              Long cityId, String cityName,
                              Long districtId, String districtName,
                              String detailAddress) {
        this.provinceId = provinceId;
        this.provinceName = provinceName;
        this.cityId = cityId;
        this.cityName = cityName;
        this.districtId = districtId;
        this.districtName = districtName;
        this.detailAddress = detailAddress;
        this.address = getFullAddress();
    }
}
