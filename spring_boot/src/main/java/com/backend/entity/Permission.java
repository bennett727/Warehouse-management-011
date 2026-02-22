package com.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sys_permission")
public class Permission extends BaseEntity {

    @Column(name = "parent_id")
    private Long parentId = 0L;

    @Column(name = "permission_name", nullable = false, length = 50)
    private String permissionName;

    @Column(name = "permission_code", nullable = false, length = 100)
    private String permissionCode;

    @Column(name = "type", length = 20)
    private String type;

    @Column(name = "path", length = 255)
    private String path;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "status")
    private Integer status = 1;
}
