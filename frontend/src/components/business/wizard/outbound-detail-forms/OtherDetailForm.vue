<!--
  @file: OtherDetailForm.vue
  @description: 其他出库详细信息表单
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
    data-cy="other-detail-form"
  >
    <el-divider content-position="left">
      <el-icon><MoreFilled /></el-icon> 出库信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="出库用途" prop="usage" data-cy="other-usage">
          <el-select v-model="formData.usage" placeholder="请选择出库用途" style="width: 100%" data-cy="other-usage-select">
            <el-option label="借用" value="borrow" data-cy="other-usage-borrow" />
            <el-option label="试用" value="trial" data-cy="other-usage-trial" />
            <el-option label="展示" value="display" data-cy="other-usage-display" />
            <el-option label="测试" value="test" data-cy="other-usage-test" />
            <el-option label="其他" value="other" data-cy="other-usage-other" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="预计归还" prop="expectedReturnDate" data-cy="other-return-date">
          <el-date-picker
            v-model="formData.expectedReturnDate"
            type="date"
            placeholder="选择预计归还日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
            data-cy="other-return-date-picker"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="详细说明" prop="description" data-cy="other-description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="4"
        placeholder="请详细说明出库原因和用途"
        maxlength="1000"
        show-word-limit
        data-cy="other-description-input"
      />
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><User /></el-icon> 联系信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="经办人" prop="handler" data-cy="other-handler">
          <el-input v-model="formData.handler" placeholder="请输入经办人姓名" data-cy="other-handler-input" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系电话" prop="handlerPhone" data-cy="other-handler-phone">
          <el-input v-model="formData.handlerPhone" placeholder="请输入联系电话" data-cy="other-handler-phone-input">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="收货地址" prop="deliveryAddress" data-cy="other-delivery-address">
      <el-input v-model="formData.deliveryAddress" placeholder="请输入收货地址（选填）" data-cy="other-delivery-address-input">
        <template #prefix>
          <el-icon><Location /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-divider content-position="left">
      <el-icon><Van /></el-icon> 物流信息
    </el-divider>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="配送方式" prop="shippingMethod" data-cy="other-shipping-method">
          <el-select v-model="formData.shippingMethod" placeholder="请选择配送方式" style="width: 100%" data-cy="other-shipping-method-select">
            <el-option label="自提" value="self_pickup" data-cy="other-shipping-self" />
            <el-option label="快递配送" value="express" data-cy="other-shipping-express" />
            <el-option label="专车配送" value="dedicated" data-cy="other-shipping-dedicated" />
            <el-option label="物流运输" value="logistics" data-cy="other-shipping-logistics" />
          </el-select>
        </el-form-item>
      </el-col>
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
    </el-row>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="2"
        placeholder="请输入备注信息（选填）"
        maxlength="300"
        show-word-limit
        data-cy="other-remark-input"
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
import { Location, MoreFilled, Phone, Plus, User, Van } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref(null);

const rules = {
  usage: [{ required: true, message: '请选择出库用途', trigger: 'change' }],
  description: [{ required: true, message: '请输入详细说明', trigger: 'blur' }],
  handler: [{ required: true, message: '请输入经办人姓名', trigger: 'blur' }],
  handlerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
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

<style scoped lang="scss">
.detail-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
