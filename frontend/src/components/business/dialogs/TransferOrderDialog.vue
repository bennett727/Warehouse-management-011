<!--
  @file: TransferOrderDialog.vue
  @description: 新建/编辑库存调拨单对话框 - 统一设计规范
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
    class="transfer-order-dialog"
    data-cy="transfer-order-dialog"
  >
    <div class="dialog-container">
      <!-- 上半部分：调拨单基本信息区域 -->
      <div class="order-info-section">
        <div class="section-header">
          <el-icon><Document /></el-icon>
          <span>调拨单基本信息</span>
        </div>

        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="order-form" data-cy="transfer-order-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="调拨单号" prop="orderNo" data-cy="transfer-order-no-form-item">
                <el-input v-model="formData.orderNo" placeholder="系统自动生成" disabled data-cy="transfer-order-no-input" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="调拨日期" prop="transferDate" data-cy="transfer-order-date-form-item">
                <el-date-picker
                  v-model="formData.transferDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  data-cy="transfer-order-date-picker"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="调拨类型" prop="transferType" data-cy="transfer-order-type-form-item">
                <el-select v-model="formData.transferType" placeholder="请选择调拨类型" style="width: 100%" data-cy="transfer-order-type-select">
                  <el-option label="仓库间调拨" :value="0" data-cy="transfer-type-warehouse" />
                  <el-option label="部门间调拨" :value="1" data-cy="transfer-type-department" />
                  <el-option label="门店间调拨" :value="2" data-cy="transfer-type-store" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="调出仓库" prop="fromWarehouseId" data-cy="transfer-from-warehouse-form-item">
                <el-select
                  v-model="formData.fromWarehouseId"
                  placeholder="请选择调出仓库"
                  filterable
                  style="width: 100%"
                  @change="handleFromWarehouseChange"
                  data-cy="transfer-from-warehouse-select"
                >
                  <el-option
                    v-for="warehouse in warehouseOptions"
                    :key="warehouse.id"
                    :label="warehouse.name"
                    :value="warehouse.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="调入仓库" prop="toWarehouseId" data-cy="transfer-to-warehouse-form-item">
                <el-select
                  v-model="formData.toWarehouseId"
                  placeholder="请选择调入仓库"
                  filterable
                  style="width: 100%"
                  @change="handleToWarehouseChange"
                  data-cy="transfer-to-warehouse-select"
                >
                  <el-option
                    v-for="warehouse in toWarehouseOptions"
                    :key="warehouse.id"
                    :label="warehouse.name"
                    :value="warehouse.id"
                  >
                    <div style="display: flex; justify-content: space-between; width: 100%">
                      <span>{{ warehouse.name }}</span>
                      <el-tag size="small" :type="getCapacityTagType(warehouse)" v-if="warehouse.capacity">
                        容量: {{ warehouse.usedCapacity || 0 }}/{{ warehouse.capacity }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="经办人" prop="operatorName" data-cy="transfer-operator-form-item">
                <el-select
                  v-model="formData.operatorId"
                  placeholder="请选择经办人"
                  filterable
                  style="width: 100%"
                  @change="handleOperatorChange"
                  data-cy="transfer-operator-select"
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
          </el-row>

          <el-form-item label="调拨原因" prop="transferReason" data-cy="transfer-reason-form-item">
            <el-input
              v-model="formData.transferReason"
              type="textarea"
              :rows="2"
              placeholder="请输入调拨原因"
              maxlength="500"
              show-word-limit
              data-cy="transfer-reason-input"
            />
          </el-form-item>

          <el-form-item label="备注" prop="remark" data-cy="transfer-remark-form-item">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
              data-cy="transfer-remark-input"
            />
          </el-form-item>
        </el-form>
      </div>

      <el-divider class="section-divider" />

      <!-- 下半部分：设备选择区域 -->
      <div class="device-selection-section">
        <div class="section-header">
          <el-icon><Box /></el-icon>
          <span>调拨设备</span>
          <el-tag type="info" class="selected-count">共 {{ formData.items?.length || 0 }} 项</el-tag>
        </div>

        <!-- 设备列表工具栏 -->
        <div class="device-toolbar">
          <el-button type="primary" :icon="Plus" @click="handleAddItem" :disabled="!formData.fromWarehouseId" data-cy="transfer-add-item-btn">
            添加设备
          </el-button>
          <el-alert
            v-if="!formData.fromWarehouseId"
            title="请先选择调出仓库"
            type="warning"
            :closable="false"
            style="flex: 1; margin-left: 12px"
          />
          <span v-else class="toolbar-spacer"></span>
          <span class="total-info">
            总数量: <strong>{{ totalQuantity }}</strong>
          </span>
        </div>

        <!-- 设备明细表格 -->
        <el-table
          :data="formData.items"
          border
          size="small"
          height="300px"
          class="device-table"
          empty-text="请选择调出仓库后添加设备"
          data-cy="transfer-device-table"
        >
          <el-table-column type="index" label="序号" width="50" align="center" data-cy="transfer-device-table-index-column" />
          <el-table-column label="设备" min-width="200" data-cy="transfer-device-table-device-column">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.deviceId"
                placeholder="搜索选择设备"
                filterable
                remote
                :remote-method="(query) => searchDevices(query, $index)"
                :loading="deviceSearchLoading"
                style="width: 100%"
                :data-cy="`transfer-device-select-${$index}`"
                @change="(val) => handleDeviceChange(val, $index)"
              >
                <el-option
                  v-for="device in deviceOptions[$index] || []"
                  :key="device.id"
                  :label="device.deviceName + ' (' + device.deviceCode + ')'"
                  :value="device.id"
                >
                  <div class="device-option">
                    <span>{{ device.deviceName }}</span>
                    <el-tag size="small" type="info" style="margin-left: 8px">{{ device.deviceCode }}</el-tag>
                    <el-tag size="small" type="success" style="margin-left: 4px"
                      >库存: {{ device.stockQuantity || 0 }}</el-tag
                    >
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="规格型号" width="120" data-cy="transfer-device-table-spec-column">
            <template #default="{ row }">
              {{ row.specification || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="调出货位" width="120" data-cy="transfer-device-table-from-bin-column">
            <template #default="{ row }">
              {{ row.fromBinCode || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="调入货位" width="150" data-cy="transfer-device-table-to-bin-column">
            <template #default="{ row, $index }">
              <el-select v-model="row.toBinId" placeholder="选择货位" style="width: 100%" :data-cy="`transfer-to-bin-select-${$index}`">
                <el-option v-for="bin in toBinOptions" :key="bin.id" :label="bin.code" :value="bin.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="100" data-cy="transfer-device-table-quantity-column">
            <template #default="{ row, $index }">
              <el-input-number v-model="row.quantity" :min="1" :max="row.maxQuantity || 9999" style="width: 100%" :data-cy="`transfer-quantity-input-${$index}`" />
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120" data-cy="transfer-device-table-remark-column">
            <template #default="{ row, $index }">
              <el-input v-model="row.remark" placeholder="备注" size="small" :data-cy="`transfer-remark-input-${$index}`" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" fixed="right" data-cy="transfer-device-table-action-column">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="handleRemoveItem($index)" :data-cy="`transfer-remove-item-btn-${$index}`">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer" data-cy="transfer-order-footer">
        <el-button @click="dialogVisible = false" data-cy="transfer-order-cancel-btn">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit" data-cy="transfer-order-submit-btn"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Document, Box, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, computed, watch } from 'vue';

import { getDeviceList } from '@/api/device/device';
import { getBinList } from '@/api/inventory/bin';
import { generateTransferOrderNo } from '@/api/inventory/transfer';
import { getWarehouseList } from '@/api/inventory/warehouse';
import { getUserList } from '@/api/system/user';
import inventoryLockManager from '@/utils/inventoryLockManager.js';
import { createLogger } from '@/utils/logger';
import transferService, {
  TRANSFER_STATUS,
  TRANSFER_STATUS_LABELS,
  TRANSFER_STATUS_TAG_TYPES,
} from '@/utils/transferService.js';

const logger = createLogger('TransferOrderDialog');

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
  return props.mode === 'create' ? '新建调拨单' : '编辑调拨单';
});

// 表单引用
const formRef = ref(null);

// 表单数据
const formData = reactive({
  orderNo: '',
  transferDate: new Date().toISOString().split('T')[0],
  transferType: 0,
  fromWarehouseId: null,
  fromWarehouseName: '',
  toWarehouseId: null,
  toWarehouseName: '',
  operatorId: null,
  operatorName: '',
  transferReason: '',
  remark: '',
  items: [],
});

// 表单验证规则
const formRules = {
  transferDate: [{ required: true, message: '请选择调拨日期', trigger: 'change' }],
  transferType: [{ required: true, message: '请选择调拨类型', trigger: 'change' }],
  fromWarehouseId: [{ required: true, message: '请选择调出仓库', trigger: 'change' }],
  toWarehouseId: [
    { required: true, message: '请选择调入仓库', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value === formData.fromWarehouseId) {
          callback(new Error('调入仓库不能与调出仓库相同'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  operatorId: [{ required: true, message: '请选择经办人', trigger: 'change' }],
  transferReason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }],
};

// 选项数据
const deviceSearchLoading = ref(false);
const deviceOptions = ref([]);
const warehouseOptions = ref([]);
const toWarehouseOptions = ref([]);
const toBinOptions = ref([]);
const userOptions = ref([]);
const submitLoading = ref(false);

// 计算属性
const totalQuantity = computed(() => {
  return formData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
});

const targetWarehouseCapacity = computed(() => {
  if (!formData.toWarehouseId) {
    return null;
  }
  const warehouse = warehouseOptions.value.find((w) => w.id === formData.toWarehouseId);
  return warehouse;
});

const getCapacityTagType = (warehouse) => {
  if (!warehouse.capacity) {
    return 'info';
  }
  const usageRate = (warehouse.usedCapacity || 0) / warehouse.capacity;
  if (usageRate >= 1) {
    return 'danger';
  }
  if (usageRate >= 0.8) {
    return 'warning';
  }
  return 'success';
};

const validateTargetWarehouseCapacity = () => {
  if (!formData.toWarehouseId || formData.items.length === 0) {
    return { valid: true };
  }

  const targetWarehouse = warehouseOptions.value.find((w) => w.id === formData.toWarehouseId);
  if (!targetWarehouse || !targetWarehouse.capacity) {
    return { valid: true };
  }

  const currentUsed = targetWarehouse.usedCapacity || 0;
  const totalCapacity = targetWarehouse.capacity;
  const transferQuantity = totalQuantity.value;
  const remainingCapacity = totalCapacity - currentUsed;

  if (transferQuantity > remainingCapacity) {
    return {
      valid: false,
      message: `调入仓库容量不足！剩余容量: ${remainingCapacity}，调拨数量: ${transferQuantity}`,
      remainingCapacity,
      transferQuantity,
    };
  }

  if (remainingCapacity - transferQuantity < totalCapacity * 0.1) {
    ElMessage.warning(`提示：调入后仓库容量将接近上限（剩余${remainingCapacity - transferQuantity}）`);
  }

  return { valid: true };
};

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm();
      loadWarehouses();
      loadUsers();
    }
  }
);

// 监听调出仓库变化
watch(
  () => formData.fromWarehouseId,
  (val) => {
    if (val) {
      const warehouse = warehouseOptions.value.find((w) => w.id === val);
      formData.fromWarehouseName = warehouse?.name || '';
      // 清空已选设备
      formData.items = [];
    }
    // 更新可选调入仓库列表
    toWarehouseOptions.value = warehouseOptions.value.filter((w) => w.id !== val);
  }
);

// 监听调入仓库变化
watch(
  () => formData.toWarehouseId,
  (val) => {
    if (val) {
      const warehouse = warehouseOptions.value.find((w) => w.id === val);
      formData.toWarehouseName = warehouse?.name || '';
      loadToBinOptions(val);
    }
  }
);

// 初始化表单
const initForm = async () => {
  if (props.mode === 'create') {
    formData.orderNo = await generateTransferOrderNo();
    formData.transferDate = new Date().toISOString().split('T')[0];
    formData.transferType = 0;
    formData.fromWarehouseId = null;
    formData.fromWarehouseName = '';
    formData.toWarehouseId = null;
    formData.toWarehouseName = '';
    formData.operatorId = null;
    formData.operatorName = '';
    formData.transferReason = '';
    formData.remark = '';
    formData.items = [];
  } else if (props.initialData) {
    Object.assign(formData, props.initialData);
    formData.items = props.initialData.items || [];
  }
};

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    const res = await getWarehouseList({ pageSize: 1000 });
    warehouseOptions.value = res.data?.list || [];
    toWarehouseOptions.value = [...warehouseOptions.value];
  } catch (error) {
    logger.error('加载仓库列表失败', error);
  }
};

