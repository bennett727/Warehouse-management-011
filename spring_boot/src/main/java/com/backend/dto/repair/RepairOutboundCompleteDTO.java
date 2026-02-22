package com.backend.dto.repair;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 修复完成入库数据传输对象
 */
@Data
public class RepairOutboundCompleteDTO {

    /**
     * 修复结果
     */
    private String repairResult;

    /**
     * 实际修复费用
     */
    private BigDecimal actualCost;

    /**
     * 修复后图片列表
     */
    private List<String> repairImages;

    /**
     * 入库货位ID
     */
    private Long binId;

    /**
     * 备注
     */
    private String remark;
}
