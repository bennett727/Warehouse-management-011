import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { getLocalItem, setLocalItem } from '@/utils/cache.js';
import { getWindowWidth } from '@/utils/helpers';

export const useLayoutStore = defineStore('layout', () => {
  // 状态
  const sidebarCollapse = ref(false);
  const theme = ref('dark'); // 默认暗黑主题
  const breadcrumb = ref([]);
  const deviceType = ref('desktop');

  // 计算属性
  const isMobile = computed(() => deviceType.value === 'mobile');
  const isTablet = computed(() => deviceType.value === 'tablet');
  const isDesktop = computed(() => deviceType.value === 'desktop');
  const sidebarWidth = computed(() => (sidebarCollapse.value ? '64px' : '200px'));

  // 方法
  const toggleSidebar = () => {
    sidebarCollapse.value = !sidebarCollapse.value;
    setLocalItem('sidebarCollapse', sidebarCollapse.value.toString());
  };

  const setSidebarCollapse = (collapse) => {
    sidebarCollapse.value = collapse;
    setLocalItem('sidebarCollapse', collapse.toString());
  };

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    setLocalItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setBreadcrumb = (routes) => {
    breadcrumb.value = routes;
  };

  const setDeviceType = () => {
    const width = getWindowWidth();
    if (width < 768) {
      deviceType.value = 'mobile';
    } else if (width < 1024) {
      deviceType.value = 'tablet';
    } else {
      deviceType.value = 'desktop';
    }

    // 在移动设备上默认折叠侧边栏
    if (deviceType.value === 'mobile' && !sidebarCollapse.value) {
      sidebarCollapse.value = true;
    }
  };

  // 初始化
  const initLayout = () => {
    // 从localStorage恢复侧边栏状态
    const savedCollapse = getLocalItem('sidebarCollapse');
    if (savedCollapse !== null) {
      sidebarCollapse.value = savedCollapse === 'true';
    }

    // 从localStorage恢复主题设置
    const savedTheme = getLocalItem('theme');
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // 默认使用暗黑主题
      theme.value = 'dark';
    }

    // 设置主题
    document.documentElement.setAttribute('data-theme', theme.value);

    // 初始化设备类型
    setDeviceType();

    // 监听窗口大小变化
    window.addEventListener('resize', setDeviceType);
  };

  // 清理
  const cleanup = () => {
    window.removeEventListener('resize', setDeviceType);
  };

  return {
    // 状态
    sidebarCollapse,
    theme,
    breadcrumb,
    deviceType,

    // 计算属性
    isMobile,
    isTablet,
    isDesktop,
    sidebarWidth,

    // 方法
    toggleSidebar,
    setSidebarCollapse,
    setTheme,
    setBreadcrumb,
    setDeviceType,
    initLayout,
    cleanup,
  };
});
