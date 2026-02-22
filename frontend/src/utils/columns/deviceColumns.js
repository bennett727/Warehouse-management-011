export const deviceTableColumns = [
  {
    prop: 'deviceCode',
    label: '设备编号',
    width: '150',
    align: 'center',
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    width: '200',
    align: 'center',
  },
  {
    prop: 'model',
    label: '型号',
    width: '120',
    align: 'center',
  },
  {
    prop: 'specification',
    label: '规格',
    width: '150',
    align: 'center',
  },
  {
    prop: 'manufacturer',
    label: '制造商',
    width: '150',
    align: 'center',
  },
  {
    prop: 'serialNumber',
    label: '序列号',
    width: '200',
    align: 'center',
  },
  {
    prop: 'status',
    label: '状态',
    width: '100',
    align: 'center',
    formatter: (row) => {
      const statusMap = {
        NORMAL: '正常',
        MAINTENANCE: '维护中',
        FAULT: '故障',
        SCRAPPED: '已报废',
      };
      return statusMap[row.status] || row.status;
    },
  },
  {
    prop: 'location',
    label: '存放位置',
    width: '150',
    align: 'center',
  },
  {
    prop: 'quantity',
    label: '数量',
    width: '80',
    align: 'center',
  },
  {
    prop: 'unit',
    label: '单位',
    width: '80',
    align: 'center',
  },
  {
    prop: 'remark',
    label: '备注',
    minWidth: '200',
    align: 'center',
  },
  {
    prop: 'action',
    label: '操作',
    width: '120',
    align: 'center',
    fixed: 'right',
  },
];

export const deviceSelectionColumns = [
  {
    type: 'selection',
    width: '55',
    align: 'center',
  },
  {
    prop: 'deviceCode',
    label: '设备编号',
    width: '150',
    align: 'center',
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    width: '200',
    align: 'center',
  },
  {
    prop: 'model',
    label: '型号',
    width: '120',
    align: 'center',
  },
  {
    prop: 'specification',
    label: '规格',
    width: '150',
    align: 'center',
  },
  {
    prop: 'serialNumber',
    label: '序列号',
    width: '200',
    align: 'center',
  },
  {
    prop: 'status',
    label: '状态',
    width: '100',
    align: 'center',
    formatter: (row) => {
      const statusMap = {
        NORMAL: '正常',
        MAINTENANCE: '维护中',
        FAULT: '故障',
        SCRAPPED: '已报废',
      };
      return statusMap[row.status] || row.status;
    },
  },
  {
    prop: 'location',
    label: '存放位置',
    width: '150',
    align: 'center',
  },
  {
    prop: 'quantity',
    label: '库存数量',
    width: '100',
    align: 'center',
  },
  {
    prop: 'unit',
    label: '单位',
    width: '80',
    align: 'center',
  },
];
