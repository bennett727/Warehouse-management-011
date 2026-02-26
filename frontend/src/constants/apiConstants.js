/*
 * @file: apiConstants.js
 * @description: API路径常量集中管理，统一管理所有前端API路径
 * @author: 开发团队
 * @createTime: 2026-02-01
 * @version: 2.0
 * @update: 统一API路径规范，修复路径不一致问题
 */

/**
 * API基础路径常量
 *
 * 重要说明：
 * 1. 根据项目规范，前端API路径不包含/api前缀，由Vite代理自动添加
 * 2. context-path已经在application.properties中配置为/api
 * 3. Vite代理会匹配以/api开头的请求，将其转发到后端http://localhost:8080
 * 4. 监控API（PERFORMANCE_REPORT、ERROR_REPORT）使用相对路径，不经过request.js
 *
 * 路径映射示例：
 * - 前端：/devices/list
 * - Vite代理：/devices/list -> http://localhost:8080/api/devices/list
 * - 后端context-path：/api
 * - 后端Controller：@RequestMapping("/devices") + @GetMapping("/list")
 * - 实际访问路径：http://localhost:8080/api/devices/list
 */
export const API_BASE = '';

/**
 * API版本常量
 */
export const API_V1 = '/v1';

// ==================== 认证相关路径 ====================
export const AUTH_API = {
  BASE: `${API_BASE}/auth`,
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  INFO: `${API_BASE}/auth/info`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
  TOKEN: `${API_BASE}/auth/token`,
};

// ==================== 设备相关路径 ====================
/**
 * 设备管理API路径
 * 与后端DeviceController保持一致
 * 后端路径前缀: /api/devices
 */
export const DEVICE_API = {
  BASE: `${API_BASE}/devices`,
  // 基础CRUD接口
  LIST: `${API_BASE}/devices`, // GET - 与后端一致，使用分页参数
  DETAIL: (deviceId) => `${API_BASE}/devices/${deviceId}`, // 参数名改为deviceId与后端一致
  CREATE: `${API_BASE}/devices`, // POST
  UPDATE: (deviceId) => `${API_BASE}/devices/${deviceId}`, // PUT - 参数名改为deviceId与后端一致
  DELETE: (deviceId) => `${API_BASE}/devices/${deviceId}`, // DELETE - 参数名改为deviceId与后端一致

  // 批量操作接口
  BATCH_DELETE: `${API_BASE}/devices/batch/delete`, // POST - 与后端一致
  BATCH_STATUS: `${API_BASE}/devices/batch/status`, // POST - 与后端一致

  // 设备状态管理接口
  STATUS: `${API_BASE}/devices/status`,
  STATUS_UPDATE: (deviceId) => `${API_BASE}/devices/${deviceId}/status`, // POST - 参数名改为deviceId
  STATUS_TRANSITIONS: (deviceId) => `${API_BASE}/devices/${deviceId}/transitions`, // GET - 新增：获取允许的状态流转

  // 统计和检查接口
  STATISTICS_STATUS: `${API_BASE}/devices/statistics/status`, // GET - 与后端一致
  CHECK_CODE: `${API_BASE}/devices/check-code`, // GET - 修正路径与后端一致

  // 设备历史记录接口
  HISTORY: (deviceId) => `${API_BASE}/devices/${deviceId}/history`, // GET - 新增：获取设备历史记录

  // 导入导出
  IMPORT: `${API_BASE}/devices/import`,
  EXPORT: `${API_BASE}/devices/export`,

  // 设备类型
  TYPE: `${API_BASE}/system/device-types`,
  TYPE_ALL: `${API_BASE}/system/device-types/all`,
  TYPE_TREE: `${API_BASE}/system/device-types/tree`,
  TYPE_STATS: `${API_BASE}/system/device-types/stats`,
  TYPE_SUMMARY: `${API_BASE}/system/device-types/summary`,
  TYPE_IMPORT: `${API_BASE}/system/device-types/import`,
  TYPE_EXPORT: `${API_BASE}/system/device-types/export`,

  // 设备查询（扩展接口）
  BY_AREA: `${API_BASE}/devices/by-area`,
  BY_CONDITION: `${API_BASE}/devices/by-condition`,
  ALL: `${API_BASE}/devices/all`,
  CHECK_SERIAL_NUMBER: `${API_BASE}/devices/check-serial-number`,
  CHECK_DEVICE_CODE: `${API_BASE}/devices/check-code`,
  BY_CODE: (deviceCode) => `${API_BASE}/devices/code/${deviceCode}`, // 参数名改为deviceCode与后端一致

  // 报废相关
  BATCH_SCRAP: `${API_BASE}/devices/batch/scrap`,
  SCRAP_RECORDS: `${API_BASE}/devices/scrap-records`,
  BATCH_AREA: `${API_BASE}/devices/batch/area`,
  ALERTS: `${API_BASE}/devices/alerts`,
  SCRAP: `${API_BASE}/devices/scrap`,
  SCRAP_LIST: `${API_BASE}/devices/scrap/list`,
  SCRAP_DETAIL: (deviceId) => `${API_BASE}/devices/scrap/${deviceId}`,
  SCRAP_APPROVE: (deviceId) => `${API_BASE}/devices/scrap/${deviceId}/approve`,
  SCRAP_REJECT: (deviceId) => `${API_BASE}/devices/scrap/${deviceId}/reject`,
  SCRAP_EXPORT: `${API_BASE}/devices/scrap/export`,

  // 附件
  ATTACHMENT_DOWNLOAD: (id) => `${API_BASE}/attachments/${id}/download`,
  ATTACHMENT_DELETE: (id) => `${API_BASE}/attachments/${id}`,
};

