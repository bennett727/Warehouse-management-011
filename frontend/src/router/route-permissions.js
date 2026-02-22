/**
 * 路由权限配置
 * 定义所有路由的访问权限，支持RBAC（基于角色的访问控制）
 * @file: route-permissions.js
 * @description: 统一管理路由权限配置，确保前后端权限一致
 * @version: 1.0.0
 */

// 角色定义
export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer',
};

// 权限代码定义
export const PERMISSION_CODES = {
  // 仪表盘
  DASHBOARD_VIEW: 'dashboard:view',

  // 设备管理
  DEVICE_VIEW: 'device:view',
  DEVICE_UPDATE: 'device:update',
  DEVICE_DELETE: 'device:delete',
  DEVICE_EXPORT: 'device:export',
  DEVICE_STATUS_APPROVAL: 'device:status:approval',

  // 库存管理
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_INBOUND: 'inventory:inbound',
  INVENTORY_OUTBOUND: 'inventory:outbound',
  INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_COUNT: 'inventory:count',
  INVENTORY_BATCH: 'inventory:batch',
  INVENTORY_BIN: 'inventory:bin',
  INVENTORY_AREA_VIEW: 'inventory:area:view',
  INVENTORY_AREA_CREATE: 'inventory:area:create',
  INVENTORY_AREA_UPDATE: 'inventory:area:update',
  INVENTORY_AREA_DELETE: 'inventory:area:delete',
  INVENTORY_ALERT: 'inventory:alert',
  INVENTORY_ALERT_CONFIG: 'inventory:alert:config',

  // 维修管理
  REPAIR_VIEW: 'repair:view',
  REPAIR_CREATE: 'repair:create',
  REPAIR_UPDATE: 'repair:update',
  REPAIR_DELETE: 'repair:delete',
  REPAIR_APPROVE: 'repair:approve',

  // 安装管理
  INSTALLATION_VIEW: 'installation:view',
  INSTALLATION_CREATE: 'installation:create',
  INSTALLATION_UPDATE: 'installation:update',
  INSTALLATION_DELETE: 'installation:delete',
  INSTALLATION_APPROVE: 'installation:approve',

  // 报废管理
  SCRAP_VIEW: 'scrap:view',
  SCRAP_CREATE: 'scrap:create',
  SCRAP_APPROVE: 'scrap:approve',

  // 系统管理（仅管理员）
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
  SYSTEM_CONFIG_VIEW: 'system:config:view',
  SYSTEM_CONFIG_UPDATE: 'system:config:update',
  SYSTEM_AREA_VIEW: 'system:area:view',
  SYSTEM_AREA_CREATE: 'system:area:create',
  SYSTEM_AREA_UPDATE: 'system:area:update',
  SYSTEM_AREA_DELETE: 'system:area:delete',
  SYSTEM_DEVICE_TYPE_VIEW: 'system:device-type:view',
  SYSTEM_DEVICE_TYPE_CREATE: 'system:device-type:create',
  SYSTEM_DEVICE_TYPE_UPDATE: 'system:device-type:update',
  SYSTEM_DEVICE_TYPE_DELETE: 'system:device-type:delete',

  // 报表
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  // 记录查询
  RECORD_VIEW: 'record:view',
};

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSION_CODES),

  [ROLES.OPERATOR]: [
    PERMISSION_CODES.DASHBOARD_VIEW,
    PERMISSION_CODES.DEVICE_VIEW,
    PERMISSION_CODES.DEVICE_UPDATE,
    PERMISSION_CODES.DEVICE_EXPORT,
    PERMISSION_CODES.INVENTORY_VIEW,
    PERMISSION_CODES.INVENTORY_INBOUND,
    PERMISSION_CODES.INVENTORY_OUTBOUND,
    PERMISSION_CODES.INVENTORY_TRANSFER,
    PERMISSION_CODES.INVENTORY_COUNT,
    PERMISSION_CODES.INVENTORY_BATCH,
    PERMISSION_CODES.INVENTORY_BIN,
    PERMISSION_CODES.INVENTORY_ALERT,
    PERMISSION_CODES.REPAIR_VIEW,
    PERMISSION_CODES.REPAIR_CREATE,
    PERMISSION_CODES.REPAIR_UPDATE,
    PERMISSION_CODES.INSTALLATION_VIEW,
    PERMISSION_CODES.INSTALLATION_CREATE,
    PERMISSION_CODES.INSTALLATION_UPDATE,
    PERMISSION_CODES.SCRAP_VIEW,
    PERMISSION_CODES.SCRAP_CREATE,
    PERMISSION_CODES.REPORT_VIEW,
    PERMISSION_CODES.REPORT_EXPORT,
    PERMISSION_CODES.RECORD_VIEW,
  ],

  [ROLES.TECHNICIAN]: [
    PERMISSION_CODES.DASHBOARD_VIEW,
    PERMISSION_CODES.DEVICE_VIEW,
    PERMISSION_CODES.REPAIR_VIEW,
    PERMISSION_CODES.REPAIR_CREATE,
    PERMISSION_CODES.REPAIR_UPDATE,
    PERMISSION_CODES.INSTALLATION_VIEW,
    PERMISSION_CODES.INSTALLATION_CREATE,
    PERMISSION_CODES.INSTALLATION_UPDATE,
    PERMISSION_CODES.RECORD_VIEW,
  ],

  [ROLES.VIEWER]: [
    PERMISSION_CODES.DASHBOARD_VIEW,
    PERMISSION_CODES.DEVICE_VIEW,
    PERMISSION_CODES.INVENTORY_VIEW,
    PERMISSION_CODES.REPAIR_VIEW,
    PERMISSION_CODES.INSTALLATION_VIEW,
    PERMISSION_CODES.SCRAP_VIEW,
    PERMISSION_CODES.REPORT_VIEW,
    PERMISSION_CODES.RECORD_VIEW,
  ],
};

