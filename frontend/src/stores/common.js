import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCommonStore = defineStore('common', () => {
  // 状态定义
  const cachedRoutes = ref([]); // 缓存的路由组件
  const theme = ref('dark'); // 当前主题
  const sidebarCollapsed = ref(false); // 侧边栏折叠状态
  const sidebarExpandedMobile = ref(false); // 移动端侧边栏展开状态
  const headerFixed = ref(true); // 头部是否固定
  const currentLanguage = ref('zh-CN'); // 当前语言
  const layoutMode = ref('left'); // 布局模式
  const breadcrumbVisible = ref(true); // 面包屑可见性
  const pageAnimations = ref('fade'); // 页面切换动画
  const globalSettings = ref({}); // 全局设置
  const errorLog = ref([]); // 错误日志
  const recentVisits = ref([]); // 最近访问记录

  // 使用本地存储保存部分状态
  const savedTheme = useLocalStorage('warehouse-theme', 'dark');
  const savedSidebarCollapsed = useLocalStorage('warehouse-sidebar-collapsed', false);

  // 初始化时从本地存储恢复状态
  theme.value = savedTheme.value ?? 'dark';
  sidebarCollapsed.value = savedSidebarCollapsed.value ?? false;

  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark');
  const isLightTheme = computed(() => theme.value === 'light');
  const sidebarWidth = computed(() => (sidebarCollapsed.value ? '64px' : '200px'));
  const mainContentWidth = computed(() => (sidebarCollapsed.value ? 'calc(100% - 64px)' : 'calc(100% - 200px)'));

  // 操作方法

  // 添加路由到缓存
  function addCachedRoute(routeName) {
    if (routeName && !cachedRoutes.value.includes(routeName)) {
      cachedRoutes.value.push(routeName);
    }
  }

  // 移除缓存的路由
  function removeCachedRoute(routeName) {
    const index = cachedRoutes.value.indexOf(routeName);
    if (index > -1) {
      cachedRoutes.value.splice(index, 1);
    }
  }

  // 清空路由缓存
  function clearCachedRoutes() {
    cachedRoutes.value = [];
  }

  // 更新缓存的路由列表
  function updateCachedRoutes(routes) {
    if (Array.isArray(routes)) {
      cachedRoutes.value = routes;
    }
  }

  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    savedTheme.value = theme.value;
    applyTheme();
  }

  // 设置主题
  function setTheme(newTheme) {
    if (['dark', 'light'].includes(newTheme)) {
      theme.value = newTheme;
      savedTheme.value = newTheme;
      applyTheme();
    }
  }

  // 应用主题到页面
  function applyTheme() {
    const html = document.documentElement;
    if (theme.value === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    // 可以在这里添加更多主题相关的样式应用逻辑
  }

  // 切换侧边栏折叠状态
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    savedSidebarCollapsed.value = sidebarCollapsed.value;
  }

  // 切换移动端侧边栏展开状态
  function toggleSidebarMobile() {
    sidebarExpandedMobile.value = !sidebarExpandedMobile.value;
  }

  // 关闭移动端侧边栏
  function closeSidebarMobile() {
    sidebarExpandedMobile.value = false;
  }

  // 设置侧边栏折叠状态
  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = !!collapsed;
    savedSidebarCollapsed.value = sidebarCollapsed.value;
  }

  // 切换头部固定状态
  function toggleHeaderFixed() {
    headerFixed.value = !headerFixed.value;
  }

  // 设置语言
  function setLanguage(lang) {
    if (['zh-CN', 'en-US'].includes(lang)) {
      currentLanguage.value = lang;
      // 这里可以添加国际化切换逻辑
    }
  }

  // 设置布局模式
  function setLayoutMode(mode) {
    if (['left', 'top', 'mix'].includes(mode)) {
      layoutMode.value = mode;
    }
  }

  // 切换面包屑可见性
  function toggleBreadcrumb() {
    breadcrumbVisible.value = !breadcrumbVisible.value;
  }

  // 设置页面切换动画
  function setPageAnimations(animation) {
    const validAnimations = ['fade', 'slide', 'zoom', 'flip', 'none'];
    if (validAnimations.includes(animation)) {
      pageAnimations.value = animation;
    }
  }

  // 更新全局设置
  function updateGlobalSettings(settings) {
    if (typeof settings === 'object' && settings !== null) {
      globalSettings.value = { ...globalSettings.value, ...settings };
    }
  }

  // 重置全局设置
  function resetGlobalSettings() {
    globalSettings.value = {};
  }

  // 添加错误日志
  function addErrorLog(errorInfo) {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...errorInfo,
    };
    errorLog.value.unshift(log);
    // 限制错误日志数量
    if (errorLog.value.length > 100) {
      errorLog.value.splice(100);
    }
    // 可以在这里添加错误上报逻辑
  }

  // 清空错误日志
  function clearErrorLogs() {
    errorLog.value = [];
  }

  // 添加访问记录
  function addRecentVisit(routeInfo) {
    const { path, name, meta = {} } = routeInfo;
    const visit = {
      path,
      name,
      title: meta.title || name || path,
      icon: meta.icon,
      timestamp: Date.now(),
    };

    // 移除重复的记录
    const index = recentVisits.value.findIndex((v) => v.path === path);
    if (index > -1) {
      recentVisits.value.splice(index, 1);
    }

    // 添加到开头
    recentVisits.value.unshift(visit);

    // 限制访问记录数量
    if (recentVisits.value.length > 20) {
      recentVisits.value.splice(20);
    }
  }

  // 清空访问记录
  function clearRecentVisits() {
    recentVisits.value = [];
  }

  // 获取最近访问的前N条记录
  function getRecentVisits(limit = 10) {
    return recentVisits.value.slice(0, limit);
  }

  // 初始化方法
  function init() {
    // 应用保存的主题
    applyTheme();

    // 可以在这里添加其他初始化逻辑
  }

  // 重置所有状态
  function reset() {
    cachedRoutes.value = [];
    theme.value = 'dark';
    sidebarCollapsed.value = false;
    sidebarExpandedMobile.value = false;
    headerFixed.value = true;
    currentLanguage.value = 'zh-CN';
    layoutMode.value = 'left';
    breadcrumbVisible.value = true;
    pageAnimations.value = 'fade';
    globalSettings.value = {};
    errorLog.value = [];
    recentVisits.value = [];

    // 重置本地存储
    savedTheme.value = 'dark';
    savedSidebarCollapsed.value = false;

    // 重新应用主题
    applyTheme();
  }

  // 暴露状态和方法
  return {
    // 状态
    cachedRoutes,
    theme,
    sidebarCollapsed,
    sidebarExpandedMobile,
    headerFixed,
    currentLanguage,
    layoutMode,
    breadcrumbVisible,
    pageAnimations,
    globalSettings,
    errorLog,
    recentVisits,

    // 计算属性
    isDarkTheme,
    isLightTheme,
    sidebarWidth,
    mainContentWidth,

    // 方法
    addCachedRoute,
    removeCachedRoute,
    clearCachedRoutes,
    updateCachedRoutes,
    toggleTheme,
    setTheme,
    toggleSidebar,
    toggleSidebarMobile,
    closeSidebarMobile,
    setSidebarCollapsed,
    toggleHeaderFixed,
    setLanguage,
    setLayoutMode,
    toggleBreadcrumb,
    setPageAnimations,
    updateGlobalSettings,
    resetGlobalSettings,
    addErrorLog,
    clearErrorLogs,
    addRecentVisit,
    clearRecentVisits,
    getRecentVisits,
    init,
    reset,
  };
});
