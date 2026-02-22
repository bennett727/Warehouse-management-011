package com.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class AreaUpdateDTO {
    
    @NotBlank(message = "区域编码不能为空")
    private String code;
    
    @NotBlank(message = "区域名称不能为空")
    private String name;
    
    private String city;
    
    private String district;
    
    private String location;
    
    private Integer level;
    
    private Long parentId;
    
    private Long warehouseId;
    
    private Long areaTypeId;
    
    private Integer status;
    
    private Integer capacity;
    
    private String remark;
}