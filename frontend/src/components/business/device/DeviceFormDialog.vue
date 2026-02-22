<!--
  @file: DeviceFormDialog.vue
  @description: 设备表单对话框组件，用于新增和编辑设备信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0 - 使用统一字段常量
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    data-cy="device-form-dialog"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="device-form">
      <!-- 第一行：设备编号 + 设备名称 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.deviceCode" prop="deviceCode">
            <el-input
              v-model="formData.deviceCode"
              :placeholder="FIELD_PLACEHOLDERS.deviceCode"
              :disabled="mode === 'edit'"
              maxlength="30"
              show-word-limit
              data-cy="device-code-input"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.deviceName" prop="deviceName">
            <el-input
              v-model="formData.deviceName"
              :placeholder="FIELD_PLACEHOLDERS.deviceName"
              maxlength="100"
              show-word-limit
              data-cy="device-name-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行：设备类型 + 规格型号 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.deviceTypeId" prop="deviceTypeId">
            <el-select
              v-model="formData.deviceTypeId"
              :placeholder="FIELD_PLACEHOLDERS.deviceTypeId"
              style="width: 100%"
              data-cy="device-type-select"
            >
              <el-option
                v-for="type in deviceTypes"
                :key="type.id"
                :label="type.typeName || type.name"
                :value="type.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.deviceModel" prop="deviceModel">
            <el-input
              v-model="formData.deviceModel"
              :placeholder="FIELD_PLACEHOLDERS.deviceModel"
              maxlength="50"
              show-word-limit
              data-cy="device-model-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行：设备序列号 + 制造商 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.serialNumber" prop="serialNumber">
            <el-input
              v-model="formData.serialNumber"
              :placeholder="FIELD_PLACEHOLDERS.serialNumber"
              maxlength="50"
              show-word-limit
              data-cy="device-serial-number-input"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.manufacturer" prop="manufacturer">
            <el-input
              v-model="formData.manufacturer"
              :placeholder="FIELD_PLACEHOLDERS.manufacturer"
              maxlength="100"
              show-word-limit
              data-cy="device-manufacturer-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行：供应商 + 负责人 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.supplier" prop="supplier">
            <el-input
              v-model="formData.supplier"
              :placeholder="FIELD_PLACEHOLDERS.supplier"
              maxlength="100"
              show-word-limit
              data-cy="device-supplier-input"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.principal" prop="principal">
            <el-input
              v-model="formData.principal"
              :placeholder="FIELD_PLACEHOLDERS.principal"
              maxlength="50"
              show-word-limit
              data-cy="device-principal-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行：设备状态 + 存放位置 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.status" prop="status">
            <el-select
              v-model="formData.status"
              :placeholder="FIELD_PLACEHOLDERS.status"
              style="width: 100%"
              :disabled="mode === 'edit'"
              data-cy="device-status-select"
            >
              <el-option
                v-for="option in DEVICE_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.location" prop="location">
            <el-input
              v-model="formData.location"
              :placeholder="FIELD_PLACEHOLDERS.location"
              maxlength="200"
              show-word-limit
              data-cy="device-location-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第六行：采购日期 + 保修期至 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.purchaseDate" prop="purchaseDate">
            <el-date-picker
              v-model="formData.purchaseDate"
              type="date"
              :placeholder="FIELD_PLACEHOLDERS.purchaseDate"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              data-cy="device-purchase-date-input"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.warrantyDate" prop="warrantyDate">
            <el-date-picker
              v-model="formData.warrantyDate"
              type="date"
              :placeholder="FIELD_PLACEHOLDERS.warrantyDate"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              data-cy="device-warranty-date-input"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第七行：采购价格 + 保修期限 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.purchasePrice" prop="purchasePrice">
            <el-input-number
              v-model="formData.purchasePrice"
              :min="0"
              :precision="2"
              :step="100"
              style="width: 100%"
              data-cy="device-purchase-price-input"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="FIELD_LABELS.warrantyPeriod" prop="warrantyPeriod">
            <el-input-number
              v-model="formData.warrantyPeriod"
              :min="0"
              :max="120"
              style="width: 100%"
              controls-position="right"
              data-cy="device-warranty-period-input"
            >
              <template #append>个月</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 设备描述 -->
      <el-form-item :label="FIELD_LABELS.description" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          :placeholder="FIELD_PLACEHOLDERS.description"
          maxlength="500"
          show-word-limit
          data-cy="device-description-input"
        />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item :label="FIELD_LABELS.remark" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          :placeholder="FIELD_PLACEHOLDERS.remark"
          maxlength="500"
          show-word-limit
          data-cy="device-remark-input"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose" data-cy="device-form-cancel-button">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit" data-cy="device-form-submit-button">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Key } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { createDevice, updateDevice } from '@/api/device/device';
import { getDeviceTypes } from '@/api/device/device-type';
import {
  DEVICE_STATUS_OPTIONS,
  FIELD_LABELS,
  FIELD_PLACEHOLDERS,
  FORM_MODE_CONFIG,
  UNIFIED_DEVICE_FIELDS,
  UNIFIED_FORM_RULES,
} from '@/constants/deviceFormConstants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('deviceFormDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  device: {
    type: Object,
    default: () => null,
  },
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value),
  },
});

