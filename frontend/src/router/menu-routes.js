/**
 * @file: menu-routes.js
 * @description: 优化后的路由配置，与新的菜单结构对应
 * @author: 开发团队
 * @version: 2.0.0
 */

/**
 * 菜单路由配置
 * 按照新的分类体系组织：
 * 1. 资产管理 - 设备全生命周期管理
 * 2. 库存管理 - 库存操作与监控
 * 3. 业务记录 - 安装、维修、保养、报废记录
 * 4. 查询统计 - 综合查询、报表、分析
 * 5. 系统管理 - 系统配置与权限
 */

export const menuRoutes = [
  // 资产管理模块
  {
    path: '/asset-management',
    name: 'AssetManagement',
    redirect: '/asset-management/device-ledger',
    meta: {
      title: '资产管理',
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
      icon: 'Box',
      order: 10,
    },
    children: [
      {
        path: 'device-ledger',
        name: 'DeviceLedger',
        component: () => import('@/views/inventory-management/DeviceLedger.vue'),
        meta: {
          title: '设备台账',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Document',
          keepAlive: true,
        },
      },
      {
        path: 'device-list',
        name: 'DeviceList',
        component: () => import('@/views/device/DeviceList.vue'),
        meta: {
          title: '设备列表',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'List',
          keepAlive: true,
        },
      },
      {
        path: 'device-types',
        name: 'DeviceTypes',
        component: () => import('@/views/system/device-types/DeviceTypes.vue'),
        meta: {
          title: '设备类型',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Collection',
          keepAlive: true,
        },
      },
      {
        path: 'device-status',
        name: 'DeviceStatusApproval',
        component: () => import('@/views/device/DeviceStatusApprovalPage.vue'),
        meta: {
          title: '设备状态审批',
          description: '审批设备状态变更申请（如入库审批、报废审批等）',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'CircleCheck',
          keepAlive: true,
        },
      },
    ],
  },

  // 库存管理模块
  {
    path: '/inventory-management',
    name: 'InventoryManagement',
    redirect: '/inventory-management/inbound',
    meta: {
      title: '库存管理',
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
      icon: 'Warehouse',
      order: 20,
    },
    children: [
      // 库存操作
      {
        path: 'inbound',
        name: 'Inbound',
        component: () => import('@/views/inventory-management/inbound/InboundManagementOptimized.vue'),
        meta: {
          title: '入库管理',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Download',
          group: '库存操作',
          keepAlive: true,
          description: '优化版入库管理，支持批量操作和执行确认',
        },
      },
      {
        path: 'outbound',
        name: 'Outbound',
        component: () => import('@/views/inventory-management/outbound/OutboundManagementOptimized.vue'),
        meta: {
          title: '出库管理',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Upload',
          group: '库存操作',
          keepAlive: true,
          description: '优化版出库管理，4步简化流程，集成统一状态机',
        },
      },

      {
        path: 'transfer',
        name: 'Transfer',
        component: () => import('@/views/inventory-management/stock-transfer/StockTransferPage.vue'),
        meta: {
          title: '库存调拨',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Switch',
          group: '库存操作',
          keepAlive: true,
        },
      },
      {
        path: 'count',
        name: 'StockCount',
        component: () => import('@/views/inventory-management/stock-count/StockCountPage.vue'),
        meta: {
          title: '库存盘点',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Checked',
          group: '库存操作',
          keepAlive: true,
        },
      },
      // 库存监控
      {
        path: 'stock-status',
        name: 'StockStatusDefinition',
        component: () => import('@/views/inventory-management/stock-status/DeviceStatusDictionaryPage.vue'),
        meta: {
          title: '设备状态字典',
          description: '查看系统支持的设备状态列表',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'View',
          group: '库存监控',
          keepAlive: true,
        },
      },
      {
        path: 'alerts',
        name: 'InventoryAlerts',
        component: () => import('@/views/inventory-management/InventoryAlerts.vue'),
        meta: {
          title: '库存预警',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Warning',
          group: '库存监控',
          keepAlive: true,
        },
      },
      {
        path: 'batch',
        name: 'BatchManagement',
        component: () => import('@/views/inventory-management/batch/BatchManagementPage.vue'),
        meta: {
          title: '批次管理',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Calendar',
          group: '库存监控',
          keepAlive: true,
        },
      },
      {
        path: 'bin',
        name: 'BinManagement',
        component: () => import('@/views/inventory-management/bin/BinManagement.vue'),
        meta: {
          title: '货位管理',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Grid',
          group: '库存监控',
          keepAlive: true,
        },
      },
      // 库存基础数据
      {
        path: 'warehouse',
        name: 'WarehouseManagement',
        component: () => import('@/views/warehouse/list/index.vue'),
        meta: {
          title: '仓库管理',
          description: '管理仓库基本信息、地理位置和库存容量',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'House',
          group: '库存基础数据',
          keepAlive: true,
        },
      },
      {
        path: 'warehouse/zone-type',
        name: 'WarehouseZoneType',
        component: () => import('@/views/warehouse/zone-type/index.vue'),
        meta: {
          title: '功能区类型',
          description: '管理仓库功能区的类型定义，支持自定义类型',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Collection',
          group: '库存基础数据',
          keepAlive: true,
        },
      },
      {
        path: 'warehouse/map',
        name: 'WarehouseMap',
        component: () => import('@/views/warehouse/map/index.vue'),
        meta: {
          title: '仓库地图',
          description: '在地图上查看仓库地理位置分布',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'MapLocation',
          group: '库存基础数据',
          keepAlive: true,
        },
      },
      {
        path: 'area',
        name: 'AreaManagement',
        component: () => import('@/views/inventory-management/area/AreaManagement.vue'),
        meta: {
          title: '区域管理',
          description: '管理仓库区域信息及库存统计',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'Location',
          group: '库存基础数据',
          keepAlive: true,
        },
      },
    ],
  },

  // 业务管理模块 - 整合业务记录与审批（新版统一界面）
  {
    path: '/business-management',
    name: 'BusinessManagement',
    component: () => import('@/views/business-management/UnifiedBusinessManagement.vue'),
    meta: {
      title: '业务管理中心',
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
      icon: 'Management',
      order: 28,
      description: '统一业务管理界面，整合业务记录与审批功能，支持无缝切换',
      keepAlive: true,
    },
  },

  // 业务记录模块 - 安装/维修/保养/报废/库存记录
  {
    path: '/business-records',
    name: 'BusinessRecords',
    redirect: '/business-records/installation',
    meta: {
      title: '业务记录',
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
      icon: 'Files',
      order: 30,
      description: '业务记录管理，包括安装、维修、保养、报废等记录',
    },
    children: [
      {
        path: 'installation',
        name: 'InstallationRecords',
        component: () => import('@/views/inventory-management/installation/InstallationPage.vue'),
        meta: {
          title: '安装记录',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'SetUp',
          keepAlive: true,
        },
      },
      {
        path: 'repair',
        name: 'RepairRecords',
        component: () => import('@/views/inventory-management/repair/RepairPage.vue'),
        meta: {
          title: '维修记录',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Tools',
          keepAlive: true,
        },
      },
      {
        path: 'maintenance',
        name: 'MaintenanceRecords',
        component: () => import('@/views/inventory-management/maintenance/MaintenancePage.vue'),
        meta: {
          title: '保养记录',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Brush',
          keepAlive: true,
        },
      },
      {
        path: 'scrap',
        name: 'ScrapRecords',
        component: () => import('@/views/inventory-management/scrap/ScrapPage.vue'),
        meta: {
          title: '报废记录',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Delete',
          keepAlive: true,
        },
      },
      {
        path: 'inventory-history',
        name: 'InventoryHistory',
        component: () => import('@/views/inventory-management/InventoryRecords.vue'),
        meta: {
          title: '库存记录',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Clock',
          keepAlive: true,
        },
      },
    ],
  },

  // 查询统计模块
  {
    path: '/query-stats',
    name: 'QueryStats',
    redirect: '/query-stats/comprehensive',
    meta: {
      title: '查询统计',
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
      icon: 'Search',
      order: 40,
    },
    children: [
      {
        path: 'comprehensive',
        name: 'ComprehensiveQuery',
        component: () => import('@/views/inventory-management/query/QueryPage.vue'),
        meta: {
          title: '综合查询',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'Filter',
          keepAlive: true,
        },
      },
      {
        path: 'reports',
        name: 'DataReports',
        component: () => import('@/views/reports/DataReportsPage.vue'),
        meta: {
          title: '数据报表',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR', 'VIEWER'],
          icon: 'TrendCharts',
          keepAlive: true,
        },
      },
      {
        path: 'analysis',
        name: 'DataAnalysis',
        component: () => import('@/views/reports/DataAnalysisPage.vue'),
        meta: {
          title: '数据分析',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'DataLine',
          keepAlive: true,
        },
      },
    ],
  },

  // 基础数据模块
  {
    path: '/basic-data',
    name: 'BasicData',
    redirect: '/basic-data/administrative-division',
    meta: {
      title: '基础数据',
      requiresAuth: true,
      roles: ['ADMIN', 'OPERATOR'],
      icon: 'DataLine',
      order: 45,
    },
    children: [
      {
        path: 'administrative-division',
        name: 'AdministrativeDivision',
        component: () => import('@/views/basic-data/administrative-division/index.vue'),
        meta: {
          title: '行政区划管理',
          description: '管理全国省市区行政区划数据，供仓库地址和设备安装地址选择使用',
          requiresAuth: true,
          roles: ['ADMIN', 'OPERATOR'],
          icon: 'MapLocation',
          keepAlive: true,
        },
      },
    ],
  },

  // 系统管理模块
  {
    path: '/system',
    name: 'System',
    redirect: '/system/users',
    meta: {
      title: '系统管理',
      requiresAuth: true,
      roles: ['ADMIN'],
      icon: 'Setting',
      order: 50,
    },
    children: [
      // 权限管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/system/users/Users.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'User',
          group: '权限管理',
          keepAlive: true,
        },
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/system/roles/Roles.vue'),
        meta: {
          title: '角色管理',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'UserFilled',
          group: '权限管理',
          keepAlive: true,
        },
      },
      // 系统配置
      {
        path: 'config',
        name: 'Config',
        component: () => import('@/views/system/config/Config.vue'),
        meta: {
          title: '系统参数',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'Operation',
          group: '系统配置',
          keepAlive: true,
        },
      },
      {
        path: 'alert-config',
        name: 'AlertConfig',
        component: () => import('@/views/inventory-management/alert-config/EnhancedAlertConfigPage.vue'),
        meta: {
          title: '预警配置',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'Bell',
          group: '系统配置',
          keepAlive: true,
        },
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/system/OperationLogsPage.vue'),
        meta: {
          title: '操作日志',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'DocumentCopy',
          group: '系统配置',
          keepAlive: true,
        },
      },
      // 行政区划管理
      {
        path: 'divisions',
        name: 'Divisions',
        component: () => import('@/views/system/division/DivisionManagement.vue'),
        meta: {
          title: '行政区划',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'MapLocation',
          group: '基础数据',
          keepAlive: true,
        },
      },
    ],
  },
];

