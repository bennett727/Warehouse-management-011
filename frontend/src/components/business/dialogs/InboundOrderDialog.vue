<!--
  @file: InboundOrderDialog.vue
  @description: 新建/编辑入库单对话框 - 统一设计规范
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1200px"
    top="5vh"
    destroy-on-close
    :close-on-click-modal="false"
    class="inbound-order-dialog"
  >
    <div class="dialog-container">
      <!-- 上半部分：入库单基本信息区域 -->
      <div class="order-info-section">
        <div class="section-header">
          <el-icon><Document /></el-icon>
          <span>入库单基本信息</span>
        </div>

        <el-form ref="formRef" :model="formData" :rules="getDynamicFormRules" label-width="100px" class="order-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="入库单号" prop="orderNo">
                <el-input v-model="formData.orderNo" placeholder="系统自动生成" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库日期" prop="orderDate">
                <el-date-picker
                  v-model="formData.orderDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库类型" prop="inboundType">
                <el-select v-model="formData.inboundType" placeholder="请选择入库类型" style="width: 100%">
                  <el-option label="采购入库" :value="0">
                    <el-icon><ShoppingCart /></el-icon> 采购入库
                  </el-option>
                  <el-option label="退货入库" :value="1">
                    <el-icon><RefreshLeft /></el-icon> 退货入库
                  </el-option>
                  <el-option label="调拨入库" :value="2">
                    <el-icon><Sort /></el-icon> 调拨入库
                  </el-option>
                  <el-option label="其他入库" :value="3">
                    <el-icon><More /></el-icon> 其他入库
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="供应商" prop="supplier" :required="formData.inboundType === 0">
                <el-input
                  v-model="formData.supplier"
                  :placeholder="formData.inboundType === 0 ? '请输入供应商名称（必填）' : '请输入供应商名称'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="经办人" prop="operatorName">
                <el-select
                  v-model="formData.operatorId"
                  placeholder="请选择经办人"
                  filterable
                  style="width: 100%"
                  @change="handleOperatorChange"
                >
                  <el-option
                    v-for="user in userOptions"
                    :key="user.id"
                    :label="user.realName || user.username"
                    :value="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="formData.inboundType === 1">
            <el-col :span="8">
              <el-form-item label="原出库单号" prop="relatedOutboundNo">
                <el-input v-model="formData.relatedOutboundNo" placeholder="请输入原出库单号" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="退货原因" prop="returnReason">
                <el-input v-model="formData.returnReason" placeholder="请输入退货原因" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="formData.inboundType === 2">
            <el-col :span="8">
              <el-form-item label="调拨单号" prop="relatedTransferNo">
                <el-input v-model="formData.relatedTransferNo" placeholder="请输入调拨单号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="调出仓库" prop="sourceWarehouseId">
                <el-select v-model="formData.sourceWarehouseId" placeholder="请选择调出仓库" style="width: 100%">
                  <el-option
                    v-for="warehouse in warehouseOptions"
                    :key="warehouse.id"
                    :label="warehouse.name"
                    :value="warehouse.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <el-divider class="section-divider" />

      <!-- 下半部分：设备选择区域 -->
      <div class="device-selection-section">
        <div class="section-header">
          <el-icon><Box /></el-icon>
          <span>入库设备</span>
          <el-tag type="info" class="selected-count">共 {{ formData.items?.length || 0 }} 项</el-tag>
        </div>

        <!-- 设备列表工具栏 -->
        <div class="device-toolbar">
          <el-button type="primary" :icon="Plus" @click="handleAddItem">添加设备</el-button>
          <el-button type="success" :icon="Upload" @click="handleImport">批量导入</el-button>
          <el-button
            v-if="formData.items?.length > 0 && binOptions.length > 0"
            type="warning"
            :icon="MagicStick"
            @click="handleAutoAssignBins"
          >
            自动分配货位
          </el-button>
          <span class="toolbar-spacer"></span>
          <span class="total-info">
            总数量: <strong>{{ totalQuantity }}</strong> | 总金额: <strong>¥{{ totalAmount.toFixed(2) }}</strong>
          </span>
        </div>

        <!-- 设备明细表格 -->
        <el-table :data="formData.items" border size="small" height="300px" class="device-table">
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="设备" min-width="200">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.deviceId"
                placeholder="搜索选择设备"
                filterable
                remote
                :remote-method="searchDevices"
                :loading="deviceSearchLoading"
                style="width: 100%"
                @change="(val) => handleDeviceChange(val, $index)"
              >
                <el-option
                  v-for="device in deviceOptions"
                  :key="device.id"
                  :label="device.deviceName + ' (' + device.deviceCode + ')'"
                  :value="device.id"
                >
                  <div class="device-option">
                    <span>{{ device.deviceName }}</span>
                    <el-tag size="small" type="info" style="margin-left: 8px">{{ device.deviceCode }}</el-tag>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="规格型号" width="120">
            <template #default="{ row }">
              {{ row.specification || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="货位" width="150">
            <template #default="{ row }">
              <el-select v-model="row.binId" placeholder="选择货位" style="width: 100%">
                <el-option v-for="bin in binOptions" :key="bin.id" :label="bin.code" :value="bin.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" :max="9999" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.unitPrice" :min="0" :precision="2" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120" align="right">
            <template #default="{ row }"> ¥{{ ((row.quantity || 0) * (row.unitPrice || 0)).toFixed(2) }} </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.remark" placeholder="备注" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="handleRemoveItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </el-button>
      </div>
    </template>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入设备" width="600px" append-to-body>
      <el-upload
        drag
        action="/api/inventory/inbound/import"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        accept=".xlsx,.xls,.csv"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx, .xls, .csv 格式，<el-link type="primary" @click="downloadTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import {
  Document,
  Box,
  ShoppingCart,
  RefreshLeft,
  Sort,
  More,
  Plus,
  Upload,
  UploadFilled,
  MagicStick,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, computed, watch } from 'vue';

import { getDeviceList } from '@/api/device/device';
import { getBinList } from '@/api/inventory/bin';
import { generateInboundOrderNo } from '@/api/inventory/inbound';
import { getWarehouseList } from '@/api/inventory/warehouse';
import { getUserList } from '@/api/system/user';
import { createLogger } from '@/utils/logger';

const logger = createLogger('InboundOrderDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create',
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新建入库单' : '编辑入库单';
});

