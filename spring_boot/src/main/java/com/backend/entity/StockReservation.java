package com.backend.entity;

import java.time.LocalDateTime;

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
@Table(name = "stock_reservation", indexes = {
        @Index(name = "idx_device_id", columnList = "device_id"),
        @Index(name = "idx_order_id", columnList = "order_id"),
        @Index(name = "idx_reservation_status", columnList = "status"),
        @Index(name = "idx_expire_time", columnList = "expire_time")
})
public class StockReservation extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "order_no", length = 50)
    private String orderNo;

    @Column(name = "order_item_id")
    private Long orderItemId;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity;

    @Column(name = "status", nullable = false)
    private Integer status = 0;

    @Column(name = "reservation_type", length = 20)
    private String reservationType = "OUTBOUND";

    @Column(name = "expire_time")
    private LocalDateTime expireTime;

    @Column(name = "released_time")
    private LocalDateTime releasedTime;

    @Column(name = "released_quantity")
    private Integer releasedQuantity = 0;

    @Column(name = "remark", length = 500)
    private String remark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", insertable = false, updatable = false)
    @JsonIgnore
    private Device device;

    public static final int STATUS_ACTIVE = 0;
    public static final int STATUS_RELEASED = 1;
    public static final int STATUS_CONVERTED = 2;
    public static final int STATUS_EXPIRED = 3;

    public boolean isActive() {
        return status == STATUS_ACTIVE;
    }

    public boolean isExpired() {
        return expireTime != null && LocalDateTime.now().isAfter(expireTime);
    }

    public boolean canRelease() {
        return isActive() || status == STATUS_EXPIRED;
    }
}
