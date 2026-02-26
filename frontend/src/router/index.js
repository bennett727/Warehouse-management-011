/*
 * @file: index.js
 * @description: 路由配置文件，定义应用的所有路由和导航守卫
 * @author: 开发团队
 * @createTime: 2025-12-21
 * @version: 3.0.0
 * @modifyRecords:
 *     2025-12-21: 初始版本创建
 *     2026-01-10: 优化路由结构，移除冗余路由，简化路由守卫
 *     2026-02-06: 重构菜单路由，采用新的分类体系
 */
import { ElMessage } from 'element-plus';
import { createRouter, createWebHistory } from 'vue-router';

import { menuRoutes } from './menu-routes';
import { normalizeRoles } from './route-permissions.js';

import { usePermissionStore } from '@/stores/permission';
import { useUserStore } from '@/stores/user';
import { createLogger } from '@/utils/logger';
import tokenManager from '@/utils/tokenManager';

const logger = createLogger('Router');

// 基础路由配置
const baseRoutes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import(/* webpackChunkName: "layout" */ '@/components/layout/Layout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
    },
    children: [
      // 首页
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'House',
          keepAlive: true,
          preload: true,
        },
      },
      // 整合新的菜单路由
      ...menuRoutes,
      // 设备列表别名路由（兼容旧路径）
      {
        path: '/device/list',
        name: 'DeviceListAlias',
        component: () => import(/* webpackChunkName: "device-list" */ '@/views/device/DeviceList.vue'),
        meta: {
          title: '设备列表',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'List',
          keepAlive: true,
        },
      },
      // 仓库地图别名路由（兼容旧路径）
      {
        path: '/warehouse/map',
        name: 'WarehouseMapAlias',
        component: () => import(/* webpackChunkName: "warehouse-map" */ '@/views/warehouse/map/index.vue'),
        meta: {
          title: '仓库地图',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'MapLocation',
          keepAlive: true,
        },
      },
      // 功能区管理别名路由（兼容旧路径）
      {
        path: '/warehouse/zone',
        name: 'WarehouseZoneAlias',
        component: () => import(/* webpackChunkName: "warehouse-zone" */ '@/views/warehouse/zone/index.vue'),
        meta: {
          title: '功能区管理',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Grid',
          keepAlive: true,
        },
      },
      // 个人中心
      {
        path: '/user-center',
        name: 'UserCenter',
        component: () => import(/* webpackChunkName: "user-center" */ '@/views/user-center/UserCenter.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Avatar',
          keepAlive: true,
        },
      },
      // 帮助中心
      {
        path: '/help-center',
        name: 'HelpCenter',
        component: () => import(/* webpackChunkName: "help-center" */ '@/views/help/HelpCenter.vue'),
        meta: {
          title: '帮助中心',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'QuestionFilled',
          keepAlive: true,
        },
      },
    ],
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/Login.vue'),
    meta: {
      title: '登录',
      public: true,
    },
  },
  // 403 无权限页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import(/* webpackChunkName: "403" */ '@/views/403.vue'),
    meta: {
      title: '无权限访问',
      public: true,
    },
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "404" */ '@/views/404.vue'),
    meta: {
      title: '页面不存在',
      public: true,
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition);
        } else {
          resolve({ top: 0, left: 0 });
        }
      }, 0);
    });
  },
});

