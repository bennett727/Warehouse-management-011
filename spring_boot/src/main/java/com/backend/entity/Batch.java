package com.backend.entity;

import java.time.LocalDate;
import java.time.Period;

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
@Table(name = "batch",
       indexes = {
           @Index(name = "idx_batch_no", columnList = "batch_no"),
           @Index(name = "idx_batch_device", columnList = "device_id"),
           @Index(name = "idx_batch_supplier", columnList = "supplier_id"),
           @Index(name = "idx_batch_expiry", columnList = "expiry_date"),
           @Index(name = "idx_batch_status", columnList = "status")
       })
public class Batch extends BaseEntity {

    @Column(name = "batch_no", nullable = false, unique = true, length = 50)
    private String batchNo;

    @Column(name = "batch_name", length = 100)
    private String batchName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    @Column(name = "supplier_id", insertable = false, updatable = false)
    private Long supplierId;

    @Column(name = "production_date")
    private LocalDate productionDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "quantity")
    private Integer quantity = 0;

    @Column(name = "available_quantity")
    private Integer availableQuantity = 0;

    @Column(name = "locked_quantity")
    private Integer lockedQuantity = 0;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private java.math.BigDecimal unitPrice;

    @Column(name = "status")
    private Integer status = 1;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "warehouse_name", length = 100)
    private String warehouseName;

    public boolean isExpired() {
        return expiryDate != null && LocalDate.now().isAfter(expiryDate);
    }

    public boolean isNearExpiry(int days) {
        if (expiryDate == null) {
            return false;
        }
        LocalDate warningDate = LocalDate.now().plusDays(days);
        return !expiryDate.isAfter(warningDate) && !isExpired();
    }

    public Integer getDaysUntilExpiry() {
        if (expiryDate == null) {
            return null;
        }
        return Period.between(LocalDate.now(), expiryDate).getDays();
    }

    public Integer getShelfLifeDays() {
        if (productionDate == null || expiryDate == null) {
            return null;
        }
        return Period.between(productionDate, expiryDate).getDays();
    }

    public boolean hasAvailableStock() {
        return availableQuantity != null && availableQuantity > 0;
    }

    public void lockQuantity(Integer quantity) {
        if (availableQuantity >= quantity) {
            this.availableQuantity -= quantity;
            this.lockedQuantity = (this.lockedQuantity == null ? 0 : this.lockedQuantity) + quantity;
        }
    }

    public void unlockQuantity(Integer quantity) {
        if (lockedQuantity >= quantity) {
            this.lockedQuantity -= quantity;
            this.availableQuantity = (this.availableQuantity == null ? 0 : this.availableQuantity) + quantity;
        }
    }

    public void consumeLockedQuantity(Integer quantity) {
        if (lockedQuantity >= quantity) {
            this.lockedQuantity -= quantity;
            this.quantity -= quantity;
        }
    }
}
