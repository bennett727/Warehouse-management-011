<!--
  @file: DeviceTypeSelect.vue
  @description: 统一的设备类型选择组件，支持快速创建设备类型并实时同步
  @author: 开发团队
  @createTime: 2026-02-06
  @version: 1.0
-->
<template>
  <div class="device-type-select-container">
    <el-select
      v-model="selectedType"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :filterable="filterable"
      :allow-create="allowCreate"
      :default-first-option="defaultFirstOption"
      :filter-method="filterDeviceTypes"
      @change="handleChange"
      @blur="handleBlur"
      @clear="handleClear"
      class="device-type-select"
      value-key="id"
      data-cy="device-type-select"
    >
      <el-option v-for="type in filteredDeviceTypes" :key="type.id" :label="type.name" :value="type">
        <div class="device-type-option">
          <span class="type-name">{{ type.name }}</span>
          <span class="type-code">{{ type.code }}</span>
          <el-tag
            v-if="showStatus && type.status !== undefined"
            :type="type.status === 1 ? 'success' : 'info'"
            size="small"
          >
            {{ type.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </div>
      </el-option>
    </el-select>

    <el-tooltip v-if="showQuickAdd" content="快速创建设备类型" placement="top">
      <el-button
        :icon="Plus"
        circle
        size="small"
        type="primary"
        class="quick-add-btn"
        @click="handleOpenCreateDialog"
        data-cy="device-type-quick-add-btn"
      />
    </el-tooltip>

    <el-dialog
      v-model="createDialogVisible"
      title="快速创建设备类型"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      class="create-type-dialog"
      data-cy="device-type-create-dialog"
    >
      <div class="dialog-tip">
        <el-icon class="tip-icon"><InfoFilled /></el-icon>
        <span>创建设备类型后，该类型将自动选中并同步到设备类型管理</span>
      </div>
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeFormRules" label-position="top" data-cy="device-type-form">
        <el-form-item label="类型名称" prop="name" data-cy="device-type-name-form-item">
          <el-input
            v-model="typeForm.name"
            placeholder="请输入设备类型名称，如：自助机"
            maxlength="50"
            show-word-limit
            data-cy="device-type-name-input"
          />
        </el-form-item>
        <el-form-item label="类型编码" prop="code" data-cy="device-type-code-form-item">
          <el-input v-model="typeForm.code" placeholder="请输入类型编码，如：ZJ" maxlength="20" show-word-limit data-cy="device-type-code-input" />
          <div class="form-tip">编码只能包含大写字母和数字，且必须唯一</div>
        </el-form-item>
        <el-form-item label="状态" prop="status" data-cy="device-type-status-form-item">
          <el-radio-group v-model="typeForm.status" data-cy="device-type-status-group">
            <el-radio :label="1" data-cy="device-type-status-enable">启用</el-radio>
            <el-radio :label="0" data-cy="device-type-status-disable">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description" data-cy="device-type-description-form-item">
          <el-input
            v-model="typeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入设备类型描述（选填）"
            maxlength="200"
            show-word-limit
            resize="none"
            data-cy="device-type-description-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false" data-cy="device-type-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleCreateType" :loading="createLoading" data-cy="device-type-create-btn"> 创建并选中 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { InfoFilled, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { useDeviceTypeStore } from '@/stores/deviceType';
import logger from '@/utils/logger';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '请选择设备类型',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  filterable: {
    type: Boolean,
    default: true,
  },
  allowCreate: {
    type: Boolean,
    default: false,
  },
  defaultFirstOption: {
    type: Boolean,
    default: true,
  },
  showQuickAdd: {
    type: Boolean,
    default: false,
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'create']);

const deviceTypeStore = useDeviceTypeStore();

const selectedType = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (val && typeof val === 'object') {
      emit('update:modelValue', val.id);
    } else {
      emit('update:modelValue', val);
    }
  },
});

const deviceTypes = computed(() => deviceTypeStore.deviceTypes);

const filteredDeviceTypes = ref([]);

const createDialogVisible = ref(false);
const createLoading = ref(false);
const typeFormRef = ref(null);

const typeForm = reactive({
  name: '',
  code: '',
  status: 1,
  description: '',
});

const typeFormRules = {
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '类型名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { min: 2, max: 20, message: '类型编码长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '类型编码只能包含大写字母和数字', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

function filterDeviceTypes(query) {
  if (!query) {
    filteredDeviceTypes.value = deviceTypes.value;
    return;
  }

  const keyword = query.toLowerCase();
  filteredDeviceTypes.value = deviceTypes.value.filter(
    (type) => type.name.toLowerCase().includes(keyword) || type.code.toLowerCase().includes(keyword)
  );
}

function handleChange(value) {
  emit('change', value);
}

function handleBlur() {
  if (props.allowCreate && selectedType.value && !deviceTypes.value.some((t) => t.code === selectedType.value)) {
    handleOpenCreateDialog();
  }
}

function handleClear() {
  emit('change', '');
}

function handleOpenCreateDialog() {
  createDialogVisible.value = true;
  resetTypeForm();
}

function resetTypeForm() {
  typeForm.name = '';
  typeForm.code = '';
  typeForm.status = 1;
  typeForm.description = '';
  typeFormRef.value?.clearValidate();
}

async function handleCreateType() {
  if (!typeFormRef.value) {
    return;
  }

  try {
    await typeFormRef.value.validate();
    createLoading.value = true;

    const newType = await deviceTypeStore.createDeviceType(typeForm);

    ElMessage.success('设备类型创建成功');

    emit('create', newType);

    selectedType.value = newType.code;
    emit('change', newType.code);

    createDialogVisible.value = false;
    resetTypeForm();
  } catch (error) {
    if (error !== false) {
      ElMessage.error('创建设备类型失败');
    }
  } finally {
    createLoading.value = false;
  }
}

async function loadDeviceTypes() {
  try {
    await deviceTypeStore.fetchDeviceTypes();
    filteredDeviceTypes.value = deviceTypes.value;
  } catch (error) {
    logger.error('加载设备类型失败:', error);
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      selectedType.value = newVal;
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadDeviceTypes();
});
</script>

<style scoped lang="scss">
.device-type-select-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.device-type-select {
  flex: 1;
  min-width: 0;
}

.device-type-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px;
}

.type-name {
  flex: 1;
  font-weight: 500;
}

.type-code {
  margin-right: 8px;
  color: #909399;
  font-size: 12px;
}

.quick-add-btn {
  flex-shrink: 0;
}

.dialog-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ecf5ff;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.tip-icon {
  color: #409eff;
  font-size: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-select) {
  width: 100%;
}
</style>
