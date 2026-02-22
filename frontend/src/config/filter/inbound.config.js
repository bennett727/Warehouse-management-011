/**
 * 入库管理筛选配置
 * @description 入库单列表页面的筛选条件配置
 */

import { Box } from '@element-plus/icons-vue';

export const inboundFilterConfig = {
  // 头部配置
  header: {
    title: '入库单筛选',
    icon: Box,
    showResultCount: true,
    showCollapse: true,
    collapseThreshold: 4,
  },

  // 字段配置
  fields: [
    {
      prop: 'orderNo',
      label: '入库单号',
      type: 'input',
      placeholder: '请输入入库单号',
      md: 8,
      lg: 6,
      clearable: true,
      // 支持回车搜索
      autoSearch: false,
    },
    {
      prop: 'supplier',
      label: '供应商',
      type: 'input',
      placeholder: '请输入供应商',
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
        { label: '草稿', value: 0 },
        { label: '待审核', value: 1 },
        { label: '已审核', value: 2 },
        { label: '已完成', value: 3 },
        { label: '已取消', value: -1 },
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
      label: '入库日期',
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
export const defaultInboundFilter = {
  orderNo: '',
  supplier: '',
  status: '',
  operatorName: '',
  dateRange: [],
};

export default inboundFilterConfig;
