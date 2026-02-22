package com.backend.entity;

import java.time.LocalDate;

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

/**
 * 安装记录实体
 *
 * 设计说明：
 * 1. 本实体是安装业务的唯一数据源，存储所有安装相关信息
 * 2. 通过sourceOrderId和sourceOrderItemId关联出库单
 * 3. 避免与StockOrderItem的字段重复
 *
 * @author 开发团队
 * @since 2026-02-13
 */
@Getter
@Setter
@Entity
@Table(name = "installation_record", indexes = {
        @Index(name = "idx_install_device", columnList = "device_id"),
        @Index(name = "idx_install_order", columnList = "source_order_id"),
        @Index(name = "idx_install_order_item", columnList = "source_order_item_id"),
        @Index(name = "idx_install_status", columnList = "status")
})
public class InstallationRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    /**
     * 安装单号
     */
    @Column(name = "install_no", unique = true, length = 50)
    private String installNo;

    /**
     * 安装日期
     */
    @Column(name = "install_date")
    private LocalDate installDate;

    /**
     * 安装地点/地址
     */
    @Column(name = "install_location", length = 255)
    private String installLocation;

    /**
     * 安装费用
     */
    @Column(name = "installation_cost", precision = 15, scale = 2)
    private java.math.BigDecimal installationCost;

    /**
     * 保修期（月）
     */
    @Column(name = "warranty_period")
    private Integer warrantyPeriod;

    /**
     * 保修开始日期
     */
    @Column(name = "warranty_start")
    private LocalDate warrantyStart;

    /**
     * 保修结束日期
     */
    @Column(name = "warranty_end")
    private LocalDate warrantyEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installer_id")
    @JsonIgnore
    private User installer;

    @Column(name = "installer_id", insertable = false, updatable = false)
    private Long installerId;

    /**
     * 安装人员姓名（冗余字段，便于查询展示）
     */
    @Column(name = "installer_name", length = 50)
    private String installerName;

    /**
     * 安装状态
     * 0: 待安装, 1: 安装中, 2: 安装完成, 3: 安装失败
     */
    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "remark", length = 500)
    private String remark;

    // ==================== 出库关联字段 ====================
    // 用于出库-安装联动机制，建立与出库单的关系

    /**
     * 关联出库单ID
     */
    @Column(name = "source_order_id")
    private Long sourceOrderId;

    /**
     * 关联出库单项ID
     */
    @Column(name = "source_order_item_id")
    private Long sourceOrderItemId;

    /**
     * 关联出库单号（冗余，便于查询）
     */
    @Column(name = "source_order_no", length = 50)
    private String sourceOrderNo;

    // ==================== 设备信息冗余字段 ====================
    // 用于记录安装时的设备信息（防止设备信息变更后历史记录不准确）

    @Column(name = "device_code", length = 50)
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    // ==================== 安装地址字段 ====================
    // 详细的安装地址信息

    @Column(name = "installation_province_id")
    private Long installationProvinceId;

    @Column(name = "installation_province", length = 50)
    private String installationProvince;

    @Column(name = "installation_city_id")
    private Long installationCityId;

    @Column(name = "installation_city", length = 50)
    private String installationCity;

    @Column(name = "installation_district_id")
    private Long installationDistrictId;

    @Column(name = "installation_district", length = 50)
    private String installationDistrict;

    @Column(name = "installation_detail_address", length = 500)
    private String installationDetailAddress;

    /**
     * 完整安装地址（省市区+详细地址）
     */
    @Column(name = "installation_full_address", length = 1000)
    private String installationFullAddress;

    // ==================== 便捷方法 ====================

    /**
     * 计算保修结束日期
     */
    public void calculateWarrantyEnd() {
        if (this.warrantyStart != null && this.warrantyPeriod != null) {
            this.warrantyEnd = this.warrantyStart.plusMonths(this.warrantyPeriod);
        }
    }

    /**
     * 检查是否在保修期内
     */
    public boolean isUnderWarranty() {
        if (this.warrantyEnd == null) {
            return false;
        }
        return LocalDate.now().isBefore(this.warrantyEnd) || LocalDate.now().isEqual(this.warrantyEnd);
    }

    /**
     * 组装完整地址
     */
    public void assembleFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (installationProvince != null) sb.append(installationProvince);
        if (installationCity != null) sb.append(installationCity);
        if (installationDistrict != null) sb.append(installationDistrict);
        if (installationDetailAddress != null) sb.append(installationDetailAddress);
        this.installationFullAddress = sb.toString();
    }
}
