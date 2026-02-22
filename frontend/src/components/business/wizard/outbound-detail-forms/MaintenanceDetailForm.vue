<!--
  @file: MaintenanceDetailForm.vue
  @description: 保养出库详细信息表单
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
      <el-icon><Timer /></el-icon> 保养信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="保养单号" prop="maintenanceNo">
          <el-input v-model="formData.maintenanceNo" placeholder="请输入保养单号">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="保养类型" prop="maintenanceType">
          <el-select v-model="formData.maintenanceType" placeholder="请选择保养类型" style="width: 100%">
            <el-option label="日常保养" value="daily" />
            <el-option label="定期保养" value="periodic" />
            <el-option label="季节性保养" value="seasonal" />
            <el-option label="大修保养" value="overhaul" />
            <el-option label="预防性保养" value="preventive" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="保养内容" prop="maintenanceContent">
      <el-checkbox-group v-model="formData.maintenanceContent">
        <el-checkbox label="清洁保养">清洁保养</el-checkbox>
        <el-checkbox label="润滑保养">润滑保养</el-checkbox>
        <el-checkbox label="紧固检查">紧固检查</el-checkbox>
        <el-checkbox label="调整校准">调整校准</el-checkbox>
        <el-checkbox label="更换耗材">更换耗材</el-checkbox>
        <el-checkbox label="功能测试">功能测试</el-checkbox>
        <el-checkbox label="安全检查">安全检查</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item label="保养要求" prop="maintenanceRequirements">
      <el-input
        v-model="formData.maintenanceRequirements"
        type="textarea"
        :rows="3"
        placeholder="请详细描述保养的具体要求和注意事项"
        maxlength="1000"
        show-word-limit
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><User /></el-icon> 申请人信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="申请人" prop="applicantName">
          <el-input v-model="formData.applicantName" placeholder="请输入申请人姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="所属部门" prop="applicantDept">
          <el-input v-model="formData.applicantDept" placeholder="请输入所属部门" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="联系电话" prop="applicantPhone">
          <el-input v-model="formData.applicantPhone" placeholder="请输入联系电话">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="申请日期" prop="applyDate">
          <el-date-picker
            v-model="formData.applyDate"
            type="date"
            placeholder="选择申请日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <el-icon><OfficeBuilding /></el-icon> 保养单位
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="保养方式" prop="maintenanceMethod">
          <el-radio-group v-model="formData.maintenanceMethod">
            <el-radio label="internal">内部保养</el-radio>
            <el-radio label="external">外部保养</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="formData.maintenanceMethod === 'external'">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="保养单位" prop="maintenanceUnit">
            <el-input v-model="formData.maintenanceUnit" placeholder="请输入保养单位名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="maintenanceContact">
            <el-input v-model="formData.maintenanceContact" placeholder="请输入保养单位联系人" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="maintenancePhone">
            <el-input v-model="formData.maintenancePhone" placeholder="请输入保养单位联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保养地址" prop="maintenanceAddress">
            <el-input v-model="formData.maintenanceAddress" placeholder="请输入保养单位地址" />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <el-divider content-position="left">
      <el-icon><Calendar /></el-icon> 计划时间
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="计划开始日期" prop="planStartDate">
          <el-date-picker
            v-model="formData.planStartDate"
            type="date"
            placeholder="选择计划开始日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="计划完成日期" prop="planEndDate">
          <el-date-picker
            v-model="formData.planEndDate"
            type="date"
            placeholder="选择计划完成日期"
            style="width: 100%"
            :disabled-date="disabledEndDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="预计工时" prop="estimatedHours">
          <el-input-number v-model="formData.estimatedHours" :min="1" :max="999" style="width: 100%">
            <template #suffix>小时</template>
          </el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="保养周期" prop="maintenanceCycle">
          <el-input v-model="formData.maintenanceCycle" placeholder="如：每季度、每半年等" />
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
import { Calendar, Document, OfficeBuilding, Phone, Timer, User } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      maintenanceNo: '',
      maintenanceType: '',
      maintenanceContent: [],
      maintenanceRequirements: '',
      applicantName: '',
      applicantDept: '',
      applicantPhone: '',
      applyDate: '',
      maintenanceMethod: 'internal',
      maintenanceUnit: '',
      maintenanceContact: '',
      maintenancePhone: '',
      maintenanceAddress: '',
      planStartDate: '',
      planEndDate: '',
      estimatedHours: 1,
      maintenanceCycle: '',
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
  maintenanceNo: [{ required: true, message: '请输入保养单号', trigger: 'blur' }],
  maintenanceType: [{ required: true, message: '请选择保养类型', trigger: 'change' }],
  maintenanceContent: [{ required: true, message: '请至少选择一项保养内容', trigger: 'change', type: 'array' }],
  applicantName: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
  applicantPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  applyDate: [{ required: true, message: '请选择申请日期', trigger: 'change' }],
  maintenanceMethod: [{ required: true, message: '请选择保养方式', trigger: 'change' }],
  maintenanceUnit: [{ required: true, message: '请输入保养单位', trigger: 'blur' }],
  planStartDate: [{ required: true, message: '请选择计划开始日期', trigger: 'change' }],
  planEndDate: [{ required: true, message: '请选择计划完成日期', trigger: 'change' }],
};

const disabledDate = (date) => {
  return date < new Date();
};

const disabledEndDate = (date) => {
  if (!formData.value.planStartDate) {
    return date < new Date();
  }
  return date < new Date(formData.value.planStartDate);
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

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
