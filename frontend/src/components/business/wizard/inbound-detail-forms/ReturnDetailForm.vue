<template>
  <el-form ref="formRef" :model="modelValue" :rules="formRules" label-width="120px" class="detail-form" data-cy="return-detail-form">
    <div class="form-section">
      <div class="section-title">
        <el-icon><RefreshLeft /></el-icon>
        <span>退货信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="原出库单号" prop="originalOutboundNo" data-cy="return-original-outbound-no-form-item">
            <el-input v-model="modelValue.originalOutboundNo" placeholder="请输入原出库单号" data-cy="return-original-outbound-no-input">
              <template #prefix>
                <el-icon><Tickets /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退货日期" prop="returnDate">
            <el-date-picker
              v-model="modelValue.returnDate"
              type="date"
              placeholder="选择退货日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="退货类型" prop="returnType">
            <el-select v-model="modelValue.returnType" placeholder="请选择退货类型" style="width: 100%" data-cy="return-model-value.return-type-select">
              <el-option label="质量问题退货" value="quality" />
              <el-option label="规格不符退货" value="specification" />
              <el-option label="数量错误退货" value="quantity" />
              <el-option label="客户拒收退货" value="rejection" />
              <el-option label="其他原因退货" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退货优先级" prop="priority">
            <el-select v-model="modelValue.priority" placeholder="请选择优先级" style="width: 100%" data-cy="return-model-value.priority-select">
              <el-option label="高" value="high">
                <el-tag type="danger" size="small">高</el-tag>
              </el-option>
              <el-option label="中" value="medium">
                <el-tag type="warning" size="small">中</el-tag>
              </el-option>
              <el-option label="低" value="low">
                <el-tag type="info" size="small">低</el-tag>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Warning /></el-icon>
        <span>退货原因</span>
      </div>
      <el-form-item label="退货原因" prop="returnReason" data-cy="return-reason-form-item">
        <el-input
          v-model="modelValue.returnReason"
          type="textarea"
          :rows="4"
          placeholder="请详细描述退货原因"
          maxlength="1000"
          show-word-limit
          data-cy="return-reason-input"
        />
      </el-form-item>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="设备状态" prop="deviceStatus">
            <el-select v-model="modelValue.deviceStatus" placeholder="请选择设备状态" style="width: 100%" data-cy="return-model-value.device-status-select">
              <el-option label="完好无损" value="good" />
              <el-option label="轻微损坏" value="minor_damage" />
              <el-option label="严重损坏" value="major_damage" />
              <el-option label="需要维修" value="needs_repair" />
              <el-option label="无法使用" value="unusable" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否需要检测" prop="needsInspection">
            <el-radio-group v-model="modelValue.needsInspection">
              <el-radio :value="true">需要检测</el-radio>
              <el-radio :value="false">无需检测</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><User /></el-icon>
        <span>客户信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="modelValue.customerName" placeholder="请输入客户名称" data-cy="return-customer-name-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="modelValue.contactPerson" placeholder="请输入联系人" data-cy="return-contact-person-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="modelValue.contactPhone" placeholder="请输入联系电话" data-cy="return-contact-phone-input">
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户地址" prop="customerAddress">
            <el-input v-model="modelValue.customerAddress" placeholder="请输入客户地址" data-cy="return-customer-address-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Money /></el-icon>
        <span>退款信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="是否退款" prop="isRefund">
            <el-radio-group v-model="modelValue.isRefund">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="modelValue.isRefund">
          <el-form-item label="退款金额" prop="refundAmount">
            <el-input-number
              v-model="modelValue.refundAmount"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入退款金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24" v-if="modelValue.isRefund">
        <el-col :span="12">
          <el-form-item label="退款方式" prop="refundMethod">
            <el-select v-model="modelValue.refundMethod" placeholder="请选择退款方式" style="width: 100%" data-cy="return-model-value.refund-method-select">
              <el-option label="原路退回" value="original" />
              <el-option label="银行转账" value="bank_transfer" />
              <el-option label="现金退款" value="cash" />
              <el-option label="账户余额" value="balance" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退款账户" prop="refundAccount" data-cy="return-refund-account-form-item">
            <el-input v-model="modelValue.refundAccount" placeholder="请输入退款账户" data-cy="return-refund-account-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Edit /></el-icon>
        <span>处理意见</span>
      </div>
      <el-form-item label="处理意见" prop="handlingOpinion" data-cy="return-handling-opinion-form-item">
        <el-input
          v-model="modelValue.handlingOpinion"
          type="textarea"
          :rows="3"
          placeholder="请输入处理意见（选填）"
          maxlength="500"
          show-word-limit
          data-cy="return-handling-opinion-input"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark" data-cy="return-remark-form-item">
        <el-input
          v-model="modelValue.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（选填）"
          maxlength="300"
          show-word-limit
          data-cy="return-remark-input"
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { RefreshLeft, Tickets, Warning, User, Phone, Money, Edit } from '@element-plus/icons-vue';
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const formRef = ref(null);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRules = {
  originalOutboundNo: [{ required: true, message: '请输入原出库单号', trigger: 'blur' }],
  returnDate: [{ required: true, message: '请选择退货日期', trigger: 'change' }],
  returnType: [{ required: true, message: '请选择退货类型', trigger: 'change' }],
  returnReason: [{ required: true, message: '请输入退货原因', trigger: 'blur' }],
  deviceStatus: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  contactPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  refundAmount: [{ type: 'number', min: 0, message: '退款金额不能为负数', trigger: 'blur' }],
};

const validate = async () => {
  return await formRef.value?.validate().catch(() => false);
};

const resetFields = () => {
  formRef.value?.resetFields();
};

defineExpose({
  validate,
  resetFields,
});
</script>

<style scoped>
.detail-form {
  padding: 0 20px;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--el-border-color-light);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.section-title .el-icon {
  color: var(--el-color-primary);
}
</style>
