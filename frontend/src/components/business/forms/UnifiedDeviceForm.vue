<!--
  @file: UnifiedDeviceForm.vue
  @description: 统一的设备表单组件，支持多种业务场景
  @author: 开发团队
  @createTime: 2026-02-06
  @version: 1.0
-->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-position="labelPosition"
    :label-width="labelWidth"
    class="unified-device-form"
  >
    <div v-if="showHeaderTip" class="form-header-tip">
      <el-icon class="tip-icon"><InfoFilled /></el-icon>
      <span class="tip-text">{{ headerTipText }}</span>
    </div>

    <div class="form-sections">
      <div v-for="section in visibleSections" :key="section.key" class="form-section">
        <div v-if="section.title" class="section-header">
          <div class="section-icon">
            <el-icon>
              <component :is="section.icon" />
            </el-icon>
          </div>
          <div class="section-title">
            <span class="title-text">{{ section.title }}</span>
            <span v-if="section.description" class="title-desc">{{ section.description }}</span>
          </div>
        </div>
        <div class="section-content">
          <el-row :gutter="rowGutter">
            <el-col
              v-for="field in section.fields"
              :key="field.key"
              :xs="field.xs || 24"
              :sm="field.sm || 12"
              :md="field.md || 12"
              :lg="field.lg || 8"
            >
              <el-form-item :label="field.label" :prop="field.key" :class="{ 'form-item-highlight': field.highlight }">
                <template v-if="field.key === 'deviceType'">
                  <div class="device-type-select-wrapper">
                    <DeviceTypeSelect
                      v-model="formData[field.key]"
                      :placeholder="field.placeholder"
                      :show-quick-add="showQuickAddType"
                      :show-status="false"
                      class="type-select"
                      @create="handleTypeCreated"
                    />
                  </div>
                </template>
                <template v-else-if="field.key === 'location'">
                  <LocationSelect
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                    :clearable="field.clearable !== false"
                    class="location-select"
                  />
                </template>
                <template v-else-if="field.key === 'binId'">
                  <BinSelect
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                    :clearable="field.clearable !== false"
                    :area-id="formData.location?.length > 0 ? formData.location[formData.location.length - 1] : null"
                    class="bin-select"
                  />
                </template>
                <template v-else-if="field.type === 'select'">
                  <el-select
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled"
                    :clearable="field.clearable !== false"
                    :filterable="field.filterable"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="option in field.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </template>
                <template v-else-if="field.type === 'date'">
                  <el-date-picker
                    v-model="formData[field.key]"
                    :type="field.dateType || 'date'"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled"
                    :clearable="field.clearable !== false"
                    style="width: 100%"
                    :value-format="field.valueFormat || 'YYYY-MM-DD'"
                  />
                </template>
                <template v-else-if="field.type === 'number'">
                  <el-input-number
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled"
                    :min="field.min"
                    :max="field.max"
                    :precision="field.precision"
                    :step="field.step"
                    style="width: 100%"
                  />
                </template>
                <template v-else-if="field.type === 'textarea'">
                  <el-input
                    v-model="formData[field.key]"
                    type="textarea"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled"
                    :maxlength="field.maxlength"
                    :rows="field.rows || 3"
                    show-word-limit
                    resize="none"
                  />
                </template>
                <template v-else>
                  <el-input
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled"
                    :maxlength="field.maxlength"
                    :show-word-limit="field.showWordLimit"
                    :type="field.inputType || 'text'"
                  >
                    <template v-if="field.prefixIcon" #prefix>
                      <el-icon><component :is="field.prefixIcon" /></el-icon>
                    </template>
                    <template v-if="field.suffix" #suffix>
                      <span class="input-suffix">{{ field.suffix }}</span>
                    </template>
                  </el-input>
                </template>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </el-form>
</template>

<script setup>
import { InfoFilled, Box, Document, Location, Money, Setting } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

import BinSelect from '@/components/business/selectors/BinSelect.vue';
import DeviceTypeSelect from '@/components/business/selectors/DeviceTypeSelect.vue';
import LocationSelect from '@/components/business/selectors/LocationSelect.vue';
import { DeviceStatus } from '@/constants/deviceStatus';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: 'device',
    validator: (value) => ['device', 'inbound', 'outbound', 'transfer', 'installation'].includes(value),
  },
  formMode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value),
  },
  labelPosition: {
    type: String,
    default: 'top',
  },
  labelWidth: {
    type: String,
    default: '120px',
  },
  rowGutter: {
    type: Number,
    default: 24,
  },
  showHeaderTip: {
    type: Boolean,
    default: true,
  },
  showQuickAddType: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'type-created', 'validate']);

