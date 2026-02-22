package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "inventory",
       indexes = {
           @Index(name = "idx_inventory_device", columnList = "device_id"),
           @Index(name = "idx_inventory_bin", columnList = "bin_id"),
           @Index(name = "idx_inventory_batch", columnList = "batch_no"),
           @Index(name = "idx_inventory_status", columnList = "status")
       })
public class Inventory extends BaseEntity {

    @NotNull(message = "设备不能为空")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @NotNull(message = "货位不能为空")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_id", nullable = false)
    @JsonIgnore
    private Bin bin;

    @NotNull(message = "数量不能为空")
    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "batch_no", length = 50)
    private String batchNo;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "production_date")
    private java.time.LocalDate productionDate;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @NotNull(message = "状态不能为空")
    @Column(nullable = false)
    private Integer status = 1;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    @Column(length = 500)
    private String remark;

    @Column(name = "min_stock")
    private Integer minStock;

    @Column(name = "max_stock")
    private Integer maxStock;

    @Column(name = "safety_stock")
    private Integer safetyStock;

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public Bin getBin() {
        return bin;
    }

    public void setBin(Bin bin) {
        this.bin = bin;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getBatchNo() {
        return batchNo;
    }

    public void setBatchNo(String batchNo) {
        this.batchNo = batchNo;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public java.time.LocalDate getProductionDate() {
        return productionDate;
    }

    public void setProductionDate(java.time.LocalDate productionDate) {
        this.productionDate = productionDate;
    }

    public java.time.LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(java.time.LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public Integer getMaxStock() {
        return maxStock;
    }

    public void setMaxStock(Integer maxStock) {
        this.maxStock = maxStock;
    }

    public Integer getSafetyStock() {
        return safetyStock;
    }

    public void setSafetyStock(Integer safetyStock) {
        this.safetyStock = safetyStock;
    }
}
