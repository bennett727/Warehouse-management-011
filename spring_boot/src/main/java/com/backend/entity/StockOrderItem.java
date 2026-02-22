package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

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
 * 库存订单项实体
 *
 * 设计说明：
 * 1. 本实体只存储库存流转的基础信息和业务记录关联ID
 * 2. 详细的安装/维修/保养/报废信息存储在对应的业务记录表中
 * 3. 通过关联ID建立一对一关系，避免数据冗余
 *
 * @author 开发团队
 * @since 2026-02-13
 */
@Getter
@Setter
@Entity
@Table(name = "stock_order_item", indexes = {
        @Index(name = "idx_item_order", columnList = "stock_order_id"),
        @Index(name = "idx_item_device", columnList = "device_id"),
        @Index(name = "idx_item_install", columnList = "installation_record_id"),
        @Index(name = "idx_item_repair", columnList = "repair_record_id"),
        @Index(name = "idx_item_scrap", columnList = "scrap_record_id")
})
public class StockOrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_order_id", nullable = false)
    @JsonIgnore
    private StockOrder stockOrder;

    @Column(name = "stock_order_id", insertable = false, updatable = false)
    private Long stockOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private Long deviceId;

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
    @JoinColumn(name = "batch_id")
    @JsonIgnore
    private Batch batch;

    @Column(name = "batch_id", insertable = false, updatable = false)
    private Long batchId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "actual_quantity")
    private Integer actualQuantity;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "remark", length = 255)
    private String remark;

    // ==================== 业务记录关联ID ====================
    // 通过关联ID查询详细的业务信息，避免数据冗余

    /**
     * 关联安装记录ID
     * 当出库类型为安装出库时，自动创建安装记录并关联
     */
    @Column(name = "installation_record_id")
    private Long installationRecordId;

    /**
     * 关联维修记录ID
     * 当出库类型为维修出库时，自动创建维修记录并关联
     */
    @Column(name = "repair_record_id")
    private Long repairRecordId;

    /**
     * 关联保养记录ID
     * 当出库类型为保养出库时，自动创建保养记录并关联
     */
    @Column(name = "maintenance_record_id")
    private Long maintenanceRecordId;

    /**
     * 关联报废记录ID
     * 当出库类型为报废出库时，自动创建报废记录并关联
     */
    @Column(name = "scrap_record_id")
    private Long scrapRecordId;

    // ==================== 便捷方法 ====================

    /**
     * 获取业务记录ID（根据出库类型自动判断）
     * @param orderType 出库类型
     * @return 对应的业务记录ID
     */
    public Long getBusinessRecordId(Integer orderType) {
        if (orderType == null) return null;
        switch (orderType) {
            case 1: return installationRecordId;  // 安装出库
            case 2: return repairRecordId;        // 维修出库
            case 3: return maintenanceRecordId;   // 保养出库
            case 4: return scrapRecordId;         // 报废出库
            default: return null;
        }
    }

    /**
     * 设置业务记录ID（根据出库类型自动判断）
     * @param orderType 出库类型
     * @param recordId 业务记录ID
     */
    public void setBusinessRecordId(Integer orderType, Long recordId) {
        if (orderType == null) return;
        switch (orderType) {
            case 1: this.installationRecordId = recordId; break;
            case 2: this.repairRecordId = recordId; break;
            case 3: this.maintenanceRecordId = recordId; break;
            case 4: this.scrapRecordId = recordId; break;
        }
    }

    /**
     * 是否有关联的业务记录
     */
    public boolean hasBusinessRecord() {
        return installationRecordId != null ||
               repairRecordId != null ||
               maintenanceRecordId != null ||
               scrapRecordId != null;
    }
}
