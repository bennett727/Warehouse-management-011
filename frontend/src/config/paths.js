// 页面路径统一管理配置文件
// 所有页面跳转均应使用此文件中定义的路径常量

// 公共路由
export const PUBLIC_PATHS = {
  // 根路径
  ROOT: '/',
  // 登录页
  LOGIN: '/login',
  // 404页面
  NOT_FOUND: '/404',
  // 通用错误页面
  ERROR: '/error',
  // 个人资料页
  PROFILE: '/profile',
};

// 仪表盘路由
export const DASHBOARD_PATHS = {
  // 系统仪表盘
  DASHBOARD: '/dashboard',
};

// 设备管理路由
export const DEVICE_PATHS = {
  // 设备管理首页
  DEVICE: '/device',
  // 设备列表
  DEVICE_LIST: '/device/list',
  // 批量入库
  DEVICE_BATCH_INBOUND: '/device/batch-inbound',
  // 设备详情页带参数
  DEVICE_DETAIL_WITH_ID: (id) => `/device/${id}`,
  // 编辑设备页面
  DEVICE_EDIT: '/device/edit',
};

// 出入库管理路由
export const INVENTORY_PATHS = {
  // 出入库管理首页
  INVENTORY: '/inventory',
  // 采购入库
  INVENTORY_INBOUND: '/inventory/inbound',
  // 安装出库
  INVENTORY_OUTBOUND: '/inventory/outbound',
  // 维修归还
  INVENTORY_REPAIR_RETURN: '/inventory/repair-return',
  // 出入库记录
  INVENTORY_RECORD: '/inventory/record',
  // 入库记录
  INVENTORY_INBOUND_LIST: '/inventory/inbound-list',
  // 出库记录
  INVENTORY_OUTBOUND_LIST: '/inventory/outbound-list',
};

// 维修管理路由
export const REPAIR_PATHS = {
  // 维修管理首页
  REPAIR: '/repair',
  // 维修记录列表
  REPAIR_LIST: '/repair/repair/list',
  // 新增维修记录
  REPAIR_ADD: '/repair/add',
  // 编辑维修记录
  REPAIR_EDIT: '/repair/edit',
  // 维修记录详情
  REPAIR_DETAIL: '/repair/detail',
  // 维修记录详情页带参数
  REPAIR_DETAIL_WITH_ID: (id) => `/repair/detail/${id}`,
  // 维护记录列表
  MAINTENANCE_LIST: '/repair/maintenance/list',
  // 新增维护记录
  MAINTENANCE_ADD: '/repair/maintenance/add',
  // 编辑维护记录
  MAINTENANCE_EDIT: '/repair/maintenance/edit',
  // 维护记录详情
  MAINTENANCE_DETAIL: '/repair/maintenance/detail',
  // 维护记录详情页带参数
  MAINTENANCE_DETAIL_WITH_ID: (id) => `/repair/maintenance/detail/${id}`,
};

// 设备查询路由
export const QUERY_PATHS = {
  // 查询首页
  QUERY: '/query',
  // 区域查询
  QUERY_AREA: '/query/area',
  // 设备查询
  QUERY_DEVICE: '/query/device',
};

// 记录管理路由
export const RECORD_PATHS = {
  // 记录管理首页
  RECORD: '/record',
  // 安装记录
  INSTALLATION_RECORD: '/record/installation',
  // 维修记录
  REPAIR_RECORD: '/record/repair',
};

// 系统管理路由
export const SYSTEM_PATHS = {
  // 系统管理首页
  SYSTEM: '/system',
  // 用户管理
  USER_MANAGEMENT: '/system/users',
  // 角色管理
  ROLE_MANAGEMENT: '/system/roles',
  // 系统配置
  SYSTEM_CONFIG: '/system/config',
  // 日志管理
  LOG_MANAGEMENT: '/system/logs',
  // 基础配置
  BASE_CONFIG: '/system/base-config',
  // 行政区划管理
  DIVISION_MANAGEMENT: '/system/divisions',
};

// 区域管理路由
export const AREA_PATHS = {
  // 区域管理首页
  AREA_MANAGEMENT: '/inventory-management/areas',
};

// 所有路由常量集合
export const ALL_PATHS = {
  ...PUBLIC_PATHS,
  ...DASHBOARD_PATHS,
  ...DEVICE_PATHS,
  ...INVENTORY_PATHS,
  ...REPAIR_PATHS,
  ...QUERY_PATHS,
  ...RECORD_PATHS,
  ...SYSTEM_PATHS,
  ...AREA_PATHS,
};

// 默认跳转路径
export const DEFAULT_REDIRECT_PATH = DASHBOARD_PATHS.DASHBOARD;
export const LOGIN_SUCCESS_REDIRECT = DASHBOARD_PATHS.DASHBOARD;