// ==================== 设备状态相关路径 ====================
export const DEVICE_STATUS_API = {
  UPDATE: (id) => `${API_BASE}/devices/${id}/status`,
  LIST: `${API_BASE}/devices/status`,
  STATS_STATUS: `${API_BASE}/devices/stats/status`,
  MARK_FAULTY: `${API_BASE}/devices/mark-faulty`,
};

// ==================== 设备状态转换规则相关路径 ====================
export const DEVICE_STATUS_TRANSITION_RULE_API = {
  BASE: `${API_BASE}/device-status-transition-rules`,
  LIST: `${API_BASE}/device-status-transition-rules`,
  BY_DEVICE_TYPE: (deviceTypeId) => `${API_BASE}/device-status-transition-rules/device-type/${deviceTypeId}`,
  DETAIL: (ruleId) => `${API_BASE}/device-status-transition-rules/${ruleId}`,
  BATCH_DELETE: `${API_BASE}/device-status-transition-rules/batch`,
  VALIDATE: `${API_BASE}/device-status-transition-rules/validate`,
  VALIDATE_TRANSITION: `${API_BASE}/device-status-transition-rules/validate-transition`,
  AVAILABLE_TARGET_STATUSES: `${API_BASE}/device-status-transition-rules/available-target-statuses`,
  ENABLED_BY_DEVICE_TYPE: (deviceTypeId) =>
    `${API_BASE}/device-status-transition-rules/enabled-by-device-type/${deviceTypeId}`,
};

// ==================== 设备状态变更审批相关路径 ====================
export const DEVICE_STATUS_APPROVAL_API = {
  BASE: `${API_BASE}/device-status-approvals`,
  LIST: `${API_BASE}/device-status-approvals`,
  PENDING: `${API_BASE}/device-status-approvals/pending`,
  MY: `${API_BASE}/device-status-approvals/my`,
  DETAIL: (approvalId) => `${API_BASE}/device-status-approvals/${approvalId}`,
  APPROVE: (approvalId) => `${API_BASE}/device-status-approvals/${approvalId}/approve`,
  REJECT: (approvalId) => `${API_BASE}/device-status-approvals/${approvalId}/reject`,
  CANCEL: (approvalId) => `${API_BASE}/device-status-approvals/${approvalId}/cancel`,
  BATCH: `${API_BASE}/device-status-approvals/batch`,
  STATS: `${API_BASE}/device-status-approvals/stats`,
};

// ==================== 设备状态跟踪相关路径 ====================
export const DEVICE_STATUS_TRACKING_API = {
  BASE: `${API_BASE}/device-status-tracking`,
  LIST: `${API_BASE}/device-status-tracking`,
  DETAIL: (id) => `${API_BASE}/device-status-tracking/${id}`,
  CREATE: `${API_BASE}/device-status-tracking`,
};

// ==================== 设备同步相关路径 ====================
export const DEVICE_SYNC_API = {
  BASE: `${API_BASE}/devices/sync`,
  SYNC: `${API_BASE}/devices/sync`,
};

// ==================== 库存相关路径 ====================
export const INVENTORY_API = {
  BASE: `${API_BASE}/inventory`,
  LIST: `${API_BASE}/inventory/list`,
  DETAIL: (id) => `${API_BASE}/inventory/${id}`,
  CREATE: `${API_BASE}/inventory`,
  UPDATE: (id) => `${API_BASE}/inventory/${id}`,
  DELETE: (id) => `${API_BASE}/inventory/${id}`,
  // 批次
  BATCH: `${API_BASE}/batches`,
  BATCH_CODE: (code) => `${API_BASE}/batches/code/${code}`,
  BATCH_DEVICE: (deviceId) => `${API_BASE}/batches/device/${deviceId}`,
  BATCH_CHECK_CODE: `${API_BASE}/batches/check-code`,
  BATCH_STATISTICS: `${API_BASE}/batches/statistics`,
  BATCH_EXPIRING_SOON: `${API_BASE}/batches/expiring-soon`,
  BATCH_EXPIRED: `${API_BASE}/batches/expired`,
  BATCH_FREEZE: (id) => `${API_BASE}/batches/${id}/freeze`,
  BATCH_UNFREEZE: (id) => `${API_BASE}/batches/${id}/unfreeze`,
  BATCH_TRANSFER: (id) => `${API_BASE}/batches/${id}/transfer`,
  // 盘点和调拨
  STOCK_COUNT: `${API_BASE}/stock-count`,
  STOCK_TRANSFER: `${API_BASE}/stock-transfer`,
  // 库存订单 - 统一使用/orders路径
  STOCK_ORDERS: `${API_BASE}/orders`,
  STOCK_ORDERS_INBOUND: `${API_BASE}/orders`,
  STOCK_ORDERS_OUTBOUND: `${API_BASE}/orders`,
  // 预警配置
  ALERT_CONFIG: `${API_BASE}/alert-config`,
  ALERT_THRESHOLD: `${API_BASE}/alert-threshold`,
  EXPORT: `${API_BASE}/inventory/export`,
  STOCK_ORDER: `${API_BASE}/inventory/stock-order`,
  // 库存调整
  ADJUSTMENT_CREATE: `${API_BASE}/inventory/adjustment`,
  ADJUSTMENT_APPROVE: (adjustmentId) => `${API_BASE}/inventory/adjustment/${adjustmentId}/approve`,
  ADJUSTMENT_LIST: `${API_BASE}/inventory/adjustment`,
  ADJUSTMENT_DETAIL: (adjustmentId) => `${API_BASE}/inventory/adjustment/${adjustmentId}`,
  // 库存记录
  RECORDS_ALL: `${API_BASE}/inventory/records/all`,
  RECORDS_STATISTICS: `${API_BASE}/inventory/records/statistics`,
  // 修复出库
  REPAIR_OUTBOUND: `${API_BASE}/inventory/repair-outbound`,
  REPAIR_OUTBOUND_LIST: `${API_BASE}/inventory/repair-outbound`,
  REPAIR_OUTBOUND_DETAIL: (id) => `${API_BASE}/inventory/repair-outbound/${id}`,
  REPAIR_OUTBOUND_PROGRESS: (id) => `${API_BASE}/inventory/repair-outbound/${id}/progress`,
  REPAIR_OUTBOUND_COMPLETE: (id) => `${API_BASE}/inventory/repair-outbound/${id}/complete`,
  REPAIR_OUTBOUND_CANCEL: (id) => `${API_BASE}/inventory/repair-outbound/${id}/cancel`,
  REPAIR_STATISTICS: `${API_BASE}/inventory/repair-statistics`,
};

