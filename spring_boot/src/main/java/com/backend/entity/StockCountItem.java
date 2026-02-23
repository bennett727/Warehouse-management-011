package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "stock_count_item",
       indexes = {
           @Index(name = "idx_count_item_stock_count", columnList = "stock_count_id"),
           @Index(name = "idx_count_item_device", columnList = "device_id"),
           @Index(name = "idx_count_item_bin", columnList = "bin_id")
       })
public class StockCountItem extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "stock_count_id", nullable = false)
    private Long stockCountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_count_id", insertable = false, updatable = false)
    @JsonIgnore
    private StockCount stockCount;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", insertable = false, updatable = false)
    @JsonIgnore
    private Device device;

    @Column(name = "device_code", length = 50)
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @Column(name = "bin_id")
    private Long binId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_id", insertable = false, updatable = false)
    @JsonIgnore
    private Bin bin;

    @Column(name = "bin_code", length = 50)
    private String binCode;

    @Column(name = "book_quantity", nullable = false)
    private Integer bookQuantity = 0;

    @Column(name = "actual_quantity")
    private Integer actualQuantity;

    @Column(name = "difference")
    private Integer difference;

    @Column(name = "difference_type")
    private Integer differenceType = 0;

    @Column(name = "difference_reason", length = 500)
    private String differenceReason;

    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "count_time")
    private LocalDateTime countTime;

    @Column(name = "counter_id")
    private Long counterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "counter_id", insertable = false, updatable = false)
    @JsonIgnore
    private User counter;

    @Column(name = "counter_name", length = 50)
    private String counterName;

    @Column(name = "remark", length = 500)
    private String remark;

    public void calculateDifference() {
        if (actualQuantity != null && bookQuantity != null) {
            this.difference = actualQuantity - bookQuantity;
            if (difference > 0) {
                this.differenceType = 1;
            } else if (difference < 0) {
                this.differenceType = 2;
            } else {
                this.differenceType = 0;
            }
        }
    }

    public boolean isCounted() {
        return actualQuantity != null && status >= 1;
    }

    public boolean hasDifference() {
        return difference != null && difference != 0;
    }
}
