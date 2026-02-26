<!--
  @file: InstallationDialog.vue
  @description: 安装对话框组件，用于处理设备安装操作 - 优化版
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0 - 使用统一行政区划组件
  @modifyRecords:
      2025-12-21: 初始版本创建
      2026-02-13: 优化版本 - 使用AdministrativeDivisionCascader组件替换硬编码数据
-->
<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    :show-form="true"
    :form-data="formData"
    :form-rules="formRules"
    label-position="left"
    :label-width="formLabelWidth"
    :auto-reset="false"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @open="handleOpen"
  >
    <template #form>
      <el-form-item label="设备名称" prop="deviceId" data-cy="installation-device-form-item">
        <el-input v-model="deviceName" disabled data-cy="installation-device-input" />
      </el-form-item>

      <!-- 使用统一的行政区划级联选择器 -->
      <el-form-item label="安装地址" prop="installationDivision" data-cy="installation-division-form-item">
        <AdministrativeDivisionCascader
          v-model="selectedDivision"
          placeholder="请选择省/市/区"
          :clearable="true"
          :filterable="true"
          :allow-create="false"
          :show-recent="true"
          recent-key="installation_division_recent"
          @change="handleDivisionChange"
          data-cy="installation-division-cascader"
        />
      </el-form-item>

      <el-form-item label="详细地址" prop="location" data-cy="installation-location-form-item">
        <el-input
          v-model="formData.location"
          placeholder="请输入详细安装地址（街道、门牌号等）"
          :maxlength="200"
          show-word-limit
          data-cy="installation-location-input"
        />
      </el-form-item>

      <el-form-item label="安装状态" prop="status" data-cy="installation-status-form-item">
        <el-select v-model="formData.status" placeholder="请选择安装状态" style="width: 100%" data-cy="installation-status-select">
          <el-option label="待安装" value="pending" />
          <el-option label="安装中" value="installing" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="canceled" />
        </el-select>
      </el-form-item>

      <el-form-item label="安装人员" prop="installer" data-cy="installation-installer-form-item">
        <el-input v-model="formData.installer" placeholder="请输入安装人员姓名" :maxlength="50" data-cy="installation-installer-input" />
      </el-form-item>

      <el-form-item label="安装日期" prop="installDate" data-cy="installation-date-form-item">
        <el-date-picker
          v-model="formData.installDate"
          type="date"
          placeholder="请选择安装日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          data-cy="installation-date-picker"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime" data-cy="installation-start-time-form-item">
            <el-time-picker
              v-model="formData.startTime"
              placeholder="开始时间"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              data-cy="installation-start-time-picker"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime" data-cy="installation-end-time-form-item">
            <el-time-picker
              v-model="formData.endTime"
              placeholder="结束时间"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              data-cy="installation-end-time-picker"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark" data-cy="installation-remark-form-item">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注信息"
          :rows="3"
          :maxlength="500"
          show-word-limit
          data-cy="installation-remark-input"
        />
      </el-form-item>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { getDeviceDetail } from '@/api/device/device';
import installationApi from '@/api/installation/installation';
import AdministrativeDivisionCascader from '@/components/business/selectors/AdministrativeDivisionCascader.vue';
import { getWindowWidth } from '@/utils/helpers';
import { createLogger } from '@/utils/logger';

const logger = createLogger('InstallationDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  installation: {
    type: Object,
    default: null,
  },
  deviceId: {
    type: [String, Number],
    required: true,
  },
  mode: {
    type: String,
    default: 'add',
  },
});

const emit = defineEmits(['update:modelValue', 'success']);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增安装记录' : '编辑安装记录';
});

const isMobile = computed(() => getWindowWidth() <= 767);

const dialogWidth = computed(() => {
  const width = getWindowWidth();
  if (isMobile.value) {
    return '95%';
  }
  if (width <= 1023) {
    return '70%';
  }
  return '600px';
});

const formLabelWidth = computed(() => {
  const width = getWindowWidth();
  if (isMobile.value) {
    return '70px';
  }
  if (width <= 767) {
    return '80px';
  }
  return '100px';
});

