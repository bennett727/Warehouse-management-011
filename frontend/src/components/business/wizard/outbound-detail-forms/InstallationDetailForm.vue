<!--
  @file: InstallationDetailForm.vue
  @description: 安装出库详细信息表单
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 1.0
-->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
    label-position="right"
    class="detail-form"
  >
    <el-divider content-position="left">
      <el-icon><SetUp /></el-icon> 安装信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="安装项目" prop="projectName">
          <el-input v-model="formData.projectName" placeholder="请输入安装项目名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="项目编号" prop="projectNo">
          <el-input v-model="formData.projectNo" placeholder="请输入项目编号">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="安装地址" prop="installationAddress">
      <el-input
        v-model="formData.installationAddress"
        type="textarea"
        :rows="2"
        placeholder="请输入详细安装地址"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><User /></el-icon> 客户信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="formData.customerName" placeholder="请输入客户名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="备用电话" prop="backupPhone">
          <el-input v-model="formData.backupPhone" placeholder="请输入备用电话（选填）" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <el-icon><Calendar /></el-icon> 时间安排
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="要求安装日期" prop="requiredInstallDate">
          <el-date-picker
            v-model="formData.requiredInstallDate"
            type="date"
            placeholder="选择要求安装日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="安装时间段" prop="installTimeSlot">
          <el-select v-model="formData.installTimeSlot" placeholder="请选择安装时间段" style="width: 100%">
            <el-option label="上午 (9:00-12:00)" value="morning" />
            <el-option label="下午 (14:00-18:00)" value="afternoon" />
            <el-option label="全天" value="allday" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <el-icon><Tools /></el-icon> 安装要求
    </el-divider>

    <el-form-item label="安装要求" prop="installRequirements">
      <el-input
        v-model="formData.installRequirements"
        type="textarea"
        :rows="3"
        placeholder="请描述安装环境要求、特殊注意事项等"
        maxlength="1000"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="附件上传" prop="attachments">
      <el-upload
        v-model:file-list="formData.attachments"
        action="/api/upload"
        multiple
        :limit="5"
        :before-upload="beforeUpload"
      >
        <el-button type="primary" :icon="Upload">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">支持上传图纸、合同等文件，单个文件不超过10MB</div>
        </template>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { Calendar, Document, Phone, SetUp, Tools, Upload, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      projectName: '',
      projectNo: '',
      installationAddress: '',
      customerName: '',
      contactPerson: '',
      contactPhone: '',
      backupPhone: '',
      requiredInstallDate: '',
      installTimeSlot: '',
      installRequirements: '',
      attachments: [],
    }),
  },
});

const emit = defineEmits(['update:modelValue']);

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref(null);

const rules = {
  projectName: [{ required: true, message: '请输入安装项目名称', trigger: 'blur' }],
  installationAddress: [{ required: true, message: '请输入安装地址', trigger: 'blur' }],
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  requiredInstallDate: [{ required: true, message: '请选择要求安装日期', trigger: 'change' }],
};

const disabledDate = (date) => {
  return date < new Date();
};

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB');
  }
  return isLt10M;
};

const validate = async () => {
  return formRef.value?.validate();
};

defineExpose({
  validate,
});
</script>

<style scoped>
.detail-form {
  padding: 20px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}
</style>
