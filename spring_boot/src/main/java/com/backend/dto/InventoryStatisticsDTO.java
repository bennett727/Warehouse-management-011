package com.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public class InventoryStatisticsDTO {

    private Long totalDevices;

    private Long totalStockItems;

    private Integer totalQuantity;

    private BigDecimal totalValue;

    private Long lowStockItems;

    private Long overStockItems;

    private Map<String, Long> devicesByStatus;

    private Map<String, Long> devicesByType;

    private Map<String, Long> stockByWarehouse;

    private Map<String, Long> stockByArea;

    public Long getTotalDevices() {
        return totalDevices;
    }

    public void setTotalDevices(Long totalDevices) {
        this.totalDevices = totalDevices;
    }

    public Long getTotalStockItems() {
        return totalStockItems;
    }

    public void setTotalStockItems(Long totalStockItems) {
        this.totalStockItems = totalStockItems;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public Long getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(Long lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public Long getOverStockItems() {
        return overStockItems;
    }

    public void setOverStockItems(Long overStockItems) {
        this.overStockItems = overStockItems;
    }

    public Map<String, Long> getDevicesByStatus() {
        return devicesByStatus;
    }

    public void setDevicesByStatus(Map<String, Long> devicesByStatus) {
        this.devicesByStatus = devicesByStatus;
    }

    public Map<String, Long> getDevicesByType() {
        return devicesByType;
    }

    public void setDevicesByType(Map<String, Long> devicesByType) {
        this.devicesByType = devicesByType;
    }

    public Map<String, Long> getStockByWarehouse() {
        return stockByWarehouse;
    }

    public void setStockByWarehouse(Map<String, Long> stockByWarehouse) {
        this.stockByWarehouse = stockByWarehouse;
    }

    public Map<String, Long> getStockByArea() {
        return stockByArea;
    }

    public void setStockByArea(Map<String, Long> stockByArea) {
        this.stockByArea = stockByArea;
    }
}
