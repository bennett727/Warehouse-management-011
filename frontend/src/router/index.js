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

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 仓库管理系统` : '仓库管理系统';

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  // 公开页面直接放行
  if (to.meta.public) {
    next();
    return;
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 检查是否有token且token有效
    if (!userStore.token || tokenManager.isAccessTokenExpired()) {
      logger.debug('路由守卫：未找到有效token，跳转到登录页');
      if (userStore.token) {
        logger.debug('路由守卫：token已过期');
      }
      ElMessage.warning('请先登录');
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 检查用户信息是否已加载
    if (!userStore.userInfo || !userStore.userInfo.userId) {
      logger.debug('[路由守卫] 用户信息未加载，开始获取用户信息');
      logger.debug('[路由守卫] userInfo:', userStore.userInfo);
      logger.debug('[路由守卫] userId:', userStore.userInfo?.userId);

      // 尝试从localStorage读取用户信息
      const storedUserInfo = localStorage.getItem('user_info');
      if (storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          logger.debug('[路由守卫] 从localStorage读取到用户信息:', parsedUserInfo);
          // 使用store的updateUserInfo方法更新用户信息
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
          logger.debug('[路由守卫] 用户信息已从localStorage恢复');
          // 等待响应式更新完成
          await new Promise((resolve) => setTimeout(resolve, 50));
          logger.debug('[路由守卫] 恢复后的userInfo:', userStore.userInfo);
        } catch (e) {
          logger.error('[路由守卫] 解析localStorage中的userInfo失败:', e);
        }
      } else {
        logger.warn('[路由守卫] localStorage中没有用户信息');
      }

      // 如果仍然没有用户信息，则从API获取
      if (!userStore.userInfo || !userStore.userInfo.userId) {
        try {
          logger.debug('路由守卫：从API获取用户信息...');
          await userStore.fetchUserInfo();
          logger.debug('路由守卫：用户信息获取成功', userStore.userInfo);
          logger.debug('[路由守卫] 用户信息获取成功');
        } catch (error) {
          logger.error('获取用户信息失败:', error);
          logger.debug('路由守卫：清除登录状态，跳转到登录页');
          tokenManager.clearTokens();
          userStore.logout();
          next({
            path: '/login',
            query: { redirect: to.fullPath },
          });
          return;
        }
      }
    }

    // 再次检查用户信息是否完整
    logger.debug('[路由守卫] 检查用户信息完整性');
    logger.debug('[路由守卫] userStore.userInfo:', userStore.userInfo);
    logger.debug('[路由守卫] userId:', userStore.userInfo?.userId);
    logger.debug('[路由守卫] roles:', userStore.userInfo?.roles);
    if (
      !userStore.userInfo ||
      !userStore.userInfo.userId ||
      !userStore.userInfo.roles ||
      userStore.userInfo.roles.length === 0
    ) {
      logger.warn('路由守卫：用户信息不完整', userStore.userInfo);
      logger.debug('路由守卫：清除登录状态，跳转到登录页');
      userStore.logout();
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 检查角色权限
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userRoles = normalizeRoles(userStore.userInfo?.roles || []);
      const requiredRoles = to.meta.roles.map((role) => role.toLowerCase());
      logger.debug('[路由守卫] 检查角色权限');
      logger.debug('[路由守卫] 用户角色:', userRoles);
      logger.debug('[路由守卫] 需要角色:', requiredRoles);
      if (userRoles.length === 0) {
        logger.warn(`用户 ${userStore.userInfo?.username} 没有分配角色`);
        next({ path: '/403' });
        return;
      }

      const hasPermission = requiredRoles.some((role) => {
        return userRoles.includes(role);
      });

      if (!hasPermission) {
        logger.warn(
          `用户 ${userStore.userInfo?.username} (角色: ${userRoles.join(', ')}) 没有权限访问 ${to.path} (需要角色: ${requiredRoles.join(', ')})`
        );
        next({ path: '/403' });
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

// 路由错误处理
router.onError((error) => {
  logger.error('路由错误:', error);
  ElMessage.error('页面加载失败，请稍后重试');
});

export default router;
