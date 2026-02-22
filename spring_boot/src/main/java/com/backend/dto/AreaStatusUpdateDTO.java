package com.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class AreaStatusUpdateDTO {
    
    @NotNull(message = "状态不能为空")
    private Integer status;
    
    private List<Long> areaIds;
}