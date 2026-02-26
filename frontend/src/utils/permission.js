/**
 * 权限工具函数
 * 统一处理前后端权限校验，确保权限控制一致性
 * @file: permission.js
 * @description: 提供统一的权限检查、角色校验功能
 * @version: 1.0.0
 */

import { PERMISSION_CODES, ROLES, normalizeRoles } from '@/router/route-permissions.js';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Permission');

/**
 * 检查用户是否拥有指定角色
 * 与后端 hasRole() 方法保持一致
 * @param {string|Array} userRoles - 用户角色（可以是单个角色或角色数组）
 * @param {string} requiredRole - 需要的角色（不需要ROLE_前缀）
 * @returns {boolean} - 是否拥有该角色
 */
export function hasRole(userRoles, requiredRole) {
  if (!userRoles || !requiredRole) {
    return false;
  }

  // 标准化角色名称
  const normalizedRequiredRole = requiredRole.toUpperCase();
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  const normalizedUserRoles = normalizeRoles(rolesArray);

  // 检查是否包含所需角色
  const hasRequiredRole = normalizedUserRoles.some((role) => role.toUpperCase() === normalizedRequiredRole);

  logger.debug(
    `[权限检查] hasRole: 用户角色=[${normalizedUserRoles.join(', ')}], 需要角色=[${normalizedRequiredRole}], 结果=${hasRequiredRole}`
  );

  return hasRequiredRole;
}

/**
 * 检查用户是否拥有任意一个指定角色
 * @param {string|Array} userRoles - 用户角色
 * @param {Array} requiredRoles - 需要的角色数组
 * @returns {boolean} - 是否拥有任意一个角色
 */
export function hasAnyRole(userRoles, requiredRoles) {
  if (!userRoles || !requiredRoles || !Array.isArray(requiredRoles)) {
    return false;
  }

  const hasAny = requiredRoles.some((role) => hasRole(userRoles, role));
  logger.debug(`[权限检查] hasAnyRole: 需要角色=[${requiredRoles.join(', ')}], 结果=${hasAny}`);

  return hasAny;
}

/**
 * 检查用户是否拥有所有指定角色
 * @param {string|Array} userRoles - 用户角色
 * @param {Array} requiredRoles - 需要的角色数组
 * @returns {boolean} - 是否拥有所有角色
 */
export function hasAllRoles(userRoles, requiredRoles) {
  if (!userRoles || !requiredRoles || !Array.isArray(requiredRoles)) {
    return false;
  }

  const hasAll = requiredRoles.every((role) => hasRole(userRoles, role));
  logger.debug(`[权限检查] hasAllRoles: 需要角色=[${requiredRoles.join(', ')}], 结果=${hasAll}`);

  return hasAll;
}

/**
 * 检查用户是否拥有指定权限代码
 * @param {Array} userPermissions - 用户权限代码列表
 * @param {string} requiredPermission - 需要的权限代码
 * @returns {boolean} - 是否拥有该权限
 */
export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !requiredPermission) {
    return false;
  }

  const permissionsArray = Array.isArray(userPermissions) ? userPermissions : [];
  const hasPerm = permissionsArray.includes(requiredPermission);

  logger.debug(`[权限检查] hasPermission: 需要权限=[${requiredPermission}], 结果=${hasPerm}`);

  return hasPerm;
}

/**
 * 检查用户是否拥有任意一个指定权限
 * @param {Array} userPermissions - 用户权限代码列表
 * @param {Array} requiredPermissions - 需要的权限代码数组
 * @returns {boolean} - 是否拥有任意一个权限
 */
export function hasAnyPermission(userPermissions, requiredPermissions) {
  if (!userPermissions || !requiredPermissions || !Array.isArray(requiredPermissions)) {
    return false;
  }

  const hasAny = requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
  logger.debug(`[权限检查] hasAnyPermission: 需要权限=[${requiredPermissions.join(', ')}], 结果=${hasAny}`);

  return hasAny;
}

/**
 * 根据角色获取默认权限列表
 * @param {string} role - 用户角色
 * @returns {Array} - 该角色的默认权限列表
 */
export function getDefaultPermissionsByRole(role) {
  if (!role) {
    return [];
  }

  const normalizedRole = role.toLowerCase();

  switch (normalizedRole) {
    case ROLES.ADMIN:
      return Object.values(PERMISSION_CODES);
    case ROLES.OPERATOR:
      return [
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
      ];
    case ROLES.TECHNICIAN:
      return [
        PERMISSION_CODES.DASHBOARD_VIEW,
        PERMISSION_CODES.DEVICE_VIEW,
        PERMISSION_CODES.REPAIR_VIEW,
        PERMISSION_CODES.REPAIR_CREATE,
        PERMISSION_CODES.REPAIR_UPDATE,
        PERMISSION_CODES.INSTALLATION_VIEW,
        PERMISSION_CODES.INSTALLATION_CREATE,
        PERMISSION_CODES.INSTALLATION_UPDATE,
        PERMISSION_CODES.RECORD_VIEW,
      ];
    case ROLES.VIEWER:
      return [
        PERMISSION_CODES.DASHBOARD_VIEW,
        PERMISSION_CODES.DEVICE_VIEW,
        PERMISSION_CODES.INVENTORY_VIEW,
        PERMISSION_CODES.REPAIR_VIEW,
        PERMISSION_CODES.INSTALLATION_VIEW,
        PERMISSION_CODES.SCRAP_VIEW,
        PERMISSION_CODES.REPORT_VIEW,
        PERMISSION_CODES.RECORD_VIEW,
      ];
    default:
      return [];
  }
}

