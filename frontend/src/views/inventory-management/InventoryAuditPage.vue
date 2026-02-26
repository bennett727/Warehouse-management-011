<!--
  @file: InventoryAuditPage.vue
  @description: 库存盘点管理页面 - 预留功能，当前在InventoryManagementPage中作为标签页使用
  @author: 开发团面  @createTime: 2025-12-21
  @version: 1.0
  @modifyRecords:
      2026-02-08: 标注为预留功能组件，在InventoryManagementPage中作为标签页使用
-->
<template>
  <PageLayout title="库存盘点管理" description="管理库存盘点流程及记录" data-cy="inventory-audit-page">
    <template #headerActions>
      <el-button data-cy="inventory-audit-create-btn" type="primary" :icon="Plus" @click="handleCreateAudit">创建盘点单</el-button>
      <el-button data-cy="inventory-audit-refresh-btn" type="info" :icon="Refresh" @click="handleRefresh">刷新</el-button>
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="盘点单筛选"
      :header-icon="List"
      :result-count="auditList.length"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="table-card" shadow="never" data-cy="inventory-audit-table-card">
      <div class="audit-list-section">
        <el-table data-cy="inventory-audit-list-table" :data="auditList" v-loading="loading" stripe border>
          <el-table-column prop="auditNumber" label="盘点单号" width="180" data-cy="audit-number-column" />
          <el-table-column prop="auditType" label="盘点类型" width="120" data-cy="audit-type-column">
            <template #default="{ row }">
              <el-tag :type="getAuditTypeTagType(row.auditType)" :data-cy="`audit-type-tag-${row.id}`">
                {{ getAuditTypeText(row.auditType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="auditDate" label="盘点日期" width="120" data-cy="audit-date-column" />
          <el-table-column prop="auditStatus" label="盘点状态" width="120" data-cy="audit-status-column">
            <template #default="{ row }">
              <el-tag :type="getAuditStatusTagType(row.auditStatus)" :data-cy="`audit-status-tag-${row.id}`">
                {{ getAuditStatusText(row.auditStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalDevices" label="设备总数" width="100" data-cy="total-devices-column" />
          <el-table-column prop="matchedDevices" label="匹配数" width="100" data-cy="matched-devices-column" />
          <el-table-column prop="mismatchedDevices" label="差异数" width="100" data-cy="mismatched-devices-column" />
          <el-table-column prop="createdBy" label="创建人" width="120" data-cy="created-by-column" />
          <el-table-column prop="createdAt" label="创建时间" width="180" data-cy="created-at-column" />
          <el-table-column label="操作" width="300" fixed="right" data-cy="audit-actions-column">
            <template #default="{ row }">
              <el-button
                data-cy="inventory-audit-start-btn"
                v-if="row.auditStatus === 'PENDING'"
                type="primary"
                size="small"
                @click="handleStartAudit(row)"
              >
                开始盘点
              </el-button>
              <el-button
                data-cy="inventory-audit-detail-btn"
                v-if="row.auditStatus === 'IN_PROGRESS'"
                type="success"
                size="small"
                @click="handleViewItems(row)"
              >
                盘点明细
              </el-button>
              <el-button
                data-cy="inventory-audit-diff-btn"
                v-if="row.auditStatus === 'COMPLETED'"
                type="warning"
                size="small"
                @click="handleViewDifferences(row)"
              >
                查看差异
              </el-button>
              <el-button
                data-cy="inventory-audit-cancel-btn"
                v-if="row.auditStatus === 'PENDING'"
                type="danger"
                size="small"
                @click="handleCancelAudit(row)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog data-cy="inventory-audit-create-dialog" v-model="createDialogVisible" title="创建盘点单" width="600px">
      <el-form data-cy="inventory-audit-create-form" :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-form-item label="盘点类型" prop="auditType">
          <el-select data-cy="inventory-audit-type-select" v-model="createForm.auditType" placeholder="请选择盘点类型">
            <el-option label="全盘" :value="0" />
            <el-option label="抽盘" :value="1" />
            <el-option label="循环盘点" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="盘点日期" prop="auditDate">
          <el-date-picker
            data-cy="inventory-audit-date-picker"
            v-model="createForm.auditDate"
            type="date"
            placeholder="选择盘点日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button data-cy="inventory-audit-create-cancel-btn" @click="createDialogVisible = false">取消</el-button>
        <el-button data-cy="inventory-audit-create-confirm-btn" type="primary" @click="handleCreateSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog data-cy="inventory-audit-items-dialog" v-model="itemsDialogVisible" title="盘点明细" width="1200px">
      <div class="audit-items-header">
        <div class="audit-info">
          <span>盘点单号: {{ currentAudit?.auditNumber }}</span>
          <span>盘点类型: {{ getAuditTypeText(currentAudit?.auditType) }}</span>
          <span>设备总数: {{ currentAudit?.totalDevices }}</span>
          <span>已盘面 {{ auditedCount }}</span>
          <span>待盘点 {{ pendingCount }}</span>
        </div>
      </div>
      <el-table data-cy="inventory-audit-items-table" :data="auditItems" v-loading="itemsLoading" stripe border max-height="500">
        <el-table-column prop="device.deviceCode" label="设备编号" width="150" data-cy="items-device-code-column" />
        <el-table-column prop="device.deviceName" label="设备名称" width="150" data-cy="items-device-name-column" />
        <el-table-column prop="systemQuantity" label="系统数量" width="100" data-cy="items-system-qty-column" />
        <el-table-column label="实际数量" width="150" data-cy="items-actual-qty-column">
          <template #default="{ row }">
            <el-input-number
              data-cy="inventory-audit-actual-qty-input"
              v-model="row.actualQuantity"
              :min="0"
              :max="999"
              :disabled="row.itemStatus !== 'PENDING'"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="差异" width="100" data-cy="items-difference-column">
          <template #default="{ row }">
            <span :class="{ 'difference-text': row.difference !== 0 }">
              {{ row.difference !== null ? row.difference : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="itemStatus" label="状态" width="100" data-cy="items-status-column">
          <template #default="{ row }">
            <el-tag :type="getItemStatusTagType(row.itemStatus)" :data-cy="`items-status-tag-${row.id}`">
              {{ getItemStatusText(row.itemStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" width="200" data-cy="items-notes-column">
          <template #default="{ row }">
            <el-input
              data-cy="inventory-audit-notes-input"
              v-model="row.notes"
              :disabled="row.itemStatus !== 'PENDING'"
              placeholder="请输入备注"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" data-cy="items-actions-column">
          <template #default="{ row }">
            <el-button
              data-cy="inventory-audit-record-btn"
              v-if="row.itemStatus === 'PENDING'"
              type="primary"
              size="small"
              @click="handleRecordItem(row)"
            >
              记录
            </el-button>
            <el-button
              data-cy="inventory-audit-adjust-btn"
              v-if="row.itemStatus === 'MISMATCHED'"
              type="warning"
              size="small"
              @click="handleAdjustInventory(row)"
            >
              调整库存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button data-cy="inventory-audit-items-close-btn" @click="itemsDialogVisible = false">关闭</el-button>
        <el-button data-cy="inventory-audit-complete-btn" type="primary" @click="handleCompleteAudit" :disabled="pendingCount > 0">
          完成盘点
        </el-button>
      </template>
    </el-dialog>

    <el-dialog data-cy="inventory-audit-diff-dialog" v-model="differencesDialogVisible" title="盘点差异" width="1000px">
      <el-table data-cy="inventory-audit-diff-table" :data="differences" v-loading="differencesLoading" stripe border>
        <el-table-column prop="device.deviceCode" label="设备编号" width="150" data-cy="diff-device-code-column" />
        <el-table-column prop="device.deviceName" label="设备名称" width="150" data-cy="diff-device-name-column" />
        <el-table-column prop="systemQuantity" label="系统数量" width="100" data-cy="diff-system-qty-column" />
        <el-table-column prop="actualQuantity" label="实际数量" width="100" data-cy="diff-actual-qty-column" />
        <el-table-column prop="difference" label="差异" width="100" data-cy="diff-difference-column">
          <template #default="{ row }">
            <span :class="{ 'difference-text': row.difference !== 0 }">
              {{ row.difference }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" width="200" data-cy="diff-notes-column" />
        <el-table-column prop="auditedBy" label="盘点人" width="120" data-cy="diff-audited-by-column" />
        <el-table-column prop="auditedAt" label="盘点时间" width="180" data-cy="diff-audited-at-column" />
      </el-table>
      <template #footer>
        <el-button data-cy="inventory-audit-diff-close-btn" @click="differencesDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Plus, Refresh, List } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import {
  adjustInventoryByAudit,
  cancelInventoryAudit,
  completeInventoryAudit,
  createInventoryAudit,
  getAuditDifferences,
  getAuditItems,
  getInventoryAuditList,
  recordAuditItem,
  startInventoryAudit,
} from '@/api/inventory';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';

// 搜索表单
const searchForm = reactive({
  auditType: '',
  auditStatus: '',
  auditDate: '',
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'auditType',
    label: '盘点类型',
    type: 'select',
    placeholder: '请选择盘点类型',
    clearable: true,
    md: 6,
    lg: 4,
    options: [
      { label: '全盘', value: 0 },
      { label: '抽盘', value: 1 },
      { label: '循环盘点', value: 2 },
    ],
  },
  {
    prop: 'auditStatus',
    label: '盘点状态',
    type: 'select',
    placeholder: '请选择盘点状态',
    clearable: true,
    md: 6,
    lg: 4,
    options: [
      { label: '待盘点', value: 'PENDING' },
      { label: '盘点中', value: 'IN_PROGRESS' },
      { label: '已完成', value: 'COMPLETED' },
      { label: '已取消', value: 'CANCELLED' },
    ],
  },
  {
    prop: 'auditDate',
    label: '盘点日期',
    type: 'date',
    placeholder: '请选择盘点日期',
    clearable: true,
    md: 6,
    lg: 4,
    valueFormat: 'YYYY-MM-DD',
  },
]);

const loading = ref(false);
const auditList = ref([]);
const createDialogVisible = ref(false);
const itemsDialogVisible = ref(false);
const differencesDialogVisible = ref(false);
const itemsLoading = ref(false);
const differencesLoading = ref(false);
const submitLoading = ref(false);
const currentAudit = ref(null);
const auditItems = ref([]);
const differences = ref([]);

const createForm = reactive({
  auditType: null,
  auditDate: '',
});

const createRules = {
  auditType: [{ required: true, message: '请选择盘点类型', trigger: 'change' }],
  auditDate: [{ required: true, message: '请选择盘点日期', trigger: 'change' }],
};

const createFormRef = ref(null);

const auditedCount = computed(() => {
  return auditItems.value.filter((item) => item.itemStatus !== 'PENDING').length;
});

const pendingCount = computed(() => {
  return auditItems.value.filter((item) => item.itemStatus === 'PENDING').length;
});

const getAuditTypeText = (type) => {
  const types = {
    0: '全盘',
    1: '抽盘',
    2: '循环盘点',
  };
  return types[type] || '-';
};

const getAuditTypeTagType = (type) => {
  const types = {
    0: 'danger',
    1: 'warning',
    2: 'info',
  };
  return types[type] || '';
};

const getAuditStatusText = (status) => {
  const statuses = {
    PENDING: '待盘点',
    IN_PROGRESS: '盘点中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return statuses[status] || '-';
};

const getAuditStatusTagType = (status) => {
  const types = {
    PENDING: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  };
  return types[status] || '';
};

const getItemStatusText = (status) => {
  const statuses = {
    PENDING: '待盘点',
    MATCHED: '匹配',
    MISMATCHED: '不匹配',
    ADJUSTED: '已调整',
  };
  return statuses[status] || '-';
};

const getItemStatusTagType = (status) => {
  const types = {
    PENDING: 'info',
    MATCHED: 'success',
    MISMATCHED: 'danger',
    ADJUSTED: 'warning',
  };
  return types[status] || '';
};

const loadAuditList = async () => {
  loading.value = true;
  try {
    const response = await getInventoryAuditList();
    if (response.success) {
      auditList.value = response.data || [];
    } else {
      ElMessage.error(response.message || '获取盘点列表失败');
    }
  } catch (error) {
    ElMessage.error(`获取盘点列表失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const handleCreateAudit = () => {
  createForm.auditType = null;
  createForm.auditDate = '';
  createDialogVisible.value = true;
};

const handleCreateSubmit = async () => {
  if (!createFormRef.value) {
    return;
  }

  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const response = await createInventoryAudit(createForm.auditType, createForm.auditDate);
        if (response.success) {
          ElMessage.success('盘点单创建成功');
          createDialogVisible.value = false;
          await loadAuditList();
        } else {
          ElMessage.error(response.message || '创建盘点单失败');
        }
      } catch (error) {
        ElMessage.error(`创建盘点单失败: ${error.message}`);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleStartAudit = async (row) => {
  try {
    await ElMessageBox.confirm('确定要开始盘点吗？开始后将生成盘点明细。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await startInventoryAudit(row.id);
    if (response.success) {
      ElMessage.success('盘点开始成功');
      await loadAuditList();
    } else {
      ElMessage.error(response.message || '开始盘点失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`开始盘点失败: ${error.message}`);
    }
  }
};

const handleViewItems = async (row) => {
  currentAudit.value = row;
  itemsLoading.value = true;
  itemsDialogVisible.value = true;
  try {
    const response = await getAuditItems(row.id);
    if (response.success) {
      auditItems.value = response.data || [];
    } else {
      ElMessage.error(response.message || '获取盘点明细失败');
    }
  } catch (error) {
    ElMessage.error(`获取盘点明细失败: ${error.message}`);
  } finally {
    itemsLoading.value = false;
  }
};

const handleRecordItem = async (row) => {
  if (row.actualQuantity === null || row.actualQuantity === undefined) {
    ElMessage.warning('请输入实际数量');
    return;
  }

  try {
    const response = await recordAuditItem(row.id, row.actualQuantity, row.notes);
    if (response.success) {
      ElMessage.success('盘点记录成功');
      row.difference = row.actualQuantity - row.systemQuantity;
      row.itemStatus = row.difference === 0 ? 'MATCHED' : 'MISMATCHED';
    } else {
      ElMessage.error(response.message || '盘点记录失败');
    }
  } catch (error) {
    ElMessage.error(`盘点记录失败: ${error.message}`);
  }
};

const handleAdjustInventory = async (row) => {
  try {
    await ElMessageBox.confirm('确定要根据盘点结果调整库存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await adjustInventoryByAudit(row.id);
    if (response.success) {
      ElMessage.success('库存调整成功');
      row.itemStatus = 'ADJUSTED';
    } else {
      ElMessage.error(response.message || '库存调整失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`库存调整失败: ${error.message}`);
    }
  }
};

const handleViewDifferences = async (row) => {
  currentAudit.value = row;
  differencesLoading.value = true;
  differencesDialogVisible.value = true;
  try {
    const response = await getAuditDifferences(row.id);
    if (response.success) {
      differences.value = response.data || [];
    } else {
      ElMessage.error(response.message || '获取盘点差异失败');
    }
  } catch (error) {
    ElMessage.error(`获取盘点差异失败: ${error.message}`);
  } finally {
    differencesLoading.value = false;
  }
};

const handleCancelAudit = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消此盘点单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await cancelInventoryAudit(row.id);
    if (response.success) {
      ElMessage.success('盘点单取消成功');
      await loadAuditList();
    } else {
      ElMessage.error(response.message || '取消盘点单失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`取消盘点单失败: ${error.message}`);
    }
  }
};

const handleCompleteAudit = async () => {
  try {
    await ElMessageBox.confirm('确定要完成盘点吗？完成后将不能再修改盘点数据。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await completeInventoryAudit(currentAudit.value.id);
    if (response.success) {
      ElMessage.success('盘点完成');
      itemsDialogVisible.value = false;
      await loadAuditList();
    } else {
      ElMessage.error(response.message || '完成盘点失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`完成盘点失败: ${error.message}`);
    }
  }
};

const handleSearch = () => {
  // 根据筛选条件过滤盘点列表
  loadAuditList();
};

const handleReset = () => {
  searchForm.auditType = '';
  searchForm.auditStatus = '';
  searchForm.auditDate = '';
  loadAuditList();
};

const handleRefresh = () => {
  loadAuditList();
};

onMounted(() => {
  loadAuditList();
});
</script>

<style scoped>
.inventory-audit-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.audit-list-section {
  margin-top: 20px;
}

.audit-items-header {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.audit-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.audit-info span {
  font-weight: 500;
}

.difference-text {
  color: #f56c6c;
  font-weight: bold;
}
</style>
