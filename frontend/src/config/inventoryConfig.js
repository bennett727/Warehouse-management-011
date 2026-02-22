import { Box, Check, Close, Document, Download, Plus, QuestionFilled, Upload } from '@element-plus/icons-vue';

export const BUSINESS_TYPE_CONFIG = {
  'purchase-inbound': {
    title: '采购入库管理',
    apiPrefix: '/inbound',
    storeAction: 'inbound',
    showStatistics: false,
    showAudit: true,
    showBatchImport: true,
    showBatchExport: false,
    showBatchApprove: true,
    showBatchReject: true,
    showSingleAdd: true,
    showViewStock: true,
    showOperationGuide: true,
    defaultActions: ['add', 'batch-import', 'batch-approve', 'batch-reject'],
    formFields: [
      {
        prop: 'deviceCode',
        label: '设备编号',
        type: 'input',
        placeholder: '请输入设备编号',
        span: 2,
        clearable: true,
      },
      {
        prop: 'deviceName',
        label: '设备名称',
        type: 'input',
        placeholder: '自动获取设备名称',
        span: 1,
        disabled: true,
      },
      {
        prop: 'deviceType',
        label: '设备类型',
        type: 'input',
        placeholder: '自动获取设备类型',
        span: 1,
        disabled: true,
      },
      {
        prop: 'deviceModel',
        label: '设备型号',
        type: 'input',
        placeholder: '请输入设备型号',
        span: 1,
        clearable: true,
      },
      {
        prop: 'quantity',
        label: '入库数量',
        type: 'number',
        placeholder: '请输入入库数量',
        span: 1,
        min: 1,
        max: 9999,
        precision: 0,
      },
      {
        prop: 'city',
        label: '城市',
        type: 'select',
        placeholder: '请选择城市',
        span: 1,
        clearable: false,
      },
      {
        prop: 'district',
        label: '区县',
        type: 'select',
        placeholder: '请选择区县',
        span: 1,
        clearable: false,
      },
      {
        prop: 'location',
        label: '地点',
        type: 'select',
        placeholder: '请选择地点',
        span: 1,
        clearable: false,
      },
      {
        prop: 'inboundDate',
        label: '入库日期',
        type: 'date',
        placeholder: '请选择入库日期',
        span: 1,
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'input',
        inputType: 'textarea',
        placeholder: '请输入备注信息',
        span: 2,
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
    ],
    formRules: {
      deviceCode: [
        { required: true, message: '请输入设备编号', trigger: 'blur' },
        { min: 3, max: 50, message: '设备编号长度在 3 到 50 个字符', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9\-_]+$/, message: '设备编号只能包含字母、数字、横线和下划线', trigger: 'blur' },
      ],
      deviceName: [{ max: 100, message: '设备名称不能超过100个字符', trigger: 'blur' }],
      deviceType: [{ required: false, message: '请选择设备类型', trigger: 'change' }],
      deviceModel: [
        { max: 50, message: '设备型号不能超过50个字符', trigger: 'blur' },
        {
          pattern: /^[A-Za-z0-9\-_./]+$/,
          message: '设备型号只能包含字母、数字、横线、下划线、点和斜杠',
          trigger: 'blur',
        },
      ],
      quantity: [
        { required: true, message: '请输入入库数量', trigger: 'blur' },
        { type: 'number', min: 1, max: 9999, message: '入库数量必须在1-9999之间', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback();
              return;
            }
            if (!Number.isInteger(value)) {
              callback(new Error('入库数量必须是整数'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
      city: [{ required: true, message: '请选择城市', trigger: 'change' }],
      district: [{ required: true, message: '请选择区县', trigger: 'change' }],
      location: [{ required: true, message: '请选择地点', trigger: 'change' }],
      inboundDate: [
        { required: true, message: '请选择入库日期', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback();
              return;
            }
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
              callback(new Error('入库日期不能晚于今天'));
            } else {
              const minDate = new Date();
              minDate.setFullYear(minDate.getFullYear() - 5);
              if (selectedDate < minDate) {
                callback(new Error('入库日期不能早于5年前'));
              } else {
                callback();
              }
            }
          },
          trigger: 'change',
        },
      ],
      remark: [{ max: 500, message: '备注信息不能超过500个字符', trigger: 'blur' }],
    },
    searchFields: [
      {
        prop: 'inboundNo',
        label: '入库单号',
        type: 'input',
        placeholder: '请输入入库单号',
        span: 6,
        prefix: 'Document',
      },
      {
        prop: 'deviceCode',
        label: '设备编号',
        type: 'input',
        placeholder: '请输入设备编号',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'deviceName',
        label: '设备名称',
        type: 'input',
        placeholder: '请输入设备名称',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        span: 6,
        options: [
          { label: '待审核', value: 'pending' },
          { label: '已审核', value: 'approved' },
          { label: '已驳回', value: 'rejected' },
          { label: '已完成', value: 'completed' },
        ],
      },
      {
        prop: 'supplier',
        label: '供应商',
        type: 'input',
        placeholder: '请输入供应商',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'inboundDateRange',
        label: '入库日期',
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        span: 6,
      },
    ],
    tableColumns: [
      { prop: 'inboundNo', label: '入库单号', width: 180, fixed: 'left' },
      { prop: 'deviceCode', label: '设备编号', width: 150 },
      { prop: 'deviceName', label: '设备名称', width: 150 },
      { prop: 'deviceType', label: '设备类型', width: 120, type: 'tag', slot: 'deviceType' },
      { prop: 'quantity', label: '数量', width: 100, align: 'center' },
      { prop: 'supplier', label: '供应商', width: 150 },
      { prop: 'purchasePrice', label: '采购单价', width: 120, type: 'currency' },
      { prop: 'totalPrice', label: '总价', width: 120, type: 'currency' },
      { prop: 'inboundDate', label: '入库日期', width: 120, type: 'date' },
      { prop: 'operator', label: '操作员', width: 120 },
      { prop: 'status', label: '状态', width: 100, type: 'status', slot: 'status' },
      { prop: 'auditStatus', label: '审核状态', width: 100, type: 'status' },
      { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
    ],
    detailFields: [
      { prop: 'inboundNo', label: '入库单号', span: 2 },
      { prop: 'orderType', label: '订单类型', span: 1 },
      { prop: 'purpose', label: '用途', span: 1 },
      { prop: 'deviceCode', label: '设备编号', span: 1 },
      { prop: 'deviceName', label: '设备名称', span: 1 },
      { prop: 'deviceType', label: '设备类型', span: 1, type: 'tag' },
      { prop: 'quantity', label: '数量', span: 1 },
      { prop: 'supplier', label: '供应商', span: 1 },
      { prop: 'purchasePrice', label: '采购单价', span: 1, type: 'currency' },
      { prop: 'totalPrice', label: '总价', span: 1, type: 'currency' },
      { prop: 'inboundDate', label: '入库日期', span: 1, type: 'date' },
      { prop: 'operator', label: '操作员', span: 1 },
      { prop: 'status', label: '状态', span: 1, type: 'status' },
      { prop: 'auditStatus', label: '审核状态', span: 1, type: 'status' },
      { prop: 'auditBy', label: '审核人', span: 1 },
      { prop: 'auditTime', label: '审核时间', span: 1, type: 'datetime' },
      { prop: 'remark', label: '备注', span: 2 },
    ],
  },
  'installation-outbound': {
    title: '安装出库管理',
    apiPrefix: '/outbound',
    storeAction: 'outbound',
    showStatistics: false,
    showAudit: true,
    showBatchImport: true,
    showBatchExport: false,
    showBatchApprove: true,
    showBatchReject: true,
    showSingleAdd: true,
    showViewStock: true,
    showOperationGuide: true,
    defaultActions: ['add', 'batch-import', 'batch-approve', 'batch-reject'],
    formFields: [
      {
        prop: 'deviceId',
        label: '设备',
        type: 'select',
        placeholder: '请选择设备',
        span: 1,
        clearable: false,
        filterable: true,
      },
      {
        prop: 'areaId',
        label: '安装区域',
        type: 'select',
        placeholder: '请选择安装区域',
        span: 1,
        clearable: false,
      },
      {
        prop: 'location',
        label: '安装位置',
        type: 'input',
        placeholder: '请输入安装位置',
        span: 1,
        clearable: true,
      },
      {
        prop: 'status',
        label: '安装状态',
        type: 'select',
        placeholder: '请选择安装状态',
        span: 1,
        clearable: false,
      },
      {
        prop: 'installer',
        label: '安装人员',
        type: 'input',
        placeholder: '请输入安装人员',
        span: 1,
        clearable: true,
      },
      {
        prop: 'installDate',
        label: '安装日期',
        type: 'date',
        placeholder: '请选择安装日期',
        span: 1,
      },
      {
        prop: 'startTime',
        label: '开始时间',
        type: 'date',
        dateType: 'datetime',
        placeholder: '请选择开始时间',
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        span: 1,
      },
      {
        prop: 'endTime',
        label: '结束时间',
        type: 'date',
        dateType: 'datetime',
        placeholder: '请选择结束时间',
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        span: 1,
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'input',
        inputType: 'textarea',
        placeholder: '请输入备注信息',
        span: 2,
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
    ],
    formRules: {
      deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
      areaId: [{ required: true, message: '请选择安装区域', trigger: 'change' }],
      location: [
        { required: true, message: '请输入安装位置', trigger: 'blur' },
        { min: 2, max: 100, message: '安装位置长度在2-100个字符之间', trigger: 'blur' },
      ],
      status: [{ required: true, message: '请选择安装状态', trigger: 'change' }],
      installer: [
        { required: true, message: '请输入安装人员', trigger: 'blur' },
        { min: 2, max: 50, message: '安装人员姓名长度在2-50个字符之间', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '安装人员姓名只能包含中文、英文和空格', trigger: 'blur' },
      ],
      installDate: [
        { required: true, message: '请选择安装日期', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback();
              return;
            }
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
              callback(new Error('安装日期不能晚于今天'));
            } else {
              callback();
            }
          },
          trigger: 'change',
        },
      ],
      startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
      remark: [{ max: 500, message: '备注信息不能超过500个字符', trigger: 'blur' }],
    },
    searchFields: [
      {
        prop: 'outboundNo',
        label: '出库单号',
        type: 'input',
        placeholder: '请输入出库单号',
        span: 6,
        prefix: 'Document',
      },
      {
        prop: 'deviceCode',
        label: '设备编号',
        type: 'input',
        placeholder: '请输入设备编号',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'deviceName',
        label: '设备名称',
        type: 'input',
        placeholder: '请输入设备名称',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        span: 6,
        options: [
          { label: '待审核', value: 'pending' },
          { label: '已审核', value: 'approved' },
          { label: '已驳回', value: 'rejected' },
          { label: '已完成', value: 'completed' },
        ],
      },
      {
        prop: 'areaName',
        label: '安装区域',
        type: 'input',
        placeholder: '请输入安装区域',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'installDateRange',
        label: '安装日期',
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        span: 6,
      },
    ],
    tableColumns: [
      { prop: 'outboundNo', label: '出库单号', width: 180, fixed: 'left' },
      { prop: 'deviceCode', label: '设备编号', width: 150 },
      { prop: 'deviceName', label: '设备名称', width: 150 },
      { prop: 'deviceType', label: '设备类型', width: 120, type: 'tag', slot: 'deviceType' },
      { prop: 'quantity', label: '数量', width: 100, align: 'center' },
      { prop: 'areaName', label: '安装区域', width: 150 },
      { prop: 'location', label: '安装位置', width: 150 },
      { prop: 'installer', label: '安装人员', width: 120 },
      { prop: 'installDate', label: '安装日期', width: 120, type: 'date' },
      { prop: 'startTime', label: '开始时间', width: 120, type: 'datetime' },
      { prop: 'endTime', label: '结束时间', width: 120, type: 'datetime' },
      { prop: 'operator', label: '操作员', width: 120 },
      { prop: 'status', label: '状态', width: 100, type: 'status', slot: 'status' },
      { prop: 'auditStatus', label: '审核状态', width: 100, type: 'status' },
      { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
    ],
    detailFields: [
      { prop: 'outboundNo', label: '出库单号', span: 2 },
      { prop: 'orderType', label: '订单类型', span: 1 },
      { prop: 'purpose', label: '用途', span: 1 },
      { prop: 'deviceCode', label: '设备编号', span: 1 },
      { prop: 'deviceName', label: '设备名称', span: 1 },
      { prop: 'deviceType', label: '设备类型', span: 1, type: 'tag' },
      { prop: 'quantity', label: '数量', span: 1 },
      { prop: 'areaName', label: '安装区域', span: 1 },
      { prop: 'location', label: '安装位置', span: 1 },
      { prop: 'installer', label: '安装人员', span: 1 },
      { prop: 'installDate', label: '安装日期', span: 1, type: 'date' },
      { prop: 'startTime', label: '开始时间', span: 1, type: 'datetime' },
      { prop: 'endTime', label: '结束时间', span: 1, type: 'datetime' },
      { prop: 'operator', label: '操作员', span: 1 },
      { prop: 'status', label: '状态', span: 1, type: 'status' },
      { prop: 'auditStatus', label: '审核状态', span: 1, type: 'status' },
      { prop: 'auditBy', label: '审核人', span: 1 },
      { prop: 'auditTime', label: '审核时间', span: 1, type: 'datetime' },
      { prop: 'remark', label: '备注', span: 2 },
    ],
  },
  'repair-return': {
    title: '维修归还管理',
    apiPrefix: '/inbound',
    storeAction: 'inbound',
    showStatistics: false,
    showAudit: true,
    showBatchImport: false,
    showBatchExport: false,
    showBatchApprove: true,
    showBatchReject: true,
    showSingleAdd: true,
    showViewStock: true,
    showOperationGuide: true,
    defaultActions: ['add', 'batch-approve', 'batch-reject'],
    formFields: [
      {
        prop: 'deviceId',
        label: '设备',
        type: 'select',
        placeholder: '请选择设备',
        span: 1,
        clearable: false,
        filterable: true,
      },
      {
        prop: 'repairId',
        label: '维修记录',
        type: 'select',
        placeholder: '请选择维修记录',
        span: 1,
        clearable: false,
      },
      {
        prop: 'faultDescription',
        label: '故障描述',
        type: 'input',
        inputType: 'textarea',
        placeholder: '请输入故障描述',
        span: 2,
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
      {
        prop: 'repairRecord',
        label: '维修记录',
        type: 'input',
        inputType: 'textarea',
        placeholder: '请输入维修记录',
        span: 2,
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
      {
        prop: 'repairCost',
        label: '维修成本',
        type: 'input',
        inputType: 'number',
        placeholder: '请输入维修成本',
        span: 1,
        clearable: true,
      },
      {
        prop: 'repairDate',
        label: '维修日期',
        type: 'date',
        placeholder: '请选择维修日期',
        span: 1,
      },
      {
        prop: 'maintenancePerson',
        label: '维修人员',
        type: 'input',
        placeholder: '请输入维修人员',
        span: 1,
        clearable: true,
      },
      {
        prop: 'status',
        label: '维修状态',
        type: 'select',
        placeholder: '请选择维修状态',
        span: 1,
        clearable: false,
      },
      {
        prop: 'returnDate',
        label: '归还日期',
        type: 'date',
        placeholder: '请选择归还日期',
        span: 1,
      },
      {
        prop: 'returnPerson',
        label: '归还人员',
        type: 'input',
        placeholder: '请输入归还人员',
        span: 1,
        clearable: true,
      },
      {
        prop: 'checkResult',
        label: '验收结果',
        type: 'input',
        inputType: 'textarea',
        placeholder: '请输入验收结果',
        span: 2,
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'input',
        inputType: 'textarea',
        placeholder: '请输入备注信息',
        span: 2,
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
    ],
    formRules: {
      deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
      repairId: [{ required: true, message: '请选择维修记录', trigger: 'change' }],
      faultDescription: [
        { required: true, message: '请输入故障描述', trigger: 'blur' },
        { min: 5, max: 500, message: '故障描述长度在5-500个字符之间', trigger: 'blur' },
      ],
      repairRecord: [
        { required: true, message: '请输入维修记录', trigger: 'blur' },
        { min: 5, max: 500, message: '维修记录长度在5-500个字符之间', trigger: 'blur' },
      ],
      repairCost: [
        {
          validator: (rule, value, callback) => {
            if (value === '' || value === null || value === undefined) {
              callback();
              return;
            }
            const numValue = Number(value);
            if (isNaN(numValue)) {
              callback(new Error('维修成本必须为数字'));
            } else if (numValue < 0) {
              callback(new Error('维修成本不能为负数'));
            } else if (numValue > 999999.99) {
              callback(new Error('维修成本不能超过999999.99'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
      repairDate: [
        { required: true, message: '请选择维修日期', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback();
              return;
            }
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
              callback(new Error('维修日期不能晚于今天'));
            } else {
              callback();
            }
          },
          trigger: 'change',
        },
      ],
      maintenancePerson: [
        { required: true, message: '请输入维修人员', trigger: 'blur' },
        { min: 2, max: 50, message: '维修人员姓名长度在2-50个字符之间', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '维修人员姓名只能包含中文、英文和空格', trigger: 'blur' },
      ],
      status: [{ required: true, message: '请选择维修状态', trigger: 'change' }],
      returnDate: [
        { required: true, message: '请选择归还日期', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback();
              return;
            }
            const returnDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (returnDate > today) {
              callback(new Error('归还日期不能晚于今天'));
            } else {
              callback();
            }
          },
          trigger: 'change',
        },
      ],
      returnPerson: [
        { required: true, message: '请输入归还人员', trigger: 'blur' },
        { min: 2, max: 50, message: '归还人员姓名长度在2-50个字符之间', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '归还人员姓名只能包含中文、英文和空格', trigger: 'blur' },
      ],
      checkResult: [
        { required: true, message: '请输入验收结果', trigger: 'blur' },
        { min: 5, max: 500, message: '验收结果长度在5-500个字符之间', trigger: 'blur' },
      ],
      remark: [{ max: 500, message: '备注信息不能超过500个字符', trigger: 'blur' }],
    },
    searchFields: [
      {
        prop: 'inboundNo',
        label: '归还单号',
        type: 'input',
        placeholder: '请输入归还单号',
        span: 6,
        prefix: 'Document',
      },
      {
        prop: 'deviceCode',
        label: '设备编号',
        type: 'input',
        placeholder: '请输入设备编号',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'deviceName',
        label: '设备名称',
        type: 'input',
        placeholder: '请输入设备名称',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        span: 6,
        options: [
          { label: '待审核', value: 'pending' },
          { label: '已审核', value: 'approved' },
          { label: '已驳回', value: 'rejected' },
          { label: '已完成', value: 'completed' },
        ],
      },
      {
        prop: 'maintenancePerson',
        label: '维修人员',
        type: 'input',
        placeholder: '请输入维修人员',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'returnDateRange',
        label: '归还日期',
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        span: 6,
      },
    ],
    tableColumns: [
      { prop: 'inboundNo', label: '归还单号', width: 180, fixed: 'left' },
      { prop: 'deviceCode', label: '设备编号', width: 150 },
      { prop: 'deviceName', label: '设备名称', width: 150 },
      { prop: 'deviceType', label: '设备类型', width: 120, type: 'tag', slot: 'deviceType' },
      { prop: 'faultDescription', label: '故障描述', width: 200, showOverflowTooltip: true },
      { prop: 'repairRecord', label: '维修记录', width: 200, showOverflowTooltip: true },
      { prop: 'repairCost', label: '维修成本', width: 120, type: 'currency' },
      { prop: 'repairDate', label: '维修日期', width: 120, type: 'date' },
      { prop: 'maintenancePerson', label: '维修人员', width: 120 },
      { prop: 'returnDate', label: '归还日期', width: 120, type: 'date' },
      { prop: 'returnPerson', label: '归还人员', width: 120 },
      { prop: 'checkResult', label: '验收结果', width: 150 },
      { prop: 'operator', label: '操作员', width: 120 },
      { prop: 'status', label: '状态', width: 100, type: 'status', slot: 'status' },
      { prop: 'auditStatus', label: '审核状态', width: 100, type: 'status' },
      { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
    ],
    detailFields: [
      { prop: 'inboundNo', label: '归还单号', span: 2 },
      { prop: 'orderType', label: '订单类型', span: 1 },
      { prop: 'purpose', label: '用途', span: 1 },
      { prop: 'deviceCode', label: '设备编号', span: 1 },
      { prop: 'deviceName', label: '设备名称', span: 1 },
      { prop: 'deviceType', label: '设备类型', span: 1, type: 'tag' },
      { prop: 'faultDescription', label: '故障描述', span: 2 },
      { prop: 'repairRecord', label: '维修记录', span: 2 },
      { prop: 'repairCost', label: '维修成本', span: 1, type: 'currency' },
      { prop: 'repairDate', label: '维修日期', span: 1, type: 'date' },
      { prop: 'maintenancePerson', label: '维修人员', span: 1 },
      { prop: 'status', label: '维修状态', span: 1, type: 'status' },
      { prop: 'returnDate', label: '归还日期', span: 1, type: 'date' },
      { prop: 'returnPerson', label: '归还人员', span: 1 },
      { prop: 'checkResult', label: '验收结果', span: 2 },
      { prop: 'operator', label: '操作员', span: 1 },
      { prop: 'auditStatus', label: '审核状态', span: 1, type: 'status' },
      { prop: 'auditBy', label: '审核人', span: 1 },
      { prop: 'auditTime', label: '审核时间', span: 1, type: 'datetime' },
      { prop: 'remark', label: '备注', span: 2 },
    ],
  },
  'inventory-records': {
    title: '出入库记录查询与统计',
    apiPrefix: '/records',
    storeAction: 'records',
    showStatistics: true,
    showAudit: false,
    showBatchImport: false,
    showBatchExport: true,
    showBatchApprove: false,
    showBatchReject: false,
    showSingleAdd: false,
    showViewStock: false,
    showOperationGuide: true,
    defaultActions: ['export'],
    searchFields: [
      {
        prop: 'recordNo',
        label: '记录编号',
        type: 'input',
        placeholder: '请输入记录编号',
        span: 6,
        prefix: 'Document',
      },
      {
        prop: 'operationType',
        label: '操作类型',
        type: 'select',
        placeholder: '请选择操作类型',
        span: 6,
        options: [
          { label: '采购入库', value: 'PURCHASE_INBOUND' },
          { label: '安装出库', value: 'INSTALLATION_OUTBOUND' },
          { label: '维修归还', value: 'REPAIR_RETURN' },
          { label: '退货入库', value: 'RETURN_INBOUND' },
          { label: '调拨出库', value: 'TRANSFER_OUTBOUND' },
          { label: '调拨入库', value: 'TRANSFER_INBOUND' },
          { label: '损耗出库', value: 'LOSS_OUTBOUND' },
          { label: '其他入库', value: 'OTHER_INBOUND' },
          { label: '其他出库', value: 'OTHER_OUTBOUND' },
        ],
      },
      {
        prop: 'deviceCode',
        label: '设备编号',
        type: 'input',
        placeholder: '请输入设备编号',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'deviceName',
        label: '设备名称',
        type: 'input',
        placeholder: '请输入设备名称',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'deviceType',
        label: '设备类型',
        type: 'select',
        placeholder: '请选择设备类型',
        span: 6,
        options: [
          { label: '监控设备', value: 'monitor' },
          { label: '门禁设备', value: 'access_control' },
          { label: '网络设备', value: 'network' },
          { label: '服务器', value: 'server' },
          { label: '存储设备', value: 'storage' },
        ],
      },
      {
        prop: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        span: 6,
        options: [
          { label: '待审核', value: 'pending' },
          { label: '已审核', value: 'approved' },
          { label: '已驳回', value: 'rejected' },
          { label: '已完成', value: 'completed' },
        ],
      },
      {
        prop: 'operator',
        label: '操作员',
        type: 'input',
        placeholder: '请输入操作员',
        span: 6,
        prefix: 'Search',
      },
      {
        prop: 'operationDateRange',
        label: '操作日期',
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        span: 6,
      },
    ],
    tableColumns: [
      { prop: 'recordNo', label: '记录编号', width: 180, fixed: 'left' },
      { prop: 'operationType', label: '操作类型', width: 150, type: 'tag', slot: 'operationType' },
      { prop: 'orderType', label: '订单类型', width: 120 },
      { prop: 'deviceCode', label: '设备编号', width: 150 },
      { prop: 'deviceName', label: '设备名称', width: 150 },
      { prop: 'deviceType', label: '设备类型', width: 120, type: 'tag', slot: 'deviceType' },
      { prop: 'quantity', label: '数量', width: 100, align: 'center' },
      { prop: 'areaName', label: '区域', width: 120 },
      { prop: 'location', label: '位置', width: 150 },
      { prop: 'operator', label: '操作员', width: 120 },
      { prop: 'operationTime', label: '操作时间', width: 180, type: 'datetime' },
      { prop: 'status', label: '状态', width: 100, type: 'status', slot: 'status' },
      { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
    ],
    detailFields: [
      { prop: 'recordNo', label: '记录编号', span: 2 },
      { prop: 'operationType', label: '操作类型', span: 1, type: 'tag' },
      { prop: 'orderType', label: '订单类型', span: 1 },
      { prop: 'deviceCode', label: '设备编号', span: 1 },
      { prop: 'deviceName', label: '设备名称', span: 1 },
      { prop: 'deviceType', label: '设备类型', span: 1, type: 'tag' },
      { prop: 'quantity', label: '数量', span: 1 },
      { prop: 'areaName', label: '区域', span: 1 },
      { prop: 'location', label: '位置', span: 1 },
      { prop: 'operator', label: '操作员', span: 1 },
      { prop: 'operationTime', label: '操作时间', span: 1, type: 'datetime' },
      { prop: 'status', label: '状态', span: 1, type: 'status' },
      { prop: 'remark', label: '备注', span: 2 },
    ],
  },
};

export const ICON_MAP = {
  QuestionFilled,
  Box,
  Plus,
  Upload,
  Check,
  Close,
  Download,
  Document,
};

export const getBusinessConfig = (businessType) => {
  return BUSINESS_TYPE_CONFIG[businessType] || null;
};

export const getBusinessIcon = (iconName) => {
  return ICON_MAP[iconName];
};