// 表单引用
const formRef = ref(null);

// 表单数据
const formData = reactive({
  orderNo: '',
  orderDate: new Date().toISOString().split('T')[0],
  inboundType: 0,
  supplier: '',
  operatorId: null,
  operatorName: '',
  contactPhone: '',
  remark: '',
  items: [],
  relatedOutboundNo: '',
  returnReason: '',
  relatedTransferNo: '',
  sourceWarehouseId: null,
});

const warehouseOptions = ref([]);

const getDynamicFormRules = computed(() => {
  const baseRules = {
    orderDate: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
    inboundType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
    operatorId: [{ required: true, message: '请选择经办人', trigger: 'change' }],
  };

  if (formData.inboundType === 0) {
    baseRules.supplier = [{ required: true, message: '采购入库必须填写供应商', trigger: 'blur' }];
  }

  if (formData.inboundType === 1) {
    baseRules.relatedOutboundNo = [{ required: true, message: '退货入库必须填写原出库单号', trigger: 'blur' }];
    baseRules.returnReason = [{ required: true, message: '请填写退货原因', trigger: 'blur' }];
  }

  if (formData.inboundType === 2) {
    baseRules.relatedTransferNo = [{ required: true, message: '调拨入库必须填写调拨单号', trigger: 'blur' }];
    baseRules.sourceWarehouseId = [{ required: true, message: '请选择调出仓库', trigger: 'change' }];
  }

  return baseRules;
});

// 设备选择相关
const deviceSearchLoading = ref(false);
const deviceOptions = ref([]);
const binOptions = ref([]);
const userOptions = ref([]);
const importDialogVisible = ref(false);
const submitLoading = ref(false);

// 计算属性
const totalQuantity = computed(() => {
  return formData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
});

const totalAmount = computed(() => {
  return formData.items?.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0) || 0;
});

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm();
      loadBinOptions();
      loadUsers();
      loadWarehouseOptions();
    }
  }
);

