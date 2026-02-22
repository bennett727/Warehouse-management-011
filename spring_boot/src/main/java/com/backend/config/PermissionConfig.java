package com.backend.config;

import com.backend.enums.UserRole;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class PermissionConfig {

    public static final String PERMISSION_DEVICE_VIEW = "device:view";
    public static final String PERMISSION_DEVICE_CREATE = "device:create";
    public static final String PERMISSION_DEVICE_UPDATE = "device:update";
    public static final String PERMISSION_DEVICE_DELETE = "device:delete";
    public static final String PERMISSION_DEVICE_STATUS_CHANGE = "device:status:change";

    public static final String PERMISSION_INVENTORY_VIEW = "inventory:view";
    public static final String PERMISSION_INVENTORY_ADJUST = "inventory:adjust";
    public static final String PERMISSION_INVENTORY_AUDIT = "inventory:audit";

    public static final String PERMISSION_ORDER_VIEW = "order:view";
    public static final String PERMISSION_ORDER_CREATE = "order:create";
    public static final String PERMISSION_ORDER_AUDIT = "order:audit";
    public static final String PERMISSION_ORDER_EXECUTE = "order:execute";

    public static final String PERMISSION_APPROVAL_VIEW = "approval:view";
    public static final String PERMISSION_APPROVAL_CREATE = "approval:create";
    public static final String PERMISSION_APPROVAL_APPROVE = "approval:approve";
    public static final String PERMISSION_APPROVAL_REJECT = "approval:reject";

    public static final String PERMISSION_REMOTE_ACCOUNT_VIEW = "remote:account:view";
    public static final String PERMISSION_REMOTE_ACCOUNT_MANAGE = "remote:account:manage";
    public static final String PERMISSION_REMOTE_ACCOUNT_TEST = "remote:account:test";

    public static final String PERMISSION_MONITORING_VIEW = "monitoring:view";
    public static final String PERMISSION_MONITORING_MANAGE = "monitoring:manage";

    public static Set<String> getRolePermissions(UserRole role) {
        switch (role) {
            case ADMIN:
                return getAdminPermissions();
            case OPERATOR:
                return getOperatorPermissions();
            case TECHNICIAN:
                return getTechnicianPermissions();
            default:
                return new HashSet<>();
        }
    }

    private static Set<String> getAdminPermissions() {
        return new HashSet<>(Arrays.asList(
                PERMISSION_DEVICE_VIEW,
                PERMISSION_DEVICE_CREATE,
                PERMISSION_DEVICE_UPDATE,
                PERMISSION_DEVICE_DELETE,
                PERMISSION_DEVICE_STATUS_CHANGE,
                PERMISSION_INVENTORY_VIEW,
                PERMISSION_INVENTORY_ADJUST,
                PERMISSION_INVENTORY_AUDIT,
                PERMISSION_ORDER_VIEW,
                PERMISSION_ORDER_CREATE,
                PERMISSION_ORDER_AUDIT,
                PERMISSION_ORDER_EXECUTE,
                PERMISSION_APPROVAL_VIEW,
                PERMISSION_APPROVAL_CREATE,
                PERMISSION_APPROVAL_APPROVE,
                PERMISSION_APPROVAL_REJECT,
                PERMISSION_REMOTE_ACCOUNT_VIEW,
                PERMISSION_REMOTE_ACCOUNT_MANAGE,
                PERMISSION_REMOTE_ACCOUNT_TEST,
                PERMISSION_MONITORING_VIEW,
                PERMISSION_MONITORING_MANAGE
        ));
    }

    private static Set<String> getOperatorPermissions() {
        return new HashSet<>(Arrays.asList(
                PERMISSION_DEVICE_VIEW,
                PERMISSION_DEVICE_UPDATE,
                PERMISSION_DEVICE_STATUS_CHANGE,
                PERMISSION_INVENTORY_VIEW,
                PERMISSION_INVENTORY_ADJUST,
                PERMISSION_ORDER_VIEW,
                PERMISSION_ORDER_CREATE,
                PERMISSION_ORDER_EXECUTE,
                PERMISSION_APPROVAL_VIEW,
                PERMISSION_APPROVAL_APPROVE,
                PERMISSION_APPROVAL_REJECT,
                PERMISSION_REMOTE_ACCOUNT_VIEW,
                PERMISSION_REMOTE_ACCOUNT_TEST,
                PERMISSION_MONITORING_VIEW
        ));
    }

    private static Set<String> getTechnicianPermissions() {
        return new HashSet<>(Arrays.asList(
                PERMISSION_DEVICE_VIEW,
                PERMISSION_INVENTORY_VIEW,
                PERMISSION_ORDER_VIEW,
                PERMISSION_APPROVAL_VIEW,
                PERMISSION_APPROVAL_CREATE,
                PERMISSION_MONITORING_VIEW
        ));
    }
}