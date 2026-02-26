<!--
  @file: DeviceDetailInputDialog.vue
  @description: 设备详情录入对话框 - 二次弹窗，用于录入所选设备的详细信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="录入设备出库详情"
    width="1000px"
    top="5vh"
    destroy-on-close
    :close-on-click-modal="false"
    class="device-detail-input-dialog"
    data-cy="device-detail-input-dialog"
  >
    <div class="dialog-description" data-cy="device-detail-input-description">
      <el-alert
        :title="`已为 ${devices.length} 个设备创建出库记录，请填写每个设备的详细信息`"
        type="info"
        :closable="false"
        show-icon
        data-cy="device-detail-input-alert"
      />
    </div>

    <!-- 设备详情表单列表 -->
    <el-scrollbar height="500px" class="forms-container" data-cy="device-detail-input-scrollbar">
      <div
        v-for="(item, index) in formItems"
        :key="item.deviceId"
        class="device-form-card"
        :class="{ 'is-active': currentIndex === index }"
      >
        <div class="card-header" @click="currentIndex = index">
          <div class="device-info">
            <el-tag type="primary" size="small">{{ index + 1 }}</el-tag>
            <span class="device-name">{{ item.deviceName }}</span>
            <span class="device-code">({{ item.deviceCode }})</span>
          </div>
          <div class="header-actions">
            <el-tag :type="isItemValid(index) ? 'success' : 'warning'" size="small" effect="plain">
              {{ isItemValid(index) ? '已完善' : '待完善' }}
            </el-tag>
            <el-icon class="expand-icon" :class="{ 'is-expanded': currentIndex === index }">
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <el-collapse-transition>
          <div v-show="currentIndex === index" class="card-body">
            <el-form
              :ref="(el) => setFormRef(el, index)"
              :model="item"
              :rules="getItemRules(item)"
              label-width="120px"
              class="device-form"
              :data-cy="`device-detail-form-${index}`"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="出库数量" prop="quantity" :data-cy="`device-detail-quantity-form-item-${index}`">
                    <el-input-number
                      v-model="item.quantity"
                      :min="1"
                      :max="item.availableStock || 9999"
                      :precision="0"
                      style="width: 100%"
                      :data-cy="`device-detail-quantity-input-${index}`"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="货位" prop="binId" :data-cy="`device-detail-bin-form-item-${index}`">
                    <el-select v-model="item.binId" placeholder="选择货位" filterable style="width: 100%" :data-cy="`device-detail-bin-select-${index}`">
                      <el-option v-for="bin in binOptions" :key="bin.id" :label="bin.code" :value="bin.id" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 安装出库特有字段 -->
              <template v-if="outboundType === 1">
                <el-divider content-position="left">
                  <el-icon><Monitor /></el-icon> 安装信息
                </el-divider>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="安装地址" prop="installProvinceId" required :data-cy="`device-detail-address-form-item-${index}`">
                      <AddressSelector
                        v-model:province="item.installProvinceId"
                        v-model:city="item.installCityId"
                        v-model:district="item.installDistrictId"
                        v-model:detail="item.installDetailAddress"
                        @change="(data) => handleAddressChange(index, data)"
                        :data-cy="`device-detail-address-selector-${index}`"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="安装日期" prop="installationDate" :data-cy="`device-detail-install-date-form-item-${index}`">
                      <el-date-picker
                        v-model="item.installationDate"
                        type="date"
                        placeholder="选择日期"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                        :data-cy="`device-detail-install-date-picker-${index}`"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="安装人员" prop="installerName" :data-cy="`device-detail-installer-form-item-${index}`">
                      <el-input v-model="item.installerName" placeholder="请输入安装人员" :data-cy="`device-detail-installer-input-${index}`" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="保修期(月)" prop="warrantyPeriod" :data-cy="`device-detail-warranty-form-item-${index}`">
                      <el-input-number v-model="item.warrantyPeriod" :min="0" :max="120" style="width: 100%" :data-cy="`device-detail-warranty-input-${index}`" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>

              <!-- 维修出库特有字段 -->
              <template v-if="outboundType === 2">
                <el-divider content-position="left">
                  <el-icon><Tools /></el-icon> 维修信息
                </el-divider>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="故障描述" prop="faultDescription" :data-cy="`device-detail-fault-form-item-${index}`">
                      <el-input
                        v-model="item.faultDescription"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入故障描述"
                        :data-cy="`device-detail-fault-input-${index}`"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="维修地点" prop="repairLocation" :data-cy="`device-detail-repair-location-form-item-${index}`">
                      <el-input v-model="item.repairLocation" placeholder="请输入维修地点" :data-cy="`device-detail-repair-location-input-${index}`" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="维修人员" prop="repairPerson" :data-cy="`device-detail-repair-person-form-item-${index}`">
                      <el-input v-model="item.repairPerson" placeholder="请输入维修人员" :data-cy="`device-detail-repair-person-input-${index}`" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="预计完成日期" prop="estimatedCompleteDate" :data-cy="`device-detail-estimated-date-form-item-${index}`">
                      <el-date-picker
                        v-model="item.estimatedCompleteDate"
                        type="date"
                        placeholder="选择日期"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                        :data-cy="`device-detail-estimated-date-picker-${index}`"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>

              <!-- 报废出库特有字段 -->
              <template v-if="outboundType === 3">
                <el-divider content-position="left">
                  <el-icon><Delete /></el-icon> 报废信息
                </el-divider>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="报废原因" prop="scrapReason" :data-cy="`device-detail-scrap-reason-form-item-${index}`">
                      <el-select v-model="item.scrapReason" placeholder="选择报废原因" style="width: 100%" :data-cy="`device-detail-scrap-reason-select-${index}`">
                        <el-option label="设备老化" value="AGING" :data-cy="`device-detail-scrap-option-aging-${index}`" />
                        <el-option label="损坏无法修复" value="UNREPAIRABLE" :data-cy="`device-detail-scrap-option-unrepairable-${index}`" />
                        <el-option label="技术淘汰" value="OBSOLETE" :data-cy="`device-detail-scrap-option-obsolete-${index}`" />
                        <el-option label="其他原因" value="OTHER" :data-cy="`device-detail-scrap-option-other-${index}`" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="残值评估" prop="residualValue" :data-cy="`device-detail-residual-value-form-item-${index}`">
                      <el-input-number v-model="item.residualValue" :min="0" :precision="2" style="width: 100%" :data-cy="`device-detail-residual-value-input-${index}`" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>

              <!-- 通用字段 -->
              <el-form-item label="出库原因" prop="outboundReason" :data-cy="`device-detail-outbound-reason-form-item-${index}`">
                <el-input v-model="item.outboundReason" type="textarea" :rows="2" placeholder="请输入出库原因" :data-cy="`device-detail-outbound-reason-input-${index}`" />
              </el-form-item>

              <el-form-item label="备注" prop="remark" :data-cy="`device-detail-remark-form-item-${index}`">
                <el-input
                  v-model="item.remark"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注信息"
                  maxlength="500"
                  show-word-limit
                  :data-cy="`device-detail-remark-input-${index}`"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
      </div>
    </el-scrollbar>

    <!-- 快速导航 -->
    <div class="quick-nav" data-cy="device-detail-input-quick-nav">
      <span class="nav-label">快速跳转:</span>
      <el-button-group>
        <el-button
          v-for="(item, index) in formItems"
          :key="index"
          :type="currentIndex === index ? 'primary' : 'default'"
          size="small"
          @click="currentIndex = index"
          :data-cy="`device-detail-input-nav-btn-${index}`"
        >
          {{ index + 1 }}
        </el-button>
      </el-button-group>
    </div>

    <template #footer>
      <div class="dialog-footer" data-cy="device-detail-input-footer">
        <el-button @click="handleCancel" data-cy="device-detail-input-cancel-btn">返回上一步</el-button>
        <el-button type="success" @click="handleBatchFill" data-cy="device-detail-input-batch-fill-btn">批量填充</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleConfirm" data-cy="device-detail-input-confirm-btn"> 确认出库 </el-button>
      </div>
    </template>

    <!-- 批量填充对话框 -->
    <el-dialog v-model="batchFillVisible" title="批量填充" width="500px" append-to-body data-cy="batch-fill-dialog">
      <el-form label-width="100px" data-cy="batch-fill-form">
        <el-form-item label="填充字段">
          <el-select v-model="batchFillField" placeholder="选择要填充的字段" style="width: 100%" data-cy="batch-fill-field-select">
            <el-option label="出库原因" value="outboundReason" data-cy="batch-fill-option-outbound-reason" />
            <el-option label="备注" value="remark" data-cy="batch-fill-option-remark" />
            <el-option v-if="outboundType === 1" label="安装人员" value="installerName" data-cy="batch-fill-option-installer" />
            <el-option v-if="outboundType === 2" label="维修地点" value="repairLocation" data-cy="batch-fill-option-repair-location" />
          </el-select>
        </el-form-item>
        <el-form-item label="填充值">
          <el-input v-model="batchFillValue" placeholder="输入要填充的值" data-cy="batch-fill-value-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchFillVisible = false" data-cy="batch-fill-cancel-btn">取消</el-button>
        <el-button type="primary" @click="applyBatchFill" data-cy="batch-fill-apply-btn">应用</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ArrowDown, Delete, Monitor, Tools } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

