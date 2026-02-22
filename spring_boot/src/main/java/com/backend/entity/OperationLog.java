package com.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "operation_log", indexes = {
        @Index(name = "idx_log_user", columnList = "user_id"),
        @Index(name = "idx_log_time", columnList = "create_time")
})
public class OperationLog extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "operation", length = 100)
    private String operation;

    @Column(name = "method", length = 255)
    private String method;

    @Column(name = "params", columnDefinition = "TEXT")
    private String params;

    @Column(name = "ip", length = 50)
    private String ip;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "execute_time")
    private Integer executeTime;

    @Column(name = "status")
    private Integer status;

    @Column(name = "error_msg", columnDefinition = "TEXT")
    private String errorMsg;
}