// 初始化表单
const initForm = async () => {
  if (props.mode === 'create') {
    formData.orderNo = await generateInboundOrderNo();
    formData.orderDate = new Date().toISOString().split('T')[0];
    formData.inboundType = 0;
    formData.supplier = '';
    formData.operatorId = null;
    formData.operatorName = '';
    formData.contactPhone = '';
    formData.remark = '';
    formData.items = [];
    formData.relatedOutboundNo = '';
    formData.returnReason = '';
    formData.relatedTransferNo = '';
    formData.sourceWarehouseId = null;
  } else if (props.initialData) {
    Object.assign(formData, props.initialData);
    formData.items = props.initialData.items || [];
  }
};

// 加载货位选项
const loadBinOptions = async () => {
  try {
    const res = await getBinList({ pageSize: 1000 });
    binOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载货位列表失败', error);
  }
};

// 加载仓库选项
const loadWarehouseOptions = async () => {
  try {
    const res = await getWarehouseList({ pageSize: 1000 });
    warehouseOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载仓库列表失败', error);
  }
};

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await getUserList({ pageSize: 1000 });
    userOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载用户列表失败', error);
  }
};

// 搜索设备
const searchDevices = async (query) => {
  if (!query) {
    deviceOptions.value = [];
    return;
  }

  deviceSearchLoading.value = true;
  try {
    const res = await getDeviceList({ keyword: query, size: 20 });
    if (res.code === 200 && res.data) {
      deviceOptions.value = res.data.records || res.data.list || res.data.devices || [];
      logger.debug('设备搜索成功', { count: deviceOptions.value.length });
    } else {
      deviceOptions.value = [];
      logger.warn('设备搜索响应格式异常', res);
    }
  } catch (error) {
    logger.error('搜索设备失败', error);
    deviceOptions.value = [];
  } finally {
    deviceSearchLoading.value = false;
  }
};

// 处理设备变化
const handleDeviceChange = (deviceId, index) => {
  const device = deviceOptions.value.find((d) => d.id === deviceId);
  if (device) {
    formData.items[index].deviceName = device.deviceName;
    formData.items[index].deviceCode = device.deviceCode;
    formData.items[index].specification = device.specification || '';
  }
};

// 处理经办人变化
const handleOperatorChange = (userId) => {
  const user = userOptions.value.find((u) => u.id === userId);
  if (user) {
    formData.operatorName = user.realName || user.username;
  }
};

// 添加设备项
const handleAddItem = () => {
  if (!formData.items) {
    formData.items = [];
  }
  formData.items.push({
    deviceId: null,
    deviceName: '',
    deviceCode: '',
    specification: '',
    binId: null,
    quantity: 1,
    unitPrice: 0,
    remark: '',
  });
};

// 移除设备项
const handleRemoveItem = (index) => {
  formData.items.splice(index, 1);
};

// 打开导入对话框
const handleImport = () => {
  importDialogVisible.value = true;
};

// 导入成功
const handleImportSuccess = (response) => {
  if (response.code === 200) {
    formData.items.push(...(response.data || []));
    ElMessage.success('导入成功');
    importDialogVisible.value = false;
  } else {
    ElMessage.error(response.message || '导入失败');
  }
};

// 导入失败
const handleImportError = () => {
  ElMessage.error('导入失败');
};

// 下载模板
const downloadTemplate = () => {
  // 实现模板下载逻辑
  ElMessage.info('模板下载功能开发中');
};