const formRef = ref(null);

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const headerTipText = computed(() => {
  const tipMap = {
    device: '请完善设备信息，带 * 的为必填项',
    inbound: '请完善设备入库信息，带 * 的为必填项',
    outbound: '请完善设备出库信息，带 * 的为必填项',
    transfer: '请完善设备调拨信息，带 * 的为必填项',
    installation: '请完善设备安装信息，带 * 的为必填项',
  };
  return tipMap[props.mode] || '请完善设备信息，带 * 的为必填项';
});

const DEVICE_STATUS_OPTIONS = [
  { label: '待入库', value: DeviceStatus.PENDING_INBOUND },
  { label: '在库', value: DeviceStatus.IN_STOCK },
  { label: '使用中', value: DeviceStatus.IN_USE },
  { label: '维护中', value: DeviceStatus.MAINTENANCE },
  { label: '已报废', value: DeviceStatus.SCRAPPED },
];

const SECTION_CONFIG = {
  core: {
    key: 'core',
    title: '核心设备信息',
    description: '设备的基础标识信息',
    icon: Box,
    fields: [
      {
        key: 'deviceCode',
        label: '设备编号',
        placeholder: '请输入设备编号',
        highlight: true,
        maxlength: 30,
        showWordLimit: true,
        disabled: computed(() => props.formMode === 'edit'),
        prefixIcon: 'Tickets',
      },
      {
        key: 'name',
        label: '设备名称',
        placeholder: '请输入设备名称',
        highlight: true,
        maxlength: 100,
        showWordLimit: true,
        prefixIcon: 'Monitor',
      },
      {
        key: 'deviceType',
        label: '设备类型',
        placeholder: '请选择设备类型',
        highlight: true,
        type: 'deviceType',
      },
      {
        key: 'serialNumber',
        label: '设备序列号',
        placeholder: '请输入设备序列号',
        maxlength: 50,
        showWordLimit: true,
        prefixIcon: 'Key',
      },
      {
        key: 'model',
        label: '规格型号',
        placeholder: '请输入规格型号',
        maxlength: 50,
        showWordLimit: true,
      },
      {
        key: 'manufacturer',
        label: '制造商',
        placeholder: '请输入制造商',
        maxlength: 100,
        showWordLimit: true,
      },
    ],
  },
  detail: {
    key: 'detail',
    title: '详细信息',
    description: '设备的详细规格和采购信息',
    icon: Document,
    fields: [
      {
        key: 'supplier',
        label: '供应商',
        placeholder: '请输入供应商',
        maxlength: 100,
        showWordLimit: true,
      },
      {
        key: 'principal',
        label: '负责人',
        placeholder: '请输入负责人',
        maxlength: 50,
        showWordLimit: true,
      },
      {
        key: 'purchaseDate',
        label: '采购日期',
        placeholder: '请选择采购日期',
        type: 'date',
        clearable: true,
      },
      {
        key: 'warrantyDate',
        label: '保修期至',
        placeholder: '请选择保修期至',
        type: 'date',
        clearable: true,
      },
    ],
  },
  location: {
    key: 'location',
    title: '位置信息',
    description: '设备的存放或安装位置',
    icon: Location,
    fields: [
      {
        key: 'location',
        label: '存放区域',
        placeholder: '请选择存放区域',
        type: 'location',
      },
      {
        key: 'binId',
        label: '存放货位',
        placeholder: '请选择存放货位',
        type: 'bin',
      },
    ],
  },
  inbound: {
    key: 'inbound',
    title: '入库信息',
    description: '入库相关的数量和价格信息',
    icon: Money,
    fields: [
      {
        key: 'quantity',
        label: '入库数量',
        placeholder: '请输入入库数量',
        type: 'number',
        min: 1,
        max: 99999,
        precision: 0,
        step: 1,
      },
      {
        key: 'unitPrice',
        label: '单价',
        placeholder: '请输入单价',
        type: 'number',
        min: 0,
        max: 9999999,
        precision: 2,
        step: 0.01,
        suffix: '元',
      },
      {
        key: 'totalPrice',
        label: '总价',
        placeholder: '自动计算',
        type: 'number',
        min: 0,
        max: 999999999,
        precision: 2,
        step: 0.01,
        suffix: '元',
        disabled: true,
      },
    ],
  },
  status: {
    key: 'status',
    title: '状态信息',
    description: '设备的状态和备注信息',
    icon: Setting,
    fields: [
      {
        key: 'status',
        label: '设备状态',
        placeholder: '请选择设备状态',
        type: 'select',
        options: DEVICE_STATUS_OPTIONS,
        disabled: computed(() => props.formMode === 'edit'),
      },
      {
        key: 'remark',
        label: '备注',
        placeholder: '请输入备注信息',
        type: 'textarea',
        maxlength: 500,
        rows: 3,
      },
    ],
  },
};

