<!--
  @file: InboundDeviceForm.vue
  @description: 入库设备录入表单 - 支持批量和单个两种模式
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 1.0
  @features:
    - 批量入库模式：同类型设备批量录入
    - 单个录入模式：详细设备信息录入
    - 设备图片上传
    - 仓库-区域-货位级联选择
    - 自动生成设备编号预览
-->
<template>
  <div class="inbound-device-form">
    <!-- 模式切换 -->
    <div class="mode-switch">
      <el-radio-group v-model="currentMode" size="large" data-cy="inbound-device-mode-group">
        <el-radio-button label="batch" data-cy="inbound-device-batch-btn">
          <el-icon><Box /></el-icon>
          批量入库
          <el-tooltip content="适用于同型号设备批量采购" placement="top">
            <el-icon class="mode-tip"><QuestionFilled /></el-icon>
          </el-tooltip>
        </el-radio-button>
        <el-radio-button label="single" data-cy="inbound-device-single-btn">
          <el-icon><Cpu /></el-icon>
          单个录入
          <el-tooltip content="适用于高价值设备详细录入" placement="top">
            <el-icon class="mode-tip"><QuestionFilled /></el-icon>
          </el-tooltip>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 批量入库模式 -->
    <div v-if="currentMode === 'batch'" class="batch-mode">
      <el-card class="device-input-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>设备信息录入</span>
            <el-tag type="info" size="small">批量模式</el-tag>
          </div>
        </template>

        <el-form :model="batchForm" label-width="100px" class="batch-form" data-cy="inbound-device-batch-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备类型" required>
                <el-select v-model="batchForm.deviceType" placeholder="请选择设备类型" style="width: 100%" filterable data-cy="inbound-device-batch-form.device-type-select">
                  <el-option
                    v-for="type in deviceTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  >
                    <el-icon v-if="type.icon"><component :is="type.icon" /></el-icon>
                    {{ type.label }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备名称" required>
                <el-input v-model="batchForm.deviceName" placeholder="请输入设备名称" data-cy="inbound-device-batch-form.device-name-input" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品牌/厂商">
                <el-input v-model="batchForm.brand" placeholder="请输入品牌或厂商" data-cy="inbound-device-batch-form.brand-input" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规格型号" required>
                <el-input v-model="batchForm.model" placeholder="请输入规格型号" data-cy="inbound-device-batch-form.model-input" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="入库数量" required>
                <el-input-number
                  v-model="batchForm.quantity"
                  :min="1"
                  :max="9999"
                  style="width: 100%"
                  controls-position="right"
                  data-cy="inbound-device-batch-form.quantity-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位" required>
                <el-select v-model="batchForm.unit" placeholder="请选择单位" style="width: 100%" data-cy="inbound-device-batch-form.unit-select">
                  <el-option label="个" value="个" />
                  <el-option label="台" value="台" />
                  <el-option label="套" value="套" />
                  <el-option label="件" value="件" />
                  <el-option label="箱" value="箱" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="单价(元)" required>
                <el-input-number
                  v-model="batchForm.unitPrice"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                  controls-position="right"
                  data-cy="inbound-device-batch-form.unit-price-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="小计">
                <span class="subtotal-text">¥ {{ batchSubtotal.toFixed(2) }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 存放位置 -->
          <el-form-item label="存放位置" required>
            <div class="location-select">
              <el-select
                v-model="batchForm.warehouseId"
                placeholder="选择仓库"
                style="width: 160px"
                @change="handleWarehouseChange"
               data-cy="inbound-device-batch-form.warehouse-id-select">
                <el-option v-for="wh in warehouseList" :key="wh.id" :label="wh.name" :value="wh.id" />
              </el-select>
              <el-select
                v-model="batchForm.zoneId"
                placeholder="选择区域"
                style="width: 160px"
                :disabled="!batchForm.warehouseId"
                @change="handleZoneChange"
               data-cy="inbound-device-batch-form.zone-id-select">
                <el-option v-for="zone in availableZones" :key="zone.id" :label="zone.name" :value="zone.id" />
              </el-select>
              <el-select
                v-model="batchForm.binId"
                placeholder="选择货位"
                style="width: 160px"
                :disabled="!batchForm.zoneId"
               data-cy="inbound-device-batch-form.bin-id-select">
                <el-option v-for="bin in availableBins" :key="bin.id" :label="bin.code" :value="bin.id" />
              </el-select>
            </div>
          </el-form-item>

          <!-- 设备图片上传 -->
          <el-form-item label="设备图片">
            <el-upload
              v-model:file-list="batchForm.images"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :limit="5"
              class="device-image-upload"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="upload-tip">支持上传设备照片，最多5张</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <el-button type="primary" :icon="Plus" @click="handleAddBatchDevice" data-cy="inbound-add-batch-btn"> 添加到清单 </el-button>
          <el-button @click="resetBatchForm" data-cy="inbound-reset-batch-btn">重置</el-button>
        </div>
      </el-card>

      <!-- 已添加设备清单 -->
      <el-card v-if="deviceList.length > 0" class="device-list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>已添加设备清单</span>
            <el-tag type="success">{{ deviceList.length }} 种设备</el-tag>
            <el-tag v-if="deviceList.length > 50" type="warning" size="small" style="margin-left: 8px">
              大量数据，已启用虚拟滚动
            </el-tag>
          </div>
        </template>

        <el-scrollbar :max-height="400" always>
          <el-table
            :data="deviceList"
            border
            size="small"
            :max-height="deviceList.length > 50 ? 380 : undefined"
            data-cy="inbound-device-list-table"
            v-el-table-infinite-scroll="handleLoadMore"
            :infinite-scroll-disabled="deviceList.length <= 50"
            :infinite-scroll-distance="50"
          >
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column label="设备类型" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ getDeviceTypeLabel(row.deviceType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="设备名称" min-width="150" prop="deviceName" />
            <el-table-column label="规格型号" width="120" prop="model" />
            <el-table-column label="数量" width="80" align="center" prop="quantity" />
            <el-table-column label="单价" width="100" align="right">
              <template #default="{ row }"> ¥{{ row.unitPrice.toFixed(2) }} </template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="right">
              <template #default="{ row }"> ¥{{ (row.quantity * row.unitPrice).toFixed(2) }} </template>
            </el-table-column>
            <el-table-column label="存放位置" min-width="150">
              <template #default="{ row }">
                {{ getLocationText(row) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link :icon="Delete" @click="handleRemoveDevice($index)" data-cy="inbound-batch-remove-btn" />
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>

        <div class="list-summary">
          <div class="summary-item">
            <span
              >设备种类: <strong>{{ deviceList.length }}</strong> 种</span
            >
          </div>
          <div class="summary-item">
            <span
              >总数量: <strong>{{ totalQuantity }}</strong> 件</span
            >
          </div>
          <div class="summary-item">
            <span
              >总金额: <strong class="total-amount">¥{{ totalAmount.toFixed(2) }}</strong></span
            >
          </div>
        </div>
      </el-card>
    </div>

    <!-- 单个录入模式 -->
    <div v-else class="single-mode">
      <el-card class="device-input-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>设备详细信息录入</span>
            <el-tag type="warning" size="small">单个模式</el-tag>
          </div>
        </template>

        <el-form :model="singleForm" label-width="120px" class="single-form" data-cy="inbound-device-single-form">
          <!-- 设备编号预览 -->
          <el-form-item label="设备编号">
            <el-input v-model="previewDeviceCode" disabled class="code-preview" data-cy="inbound-device-preview-code-input">
              <template #prefix>
                <el-icon><Ticket /></el-icon>
              </template>
              <template #append>
                <el-tooltip content="系统自动生成，提交后生效" placement="top">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备类型" required>
                <el-select v-model="singleForm.deviceType" placeholder="请选择设备类型" style="width: 100%" filterable data-cy="inbound-device-single-form.device-type-select">
                  <el-option
                    v-for="type in deviceTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备名称" required>
                <el-input v-model="singleForm.deviceName" placeholder="请输入设备名称" data-cy="inbound-device-single-form.device-name-input" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品牌/厂商">
                <el-input v-model="singleForm.brand" placeholder="请输入品牌或厂商" data-cy="inbound-device-single-form.brand-input" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规格型号" required>
                <el-input v-model="singleForm.model" placeholder="请输入规格型号" data-cy="inbound-device-single-form.model-input" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="序列号">
                <el-input v-model="singleForm.serialNumber" placeholder="请输入或扫描序列号" data-cy="inbound-device-single-form.serial-number-input">
                  <template #append>
                    <el-button :icon="FullScreen" title="扫码输入" data-cy="inbound-scan-btn" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产日期">
                <el-date-picker
                  v-model="singleForm.productionDate"
                  type="date"
                  placeholder="选择生产日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="单价(元)">
                <el-input-number
                  v-model="singleForm.unitPrice"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                  controls-position="right"
                  data-cy="inbound-device-single-form.unit-price-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="质保期限(月)">
                <el-input-number
                  v-model="singleForm.warrantyMonths"
                  :min="0"
                  :max="120"
                  style="width: 100%"
                  controls-position="right"
                  data-cy="inbound-device-single-form.warranty-months-input"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 存放位置 -->
          <el-form-item label="存放位置" required>
            <div class="location-select">
              <el-select
                v-model="singleForm.warehouseId"
                placeholder="选择仓库"
                style="width: 160px"
                @change="handleSingleWarehouseChange"
               data-cy="inbound-device-single-form.warehouse-id-select">
                <el-option v-for="wh in warehouseList" :key="wh.id" :label="wh.name" :value="wh.id" />
              </el-select>
              <el-select
                v-model="singleForm.zoneId"
                placeholder="选择区域"
                style="width: 160px"
                :disabled="!singleForm.warehouseId"
                @change="handleSingleZoneChange"
               data-cy="inbound-device-single-form.zone-id-select">
                <el-option v-for="zone in singleAvailableZones" :key="zone.id" :label="zone.name" :value="zone.id" />
              </el-select>
              <el-select
                v-model="singleForm.binId"
                placeholder="选择货位"
                style="width: 160px"
                :disabled="!singleForm.zoneId"
               data-cy="inbound-device-single-form.bin-id-select">
                <el-option v-for="bin in singleAvailableBins" :key="bin.id" :label="bin.code" :value="bin.id" />
              </el-select>
            </div>
          </el-form-item>

          <!-- 设备图片上传 -->
          <el-form-item label="设备图片">
            <el-upload
              v-model:file-list="singleForm.images"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :limit="5"
              class="device-image-upload"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="upload-tip">上传设备实物照片、序列号照片等，最多5张</div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="singleForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" data-cy="inbound-device-single-form.remark-input" />
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <el-button type="primary" :icon="Plus" @click="handleAddSingleDevice" data-cy="inbound-add-single-btn"> 添加到清单 </el-button>
          <el-button @click="resetSingleForm" data-cy="inbound-reset-single-btn">重置</el-button>
        </div>
      </el-card>

      <!-- 已添加设备清单 -->
      <el-card v-if="deviceList.length > 0" class="device-list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>已添加设备清单</span>
            <el-tag type="success">{{ deviceList.length }} 台设备</el-tag>
          </div>
        </template>

        <el-table :data="deviceList" border size="small" data-cy="inbound-device-list-table">
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="设备编号" width="150" prop="previewCode" />
          <el-table-column label="设备名称" min-width="150" prop="deviceName" />
          <el-table-column label="规格型号" width="120" prop="model" />
          <el-table-column label="序列号" width="150" prop="serialNumber" />
          <el-table-column label="单价" width="100" align="right">
            <template #default="{ row }"> ¥{{ row.unitPrice?.toFixed(2) || '0.00' }} </template>
          </el-table-column>
          <el-table-column label="存放位置" min-width="150">
            <template #default="{ row }">
              {{ getLocationText(row) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link :icon="Delete" @click="handleRemoveDevice($index)" data-cy="inbound-single-remove-btn" />
            </template>
          </el-table-column>
        </el-table>

        <div class="list-summary">
          <div class="summary-item">
            <span
              >设备数量: <strong>{{ deviceList.length }}</strong> 台</span
            >
          </div>
          <div class="summary-item">
            <span
              >总金额: <strong class="total-amount">¥{{ totalAmount.toFixed(2) }}</strong></span
            >
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="600px" data-cy="inbound-device-preview-dialog">
      <img :src="previewImageUrl" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { Box, Cpu, Delete, FullScreen, InfoFilled, Plus, QuestionFilled, Ticket } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('InboundDeviceForm');

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      mode: 'batch',
      batchList: [],
      singleList: [],
    }),
  },
  warehouseList: {
    type: Array,
    default: () => [],
  },
  zoneList: {
    type: Array,
    default: () => [],
  },
  binList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

// 当前模式 - 从modelValue同步
const currentMode = computed({
  get: () => props.modelValue.mode || 'batch',
  set: (val) => {
    emit('update:modelValue', {
      ...props.modelValue,
      mode: val,
    });
  },
});

// 批量设备列表
const batchList = computed({
  get: () => props.modelValue.batchList || [],
  set: (val) => {
    emit('update:modelValue', {
      ...props.modelValue,
      batchList: val,
    });
  },
});

// 单个设备列表
const singleList = computed({
  get: () => props.modelValue.singleList || [],
  set: (val) => {
    emit('update:modelValue', {
      ...props.modelValue,
      singleList: val,
    });
  },
});

// 当前模式下的设备清单（用于显示）
const deviceList = computed(() => {
  return currentMode.value === 'batch' ? batchList.value : singleList.value;
});

// 设备类型选项
const deviceTypeOptions = [
  { value: 'server', label: '服务器', icon: 'Cpu' },
  { value: 'network', label: '网络设备', icon: 'Connection' },
  { value: 'storage', label: '存储设备', icon: 'Folder' },
  { value: 'terminal', label: '终端设备', icon: 'Monitor' },
  { value: 'security', label: '安全设备', icon: 'Lock' },
  { value: 'other', label: '其他设备', icon: 'MoreFilled' },
];

// 批量模式表单
const batchForm = ref({
  deviceType: '',
  deviceName: '',
  brand: '',
  model: '',
  quantity: 1,
  unit: '台',
  unitPrice: 0,
  warehouseId: null,
  zoneId: null,
  binId: null,
  images: [],
});

// 单个模式表单
const singleForm = ref({
  deviceType: '',
  deviceName: '',
  brand: '',
  model: '',
  serialNumber: '',
  productionDate: '',
  unitPrice: 0,
  warrantyMonths: 12,
  warehouseId: null,
  zoneId: null,
  binId: null,
  images: [],
  remark: '',
});

// 可用区域和货位
const availableZones = ref([]);
const availableBins = ref([]);
const singleAvailableZones = ref([]);
const singleAvailableBins = ref([]);

// 图片预览
const previewVisible = ref(false);
const previewImageUrl = ref('');

// 设备编号计数器（用于预览）
let deviceCodeCounter = 1;

// 批量模式小计
const batchSubtotal = computed(() => {
  return (batchForm.value.quantity || 0) * (batchForm.value.unitPrice || 0);
});

// 预览设备编号
const previewDeviceCode = computed(() => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(deviceCodeCounter).padStart(3, '0');
  return `DEV-${date}-${seq}`;
});

// 总数量
const totalQuantity = computed(() => {
  return deviceList.value.reduce((sum, item) => sum + (item.quantity || 1), 0);
});

// 总金额
const totalAmount = computed(() => {
  return deviceList.value.reduce((sum, item) => {
    const qty = item.quantity || 1;
    const price = item.unitPrice || 0;
    return sum + qty * price;
  }, 0);
});

// 获取设备类型标签
const getDeviceTypeLabel = (type) => {
  const option = deviceTypeOptions.find((opt) => opt.value === type);
  return option?.label || type;
};

// 获取位置文本
const getLocationText = (row) => {
  const warehouse = props.warehouseList.find((w) => w.id === row.warehouseId);
  const zone = props.zoneList.find((z) => z.id === row.zoneId);
  const bin = props.binList.find((b) => b.id === row.binId);

  const parts = [];
  if (warehouse) {
    parts.push(warehouse.name);
  }
  if (zone) {
    parts.push(zone.name);
  }
  if (bin) {
    parts.push(bin.code);
  }

  return parts.join(' / ') || '未指定';
};

// 仓库变化处理 - 批量模式
const handleWarehouseChange = (warehouseId) => {
  batchForm.value.zoneId = null;
  batchForm.value.binId = null;
  availableZones.value = props.zoneList.filter((z) => z.warehouseId === warehouseId);
  availableBins.value = [];
};

// 区域变化处理 - 批量模式
const handleZoneChange = (zoneId) => {
  batchForm.value.binId = null;
  availableBins.value = props.binList.filter((b) => b.zoneId === zoneId);
};

// 仓库变化处理 - 单个模式
const handleSingleWarehouseChange = (warehouseId) => {
  singleForm.value.zoneId = null;
  singleForm.value.binId = null;
  singleAvailableZones.value = props.zoneList.filter((z) => z.warehouseId === warehouseId);
  singleAvailableBins.value = [];
};

// 区域变化处理 - 单个模式
const handleSingleZoneChange = (zoneId) => {
  singleForm.value.binId = null;
  singleAvailableBins.value = props.binList.filter((b) => b.zoneId === zoneId);
};

// 图片预览
const handlePictureCardPreview = (file) => {
  previewImageUrl.value = file.url;
  previewVisible.value = true;
};

// 图片移除
const handleRemove = () => {
  // 图片移除逻辑
};

// 添加批量设备
const handleAddBatchDevice = () => {
  // 验证必填项
  if (!batchForm.value.deviceType) {
    ElMessage.warning('请选择设备类型');
    return;
  }
  if (!batchForm.value.deviceName) {
    ElMessage.warning('请输入设备名称');
    return;
  }
  if (!batchForm.value.model) {
    ElMessage.warning('请输入规格型号');
    return;
  }
  if (!batchForm.value.warehouseId) {
    ElMessage.warning('请选择存放仓库');
    return;
  }

  const newDevice = {
    ...batchForm.value,
    id: Date.now(),
    deviceTypeId: batchForm.value.deviceType,
    deviceTypeName: getDeviceTypeLabel(batchForm.value.deviceType),
    deviceCodePrefix: `DEV-${batchForm.value.deviceType.toUpperCase()}-${Date.now().toString().slice(-6)}`,
  };

  batchList.value = [...batchList.value, newDevice];
  ElMessage.success('设备已添加到清单');
  resetBatchForm();
};

// 添加单个设备
const handleAddSingleDevice = () => {
  // 验证必填项
  if (!singleForm.value.deviceType) {
    ElMessage.warning('请选择设备类型');
    return;
  }
  if (!singleForm.value.deviceName) {
    ElMessage.warning('请输入设备名称');
    return;
  }
  if (!singleForm.value.model) {
    ElMessage.warning('请输入规格型号');
    return;
  }
  if (!singleForm.value.warehouseId) {
    ElMessage.warning('请选择存放仓库');
    return;
  }

  const newDevice = {
    ...singleForm.value,
    id: Date.now(),
    deviceTypeId: singleForm.value.deviceType,
    deviceTypeName: getDeviceTypeLabel(singleForm.value.deviceType),
    deviceCode: previewDeviceCode.value,
    quantity: 1,
  };
  singleList.value = [...singleList.value, newDevice];
  deviceCodeCounter++;
  ElMessage.success('设备已添加到清单');
  resetSingleForm();
};

// 移除设备
const handleRemoveDevice = (index) => {
  if (currentMode.value === 'batch') {
    const newList = [...batchList.value];
    newList.splice(index, 1);
    batchList.value = newList;
  } else {
    const newList = [...singleList.value];
    newList.splice(index, 1);
    singleList.value = newList;
  }
  ElMessage.success('设备已从清单移除');
};

// 虚拟滚动加载更多（用于大量数据场景）
const handleLoadMore = () => {
  // 当数据量超过50条时，可以在这里实现分页加载逻辑
  logger.info('触发虚拟滚动加载更多');
};

// 重置批量表单
const resetBatchForm = () => {
  batchForm.value = {
    deviceType: '',
    deviceName: '',
    brand: '',
    model: '',
    quantity: 1,
    unit: '台',
    unitPrice: 0,
    warehouseId: null,
    zoneId: null,
    binId: null,
    images: [],
  };
  availableZones.value = [];
  availableBins.value = [];
};

// 重置单个表单
const resetSingleForm = () => {
  singleForm.value = {
    deviceType: '',
    deviceName: '',
    brand: '',
    model: '',
    serialNumber: '',
    productionDate: '',
    unitPrice: 0,
    warrantyMonths: 12,
    warehouseId: null,
    zoneId: null,
    binId: null,
    images: [],
    remark: '',
  };
  singleAvailableZones.value = [];
  singleAvailableBins.value = [];
};

// 验证方法
const validate = () => {
  if (currentMode.value === 'batch') {
    if (batchList.value.length === 0) {
      ElMessage.warning('请至少添加一个设备');
      return false;
    }
    // 验证每个批量设备项
    for (const item of batchList.value) {
      if (!item.deviceTypeId || !item.quantity || item.quantity <= 0) {
        ElMessage.warning('请完善所有设备的类型和数量信息');
        return false;
      }
    }
  } else {
    if (singleList.value.length === 0) {
      ElMessage.warning('请至少添加一个设备');
      return false;
    }
    // 验证每个单个设备项
    for (const item of singleList.value) {
      if (!item.deviceTypeId || !item.deviceCode) {
        ElMessage.warning('请完善所有设备的类型和编号信息');
        return false;
      }
    }
  }
  return true;
};

// 暴露方法
defineExpose({
  validate,
});

// 监听模式切换，重置表单
watch(
  () => props.modelValue.mode,
  () => {
    resetBatchForm();
    resetSingleForm();
  }
);
</script>

<style scoped>
.inbound-device-form {
  padding: 20px;
}

.mode-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.mode-tip {
  margin-left: 4px;
  font-size: 14px;
  color: #909399;
}

.device-input-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-form,
.single-form {
  padding: 10px 0;
}

.subtotal-text {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.location-select {
  display: flex;
  gap: 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.device-image-upload {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
  }
  :deep(.el-upload-list__item) {
    width: 100px;
    height: 100px;
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.code-preview {
  :deep(.el-input__wrapper) {
    background-color: #f5f7fa;
  }
}

.device-list-card {
  margin-top: 20px;
}

.list-summary {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 16px;
}

.summary-item {
  font-size: 14px;
  color: #606266;
}

.summary-item strong {
  color: #303133;
  font-size: 16px;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
}
</style>