// ==================== 库存订单统一API路径 ====================
// 注意：与后端StockOrderController的@RequestMapping("/orders")保持一致
// 统一使用此常量，废弃 INVENTORY_API 中的重复定义
export const STOCK_ORDERS_UNIFIED_API = {
  BASE: `${API_BASE}/orders`,
  GENERATE_NO: `${API_BASE}/orders/generate-order-no`,
  SAVE: `${API_BASE}/orders`,
  LIST: `${API_BASE}/orders`,
  DETAIL: (id) => `${API_BASE}/orders/${id}`,
  UPDATE: (id) => `${API_BASE}/orders/${id}`,
  DELETE: (id) => `${API_BASE}/orders/${id}`,
  BATCH_DELETE: `${API_BASE}/orders/batch/cancel`,
  AUDIT: (id) => `${API_BASE}/orders/${id}/approve`,
  BATCH_AUDIT: `${API_BASE}/orders/batch/audit`,
  EXPORT: `${API_BASE}/orders/export`,
  STATISTICS: `${API_BASE}/orders/statistics`,
  VALIDATE_INVENTORY: `${API_BASE}/orders/validate-inventory`,
  SUBMIT: (id) => `${API_BASE}/orders/${id}/submit`,
  EXECUTE: (id) => `${API_BASE}/orders/${id}/execute`,
  CANCEL: (id) => `${API_BASE}/orders/${id}/cancel`,
  ITEMS: (id) => `${API_BASE}/orders/${id}/items`,
  BY_NO: (orderNo) => `${API_BASE}/orders/no/${orderNo}`,
  // 入库单专用
  INBOUND_EXPORT: `${API_BASE}/orders/export`,
  INBOUND_COMPLETE: (id) => `${API_BASE}/orders/${id}/execute`,
  INBOUND_SAVE_WITH_DEVICE: `${API_BASE}/orders`,
  // 出库单专用
  OUTBOUND_EXPORT: `${API_BASE}/orders/export`,
  OUTBOUND_COMPLETE: (id) => `${API_BASE}/orders/${id}/execute`,
};

// ==================== 入库单相关API路径（已合并到STOCK_ORDERS_UNIFIED_API）====================
// @deprecated 请使用 STOCK_ORDERS_UNIFIED_API
export const STOCK_ORDERS_INBOUND_API = {
  EXPORT: STOCK_ORDERS_UNIFIED_API.INBOUND_EXPORT,
  COMPLETE: STOCK_ORDERS_UNIFIED_API.INBOUND_COMPLETE,
  SAVE_WITH_DEVICE: STOCK_ORDERS_UNIFIED_API.INBOUND_SAVE_WITH_DEVICE,
};

// ==================== 出库单相关API路径（已合并到STOCK_ORDERS_UNIFIED_API）====================
// @deprecated 请使用 STOCK_ORDERS_UNIFIED_API
export const STOCK_ORDERS_OUTBOUND_API = {
  EXPORT: STOCK_ORDERS_UNIFIED_API.OUTBOUND_EXPORT,
  COMPLETE: STOCK_ORDERS_UNIFIED_API.OUTBOUND_COMPLETE,
};

// ==================== 库存审计相关路径 ====================
export const INVENTORY_AUDIT_API = {
  BASE: `${API_BASE}/inventory/audit`,
  CREATE: `${API_BASE}/inventory/audit/create`,
  START: (auditId) => `${API_BASE}/inventory/audit/${auditId}/start`,
  RECORD: (itemId) => `${API_BASE}/inventory/audit/item/${itemId}/record`,
  ADJUST: (itemId) => `${API_BASE}/inventory/audit/item/${itemId}/adjust`,
  ITEMS: (auditId) => `${API_BASE}/inventory/audit/${auditId}/items`,
  DIFFERENCES: (auditId) => `${API_BASE}/inventory/audit/${auditId}/differences`,
  LIST: `${API_BASE}/inventory/audit/list`,
  DETAIL: (auditId) => `${API_BASE}/inventory/audit/${auditId}`,
  CANCEL: (auditId) => `${API_BASE}/inventory/audit/${auditId}/cancel`,
  COMPLETE: (auditId) => `${API_BASE}/inventory/audit/${auditId}/complete`,
};

// ==================== 批次相关路径 ====================
export const BATCH_API = {
  BASE: `${API_BASE}/batches`,
  LIST: `${API_BASE}/batches`,
  DETAIL: (id) => `${API_BASE}/batches/${id}`,
  CREATE: `${API_BASE}/batches`,
  UPDATE: (id) => `${API_BASE}/batches/${id}`,
  DELETE: (id) => `${API_BASE}/batches/${id}`,
};

// ==================== 盘点相关路径 ====================
export const STOCK_COUNT_API = {
  BASE: `${API_BASE}/stock-count`,
  LIST: `${API_BASE}/stock-count`,
  DETAIL: (id) => `${API_BASE}/stock-count/${id}`,
  CREATE: `${API_BASE}/stock-count`,
  UPDATE: (id) => `${API_BASE}/stock-count/${id}`,
  DELETE: (id) => `${API_BASE}/stock-count/${id}`,
};