const MODE_SECTIONS = {
  device: ['core', 'detail', 'location', 'status'],
  inbound: ['core', 'detail', 'location', 'inbound'],
  outbound: ['core', 'detail', 'status'],
  transfer: ['core', 'location', 'status'],
  installation: ['core', 'location', 'status'],
};

const visibleSections = computed(() => {
  const sectionKeys = MODE_SECTIONS[props.mode] || MODE_SECTIONS.device;
  return sectionKeys.map((key) => SECTION_CONFIG[key]).filter(Boolean);
});

const formRules = computed(() => {
  const rules = {};

  const baseRules = {
    deviceCode: [
      { required: true, message: '请输入设备编号', trigger: 'blur' },
      { min: 3, max: 30, message: '设备编号长度在 3 到 30 个字符', trigger: 'blur' },
    ],
    name: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { min: 2, max: 100, message: '设备名称长度在 2 到 100 个字符', trigger: 'blur' },
    ],
    deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  };

  const inboundRules = {
    quantity: [
      { required: true, message: '请输入入库数量', trigger: 'blur' },
      { type: 'number', min: 1, message: '入库数量必须大于 0', trigger: 'blur' },
    ],
    unitPrice: [
      { required: true, message: '请输入单价', trigger: 'blur' },
      { type: 'number', min: 0, message: '单价不能为负数', trigger: 'blur' },
    ],
  };

  Object.assign(rules, baseRules);

  if (props.mode === 'inbound') {
    Object.assign(rules, inboundRules);
  }

  return rules;
});

function handleTypeCreated(newType) {
  emit('type-created', newType);
}

async function validate() {
  if (!formRef.value) {
    return false;
  }

  try {
    const valid = await formRef.value.validate();
    emit('validate', valid);
    return valid;
  } catch {
    emit('validate', false);
    return false;
  }
}

function resetFields() {
  formRef.value?.resetFields();
}

function clearValidate() {
  formRef.value?.clearValidate();
}

watch(
  () => [formData.value.quantity, formData.value.unitPrice],
  ([quantity, unitPrice]) => {
    if (quantity !== undefined && unitPrice !== undefined) {
      formData.value.totalPrice = quantity * unitPrice;
    }
  }
);

defineExpose({
  validate,
  resetFields,
  clearValidate,
  formRef,
});
</script>

<style scoped lang="scss">
.unified-device-form {
  .form-header-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #ecf5ff;
    border-radius: 4px;
    margin-bottom: 20px;
    color: #606266;
    font-size: 14px;

    .tip-icon {
      color: #409eff;
      font-size: 16px;
    }

    .tip-text {
      flex: 1;
    }
  }

  .form-sections {
    .form-section {
      margin-bottom: 24px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        margin-bottom: 16px;
        border-bottom: 1px solid #ebeef5;

        .section-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #409eff;
          border-radius: 6px;
          color: white;
          font-size: 18px;
        }

        .section-title {
          .title-text {
            display: block;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 2px;
          }

          .title-desc {
            display: block;
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .section-content {
        .form-item-highlight {
          :deep(.el-form-item__label) {
            color: #409eff;
            font-weight: 500;
          }
        }

        .device-type-select-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;

          .type-select {
            flex: 1;
          }
        }

        .location-select {
          width: 100%;
        }

        .bin-select {
          width: 100%;
        }

        .input-suffix {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__prefix) {
  color: #909399;
}
</style>
