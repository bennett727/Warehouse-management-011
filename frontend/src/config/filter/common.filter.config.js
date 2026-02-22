/**
 * 通用筛选配置
 * @description 为使用 UnifiedSearchBar 的视图提供快速迁移到 UnifiedFilterBar 的配置模板
 */

import {
  Search,
  Box,
  TakeawayBox,
  Van,
  Tools,
  Setting,
  Brush,
  FirstAidKit,
  Warning,
  Calendar,
  Document,
  Collection,
  Bell,
  User,
  Grid,
} from '@element-plus/icons-vue';

/**
 * 创建标准筛选配置
 * @param {Object} options - 配置选项
 * @param {string} options.title - 筛选栏标题
 * @param {Object} options.icon - 图标组件
 * @param {Array} options.fields - 筛选字段配置
 * @param {Object} options.buttons - 按钮配置
 * @returns {Object} 完整的筛选配置对象
 */
export const createFilterConfig = (options = {}) => {
  const { title = '筛选条件', icon = Search, fields = [], buttons = {}, behavior = {} } = options;

  return {
    // 头部配置
    header: {
      title,
      icon,
      showResultCount: true,
      showCollapse: true,
      collapseThreshold: 4,
    },

    // 字段配置
    fields: fields.map((field) => ({
      clearable: true,
      ...field,
    })),

    // 按钮配置
    buttons: {
      searchText: '查询',
      resetText: '重置',
      showSearch: true,
      showReset: true,
      ...buttons,
    },

    // 行为配置
    behavior: {
      autoSearch: false,
      debounceTime: 300,
      defaultCollapsed: false,
      ...behavior,
    },
  };
};

// 预定义的图标映射
export const FilterIcons = {
  Search,
  Box,
  TakeawayBox,
  Van,
  Tools,
  Setting,
  Brush,
  FirstAidKit,
  Warning,
  Calendar,
  Document,
  Collection,
  Bell,
  User,
  Grid,
};

// 预定义的筛选配置模板
export const filterTemplates = {
  // 库存查询
  inventoryQuery: (fields) =>
    createFilterConfig({
      title: '库存筛选',
      icon: Search,
      fields,
    }),

  // 入库管理
  inbound: (fields) =>
    createFilterConfig({
      title: '入库单筛选',
      icon: Box,
      fields,
    }),

  // 出库管理
  outbound: (fields) =>
    createFilterConfig({
      title: '出库单筛选',
      icon: TakeawayBox,
      fields,
    }),

  // 调拨管理
  transfer: (fields) =>
    createFilterConfig({
      title: '调拨单筛选',
      icon: Van,
      fields,
    }),

  // 维修管理
  repair: (fields) =>
    createFilterConfig({
      title: '维修记录筛选',
      icon: Tools,
      fields,
    }),

  // 安装管理
  installation: (fields) =>
    createFilterConfig({
      title: '安装记录筛选',
      icon: Setting,
      fields,
    }),

  // 保养管理
  maintenance: (fields) =>
    createFilterConfig({
      title: '保养记录筛选',
      icon: Brush,
      fields,
    }),

  // 报废管理
  scrap: (fields) =>
    createFilterConfig({
      title: '报废记录筛选',
      icon: FirstAidKit,
      fields,
    }),

  // 预警管理
  alert: (fields) =>
    createFilterConfig({
      title: '预警筛选',
      icon: Warning,
      fields,
    }),

  // 盘点管理
  stockCount: (fields) =>
    createFilterConfig({
      title: '盘点单筛选',
      icon: Calendar,
      fields,
    }),

  // 记录查询
  records: (fields) =>
    createFilterConfig({
      title: '记录筛选',
      icon: Document,
      fields,
    }),

  // 状态管理
  status: (fields) =>
    createFilterConfig({
      title: '状态筛选',
      icon: Collection,
      fields,
    }),

  // 配置管理
  config: (fields) =>
    createFilterConfig({
      title: '配置筛选',
      icon: Bell,
      fields,
    }),

  // 用户管理
  users: (fields) =>
    createFilterConfig({
      title: '用户筛选',
      icon: User,
      fields,
    }),

  // 库位管理
  bin: (fields) =>
    createFilterConfig({
      title: '库位筛选',
      icon: Grid,
      fields,
    }),
};

export default {
  createFilterConfig,
  FilterIcons,
  filterTemplates,
};
