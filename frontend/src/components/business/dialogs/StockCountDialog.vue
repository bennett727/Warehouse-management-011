<!--
  @file: StockCountDialog.vue
  @description: 新建/编辑库存盘点单对话框 - 统一设计规范
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
    class="stock-count-dialog"
    data-cy="stock-count-dialog"
  >
    <div class="dialog-container">
      <!-- 上半部分：盘点单基本信息区域 -->
      <div class="order-info-section">
        <div class="section-header">
          <el-icon><Document /></el-icon>
          <span>盘点单基本信息</span>
        </div>

        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="order-form" data-cy="stock-count-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="盘点单号" prop="orderNo" data-cy="stock-count-order-no-form-item">
                <el-input v-model="formData.orderNo" placeholder="系统自动生成" disabled data-cy="stock-count-order-no-input" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="盘点日期" prop="countDate" data-cy="stock-count-date-form-item">
                <el-date-picker
                  v-model="formData.countDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  data-cy="stock-count-date-picker"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="盘点类型" prop="countType" data-cy="stock-count-type-form-item">
                <el-select v-model="formData.countType" placeholder="请选择盘点类型" style="width: 100%" data-cy="stock-count-type-select">
                  <el-option label="全盘" :value="0" data-cy="stock-count-type-full" />
                  <el-option label="抽盘" :value="1" data-cy="stock-count-type-random" />
                  <el-option label="循环盘点" :value="2" data-cy="stock-count-type-cycle" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="盘点仓库" prop="warehouseId" data-cy="stock-count-warehouse-form-item">
                <el-select
                  v-model="formData.warehouseId"
                  placeholder="请选择盘点仓库"
                  filterable
                  style="width: 100%"
                  @change="handleWarehouseChange"
                  data-cy="stock-count-warehouse-select"
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
              <el-form-item label="盘点区域" prop="areaId" data-cy="stock-count-area-form-item">
                <el-select
                  v-model="formData.areaId"
                  placeholder="请选择盘点区域"
                  filterable
                  clearable
                  style="width: 100%"
                  :disabled="!formData.warehouseId"
                  data-cy="stock-count-area-select"
                >
                  <el-option v-for="area in areaOptions" :key="area.id" :label="area.name" :value="area.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="负责人" prop="operatorName" data-cy="stock-count-operator-form-item">
                <el-select
                  v-model="formData.operatorId"
                  placeholder="请选择负责人"
                  filterable
                  style="width: 100%"
                  @change="handleOperatorChange"
                  data-cy="stock-count-operator-select"
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

          <el-form-item label="备注" prop="remark" data-cy="stock-count-remark-form-item">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
              data-cy="stock-count-remark-input"
            />
          </el-form-item>
        </el-form>
      </div>

      <el-divider class="section-divider" />

      <!-- 下半部分：盘点设备区域 -->
      <div class="device-selection-section">
        <div class="section-header">
          <el-icon><Box /></el-icon>
          <span>盘点设备</span>
          <el-tag type="info" class="selected-count">共 {{ formData.items?.length || 0 }} 项</el-tag>
        </div>

        <!-- 操作工具栏 -->
        <div class="device-toolbar">
          <el-button type="primary" :icon="Plus" @click="handleAddItem" :disabled="!formData.warehouseId" data-cy="stock-count-add-item-btn">
            添加设备
          </el-button>
          <el-button
            type="success"
            :icon="Refresh"
            @click="handleAutoLoad"
            :disabled="!formData.warehouseId"
            :loading="autoLoadLoading"
            data-cy="stock-count-auto-load-btn"
          >
            自动加载库存
          </el-button>
          <el-alert
            v-if="!formData.warehouseId"
            title="请先选择盘点仓库"
            type="warning"
            :closable="false"
            style="flex: 1; margin-left: 12px"
          />
          <template v-else>
            <span class="toolbar-spacer"></span>
            <span class="total-info">
              账面总数: <strong>{{ totalBookQuantity }}</strong> | <strong>{{ totalActualQuantity }}</strong> | 差异:
              <strong :class="diffQuantity > 0 ? 'positive' : diffQuantity < 0 ? 'negative' : ''"
                >{{ diffQuantity > 0 ? '+' : '' }}{{ diffQuantity }}</strong
              >
            </span>
          </template>
        </div>

        <!-- 盘点明细表格 -->
        <el-table
          :data="formData.items"
          border
          size="small"
          height="300px"
          class="device-table"
          empty-text="请选择盘点仓库后添加设备"
          :row-class-name="getRowClassName"
          data-cy="stock-count-device-table"
        >
          <el-table-column type="index" label="序号" width="50" align="center" data-cy="stock-count-device-table-index-column" />
          <el-table-column label="设备" min-width="180" data-cy="stock-count-device-table-device-column">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.deviceId"
                placeholder="搜索选择设备"
                filterable
                remote
                :remote-method="(query) => searchDevices(query, $index)"
                :loading="deviceSearchLoading"
                style="width: 100%"
                @change="(val) => handleDeviceChange(val, $index)"
                :data-cy="`stock-count-device-select-${$index}`"
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
          <el-table-column label="规格型号" width="120" data-cy="stock-count-device-table-spec-column">
            <template #default="{ row }">
              {{ row.specification || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="货位" width="120" data-cy="stock-count-device-table-bin-column">
            <template #default="{ row }">
              {{ row.binCode || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="账面数量" width="100" align="right" data-cy="stock-count-device-table-book-quantity-column">
            <template #default="{ row }">
              <strong>{{ row.bookQuantity || 0 }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="实盘数量" width="120" data-cy="stock-count-device-table-actual-quantity-column">
            <template #default="{ row, $index }">
              <el-input-number
                v-model="row.actualQuantity"
                :min="0"
                :max="9999"
                style="width: 100%"
                @change="handleActualQuantityChange(row)"
                :data-cy="`stock-count-actual-quantity-input-${$index}`"
              />
            </template>
          </el-table-column>
          <el-table-column label="差异数量" width="100" align="right" data-cy="stock-count-device-table-diff-quantity-column">
            <template #default="{ row }">
              <span :class="getDiffClass(row)">
                <strong>{{ formatDiff(row.diffQuantity) }}</strong>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="差异原因" min-width="120" data-cy="stock-count-device-table-diff-reason-column">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.diffReason"
                placeholder="选择原因"
                size="small"
                style="width: 100%"
                :disabled="!row.diffQuantity"
                :data-cy="`stock-count-diff-reason-select-${$index}`"
              >
                <el-option label="正常损耗" value="normal_loss" data-cy="stock-count-diff-reason-normal-loss" />
                <el-option label="盘点错误" value="count_error" data-cy="stock-count-diff-reason-count-error" />
                <el-option label="入库未登记" value="inbound_missing" data-cy="stock-count-diff-reason-inbound-missing" />
                <el-option label="出库未登记" value="outbound_missing" data-cy="stock-count-diff-reason-outbound-missing" />
                <el-option label="损坏报废" value="damaged" data-cy="stock-count-diff-reason-damaged" />
                <el-option label="其他" value="other" data-cy="stock-count-diff-reason-other" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="100" data-cy="stock-count-device-table-remark-column">
            <template #default="{ row, $index }">
              <el-input v-model="row.remark" placeholder="备注" size="small" :data-cy="`stock-count-remark-input-${$index}`" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" fixed="right" data-cy="stock-count-device-table-action-column">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="handleRemoveItem($index)" :data-cy="`stock-count-remove-item-btn-${$index}`">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer" data-cy="stock-count-footer">
        <el-button @click="dialogVisible = false" data-cy="stock-count-cancel-btn">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit" data-cy="stock-count-submit-btn"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Box, Document, Plus, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref, watch } from 'vue';

import { getDeviceList } from '@/api/device/device';
import { getAreaList } from '@/api/inventory/area';
import { generateStockCountNo, getStockList } from '@/api/inventory/stock';
import { getWarehouseList } from '@/api/inventory/warehouse';
import { getUserList } from '@/api/system/user';
import { createLogger } from '@/utils/logger';

const logger = createLogger('StockCountDialog');

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
  return props.mode === 'create' ? '新建盘点单' : '编辑盘点单';
});

// 表单引用
const formRef = ref(null);

// 表单数据
const formData = reactive({
  orderNo: '',
  countDate: new Date().toISOString().split('T')[0],
  countType: 0,
  warehouseId: null,
  warehouseName: '',
  areaId: null,
  areaName: '',
  operatorId: null,
  operatorName: '',
  remark: '',
  items: [],
});

// 表单验证规则
const formRules = {
  countDate: [{ required: true, message: '请选择盘点日期', trigger: 'change' }],
  countType: [{ required: true, message: '请选择盘点类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择盘点仓库', trigger: 'change' }],
  operatorId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
};

// 选项数据
const deviceSearchLoading = ref(false);
const deviceOptions = ref([]);
const warehouseOptions = ref([]);
const areaOptions = ref([]);
const userOptions = ref([]);
const submitLoading = ref(false);
const autoLoadLoading = ref(false);

// 计算属性
const totalBookQuantity = computed(() => {
  return formData.items?.reduce((sum, item) => sum + (item.bookQuantity || 0), 0) || 0;
});

const totalActualQuantity = computed(() => {
  return formData.items?.reduce((sum, item) => sum + (item.actualQuantity || 0), 0) || 0;
});

const diffQuantity = computed(() => {
  return totalActualQuantity.value - totalBookQuantity.value;
});

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

// 监听仓库变化
watch(
  () => formData.warehouseId,
  (val) => {
    if (val) {
      const warehouse = warehouseOptions.value.find((w) => w.id === val);
      formData.warehouseName = warehouse?.name || '';
      loadAreaOptions(val);
      // 清空已选设备
      formData.items = [];
    }
  }
);

// 监听区域变化
watch(
  () => formData.areaId,
  (val) => {
    if (val) {
      const area = areaOptions.value.find((a) => a.id === val);
      formData.areaName = area?.name || '';
    }
  }
);

// 初始化表单
const initForm = async () => {
  if (props.mode === 'create') {
    formData.orderNo = await generateStockCountNo();
    formData.countDate = new Date().toISOString().split('T')[0];
    formData.countType = 0;
    formData.warehouseId = null;
    formData.warehouseName = '';
    formData.areaId = null;
    formData.areaName = '';
    formData.operatorId = null;
    formData.operatorName = '';
    formData.remark = '';
    formData.items = [];
  } else if (props.initialData) {
    Object.assign(formData, props.initialData);
    formData.items = props.initialData.items || [];
    // 计算差异
    formData.items.forEach((item) => {
      item.diffQuantity = (item.actualQuantity || 0) - (item.bookQuantity || 0);
    });
  }
};

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    const res = await getWarehouseList({ pageSize: 1000 });
    warehouseOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载仓库列表失败', error);
  }
};

// 加载区域列表
const loadAreaOptions = async (warehouseId) => {
  try {
    const res = await getAreaList({ warehouseId, pageSize: 1000 });
    areaOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载区域列表失败', error);
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
const searchDevices = async (query, index) => {
  if (!query || !formData.warehouseId) {
    deviceOptions.value[index] = [];
    return;
  }

  deviceSearchLoading.value = true;
  try {
    const res = await getDeviceList({
      keyword: query,
      warehouseId: formData.warehouseId,
      areaId: formData.areaId,
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
    formData.items[index].binCode = device.binCode || '';
    formData.items[index].bookQuantity = device.stockQuantity || 0;
    formData.items[index].actualQuantity = device.stockQuantity || 0;
    formData.items[index].diffQuantity = 0;
  }
};

// 处理实盘数量变化
const handleActualQuantityChange = (row) => {
  row.diffQuantity = (row.actualQuantity || 0) - (row.bookQuantity || 0);
};

// 处理经办人变化
const handleOperatorChange = (userId) => {
  const user = userOptions.value.find((u) => u.id === userId);
  if (user) {
    formData.operatorName = user.realName || user.username;
  }
};

// 处理仓库变化
const handleWarehouseChange = () => {
  // 已在watch中处理
};

// 添加设备项
const handleAddItem = () => {
  if (!formData.warehouseId) {
    ElMessage.warning('请先选择盘点仓库');
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
    binCode: '',
    bookQuantity: 0,
    actualQuantity: 0,
    diffQuantity: 0,
    diffReason: '',
    remark: '',
  });
};

// 移除设备项
const handleRemoveItem = (index) => {
  formData.items.splice(index, 1);
  deviceOptions.value.splice(index, 1);
};

// 自动加载库存
const handleAutoLoad = async () => {
  if (!formData.warehouseId) {
    ElMessage.warning('请先选择盘点仓库');
    return;
  }

  autoLoadLoading.value = true;
  try {
    const res = await getStockList({
      warehouseId: formData.warehouseId,
      areaId: formData.areaId,
      pageSize: 1000,
    });

    const stockList = res.data?.list || [];

    if (stockList.length === 0) {
      ElMessage.info('该仓库暂无库存数据');
      return;
    }

    // 清空现有数据
    formData.items = [];
    deviceOptions.value = [];

    // 加载库存数据
    stockList.forEach((stock, index) => {
      deviceOptions.value[index] = [stock.device];
      formData.items.push({
        deviceId: stock.deviceId,
        deviceName: stock.device?.deviceName || '',
        deviceCode: stock.device?.deviceCode || '',
        specification: stock.device?.specification || '',
        binCode: stock.bin?.code || '',
        bookQuantity: stock.quantity || 0,
        actualQuantity: stock.quantity || 0,
        diffQuantity: 0,
        diffReason: '',
        remark: '',
      });
    });

    ElMessage.success(`已加载 ${stockList.length} 条库存数据`);
  } catch (error) {
    logger.error('自动加载库存失败', error);
    ElMessage.error('加载库存数据失败');
  } finally {
    autoLoadLoading.value = false;
  }
};

// 获取行样式
const getRowClassName = ({ row }) => {
  if (row.diffQuantity !== 0) {
    return 'has-diff';
  }
  return '';
};

// 获取差异样式类
const getDiffClass = (row) => {
  if (row.diffQuantity > 0) {
    return 'positive';
  }
  if (row.diffQuantity < 0) {
    return 'negative';
  }
  return '';
};

// 格式化差异
const formatDiff = (diff) => {
  if (diff === undefined || diff === null) {
    return '0';
  }
  return diff > 0 ? `+${diff}` : `${diff}`;
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
.stock-count-dialog {
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

        &.positive {
          color: #67c23a;
        }

        &.negative {
          color: #f56c6c;
        }
      }
    }
  }

  .device-table {
    margin-bottom: 16px;

    :deep(.has-diff) {
      background-color: #fdf6ec;
    }

    .positive {
      color: #67c23a;
    }

    .negative {
      color: #f56c6c;
    }
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
