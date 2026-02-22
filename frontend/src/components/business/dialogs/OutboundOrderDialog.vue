<!--
  @file: OutboundOrderDialog.vue
  @description: 新建/编辑出库单对话框 - 上下分区布局设计
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1200px"
    top="5vh"
    destroy-on-close
    :close-on-click-modal="false"
    class="outbound-order-dialog"
  >
    <div class="dialog-container">
      <!-- 上半部分：出库单基本信息区域 -->
      <div class="order-info-section">
        <div class="section-header">
          <el-icon><Document /></el-icon>
          <span>出库单基本信息</span>
        </div>

        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="order-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="出库单号" prop="orderNo">
                <el-input v-model="formData.orderNo" placeholder="系统自动生成" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出库日期" prop="orderDate">
                <el-date-picker
                  v-model="formData.orderDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出库类型" prop="outboundType">
                <el-select
                  v-model="formData.outboundType"
                  placeholder="请选择出库类型"
                  style="width: 100%"
                  @change="handleOutboundTypeChange"
                >
                  <el-option label="普通出库" :value="0">
                    <el-icon><Box /></el-icon> 普通出库
                  </el-option>
                  <el-option label="安装出库" :value="1">
                    <el-icon><Monitor /></el-icon> 安装出库
                  </el-option>
                  <el-option label="维修出库" :value="2">
                    <el-icon><Tools /></el-icon> 维修出库
                  </el-option>
                  <el-option label="报废出库" :value="3">
                    <el-icon><Delete /></el-icon> 报废出库
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="客户/单位" prop="customer">
                <el-input v-model="formData.customer" placeholder="请输入客户或单位名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="经办人" prop="operatorName">
                <el-select
                  v-model="formData.operatorId"
                  placeholder="请选择经办人"
                  filterable
                  style="width: 100%"
                  @change="handleOperatorChange"
                >
                  <el-option
                    v-for="user in userOptions"
                    :key="user.id"
                    :label="user.realName || user.username"
                    :value="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <el-divider class="section-divider" />

      <!-- 下半部分：设备选择区域 -->
      <div class="device-selection-section">
        <div class="section-header">
          <el-icon><Box /></el-icon>
          <span>设备选择</span>
          <el-tag type="info" class="selected-count">已选择 {{ selectedDevices.length }} 个设备</el-tag>
        </div>

        <!-- 设备搜索和筛选工具栏 -->
        <div class="device-toolbar">
          <el-input
            v-model="deviceSearchQuery"
            placeholder="搜索设备名称/编号/型号"
            clearable
            style="width: 300px"
            @input="handleDeviceSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="deviceTypeFilter"
            placeholder="设备类型"
            clearable
            style="width: 150px"
            @change="handleDeviceSearch"
          >
            <el-option v-for="type in deviceTypeOptions" :key="type.id" :label="type.typeName" :value="type.id" />
          </el-select>

          <el-select
            v-model="stockStatusFilter"
            placeholder="库存状态"
            clearable
            style="width: 150px"
            @change="handleDeviceSearch"
          >
            <el-option label="有库存" :value="1" />
            <el-option label="库存不足" :value="2" />
          </el-select>

          <el-button type="primary" :icon="Refresh" @click="refreshDeviceList">刷新</el-button>
        </div>

        <!-- 设备列表表格 -->
        <el-table
          ref="deviceTableRef"
          :data="filteredDeviceList"
          :row-key="(row) => row.id || row.deviceCode"
          border
          size="small"
          height="350px"
          @selection-change="handleSelectionChange"
          v-loading="deviceLoading"
          class="device-table"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="deviceCode" label="设备编号" width="120" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" />
          <el-table-column prop="deviceTypeName" label="设备类型" width="100" />
          <el-table-column prop="specification" label="规格型号" width="150" />
          <el-table-column prop="availableStock" label="可用库存" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.availableStock > 0 ? 'success' : 'danger'">
                {{ row.availableStock }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价" width="100" align="right">
            <template #default="{ row }">
              {{ row.unitPrice ? '¥' + row.unitPrice : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="storageLocation" label="存放位置" width="150" />
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="devicePagination.page"
          v-model:page-size="devicePagination.pageSize"
          :total="devicePagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="device-pagination"
          @size-change="handleDevicePageSizeChange"
          @current-change="handleDevicePageChange"
        />

        <!-- 已选设备预览 -->
        <div v-if="selectedDevices.length > 0" class="selected-devices-preview">
          <div class="preview-header">
            <span>已选设备预览</span>
            <el-button link type="primary" @click="clearAllSelection">清空全部</el-button>
          </div>
          <el-scrollbar height="100px">
            <div class="selected-tags">
              <el-tag
                v-for="device in selectedDevices"
                :key="device.id"
                closable
                @close="removeSelectedDevice(device)"
                class="selected-tag"
              >
                {{ device.deviceName }} ({{ device.deviceCode }})
              </el-tag>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleNextStep">
          下一步 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>

    <!-- 设备详情录入对话框（二次弹窗） -->
    <DeviceDetailInputDialog
      v-model="detailInputVisible"
      :devices="selectedDevices"
      :outbound-type="formData.outboundType"
      @confirm="handleDetailConfirm"
      @cancel="detailInputVisible = false"
    />
  </el-dialog>
</template>

<script setup>
import { ArrowRight, Box, Delete, Document, Monitor, Refresh, Search, Tools } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref, watch } from 'vue';

import { getDeviceList } from '@/api/device/device';
import { getDeviceTypeList } from '@/api/device/device-type';
import { generateOutboundOrderNo } from '@/api/inventory/outbound';
import { getUserList } from '@/api/system/user';
import DeviceDetailInputDialog from '@/components/business/dialogs/DeviceDetailInputDialog.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('OutboundOrderDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create', // 'create' | 'edit'
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新建出库单' : '编辑出库单';
});

