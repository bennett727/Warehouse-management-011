package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "device", indexes = {
        @Index(name = "idx_device_code", columnList = "device_code"),
        @Index(name = "idx_device_type", columnList = "type_id"),
        @Index(name = "idx_device_status", columnList = "status"),
        @Index(name = "idx_device_area", columnList = "area_id"),
        @Index(name = "idx_device_bin", columnList = "bin_id")
})
public class Device extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "device_code", nullable = false, unique = true, length = 50)
    private String deviceCode;

    @Column(name = "device_name", nullable = false, length = 100)
    private String deviceName;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "asset_code", length = 100)
    private String assetCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    @JsonIgnore
    private DeviceType deviceType;

    @Column(name = "type_id", insertable = false, updatable = false)
    private Long typeId;

    @Column(name = "status")
    private Integer status = -1;

    @Column(name = "current_stock")
    private Integer currentStock = 0;

    @Column(name = "min_stock")
    private Integer minStock = 0;

    @Column(name = "max_stock")
    private Integer maxStock = 0;

    @Column(name = "reorder_point")
    private Integer reorderPoint = 0;

    @Column(name = "safety_stock")
    private Integer safetyStock = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @JsonIgnore
    private Area area;

    @Column(name = "area_id", insertable = false, updatable = false)
    private Long areaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_id")
    @JsonIgnore
    private Bin bin;

    @Column(name = "bin_id", insertable = false, updatable = false)
    private Long binId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "principal_id")
    @JsonIgnore
    private User principal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    @Column(name = "supplier_id", insertable = false, updatable = false)
    private Long supplierId;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "production_date")
    private LocalDate productionDate;

    @Column(name = "warranty_period")
    private Integer warrantyPeriod;

    @Column(name = "warranty_start_date")
    private LocalDate warrantyStart;

    @Column(name = "warranty_end_date")
    private LocalDate warrantyEnd;

    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "weight", precision = 10, scale = 3)
    private BigDecimal weight;

    @Column(name = "length", precision = 10, scale = 2)
    private BigDecimal length;

    @Column(name = "width", precision = 10, scale = 2)
    private BigDecimal width;

    @Column(name = "height", precision = 10, scale = 2)
    private BigDecimal height;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "supplier_batch_no", length = 50)
    private String supplierBatchNo;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "scrap_reason", length = 255)
    private String scrapReason;

    @Column(name = "scrap_time")
    private LocalDateTime scrapTime;

    @Column(name = "installation_time")
    private LocalDateTime installationTime;

    // 安装位置信息
    @Column(name = "installation_location", length = 255)
    private String installationLocation;

    @Column(name = "installation_province", length = 50)
    private String installationProvince;

    @Column(name = "installation_city", length = 50)
    private String installationCity;

    @Column(name = "installation_district", length = 50)
    private String installationDistrict;

    @Column(name = "installation_address", length = 255)
    private String installationAddress;

    // 安装人员信息
    @Column(name = "installer_id")
    private Long installerId;

    @Column(name = "installer_name", length = 100)
    private String installerName;

    // 负责人信息（冗余字段，便于查询）
    @Column(name = "principal_name", length = 100)
    private String principalName;

    // 供应商信息（冗余字段，便于查询）
    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    // 仓库信息（冗余字段，便于查询）
    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "warehouse_name", length = 100)
    private String warehouseName;

    @Column(name = "area_name", length = 100)
    private String areaName;

    @Column(name = "bin_name", length = 100)
    private String binName;

    // ==================== 出入库信息（新增） ====================

    // 入库信息
    @Column(name = "inbound_person_id")
    private Long inboundPersonId;

    @Column(name = "inbound_person_name", length = 100)
    private String inboundPersonName;

    @Column(name = "inbound_time")
    private LocalDateTime inboundTime;

    // 出库信息
    @Column(name = "outbound_person_id")
    private Long outboundPersonId;

    @Column(name = "outbound_person_name", length = 100)
    private String outboundPersonName;

    @Column(name = "outbound_time")
    private LocalDateTime outboundTime;

    // 统一位置显示（存放位置或安装位置）
    @Column(name = "current_location", length = 255)
    private String currentLocation;

    // 位置类型：0=仓库, 1=安装现场
    @Column(name = "current_location_type")
    private Integer currentLocationType = 0;

    /**
     * 获取当前显示位置
     * @return 根据状态返回存放位置或安装位置
     */
    public String getCurrentDisplayLocation() {
        if (currentLocation != null && !currentLocation.isEmpty()) {
            return currentLocation;
        }

        // 根据状态判断使用哪种位置
        if (status != null && status == 0) {
            // 在库状态 - 显示仓库位置
            StringBuilder location = new StringBuilder();
            if (warehouseName != null && !warehouseName.isEmpty()) {
                location.append(warehouseName);
            }
            if (areaName != null && !areaName.isEmpty()) {
                location.append(location.length() > 0 ? " - " : "").append(areaName);
            }
            if (binName != null && !binName.isEmpty()) {
                location.append(location.length() > 0 ? " - " : "").append(binName);
            }
            return location.length() > 0 ? location.toString() : "-";
        } else if (status != null && status == 1) {
            // 使用中状态 - 显示安装位置
            if (installationLocation != null && !installationLocation.isEmpty()) {
                return installationLocation;
            }
            // 尝试组合省市区地址
            StringBuilder location = new StringBuilder();
            if (installationProvince != null && !installationProvince.isEmpty()) {
                location.append(installationProvince);
            }
            if (installationCity != null && !installationCity.isEmpty()) {
                location.append(location.length() > 0 ? " > " : "").append(installationCity);
            }
            if (installationDistrict != null && !installationDistrict.isEmpty()) {
                location.append(location.length() > 0 ? " > " : "").append(installationDistrict);
            }
            if (installationAddress != null && !installationAddress.isEmpty()) {
                location.append(location.length() > 0 ? " > " : "").append(installationAddress);
            }
            return location.length() > 0 ? location.toString() : "-";
        }
        return "-";
    }

    /**
     * 更新入库信息
     * @param personId 入库人员ID
     * @param personName 入库人员名称
     * @param location 入库位置
     */
    public void updateInboundInfo(Long personId, String personName, String location) {
        this.inboundPersonId = personId;
        this.inboundPersonName = personName;
        this.inboundTime = LocalDateTime.now();
        this.currentLocation = location;
        this.currentLocationType = 0; // 仓库
        this.status = 0; // 在库
    }

    /**
     * 更新入库信息（带仓库、区域、货位信息）
     * @param personId 入库人员ID
     * @param personName 入库人员名称
     * @param location 入库位置
     * @param warehouseId 仓库ID
     * @param warehouseName 仓库名称
     * @param areaId 区域ID
     * @param areaName 区域名称
     * @param binId 货位ID
     * @param binName 货位名称
     */
    public void updateInboundInfo(Long personId, String personName, String location,
                                   Long warehouseId, String warehouseName,
                                   Long areaId, String areaName,
                                   Long binId, String binName) {
        this.inboundPersonId = personId;
        this.inboundPersonName = personName;
        this.inboundTime = LocalDateTime.now();
        this.currentLocation = location;
        this.currentLocationType = 0; // 仓库
        this.status = 0; // 在库

        // 更新仓库、区域、货位信息
        if (warehouseId != null) {
            this.warehouseId = warehouseId;
        }
        if (warehouseName != null) {
            this.warehouseName = warehouseName;
        }
        if (areaId != null) {
            this.areaId = areaId;
        }
        if (areaName != null) {
            this.areaName = areaName;
        }
        if (binId != null) {
            this.binId = binId;
        }
        if (binName != null) {
            this.binName = binName;
        }
    }

    /**
     * 更新出库信息
     * @param personId 出库人员ID
     * @param personName 出库人员名称
     * @param targetLocation 目标位置
     */
    public void updateOutboundInfo(Long personId, String personName, String targetLocation) {
        this.outboundPersonId = personId;
        this.outboundPersonName = personName;
        this.outboundTime = LocalDateTime.now();
        this.currentLocation = targetLocation;
        this.currentLocationType = 1; // 安装现场
        this.status = 1; // 使用中
    }
}
