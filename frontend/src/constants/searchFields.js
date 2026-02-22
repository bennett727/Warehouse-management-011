/**
 * @file: searchFields.js
 * @description: 搜索字段配置常量 - 提供各模块统一的搜索字段定义
 * @author: 开发团队
 * @createTime: 2026-02-09
 * @version: 1.0
 */

// ============================================
// 设备管理模块
// ============================================

/**
 * 设备列表搜索字段
 * @param {Object} options - 配置选项
 * @param {Array} options.deviceTypes - 设备类型选项
 * @param {Array} options.areas - 区域选项
 * @returns {Array} 搜索字段配置
 */
export const getDeviceListSearchFields = (options = {}) => {
  const { deviceTypes = [], areas = [] } = options;

  return [
    {
      prop: 'keyword',
      label: '关键字',
      type: 'input',
      placeholder: '请输入设备编号或名称',
      clearable: true,
      prefixIcon: 'Search',
      md: 6,
      lg: 6,
    },
    {
      prop: 'deviceType',
      label: '设备类型',
      type: 'select',
      placeholder: '请选择设备类型',
      clearable: true,
      options: deviceTypes,
      md: 6,
      lg: 6,
    },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      options: [
        { label: '待入库', value: 'PENDING_INBOUND' },
        { label: '在库', value: 'IN_STOCK' },
        { label: '使用中', value: 'IN_USE' },
        { label: '维护中', value: 'MAINTENANCE' },
        { label: '已报废', value: 'SCRAPPED' },
      ],
      md: 6,
      lg: 6,
    },
    {
      prop: 'area',
      label: '区域',
      type: 'select',
      placeholder: '请选择区域',
      clearable: true,
      options: areas,
      md: 6,
      lg: 6,
    },
  ];
};

// ============================================
// 库存管理模块
// ============================================

/**
 * 入库管理搜索字段
 * @returns {Array} 搜索字段配置
 */
export const getInboundSearchFields = () => [
  {
    prop: 'orderNo',
    label: '入库单号',
    type: 'input',
    placeholder: '请输入入库单号',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    options: [
      { label: '草稿', value: 'draft' },
      { label: '待审核', value: 'pending' },
      { label: '已审核', value: 'approved' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ],
    md: 6,
    lg: 6,
  },
  {
    prop: 'dateRange',
    label: '入库日期',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    clearable: true,
    md: 8,
    lg: 8,
  },
  {
    prop: 'supplier',
    label: '供应商',
    type: 'input',
    placeholder: '请输入供应商',
    clearable: true,
    md: 6,
    lg: 6,
  },
];

/**
 * 出库管理搜索字段
 * @returns {Array} 搜索字段配置
 */
export const getOutboundSearchFields = () => [
  {
    prop: 'orderNo',
    label: '出库单号',
    type: 'input',
    placeholder: '请输入出库单号',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'purpose',
    label: '出库用途',
    type: 'select',
    placeholder: '请选择用途',
    clearable: true,
    options: [
      { label: '安装出库', value: 1 },
      { label: '维修出库', value: 2 },
      { label: '调拨出库', value: 3 },
      { label: '报废出库', value: 4 },
    ],
    md: 6,
    lg: 6,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    options: [
      { label: '草稿', value: 'draft' },
      { label: '待审核', value: 'pending' },
      { label: '已审核', value: 'approved' },
      { label: '已完成', value: 'completed' },
    ],
    md: 6,
    lg: 6,
  },
  {
    prop: 'dateRange',
    label: '出库日期',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    clearable: true,
    md: 8,
    lg: 8,
  },
];

/**
 * 库存查询搜索字段
 * @param {Object} options - 配置选项
 * @param {Array} options.deviceTypes - 设备类型选项
 * @returns {Array} 搜索字段配置
 */
export const getInventoryQuerySearchFields = (options = {}) => {
  const { deviceTypes = [] } = options;

  return [
    {
      prop: 'deviceCode',
      label: '设备编号',
      type: 'input',
      placeholder: '请输入设备编号',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'deviceName',
      label: '设备名称',
      type: 'input',
      placeholder: '请输入设备名称',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'deviceType',
      label: '设备类型',
      type: 'select',
      placeholder: '请选择设备类型',
      clearable: true,
      options: deviceTypes,
      md: 6,
      lg: 6,
    },
    {
      prop: 'status',
      label: '设备状态',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      options: [
        { label: '在库', value: 'in_stock' },
        { label: '已安装', value: 'installed' },
        { label: '维修中', value: 'in_repair' },
        { label: '已报废', value: 'scrapped' },
      ],
      md: 6,
      lg: 6,
    },
    {
      prop: 'manufacturer',
      label: '制造商',
      type: 'input',
      placeholder: '请输入制造商',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'model',
      label: '规格型号',
      type: 'input',
      placeholder: '请输入规格型号',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'installDateRange',
      label: '安装日期',
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      clearable: true,
      md: 8,
      lg: 8,
    },
  ];
};

// ============================================
// 维修保养模块
// ============================================

/**
 * 维修记录搜索字段
 * @returns {Array} 搜索字段配置
 */
export const getRepairSearchFields = () => [
  {
    prop: 'deviceCode',
    label: '设备编号',
    type: 'input',
    placeholder: '请输入设备编号',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    type: 'input',
    placeholder: '请输入设备名称',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'repairType',
    label: '维修类型',
    type: 'select',
    placeholder: '请选择维修类型',
    clearable: true,
    options: [
      { label: '故障维修', value: 'fault' },
      { label: '定期保养', value: 'maintenance' },
      { label: '升级改造', value: 'upgrade' },
    ],
    md: 6,
    lg: 6,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    options: [
      { label: '待处理', value: 'pending' },
      { label: '维修中', value: 'in_progress' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ],
    md: 6,
    lg: 6,
  },
  {
    prop: 'repairman',
    label: '维修人员',
    type: 'input',
    placeholder: '请输入维修人员',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'dateRange',
    label: '维修日期',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    clearable: true,
    md: 8,
    lg: 8,
  },
];

/**
 * 保养记录搜索字段
 * @returns {Array} 搜索字段配置
 */
export const getMaintenanceSearchFields = () => [
  {
    prop: 'deviceCode',
    label: '设备编号',
    type: 'input',
    placeholder: '请输入设备编号',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'maintenanceType',
    label: '保养类型',
    type: 'select',
    placeholder: '请选择保养类型',
    clearable: true,
    options: [
      { label: '日常保养', value: 'daily' },
      { label: '定期保养', value: 'periodic' },
      { label: '季度保养', value: 'quarterly' },
      { label: '年度保养', value: 'annual' },
    ],
    md: 6,
    lg: 6,
  },
  {
    prop: 'dateRange',
    label: '保养日期',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    clearable: true,
    md: 8,
    lg: 8,
  },
];

// ============================================
// 系统管理模块
// ============================================

/**
 * 用户管理搜索字段
 * @returns {Array} 搜索字段配置
 */
export const getUserSearchFields = () => [
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '请输入用户名或姓名',
    clearable: true,
    prefixIcon: 'Search',
    md: 8,
    lg: 8,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
    md: 6,
    lg: 6,
  },
];

/**
 * 角色管理搜索字段
 * @returns {Array} 搜索字段配置
 */
export const getRoleSearchFields = () => [
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '请输入角色名称或编码',
    clearable: true,
    prefixIcon: 'Search',
    md: 8,
    lg: 8,
  },
];