const formRef = ref(null);
const submitLoading = ref(false);
const deviceName = ref('');

// 行政区划级联选择器的值
const selectedDivision = ref([]);

const formData = reactive({
  id: null,
  deviceId: props.deviceId,
  installationProvince: '',
  installationCity: '',
  installationDistrict: '',
  location: '',
  status: 'pending',
  installer: '',
  installDate: null,
  startTime: null,
  endTime: null,
  remark: '',
});

const formRules = {
  installationDivision: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!formData.installationProvince || !formData.installationCity || !formData.installationDistrict) {
          callback(new Error('请选择完整的省市区信息'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  location: [
    { required: true, message: '请输入详细安装地址', trigger: 'blur' },
    { min: 2, max: 200, message: '详细地址长度在2-200个字符之间', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择安装状态', trigger: 'change' }],
  installer: [
    { required: true, message: '请输入安装人员', trigger: 'blur' },
    { min: 2, max: 50, message: '安装人员姓名长度在2-50个字符之间', trigger: 'blur' },
  ],
  installDate: [{ required: true, message: '请选择安装日期', trigger: 'change' }],
};

const loadDeviceInfo = async () => {
  try {
    const response = await getDeviceDetail(props.deviceId);
    deviceName.value = response.data?.deviceName || '';
  } catch {
    ElMessage.error('加载设备信息失败');
  }
};

// 处理行政区划变化
const handleDivisionChange = (values, labels) => {
  if (values && values.length === 3) {
    formData.installationProvince = labels[0] || '';
    formData.installationCity = labels[1] || '';
    formData.installationDistrict = labels[2] || '';
  } else {
    formData.installationProvince = '';
    formData.installationCity = '';
    formData.installationDistrict = '';
  }
};

const resetForm = () => {
  formData.id = null;
  formData.deviceId = props.deviceId;
  formData.installationProvince = '';
  formData.installationCity = '';
  formData.installationDistrict = '';
  formData.location = '';
  formData.status = 'pending';
  formData.installer = '';
  formData.installDate = null;
  formData.startTime = null;
  formData.endTime = null;
  formData.remark = '';

  // 重置行政区划选择器
  selectedDivision.value = [];
};

const handleClose = () => {
  resetForm();
  emit('update:modelValue', false);
};

const handleOpen = () => {
  loadDeviceInfo();

  // 如果是编辑模式，加载现有数据
  if (props.mode === 'edit' && props.installation) {
    Object.assign(formData, props.installation);

    // 设置行政区划选择器的值
    if (formData.installationProvince && formData.installationCity && formData.installationDistrict) {
      // 这里需要根据名称反查ID，组件内部会处理
      selectedDivision.value = [
        formData.installationProvince,
        formData.installationCity,
        formData.installationDistrict,
      ];
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) {
    return;
  }

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }

    submitLoading.value = true;
    try {
      // 构建提交数据，映射字段名以匹配后端期望
      const submitData = {
        deviceId: formData.deviceId,
        installationProvince: formData.installationProvince,
        installationCity: formData.installationCity,
        installationDistrict: formData.installationDistrict,
        installationLocation: formData.location,
        status: formData.status,
        installerName: formData.installer,
        installDate: formData.installDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        remark: formData.remark,
      };

      if (props.mode === 'add') {
        await installationApi.createInstallationRecord(submitData);
        ElMessage.success('添加安装记录成功');
      } else {
        await installationApi.updateInstallationRecord(formData.id, submitData);
        ElMessage.success('更新安装记录成功');
      }
      emit('success');
      handleClose();
    } catch (error) {
      ElMessage.error(props.mode === 'add' ? '添加失败' : '更新失败');
      logger.error('提交安装记录失败', error);
    } finally {
      submitLoading.value = false;
    }
  });
};

// 监听对话框打开状态
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      handleOpen();
    }
  }
);

onMounted(() => {
  loadDeviceInfo();
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
