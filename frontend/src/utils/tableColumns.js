import BaseStatusTag from '@/components/base/BaseStatusTag.vue';

export const DEVICE_COLUMNS = [
  {
    prop: 'deviceCode',
    label: '设备编号',
    width: 150,
    fixed: true,
    sortable: true,
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    minWidth: 200,
    showOverflowTooltip: true,
    sortable: true,
  },
  {
    prop: 'deviceType',
    label: '设备类型',
    width: 120,
    sortable: true,
  },
  {
    prop: 'status',
    label: '设备状态',
    width: 100,
    align: 'center',
    sortable: true,
    slot: 'status',
    component: BaseStatusTag,
    componentProps: { preset: 'device', size: 'small' },
  },
  {
    prop: 'areaName',
    label: '所在区域',
    width: 150,
    sortable: true,
  },
  {
    prop: 'manufacturer',
    label: '制造商',
    width: 150,
  },
  {
    prop: 'model',
    label: '型号',
    width: 120,
  },
  {
    prop: 'purchaseDate',
    label: '采购日期',
    width: 120,
    sortable: true,
  },
  {
    prop: 'installDate',
    label: '安装日期',
    width: 120,
    sortable: true,
  },
];

export const STOCK_COLUMNS = [
  {
    prop: 'deviceName',
    label: '设备名称',
    minWidth: 180,
  },
  {
    prop: 'deviceCode',
    label: '设备编号',
    minWidth: 120,
  },
  {
    prop: 'deviceType',
    label: '设备类型',
    minWidth: 100,
  },
  {
    prop: 'brand',
    label: '品牌',
    minWidth: 100,
  },
  {
    prop: 'model',
    label: '型号',
    minWidth: 120,
  },
  {
    prop: 'location',
    label: '仓库位置',
    minWidth: 120,
  },
  {
    prop: 'quantity',
    label: '库存数量',
    minWidth: 100,
    align: 'center',
  },
  {
    prop: 'unit',
    label: '单位',
    minWidth: 80,
    align: 'center',
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 100,
    slot: 'status',
    component: BaseStatusTag,
    componentProps: { preset: 'inventory', size: 'small' },
  },
  {
    prop: 'lastUpdated',
    label: '更新时间',
    minWidth: 180,
  },
];

export const INVENTORY_COLUMNS = [
  {
    prop: 'inventoryCode',
    label: '库存编号',
    width: 150,
    fixed: true,
    sortable: true,
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    minWidth: 200,
    showOverflowTooltip: true,
    sortable: true,
  },
  {
    prop: 'deviceCode',
    label: '设备编号',
    width: 150,
    sortable: true,
  },
  {
    prop: 'quantity',
    label: '库存数量',
    width: 120,
    align: 'center',
    sortable: true,
  },
  {
    prop: 'unit',
    label: '单位',
    width: 80,
    align: 'center',
  },
  {
    prop: 'location',
    label: '仓库位置',
    width: 150,
    sortable: true,
  },
  {
    prop: 'status',
    label: '库存状态',
    width: 120,
    align: 'center',
    sortable: true,
    slot: 'status',
    component: BaseStatusTag,
    componentProps: { preset: 'inventory', size: 'small' },
  },
  {
    prop: 'lastUpdated',
    label: '更新时间',
    width: 180,
    sortable: true,
  },
];

export const MAINTENANCE_COLUMNS = [
  {
    prop: 'maintenanceCode',
    label: '维护编号',
    width: 150,
    fixed: true,
    sortable: true,
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    minWidth: 200,
    showOverflowTooltip: true,
    sortable: true,
  },
  {
    prop: 'deviceCode',
    label: '设备编号',
    width: 150,
    sortable: true,
  },
  {
    prop: 'maintenanceType',
    label: '维护类型',
    width: 120,
    sortable: true,
  },
  {
    prop: 'status',
    label: '维护状态',
    width: 120,
    align: 'center',
    sortable: true,
    slot: 'status',
    component: BaseStatusTag,
    componentProps: { preset: 'task', size: 'small' },
  },
  {
    prop: 'maintainer',
    label: '维护人员',
    width: 120,
  },
  {
    prop: 'startDate',
    label: '开始时间',
    width: 180,
    sortable: true,
  },
  {
    prop: 'endDate',
    label: '结束时间',
    width: 180,
    sortable: true,
  },
];

export const TASK_COLUMNS = [
  {
    prop: 'taskCode',
    label: '任务编号',
    width: 150,
    fixed: true,
    sortable: true,
  },
  {
    prop: 'taskName',
    label: '任务名称',
    minWidth: 200,
    showOverflowTooltip: true,
    sortable: true,
  },
  {
    prop: 'taskType',
    label: '任务类型',
    width: 120,
    sortable: true,
  },
  {
    prop: 'status',
    label: '任务状态',
    width: 120,
    align: 'center',
    sortable: true,
    slot: 'status',
    component: BaseStatusTag,
    componentProps: { preset: 'task', size: 'small' },
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 100,
    align: 'center',
    sortable: true,
  },
  {
    prop: 'assignee',
    label: '负责人',
    width: 120,
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 180,
    sortable: true,
  },
  {
    prop: 'deadline',
    label: '截止时间',
    width: 180,
    sortable: true,
  },
];
