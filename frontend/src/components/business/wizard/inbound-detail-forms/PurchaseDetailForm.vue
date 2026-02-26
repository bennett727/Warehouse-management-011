<template>
  <el-form ref="formRef" :model="modelValue" :rules="formRules" label-width="120px" class="detail-form" data-cy="purchase-detail-form">
    <div class="form-section">
      <div class="section-title">
        <el-icon><ShoppingCart /></el-icon>
        <span>采购信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="采购单号" prop="purchaseOrderNo" data-cy="purchase-order-no">
            <el-input v-model="modelValue.purchaseOrderNo" placeholder="请输入采购单号" data-cy="purchase-order-no-input">
              <template #prefix>
                <el-icon><Tickets /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购日期" prop="purchaseDate" data-cy="purchase-date">
            <el-date-picker
              v-model="modelValue.purchaseDate"
              type="date"
              placeholder="选择采购日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              data-cy="purchase-date-picker"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="采购类型" prop="purchaseType" data-cy="purchase-type">
            <el-select v-model="modelValue.purchaseType" placeholder="请选择采购类型" style="width: 100%" data-cy="purchase-type-select">
              <el-option label="常规采购" value="normal" data-cy="purchase-type-normal" />
              <el-option label="紧急采购" value="urgent" data-cy="purchase-type-urgent" />
              <el-option label="补充采购" value="supplementary" data-cy="purchase-type-supplementary" />
              <el-option label="项目采购" value="project" data-cy="purchase-type-project" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购部门" prop="purchaseDepartment" data-cy="purchase-department">
            <el-input v-model="modelValue.purchaseDepartment" placeholder="请输入采购部门" data-cy="purchase-department-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><User /></el-icon>
        <span>供应商信息</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplierId" data-cy="purchase-supplier">
            <el-select
              v-model="modelValue.supplierId"
              placeholder="请选择供应商"
              style="width: 100%"
              filterable
              @change="handleSupplierChange"
              data-cy="purchase-supplier-select"
            >
              <el-option
                v-for="supplier in supplierList"
                :key="supplier.id"
                :label="supplier.name"
                :value="supplier.id"
              >
                <span>{{ supplier.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 12px">
                  {{ supplier.code }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商联系人" prop="supplierContact" data-cy="purchase-supplier-contact">
            <el-input v-model="modelValue.supplierContact" placeholder="请输入联系人姓名" data-cy="purchase-supplier-contact-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="supplierPhone" data-cy="purchase-supplier-phone">
            <el-input v-model="modelValue.supplierPhone" placeholder="请输入联系电话" data-cy="purchase-supplier-phone-input">
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商地址" prop="supplierAddress" data-cy="purchase-supplier-address">
            <el-input v-model="modelValue.supplierAddress" placeholder="请输入供应商地址" data-cy="purchase-supplier-address-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>发票与合同</span>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="合同编号" prop="contractNo" data-cy="purchase-contract-no">
            <el-input v-model="modelValue.contractNo" placeholder="请输入合同编号" data-cy="purchase-contract-no-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票号码" prop="invoiceNo" data-cy="purchase-invoice-no">
            <el-input v-model="modelValue.invoiceNo" placeholder="请输入发票号码" data-cy="purchase-invoice-no-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="发票类型" prop="invoiceType" data-cy="purchase-invoice-type">
            <el-select v-model="modelValue.invoiceType" placeholder="请选择发票类型" style="width: 100%" data-cy="purchase-invoice-type-select">
              <el-option label="增值税专用发票" value="vat_special" data-cy="purchase-invoice-vat-special" />
              <el-option label="增值税普通发票" value="vat_normal" data-cy="purchase-invoice-vat-normal" />
              <el-option label="电子发票" value="electronic" data-cy="purchase-invoice-electronic" />
              <el-option label="其他" value="other" data-cy="purchase-invoice-other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票金额" prop="invoiceAmount" data-cy="purchase-invoice-amount">
            <el-input-number
              v-model="modelValue.invoiceAmount"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入发票金额"
              style="width: 100%"
              data-cy="purchase-invoice-amount-input"
            />
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
          <el-form-item label="运输方式" prop="transportMethod" data-cy="purchase-transport-method">
            <el-select v-model="modelValue.transportMethod" placeholder="请选择运输方式" style="width: 100%" data-cy="purchase-transport-method-select">
              <el-option label="快递" value="express" data-cy="purchase-transport-express" />
              <el-option label="物流" value="logistics" data-cy="purchase-transport-logistics" />
              <el-option label="自提" value="self_pickup" data-cy="purchase-transport-self" />
              <el-option label="专车配送" value="dedicated" data-cy="purchase-transport-dedicated" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物流单号" prop="trackingNo" data-cy="purchase-tracking-no">
            <el-input v-model="modelValue.trackingNo" placeholder="请输入物流单号" data-cy="purchase-tracking-no-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="预计到货日期" prop="expectedArrivalDate" data-cy="purchase-expected-arrival">
            <el-date-picker
              v-model="modelValue.expectedArrivalDate"
              type="date"
              placeholder="选择预计到货日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              data-cy="purchase-expected-arrival-picker"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收货人" prop="receiverName" data-cy="purchase-receiver-name">
            <el-input v-model="modelValue.receiverName" placeholder="请输入收货人姓名" data-cy="purchase-receiver-name-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section">
      <div class="section-title">
        <el-icon><Edit /></el-icon>
        <span>其他信息</span>
      </div>
      <el-form-item label="备注" prop="remark" data-cy="purchase-remark">
        <el-input
          v-model="modelValue.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（选填）"
          maxlength="500"
          show-word-limit
          data-cy="purchase-remark-input"
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { ShoppingCart, Tickets, User, Phone, Document, Van, Edit } from '@element-plus/icons-vue';
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  supplierList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const formRef = ref(null);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRules = {
  purchaseOrderNo: [{ required: true, message: '请输入采购单号', trigger: 'blur' }],
  purchaseDate: [{ required: true, message: '请选择采购日期', trigger: 'change' }],
  purchaseType: [{ required: true, message: '请选择采购类型', trigger: 'change' }],
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  supplierPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  invoiceAmount: [{ type: 'number', min: 0, message: '发票金额不能为负数', trigger: 'blur' }],
};

const handleSupplierChange = (supplierId) => {
  const supplier = props.supplierList.find((s) => s.id === supplierId);
  if (supplier) {
    modelValue.value.supplierContact = supplier.contactPerson || '';
    modelValue.value.supplierPhone = supplier.contactPhone || '';
    modelValue.value.supplierAddress = supplier.address || '';
  }
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
