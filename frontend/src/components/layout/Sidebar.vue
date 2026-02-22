<!--
  @file: Sidebar.vue
  @description: 优化后的侧边栏导航组件，采用科学的功能分类体系
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <aside class="layout-sidebar" :class="{ collapsed: sidebarCollapsed }" data-cy="sidebar">
    <div class="sidebar-header">
      <div class="logo-container" v-show="!sidebarCollapsed">
        <el-icon class="logo-icon" :size="28">
          <Goods />
        </el-icon>
        <h2 class="sidebar-title">仓库管理系统</h2>
      </div>
      <el-icon class="logo-icon-collapsed" :size="28" v-show="sidebarCollapsed">
        <Goods />
      </el-icon>
    </div>

    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#001529"
      text-color="rgba(255, 255, 255, 0.85)"
      active-text-color="#fff"
      router
      data-cy="main-menu"
    >
      <!-- 首页 -->
      <el-menu-item index="/dashboard" data-cy="menu-dashboard">
        <el-icon><House /></el-icon>
        <span v-show="!sidebarCollapsed">首页</span>
      </el-menu-item>

      <!-- 资产管理 -->
      <el-sub-menu index="/asset-management" data-cy="menu-asset-management">
        <template #title>
          <el-icon><Box /></el-icon>
          <span v-show="!sidebarCollapsed">资产管理</span>
        </template>
        <el-menu-item index="/asset-management/device-ledger" data-cy="menu-device-ledger">
          <el-icon><Document /></el-icon>
          <span>设备台账</span>
        </el-menu-item>
        <el-menu-item index="/asset-management/device-list" data-cy="menu-device-list">
          <el-icon><List /></el-icon>
          <span>设备列表</span>
        </el-menu-item>
        <el-menu-item index="/asset-management/device-types" data-cy="menu-device-types">
          <el-icon><Collection /></el-icon>
          <span>设备类型</span>
        </el-menu-item>
        <el-menu-item index="/asset-management/device-status" data-cy="menu-device-status">
          <el-icon><CircleCheck /></el-icon>
          <span>状态审批</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 库存管理 -->
      <el-sub-menu index="/inventory-management" data-cy="menu-inventory">
        <template #title>
          <el-icon><Box /></el-icon>
          <span v-show="!sidebarCollapsed">库存管理</span>
        </template>

        <!-- 库存操作 -->
        <el-menu-item-group title="库存操作">
          <el-menu-item index="/inventory-management/inbound" data-cy="menu-inbound">
            <el-icon><Download /></el-icon>
            <span>入库管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/outbound" data-cy="menu-outbound">
            <el-icon><Upload /></el-icon>
            <span>出库管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/transfer" data-cy="menu-transfer">
            <el-icon><Switch /></el-icon>
            <span>库存调拨</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/count" data-cy="menu-count">
            <el-icon><Checked /></el-icon>
            <span>库存盘点</span>
          </el-menu-item>
        </el-menu-item-group>

        <!-- 库存监控 -->
        <el-menu-item-group title="库存监控">
          <el-menu-item index="/inventory-management/stock-status" data-cy="menu-stock-status">
            <el-icon><View /></el-icon>
            <span>库存状态</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/alerts" data-cy="menu-alerts">
            <el-icon><Warning /></el-icon>
            <span>库存预警</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/batch" data-cy="menu-batch">
            <el-icon><Calendar /></el-icon>
            <span>批次管理</span>
          </el-menu-item>
        </el-menu-item-group>

        <!-- 库存基础数据 -->
        <el-menu-item-group title="库存基础数据">
          <el-menu-item index="/inventory-management/warehouse" data-cy="menu-warehouse">
            <el-icon><House /></el-icon>
            <span>仓库管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/warehouse/zone-type" data-cy="menu-zone-type">
            <el-icon><Collection /></el-icon>
            <span>功能区类型</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/warehouse/map" data-cy="menu-warehouse-map">
            <el-icon><MapLocation /></el-icon>
            <span>仓库地图</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/bin" data-cy="menu-bin">
            <el-icon><Grid /></el-icon>
            <span>货位管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory-management/area" data-cy="menu-area">
            <el-icon><Location /></el-icon>
            <span>区域管理</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <!-- 业务记录 -->
      <el-sub-menu index="/business-records" data-cy="menu-business">
        <template #title>
          <el-icon><Files /></el-icon>
          <span v-show="!sidebarCollapsed">业务记录</span>
        </template>
        <el-menu-item index="/business-records/installation" data-cy="menu-installation">
          <el-icon><SetUp /></el-icon>
          <span>安装记录</span>
        </el-menu-item>
        <el-menu-item index="/business-records/repair" data-cy="menu-repair">
          <el-icon><Tools /></el-icon>
          <span>维修记录</span>
        </el-menu-item>
        <el-menu-item index="/business-records/maintenance" data-cy="menu-maintenance">
          <el-icon><Brush /></el-icon>
          <span>保养记录</span>
        </el-menu-item>
        <el-menu-item index="/business-records/scrap" data-cy="menu-scrap">
          <el-icon><Delete /></el-icon>
          <span>报废记录</span>
        </el-menu-item>
        <el-menu-item index="/business-records/inventory-history" data-cy="menu-inventory-history">
          <el-icon><Clock /></el-icon>
          <span>库存记录</span>
        </el-menu-item>
        <el-menu-item index="/business-management" data-cy="menu-business-management">
          <el-icon><List /></el-icon>
          <span>业务管理中心</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 查询统计 -->
      <el-sub-menu index="/query-stats" data-cy="menu-query-stats">
        <template #title>
          <el-icon><Search /></el-icon>
          <span v-show="!sidebarCollapsed">查询统计</span>
        </template>
        <el-menu-item index="/query-stats/comprehensive" data-cy="menu-comprehensive-query">
          <el-icon><Filter /></el-icon>
          <span>综合查询</span>
        </el-menu-item>
        <el-menu-item index="/query-stats/reports" data-cy="menu-reports">
          <el-icon><TrendCharts /></el-icon>
          <span>数据报表</span>
        </el-menu-item>
        <el-menu-item index="/query-stats/analysis" data-cy="menu-analysis">
          <el-icon><DataLine /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 系统管理 -->
      <el-sub-menu v-if="isAdmin" index="/system" data-cy="menu-system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span v-show="!sidebarCollapsed">系统管理</span>
        </template>

        <!-- 权限管理 -->
        <el-menu-item-group title="权限管理">
          <el-menu-item index="/system/users" data-cy="menu-users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/roles" data-cy="menu-roles">
            <el-icon><UserFilled /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
        </el-menu-item-group>

        <!-- 系统配置 -->
        <el-menu-item-group title="系统配置">
          <el-menu-item index="/system/config" data-cy="menu-config">
            <el-icon><Operation /></el-icon>
            <span>系统参数</span>
          </el-menu-item>
          <el-menu-item index="/system/alert-config" data-cy="menu-alert-config">
            <el-icon><Bell /></el-icon>
            <span>预警配置</span>
          </el-menu-item>
          <el-menu-item index="/system/logs" data-cy="menu-logs">
            <el-icon><DocumentCopy /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-menu-item-group>

        <!-- 基础数据 -->
        <el-menu-item-group title="基础数据">
          <el-menu-item index="/basic-data/administrative-division" data-cy="menu-administrative-division">
            <el-icon><MapLocation /></el-icon>
            <span>行政区划</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <!-- 个人中心 -->
      <el-menu-item index="/user-center" data-cy="menu-user-center">
        <el-icon><Avatar /></el-icon>
        <span v-show="!sidebarCollapsed">个人中心</span>
      </el-menu-item>

      <!-- 帮助中心 -->
      <el-menu-item index="/help-center" data-cy="menu-help">
        <el-icon><QuestionFilled /></el-icon>
        <span v-show="!sidebarCollapsed">帮助中心</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup>
