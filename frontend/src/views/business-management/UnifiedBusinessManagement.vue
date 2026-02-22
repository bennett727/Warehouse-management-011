<!--
  @file: UnifiedBusinessManagement.vue
  @description: 统一业务管理页面 - 记录与审批一体化
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 3.0
  @features:
    - 统一的业务管理界面（安装、维修、报废、保养、入库、出库、调拨）
    - 记录与审批一体化设计
    - 状态流转管理（草稿→待审批→已通过/已驳回→执行中→已完成）
    - 响应式设计
    - 可视化统计
-->
<template>
  <PageLayout
    title="业务管理中心"
    description="统一管理所有业务记录与审批流程，包括安装、维修、报废、保养、入库、出库、调拨等"
    data-cy="unified-business-management-page"
  >
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="showOperationGuide"> 操作指引 </el-button>
      <el-dropdown @command="handleCreateBusiness" trigger="click">
        <el-button type="primary" :icon="Plus">
          新建业务<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="outbound" :icon="Upload">出库申请</el-dropdown-item>
            <el-dropdown-item command="inbound" :icon="Download">入库申请</el-dropdown-item>
            <el-dropdown-item command="transfer" :icon="Sort">调拨申请</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>

    <div class="unified-business-container">
      <div class="stats-overview">
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6" :md="4" :lg="4">
            <div class="stat-card total" @click="filterByStatus('all')">
              <div class="stat-icon">
                <el-icon :size="28"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.total }}</div>
                <div class="stat-label">全部记录</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4" :lg="4">
            <div class="stat-card draft" @click="filterByStatus('draft')">
              <div class="stat-icon">
                <el-icon :size="28"><Edit /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.draft }}</div>
                <div class="stat-label">草稿</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4" :lg="4">
            <div class="stat-card pending" @click="filterByStatus('pending')">
              <div class="stat-icon">
                <el-icon :size="28"><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.pending }}</div>
                <div class="stat-label">待审批</div>
              </div>
              <el-badge v-if="statistics.pending > 0" is-dot class="status-dot" />
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4" :lg="4">
            <div class="stat-card approved" @click="filterByStatus('approved')">
              <div class="stat-icon">
                <el-icon :size="28"><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.approved }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4" :lg="4">
            <div class="stat-card rejected" @click="filterByStatus('rejected')">
              <div class="stat-icon">
                <el-icon :size="28"><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.rejected }}</div>
                <div class="stat-label">已驳回</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4" :lg="4">
            <div class="stat-card completed" @click="filterByStatus('completed')">
              <div class="stat-icon">
                <el-icon :size="28"><Finished /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-card class="main-content-card" shadow="never">
        <div class="filter-section">
          <div class="filter-left">
            <el-select
              v-model="filters.businessType"
              placeholder="业务类型"
              clearable
              style="width: 140px"
              @change="handleFilterChange"
            >
              <el-option label="全部类型" value="" />
              <el-option label="出库" value="outbound">
                <el-icon><Upload /></el-icon> 出库
              </el-option>
              <el-option label="入库" value="inbound">
                <el-icon><Download /></el-icon> 入库
              </el-option>
              <el-option label="调拨" value="transfer">
                <el-icon><Sort /></el-icon> 调拨
              </el-option>
            </el-select>

            <el-select
              v-model="filters.status"
              placeholder="审批状态"
              clearable
              style="width: 130px"
              @change="handleFilterChange"
            >
              <el-option label="全部状态" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="待审批" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
              <el-option label="执行中" value="executing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>

            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 260px"
              @change="handleFilterChange"
            />
          </div>

          <div class="filter-right">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索编号/设备/申请人"
              clearable
              style="width: 240px"
              :prefix-icon="Search"
              @input="handleSearchDebounced"
            />
            <el-button :icon="Refresh" circle @click="handleRefresh" :loading="loading" />
          </div>
        </div>

        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="businessList"
          stripe
          border
          height="calc(100vh - 420px)"
          row-key="id"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column type="index" label="序号" width="60" align="center" />

          <el-table-column prop="businessNo" label="业务编号" width="160" sortable>
            <template #default="{ row }">
              <div class="business-no-cell">
                <el-icon :size="16" :color="getBusinessTypeColor(row.businessType)">
                  <component :is="getBusinessTypeIcon(row.businessType)" />
                </el-icon>
                <span>{{ row.businessNo }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="businessType" label="业务类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getBusinessTypeTagType(row.businessType)" size="small" effect="plain">
                {{ getBusinessTypeText(row.businessType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="deviceInfo" label="设备信息" min-width="200">
            <template #default="{ row }">
              <div class="device-info-cell">
                <div class="device-code">{{ row.deviceCode }}</div>
                <div class="device-name">{{ row.deviceName }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="applicant" label="申请人" width="100" align="center" />

          <el-table-column prop="warehouseName" label="仓库" width="120" show-overflow-tooltip />

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small" effect="dark">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="创建时间" width="160" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="240" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" link size="small" @click.stop="handleView(row)">
                  <el-icon><View /></el-icon>查看
                </el-button>

                <template v-if="row.status === 'draft'">
                  <el-button type="warning" link size="small" @click.stop="handleEdit(row)">
                    <el-icon><Edit /></el-icon>编辑
                  </el-button>
                  <el-button type="success" link size="small" @click.stop="handleSubmit(row)">
                    <el-icon><Position /></el-icon>提交
                  </el-button>
                </template>

                <template v-if="row.status === 'pending'">
                  <el-button type="success" link size="small" @click.stop="handleApprove(row)">
                    <el-icon><CircleCheck /></el-icon>通过
                  </el-button>
                  <el-button type="danger" link size="small" @click.stop="handleReject(row)">
                    <el-icon><CircleClose /></el-icon>驳回
                  </el-button>
                </template>

                <template v-if="row.status === 'approved'">
                  <el-button type="primary" link size="small" @click.stop="handleExecute(row)">
                    <el-icon><VideoPlay /></el-icon>执行
                  </el-button>
                </template>

                <template v-if="row.status === 'rejected'">
                  <el-button type="warning" link size="small" @click.stop="handleResubmit(row)">
                    <el-icon><RefreshRight /></el-icon>重新提交
                  </el-button>
                </template>

                <el-button
                  v-if="['draft', 'rejected'].includes(row.status)"
                  type="danger"
                  link
                  size="small"
                  @click.stop="handleDelete(row)"
                >
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-section">
          <div class="batch-actions" v-if="selectedRows.length > 0">
            <span class="selected-count">已选择 {{ selectedRows.length }} 条</span>
            <el-button v-if="canBatchApprove" type="success" size="small" @click="handleBatchApprove">
              批量通过
            </el-button>
            <el-button v-if="canBatchReject" type="danger" size="small" @click="handleBatchReject">
              批量驳回
            </el-button>
            <el-button size="small" @click="clearSelection">取消选择</el-button>
          </div>

          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <BusinessDetailDialog
      v-model="detailVisible"
      :business-data="currentBusiness"
      @approve="handleApprove"
      @reject="handleReject"
      @execute="handleExecute"
    />

    <ApprovalDialog
      v-model="approvalVisible"
      :business-data="currentBusiness"
      :mode="approvalMode"
      @confirm="handleApprovalConfirm"
    />

    <OperationGuideDialog v-model="guideVisible" title="业务管理操作指引" :steps="guideSteps" />
  </PageLayout>
</template>

<script setup>
import {
  ArrowDown,
  CircleCheck,
  CircleClose,
  Delete,
  Document,
  Download,
  Edit,
  Finished,
  Plus,
  Position,
  QuestionFilled,
  Refresh,
  RefreshRight,
  Search,
  Sort,
  Timer,
  Upload,
  VideoPlay,
  View,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PageLayout from '@/components/base/PageLayout.vue';
import ApprovalDialog from '@/components/business/dialogs/ApprovalDialog.vue';
import BusinessDetailDialog from '@/components/business/dialogs/BusinessDetailDialog.vue';
import OperationGuideDialog from '@/components/business/dialogs/OperationGuideDialog.vue';
import { STOCK_ORDERS_UNIFIED_API } from '@/constants/apiConstants';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('UnifiedBusinessManagement');
const router = useRouter();
const route = useRoute();

const BUSINESS_TYPES = {
  outbound: { text: '出库', icon: Upload, color: '#409EFF' },
  inbound: { text: '入库', icon: Download, color: '#67C23A' },
  transfer: { text: '调拨', icon: Sort, color: '#E6A23C' },
};

const STATUS_MAP = {
  draft: { text: '草稿', type: 'info' },
  pending: { text: '待审批', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  executing: { text: '执行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'info' },
};

const loading = ref(false);
const tableRef = ref(null);
const guideVisible = ref(false);
const detailVisible = ref(false);
const approvalVisible = ref(false);
const approvalMode = ref('approve');
const currentBusiness = ref(null);

const statistics = reactive({
  total: 0,
  draft: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
});

const filters = reactive({
  businessType: '',
  status: '',
  dateRange: null,
  keyword: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const businessList = ref([]);
const selectedRows = ref([]);

const guideSteps = [
  { title: '新建业务', description: '点击"新建业务"按钮，选择需要申请的业务类型' },
  { title: '填写信息', description: '按照向导步骤填写业务信息，包括基本信息、设备选择等' },
  { title: '提交审批', description: '确认信息无误后提交，进入审批流程' },
  { title: '审批处理', description: '审批人可对待审批的业务进行通过或驳回操作' },
  { title: '执行完成', description: '审批通过后执行业务操作，完成后记录归档' },
];

const canBatchApprove = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.every((row) => row.status === 'pending');
});

const canBatchReject = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.every((row) => row.status === 'pending');
});

const getBusinessTypeText = (type) => BUSINESS_TYPES[type]?.text || type;
const getBusinessTypeIcon = (type) => BUSINESS_TYPES[type]?.icon || Document;
const getBusinessTypeColor = (type) => BUSINESS_TYPES[type]?.color || '#909399';
const getBusinessTypeTagType = (type) => {
  const typeMap = {
    outbound: 'primary',
    inbound: 'success',
    transfer: 'warning',
  };
  return typeMap[type] || 'info';
};

const getStatusText = (status) => STATUS_MAP[status]?.text || status;
const getStatusTagType = (status) => STATUS_MAP[status]?.type || 'info';

const formatDateTime = (date) => {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadStatistics = async () => {
  try {
    const response = await request.get(STOCK_ORDERS_UNIFIED_API.STATISTICS);
    if (response.data?.success) {
      const { data } = response.data;
      statistics.total = data.total || 0;
      statistics.draft = data.draft || 0;
      statistics.pending = data.pending || 0;
      statistics.approved = data.approved || 0;
      statistics.rejected = data.rejected || 0;
      statistics.completed = data.completed || 0;
    } else {
      throw new Error(response.data?.message || '加载统计数据失败');
    }
  } catch (error) {
    logger.error('加载统计数据失败:', error);
    statistics.total = 0;
    statistics.draft = 0;
    statistics.pending = 0;
    statistics.approved = 0;
    statistics.rejected = 0;
    statistics.completed = 0;
  }
};

const loadBusinessList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      businessType: filters.businessType,
      status: filters.status,
      keyword: filters.keyword,
    };

    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].toISOString();
      params.endDate = filters.dateRange[1].toISOString();
    }

    const response = await request.get(STOCK_ORDERS_UNIFIED_API.LIST, { params });

    if (response.data?.success) {
      businessList.value = response.data.data?.content || response.data.data || [];
      pagination.total = response.data.data?.totalElements || businessList.value.length;
    } else {
      throw new Error(response.data?.message || '加载业务列表失败');
    }
  } catch (error) {
    logger.error('加载业务列表失败:', error);
    businessList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const filterByStatus = (status) => {
  filters.status = status === 'all' ? '' : status;
  pagination.current = 1;
  loadBusinessList();
};

const handleFilterChange = () => {
  pagination.current = 1;
  loadBusinessList();
};

let searchTimer = null;
const handleSearchDebounced = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    pagination.current = 1;
    loadBusinessList();
  }, 300);
};

const handleRefresh = () => {
  loadStatistics();
  loadBusinessList();
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const clearSelection = () => {
  tableRef.value?.clearSelection();
};

const handleRowClick = (row) => {
  currentBusiness.value = row;
  detailVisible.value = true;
};

const handleView = (row) => {
  currentBusiness.value = row;
  detailVisible.value = true;
};

const handleEdit = (row) => {
  const routeMap = {
    outbound: '/inventory/outbound-wizard',
    inbound: '/inventory/inbound',
    transfer: '/inventory/transfer',
    installation: '/device/installation',
    repair: '/device/repair',
    maintenance: '/device/maintenance',
    scrap: '/device/scrap',
  };
  const path = routeMap[row.businessType];
  if (path) {
    router.push({ path, query: { id: row.id, mode: 'edit' } });
  }
};

const handleSubmit = async (row) => {
  try {
    await ElMessageBox.confirm('确定要提交此业务申请吗？提交后将进入审批流程。', '确认提交', {
      confirmButtonText: '确定提交',
      cancelButtonText: '取消',
      type: 'info',
    });

    const response = await request.post(STOCK_ORDERS_UNIFIED_API.SUBMIT(row.id));
    if (response.data?.success) {
      ElMessage.success('提交成功，已进入审批流程');
      handleRefresh();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`提交失败：${error.message || '网络错误'}`);
    }
  }
};

const handleApprove = (row) => {
  currentBusiness.value = row;
  approvalMode.value = 'approve';
  approvalVisible.value = true;
};

const handleReject = (row) => {
  currentBusiness.value = row;
  approvalMode.value = 'reject';
  approvalVisible.value = true;
};

const handleApprovalConfirm = async (data) => {
  try {
    const api =
      approvalMode.value === 'approve'
        ? STOCK_ORDERS_UNIFIED_API.AUDIT(currentBusiness.value.id)
        : STOCK_ORDERS_UNIFIED_API.AUDIT(currentBusiness.value.id);

    const response = await request.post(api, {
      approved: approvalMode.value === 'approve',
      comment: data.comment,
    });

    if (response.data?.success) {
      ElMessage.success(approvalMode.value === 'approve' ? '审批通过' : '已驳回');
      approvalVisible.value = false;
      handleRefresh();
    }
  } catch (error) {
    ElMessage.error(`操作失败：${error.message || '网络错误'}`);
  }
};

const handleExecute = async (row) => {
  try {
    await ElMessageBox.confirm('确定要执行此业务操作吗？', '确认执行', {
      confirmButtonText: '确定执行',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await request.post(STOCK_ORDERS_UNIFIED_API.EXECUTE(row.id));
    if (response.data?.success) {
      ElMessage.success('执行成功');
      handleRefresh();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`执行失败：${error.message || '网络错误'}`);
    }
  }
};

const handleResubmit = (row) => {
  handleEdit(row);
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此业务记录吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error',
    });

    const response = await request.delete(STOCK_ORDERS_UNIFIED_API.DELETE(row.id));
    if (response.data?.success) {
      ElMessage.success('删除成功');
      handleRefresh();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败：${error.message || '网络错误'}`);
    }
  }
};

const handleBatchApprove = async () => {
  try {
    const { value: comment } = await ElMessageBox.prompt('请输入审批意见（可选）', '批量审批通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入审批意见',
    });

    const ids = selectedRows.value.map((row) => row.id);
    const response = await request.post(STOCK_ORDERS_UNIFIED_API.BATCH_AUDIT, {
      ids,
      approved: true,
      comment: comment || '',
    });

    if (response.data?.success) {
      ElMessage.success(`已批量通过 ${ids.length} 条记录`);
      clearSelection();
      handleRefresh();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量审批失败：${error.message || '网络错误'}`);
    }
  }
};

