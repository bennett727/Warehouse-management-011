package com.backend.constants;

public class ApiPathConstants {
    
    public static final String API_PREFIX = "/api";
    
    public static class SystemApi {
        public static final String AREAS = API_PREFIX + "/areas";
        public static final String DEVICES = API_PREFIX + "/devices";
        public static final String WAREHOUSES = API_PREFIX + "/warehouses";
        public static final String USERS = API_PREFIX + "/users";
        public static final String ROLES = API_PREFIX + "/roles";
        public static final String STOCK_ORDERS = API_PREFIX + "/stock-orders";
        public static final String RECORDS = API_PREFIX + "/records";
        public static final String DASHBOARD = API_PREFIX + "/dashboard";
    }
    
    public static class DeviceApi {
        public static final String BASE = API_PREFIX + "/devices";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
    }
    
    public static class AreaApi {
        public static final String BASE = API_PREFIX + "/areas";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
    }
    
    public static class WarehouseApi {
        public static final String BASE = API_PREFIX + "/warehouses";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
    }
    
    public static class UserApi {
        public static final String BASE = API_PREFIX + "/users";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
    }
    
    public static class RoleApi {
        public static final String BASE = API_PREFIX + "/roles";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
    }
    
    public static class StockOrderApi {
        public static final String BASE = API_PREFIX + "/stock-orders";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
    }
    
    public static class RecordApi {
        public static final String BASE = API_PREFIX + "/records";
        public static final String INSTALLATION = BASE + "/installation";
        public static final String REPAIR = BASE + "/repair";
        public static final String MAINTENANCE = BASE + "/maintenance";
        public static final String STATISTICS = BASE + "/statistics";
    }
    
    public static class DashboardApi {
        public static final String BASE = API_PREFIX + "/dashboard";
        public static final String OVERVIEW = BASE + "/overview";
        public static final String ACTIVITIES = BASE + "/activities";
        public static final String STATISTICS = BASE + "/statistics";
    }

    public static class DeviceStatusTransitionRuleApi {
        public static final String BASE = API_PREFIX + "/device-status-transition-rules";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String BY_DEVICE_TYPE = BASE + "/device-type/{deviceTypeId}";
        public static final String VALIDATE = BASE + "/validate";
        public static final String VALIDATE_TRANSITION = BASE + "/validate-transition";
        public static final String AVAILABLE_TARGET_STATUSES = BASE + "/available-target-statuses";
        public static final String BATCH_DELETE = BASE + "/batch";
    }

    public static class DeviceStatusApprovalApi {
        public static final String BASE = API_PREFIX + "/device-status-approvals";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String PENDING = BASE + "/pending";
        public static final String MY = BASE + "/my";
        public static final String APPROVE = BASE + "/{id}/approve";
        public static final String REJECT = BASE + "/{id}/reject";
        public static final String CANCEL = BASE + "/{id}/cancel";
        public static final String BATCH = BASE + "/batch";
        public static final String STATS = BASE + "/stats";
    }

    public static class InventoryAdjustmentApi {
        public static final String BASE = API_PREFIX + "/inventory/adjustment";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String APPROVE = BASE + "/{id}/approve";
    }

    public static class RemoteAccountApi {
        public static final String BASE = API_PREFIX + "/remote-accounts";
        public static final String LIST = BASE;
        public static final String DETAIL = BASE + "/{id}";
        public static final String CREATE = BASE;
        public static final String UPDATE = BASE + "/{id}";
        public static final String DELETE = BASE + "/{id}";
        public static final String TEST_CONNECTION = BASE + "/{id}/test";
    }

    public static class MonitoringApi {
        public static final String ERROR_REPORT = "/error-report";
        public static final String PERFORMANCE_REPORT = "/performance-report";
    }

    public static class ExcelApi {
        public static final String BASE = API_PREFIX + "/excel";
        public static final String DEVICE_EXPORT = BASE + "/devices/export";
        public static final String INVENTORY_EXPORT = BASE + "/inventory/export";
        public static final String COMPREHENSIVE_EXPORT = BASE + "/comprehensive/export";
    }
}