/**
 * 检查按钮是否应该显示（基于权限）
 * 用于前端按钮的 v-if 指令
 * @param {Object} options - 检查选项
 * @param {string|Array} options.roles - 用户角色
 * @param {Array} options.permissions - 用户权限
 * @param {string} options.requiredRole - 需要的角色（可选）
 * @param {Array} options.requiredRoles - 需要的角色数组（可选）
 * @param {string} options.requiredPermission - 需要的权限（可选）
 * @param {boolean} options.requireAll - 是否需要满足所有条件（默认false）
 * @returns {boolean} - 是否应该显示按钮
 */
export function canShowButton(options = {}) {
  const {
    roles = [],
    permissions = [],
    requiredRole = null,
    requiredRoles = [],
    requiredPermission = null,
    requireAll = false,
  } = options;

  // 如果没有设置任何要求，默认显示
  if (!requiredRole && requiredRoles.length === 0 && !requiredPermission) {
    return true;
  }

  const checks = [];

  // 检查单个角色
  if (requiredRole) {
    checks.push(hasRole(roles, requiredRole));
  }

  // 检查多个角色（任意一个）
  if (requiredRoles.length > 0) {
    checks.push(hasAnyRole(roles, requiredRoles));
  }

  // 检查权限
  if (requiredPermission) {
    checks.push(hasPermission(permissions, requiredPermission));
  }

  if (checks.length === 0) {
    return true;
  }

  // 根据 requireAll 参数决定是"与"还是"或"
  const result = requireAll ? checks.every(Boolean) : checks.some(Boolean);

  logger.debug(`[权限检查] canShowButton: 结果=${result}, 检查项=[${checks.join(', ')}]`);

  return result;
}

/**
 * 检查是否可以执行某个操作
 * 综合检查角色和权限
 * @param {Object} userInfo - 用户信息对象
 * @param {Object} actionConfig - 操作配置
 * @returns {boolean} - 是否可以执行
 */
export function canPerformAction(userInfo, actionConfig = {}) {
  if (!userInfo) {
    return false;
  }

  const { roles = [], permissions = [] } = userInfo;
  const { requiredRole = null, requiredRoles = [], requiredPermission = null, requiredPermissions = [] } = actionConfig;

  // 管理员拥有所有权限
  if (hasRole(roles, ROLES.ADMIN)) {
    logger.debug('[权限检查] 用户是管理员，拥有所有权限');
    return true;
  }

  // 检查角色
  let roleCheck = true;
  if (requiredRole) {
    roleCheck = hasRole(roles, requiredRole);
  } else if (requiredRoles.length > 0) {
    roleCheck = hasAnyRole(roles, requiredRoles);
  }

  // 检查权限
  let permissionCheck = true;
  if (requiredPermission) {
    permissionCheck = hasPermission(permissions, requiredPermission);
  } else if (requiredPermissions.length > 0) {
    permissionCheck = hasAnyPermission(permissions, requiredPermissions);
  }

  // 角色和权限都需要满足
  const canPerform = roleCheck && permissionCheck;

  logger.debug(`[权限检查] canPerformAction: 角色检查=${roleCheck}, 权限检查=${permissionCheck}, 结果=${canPerform}`);

  return canPerform;
}

/**
 * 获取用户的主角色
 * @param {string|Array} roles - 用户角色
 * @returns {string} - 主角色代码
 */
export function getPrimaryRole(roles) {
  if (!roles) {
    return null;
  }

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const normalizedRoles = normalizeRoles(rolesArray);

  // 按优先级返回角色
  const rolePriority = [ROLES.ADMIN, ROLES.OPERATOR, ROLES.TECHNICIAN, ROLES.VIEWER];

  for (const priorityRole of rolePriority) {
    if (normalizedRoles.includes(priorityRole)) {
      return priorityRole;
    }
  }

  return normalizedRoles[0] || null;
}

/**
 * 检查是否是管理员
 * @param {string|Array} roles - 用户角色
 * @returns {boolean} - 是否是管理员
 */
export function isAdmin(roles) {
  return hasRole(roles, ROLES.ADMIN);
}

/**
 * 检查是否是操作员
 * @param {string|Array} roles - 用户角色
 * @returns {boolean} - 是否是操作员
 */
export function isOperator(roles) {
  return hasRole(roles, ROLES.OPERATOR);
}

/**
 * 检查是否是技术员
 * @param {string|Array} roles - 用户角色
 * @returns {boolean} - 是否是技术员
 */
export function isTechnician(roles) {
  return hasRole(roles, ROLES.TECHNICIAN);
}

/**
 * 检查是否是查看者
 * @param {string|Array} roles - 用户角色
 * @returns {boolean} - 是否是查看者
 */
export function isViewer(roles) {
  return hasRole(roles, ROLES.VIEWER);
}

// 导出角色常量供外部使用
export { ROLES, PERMISSION_CODES };