// ==================== 库存转移相关路径 ====================
export const STOCK_TRANSFER_API = {
  BASE: `${API_BASE}/stock-transfer`,
  LIST: `${API_BASE}/stock-transfer`,
  DETAIL: (id) => `${API_BASE}/stock-transfer/${id}`,
  CREATE: `${API_BASE}/stock-transfer`,
  UPDATE: (id) => `${API_BASE}/stock-transfer/${id}`,
  DELETE: (id) => `${API_BASE}/stock-transfer/${id}`,
};

// ==================== 安装相关路径 ====================
export const INSTALLATION_API = {
  BASE: `${API_BASE}/installations`,
  LIST: `${API_BASE}/installations/list`,
  DETAIL: (id) => `${API_BASE}/installations/${id}`,
  CREATE: `${API_BASE}/installations`,
  UPDATE: (id) => `${API_BASE}/installations/${id}`,
  DELETE: (id) => `${API_BASE}/installations/${id}`,
  APPROVE: (id) => `${API_BASE}/installations/${id}/approve`,
  REJECT: (id) => `${API_BASE}/installations/${id}/reject`,
  COMPLETE: (id) => `${API_BASE}/installations/${id}/complete`,
  DEVICE_RECORDS: (deviceId) => `${API_BASE}/installations/device/${deviceId}`,
};

// ==================== 维修相关路径 ====================
export const MAINTENANCE_API = {
  BASE: `${API_BASE}/maintenance`,
  LIST: `${API_BASE}/maintenance/list`,
  DETAIL: (id) => `${API_BASE}/maintenance/${id}`,
  SAVE: `${API_BASE}/maintenance`,
  CREATE: `${API_BASE}/maintenance`,
  UPDATE: (id) => `${API_BASE}/maintenance/${id}`,
  DELETE: (id) => `${API_BASE}/maintenance/${id}`,
  APPROVE: (id) => `${API_BASE}/maintenance/${id}/approve`,
  REJECT: (id) => `${API_BASE}/maintenance/${id}/reject`,
  COMPLETE: (id) => `${API_BASE}/maintenance/${id}/complete`,
  GENERATE_NUMBER: `${API_BASE}/maintenance/generate-number`,
  PAGE: `${API_BASE}/maintenance/page`,
  BATCH: `${API_BASE}/maintenance/batch`,
  BATCH_DELETE: `${API_BASE}/maintenance/batch`,
  BATCH_STATUS: (batchId) => `${API_BASE}/maintenance/batch/${batchId}/status`,
  DEVICE: (deviceId) => `${API_BASE}/maintenance/device/${deviceId}`,
  STATISTICS: `${API_BASE}/maintenance/statistics`,
  EXPORT: `${API_BASE}/maintenance/export`,
};

