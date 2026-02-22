/**
 * 出库管理筛选配置
 * @description 出库单列表页面的筛选条件配置
 */

import { TakeawayBox } from '@element-plus/icons-vue';

export const outboundFilterConfig = {
  // 头部配置
  header: {
    title: '出库单筛选',
    icon: TakeawayBox,
    showResultCount: true,
    showCollapse: true,
    collapseThreshold: 4,
  },

  // 字段配置
  fields: [
    {
      prop: 'orderNo',
      label: '出库单号',
      type: 'input',
      placeholder: '请输入出库单号',
      md: 8,
      lg: 6,
      clearable: true,
    },
    {
      prop: 'customer',
      label: '客户',
      type: 'input',
      placeholder: '请输入客户名称',
      md: 8,
      lg: 6,
      clearable: true,
    },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      md: 8,
      lg: 6,
      clearable: true,
      options: [
        { label: '待出库', value: 'pending' },
        { label: '已出库', value: 'completed' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    {
      prop: 'operatorName',
      label: '经办人',
      type: 'input',
      placeholder: '请输入经办人',
      md: 8,
      lg: 6,
      clearable: true,
    },
    {
      prop: 'dateRange',
      label: '出库日期',
      type: 'daterange',
      md: 12,
      lg: 12,
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      valueFormat: 'YYYY-MM-DD',
    },
  ],

  // 按钮配置
  buttons: {
    searchText: '查询',
    resetText: '重置',
    showSearch: true,
    showReset: true,
  },

  // 行为配置
  behavior: {
    autoSearch: false,
    debounceTime: 300,
    defaultCollapsed: false,
  },
};

// 默认筛选值
export const defaultOutboundFilter = {
  orderNo: '',
  customer: '',
  status: '',
  operatorName: '',
  dateRange: [],
};

export default outboundFilterConfig;
