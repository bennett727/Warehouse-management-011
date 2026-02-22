package com.backend.dto.repair;

import lombok.Data;

import java.util.List;

/**
 * 修复进度更新数据传输对象
 */
@Data
public class RepairOutboundProgressDTO {

    /**
     * 修复状态
     * 1-已出库，2-修复中，3-修复完成
     */
    private Integer status;

    /**
     * 进度描述
     */
    private String progress;

    /**
     * 进度图片列表
     */
    private List<String> images;

    /**
     * 备注
     */
    private String remark;
}