// 路由权限映射
export const ROUTE_PERMISSIONS = {
  // 仪表盘
  Dashboard: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.TECHNICIAN, ROLES.VIEWER],
    permissions: [PERMISSION_CODES.DASHBOARD_VIEW],
  },

  // 资产管理
  DeviceList: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.TECHNICIAN, ROLES.VIEWER],
    permissions: [PERMISSION_CODES.DEVICE_VIEW],
  },
  DeviceStatusApproval: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.DEVICE_STATUS_APPROVAL],
  },

  // 库存管理
  InboundManagement: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_INBOUND],
  },
  OutboundManagement: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_OUTBOUND],
  },
  StockTransfer: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_TRANSFER],
  },
  StockCount: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_COUNT],
  },
  BatchManagement: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_BATCH],
  },
  BinManagement: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_BIN],
  },
  InventoryAlerts: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_ALERT],
  },
  EnhancedAlertConfig: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.INVENTORY_ALERT_CONFIG],
  },
  AlertThresholdConfig: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.INVENTORY_ALERT_CONFIG],
  },
  InventoryAuditPage: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_COUNT],
  },
  InventoryManagementPage: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.INVENTORY_VIEW],
  },

  // 维修管理
  RepairPage: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.TECHNICIAN],
    permissions: [PERMISSION_CODES.REPAIR_VIEW],
  },
  RepairApprovalPage: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.REPAIR_APPROVE],
  },

  // 安装管理
  InstallationPage: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.TECHNICIAN],
    permissions: [PERMISSION_CODES.INSTALLATION_VIEW],
  },
  InstallationApprovalPage: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.INSTALLATION_APPROVE],
  },

  // 报废管理
  ScrapPage: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR],
    permissions: [PERMISSION_CODES.SCRAP_VIEW],
  },
  ScrapApprovalPage: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SCRAP_APPROVE],
  },

  // 系统管理（仅管理员）
  Users: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_USER_VIEW],
  },
  Roles: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_ROLE_VIEW],
  },
  Permissions: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_PERMISSION_VIEW],
  },
  Logs: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_LOG_VIEW],
  },
  OperationLogsPage: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_LOG_VIEW],
  },
  Config: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_CONFIG_VIEW],
  },
  Areas: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_AREA_VIEW],
  },
  DeviceTypes: {
    roles: [ROLES.ADMIN],
    permissions: [PERMISSION_CODES.SYSTEM_DEVICE_TYPE_VIEW],
  },

  // 报表
  DataReportsPage: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.VIEWER],
    permissions: [PERMISSION_CODES.REPORT_VIEW],
  },

  // 记录查询
  RecordQuery: {
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.TECHNICIAN, ROLES.VIEWER],
    permissions: [PERMISSION_CODES.RECORD_VIEW],
  },
};

