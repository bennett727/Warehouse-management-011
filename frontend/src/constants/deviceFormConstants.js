/**
 * 设备表单统一常量定义
 * 用于确保所有设备相关组件使用一致的字段和配置
 * @author: 开发团队
 * @createTime: 2025-12-21
 * @version: 1.0
 */

/**
 * 统一的设备表单字段定义
 * 所有设备相关组件都应该使用这个定义
 * 字段名与后端 DeviceDTO 保持一致
 */
export const UNIFIED_DEVICE_FIELDS = {
  // 基础信息
  deviceCode: '', // 设备编号
  serialNumber: '', // 设备序列号（SN）
  deviceName: '', // 设备名称（与后端 DTO 一致）
  deviceTypeId: null, // 设备类型ID（与后端 DTO 一致）
  deviceModel: '', // 规格型号（与后端 DTO 一致）
  manufacturer: '', // 制造商
  supplierId: null, // 供应商ID
  supplierName: '', // 供应商名称

  // 库存信息
  quantity: 1, // 数量（入库时使用）
  unitPrice: 0, // 单价（入库时使用）
  purchasePrice: 0, // 采购价格
  currentStock: 0, // 当前库存
  totalStock: 0, // 总库存
  areaId: null, // 存放区域
  binId: null, // 存放货位
  warehouseId: null, // 仓库ID
  warehouseName: '', // 仓库名称
  areaName: '', // 区域名称
  binName: '', // 货位名称

  // 状态信息
  status: -1, // 设备状态（改为数字类型）
  principalId: null, // 负责人ID
  principalName: '', // 负责人名称

  // 时间信息
  purchaseDate: '', // 采购日期
  productionDate: '', // 生产日期
  warrantyPeriod: 12, // 保修期限（月）
  warrantyStart: '', // 保修开始日期
  warrantyEnd: '', // 保修结束日期

  // 来源信息
  supplierBatchNo: '', // 供应商批次号/资产编号
  source: 'purchase', // 设备来源

  // 附加信息
  imageUrl: '', // 设备图片
  specifications: '', // 技术参数/规格说明
  description: '', // 设备描述
  remark: '', // 备注

  // 安装位置信息
  installationLocation: '', // 安装位置
  installationProvince: '', // 省
  installationCity: '', // 市
  installationDistrict: '', // 区
  installationAddress: '', // 详细地址
};

/**
 * 设备状态选项
 * 与 DeviceStatus 枚举保持一致
 */
export const DEVICE_STATUS_OPTIONS = [
  { label: '待入库', value: '-1' },
  { label: '在库', value: '0' },
  { label: '使用中', value: '1' },
  { label: '已安装', value: '2' },
  { label: '维护中', value: '3' },
  { label: '维修中', value: '4' },
  { label: '已报废', value: '5' },
];

/**
 * 设备来源选项
 */
export const DEVICE_SOURCE_OPTIONS = [
  { label: '采购', value: 'purchase' },
  { label: '租赁', value: 'lease' },
  { label: '调拨', value: 'transfer' },
  { label: '捐赠', value: 'donation' },
  { label: '其他', value: 'other' },
];

/**
 * 统一的表单验证规则
 * 字段名与后端 DeviceDTO 保持一致
 */