/**
 * 获取扁平化的路由列表
 * @param {Array} routes - 路由配置数组
 * @returns {Array} 扁平化的路由列表
 */
export function flattenRoutes(routes, parentPath = '') {
  const result = [];

  routes.forEach((route) => {
    const fullPath = parentPath + route.path;
    const routeCopy = { ...route, fullPath };

    if (route.children) {
      result.push(...flattenRoutes(route.children, `${fullPath}/`));
    } else {
      result.push(routeCopy);
    }
  });

  return result;
}

/**
 * 根据路径获取路由信息
 * @param {string} path - 路由路径
 * @returns {Object|null} 路由信息
 */
export function getRouteByPath(path) {
  const flatRoutes = flattenRoutes(menuRoutes);
  return flatRoutes.find((route) => route.path === path || route.fullPath === path) || null;
}

/**
 * 获取菜单分组信息
 * @param {string} menuPath - 菜单路径
 * @returns {Array} 分组列表
 */
export function getMenuGroups(menuPath) {
  const menu = menuRoutes.find((route) => route.path === menuPath);
  if (!menu || !menu.children) {
    return [];
  }

  const groups = new Map();

  menu.children.forEach((child) => {
    const groupName = child.meta?.group || '默认分组';
    if (!groups.has(groupName)) {
      groups.set(groupName, {
        name: groupName,
        items: [],
      });
    }
    groups.get(groupName).items.push(child);
  });

  return Array.from(groups.values());
}

export default menuRoutes;
