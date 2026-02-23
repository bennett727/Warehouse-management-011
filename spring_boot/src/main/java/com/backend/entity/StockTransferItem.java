package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "stock_transfer_item",
       indexes = {
           @Index(name = "idx_transfer_item_transfer", columnList = "transfer_id"),
           @Index(name = "idx_transfer_item_device", columnList = "device_id"),
           @Index(name = "idx_transfer_item_source_bin", columnList = "source_bin_id"),
           @Index(name = "idx_transfer_item_target_bin", columnList = "target_bin_id")
       })
public class StockTransferItem extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "transfer_id", nullable = false)
    private Long transferId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", insertable = false, updatable = false)
    @JsonIgnore
    private transient StockTransfer transfer;

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

    @Column(name = "source_bin_id")
    private Long sourceBinId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_bin_id", insertable = false, updatable = false)
    @JsonIgnore
    private Bin sourceBin;

    @Column(name = "source_bin_code", length = 50)
    private String sourceBinCode;

    @Column(name = "target_bin_id")
    private Long targetBinId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_bin_id", insertable = false, updatable = false)
    @JsonIgnore
    private Bin targetBin;

    @Column(name = "target_bin_code", length = 50)
    private String targetBinCode;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "status")
    private Integer status = 0;

    @Column(name = "transfer_time")
    private java.time.LocalDateTime transferTime;

    @Column(name = "remark", length = 500)
    private String remark;

    public boolean isTransferred() {
        return status != null && status >= 1;
    }
}
