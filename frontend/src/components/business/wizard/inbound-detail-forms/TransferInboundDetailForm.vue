<template>
  <el-form ref="formRef" :model="modelValue" :rules="formRules" label-width="120px" class="detail-form">
    <div class="form-section">
      <div class="section-title">
        <el-icon><Sort /></el-icon>
        <span>调拨信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="原调拨单号" prop="originalTransferNo">
            <el-input v-model="modelValue.originalTransferNo" placeholder="请输入原调拨单号">
              <template #prefix>
                <el-icon><Tickets /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调拨日期" prop="transferDate">
            <el-date-picker
              v-model="modelValue.transferDate"
              type="date"
              placeholder="选择调拨日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="调拨类型" prop="transferType">
            <el-select v-model="modelValue.transferType" placeholder="请选择调拨类型" style="width: 100%">
              <el-option label="正常调拨" value="normal" />
              <el-option label="紧急调拨" value="emergency" />
              <el-option label="借调归还" value="borrow_return" />
              <el-option label="跨公司调拨" value="cross_company" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调拨优先级" prop="priority">
            <el-select v-model="modelValue.priority" placeholder="请选择优先级" style="width: 100%">
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
        <el-icon><OfficeBuilding /></el-icon>
        <span>源仓库信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="源仓库" prop="sourceWarehouseId">
            <el-select
              v-model="modelValue.sourceWarehouseId"
              placeholder="请选择源仓库"
              style="width: 100%"
              filterable
              disabled
            >
              <el-option v-for="wh in warehouseList" :key="wh.id" :label="wh.name" :value="wh.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="源仓库地址" prop="sourceWarehouseAddress">
            <el-input v-model="modelValue.sourceWarehouseAddress" placeholder="源仓库地址" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="发货人" prop="senderName">
            <el-input v-model="modelValue.senderName" placeholder="请输入发货人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发货人电话" prop="senderPhone">
            <el-input v-model="modelValue.senderPhone" placeholder="请输入发货人电话">
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Location /></el-icon>
        <span>调拨原因</span>
      </div>
      <el-form-item label="调拨原因" prop="transferReason">
        <el-input
          v-model="modelValue.transferReason"
          type="textarea"
          :rows="4"
          placeholder="请详细描述调拨原因"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="设备状态" prop="deviceStatus">
            <el-select v-model="modelValue.deviceStatus" placeholder="请选择设备状态" style="width: 100%">
              <el-option label="完好无损" value="good" />
              <el-option label="轻微损坏" value="minor_damage" />
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
        <el-icon><Van /></el-icon>
        <span>物流信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="运输方式" prop="transportMethod">
            <el-select v-model="modelValue.transportMethod" placeholder="请选择运输方式" style="width: 100%">
              <el-option label="自提" value="self_pickup" />
              <el-option label="快递" value="express" />
              <el-option label="物流" value="logistics" />
              <el-option label="专车配送" value="dedicated" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物流单号" prop="trackingNo">
            <el-input v-model="modelValue.trackingNo" placeholder="请输入物流单号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="运输费用" prop="transportCost">
            <el-input-number
              v-model="modelValue.transportCost"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入运输费用"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="费用承担方" prop="costBearer">
            <el-select v-model="modelValue.costBearer" placeholder="请选择费用承担方" style="width: 100%">
              <el-option label="源仓库承担" value="source" />
              <el-option label="目标仓库承担" value="target" />
              <el-option label="公司统一承担" value="company" />
            </el-select>
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
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { Sort, Tickets, OfficeBuilding, Location, Phone, Van, Edit } from '@element-plus/icons-vue';
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  warehouseList: {
    type: Array,
    default: () => [],
  },
  sourceWarehouseId: {
    type: [String, Number],
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const formRef = ref(null);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

watch(
  () => props.sourceWarehouseId,
  (newVal) => {
    if (newVal) {
      modelValue.value.sourceWarehouseId = newVal;
      const warehouse = props.warehouseList.find((w) => w.id === newVal);
      if (warehouse) {
        modelValue.value.sourceWarehouseAddress = warehouse.address || '';
      }
    }
  },
  { immediate: true }
);

const formRules = {
  originalTransferNo: [{ required: true, message: '请输入原调拨单号', trigger: 'blur' }],
  transferDate: [{ required: true, message: '请选择调拨日期', trigger: 'change' }],
  transferType: [{ required: true, message: '请选择调拨类型', trigger: 'change' }],
  transferReason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }],
  senderName: [{ required: true, message: '请输入发货人姓名', trigger: 'blur' }],
  senderPhone: [
    { required: true, message: '请输入发货人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  transportMethod: [{ required: true, message: '请选择运输方式', trigger: 'change' }],
  transportCost: [{ type: 'number', min: 0, message: '运输费用不能为负数', trigger: 'blur' }],
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
