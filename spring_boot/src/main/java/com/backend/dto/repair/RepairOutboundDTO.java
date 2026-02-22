package com.backend.dto.repair;

import lombok.Data;

import java.util.List;

/**
 * 修复出库数据传输对象
 * 用于创建修复出库单
 */
@Data
public class RepairOutboundDTO {

    /**
     * 设备ID
     */
    private Long deviceId;

    /**
     * 修复人员ID
     */
    private Long repairPersonId;

    /**
     * 出库人员ID
     */
    private Long operatorId;

    /**
     * 故障描述
     */
    private String faultDescription;

    /**
     * 故障图片列表
     */
    private List<String> faultImages;

    /**
     * 预计修复天数
     */
    private Integer estimatedDays;

    /**
     * 修复地点（INTERNAL-内部，EXTERNAL-外部）
     */
    private String repairLocation;

    /**
     * 外部维修单位
     */
    private String repairVendor;

    /**
     * 备注
     */
    private String remark;
}