export const UNIFIED_FORM_RULES = {
  deviceCode: [
    { required: true, message: '请输入设备编号', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  deviceName: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  deviceTypeId: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  deviceModel: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  manufacturer: [{ max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  supplierName: [{ max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 9999, message: '数量必须在 1-9999 之间', trigger: 'blur' },
  ],
  unitPrice: [{ type: 'number', min: 0, message: '单价不能为负数', trigger: 'blur' }],
  purchasePrice: [{ type: 'number', min: 0, message: '采购价格不能为负数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  principalName: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  serialNumber: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  supplierBatchNo: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  warrantyPeriod: [{ type: 'number', min: 0, max: 120, message: '保修期限在 0-120 个月之间', trigger: 'blur' }],
  specifications: [{ max: 1000, message: '长度不能超过 1000 个字符', trigger: 'blur' }],
  description: [{ max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }],
  remark: [{ max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }],
};

/**
 * 表单模式配置
 * 用于控制不同场景下显示的字段
 */
export const FORM_MODE_CONFIG = {
  // 设备管理 - 新增/编辑
  deviceManagement: {
    showFields: [
      'deviceCode',
      'serialNumber',
      'name',
      'deviceType',
      'model',
      'manufacturer',
      'supplier',
      'status',
      'principal',
      'purchaseDate',
      'warrantyDate',
      'purchasePrice',
      'location',
      'description',
      'remark',
    ],
    requiredFields: ['deviceCode', 'name', 'deviceType', 'status'],
    title: {
      add: '新增设备',
      edit: '编辑设备',
    },
  },

  // 入库管理 - 添加设备
  inbound: {
    showFields: [
      'deviceCode',
      'serialNumber',
      'name',
      'deviceType',
      'model',
      'manufacturer',
      'quantity',
      'unitPrice',
      'areaId',
      'location',
      'purchaseDate',
      'warrantyPeriod',
      'supplierBatchNo',
      'source',
      'supplier',
      'imageUrl',
      'technicalParams',
      'remark',
    ],
    requiredFields: ['deviceCode', 'name', 'deviceType', 'quantity'],
    title: {
      add: '手动添加入库设备',
      edit: '编辑入库设备',
    },
  },

  // 快速录入模式
  quick: {
    showFields: ['deviceCode', 'name', 'deviceType', 'model', 'quantity', 'location'],
    requiredFields: ['deviceCode', 'name', 'deviceType'],
    title: {
      add: '快速添加设备',
      edit: '编辑设备',
    },
  },
};

/**
 * 字段标签映射
 * 与后端 DeviceDTO 字段名保持一致
 */
export const FIELD_LABELS = {
  deviceCode: '设备编号',
  serialNumber: '设备序列号',
  deviceName: '设备名称',
  deviceTypeId: '设备类型',
  deviceModel: '规格型号',
  manufacturer: '制造商',
  supplierId: '供应商',
  supplierName: '供应商',
  quantity: '数量',
  unitPrice: '单价',
  purchasePrice: '采购价格',
  areaId: '存放区域',
  binId: '存放货位',
  warehouseId: '仓库',
  warehouseName: '仓库',
  areaName: '区域',
  binName: '货位',
  location: '存放位置',
  status: '设备状态',
  principalId: '负责人',
  principalName: '负责人',
  purchaseDate: '采购日期',
  productionDate: '生产日期',
  warrantyPeriod: '保修期限',
  warrantyStart: '保修开始',
  warrantyEnd: '保修到期',
  supplierBatchNo: '资产编号',
  source: '设备来源',
  imageUrl: '设备图片',
  specifications: '技术参数',
  description: '设备描述',
  remark: '备注',
  installationLocation: '安装位置',
  installationProvince: '省',
  installationCity: '市',
  installationDistrict: '区',
  installationAddress: '详细地址',
};

/**
 * 字段占位符映射
 * 与后端 DeviceDTO 字段名保持一致
 */
export const FIELD_PLACEHOLDERS = {
  deviceCode: '请输入设备编号',
  serialNumber: '请输入设备序列号（SN）',
  deviceName: '请输入设备名称',
  deviceTypeId: '请选择设备类型',
  deviceModel: '请输入规格型号',
  manufacturer: '请输入制造商',
  supplierId: '请选择供应商',
  supplierName: '请输入供应商名称',
  quantity: '请输入数量',
  unitPrice: '请输入单价',
  purchasePrice: '请输入采购价格',
  areaId: '请选择存放区域',
  binId: '请选择存放货位',
  warehouseId: '请选择仓库',
  location: '请输入存放位置',
  status: '请选择设备状态',
  principalId: '请选择负责人',
  principalName: '请输入负责人姓名',
  purchaseDate: '请选择采购日期',
  productionDate: '请选择生产日期',
  warrantyPeriod: '请输入保修期限',
  warrantyStart: '请选择保修开始日期',
  warrantyEnd: '请选择保修到期日期',
  supplierBatchNo: '请输入资产编号',
  source: '请选择设备来源',
  specifications: '请输入设备技术参数、规格说明等详细信息',
  description: '请输入设备描述',
  remark: '请输入备注信息',
};

export default {
  UNIFIED_DEVICE_FIELDS,
  DEVICE_STATUS_OPTIONS,
  DEVICE_SOURCE_OPTIONS,
  UNIFIED_FORM_RULES,
  FORM_MODE_CONFIG,
  FIELD_LABELS,
  FIELD_PLACEHOLDERS,
};
