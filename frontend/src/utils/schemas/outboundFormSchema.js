export const outboundFormSchema = [
  {
    section: '出库信息',
    fields: [
      {
        type: 'select',
        label: '仓库',
        prop: 'warehouseId',
        options: [], // 实际应用中会从API获取
        rules: [{ required: true, message: '请选择仓库', trigger: 'change' }],
        placeholder: '请选择仓库',
      },
      {
        type: 'date-picker',
        label: '出库日期',
        prop: 'outboundDate',
        rules: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      {
        type: 'input',
        label: '操作人',
        prop: 'operator',
        rules: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
        placeholder: '请输入操作人',
      },
      {
        type: 'input',
        label: '接收人',
        prop: 'recipient',
        rules: [{ required: true, message: '请输入接收人', trigger: 'blur' }],
        placeholder: '请输入接收人',
      },
      {
        type: 'input',
        label: '联系方式',
        prop: 'contact',
        rules: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
        placeholder: '请输入联系方式',
      },
      {
        type: 'select',
        label: '出库用途',
        prop: 'purpose',
        options: [
          { label: '生产领用', value: 'PRODUCTION' },
          { label: '销售出库', value: 'SALES' },
          { label: '调拨出库', value: 'TRANSFER' },
          { label: '其他用途', value: 'OTHER' },
        ],
        rules: [{ required: true, message: '请选择出库用途', trigger: 'change' }],
        placeholder: '请选择出库用途',
      },
      {
        type: 'textarea',
        label: '备注',
        prop: 'remark',
        placeholder: '请输入备注信息',
        rows: 4,
      },
    ],
  },
];