// ==================== 系统管理相关路径 ====================
export const SYSTEM_API = {
  // 用户管理 - 与后端UserController保持一致
  USERS: `${API_BASE}/users`,
  USER_DETAIL: (userId) => `${API_BASE}/users/${userId}`, // 参数名改为userId与后端一致
  USER_BY_USERNAME: (username) => `${API_BASE}/users/username/${username}`,
  USER_ROLES: `${API_BASE}/users/roles`,
  USER_DELETED: `${API_BASE}/users/deleted`,
  USER_RESTORE: (userId) => `${API_BASE}/users/${userId}/restore`, // 参数名改为userId
  USER_PERMANENT_DELETE: (userId) => `${API_BASE}/users/${userId}/permanent`, // 参数名改为userId
  USER_BATCH_DELETE: `${API_BASE}/users/batch`,
  USER_STATUS: (userId) => `${API_BASE}/users/${userId}/status`, // 参数名改为userId与后端一致
  USER_RESET_PASSWORD: (userId) => `${API_BASE}/users/${userId}/reset-password`, // 新增：与后端一致
  USER_CHECK_USERNAME: `${API_BASE}/users/check-username`,
  USER_LOGIN_LOGS: (userId) => `${API_BASE}/users/${userId}/login-logs`,
  USER_CHECK_EMAIL: `${API_BASE}/users/check-email`,
  USER_CHECK_PHONE: `${API_BASE}/users/check-phone`,
  USER_CHANGE_PASSWORD: `${API_BASE}/users/change-password`,
  // 角色权限
  ROLES: `${API_BASE}/roles`,
  ROLES_PERMISSIONS: `${API_BASE}/roles/permissions`,
  ROLES_PERMISSIONS_TREE: `${API_BASE}/roles/permissions/tree`,
  ROLES_PERMISSIONS_BY_ID: (id) => `${API_BASE}/roles/permissions/${id}`,
  ROLES_PERMISSIONS_BATCH_DELETE: `${API_BASE}/roles/permissions/batch-delete`,
  ROLES_PERMISSIONS_MOVE: (id) => `${API_BASE}/roles/permissions/${id}/move`,
  ROLES_PERMISSIONS_TYPES: `${API_BASE}/roles/permissions/types`,
  ROLES_PERMISSIONS_CHECK_NAME: `${API_BASE}/roles/permissions/check-name`,
  ROLES_PERMISSIONS_CHECK_CODE: `${API_BASE}/roles/permissions/check-code`,
  PERMISSIONS: `${API_BASE}/permissions`,
  PERMISSION_TREE: `${API_BASE}/permissions/tree`,
  // 区域管理 (实际路径在 /api/system/areas)
  AREAS: `${API_BASE}/system/areas`,
  AREAS_ALL: `${API_BASE}/system/areas`,
  AREA_TREE: `${API_BASE}/areas/tree`,
  AREA_DEVICE_COUNT: (id) => `${API_BASE}/areas/${id}/device-count`,
  AREA_SUB_AREAS: (parentId) => `${API_BASE}/areas/${parentId}/sub-areas`,
  AREA_PATH: (id) => `${API_BASE}/areas/${id}/path`,
  AREA_CHECK_NAME: `${API_BASE}/areas/check-name`,
  AREA_CHECK_CODE: `${API_BASE}/areas/check-code`,
  AREA_CITIES: `${API_BASE}/areas/cities`,
  AREA_DISTRICTS: (city) => `${API_BASE}/areas/districts/${city}`,
  AREA_LOCATIONS: (city, district) => `${API_BASE}/areas/locations/${city}/${district}`,
  AREA_STATISTICS: (id) => `${API_BASE}/areas/${id}/statistics`,
  AREA_ALL: `${API_BASE}/areas/all`,
  AREA_BATCH_DELETE: `${API_BASE}/areas/batch`,
  AREA_BATCH_UPDATE_STATUS: `${API_BASE}/areas/batch-update-status`,
  AREA_IMPORT: `${API_BASE}/areas/import`,
  AREA_EXPORT: `${API_BASE}/areas/export`,
  // 系统配置
  CONFIG: `${API_BASE}/config`,
  CONFIG_ALL: `${API_BASE}/config`,
  // 操作日志
  LOGS: `${API_BASE}/logs`,
  LOG_LIST: `${API_BASE}/logs`,
  LOG_EXPORT: `${API_BASE}/logs/export`,
  LOG_STATISTICS: `${API_BASE}/logs/statistics`,
  // 行政区划 - 与后端AdministrativeDivisionController保持一致
  // 后端路径: /api/basic-data/administrative-divisions
  DIVISIONS: `${API_BASE}/basic-data/administrative-divisions`,
  DIVISION_DETAIL: (id) => `${API_BASE}/basic-data/administrative-divisions/${id}`,
  DIVISION_CHILDREN: (parentId) => `${API_BASE}/basic-data/administrative-divisions?parentId=${parentId}`,
  DIVISION_TREE: `${API_BASE}/basic-data/administrative-divisions/tree`,
  DIVISION_PROVINCES: `${API_BASE}/basic-data/administrative-divisions/provinces`,
  DIVISION_CITIES: (provinceId) => `${API_BASE}/basic-data/administrative-divisions/cities?provinceId=${provinceId}`,
  DIVISION_DISTRICTS: (cityId) => `${API_BASE}/basic-data/administrative-divisions/districts?cityId=${cityId}`,
  DIVISION_STATS: (id) => `${API_BASE}/system/divisions/${id}/stats`,
  // 监控
  MONITOR: `${API_BASE}/monitor`,
  PERFORMANCE: `${API_BASE}/performance`,
  PERFORMANCE_REPORT: '/performance-report',
  DATA_CONSISTENCY: `${API_BASE}/data-consistency`,
  ERROR_REPORT: '/error-report',
  CSRF_TOKEN: `${API_BASE}/csrf-token`,
  DEVICES_LOCATIONS: `${API_BASE}/devices/locations`,
  // 仓库管理 (实际路径在 /api/warehouses)
  WAREHOUSES: `${API_BASE}/warehouses`,
  WAREHOUSE_DETAIL: (id) => `${API_BASE}/warehouses/${id}`,
  WAREHOUSE_ZONES: (id) => `${API_BASE}/warehouses/${id}/zones`,
  WAREHOUSE_STATS: (id) => `${API_BASE}/warehouses/${id}/stats`,
  WAREHOUSE_OVERVIEW_STATS: `${API_BASE}/warehouses/overview/stats`,
  // 仓库功能区管理 (实际路径在 /api/system/zones)
  ZONES: `${API_BASE}/system/zones`,
  ZONE_DETAIL: (id) => `${API_BASE}/system/zones/${id}`,
  ZONE_STATS: (id) => `${API_BASE}/system/zones/${id}/stats`,
  // 库存模块仓库管理API别名（兼容原有代码）- 已统一为/warehouses路径
  INVENTORY_WAREHOUSE_LIST: `${API_BASE}/warehouses`,
  INVENTORY_WAREHOUSE_DETAIL: (id) => `${API_BASE}/warehouses/${id}`,
  INVENTORY_WAREHOUSE_ADD: `${API_BASE}/warehouses`,
  INVENTORY_WAREHOUSE_UPDATE: (id) => `${API_BASE}/warehouses/${id}`,
  INVENTORY_WAREHOUSE_DELETE: (id) => `${API_BASE}/warehouses/${id}`,
  INVENTORY_WAREHOUSE_STATS: (id) => `${API_BASE}/warehouses/${id}/stats`,
  INVENTORY_WAREHOUSE_ZONES: (id) => `${API_BASE}/warehouses/${id}/zones`,
  // 货位管理 - 注意：以下常量与 BIN_API 重复，建议使用 BIN_API
  // BIN_LIST: `${API_BASE}/bins`,  // 请使用 BIN_API.LIST
  // BIN_DETAIL: (id) => `${API_BASE}/bins/${id}`,  // 请使用 BIN_API.DETAIL
  // BIN_ADD: `${API_BASE}/bins`,  // 请使用 BIN_API.ADD
  // BIN_UPDATE: (id) => `${API_BASE}/bins/${id}`,  // 请使用 BIN_API.UPDATE
  // BIN_DELETE: (id) => `${API_BASE}/bins/${id}`,  // 请使用 BIN_API.DELETE
  // BIN_AVAILABLE: `${API_BASE}/bins/available`,  // 请使用 BIN_API.AVAILABLE
  // BIN_BATCH_CREATE: `${API_BASE}/bins/batch`,  // 请使用 BIN_API.BATCH_CREATE
  // 库存预警
  INVENTORY_ALERT_THRESHOLDS: `${API_BASE}/inventory/alert-thresholds`,
  INVENTORY_ALERT_THRESHOLDS_BATCH: `${API_BASE}/inventory/alert-thresholds/batch`,
  INVENTORY_ALERT_THRESHOLDS_BATCH_SET: `${API_BASE}/inventory/alert-thresholds/batch-set`,
  INVENTORY_ALERT_THRESHOLDS_IMPORT: `${API_BASE}/inventory/alert-thresholds/import`,
  INVENTORY_ALERT_THRESHOLDS_EXPORT: `${API_BASE}/inventory/alert-thresholds/export`,
  INVENTORY_ALERT_THRESHOLDS_TEMPLATE: `${API_BASE}/inventory/alert-thresholds/template`,
  INVENTORY_ALERT_THRESHOLDS_LEVEL_CONFIG: `${API_BASE}/inventory/alert-thresholds/level-config`,
  // 库存订单
  STOCK_ORDERS_INBOUND_LIST: `${API_BASE}/stock/orders/inbound/list`,
  STOCK_ORDERS_INBOUND_DETAIL: (id) => `${API_BASE}/stock/orders/inbound/detail/${id}`,
  STOCK_ORDERS_INBOUND_SAVE: `${API_BASE}/stock/orders/inbound/save-with-device`,
  STOCK_ORDERS_INBOUND_UPDATE: (id) => `${API_BASE}/stock/orders/inbound/update/${id}`,
  STOCK_ORDERS_INBOUND_DELETE: (id) => `${API_BASE}/stock/orders/inbound/delete/${id}`,
  STOCK_ORDERS_OUTBOUND_LIST: `${API_BASE}/stock/orders/outbound/list`,
  STOCK_ORDERS_OUTBOUND_DETAIL: (id) => `${API_BASE}/stock/orders/outbound/detail/${id}`,
  STOCK_ORDERS_OUTBOUND_SAVE: `${API_BASE}/stock/orders/outbound/save`,
  STOCK_ORDERS_OUTBOUND_UPDATE: (id) => `${API_BASE}/stock/orders/outbound/update/${id}`,
  STOCK_ORDERS_OUTBOUND_DELETE: (id) => `${API_BASE}/stock/orders/outbound/delete/${id}`,
  STOCK_ORDERS_GENERATE_NO: `${API_BASE}/stock/orders/generate-order-no`,
  STOCK_ORDERS_AUDIT: (id) => `${API_BASE}/stock/orders/${id}/audit`,
  STOCK_ORDERS_SUBMIT: (id) => `${API_BASE}/stock/orders/${id}/submit`,
  STOCK_ORDERS_EXECUTE: (id) => `${API_BASE}/stock/orders/${id}/execute`,
};