import {
  Avatar,
  Bell,
  Box,
  Brush,
  Calendar,
  Checked,
  CircleCheck,
  Clock,
  Collection,
  DataLine,
  Delete,
  Document,
  DocumentCopy,
  Download,
  Files,
  Filter,
  Goods,
  Grid,
  House,
  List,
  Location,
  MapLocation,
  Operation,
  QuestionFilled,
  Search,
  Setting,
  SetUp,
  Switch,
  Tools,
  TrendCharts,
  Upload,
  User,
  UserFilled,
  View,
  Warning,
} from '@element-plus/icons-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useLayoutStore } from '@/stores/layout';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();
const layoutStore = useLayoutStore();

const isAdmin = computed(() => {
  const roles = userStore?.userInfo?.roles || [];
  return roles.some((role) => role.toLowerCase() === 'admin');
});
const sidebarCollapsed = computed(() => layoutStore?.sidebarCollapse ?? false);
const activeMenu = computed(() => route.path);

const toggleSidebar = () => {
  layoutStore.toggleSidebar();
};

defineExpose({
  toggleSidebar,
});
</script>

<style scoped>
.layout-sidebar {
  width: 260px;
  height: 100vh;
  background-color: #001529;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.layout-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #002140 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.logo-icon {
  color: #1890ff;
  flex-shrink: 0;
}

.logo-icon-collapsed {
  color: #1890ff;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

/* 菜单项样式优化 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  transition: all 0.3s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(24, 144, 255, 0.15) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  border-right: 3px solid #fff;
}

/* 子菜单分组标题样式 */
:deep(.el-menu-item-group__title) {
  padding: 12px 20px 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 图标样式 */
:deep(.el-icon) {
  font-size: 18px;
  margin-right: 8px;
}

/* 折叠状态下的样式 */
.layout-sidebar.collapsed :deep(.el-sub-menu__title span),
.layout-sidebar.collapsed :deep(.el-menu-item span) {
  display: none;
}

.layout-sidebar.collapsed :deep(.el-menu-item-group__title) {
  display: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .layout-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .layout-sidebar.mobile-open {
    transform: translateX(0);
  }

  .layout-sidebar.collapsed {
    width: 260px;
    transform: translateX(-100%);
  }

  .layout-sidebar.collapsed.mobile-open {
    transform: translateX(0);
  }

  .layout-sidebar.collapsed :deep(.el-sub-menu__title span),
  .layout-sidebar.collapsed :deep(.el-menu-item span) {
    display: inline;
  }

  .layout-sidebar.collapsed :deep(.el-menu-item-group__title) {
    display: block;
  }
}
</style>
