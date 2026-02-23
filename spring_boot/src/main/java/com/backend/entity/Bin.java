package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bin", indexes = {
        @Index(name = "idx_bin_area", columnList = "area_id"),
        @Index(name = "idx_bin_code", columnList = "code")
})
public class Bin extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    @JsonIgnore
    private Area area;

    @Column(name = "area_id", insertable = false, updatable = false)
    private Long areaId;

    @Column(name = "row_no", length = 10)
    private String rowNo;

    @Column(name = "column_no", length = 10)
    private String columnNo;

    @Column(name = "level_no", length = 10)
    private String levelNo;

    @Column(name = "capacity")
    private Integer capacity = 0;

    @Column(name = "used_capacity")
    private Integer usedCapacity = 0;

    @Column(name = "status")
    private Integer status = 1;
}
