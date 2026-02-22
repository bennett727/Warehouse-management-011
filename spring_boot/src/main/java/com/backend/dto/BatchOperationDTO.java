package com.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class BatchOperationDTO {
    
    @NotNull(message = "操作类型不能为空")
    private Integer operationType;
    
    @NotEmpty(message = "区域ID列表不能为空")
    private List<Long> areaIds;
    
    private Integer targetStatus;
    
    private String remark;
}