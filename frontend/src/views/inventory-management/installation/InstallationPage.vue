<!--
  @file: InstallationPage.vue
  @description: 安装记录追踪页面 - 只读查看模式
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 4.0
  @modifyRecords:
      2025-12-21: 初始版本创建
      2026-02-13: 整合InstallationDialog组件，增强安装记录管理功能
      2026-02-13: 移除增删改功能，改为只读查看模式（记录由出库流程自动生成）
-->
<template>
  <PageLayout title="安装记录查询" description="查看设备安装记录（由出库流程自动生成）">
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="handleShowOperationGuide">操作指引</el-button>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading">导出数据</el-button>
    </template>

    <el-alert title="业务流程说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
      <template #default>
        <div>
          安装记录由<span style="color: var(--el-color-primary); font-weight: 500">出库管理</span>→<span
            style="color: var(--el-color-primary); font-weight: 500"
            >安装出库</span
          >流程自动生成。请前往出库管理页面创建设备安装出库单，系统将自动生成安装记录。
        </div>
      </template>
    </el-alert>

    <InstallationStatisticsCard :statistics="statistics" :loading="loading" @stat-click="handleStatClick" />

    <UnifiedFilterBar
      v-model="searchForm"
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
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      height="500px"
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="installationNo" label="安装单号" width="180" />
      <el-table-column prop="sourceOutboundNo" label="来源出库单" width="140">
        <template #default="{ row }">
          <span v-if="row.sourceOutboundNo" class="source-link" @click="handleViewOutbound(row)">
            {{ row.sourceOutboundNo }}
          </span>
          <el-tag v-else type="info" size="small">手动创建</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编号" width="150" />
      <el-table-column prop="deviceName" label="设备名称" min-width="180" />
      <el-table-column prop="installationDate" label="安装日期" width="120" />
      <el-table-column prop="installer" label="安装人员" width="120" />
      <el-table-column prop="location" label="安装位置" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 安装记录详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="安装记录详情" width="900px" destroy-on-close>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="安装单号" :span="1">{{ currentRow?.installationNo }}</el-descriptions-item>
        <el-descriptions-item label="来源" :span="1">
          <span v-if="currentRow?.sourceOutboundNo">
            <el-tag type="success" size="small">出库安装</el-tag>
            <span class="source-link ml-2" @click="handleViewOutbound(currentRow)">
              {{ currentRow.sourceOutboundNo }}
            </span>
          </span>
          <el-tag v-else type="info" size="small">手动创建</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getStatusType(currentRow?.status)">{{ getStatusText(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备编号" :span="1">{{ currentRow?.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备名称" :span="2">{{ currentRow?.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="安装日期" :span="1">{{ currentRow?.installationDate }}</el-descriptions-item>
        <el-descriptions-item label="安装人员" :span="1">{{ currentRow?.installer }}</el-descriptions-item>
        <el-descriptions-item label="安装位置" :span="1">{{ currentRow?.location }}</el-descriptions-item>
        <el-descriptions-item label="客户名称" :span="1" v-if="currentRow?.customerName">
          {{ currentRow.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话" :span="1" v-if="currentRow?.contactPhone">
          {{ currentRow.contactPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="安装费用" :span="1" v-if="currentRow?.installationFee">
          ¥{{ currentRow.installationFee.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ currentRow?.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 安装图片 -->
      <div class="detail-section" v-if="currentRow?.images && currentRow.images.length > 0">
        <div class="section-title">
          <el-icon><Picture /></el-icon>
          <span>安装图片</span>
        </div>
        <div class="image-list">
          <el-image
            v-for="(img, index) in currentRow.images"
            :key="index"
            :src="img"
            :preview-src-list="currentRow.images"
            fit="cover"
            class="install-image"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint" v-if="currentRow?.status === 'completed'">
          打印安装单
        </el-button>
      </template>
    </el-dialog>

    <!-- 操作指引对话框 -->
    <el-dialog v-model="guideDialogVisible" title="操作指引" width="900px" :close-on-click-modal="false">
      <div class="operation-guide">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="创建设备出库" />
          <el-step title="生成安装单" />
          <el-step title="执行安装" />
          <el-step title="完成安装" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 创建设备出库</h3>
            <p>在出库管理页面创建设备安装出库单：</p>
            <ul>
              <li><strong>选择出库类型</strong>：选择"安装出库"类型</li>
              <li><strong>选择设备</strong>：选择需要安装的设备</li>
              <li><strong>填写信息</strong>：填写客户信息、安装地址等</li>
              <li><strong>提交出库</strong>：提交出库单并等待审核</li>
            </ul>
            <div class="guide-tip">
              <el-icon><WarningFilled /></el-icon>
              <span>提示：安装出库单审核通过后会自动生成安装单</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 生成安装单</h3>
            <p>系统自动生成安装单：</p>
            <ul>
              <li><strong>自动关联</strong>：安装单自动关联出库单</li>
              <li><strong>状态跟踪</strong>：可在安装记录页面查看状态</li>
            </ul>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 执行安装</h3>
            <p>安装人员执行设备安装：</p>
            <ul>
              <li><strong>查看任务</strong>：在安装记录页面查看待安装任务</li>
              <li><strong>现场安装</strong>：按安装单要求执行设备安装</li>
              <li><strong>记录信息</strong>：记录安装过程、拍照存档</li>
              <li><strong>更新状态</strong>：将状态更新为"安装中"</li>
            </ul>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 完成安装</h3>
            <p>安装完成后进行确认：</p>
            <ul>
              <li><strong>确认完成</strong>：确认安装工作已完成</li>
              <li><strong>客户验收</strong>：客户确认并签字</li>
              <li><strong>状态更新</strong>：将状态更新为"已完成"</li>
              <li><strong>归档保存</strong>：安装单归档保存</li>
            </ul>
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
import { Download, View, QuestionFilled, WarningFilled, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import InstallationAPI from '@/api/installation/installation';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import InstallationStatisticsCard from '@/components/business/installation/InstallationStatisticsCard.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { createLogger } from '@/utils/logger';

const router = useRouter();
const logger = createLogger('InstallationPage');

// 搜索参数
const searchForm = reactive({
  installationNo: '',
  deviceCode: '',
  deviceName: '',
  installer: '',
  status: '',
  dateRange: [],
});

// 筛选字段配置
const searchFields = computed(() => [
  {
    prop: 'installationNo',
    label: '安装单号',
    type: 'input',
    placeholder: '请输入安装单号',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'deviceCode',
    label: '设备编号',
    type: 'input',
    placeholder: '请输入设备编号',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    type: 'input',
    placeholder: '请输入设备名称',
    md: 8,
    lg: 6,
    clearable: true,
  },
  { prop: 'installer', label: '安装人员', type: 'input', placeholder: '请输入安装人员', md: 8, lg: 6, clearable: true },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '待安装', value: 'pending' },
      { label: '安装中', value: 'installing' },
      { label: '已完成', value: 'completed' },
    ],
  },
  {
    prop: 'dateRange',
    label: '安装日期',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.installation(searchFields.value));

// 状态
const loading = ref(false);
const exportLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });

// 统计数据
const statistics = reactive({
  totalCount: 0,
  pendingCount: 0,
  installingCount: 0,
  completedCount: 0,
});

// 对话框状态
const detailDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentStep = ref(0);
const currentRow = ref(null);

// 状态映射
const getStatusType = (status) => ({ pending: 'info', installing: 'warning', completed: 'success' })[status] || 'info';
const getStatusText = (status) => ({ pending: '待安装', installing: '安装中', completed: '已完成' })[status] || status;

// 加载安装记录列表
const loadInstallationList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      installationNo: searchForm.installationNo || undefined,
      deviceCode: searchForm.deviceCode || undefined,
      deviceName: searchForm.deviceName || undefined,
      installer: searchForm.installer || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
    };

    const response = await InstallationAPI.getInstallationList(params);

    if (response.code === 200 && response.data) {
      tableData.value = response.data.records || response.data.list || [];
      pagination.total = response.data.total || 0;

      // 更新统计数据
      statistics.totalCount = pagination.total;
      statistics.pendingCount = tableData.value.filter((item) => item.status === 'pending').length;
      statistics.installingCount = tableData.value.filter((item) => item.status === 'installing').length;
      statistics.completedCount = tableData.value.filter((item) => item.status === 'completed').length;
    } else {
      ElMessage.error(response.message || '加载安装记录列表失败');
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    logger.error('加载安装记录列表失败', error);
    ElMessage.error('加载安装记录列表失败，请检查网络连接');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  loadInstallationList();
};

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = Array.isArray(searchForm[key]) ? [] : '';
  });
  handleSearch();
};

// 分页变化
const handlePageChange = (page) => {
  pagination.currentPage = page;
  loadInstallationList();
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

// 查看详情
const handleView = (row) => {
  currentRow.value = row;
  detailDialogVisible.value = true;
};

// 查看来源出库单
const handleViewOutbound = (row) => {
  if (row.sourceOutboundId) {
    router.push({
      path: '/inventory-management/outbound',
      query: { id: row.sourceOutboundId, action: 'view' },
    });
  }
};

const handleStatClick = (type) => {
  switch (type) {
    case 'total':
      break;
    case 'pending':
      searchForm.status = 'PENDING';
      handleSearch();
      break;
    case 'installing':
      searchForm.status = 'INSTALLING';
      handleSearch();
      break;
    case 'completed':
      searchForm.status = 'COMPLETED';
      handleSearch();
      break;
  }
};

// 导出
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      installationNo: searchForm.installationNo || undefined,
      deviceCode: searchForm.deviceCode || undefined,
      deviceName: searchForm.deviceName || undefined,
      installer: searchForm.installer || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
    };

    const response = await InstallationAPI.exportInstallationRecords(params);
    if (response) {
      ElMessage.success('导出成功');
    }
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 打印安装单
const handlePrint = () => {
  ElMessage.info('打印功能开发中');
};

// 初始化
onMounted(() => {
  loadInstallationList();
});
</script>

<style scoped>
/* 来源链接样式 */
.source-link {
  color: var(--primary-600);
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.source-link:hover {
  color: var(--primary-700);
}

.ml-2 {
  margin-left: 8px;
}

/* 详情区域样式 */
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

.image-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.install-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

/* 操作指引样式 */
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

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}
</style>
