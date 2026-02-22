package com.backend.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AreaVO {
    private Long id;
    private String code;
    private String name;
    private String city;
    private String district;
    private String location;
    private Integer level;
    private Long parentId;
    private String parentName;
    private Long warehouseId;
    private String warehouseName;
    private Long areaTypeId;
    private String areaTypeName;
    private Integer status;
    private String statusName;
    private Integer capacity;
    private Integer currentCapacity;
    private String remark;
    private Integer sort;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}