// ==================== 货位相关路径 ====================
export const BIN_API = {
  LIST: `${API_BASE}/bins`,
  DETAIL: (id) => `${API_BASE}/bins/${id}`,
  ADD: `${API_BASE}/bins`,
  UPDATE: (id) => `${API_BASE}/bins/${id}`,
  DELETE: (id) => `${API_BASE}/bins/${id}`,
  AVAILABLE: `${API_BASE}/bins/available`,
  BATCH_CREATE: `${API_BASE}/bins/batch-create`,
  STATISTICS: `${API_BASE}/bins/statistics`,
  EXPORT: `${API_BASE}/bins/export`,
  IMPORT: `${API_BASE}/bins/import`,
};

// ==================== 仪表盘相关路径 ====================
export const DASHBOARD_API = {
  BASE: `${API_BASE}/dashboard`,
  STATISTICS: `${API_BASE}/dashboard/statistics`,
  OVERVIEW: `${API_BASE}/dashboard/overview`,
};

// ==================== 报表相关路径 ====================
export const REPORTS_API = {
  BASE: `${API_BASE}/reports`,
  DEVICE: `${API_BASE}/reports/device`,
  INVENTORY: `${API_BASE}/reports/inventory`,
  MAINTENANCE: `${API_BASE}/reports/maintenance`,
  OUTBOUND: `${API_BASE}/reports/outbound`,
  INBOUND: `${API_BASE}/reports/inbound`,
  DEVICE_STATISTICS: `${API_BASE}/reports/device/statistics`,
  INVENTORY_STATISTICS: `${API_BASE}/reports/inventory/statistics`,
  MAINTENANCE_STATISTICS: `${API_BASE}/reports/maintenance/statistics`,
  EXPORT: `${API_BASE}/reports/export`,
  EXPORT_DEVICE: `${API_BASE}/reports/export/device`,
  EXPORT_INVENTORY: `${API_BASE}/reports/export/inventory`,
  EXPORT_MAINTENANCE: `${API_BASE}/reports/export/maintenance`,
};

// ==================== 监控相关路径 ====================
export const MONITOR_API = {
  API_MONITOR: `${API_BASE}/monitor`,
  PERFORMANCE: `${API_BASE}/performance`,
  PERFORMANCE_REPORT: '/performance-report',
  ERROR_REPORT: '/error-report',
  SECURITY_AUDIT: `${API_BASE}/security-audit`,
  DATA_CONSISTENCY: `${API_BASE}/data-consistency`,
};

// ==================== 远程账户相关路径 ====================
export const REMOTE_ACCOUNT_API = {
  BASE: `${API_BASE}/remote-accounts`,
  LIST: `${API_BASE}/remote-accounts/list`,
  DETAIL: (id) => `${API_BASE}/remote-accounts/${id}`,
  CREATE: `${API_BASE}/remote-accounts`,
  UPDATE: (id) => `${API_BASE}/remote-accounts/${id}`,
  DELETE: (id) => `${API_BASE}/remote-accounts/${id}`,
  TEST_CONNECTION: (id) => `${API_BASE}/remote-accounts/${id}/test`,
};

// ==================== 订单超时相关路径 ====================
export const ORDER_TIMEOUT_API = {
  BASE: `${API_BASE}/orders/timeout`,
  CHECK: `${API_BASE}/orders/timeout/check`,
  CANCEL: `${API_BASE}/orders/timeout/cancel`,
};

