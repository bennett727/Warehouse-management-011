// 用户角色枚举
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
};

// 权限枚举
export const PERMISSIONS = {
  // 仪表盘
  DASHBOARD_VIEW: 'dashboard:view',
  // 用户管理
  USER_LIST: 'user:list',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ROLES: 'user:roles',
  USER_VIEW: 'user:view',

  // 设备管理
  DEVICE_LIST: 'device:list',
  DEVICE_CREATE: 'device:create',
  DEVICE_UPDATE: 'device:update',
  DEVICE_DELETE: 'device:delete',
  DEVICE_IMPORT: 'device:import',
  DEVICE_EXPORT: 'device:export',
  DEVICE_VIEW: 'device:view',
  DEVICE_TYPE_VIEW: 'device:type:view',
  DEVICE_MANAGE: 'device:manage',
  DEVICE_CATEGORY_VIEW: 'device:category:view',
  DEVICE_STATUS_VIEW: 'device:status:view',

  // 出入库管理
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_INBOUND: 'inventory:inbound',
  INVENTORY_OUTBOUND: 'inventory:outbound',
  INVENTORY_INBOUND_LIST: 'inventory:inbound:list',
  INVENTORY_OUTBOUND_LIST: 'inventory:outbound:list',

  // 区域管理（库存管理模块）
  INVENTORY_AREA_VIEW: 'inventory:area:view',
  INVENTORY_AREA_CREATE: 'inventory:area:create',
  INVENTORY_AREA_UPDATE: 'inventory:area:update',
  INVENTORY_AREA_DELETE: 'inventory:area:delete',
  INVENTORY_AREA_IMPORT: 'inventory:area:import',
  INVENTORY_AREA_EXPORT: 'inventory:area:export',

  // 维修管理
  REPAIR_CREATE: 'repair:create',
  REPAIR_UPDATE: 'repair:update',
  REPAIR_LIST: 'repair:list',
  REPAIR_VIEW: 'repair:view',
  REPAIR_REPORT_VIEW: 'repair:report:view',
  REPAIR_RECORD_VIEW: 'repair:record:view',
  REPAIR_MANAGE: 'repair:manage',
  DEVICE_REPAIR_MANAGE: 'device:repair:manage',

  // 设备查询
  QUERY_VIEW: 'query:view',

  // 系统管理
  SYSTEM_VIEW: 'system:view',
  SYSTEM_USER_VIEW: 'system:user:view',
  SYSTEM_USER_CREATE: 'system:user:create',
  SYSTEM_USER_UPDATE: 'system:user:update',
  SYSTEM_USER_DELETE: 'system:user:delete',
  SYSTEM_ROLE_VIEW: 'system:role:view',
  SYSTEM_ROLE_UPDATE: 'system:role:update',
  SYSTEM_PERMISSION_VIEW: 'system:permission:view',
  SYSTEM_PERMISSION_UPDATE: 'system:permission:update',
  SYSTEM_LOG_VIEW: 'system:log:view',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_CONFIG_UPDATE: 'system:config:update',
  SYSTEM_AREA_VIEW: 'system:area:view',
  SYSTEM_AREA_CREATE: 'system:area:create',
  SYSTEM_AREA_UPDATE: 'system:area:update',
  SYSTEM_AREA_DELETE: 'system:area:delete',
  SYSTEM_AREA_IMPORT: 'system:area:import',
  SYSTEM_AREA_EXPORT: 'system:area:export',
  LOG_VIEW: 'log:view',

  // 记录管理
  RECORD_VIEW: 'record:view',
};

// 角色权限映射
export const ROLE_PERMISSIONS = {
  // 管理员拥有所有权限
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),

  // 操作员拥有部分权限
  [USER_ROLES.OPERATOR]: [
    // 仪表盘
    PERMISSIONS.DASHBOARD_VIEW,
    // 设备管理
    PERMISSIONS.DEVICE_LIST,
    PERMISSIONS.DEVICE_VIEW,
    PERMISSIONS.DEVICE_TYPE_VIEW,
    PERMISSIONS.DEVICE_CATEGORY_VIEW,
    PERMISSIONS.DEVICE_STATUS_VIEW,
    // 库存管理
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_INBOUND,
    PERMISSIONS.INVENTORY_OUTBOUND,
    // 维修管理
    PERMISSIONS.REPAIR_VIEW,
    // 设备查询
    PERMISSIONS.QUERY_VIEW,
    // 记录管理
    PERMISSIONS.RECORD_VIEW,
    // 系统管理
    PERMISSIONS.SYSTEM_VIEW,
    PERMISSIONS.SYSTEM_USER_VIEW,
    PERMISSIONS.SYSTEM_ROLE_VIEW,
    PERMISSIONS.SYSTEM_PERMISSION_VIEW,
    PERMISSIONS.SYSTEM_LOG_VIEW,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.LOG_VIEW,
  ],
};

// 路由权限配置
export const ROUTE_PERMISSIONS = {
  '/dashboard': [PERMISSIONS.DASHBOARD_VIEW],
  '/device/list': [PERMISSIONS.DEVICE_VIEW],
  '/device/type': [PERMISSIONS.DEVICE_TYPE_VIEW],
  '/device/category': [PERMISSIONS.DEVICE_CATEGORY_VIEW],
  '/device/status': [PERMISSIONS.DEVICE_STATUS_VIEW],
  '/inventory/inbound': [PERMISSIONS.INVENTORY_INBOUND],
  '/inventory/outbound': [PERMISSIONS.INVENTORY_OUTBOUND],
  '/repair/list': [PERMISSIONS.REPAIR_VIEW],
  '/system': [PERMISSIONS.SYSTEM_VIEW],
  '/system/users': [PERMISSIONS.SYSTEM_USER_VIEW],
  '/system/roles': [PERMISSIONS.SYSTEM_ROLE_VIEW],
  '/system/logs': [PERMISSIONS.LOG_VIEW],
  '/system/config': [PERMISSIONS.SYSTEM_CONFIG],
  '/inventory-management/areas': [PERMISSIONS.INVENTORY_AREA_VIEW],
};

// 菜单权限配置
export const MENU_PERMISSIONS = {
  dashboard: [], // 首页
  devices: [PERMISSIONS.DEVICE_LIST], // 设备管理
  repair: [PERMISSIONS.REPAIR_VIEW], // 维修管理
  query: [PERMISSIONS.QUERY_VIEW], // 设备查询
  inventory: [PERMISSIONS.INVENTORY_VIEW], // 出入库管理
  record: [PERMISSIONS.RECORD_VIEW], // 记录管理
  system: [PERMISSIONS.SYSTEM_VIEW], // 系统管理
};
