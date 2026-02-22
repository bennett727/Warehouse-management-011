package com.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class AreaStatusSingleUpdateDTO {
    
    @NotNull(message = "状态不能为空")
    private Integer status;
}