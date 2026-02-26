/**
 * 权限指令
 * 用于控制元素的显示/隐藏，基于用户角色和权限
 * @file: permission.js
 * @description: Vue自定义指令，实现细粒度的权限控制
 * @version: 1.0.0
 */

import { hasRole, hasAnyRole, hasPermission, isAdmin } from '@/utils/permission.js';
import { useUserStore } from '@/stores/user';

/**
 * 获取用户角色和权限
 * @returns {Object} - 用户角色和权限信息
 */
function getUserAuthInfo() {
  const userStore = useUserStore();
  return {
    roles: userStore.userInfo?.roles || [],
    permissions: userStore.userInfo?.permissions || [],
    isAdmin: isAdmin(userStore.userInfo?.roles || []),
  };
}

/**
 * 检查权限
 * @param {Object} binding - 指令绑定对象
 * @returns {boolean} - 是否有权限
 */
function checkPermission(binding) {
  const { value, modifiers } = binding;
  const { roles, permissions, isAdmin: userIsAdmin } = getUserAuthInfo();

  // 管理员拥有所有权限
  if (userIsAdmin && !modifiers.strict) {
    return true;
  }

  // 如果没有值，默认显示
  if (!value) {
    return true;
  }

  // 处理字符串格式的角色
  if (typeof value === 'string') {
    return hasRole(roles, value);
  }

  // 处理对象格式
  if (typeof value === 'object') {
    const { role, roles: requiredRoles, permission, permissions: requiredPermissions, logic = 'or' } = value;

    const checks = [];

    // 检查单个角色
    if (role) {
      checks.push(hasRole(roles, role));
    }

    // 检查多个角色
    if (requiredRoles && Array.isArray(requiredRoles)) {
      checks.push(hasAnyRole(roles, requiredRoles));
    }

    // 检查单个权限
    if (permission) {
      checks.push(hasPermission(permissions, permission));
    }

    // 检查多个权限
    if (requiredPermissions && Array.isArray(requiredPermissions)) {
      const hasAnyPerm = requiredPermissions.some((perm) => hasPermission(permissions, perm));
      checks.push(hasAnyPerm);
    }

    if (checks.length === 0) {
      return true;
    }

    // 根据逻辑判断
    return logic === 'and' ? checks.every(Boolean) : checks.some(Boolean);
  }

  return false;
}

/**
 * v-permission 指令
 * 用法：
 *   v-permission="'ADMIN'" - 仅管理员可见
 *   v-permission="{ role: 'ADMIN' }" - 仅管理员可见
 *   v-permission="{ roles: ['ADMIN', 'OPERATOR'] }" - 管理员或操作员可见
 *   v-permission="{ permission: 'user:create' }" - 有创建用户权限可见
 *   v-permission="{ role: 'ADMIN', permission: 'user:create', logic: 'and' }" - 同时满足
 *   v-permission.strict="'ADMIN'" - 即使是管理员也要严格检查
 */
export const permission = {
  mounted(el, binding) {
    const hasPerm = checkPermission(binding);
    if (!hasPerm) {
      el.style.display = 'none';
      el._permission_removed = true;
    }
  },
  updated(el, binding) {
    const hasPerm = checkPermission(binding);
    if (hasPerm) {
      el.style.display = '';
      el._permission_removed = false;
    } else {
      el.style.display = 'none';
      el._permission_removed = true;
    }
  },
};

/**
 * v-permission-if 指令
 * 与 v-permission 类似，但使用 DOM 移除而不是 display:none
 * 用法：
 *   v-permission-if="'ADMIN'" - 仅管理员存在
 */
export const permissionIf = {
  mounted(el, binding) {
    const hasPerm = checkPermission(binding);
    if (!hasPerm) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * v-role 指令（简化版）
 * 仅检查角色
 * 用法：
 *   v-role="'ADMIN'" - 仅管理员可见
 *   v-role="['ADMIN', 'OPERATOR']" - 管理员或操作员可见
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding;
    const { roles } = getUserAuthInfo();

    let hasPerm = false;
    if (typeof value === 'string') {
      hasPerm = hasRole(roles, value);
    } else if (Array.isArray(value)) {
      hasPerm = hasAnyRole(roles, value);
    }

    if (!hasPerm) {
      el.style.display = 'none';
    }
  },
  updated(el, binding) {
    const { value } = binding;
    const { roles } = getUserAuthInfo();

    let hasPerm = false;
    if (typeof value === 'string') {
      hasPerm = hasRole(roles, value);
    } else if (Array.isArray(value)) {
      hasPerm = hasAnyRole(roles, value);
    }

    el.style.display = hasPerm ? '' : 'none';
  },
};

export default {
  permission,
  permissionIf,
  role,
};
