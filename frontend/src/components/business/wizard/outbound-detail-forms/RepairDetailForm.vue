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
    data-cy="repair-detail-form"
  >
    <el-divider content-position="left">
      <el-icon><Tools /></el-icon> 维修信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="维修单号" prop="repairNo" data-cy="repair-no-form-item">
          <el-input v-model="formData.repairNo" placeholder="请输入维修单号" data-cy="repair-no-input">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="故障类型" prop="faultType" data-cy="repair-fault-type">
          <el-select v-model="formData.faultType" placeholder="请选择故障类型" style="width: 100%" data-cy="repair-fault-type-select">
            <el-option label="硬件故障" value="hardware" data-cy="repair-fault-type-hardware" />
            <el-option label="软件故障" value="software" data-cy="repair-fault-type-software" />
            <el-option label="机械故障" value="mechanical" data-cy="repair-fault-type-mechanical" />
            <el-option label="电气故障" value="electrical" data-cy="repair-fault-type-electrical" />
            <el-option label="其他故障" value="other" data-cy="repair-fault-type-other" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="故障描述" prop="faultDescription" data-cy="repair-fault-description">
      <el-input
        v-model="formData.faultDescription"
        type="textarea"
        :rows="3"
        placeholder="请详细描述设备故障现象"
        maxlength="1000"
        show-word-limit
        data-cy="repair-fault-description-input"
      />
    </el-form-item>

    <el-form-item label="故障现象" prop="faultSymptoms" data-cy="repair-fault-symptoms">
      <el-input
        v-model="formData.faultSymptoms"
        type="textarea"
        :rows="2"
        placeholder="请描述故障发生时的具体表现"
        maxlength="500"
        show-word-limit
        data-cy="repair-fault-symptoms-input"
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><User /></el-icon> 报修信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="报修人" prop="reporterName" data-cy="repair-reporter-name">
          <el-input v-model="formData.reporterName" placeholder="请输入报修人姓名" data-cy="repair-reporter-name-input" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="报修部门" prop="reporterDept" data-cy="repair-reporter-dept">
          <el-input v-model="formData.reporterDept" placeholder="请输入报修部门" data-cy="repair-reporter-dept-input" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="联系电话" prop="reporterPhone" data-cy="repair-reporter-phone">
          <el-input v-model="formData.reporterPhone" placeholder="请输入联系电话" data-cy="repair-reporter-phone-input">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="报修日期" prop="reportDate" data-cy="repair-report-date">
          <el-date-picker
            v-model="formData.reportDate"
            type="date"
            placeholder="选择报修日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            data-cy="repair-report-date-picker"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <el-icon><OfficeBuilding /></el-icon> 维修单位
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="维修方式" prop="repairMethod" data-cy="repair-method">
          <el-radio-group v-model="formData.repairMethod" data-cy="repair-method-group">
            <el-radio label="internal" data-cy="repair-method-internal">内部维修</el-radio>
            <el-radio label="external" data-cy="repair-method-external">外部维修</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="formData.repairMethod === 'external'">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="维修单位" prop="repairUnit" data-cy="repair-unit">
            <el-input v-model="formData.repairUnit" placeholder="请输入维修单位名称" data-cy="repair-unit-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="repairContact" data-cy="repair-unit-contact">
            <el-input v-model="formData.repairContact" placeholder="请输入维修单位联系人" data-cy="repair-unit-contact-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="repairPhone" data-cy="repair-unit-phone">
            <el-input v-model="formData.repairPhone" placeholder="请输入维修单位联系电话" data-cy="repair-unit-phone-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维修地址" prop="repairAddress" data-cy="repair-unit-address">
            <el-input v-model="formData.repairAddress" placeholder="请输入维修单位地址" data-cy="repair-unit-address-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <el-divider content-position="left">
      <el-icon><Calendar /></el-icon> 时间要求
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="要求完成日期" prop="requiredCompleteDate" data-cy="repair-required-date">
          <el-date-picker
            v-model="formData.requiredCompleteDate"
            type="date"
            placeholder="选择要求完成日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
            data-cy="repair-required-date-picker"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="紧急程度" prop="urgencyLevel" data-cy="repair-urgency">
          <el-select v-model="formData.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%" data-cy="repair-urgency-select">
            <el-option label="一般" value="normal" data-cy="repair-urgency-normal" />
            <el-option label="紧急" value="urgent" data-cy="repair-urgency-urgent" />
            <el-option label="特急" value="critical" data-cy="repair-urgency-critical" />
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
        data-cy="repair-remark-input"
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
