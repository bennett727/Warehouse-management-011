package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "stock_transfer")
public class StockTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transfer_no", nullable = false, unique = true, length = 50)
    private String transferNo;

    @Column(name = "source_warehouse_id")
    private Long sourceWarehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_warehouse_id", insertable = false, updatable = false)
    @JsonIgnore
    private Warehouse sourceWarehouse;

    @Column(name = "source_area_id")
    private Long sourceAreaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_area_id", insertable = false, updatable = false)
    @JsonIgnore
    private Area sourceArea;

    @Column(name = "target_warehouse_id")
    private Long targetWarehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_warehouse_id", insertable = false, updatable = false)
    @JsonIgnore
    private Warehouse targetWarehouse;

    @Column(name = "target_area_id")
    private Long targetAreaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_area_id", insertable = false, updatable = false)
    @JsonIgnore
    private Area targetArea;

    @Column(name = "transfer_type")
    private Integer transferType;

    @Column(name = "transfer_date")
    private java.time.LocalDateTime transferDate;

    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "operator_id")
    private Long operatorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", insertable = false, updatable = false)
    @JsonIgnore
    private User operator;

    @Column(name = "approver_id")
    private Long approverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", insertable = false, updatable = false)
    @JsonIgnore
    private User approver;

    @Column(name = "approve_time")
    private java.time.LocalDateTime approveTime;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "create_time")
    private java.time.LocalDateTime createTime;

    @Column(name = "update_time")
    private java.time.LocalDateTime updateTime;
}