/**
 * 角色映射表 - 支持中英文角色名称（包括大小写）
 */
const ROLE_NAME_MAP = {
  // 中文角色
  管理员: 'admin',
  操作员: 'operator',
  技术员: 'technician',
  访客: 'viewer',
  // 小写角色
  admin: 'admin',
  operator: 'operator',
  technician: 'technician',
  viewer: 'viewer',
  // 大写角色（Spring Security返回的角色格式）
  ADMIN: 'admin',
  OPERATOR: 'operator',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer',
  // 带ROLE_前缀的角色（Spring Security UserDetails返回的格式）
  ROLE_ADMIN: 'admin',
  ROLE_OPERATOR: 'operator',
  ROLE_TECHNICIAN: 'technician',
  ROLE_VIEWER: 'viewer',
  // 带ROLE_前缀的小写角色
  role_admin: 'admin',
  role_operator: 'operator',
  role_technician: 'technician',
  role_viewer: 'viewer',
};

/**
 * 标准化角色名称（支持中英文）
 * @param {string} role - 原始角色名称
 * @returns {string} - 标准化的英文角色名称
 */
function normalizeRole(role) {
  if (!role) {
    return '';
  }
  // 移除ROLE_前缀（如果存在）
  const roleWithoutPrefix = role.replace(/^ROLE_/i, '');
  const normalized =
    ROLE_NAME_MAP[role] ||
    ROLE_NAME_MAP[role.toLowerCase()] ||
    ROLE_NAME_MAP[roleWithoutPrefix] ||
    ROLE_NAME_MAP[roleWithoutPrefix.toLowerCase()] ||
    roleWithoutPrefix.toLowerCase();
  return normalized;
}

/**
 * 标准化角色数组（支持中英文）
 * @param {Array} roles - 原始角色数组
 * @returns {Array} - 标准化的英文角色数组
 */
export function normalizeRoles(roles) {
  if (!roles || !Array.isArray(roles)) {
    return [];
  }
  return roles.map((role) => normalizeRole(role)).filter((role) => role);
}

/**
 * 检查用户是否有权限访问路由
 * @param {string} routeName - 路由名称
 * @param {string} userRole - 用户角色
 * @param {Array} userPermissions - 用户权限列表
 * @returns {boolean} - 是否有权限
 */
export function hasRoutePermission(routeName, userRole, userPermissions = []) {
  // 参数校验
  if (!userRole) {
    return false;
  }

  const routePermission = ROUTE_PERMISSIONS[routeName];

  if (!routePermission) {
    // 如果路由没有配置权限，默认允许访问
    return true;
  }

  // 标准化用户角色（支持中英文）
  const normalizedUserRole = normalizeRole(userRole);

  // 检查角色
  if (routePermission.roles && routePermission.roles.length > 0) {
    const hasRole = routePermission.roles.some((role) => role.toLowerCase() === normalizedUserRole);
    if (!hasRole) {
      return false;
    }
  }

  // 检查权限代码 - 如果没有提供用户权限列表，使用角色默认权限
  if (routePermission.permissions && routePermission.permissions.length > 0) {
    const permissionsToCheck = userPermissions.length > 0 ? userPermissions : getRolePermissions(normalizedUserRole);

    const hasPermission = routePermission.permissions.some((permission) => permissionsToCheck.includes(permission));
    if (!hasPermission) {
      return false;
    }
  }

  return true;
}

/**
 * 获取用户角色的所有权限
 * @param {string} role - 用户角色
 * @returns {Array} - 权限列表
 */
export function getRolePermissions(role) {
  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole] || [];
}

/**
 * 检查用户是否有特定权限
 * @param {string} permission - 权限代码
 * @param {string} userRole - 用户角色
 * @param {Array} userPermissions - 用户权限列表
 * @returns {boolean} - 是否有权限
 */
export function hasPermission(permission, userRole, userPermissions = []) {
  // 管理员拥有所有权限
  if (userRole === ROLES.ADMIN) {
    return true;
  }

  // 检查用户权限列表
  if (userPermissions.includes(permission)) {
    return true;
  }

  // 检查角色默认权限
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.includes(permission);
}

export default {
  ROLES,
  PERMISSION_CODES,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  hasRoutePermission,
  getRolePermissions,
  hasPermission,
};
