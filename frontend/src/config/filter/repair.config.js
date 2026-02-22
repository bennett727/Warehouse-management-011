/**
 * 维修记录筛选配置
 * @description 维修记录列表页面的筛选条件配置
 */

import { Tools } from '@element-plus/icons-vue';

export const repairFilterConfig = {
  // 头部配置
  header: {
    title: '维修记录筛选',
    icon: Tools,
    showResultCount: true,
    showCollapse: true,
    collapseThreshold: 4,
  },

  // 字段配置
  fields: [
    {
      prop: 'repairNo',
      label: '维修单号',
      type: 'input',
      placeholder: '请输入维修单号',
      md: 8,
      lg: 6,
      clearable: true,
    },
    {
      prop: 'deviceCode',
      label: '设备编号',
      type: 'input',
      placeholder: '请输入设备编号',
      md: 8,
      lg: 6,
      clearable: true,
    },
    {
      prop: 'deviceName',
      label: '设备名称',
      type: 'input',
      placeholder: '请输入设备名称',
      md: 8,
      lg: 6,
      clearable: true,
    },
    {
      prop: 'repairType',
      label: '维修类型',
      type: 'select',
      placeholder: '请选择维修类型',
      md: 8,
      lg: 6,
      clearable: true,
      options: [
        { label: '硬件故障', value: 'hardware' },
        { label: '软件故障', value: 'software' },
        { label: '日常维护', value: 'maintenance' },
      ],
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
        { label: '待维修', value: 'pending' },
        { label: '维修中', value: 'repairing' },
        { label: '已完成', value: 'completed' },
      ],
    },
    {
      prop: 'dateRange',
      label: '维修日期',
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
export const defaultRepairFilter = {
  repairNo: '',
  deviceCode: '',
  deviceName: '',
  repairType: '',
  status: '',
  dateRange: [],
};

export default repairFilterConfig;
