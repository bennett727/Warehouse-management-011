<!--
  @file: ScrapDetailForm.vue
  @description: 报废出库详细信息表单
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
      <el-icon><Delete /></el-icon> 报废信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="报废单号" prop="scrapNo">
          <el-input v-model="formData.scrapNo" placeholder="请输入报废单号">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="报废类型" prop="scrapType">
          <el-select v-model="formData.scrapType" placeholder="请选择报废类型" style="width: 100%">
            <el-option label="正常报废" value="normal" />
            <el-option label="意外损坏" value="damage" />
            <el-option label="技术淘汰" value="obsolete" />
            <el-option label="过期报废" value="expired" />
            <el-option label="其他原因" value="other" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="报废原因" prop="scrapReason">
      <el-input
        v-model="formData.scrapReason"
        type="textarea"
        :rows="3"
        placeholder="请详细说明设备报废的具体原因"
        maxlength="1000"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="技术鉴定" prop="technicalAppraisal">
      <el-input
        v-model="formData.technicalAppraisal"
        type="textarea"
        :rows="2"
        placeholder="请描述技术鉴定结果"
        maxlength="500"
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
      <el-icon><Money /></el-icon> 资产信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="资产原值" prop="originalValue">
          <el-input-number
            v-model="formData.originalValue"
            :precision="2"
            :min="0"
            :max="999999999"
            style="width: 100%"
          >
            <template #suffix>元</template>
          </el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="残值评估" prop="residualValue">
          <el-input-number
            v-model="formData.residualValue"
            :precision="2"
            :min="0"
            :max="999999999"
            style="width: 100%"
          >
            <template #suffix>元</template>
          </el-input-number>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="使用年限" prop="serviceLife">
          <el-input v-model="formData.serviceLife" placeholder="请输入已使用年限">
            <template #suffix>年</template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="折旧金额" prop="depreciationAmount">
          <el-input-number
            v-model="formData.depreciationAmount"
            :precision="2"
            :min="0"
            :max="999999999"
            style="width: 100%"
          >
            <template #suffix>元</template>
          </el-input-number>
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <el-icon><Box /></el-icon> 处理方式
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="处理方式" prop="disposalMethod">
          <el-select v-model="formData.disposalMethod" placeholder="请选择处理方式" style="width: 100%">
            <el-option label="回收处理" value="recycle" />
            <el-option label="销毁处理" value="destroy" />
            <el-option label="拍卖处理" value="auction" />
            <el-option label="捐赠处理" value="donate" />
            <el-option label="其他方式" value="other" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="处理单位" prop="disposalUnit">
          <el-input v-model="formData.disposalUnit" placeholder="请输入处理单位名称" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="环保要求" prop="environmentalRequirements">
      <el-input
        v-model="formData.environmentalRequirements"
        type="textarea"
        :rows="2"
        placeholder="请说明报废设备处理的环保要求"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><Stamp /></el-icon> 审批信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="技术审核人" prop="technicalAuditor">
          <el-input v-model="formData.technicalAuditor" placeholder="请输入技术审核人" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="财务审核人" prop="financialAuditor">
          <el-input v-model="formData.financialAuditor" placeholder="请输入财务审核人" />
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
import { Box, Delete, Document, Money, Phone, Stamp, User } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      scrapNo: '',
      scrapType: '',
      scrapReason: '',
      technicalAppraisal: '',
      applicantName: '',
      applicantDept: '',
      applicantPhone: '',
      applyDate: '',
      originalValue: 0,
      residualValue: 0,
      serviceLife: '',
      depreciationAmount: 0,
      disposalMethod: '',
      disposalUnit: '',
      environmentalRequirements: '',
      technicalAuditor: '',
      financialAuditor: '',
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
  scrapNo: [{ required: true, message: '请输入报废单号', trigger: 'blur' }],
  scrapType: [{ required: true, message: '请选择报废类型', trigger: 'change' }],
  scrapReason: [{ required: true, message: '请输入报废原因', trigger: 'blur' }],
  applicantName: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
  applicantPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  applyDate: [{ required: true, message: '请选择申请日期', trigger: 'change' }],
  disposalMethod: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
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
