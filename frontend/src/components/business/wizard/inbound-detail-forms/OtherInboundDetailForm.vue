<template>
  <el-form ref="formRef" :model="modelValue" :rules="formRules" label-width="120px" class="detail-form" data-cy="other-inbound-detail-form">
    <div class="form-section">
      <div class="section-title">
        <el-icon><MoreFilled /></el-icon>
        <span>入库信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="入库日期" prop="inboundDate" data-cy="other-inbound-date-form-item">
            <el-date-picker
              v-model="modelValue.inboundDate"
              type="date"
              placeholder="选择入库日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              data-cy="other-inbound-date-picker"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入库来源" prop="inboundSource" data-cy="other-inbound-source-form-item">
            <el-select v-model="modelValue.inboundSource" placeholder="请选择入库来源" style="width: 100%" data-cy="other-inbound-source-select">
              <el-option label="捐赠" value="donation" />
              <el-option label="借用归还" value="borrow_return" />
              <el-option label="样品入库" value="sample" />
              <el-option label="盘盈" value="inventory_gain" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="入库优先级" prop="priority" data-cy="other-inbound-priority-form-item">
            <el-select v-model="modelValue.priority" placeholder="请选择优先级" style="width: 100%" data-cy="other-inbound-priority-select">
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
        <el-col :span="12">
          <el-form-item label="关联单号" prop="relatedOrderNo" data-cy="other-inbound-related-no-form-item">
            <el-input v-model="modelValue.relatedOrderNo" placeholder="请输入关联单号（如有）" data-cy="other-inbound-related-no-input">
              <template #prefix>
                <el-icon><Tickets /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>详细说明</span>
      </div>
      <el-form-item label="入库说明" prop="description">
        <el-input
          v-model="modelValue.description"
          type="textarea"
          :rows="4"
          placeholder="请详细描述入库原因和设备情况"
          maxlength="1000"
          show-word-limit
          data-cy="other-inbound-description-input"
        />
      </el-form-item>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="设备状态" prop="deviceStatus">
            <el-select v-model="modelValue.deviceStatus" placeholder="请选择设备状态" style="width: 100%" data-cy="other-inbound-device-status-select">
              <el-option label="全新" value="new" />
              <el-option label="完好" value="good" />
              <el-option label="轻微磨损" value="minor_wear" />
              <el-option label="需要检测" value="needs_inspection" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否需要验收" prop="needsInspection">
            <el-radio-group v-model="modelValue.needsInspection">
              <el-radio :value="true">需要验收</el-radio>
              <el-radio :value="false">无需验收</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><User /></el-icon>
        <span>来源信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="来源方" prop="sourceName">
            <el-input v-model="modelValue.sourceName" placeholder="请输入来源方名称" data-cy="other-inbound-source-name-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="modelValue.contactPerson" placeholder="请输入联系人" data-cy="other-inbound-contact-person-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="modelValue.contactPhone" placeholder="请输入联系电话" data-cy="other-inbound-contact-phone-input">
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="来源地址" prop="sourceAddress">
            <el-input v-model="modelValue.sourceAddress" placeholder="请输入来源地址" data-cy="other-inbound-source-address-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Money /></el-icon>
        <span>价值信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="是否计价" prop="hasValue">
            <el-radio-group v-model="modelValue.hasValue">
              <el-radio :value="true">计价入库</el-radio>
              <el-radio :value="false">无价入库</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="modelValue.hasValue">
          <el-form-item label="总价值" prop="totalValue">
            <el-input-number
              v-model="modelValue.totalValue"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入总价值"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24" v-if="modelValue.hasValue">
        <el-col :span="12">
          <el-form-item label="价值类型" prop="valueType">
            <el-select v-model="modelValue.valueType" placeholder="请选择价值类型" style="width: 100%" data-cy="other-inbound-value-type-select">
              <el-option label="市场价" value="market" />
              <el-option label="评估价" value="appraisal" />
              <el-option label="账面价" value="book" />
              <el-option label="协议价" value="agreement" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="评估人" prop="appraiser">
            <el-input v-model="modelValue.appraiser" placeholder="请输入评估人" data-cy="other-inbound-appraiser-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Edit /></el-icon>
        <span>其他信息</span>
      </div>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="modelValue.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（选填）"
          maxlength="500"
          show-word-limit
          data-cy="other-inbound-remark-input"
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { MoreFilled, Tickets, Document, User, Phone, Money, Edit } from '@element-plus/icons-vue';
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
  inboundDate: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  inboundSource: [{ required: true, message: '请选择入库来源', trigger: 'change' }],
  description: [{ required: true, message: '请输入入库说明', trigger: 'blur' }],
  sourceName: [{ required: true, message: '请输入来源方名称', trigger: 'blur' }],
  contactPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  totalValue: [{ type: 'number', min: 0, message: '总价值不能为负数', trigger: 'blur' }],
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