// ============================================
// 安装调试模块
// ============================================

/**
 * 安装记录搜索字段
 * @param {Object} options - 配置选项
 * @param {Array} options.areaOptions - 区域选项
 * @returns {Array} 搜索字段配置
 */
export const getInstallationSearchFields = (options = {}) => {
  const { areaOptions = [] } = options;

  return [
    {
      prop: 'deviceCode',
      label: '设备编号',
      type: 'input',
      placeholder: '请输入设备编号',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'deviceName',
      label: '设备名称',
      type: 'input',
      placeholder: '请输入设备名称',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'areaId',
      label: '区域',
      type: 'select',
      placeholder: '请选择区域',
      clearable: true,
      options: areaOptions,
      md: 6,
      lg: 6,
    },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      options: [
        { label: '已完成', value: 'completed' },
        { label: '进行中', value: 'pending' },
        { label: '已取消', value: 'cancelled' },
      ],
      md: 6,
      lg: 6,
    },
    {
      prop: 'installer',
      label: '安装人员',
      type: 'input',
      placeholder: '请输入安装人员',
      clearable: true,
      md: 6,
      lg: 6,
    },
    {
      prop: 'dateRange',
      label: '安装日期',
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      clearable: true,
      md: 8,
      lg: 8,
    },
  ];
};

// ============================================
// 通用搜索字段
// ============================================

/**
 * 创建通用关键字搜索字段
 * @param {Object} options - 配置选项
 * @param {string} options.label - 标签
 * @param {string} options.placeholder - 占位符
 * @returns {Object} 搜索字段配置
 */
export const createKeywordField = (options = {}) => ({
  prop: 'keyword',
  label: options.label || '关键字',
  type: 'input',
  placeholder: options.placeholder || '请输入关键字',
  clearable: true,
  prefixIcon: 'Search',
  md: 8,
  lg: 8,
});

/**
 * 创建日期范围搜索字段
 * @param {Object} options - 配置选项
 * @param {string} options.prop - 属性名
 * @param {string} options.label - 标签
 * @returns {Object} 搜索字段配置
 */
export const createDateRangeField = (options = {}) => ({
  prop: options.prop || 'dateRange',
  label: options.label || '日期范围',
  type: 'daterange',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  clearable: true,
  md: 8,
  lg: 8,
});

/**
 * 创建状态下拉字段
 * @param {Object} options - 配置选项
 * @param {Array} options.options - 状态选项
 * @returns {Object} 搜索字段配置
 */
export const createStatusField = (options = {}) => ({
  prop: 'status',
  label: '状态',
  type: 'select',
  placeholder: '请选择状态',
  clearable: true,
  options: options.options || [],
  md: 6,
  lg: 6,
});