import { getBinList } from '@/api/inventory/bin';
import AddressSelector from '@/components/address/AddressSelector.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceDetailInputDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  devices: {
    type: Array,
    default: () => [],
  },
  outboundType: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 表单数据
const formItems = ref([]);
const currentIndex = ref(0);
const submitLoading = ref(false);
const binOptions = ref([]);

// 批量填充
const batchFillVisible = ref(false);
const batchFillField = ref('');
const batchFillValue = ref('');

// 表单引用
const formRefs = ref([]);

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initFormItems();
      loadBinOptions();
    }
  }
);

// 初始化表单项
const initFormItems = () => {
  formItems.value = props.devices.map((device) => ({
    deviceId: device.id,
    deviceCode: device.deviceCode,
    deviceName: device.deviceName,
    quantity: 1,
    binId: null,
    availableStock: device.availableStock || 0,
    // 安装出库字段 - 使用行政区划结构
    installProvinceId: null,
    installCityId: null,
    installDistrictId: null,
    installDetailAddress: '',
    installFullAddress: '', // 完整地址（省市区+详细）
    installationDate: '',
    installerName: '',
    warrantyPeriod: 12,
    // 维修出库字段
    faultDescription: '',
    repairLocation: '',
    repairPerson: '',
    estimatedCompleteDate: '',
    // 报废出库字段
    scrapReason: '',
    residualValue: 0,
    // 通用字段
    outboundReason: '',
    remark: '',
  }));
  currentIndex.value = 0;
  formRefs.value = [];
};