// 加载调入仓库货位
const loadToBinOptions = async (warehouseId) => {
  try {
    const res = await getBinList({ warehouseId, pageSize: 1000 });
    toBinOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载货位列表失败', error);
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

// 搜索设备（从调出仓库）
const searchDevices = async (query, index) => {
  if (!query || !formData.fromWarehouseId) {
    deviceOptions.value[index] = [];
    return;
  }

  deviceSearchLoading.value = true;
  try {
    const res = await getDeviceList({
      keyword: query,
      warehouseId: formData.fromWarehouseId,
      hasStock: true,
      size: 20,
    });
    deviceOptions.value[index] = res.data?.list || [];
  } catch (error) {
    logger.error('搜索设备失败', error);
  } finally {
    deviceSearchLoading.value = false;
  }
};

// 处理设备变化
const handleDeviceChange = (deviceId, index) => {
  const device = deviceOptions.value[index]?.find((d) => d.id === deviceId);
  if (device) {
    formData.items[index].deviceName = device.deviceName;
    formData.items[index].deviceCode = device.deviceCode;
    formData.items[index].specification = device.specification || '';
    formData.items[index].fromBinCode = device.binCode || '';
    formData.items[index].maxQuantity = device.stockQuantity || 0;
    formData.items[index].quantity = 1;
  }
};

// 处理经办人变化
const handleOperatorChange = (userId) => {
  const user = userOptions.value.find((u) => u.id === userId);
  if (user) {
    formData.operatorName = user.realName || user.username;
  }
};

// 处理调出仓库变化
const handleFromWarehouseChange = (warehouseId) => {
  // 如果调入仓库与调出仓库相同，清空调入仓库
  if (formData.toWarehouseId === warehouseId) {
    formData.toWarehouseId = null;
    formData.toWarehouseName = '';
  }
};

// 处理调入仓库变化
const handleToWarehouseChange = (warehouseId) => {
  // 已在watch中处理
};

// 添加设备项
const handleAddItem = () => {
  if (!formData.fromWarehouseId) {
    ElMessage.warning('请先选择调出仓库');
    return;
  }

  if (!formData.items) {
    formData.items = [];
  }

  // 为新行初始化设备选项数组
  const newIndex = formData.items.length;
  deviceOptions.value[newIndex] = [];

  formData.items.push({
    deviceId: null,
    deviceName: '',
    deviceCode: '',
    specification: '',
    fromBinCode: '',
    toBinId: null,
    quantity: 1,
    maxQuantity: 9999,
    remark: '',
  });
};

// 移除设备项
const handleRemoveItem = (index) => {
  formData.items.splice(index, 1);
  deviceOptions.value.splice(index, 1);
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

  const capacityValidation = validateTargetWarehouseCapacity();
  if (!capacityValidation.valid) {
    ElMessage.error(capacityValidation.message);
    return;
  }

  // 检查货位预占冲突
  const conflicts = [];
  for (const item of formData.items) {
    if (item.fromBinId) {
      const lockInfo = inventoryLockManager.getBinReservation(item.fromBinId);
      if (lockInfo && lockInfo.status === 'ACTIVE' && lockInfo.orderId !== formData.orderNo) {
        conflicts.push({
          deviceName: item.deviceName,
          binCode: item.fromBinCode,
          orderId: lockInfo.orderId,
        });
      }
    }
  }

  if (conflicts.length > 0) {
    const conflictMsg = conflicts.map((c) => `${c.deviceName}(${c.binCode})`).join('、');
    await ElMessageBox.confirm(`以下设备货位已被其他订单预占：${conflictMsg}。是否继续提交？`, '货位预占警告', {
      confirmButtonText: '继续提交',
      cancelButtonText: '取消',
      type: 'warning',
    });
  }

  submitLoading.value = true;

  try {
    // 使用调拨服务创建调拨单
    const transferData = {
      ...formData,
      fromWarehouseName: warehouseOptions.value.find((w) => w.id === formData.fromWarehouseId)?.name || '',
      toWarehouseName: warehouseOptions.value.find((w) => w.id === formData.toWarehouseId)?.name || '',
    };

    const result = await transferService.createTransfer(transferData);

    if (result.success) {
      ElMessage.success('调拨单创建成功');
      emit('confirm', result.transfer);
    } else {
      ElMessage.error(result.message || '调拨单创建失败');
    }
  } catch (error) {
    logger.error('创建调拨单失败', error);
    ElMessage.error(error.message || '调拨单创建失败');
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.transfer-order-dialog {
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