// 表单引用
const formRef = ref(null);
const deviceTableRef = ref(null);

// 表单数据
const formData = reactive({
  orderNo: '',
  orderDate: new Date().toISOString().split('T')[0],
  outboundType: 0,
  customer: '',
  operatorId: null,
  operatorName: '',
  contactPhone: '',
  remark: '',
  items: [],
});

// 表单验证规则
const formRules = {
  orderDate: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
  outboundType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  customer: [{ required: true, message: '请输入客户/单位', trigger: 'blur' }],
  operatorId: [{ required: true, message: '请选择经办人', trigger: 'change' }],
};

// 设备选择相关
const deviceSearchQuery = ref('');
const deviceTypeFilter = ref(null);
const stockStatusFilter = ref(null);
const deviceLoading = ref(false);
const deviceList = ref([]);
const filteredDeviceList = ref([]);
const selectedDevices = ref([]);
const deviceTypeOptions = ref([]);
const userOptions = ref([]);

// 设备分页
const devicePagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 设备详情录入对话框
const detailInputVisible = ref(false);
const submitLoading = ref(false);

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm();
      loadDeviceList();
      loadDeviceTypes();
      loadUsers();
    }
  }
);

// 初始化表单
const initForm = async () => {
  if (props.mode === 'create') {
    formData.orderNo = await generateOutboundOrderNo();
    formData.orderDate = new Date().toISOString().split('T')[0];
    formData.outboundType = 0;
    formData.customer = '';
    formData.operatorId = null;
    formData.operatorName = '';
    formData.contactPhone = '';
    formData.remark = '';
    formData.items = [];
    selectedDevices.value = [];
  } else if (props.initialData) {
    Object.assign(formData, props.initialData);
    selectedDevices.value =
      props.initialData.items?.map((item) => ({
        id: item.deviceId,
        deviceCode: item.deviceCode,
        deviceName: item.deviceName,
        ...item,
      })) || [];
  }
};

// 加载设备列表
const loadDeviceList = async () => {
  deviceLoading.value = true;
  try {
    const res = await getDeviceList({
      page: devicePagination.page,
      pageSize: devicePagination.pageSize,
      keyword: deviceSearchQuery.value,
      deviceTypeId: deviceTypeFilter.value,
      status: 1, // 只显示正常状态的设备
    });
    deviceList.value = res.data?.list || [];
    devicePagination.total = res.data?.total || 0;
    filterDeviceList();
  } catch (error) {
    logger.error('加载设备列表失败', error);
    ElMessage.error('加载设备列表失败');
  } finally {
    deviceLoading.value = false;
  }
};

