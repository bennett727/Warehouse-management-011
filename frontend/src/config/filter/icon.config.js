/**
 * 筛选栏图标配置
 * @description 统一配置所有筛选栏图标，确保图标正确显示
 */

import {
  Box,
  TakeawayBox,
  Tools,
  Search,
  Warning,
  Calendar,
  Document,
  Setting,
  Refresh,
  Filter,
  List,
  Grid,
  Location,
  User,
  OfficeBuilding,
  House,
  Van,
  FirstAidKit,
  Brush,
  Connection,
  Monitor,
} from '@element-plus/icons-vue';

// 图标映射表
export const iconMap = {
  // 库存管理
  Box, // 入库
  TakeawayBox, // 出库
  Van, // 调拨
  House, // 仓库
  Location, // 库位
  Grid, // 货架

  // 设备管理
  Tools, // 维修
  Setting, // 安装
  Brush, // 保养
  Connection, // 连接
  Monitor, // 监控

  // 通用
  Search, // 搜索
  Filter, // 筛选
  List, // 列表
  Document, // 文档
  Calendar, // 日历
  Warning, // 警告
  Refresh, // 刷新
  User, // 用户
  OfficeBuilding, // 组织
  FirstAidKit, // 急救/报废
};

// 获取图标组件
export const getIcon = (iconName) => {
  return iconMap[iconName] || Search; // 默认返回 Search 图标
};

// 筛选栏图标配置
export const filterIcons = {
  // 入库管理
  inbound: Box,
  // 出库管理
  outbound: TakeawayBox,
  // 维修管理
  repair: Tools,
  // 安装管理
  installation: Setting,
  // 保养管理
  maintenance: Brush,
  // 报废管理
  scrap: FirstAidKit,
  // 库存查询
  query: Search,
  // 库存预警
  alert: Warning,
  // 调拨管理
  transfer: Van,
  // 盘点管理
  stockCount: Calendar,
  // 库位管理
  bin: Grid,
  // 默认
  default: Filter,
};

export default {
  iconMap,
  getIcon,
  filterIcons,
};
