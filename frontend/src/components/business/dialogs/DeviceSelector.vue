<!--
  @file: DeviceSelector.vue
  @description: 设备选择器对话框 - 用于向导式流程中的设备选择
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="visible"
    title="选择设备"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    class="device-selector-dialog"
  >
    <div class="selector-container">
      <div class="selector-filter">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备编号/名称/型号"
          clearable
          style="width: 280px"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filterType" placeholder="设备类型" clearable style="width: 140px">
          <el-option v-for="type in deviceTypes" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="设备状态" clearable style="width: 120px">
          <el-option label="在库" value="in_stock" />
          <el-option label="可用" value="available" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <div class="device-table-wrapper">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="deviceList"
          border
          height="350px"
          row-key="id"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="deviceCode" label="设备编号" width="140">
            <template #default="{ row }">
              <div class="device-code-cell">
                <el-icon :size="14" color="#409EFF"><Cpu /></el-icon>
                <span>{{ row.deviceCode }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="deviceType" label="设备类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.deviceType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="model" label="规格型号" width="120" show-overflow-tooltip />
          <el-table-column prop="warehouseName" label="所在仓库" width="100" />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="库存" width="80" align="center">
            <template #default="{ row }">
              <span :class="{ 'low-stock': row.quantity <= 5 }">{{ row.quantity || 0 }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="selector-pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <div class="selected-devices" v-if="tempSelected.length > 0">
        <div class="selected-header">
          <el-icon :size="16" color="#409EFF"><Box /></el-icon>
          <span
            >已选择 <strong>{{ tempSelected.length }}</strong> 个设备</span
          >
          <el-button type="danger" link size="small" @click="clearSelection">清空选择</el-button>
        </div>
        <el-scrollbar max-height="80px">
          <div class="selected-tags">
            <el-tag
              v-for="device in tempSelected"
              :key="device.id"
              closable
              size="small"
              @close="removeSelected(device)"
            >
              {{ device.deviceCode }} - {{ device.deviceName }}
            </el-tag>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="tempSelected.length === 0" @click="handleConfirm">
          确定 ({{ tempSelected.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Search, Refresh, Box, Cpu } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, computed, watch, onMounted } from 'vue';

import { DEVICE_API } from '@/constants/apiConstants';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('DeviceSelector');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  warehouseId: {
    type: [String, Number],
    default: null,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);
const tableRef = ref(null);
const searchQuery = ref('');
const filterType = ref('');
const filterStatus = ref('');
const deviceList = ref([]);
const tempSelected = ref([]);

const deviceTypes = ref([
  { label: '服务器', value: 'server' },
  { label: '网络设备', value: 'network' },
  { label: '存储设备', value: 'storage' },
  { label: '终端设备', value: 'terminal' },
  { label: '其他', value: 'other' },
]);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const getStatusType = (status) => {
  const statusTypeMap = {
    0: 'success',
    1: 'primary',
    2: 'warning',
    3: 'danger',
    4: 'info',
    5: 'success',
    [-1]: 'info',
  };
  return statusTypeMap[status] || 'info';
};

const getStatusText = (status) => {
  const statusTextMap = {
    0: '在库',
    1: '使用中',
    2: '维护中',
    3: '已报废',
    4: '维修中',
    5: '正常',
    [-1]: '待入库',
  };
  return statusTextMap[status] || '未知';
};

const checkSelectable = (row) => {
  if (!row || typeof row !== 'object') {
    return false;
  }
  return row.status === 0 || row.status === 5;
};

const loadDevices = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      keyword: searchQuery.value,
      typeId: filterType.value,
      status: filterStatus.value ? 0 : undefined,
      warehouseId: props.warehouseId,
    };

    const response = await request.get(DEVICE_API.LIST, { params });

    if (response.data) {
      const pageData = response.data;
      let list = [];
      if (Array.isArray(pageData)) {
        list = pageData;
      } else if (Array.isArray(pageData.records)) {
        list = pageData.records;
      } else if (pageData.data && Array.isArray(pageData.data.records)) {
        list = pageData.data.records;
      } else if (Array.isArray(pageData.content)) {
        list = pageData.content;
      } else if (pageData.data && Array.isArray(pageData.data)) {
        list = pageData.data;
      }
      deviceList.value = list.filter((item) => item != null);
      pagination.total = pageData.total || pageData.totalElements || 0;
    } else {
      deviceList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    logger.error('加载设备列表失败', error);
    deviceList.value = [];
    pagination.total = 0;
    ElMessage.error(`加载设备列表失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadDevices();
};

const handleReset = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterStatus.value = '';
  pagination.current = 1;
  loadDevices();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  loadDevices();
};

const handleCurrentChange = (page) => {
  pagination.current = page;
  loadDevices();
};

const handleSelectionChange = (selection) => {
  tempSelected.value = selection;
};

const removeSelected = (device) => {
  const index = tempSelected.value.findIndex((d) => d.id === device.id);
  if (index > -1) {
    tempSelected.value.splice(index, 1);
    tableRef.value?.toggleRowSelection(device, false);
  }
};

const clearSelection = () => {
  tempSelected.value = [];
  tableRef.value?.clearSelection();
};

const handleCancel = () => {
  visible.value = false;
  clearSelection();
};

const handleConfirm = () => {
  if (tempSelected.value.length === 0) {
    ElMessage.warning('请至少选择一个设备');
    return;
  }
  emit('confirm', [...tempSelected.value]);
  visible.value = false;
};

watch(visible, (val) => {
  if (val) {
    loadDevices();
    if (props.selectedIds && props.selectedIds.length > 0) {
      tempSelected.value = deviceList.value.filter((d) => props.selectedIds.includes(d.id));
    }
  }
});

onMounted(() => {
  if (visible.value) {
    loadDevices();
  }
});
</script>

<style scoped lang="scss">
.device-selector-dialog {
  :deep(.el-dialog__body) {
    padding: 16px 20px;
  }
}

.selector-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-filter {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.device-table-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.device-code-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.low-stock {
  color: #f56c6c;
  font-weight: 600;
}

.selector-pagination {
  display: flex;
  justify-content: flex-end;
}

.selected-devices {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;

  strong {
    color: #409eff;
  }
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
