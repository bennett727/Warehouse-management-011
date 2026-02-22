<!--
  @file: RepairDetailForm.vue
  @description: 维修出库详细信息表单
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
      <el-icon><Tools /></el-icon> 维修信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="维修单号" prop="repairNo">
          <el-input v-model="formData.repairNo" placeholder="请输入维修单号">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="故障类型" prop="faultType">
          <el-select v-model="formData.faultType" placeholder="请选择故障类型" style="width: 100%">
            <el-option label="硬件故障" value="hardware" />
            <el-option label="软件故障" value="software" />
            <el-option label="机械故障" value="mechanical" />
            <el-option label="电气故障" value="electrical" />
            <el-option label="其他故障" value="other" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="故障描述" prop="faultDescription">
      <el-input
        v-model="formData.faultDescription"
        type="textarea"
        :rows="3"
        placeholder="请详细描述设备故障现象"
        maxlength="1000"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="故障现象" prop="faultSymptoms">
      <el-input
        v-model="formData.faultSymptoms"
        type="textarea"
        :rows="2"
        placeholder="请描述故障发生时的具体表现"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><User /></el-icon> 报修信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="报修人" prop="reporterName">
          <el-input v-model="formData.reporterName" placeholder="请输入报修人姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="报修部门" prop="reporterDept">
          <el-input v-model="formData.reporterDept" placeholder="请输入报修部门" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="联系电话" prop="reporterPhone">
          <el-input v-model="formData.reporterPhone" placeholder="请输入联系电话">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="报修日期" prop="reportDate">
          <el-date-picker
            v-model="formData.reportDate"
            type="date"
            placeholder="选择报修日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <el-icon><OfficeBuilding /></el-icon> 维修单位
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="维修方式" prop="repairMethod">
          <el-radio-group v-model="formData.repairMethod">
            <el-radio label="internal">内部维修</el-radio>
            <el-radio label="external">外部维修</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="formData.repairMethod === 'external'">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="维修单位" prop="repairUnit">
            <el-input v-model="formData.repairUnit" placeholder="请输入维修单位名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="repairContact">
            <el-input v-model="formData.repairContact" placeholder="请输入维修单位联系人" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="repairPhone">
            <el-input v-model="formData.repairPhone" placeholder="请输入维修单位联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维修地址" prop="repairAddress">
            <el-input v-model="formData.repairAddress" placeholder="请输入维修单位地址" />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <el-divider content-position="left">
      <el-icon><Calendar /></el-icon> 时间要求
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="要求完成日期" prop="requiredCompleteDate">
          <el-date-picker
            v-model="formData.requiredCompleteDate"
            type="date"
            placeholder="选择要求完成日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="紧急程度" prop="urgencyLevel">
          <el-select v-model="formData.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%">
            <el-option label="一般" value="normal" />
            <el-option label="紧急" value="urgent" />
            <el-option label="特急" value="critical" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="2"
        placeholder="请输入备注信息（选填）"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { Calendar, Document, OfficeBuilding, Phone, Tools, User } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      repairNo: '',
      faultType: '',
      faultDescription: '',
      faultSymptoms: '',
      reporterName: '',
      reporterDept: '',
      reporterPhone: '',
      reportDate: '',
      repairMethod: 'internal',
      repairUnit: '',
      repairContact: '',
      repairPhone: '',
      repairAddress: '',
      requiredCompleteDate: '',
      urgencyLevel: 'normal',
      remark: '',
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
  repairNo: [{ required: true, message: '请输入维修单号', trigger: 'blur' }],
  faultType: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  faultDescription: [{ required: true, message: '请输入故障描述', trigger: 'blur' }],
  reporterName: [{ required: true, message: '请输入报修人', trigger: 'blur' }],
  reporterPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  reportDate: [{ required: true, message: '请选择报修日期', trigger: 'change' }],
  repairMethod: [{ required: true, message: '请选择维修方式', trigger: 'change' }],
  repairUnit: [{ required: true, message: '请输入维修单位', trigger: 'blur' }],
  requiredCompleteDate: [{ required: true, message: '请选择要求完成日期', trigger: 'change' }],
};

const disabledDate = (date) => {
  return date < new Date();
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