const handleBatchReject = async () => {
  try {
    const { value: comment } = await ElMessageBox.prompt('请输入驳回原因', '批量驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入驳回原因',
      inputValidator: (val) => !!val || '请输入驳回原因',
    });

    const ids = selectedRows.value.map((row) => row.id);
    const response = await request.post(STOCK_ORDERS_UNIFIED_API.BATCH_AUDIT, {
      ids,
      approved: false,
      comment,
    });

    if (response.data?.success) {
      ElMessage.success(`已批量驳回 ${ids.length} 条记录`);
      clearSelection();
      handleRefresh();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量驳回失败：${error.message || '网络错误'}`);
    }
  }
};

// 新建业务 - 打开对应向导
const handleCreateBusiness = (command) => {
  switch (command) {
    case 'outbound':
      // 出库跳转到出库管理页面
      router.push('/inventory/outbound');
      break;
    case 'inbound':
      // 入库跳转到入库管理页面
      router.push('/inventory/inbound');
      break;
    case 'transfer':
      // 调拨跳转到调拨管理页面
      router.push('/inventory/transfer');
      break;
    default:
      ElMessage.info(`${getBusinessTypeText(command)}功能开发中...`);
  }
};

const handlePageSizeChange = () => {
  pagination.current = 1;
  loadBusinessList();
};

const handlePageChange = () => {
  loadBusinessList();
};

const showOperationGuide = () => {
  guideVisible.value = true;
};

onMounted(() => {
  loadStatistics();
  loadBusinessList();

  if (route.query.mode === 'approval' || route.query.tab === 'approval') {
    filters.status = 'pending';
    if (route.query.highlight === 'pending') {
      ElMessage.success('出库申请已提交，请等待审批');
    }
  }
});

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});
</script>

<style scoped>
.unified-business-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-overview {
  margin-bottom: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-light);
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-card.total .stat-icon {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.stat-card.draft .stat-icon {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.stat-card.pending .stat-icon {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.stat-card.approved .stat-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.stat-card.rejected .stat-icon {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.stat-card.completed .stat-icon {
  background: rgba(0, 215, 255, 0.1);
  color: #00d7ff;
}

.stat-card .stat-info {
  flex: 1;
}

.stat-card .stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.stat-card .stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
}

.main-content-card {
  flex: 1;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.business-no-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-info-cell {
  line-height: 1.4;
}

.device-info-cell .device-code {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.device-info-cell .device-name {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    width: 100%;
    justify-content: flex-start;
  }

  .pagination-section {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