// 处理地址变化
const handleAddressChange = (index, data) => {
  const item = formItems.value[index];
  if (item) {
    item.installFullAddress = data.fullAddress;
  }
};

// 加载货位选项
const loadBinOptions = async () => {
  try {
    const res = await getBinList({ pageSize: 1000 });
    binOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载货位列表失败', error);
  }
};

// 设置表单引用
const setFormRef = (el, index) => {
  if (el) {
    formRefs.value[index] = el;
  }
};

// 获取表单项验证规则
const getItemRules = (item) => {
  const baseRules = {
    quantity: [
      { required: true, message: '请输入出库数量', trigger: 'blur' },
      { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          const availableStock = item.availableStock ?? 0;
          if (value > availableStock) {
            callback(new Error(`出库数量不能超过可用库存(${availableStock})`));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
    binId: [{ required: true, message: '请选择货位', trigger: 'change' }],
    outboundReason: [{ required: true, message: '请输入出库原因', trigger: 'blur' }],
  };

  if (props.outboundType === 1) {
    baseRules.installProvinceId = [{ required: true, message: '请选择省份', trigger: 'change' }];
    baseRules.installCityId = [{ required: true, message: '请选择城市', trigger: 'change' }];
    baseRules.installDistrictId = [{ required: true, message: '请选择区县', trigger: 'change' }];
    baseRules.installDetailAddress = [{ required: true, message: '请输入详细地址', trigger: 'blur' }];
    baseRules.installationDate = [{ required: true, message: '请选择安装日期', trigger: 'change' }];
  }

  if (props.outboundType === 2) {
    baseRules.faultDescription = [{ required: true, message: '请输入故障描述', trigger: 'blur' }];
  }

  if (props.outboundType === 3) {
    baseRules.scrapReason = [{ required: true, message: '请选择报废原因', trigger: 'change' }];
  }

  return baseRules;
};

// 检查表单项是否有效
const isItemValid = (index) => {
  const item = formItems.value[index];
  if (!item) {
    return false;
  }

  // 基础验证
  if (!item.quantity || item.quantity < 1) {
    return false;
  }
  if (!item.binId) {
    return false;
  }
  if (!item.outboundReason) {
    return false;
  }

  // 根据出库类型验证
  if (props.outboundType === 1) {
    if (!item.installProvinceId) {
      return false;
    }
    if (!item.installCityId) {
      return false;
    }
    if (!item.installDistrictId) {
      return false;
    }
    if (!item.installDetailAddress) {
      return false;
    }
    if (!item.installationDate) {
      return false;
    }
  }

  if (props.outboundType === 2) {
    if (!item.faultDescription) {
      return false;
    }
  }

  if (props.outboundType === 3) {
    if (!item.scrapReason) {
      return false;
    }
  }

  return true;
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
};

// 处理确认
const handleConfirm = async () => {
  // 验证所有表单
  const validResults = await Promise.all(
    formRefs.value.map((formRef, index) => {
      if (!formRef) {
        return Promise.resolve(false);
      }
      return formRef.validate().catch(() => false);
    })
  );

  const allValid = validResults.every((valid) => valid);

  if (!allValid) {
    ElMessage.warning('请完善所有设备的必填信息');
    // 跳转到第一个未完成的表单
    const firstInvalidIndex = validResults.findIndex((valid) => !valid);
    if (firstInvalidIndex !== -1) {
      currentIndex.value = firstInvalidIndex;
    }
    return;
  }

  submitLoading.value = true;

  try {
    emit('confirm', formItems.value);
    ElMessage.success('出库信息已保存');
  } finally {
    submitLoading.value = false;
  }
};

// 打开批量填充
const handleBatchFill = () => {
  batchFillField.value = '';
  batchFillValue.value = '';
  batchFillVisible.value = true;
};

// 应用批量填充
const applyBatchFill = () => {
  if (!batchFillField.value) {
    ElMessage.warning('请选择要填充的字段');
    return;
  }

  formItems.value.forEach((item) => {
    item[batchFillField.value] = batchFillValue.value;
  });

  ElMessage.success('批量填充完成');
  batchFillVisible.value = false;
};
</script>

<style scoped lang="scss">
.device-detail-input-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-description {
  padding: 16px 20px 0;
}

.forms-container {
  padding: 16px 20px;
}

.device-form-card {
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;

  &.is-active {
    border-color: #409eff;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f7fa;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #e4e7ed;
    }

    .device-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .device-name {
        font-weight: 600;
        color: #303133;
      }

      .device-code {
        color: #909399;
        font-size: 13px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .expand-icon {
        transition: transform 0.3s;

        &.is-expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  .card-body {
    padding: 16px;
    background: #fff;

    .device-form {
      :deep(.el-divider__text) {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.quick-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;

  .nav-label {
    font-size: 14px;
    color: #606266;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
