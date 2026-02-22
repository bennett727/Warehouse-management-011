<!--
  @file: TransferDetailForm.vue
  @description: 调拨出库详细信息表单
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
      <el-icon><Sort /></el-icon> 调拨信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="目标仓库" prop="targetWarehouseId">
          <el-select v-model="formData.targetWarehouseId" placeholder="请选择目标仓库" style="width: 100%" filterable>
            <el-option v-for="wh in filteredWarehouseList" :key="wh.id" :label="wh.name" :value="wh.id">
              <span>{{ wh.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">
                {{ wh.code }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="调拨类型" prop="transferType">
          <el-select v-model="formData.transferType" placeholder="请选择调拨类型" style="width: 100%">
            <el-option label="正常调拨" value="normal" />
            <el-option label="紧急调拨" value="emergency" />
            <el-option label="借调" value="borrow" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="调拨原因" prop="transferReason">
      <el-input
        v-model="formData.transferReason"
        type="textarea"
        :rows="3"
        placeholder="请输入调拨原因"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><User /></el-icon> 接收信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="接收人" prop="receiverName">
          <el-input v-model="formData.receiverName" placeholder="请输入接收人姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系电话" prop="receiverPhone">
          <el-input v-model="formData.receiverPhone" placeholder="请输入接收人联系电话">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="接收地址" prop="receiverAddress">
      <el-input v-model="formData.receiverAddress" placeholder="请输入接收地址">
        <template #prefix>
          <el-icon><Location /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><Calendar /></el-icon> 时间安排
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="要求日期" prop="requiredDate">
          <el-date-picker
            v-model="formData.requiredDate"
            type="date"
            placeholder="选择要求完成日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="运输方式" prop="transportMethod">
          <el-select v-model="formData.transportMethod" placeholder="请选择运输方式" style="width: 100%">
            <el-option label="自提" value="self_pickup" />
            <el-option label="快递" value="express" />
            <el-option label="物流" value="logistics" />
            <el-option label="专车" value="dedicated" />
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
        maxlength="300"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="附件上传" prop="attachments">
      <el-upload
        v-model:file-list="formData.attachments"
        action="#"
        :auto-upload="false"
        :limit="5"
        accept=".pdf,.doc,.docx,.jpg,.png"
        list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
        <template #tip>
          <div class="upload-tip">支持 PDF、Word、图片格式，最多上传5个文件</div>
        </template>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { Calendar, Location, Phone, Plus, Sort, User } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

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
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref(null);

const filteredWarehouseList = computed(() => {
  if (!props.sourceWarehouseId) {
    return props.warehouseList;
  }
  return props.warehouseList.filter((wh) => wh.id !== props.sourceWarehouseId);
});

const rules = {
  targetWarehouseId: [{ required: true, message: '请选择目标仓库', trigger: 'change' }],
  transferType: [{ required: true, message: '请选择调拨类型', trigger: 'change' }],
  transferReason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }],
  receiverName: [{ required: true, message: '请输入接收人姓名', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入接收人联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  requiredDate: [{ required: true, message: '请选择要求完成日期', trigger: 'change' }],
};

const disabledDate = (date) => {
  return date < new Date(new Date().setHours(0, 0, 0, 0));
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
  padding: 20px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
