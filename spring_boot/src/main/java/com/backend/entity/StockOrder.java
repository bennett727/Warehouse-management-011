package com.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "stock_order", indexes = {
        @Index(name = "idx_order_no", columnList = "order_no"),
        @Index(name = "idx_order_type", columnList = "order_type"),
        @Index(name = "idx_order_status", columnList = "status")
})
public class StockOrder extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "order_no", nullable = false, unique = true, length = 50)
    private String orderNo;

    @Column(name = "order_type", nullable = false)
    private Integer orderType;

    @Column(name = "outbound_type")
    private Integer outboundType;

    @Column(name = "status")
    private Integer status = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_area_id")
    @JsonIgnore
    private Area sourceArea;

    @Column(name = "source_area_id", insertable = false, updatable = false)
    private Long sourceAreaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_area_id")
    @JsonIgnore
    private Area targetArea;

    @Column(name = "target_area_id", insertable = false, updatable = false)
    private Long targetAreaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @JsonIgnore
    private Area area;

    @Column(name = "area_id", insertable = false, updatable = false)
    private Long areaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    @JsonIgnore
    private User operator;

    @Column(name = "operator_id", insertable = false, updatable = false)
    private Long operatorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id")
    @JsonIgnore
    private User auditor;

    @Column(name = "auditor_id", insertable = false, updatable = false)
    private Long auditorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    @Column(name = "supplier_id", insertable = false, updatable = false)
    private Long supplierId;

    @Column(name = "audit_time")
    private LocalDateTime auditTime;

    @Column(name = "execute_time")
    private LocalDateTime executeTime;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "total_quantity")
    private Integer totalQuantity = 0;

    @Column(name = "operator_name", length = 100)
    private String operatorName;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(name = "remark", length = 500)
    private String remark;

    @OneToMany(mappedBy = "stockOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StockOrderItem> items = new ArrayList<>();

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

    @Column(name = "customer", length = 200)
    private String customer;
}