// ==================== CSRF相关路径 ====================
export const CSRF_API = {
  TOKEN: `${API_BASE}/csrf-token`,
  REFRESH: `${API_BASE}/csrf-token/refresh`,
};

// ==================== 健康检查相关路径 ====================
export const HEALTH_API = {
  BASE: '/health',
  ACTUATOR: '/actuator',
};

// ==================== 区域相关路径（在SYSTEM_API之前定义） ====================
export const AREA_API = {
  BASE: `${API_BASE}/areas`,
  LIST: `${API_BASE}/areas/all`,
  TREE: `${API_BASE}/areas/tree`,
  DETAIL: (id) => `${API_BASE}/areas/${id}`,
  CREATE: `${API_BASE}/areas`,
  UPDATE: (id) => `${API_BASE}/areas/${id}`,
  DELETE: (id) => `${API_BASE}/areas/${id}`,
  DEVICE_COUNT: (id) => `${API_BASE}/areas/${id}/device-count`,
};

// ==================== 设备类型相关路径 ====================
export const DEVICE_TYPE_API = {
  BASE: `${API_BASE}/system/device-types`,
  LIST: `${API_BASE}/system/device-types`,
  DETAIL: (id) => `${API_BASE}/system/device-types/${id}`,
  CREATE: `${API_BASE}/system/device-types`,
  UPDATE: (id) => `${API_BASE}/system/device-types/${id}`,
  DELETE: (id) => `${API_BASE}/system/device-types/${id}`,
  ALL: `${API_BASE}/system/device-types/all`,
  TREE: `${API_BASE}/system/device-types/tree`,
  STATS: `${API_BASE}/system/device-types/stats`,
  SUMMARY: `${API_BASE}/system/device-types/summary`,
  IMPORT: `${API_BASE}/system/device-types/import`,
  EXPORT: `${API_BASE}/system/device-types/export`,
};

// ==================== 日志相关路径 ====================
export const LOG_API = {
  BASE: `${API_BASE}/logs`,
  LIST: `${API_BASE}/logs`,
  EXPORT: `${API_BASE}/logs/export`,
  STATISTICS: `${API_BASE}/logs/statistics`,
};

// ==================== 入库单相关路径（别名，兼容测试） ====================
export const INBOUND_API = STOCK_ORDERS_INBOUND_API;

// ==================== 维修记录相关路径 ====================
export const REPAIR_RECORD_API = {
  BASE: `${API_BASE}/repair-records`,
  LIST: `${API_BASE}/repair-records`,
  DETAIL: (id) => `${API_BASE}/repair-records/${id}`,
  CREATE: `${API_BASE}/repair-records`,
  UPDATE: (id) => `${API_BASE}/repair-records/${id}`,
  DELETE: (id) => `${API_BASE}/repair-records/${id}`,
  COMPLETE: (id) => `${API_BASE}/repair-records/${id}/complete`,
  DEVICE_HISTORY: (deviceId) => `${API_BASE}/repair-records/device/${deviceId}`,
  STATISTICS: `${API_BASE}/repair-records/statistics`,
};

export const SCRAP_RECORD_API = {
  BASE: `${API_BASE}/scrap-records`,
  LIST: `${API_BASE}/scrap-records`,
  SAVE: `${API_BASE}/scrap-records`,
  DETAIL: (id) => `${API_BASE}/scrap-records/${id}`,
  UPDATE: (id) => `${API_BASE}/scrap-records/${id}`,
  DELETE: (id) => `${API_BASE}/scrap-records/${id}`,
  APPROVE: (id) => `${API_BASE}/scrap-records/${id}/approve`,
  DEVICE_HISTORY: (deviceId) => `${API_BASE}/scrap-records/device/${deviceId}`,
  STATISTICS: `${API_BASE}/scrap-records/statistics`,
};

// ==================== 出库单相关路径（别名，兼容测试） ====================
export const OUTBOUND_API = STOCK_ORDERS_OUTBOUND_API;

// ==================== 维修相关路径（别名，兼容测试） ====================
export const REPAIR_API = REPAIR_RECORD_API;

// ==================== 位置相关路径（别名，兼容测试） ====================
export const LOCATION_API = AREA_API;

// ==================== 权限相关路径（别名，兼容测试） ====================
export const PERMISSION_API = {
  BASE: `${API_BASE}/permissions`,
  LIST: `${API_BASE}/permissions`,
  TREE: `${API_BASE}/permissions/tree`,
};

// ==================== 角色相关路径（别名，兼容测试） ====================
export const ROLE_API = {
  BASE: `${API_BASE}/roles`,
  LIST: `${API_BASE}/roles`,
  DETAIL: (id) => `${API_BASE}/roles/${id}`,
  CREATE: `${API_BASE}/roles`,
  UPDATE: (id) => `${API_BASE}/roles/${id}`,
  DELETE: (id) => `${API_BASE}/roles/${id}`,
};

// ==================== 功能区类型管理API路径 ====================
/**
 * 功能区类型管理API路径
 * 与后端ZoneTypeController保持一致
 * 后端路径前缀: /api/zone-types
 */
export const ZONE_TYPE_API = {
  BASE: `${API_BASE}/zone-types`,
  LIST: `${API_BASE}/zone-types`,
  ACTIVE: `${API_BASE}/zone-types/active`,
  ALL: `${API_BASE}/zone-types/all`,
  DETAIL: (id) => `${API_BASE}/zone-types/${id}`,
  CREATE: `${API_BASE}/zone-types`,
  UPDATE: (id) => `${API_BASE}/zone-types/${id}`,
  DELETE: (id) => `${API_BASE}/zone-types/${id}`,
  STATUS: (id) => `${API_BASE}/zone-types/${id}/status`,
  STATS: `${API_BASE}/zone-types/stats`,
  INIT: `${API_BASE}/zone-types/initialize`,
};

