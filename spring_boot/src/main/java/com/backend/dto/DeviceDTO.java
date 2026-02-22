package com.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DeviceDTO {
    private Long id;
    private String deviceCode;
    private String deviceName;
    private String deviceModel;
    private String deviceSpec;
    private String manufacturer;
    private Integer deviceTypeId;
    private String deviceTypeName;
    private Integer status;
    private String statusName;
    private Integer currentStock;
    private Integer totalStock;
    private Integer warehouseId;
    private String warehouseName;
    private Integer areaId;
    private String areaName;
    private Integer binId;
    private String binName;
    private String purchaseDate;
    private String warrantyPeriod;
    private Double purchasePrice;
    private String remark;

    // 新增字段
    private String serialNumber;
    private String assetCode;
    private LocalDate productionDate;
    private LocalDate warrantyStart;
    private LocalDate warrantyEnd;
    private String specifications;
    private Double price;
    private String imageUrl;
    private String description;

    // 负责人信息
    private Long principalId;
    private String principalName;

    // 供应商信息
    private Long supplierId;
    private String supplierName;

    // 安装位置信息
    private String installationLocation;
    private String installationProvince;
    private String installationCity;
    private String installationDistrict;
    private String installationAddress;

    // 安装人员信息
    private Long installerId;
    private String installerName;

    // ==================== 出入库信息（新增） ====================

    // 入库信息
    private Long inboundPersonId;
    private String inboundPersonName;
    private LocalDateTime inboundTime;

    // 出库信息
    private Long outboundPersonId;
    private String outboundPersonName;
    private LocalDateTime outboundTime;

    // 统一位置显示
    private String currentLocation;
    private Integer currentLocationType;
    private String currentLocationTypeName;

    // 时间戳
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