const emit = defineEmits(['update:modelValue', 'update:visible', 'success', 'submit']);

const formRef = ref(null);
const submitting = ref(false);
const deviceTypes = ref([]);

// 使用统一的字段定义
const formData = reactive({ ...UNIFIED_DEVICE_FIELDS });

// 使用统一的验证规则
const formRules = UNIFIED_FORM_RULES;

const dialogVisible = computed({
  get: () => props.modelValue || props.visible,
  set: (val) => {
    emit('update:modelValue', val);
    emit('update:visible', val);
  },
});

const dialogTitle = computed(() => {
  return FORM_MODE_CONFIG.deviceManagement.title[props.mode] || '设备表单';
});

const loadDeviceTypes = async () => {
  try {
    const response = await getDeviceTypes();
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      deviceTypes.value = dataArray.map((type) => ({
        id: type.id || type.typeId,
        name: type.name || type.typeName || '未知类型',
        typeName: type.typeName || type.name || '未知类型',
        code: type.code || type.typeCode,
      }));
    } else {
      deviceTypes.value = [];
    }
  } catch (error) {
    if (error.name !== 'CanceledError') {
      logger.error('加载设备类型失败:', error);
    }
    deviceTypes.value = [];
  }
};

const resetForm = () => {
  Object.keys(UNIFIED_DEVICE_FIELDS).forEach((key) => {
    formData[key] = UNIFIED_DEVICE_FIELDS[key];
  });
  formRef.value?.clearValidate?.();
};

const loadDeviceData = () => {
  if (props.device) {
    // 首先重置表单
    Object.keys(UNIFIED_DEVICE_FIELDS).forEach((key) => {
      formData[key] = UNIFIED_DEVICE_FIELDS[key];
    });

    // 然后加载设备数据，处理字段名映射
    formData.deviceCode = props.device.deviceCode || '';
    formData.deviceName = props.device.deviceName || props.device.name || '';
    formData.deviceModel = props.device.deviceModel || props.device.model || '';
    formData.deviceTypeId = props.device.deviceTypeId || props.device.typeId || null;
    formData.serialNumber = props.device.serialNumber || '';
    formData.manufacturer = props.device.manufacturer || '';
    formData.supplierId = props.device.supplierId || null;
    formData.supplierName = props.device.supplierName || '';
    formData.status = props.device.status !== undefined ? props.device.status : -1;
    formData.principalId = props.device.principalId || null;
    formData.principalName = props.device.principalName || props.device.principal?.name || '';
    formData.purchaseDate = props.device.purchaseDate || '';
    formData.productionDate = props.device.productionDate || '';
    formData.warrantyPeriod = props.device.warrantyPeriod || 12;
    formData.warrantyStart = props.device.warrantyStart || '';
    formData.warrantyEnd = props.device.warrantyEnd || '';
    formData.purchasePrice = props.device.purchasePrice || 0;
    formData.price = props.device.price || 0;
    formData.supplierBatchNo = props.device.supplierBatchNo || props.device.assetCode || '';
    formData.imageUrl = props.device.imageUrl || '';
    formData.specifications = props.device.specifications || '';
    formData.description = props.device.description || '';
    formData.remark = props.device.remark || props.device.description || '';
    formData.areaId = props.device.areaId || null;
    formData.binId = props.device.binId || null;
    formData.warehouseId = props.device.warehouseId || null;
    formData.warehouseName = props.device.warehouseName || '';
    formData.areaName = props.device.areaName || '';
    formData.binName = props.device.binName || '';
    formData.installationLocation = props.device.installationLocation || '';
    formData.installationProvince = props.device.installationProvince || '';
    formData.installationCity = props.device.installationCity || '';
    formData.installationDistrict = props.device.installationDistrict || '';
    formData.installationAddress = props.device.installationAddress || '';
    // 库存信息
    formData.currentStock = props.device.currentStock || 0;
    formData.totalStock = props.device.totalStock || 0;
  } else {
    resetForm();
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitting.value = true;

    // 转换字段名以匹配后端实体类
    const data = {
      ...formData,
      // 字段名映射
      name: formData.deviceName, // 后端使用 name
      model: formData.deviceModel, // 后端使用 model
      typeId: formData.deviceTypeId, // 后端使用 typeId
      description: formData.remark || formData.description, // 后端使用 description
    };

    if (props.mode === 'add') {
      await createDevice(data);
      ElMessage.success('设备创建成功');
    } else {
      await updateDevice(props.device.id, data);
      ElMessage.success('设备更新成功');
    }

    emit('success');
    emit('submit', data);
    handleClose();
  } catch (error) {
    if (error !== false) {
      logger.error(props.mode === 'add' ? '设备创建失败' : '设备更新失败', error);
      ElMessage.error(props.mode === 'add' ? '设备创建失败' : '设备更新失败');
    }
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  resetForm();
  dialogVisible.value = false;
};

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      // 对话框打开时，确保设备类型列表已加载
      if (deviceTypes.value.length === 0) {
        await loadDeviceTypes();
      }
      loadDeviceData();
    }
  },
  { immediate: true }
);

watch(
  () => props.device,
  () => {
    loadDeviceData();
  },
  { deep: true }
);

onMounted(() => {
  loadDeviceTypes();
});
</script>

<style scoped>
.device-form {
  padding: 10px 0;
}
</style>