// 筛选设备列表
const filterDeviceList = () => {
  let result = [...deviceList.value];

  if (deviceSearchQuery.value) {
    const query = deviceSearchQuery.value.toLowerCase();
    result = result.filter(
      (device) =>
        device.deviceName?.toLowerCase().includes(query) ||
        device.deviceCode?.toLowerCase().includes(query) ||
        device.specification?.toLowerCase().includes(query)
    );
  }

  if (stockStatusFilter.value === 1) {
    result = result.filter((device) => device.availableStock > 0);
  } else if (stockStatusFilter.value === 2) {
    result = result.filter((device) => device.availableStock <= 0);
  }

  filteredDeviceList.value = result;
};

// 加载设备类型
const loadDeviceTypes = async () => {
  try {
    const res = await getDeviceTypeList();
    deviceTypeOptions.value = res.data || [];
  } catch (error) {
    logger.error('加载设备类型失败', error);
  }
};

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await getUserList({ pageSize: 1000 });
    userOptions.value = res.data?.list || [];
  } catch (error) {
    logger.error('加载用户列表失败', error);
  }
};

// 处理设备搜索
const handleDeviceSearch = () => {
  devicePagination.page = 1;
  filterDeviceList();
};

// 刷新设备列表
const refreshDeviceList = () => {
  loadDeviceList();
};

// 处理设备分页
const handleDevicePageSizeChange = (size) => {
  devicePagination.pageSize = size;
  loadDeviceList();
};

const handleDevicePageChange = (page) => {
  devicePagination.page = page;
  loadDeviceList();
};

// 处理设备选择变化
const handleSelectionChange = (selection) => {
  selectedDevices.value = selection;
};

// 移除已选设备
const removeSelectedDevice = (device) => {
  const index = selectedDevices.value.findIndex((d) => d.id === device.id);
  if (index > -1) {
    selectedDevices.value.splice(index, 1);
    deviceTableRef.value?.toggleRowSelection(device, false);
  }
};

// 清空全部选择
const clearAllSelection = () => {
  selectedDevices.value = [];
  deviceTableRef.value?.clearSelection();
};

// 处理出库类型变化
const handleOutboundTypeChange = (type) => {
  logger.debug('出库类型变化', { type });
};

// 处理经办人变化
const handleOperatorChange = (userId) => {
  const user = userOptions.value.find((u) => u.id === userId);
  if (user) {
    formData.operatorName = user.realName || user.username;
  }
};

// 处理下一步
const handleNextStep = async () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请至少选择一个设备');
    return;
  }

  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const stockValidation = validateStockAvailability();
  if (!stockValidation.valid) {
    ElMessage.error(stockValidation.message);
    return;
  }

  detailInputVisible.value = true;
};

const validateStockAvailability = () => {
  const invalidDevices = selectedDevices.value.filter((device) => {
    const availableStock = device.availableStock ?? device.stock ?? 0;
    return availableStock <= 0;
  });

  if (invalidDevices.length > 0) {
    const deviceNames = invalidDevices
      .slice(0, 3)
      .map((d) => d.deviceName || d.deviceCode)
      .join('、');
    const suffix = invalidDevices.length > 3 ? `等${invalidDevices.length}个设备` : '';
    return {
      valid: false,
      message: `以下设备库存不足，无法出库：${deviceNames}${suffix}`,
      invalidDevices,
    };
  }

  const lowStockDevices = selectedDevices.value.filter((device) => {
    const availableStock = device.availableStock ?? device.stock ?? 0;
    return availableStock > 0 && availableStock < 5;
  });

  if (lowStockDevices.length > 0) {
    ElMessage.warning(`提示：${lowStockDevices.length}个设备库存较低，请注意库存管理`);
  }

  return { valid: true };
};

// 处理设备详情确认
const handleDetailConfirm = (items) => {
  formData.items = items;
  submitLoading.value = true;

  emit('confirm', { ...formData });

  setTimeout(() => {
    submitLoading.value = false;
    dialogVisible.value = false;
    detailInputVisible.value = false;
  }, 500);
};
</script>

<style scoped lang="scss">
.outbound-order-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;

  .el-icon {
    font-size: 18px;
    color: #409eff;
  }

  .selected-count {
    margin-left: auto;
    font-size: 14px;
    font-weight: normal;
  }
}

.section-divider {
  margin: 20px 0;
}

.order-info-section {
  .order-form {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
  }
}

.device-selection-section {
  .device-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
  }

  .device-table {
    margin-bottom: 16px;
  }

  .device-pagination {
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  .selected-devices-preview {
    background: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 8px;
    padding: 12px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .selected-tag {
        margin: 0;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
