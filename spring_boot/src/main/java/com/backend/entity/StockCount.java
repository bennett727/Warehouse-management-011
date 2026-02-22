package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "stock_count")
public class StockCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "count_no", nullable = false, unique = true, length = 50)
    private String countNo;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    @JsonIgnore
    private Warehouse warehouse;

    @Column(name = "area_id")
    private Long areaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", insertable = false, updatable = false)
    @JsonIgnore
    private Area area;

    @Column(name = "count_type")
    private Integer countType;

    @Column(name = "count_date")
    private java.time.LocalDateTime countDate;

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