// ==================== 仓库管理API路径 ====================
/**
 * 仓库管理API路径
 * 与后端WarehouseController保持一致
 * 后端路径前缀: /api/warehouses
 */
export const WAREHOUSE_API = {
  BASE: `${API_BASE}/warehouses`,
  LIST: `${API_BASE}/warehouses`,
  DETAIL: (id) => `${API_BASE}/warehouses/${id}`,
  CREATE: `${API_BASE}/warehouses`,
  UPDATE: (id) => `${API_BASE}/warehouses/${id}`,
  DELETE: (id) => `${API_BASE}/warehouses/${id}`,
  ZONES: (id) => `${API_BASE}/warehouses/${id}/zones`,
  STATS: (id) => `${API_BASE}/warehouses/${id}/stats`,
  OVERVIEW_STATS: `${API_BASE}/warehouses/overview/stats`,
};

// ==================== 功能区管理API路径 ====================
/**
 * 功能区管理API路径
 * 与后端ZoneController保持一致
 * 后端路径前缀: /api/warehouse-zones
 */
export const ZONE_API = {
  BASE: `${API_BASE}/warehouse-zones`,
  LIST: `${API_BASE}/warehouse-zones`,
  DETAIL: (id) => `${API_BASE}/warehouse-zones/${id}`,
  CREATE: `${API_BASE}/warehouse-zones`,
  UPDATE: (id) => `${API_BASE}/warehouse-zones/${id}`,
  DELETE: (id) => `${API_BASE}/warehouse-zones/${id}`,
  BY_WAREHOUSE: (warehouseId) => `${API_BASE}/warehouse-zones/warehouse/${warehouseId}`,
  STATS: `${API_BASE}/warehouse-zones/stats`,
};

// ==================== 仓库功能区管理API路径 ====================
/**
 * 仓库功能区管理API路径
 * 与后端WarehouseZoneController保持一致
 * 后端路径前缀: /api/warehouse-zones
 */
export const WAREHOUSE_ZONE_API = {
  BASE: `${API_BASE}/warehouse-zones`,
  LIST: `${API_BASE}/warehouse-zones`,
  DETAIL: (id) => `${API_BASE}/warehouse-zones/${id}`,
  CREATE: `${API_BASE}/warehouse-zones`,
  UPDATE: (id) => `${API_BASE}/warehouse-zones/${id}`,
  DELETE: (id) => `${API_BASE}/warehouse-zones/${id}`,
  BY_WAREHOUSE: (warehouseId) => `${API_BASE}/warehouse-zones/warehouse/${warehouseId}`,
  STATS: `${API_BASE}/warehouse-zones/stats`,
};

// ==================== 报表相关路径（别名，兼容测试） ====================
export const REPORT_API = REPORTS_API;

// ==================== 业务审批相关路径 ====================
/**
 * 业务审批API路径
 * 与后端ApprovalController保持一致
 */
export const BUSINESS_API = {
  BASE: `${API_BASE}/business/approval`,
  APPROVAL_LIST: `${API_BASE}/business/approval/list`,
  APPROVAL_DETAIL: (id) => `${API_BASE}/business/approval/${id}`,
  APPROVAL_APPROVE: (id) => `${API_BASE}/business/approval/${id}/approve`,
  APPROVAL_REJECT: (id) => `${API_BASE}/business/approval/${id}/reject`,
  APPROVAL_STATISTICS: `${API_BASE}/business/approval/statistics`,
  APPROVAL_PENDING_COUNT: `${API_BASE}/business/approval/pending-count`,
  APPROVAL_BATCH_APPROVE: `${API_BASE}/business/approval/batch-approve`,
  APPROVAL_BATCH_REJECT: `${API_BASE}/business/approval/batch-reject`,
};

// ==================== Excel导出相关路径 ====================
/**
 * Excel导出API路径
 * 与后端ExcelExportController保持一致
 */
export const EXCEL_API = {
  BASE: `${API_BASE}/excel`,
  DEVICE_EXPORT: `${API_BASE}/excel/devices/export`,
  INVENTORY_EXPORT: `${API_BASE}/excel/inventory/export`,
  COMPREHENSIVE_EXPORT: `${API_BASE}/excel/comprehensive/export`,
};

// ==================== 导出所有API常量 ====================
export default {
  API_BASE,
  API_V1,
  AUTH_API,
  DEVICE_API,
  DEVICE_STATUS_API,
  DEVICE_STATUS_TRANSITION_RULE_API,
  DEVICE_STATUS_APPROVAL_API,
  DEVICE_STATUS_TRACKING_API,
  DEVICE_SYNC_API,
  INVENTORY_API,
  STOCK_ORDERS_UNIFIED_API,
  STOCK_ORDERS_INBOUND_API,
  STOCK_ORDERS_OUTBOUND_API,
  INVENTORY_AUDIT_API,
  BATCH_API,
  STOCK_COUNT_API,
  STOCK_TRANSFER_API,
  INSTALLATION_API,
  MAINTENANCE_API,
  REPAIR_RECORD_API,
  SCRAP_RECORD_API,
  SYSTEM_API,
  BIN_API,
  DASHBOARD_API,
  REPORTS_API,
  MONITOR_API,
  REMOTE_ACCOUNT_API,
  ORDER_TIMEOUT_API,
  CSRF_API,
  HEALTH_API,
  DEVICE_TYPE_API,
  LOG_API,
  INBOUND_API,
  OUTBOUND_API,
  REPAIR_API,
  LOCATION_API,
  PERMISSION_API,
  ROLE_API,
  REPORT_API,
  AREA_API,
  ZONE_TYPE_API,
  WAREHOUSE_ZONE_API,
  WAREHOUSE_API,
  ZONE_API,
  BUSINESS_API,
  EXCEL_API,
};
