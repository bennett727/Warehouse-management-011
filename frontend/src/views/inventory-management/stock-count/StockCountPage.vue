<!--
  @file: StockCountPage.vue
  @description: 库存盘点管理页面 - 整合StockCountDialog组件功能
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 3.0
  @modifyRecords:
      2025-12-21: 初始版本创建
      2026-02-13: 整合StockCountDialog组件，增强盘点单管理功能
-->
<template>
  <PageLayout title="库存盘点管理" description="管理库存盘点流程，支持全盘、抽盘和循环盘点" data-cy="stock-count-page">
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="handleShowOperationGuide">操作指引</el-button>
      <el-button type="primary" :icon="Plus" @click="handleCreate" data-cy="stock-count-create-btn"
        >新建盘点单</el-button
      >
      <el-button
        type="success"
        :icon="Download"
        @click="handleExport"
        :loading="exportLoading"
        data-cy="stock-count-export-btn"
        >导出</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchParams"
      :fields="filterConfig.fields"
      :loading="loading"
      :header-title="filterConfig.header.title"
      :header-icon="filterConfig.header.icon"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable
      :data="tableData"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      height="500px"
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="countNo" label="盘点单号" width="180" sortable />
      <el-table-column prop="countType" label="盘点类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getCountTypeType(row.countType)">
            {{ getCountTypeText(row.countType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="countDate" label="盘点日期" width="120" sortable />
      <el-table-column prop="warehouseName" label="盘点仓库" width="150" />
      <el-table-column prop="zoneName" label="盘点区域" width="120" show-overflow-tooltip />
      <el-table-column prop="operatorName" label="盘点人员" width="120" />
      <el-table-column prop="totalItems" label="盘点项数" width="90" align="center" />
      <el-table-column prop="diffItems" label="差异项数" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.diffItems > 0 ? 'danger' : 'success'" size="small">
            {{ row.diffItems || 0 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" :icon="Edit" @click="handleEdit(row)" :disabled="row.status === 'completed'"
            >编辑</el-button
          >
          <el-button
            link
            type="warning"
            :icon="CircleCheck"
            @click="handleStartCount(row)"
            v-if="row.status === 'pending'"
            >开始盘点</el-button
          >
          <el-button link type="success" :icon="Check" @click="handleComplete(row)" v-if="row.status === 'counting'"
            >完成盘点</el-button
          >
          <el-button link type="danger" :icon="Delete" @click="handleDelete(row)" :disabled="row.status === 'completed'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </DataTable>

    <!-- 盘点单对话框 - 整合StockCountDialog功能 -->
    <StockCountDialog
      v-model="dialogVisible"
      :mode="dialogType"
      :initial-data="currentRow"
      @confirm="handleDialogSuccess"
    />

    <!-- 盘点单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="盘点单详情" width="1000px" destroy-on-close>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="盘点单号" :span="1">{{ currentRow?.countNo }}</el-descriptions-item>
        <el-descriptions-item label="盘点类型" :span="1">
          <el-tag :type="getCountTypeType(currentRow?.countType)">
            {{ getCountTypeText(currentRow?.countType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getStatusType(currentRow?.status)">{{ getStatusText(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="盘点仓库" :span="1">{{ currentRow?.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="盘点区域" :span="1">{{ currentRow?.zoneName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="盘点日期" :span="1">{{ currentRow?.countDate }}</el-descriptions-item>
        <el-descriptions-item label="盘点人员" :span="1">{{ currentRow?.operatorName }}</el-descriptions-item>
        <el-descriptions-item label="盘点项数" :span="1">{{ currentRow?.totalItems || 0 }}</el-descriptions-item>
        <el-descriptions-item label="差异项数" :span="1">
          <el-tag :type="(currentRow?.diffItems || 0) > 0 ? 'danger' : 'success'" size="small">
            {{ currentRow?.diffItems || 0 }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ currentRow?.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 盘点明细 -->
      <div class="detail-section" v-if="currentRow?.items && currentRow.items.length > 0">
        <div class="section-title">
          <el-icon><List /></el-icon>
          <span>盘点明细</span>
        </div>
        <el-table :data="currentRow.items" stripe border size="small">
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column prop="deviceCode" label="设备编号" width="120" />
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="specification" label="规格型号" width="120" />
          <el-table-column prop="binCode" label="货位" width="100" />
          <el-table-column prop="bookQuantity" label="账面数量" width="90" align="center" />
          <el-table-column prop="actualQuantity" label="实盘数量" width="90" align="center" />
          <el-table-column label="差异数量" width="90" align="center">
            <template #default="{ row }">
              <span :class="getDiffClass(row)">
                {{ (row.actualQuantity || 0) - (row.bookQuantity || 0) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="diffReason" label="差异原因" min-width="120" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportDetail" v-if="currentRow?.items?.length > 0">
          导出明细
        </el-button>
      </template>
    </el-dialog>

    <!-- 操作指引对话框 -->
    <el-dialog v-model="guideDialogVisible" title="操作指引" width="900px" :close-on-click-modal="false">
      <div class="operation-guide">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="新建盘点单" />
          <el-step title="开始盘点" />
          <el-step title="录入实盘" />
          <el-step title="完成盘点" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 新建盘点单</h3>
            <p>创建新的库存盘点单：</p>
            <ul>
              <li><strong>盘点类型</strong>：选择全盘、抽盘或循环盘点</li>
              <li><strong>盘点仓库</strong>：选择要盘点的仓库</li>
              <li><strong>盘点区域</strong>：选择具体的盘点区域（可选）</li>
              <li><strong>盘点日期</strong>：选择计划盘点的日期</li>
              <li><strong>盘点人员</strong>：指定负责盘点的人员</li>
            </ul>
            <div class="guide-tip">
              <el-icon><WarningFilled /></el-icon>
              <span>提示：全盘将盘点仓库所有库存，抽盘可选择特定设备或区域</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 开始盘点</h3>
            <p>开始实际的盘点工作：</p>
            <ul>
              <li><strong>锁定仓库</strong>：开始盘点时会自动锁定仓库，防止库存变动</li>
              <li><strong>生成盘点清单</strong>：系统自动生成盘点清单，包含账面数量</li>
              <li><strong>打印清单</strong>：可打印盘点清单，方便现场盘点</li>
              <li><strong>状态变更</strong>：盘点单状态变为"盘点中"</li>
            </ul>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 录入实盘数据</h3>
            <p>录入实际盘点结果：</p>
            <ul>
              <li><strong>实盘数量</strong>：录入实际盘点得到的数量</li>
              <li><strong>差异记录</strong>：如与账面数量不符，记录差异原因</li>
              <li><strong>分批录入</strong>：支持多次录入，系统自动累计</li>
              <li><strong>临时保存</strong>：可随时保存当前进度</li>
            </ul>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 完成盘点</h3>
            <p>完成盘点并处理差异：</p>
            <ul>
              <li><strong>差异确认</strong>：系统对比账面与实盘，生成差异报告</li>
              <li><strong>生成调整单</strong>：自动或手动生成库存调整单</li>
              <li><strong>释放锁定</strong>：完成盘点后自动释放仓库锁定</li>
              <li><strong>状态变更</strong>：盘点单状态变为"已完成"</li>
            </ul>
            <div class="guide-warning">
              <el-icon><Warning /></el-icon>
              <span>警告：完成盘点后将更新库存数据，请确保盘点数据准确！</span>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
          <el-button v-else type="primary" @click="handleGuideFinish">完成</el-button>
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import {
  Download,
  Plus,
  View,
  Edit,
  Delete,
  Check,
  CircleCheck,
  QuestionFilled,
  Warning,
  WarningFilled,
  List,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  completeStockCount,
  deleteStockCount,
  getStockCountDetail,
  getStockCountList,
  startStockCount,
} from '@/api/inventory/stockCount';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import StockCountDialog from '@/components/business/dialogs/StockCountDialog.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { exportToExcel } from '@/utils/dataHandler';
import inventoryLockManager from '@/utils/inventoryLockManager';
import { createLogger } from '@/utils/logger';

const router = useRouter();
const logger = createLogger('StockCountPage');

// 搜索参数
const searchParams = reactive({
  countNo: '',
  countType: '',
  warehouseId: '',
  zoneId: '',
  status: '',
  dateRange: [],
});

// 搜索字段配置
const searchFields = computed(() => [
  { prop: 'countNo', label: '盘点单号', type: 'input', placeholder: '请输入盘点单号', md: 8, lg: 6, clearable: true },
  {
    prop: 'countType',
    label: '盘点类型',
    type: 'select',
    placeholder: '请选择盘点类型',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '全盘', value: 0 },
      { label: '抽盘', value: 1 },
      { label: '循环盘点', value: 2 },
    ],
  },
  {
    prop: 'warehouseId',
    label: '盘点仓库',
    type: 'select',
    placeholder: '请选择仓库',
    md: 8,
    lg: 6,
    clearable: true,
    options: [],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '待盘点', value: 'pending' },
      { label: '盘点中', value: 'counting' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ],
  },
  {
    prop: 'dateRange',
    label: '盘点日期',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.stockCount(searchFields.value));

// 状态
const loading = ref(false);
const exportLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

// 对话框状态
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentStep = ref(0);
const dialogType = ref('create'); // create, edit
const currentRow = ref(null);

// 状态映射
const getCountTypeText = (type) => {
  const map = { 0: '全盘', 1: '抽盘', 2: '循环盘点' };
  return map[type] || type;
};

const getCountTypeType = (type) => {
  const map = { 0: 'primary', 1: 'success', 2: 'warning' };
  return map[type] || '';
};

const getStatusType = (status) =>
  ({ pending: 'info', counting: 'warning', completed: 'success', cancelled: 'info' })[status] || 'info';
const getStatusText = (status) =>
  ({ pending: '待盘点', counting: '盘点中', completed: '已完成', cancelled: '已取消' })[status] || status;

const getDiffClass = (row) => {
  const diff = (row.actualQuantity || 0) - (row.bookQuantity || 0);
  if (diff > 0) {
    return 'diff-positive';
  }
  if (diff < 0) {
    return 'diff-negative';
  }
  return 'diff-zero';
};

// 加载盘点单列表
const loadStockCountList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      countNo: searchParams.countNo || undefined,
      countType: searchParams.countType !== '' ? searchParams.countType : undefined,
      warehouseId: searchParams.warehouseId || undefined,
      zoneId: searchParams.zoneId || undefined,
      status: searchParams.status || undefined,
      startDate: searchParams.dateRange?.[0] || undefined,
      endDate: searchParams.dateRange?.[1] || undefined,
    };

    const response = await getStockCountList(params);

    if (response.code === 200 && response.data) {
      tableData.value = response.data.records || response.data.list || [];
      pagination.total = response.data.total || 0;
    } else {
      ElMessage.error(response.message || '加载盘点单列表失败');
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    logger.error('加载盘点单列表失败', error);
    ElMessage.error('加载盘点单列表失败，请检查网络连接');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadStockCountList();
};

// 重置
const handleReset = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = Array.isArray(searchParams[key]) ? [] : '';
  });
  handleSearch();
};

// 分页变化
const handlePageChange = (page) => {
  pagination.current = page;
  loadStockCountList();
};

// 操作指引
const handleShowOperationGuide = () => {
  guideDialogVisible.value = true;
  currentStep.value = 0;
};

const handleGuideFinish = () => {
  guideDialogVisible.value = false;
  currentStep.value = 0;
};

// 新建
const handleCreate = () => {
  dialogType.value = 'create';
  currentRow.value = {};
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit';
  currentRow.value = { ...row };
  dialogVisible.value = true;
};

// 查看
const handleView = async (row) => {
  try {
    const response = await getStockCountDetail(row.id);
    if (response.code === 200) {
      currentRow.value = response.data;
      detailDialogVisible.value = true;
    } else {
      ElMessage.error(response.message || '获取详情失败');
    }
  } catch (error) {
    logger.error('获取盘点单详情失败', error);
    ElMessage.error('获取详情失败');
  }
};

// 开始盘点
const handleStartCount = async (row) => {
  try {
    await ElMessageBox.confirm('确定要开始盘点吗？开始盘点后将锁定仓库库存。', '开始盘点确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await startStockCount(row.id);
    if (response.code === 200) {
      // 锁定仓库
      inventoryLockManager.lockWarehouse(row.warehouseId, `盘点中 - ${row.countNo}`);
      ElMessage.success('盘点已开始，仓库已锁定');
      loadStockCountList();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('开始盘点失败', error);
      ElMessage.error('操作失败');
    }
  }
};

// 完成盘点
const handleComplete = async (row) => {
  try {
    const detailResponse = await getStockCountDetail(row.id);
    const items = detailResponse.data?.items || [];

    const differences = items.filter((item) => {
      const bookQty = item.bookQuantity || 0;
      const actualQty = item.actualQuantity || 0;
      return bookQty !== actualQty;
    });

    let confirmMessage = '确定要完成该盘点单吗？';
    if (differences.length > 0) {
      confirmMessage = `检测到 ${differences.length} 项盘点差异，完成盘点后将自动生成库存调整单。确定要继续吗？`;
    }

    await ElMessageBox.confirm(confirmMessage, '完成确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: differences.length > 0 ? 'warning' : 'info',
    });

    const response = await completeStockCount(row.id);
    if (response.code === 200) {
      // 释放仓库锁定
      inventoryLockManager.unlockWarehouse(row.warehouseId);
      logger.info(`盘点完成，已释放仓库 ${row.warehouseId} 的锁定`);

      if (differences.length > 0) {
        ElMessage.success(`盘点完成，已生成库存调整单（${differences.length}项差异）`);
        // 跳转到调整单页面
        setTimeout(() => {
          router.push({
            path: '/inventory/adjustment',
            query: { stockCountId: row.id },
          });
        }, 1500);
      } else {
        ElMessage.success('盘点完成，无差异项');
        loadStockCountList();
      }
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('完成盘点失败', error);
      ElMessage.error('操作失败');
    }
  }
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该盘点单吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteStockCount(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadStockCountList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除盘点单失败', error);
      ElMessage.error('删除失败');
    }
  }
};

// 导出
const handleExport = async () => {
  exportLoading.value = true;
  try {
    if (!tableData.value || tableData.value.length === 0) {
      ElMessage.warning('暂无数据可导出');
      return;
    }

    const exportData = tableData.value.map((item, index) => ({
      序号: index + 1,
      盘点单号: item.countNo,
      盘点类型: getCountTypeText(item.countType),
      盘点日期: item.countDate,
      盘点仓库: item.warehouseName,
      盘点区域: item.zoneName || '-',
      盘点人员: item.operatorName,
      盘点项数: item.totalItems || 0,
      差异项数: item.diffItems || 0,
      状态: getStatusText(item.status),
      备注: item.remark || '-',
    }));

    const success = await exportToExcel(exportData, '库存盘点单', {
      headers: {
        序号: '序号',
        盘点单号: '盘点单号',
        盘点类型: '盘点类型',
        盘点日期: '盘点日期',
        盘点仓库: '盘点仓库',
        盘点区域: '盘点区域',
        盘点人员: '盘点人员',
        盘点项数: '盘点项数',
        差异项数: '差异项数',
        状态: '状态',
        备注: '备注',
      },
    });

    if (success) {
      ElMessage.success('导出成功');
    }
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 导出明细
const handleExportDetail = async () => {
  try {
    if (!currentRow.value?.items || currentRow.value.items.length === 0) {
      ElMessage.warning('暂无明细数据可导出');
      return;
    }

    const exportData = currentRow.value.items.map((item, index) => ({
      序号: index + 1,
      设备编号: item.deviceCode,
      设备名称: item.deviceName,
      规格型号: item.specification || '-',
      货位: item.binCode || '-',
      账面数量: item.bookQuantity || 0,
      实盘数量: item.actualQuantity || 0,
      差异数量: (item.actualQuantity || 0) - (item.bookQuantity || 0),
      差异原因: item.diffReason || '-',
      备注: item.remark || '-',
    }));

    const success = await exportToExcel(exportData, `盘点明细_${currentRow.value.countNo}`, {
      headers: {
        序号: '序号',
        设备编号: '设备编号',
        设备名称: '设备名称',
        规格型号: '规格型号',
        货位: '货位',
        账面数量: '账面数量',
        实盘数量: '实盘数量',
        差异数量: '差异数量',
        差异原因: '差异原因',
        备注: '备注',
      },
    });

    if (success) {
      ElMessage.success('明细导出成功');
    }
  } catch (error) {
    logger.error('导出明细失败', error);
    ElMessage.error('导出明细失败');
  }
};

// 对话框成功回调
const handleDialogSuccess = () => {
  dialogVisible.value = false;
  loadStockCountList();
};

// 初始化
onMounted(() => {
  loadStockCountList();
});
</script>

<style scoped>
.detail-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.diff-positive {
  color: #67c23a;
  font-weight: bold;
}

.diff-negative {
  color: #f56c6c;
  font-weight: bold;
}

.diff-zero {
  color: #909399;
}

.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 200px;
}

.guide-item h3 {
  color: #409eff;
  margin-bottom: 15px;
}

.guide-item ul {
  padding-left: 20px;
  line-height: 2;
}

.guide-item li {
  margin-bottom: 8px;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  margin-top: 15px;
  color: #606266;
}

.guide-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #fdf6ec;
  border-radius: 4px;
  margin-top: 15px;
  color: #e6a23c;
}

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}
</style>