/**
 * 路由守卫 - 优化版本
 * 处理未登录用户的路由访问控制，确保重定向行为符合产品需求
 */
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 仓库管理系统` : '仓库管理系统';

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  // 公开页面直接放行
  if (to.meta.public) {
    // 如果已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && userStore.token && !tokenManager.isAccessTokenExpired()) {
      logger.debug('[路由守卫] 已登录用户访问登录页，重定向到仪表盘');
      next({ path: '/dashboard' });
      return;
    }
    next();
    return;
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 检查token是否存在且有效
    const hasValidToken = userStore.token && !tokenManager.isAccessTokenExpired();

    if (!hasValidToken) {
      logger.debug('[路由守卫] 未找到有效token，需要登录');

      // 清除可能过期的token
      if (userStore.token) {
        logger.debug('[路由守卫] token已过期，清除登录状态');
        tokenManager.clearTokens();
        userStore.logout();
      }

      // 显示登录提示（仅在非静默跳转时）
      if (from.path !== '/login') {
        ElMessage.warning('请先登录');
      }

      // 保存目标路径，登录后重定向
      const redirectPath = to.fullPath !== '/' ? to.fullPath : '/dashboard';
      logger.debug(`[路由守卫] 跳转到登录页，登录后重定向到: ${redirectPath}`);

      next({
        path: '/login',
        query: { redirect: redirectPath },
        replace: true, // 使用replace避免历史记录堆积
      });
      return;
    }

    // 检查并恢复用户信息
    const userInfoLoaded = await ensureUserInfoLoaded(userStore);

    if (!userInfoLoaded) {
      logger.warn('[路由守卫] 无法加载用户信息，跳转到登录页');
      tokenManager.clearTokens();
      userStore.logout();
      ElMessage.error('登录状态已失效，请重新登录');
      next({
        path: '/login',
        query: { redirect: to.fullPath },
        replace: true,
      });
      return;
    }

    // 检查角色权限
    if (to.meta.roles && to.meta.roles.length > 0) {
      const hasRoutePermission = checkRoutePermission(to, userStore.userInfo);

      if (!hasRoutePermission) {
        logger.warn(`[路由守卫] 用户 ${userStore.userInfo?.username} 无权限访问 ${to.path}`);
        next({ path: '/403', replace: true });
        return;
      }
    }
  }

  // 记录访问日志
  if (to.meta.requiresAuth) {
    permissionStore.addVisitedRoute(to);
  }

  next();
});

/**
 * 确保用户信息已加载
 * @param {Object} userStore - 用户store实例
 * @returns {Promise<boolean>} - 是否成功加载用户信息
 */
async function ensureUserInfoLoaded(userStore) {
  // 如果用户信息已存在且完整，直接返回
  if (userStore.userInfo?.userId && userStore.userInfo?.roles?.length > 0) {
    logger.debug('[路由守卫] 用户信息已存在且完整');
    return true;
  }

  logger.debug('[路由守卫] 用户信息不完整，尝试恢复');

  // 尝试从localStorage读取用户信息
  const storedUserInfo = localStorage.getItem('user_info');
  if (storedUserInfo) {
    try {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      logger.debug('[路由守卫] 从localStorage读取到用户信息');

      // 验证存储的用户信息是否完整
      if (parsedUserInfo.userId && parsedUserInfo.roles?.length > 0) {
        userStore.updateUserInfo({
          userId: parsedUserInfo.userId || parsedUserInfo.id || '',
          username: parsedUserInfo.username || '',
          realName: parsedUserInfo.realName || '',
          email: parsedUserInfo.email || '',
          phone: parsedUserInfo.phone || '',
          avatar: parsedUserInfo.avatar || '',
          roles: parsedUserInfo.roles || [],
          permissions: parsedUserInfo.permissions || [],
        });

        // 等待响应式更新完成
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (userStore.userInfo?.userId) {
          logger.debug('[路由守卫] 用户信息从localStorage恢复成功');
          return true;
        }
      } else {
        logger.warn('[路由守卫] localStorage中的用户信息不完整');
      }
    } catch (e) {
      logger.error('[路由守卫] 解析localStorage中的userInfo失败:', e);
    }
  }

  // 如果仍然没有用户信息，则从API获取
  try {
    logger.debug('[路由守卫] 从API获取用户信息...');
    await userStore.fetchUserInfo();

    if (userStore.userInfo?.userId && userStore.userInfo?.roles?.length > 0) {
      logger.debug('[路由守卫] 从API获取用户信息成功');
      return true;
    } else {
      logger.warn('[路由守卫] API返回的用户信息不完整');
      return false;
    }
  } catch (error) {
    logger.error('[路由守卫] 从API获取用户信息失败:', error);
    return false;
  }
}

/**
 * 检查用户是否有权限访问目标路由
 * @param {Object} to - 目标路由
 * @param {Object} userInfo - 用户信息
 * @returns {boolean} - 是否有权限
 */
function checkRoutePermission(to, userInfo) {
  const userRoles = normalizeRoles(userInfo?.roles || []);
  const requiredRoles = to.meta.roles.map((role) => role.toLowerCase());

  logger.debug('[路由守卫] 检查角色权限');
  logger.debug('[路由守卫] 用户角色:', userRoles);
  logger.debug('[路由守卫] 需要角色:', requiredRoles);

  if (userRoles.length === 0) {
    logger.warn(`[路由守卫] 用户 ${userInfo?.username} 没有分配角色`);
    return false;
  }

  const hasPermission = requiredRoles.some((role) => userRoles.includes(role));

  if (!hasPermission) {
    logger.warn(
      `[路由守卫] 用户 ${userInfo?.username} (角色: ${userRoles.join(', ')}) 没有权限访问 ${to.path} (需要角色: ${requiredRoles.join(', ')})`
    );
  }

  return hasPermission;
}

// 路由错误处理
router.onError((error) => {
  logger.error('路由错误:', error);
  ElMessage.error('页面加载失败，请稍后重试');
});

export default router;