// 自动分配货位策略
const autoAssignStrategy = {
  // 顺序分配：按货位顺序依次分配
  SEQUENTIAL: (bins, items) => {
    const availableBins = bins.filter((b) => b.status === 'AVAILABLE');
    return items.map((item, index) => {
      const bin = availableBins[index % availableBins.length];
      return bin ? bin.id : null;
    });
  },
  // 分散分配：尽量分散到不同区域
  SCATTERED: (bins, items) => {
    const availableBins = bins.filter((b) => b.status === 'AVAILABLE');
    const groupedByZone = availableBins.reduce((acc, bin) => {
      const zone = bin.zone || '默认区域';
      if (!acc[zone]) {
        acc[zone] = [];
      }
      acc[zone].push(bin);
      return acc;
    }, {});

    const zones = Object.keys(groupedByZone);
    return items.map((item, index) => {
      const zone = zones[index % zones.length];
      const zoneBins = groupedByZone[zone];
      const binIndex = Math.floor(index / zones.length) % zoneBins.length;
      return zoneBins[binIndex] ? zoneBins[binIndex].id : null;
    });
  },
  // 按设备类型匹配分配
  BY_TYPE: (bins, items, deviceOptions) => {
    const availableBins = bins.filter((b) => b.status === 'AVAILABLE');
    return items.map((item) => {
      const device = deviceOptions.find((d) => d.id === item.deviceId);
      if (!device) {
        return availableBins[0]?.id || null;
      }

      // 根据设备类型匹配合适的货位类型
      const compatibleTypes = getCompatibleBinTypes(device.type);
      const matchedBins = availableBins.filter((b) => compatibleTypes.includes(b.type));

      if (matchedBins.length > 0) {
        // 返回匹配度最高的货位
        return matchedBins[0].id;
      }
      // 如果没有匹配的，返回第一个可用货位
      return availableBins[0]?.id || null;
    });
  },
};

// 获取设备类型兼容的货位类型
const getCompatibleBinTypes = (deviceType) => {
  const typeMapping = {
    REFRIGERATED: ['REFRIGERATED', 'NORMAL'],
    COLD_CHAIN: ['REFRIGERATED', 'NORMAL'],
    HAZARDOUS: ['HAZARDOUS'],
    CHEMICAL: ['HAZARDOUS'],
    FRAGILE: ['FRAGILE', 'NORMAL'],
    GLASS: ['FRAGILE', 'NORMAL'],
    HEAVY: ['HEAVY', 'NORMAL'],
    METAL: ['HEAVY', 'NORMAL'],
    LIGHT: ['LIGHT', 'NORMAL'],
    TEXTILE: ['LIGHT', 'NORMAL'],
    ELECTRONIC: ['NORMAL', 'LIGHT'],
    DEFAULT: ['NORMAL'],
  };
  return typeMapping[deviceType] || typeMapping.DEFAULT;
};

// 处理自动分配货位
const handleAutoAssignBins = async () => {
  if (!formData.items || formData.items.length === 0) {
    ElMessage.warning('请先添加设备');
    return;
  }

  if (binOptions.value.length === 0) {
    ElMessage.warning('暂无可用的货位');
    return;
  }

  const availableBins = binOptions.value.filter((b) => b.status === 'AVAILABLE');
  if (availableBins.length === 0) {
    ElMessage.warning('暂无可用的空闲货位');
    return;
  }

  if (availableBins.length < formData.items.length) {
    ElMessage.warning(`可用货位不足，需要 ${formData.items.length} 个，实际只有 ${availableBins.length} 个`);
    return;
  }

  try {
    // 使用按类型匹配策略
    const assignedBinIds = autoAssignStrategy.BY_TYPE(availableBins, formData.items, deviceOptions.value);

    // 分配货位到每个设备项
    formData.items.forEach((item, index) => {
      item.binId = assignedBinIds[index];
    });

    // 统计分配结果
    const assignedCount = assignedBinIds.filter((id) => id !== null).length;
    ElMessage.success(`自动分配完成，成功分配 ${assignedCount} 个货位`);
  } catch (error) {
    logger.error('自动分配货位失败', error);
    ElMessage.error('自动分配货位失败');
  }
};

// 处理提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (!formData.items || formData.items.length === 0) {
    ElMessage.warning('请至少添加一个设备');
    return;
  }

  submitLoading.value = true;

  try {
    emit('confirm', { ...formData });
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.inbound-order-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;

  .el-icon {
    font-size: 18px;
    color: #409eff;
  }

  .selected-count {
    margin-left: auto;
    font-size: 14px;
    font-weight: normal;
  }
}

.section-divider {
  margin: 20px 0;
}

.order-info-section {
  .order-form {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
  }
}

.device-selection-section {
  .device-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;

    .toolbar-spacer {
      flex: 1;
    }

    .total-info {
      font-size: 14px;
      color: #606266;

      strong {
        color: #409eff;
        font-size: 16px;
      }
    }
  }

  .device-table {
    margin-bottom: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.device-option {
  display: flex;
  align-items: center;
}
</style>
