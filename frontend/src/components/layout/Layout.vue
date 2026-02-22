<!--
  @file: Layout.vue
  @description: 主布局组件，包含侧边栏、顶部导航栏、面包屑导航和页面内容区域
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div class="layout-container" data-cy="app-layout">
    <!-- 移动端遮罩层 -->
    <div
      class="mobile-overlay"
      v-if="isMobile && mobileOpen"
      @click="closeMobileSidebar"
      data-cy="mobile-overlay"
    ></div>

    <!-- 侧边栏导航 -->
    <Sidebar ref="sidebarRef" data-cy="sidebar" />

    <!-- 主内容区 -->
    <main class="layout-main" :class="{ collapsed: sidebarCollapsed }">
      <!-- 顶部导航栏 -->
      <Header @toggle-sidebar="toggleSidebar" data-cy="header" />

      <!-- 面包屑导航 -->
      <Breadcrumb data-cy="page-breadcrumb" />

      <!-- 页面内容 -->
      <div class="layout-content" data-cy="main-content">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.fullPath" v-if="route.meta.keepAlive !== false" />
          </keep-alive>
          <component :is="Component" :key="route.fullPath" v-if="route.meta.keepAlive === false" />
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import Breadcrumb from '../base/Breadcrumb.vue';

import Header from './Header.vue';
import Sidebar from './Sidebar.vue';

import { useLayoutStore } from '@/stores/layout';

const route = useRoute();
const layoutStore = useLayoutStore();
const sidebarRef = ref(null);

const sidebarCollapsed = computed(() => layoutStore?.sidebarCollapse ?? false);
const isMobile = computed(() => layoutStore?.isMobile ?? false);
const mobileOpen = ref(false);

const cachedViews = ref(['Dashboard', 'DeviceList', 'InventoryRecords', 'BinManagement']);

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileOpen.value = !mobileOpen.value;
  } else if (sidebarRef.value) {
    sidebarRef.value.toggleSidebar();
  }
};

const closeMobileSidebar = () => {
  mobileOpen.value = false;
};

const addCachedView = (viewName) => {
  if (!cachedViews.value.includes(viewName)) {
    cachedViews.value.push(viewName);
  }
};

watch(
  () => route.name,
  (newName) => {
    if (newName && route.meta.keepAlive !== false) {
      addCachedView(newName);
    }
  }
);

onMounted(() => {
  layoutStore.initLayout();
});

onUnmounted(() => {
  layoutStore.cleanup();
});
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.layout-main.collapsed {
  margin-left: 64px;
}

.layout-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .layout-main {
    margin-left: 0;
  }

  .layout-main.collapsed {
    margin-left: 0;
  }
}
</style>
