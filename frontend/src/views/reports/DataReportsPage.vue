<template>
  <PageLayout title="数据报表" description="查看和导出各类业务数据报表" data-cy="datareportspage-page">
    <template #headerActions>
      <el-button data-cy="btn-0" type="info" :icon="QuestionFilled" @click="handleShowOperationGuide"
        >操作指引</el-button
      >
      <el-button data-cy="btn-3" type="primary" :icon="Download" @click="handleExport" :loading="loading.export"
        >导出报表</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading[queryParams.reportType]"
      header-title="报表筛选"
      :header-icon="TrendCharts"
      :show-result-count="false"
      @search="handleFilterSearch"
      @reset="handleFilterReset"
    />

    <el-card data-cy="card-1" class="summary-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据汇总</span>
        </div>
      </template>

      <div v-loading="loading.summary" class="summary-content">
        <el-row data-cy="row-0" :gutter="20">
          <el-col data-cy="col-0" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="summary-item summary-total">
              <div class="summary-icon">
                <el-icon data-cy="icon-1" :size="32"><Box /></el-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ summaryData.totalCount || 0 }}</div>
                <div class="summary-label">总记录数</div>
              </div>
            </div>
          </el-col>

          <el-col data-cy="col-1" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="summary-item summary-today">
              <div class="summary-icon">
                <el-icon data-cy="icon-2" :size="32"><Calendar /></el-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ summaryData.todayCount || 0 }}</div>
                <div class="summary-label">今日新增</div>
              </div>
            </div>
          </el-col>

          <el-col data-cy="col-2" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="summary-item summary-month">
              <div class="summary-icon">
                <el-icon data-cy="icon-3" :size="32"><Calendar /></el-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ summaryData.monthCount || 0 }}</div>
                <div class="summary-label">本月新增</div>
              </div>
            </div>
          </el-col>

          <el-col data-cy="col-3" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="summary-item summary-value">
              <div class="summary-icon">
                <el-icon data-cy="icon-4" :size="32"><Coin /></el-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ formatCurrency(summaryData.totalValue) }}</div>
                <div class="summary-label">总价值</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card data-cy="card-2" class="chart-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ currentReportLabel }}趋势图</span>
        </div>
      </template>

      <div v-loading="loading[queryParams.reportType]" class="chart-container">
        <div v-if="!reportData[queryParams.reportType]" class="chart-placeholder">
          <el-icon data-cy="icon-5" :size="64"><TrendCharts /></el-icon>
          <p>暂无数据</p>
        </div>
        <div v-else class="chart-content">
          <div class="chart-tabs">
            <el-radio-group data-cy="radio-0" v-model="chartType" size="small">
              <el-radio-button data-cy="radio-1" label="line">折线图</el-radio-button>
              <el-radio-button data-cy="radio-2" label="bar">柱状图</el-radio-button>
              <el-radio-button data-cy="radio-3" label="pie">饼图</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="chartRef" class="chart" style="width: 100%; height: 400px"></div>
        </div>
      </div>
    </el-card>

    <el-card data-cy="card-3" class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ currentReportLabel }}详细数据</span>
          <el-button data-cy="btn-4" type="primary" link size="small" @click="handleRefresh">
            <el-icon data-cy="icon-6"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        data-cy="table-0"
        v-loading="loading[queryParams.reportType]"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'date', order: 'descending' }"
      >
        <el-table-column data-cy="table-1" prop="date" label="日期" width="120" sortable />
        <el-table-column data-cy="table-2" prop="name" label="名称" width="180" />
        <el-table-column data-cy="table-3" prop="code" label="编号" width="150" />
        <el-table-column data-cy="table-4" prop="type" label="类型" width="120" />
        <el-table-column data-cy="table-5" prop="count" label="数量" width="100" sortable />
        <el-table-column data-cy="table-6" prop="value" label="价值" width="120" sortable>
          <template #default="{ row }">
            {{ formatCurrency(row.value) }}
          </template>
        </el-table-column>
        <el-table-column data-cy="table-7" prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag data-cy="tag-0" :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column data-cy="table-8" prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>

      <el-pagination
        data-cy="pagination-0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      data-cy="dialog-0"
      v-model="guideDialogVisible"
      title="操作指引"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="operation-guide">
        <el-steps data-cy="steps-0" :active="currentStep" finish-status="success" align-center>
          <el-step data-cy="step-0" title="筛选查询" />
          <el-step data-cy="step-1" title="数据汇总" />
          <el-step data-cy="step-2" title="图表分析" />
          <el-step data-cy="step-3" title="数据导出" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 筛选查询</h3>
            <p>使用筛选条件快速查找所需的报表数据：</p>
            <ul>
              <li><strong>报表类型</strong>：选择要查看的报表类型，如库存报表、出入库报表、设备报表等</li>
              <li><strong>日期范围</strong>：选择报表的统计时间范围，支持自定义起止日期</li>
              <li><strong>区域筛选</strong>：选择特定区域，查看该区域内的数据统计</li>
              <li><strong>仓库筛选</strong>：选择特定仓库，查看该仓库的详细数据</li>
              <li><strong>设备类型</strong>：筛选特定设备类型的数据，便于分类分析</li>
              <li><strong>查询操作</strong>：点击"查询"按钮应用筛选条件，"重置"按钮恢复默认设置</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-7"><WarningFilled /></el-icon>
              <span>提示：多个筛选条件可以组合使用，系统会同时满足所有条件的记录进行统计</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 数据汇总</h3>
            <p>查看报表的关键指标汇总信息：</p>
            <ul>
              <li><strong>总记录数</strong>：显示当前筛选条件下的总记录数量</li>
              <li><strong>今日新增</strong>：显示今天新增的记录数量</li>
              <li><strong>本月新增</strong>：显示本月新增的记录数量</li>
              <li><strong>总价值</strong>：显示当前筛选条件下所有记录的总价值</li>
              <li><strong>卡片交互</strong>：点击汇总卡片可以查看更详细的数据分析</li>
              <li><strong>实时更新</strong>：汇总数据会根据筛选条件实时更新</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-8"><WarningFilled /></el-icon>
              <span>提示：汇总数据基于当前筛选条件，调整筛选条件后需要点击"查询"按钮更新数据</span>
            </div>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 图表分析</h3>
            <p>通过可视化图表分析数据趋势和分布：</p>
            <ul>
              <li><strong>折线图</strong>：展示数据随时间的变化趋势，适合分析增长或下降趋势</li>
              <li><strong>柱状图</strong>：对比不同类别或时间段的数据量，适合横向对比</li>
              <li><strong>饼图</strong>：展示各部分占总体的比例，适合分析数据分布</li>
              <li><strong>图表切换</strong>：点击图表上方的按钮切换不同的图表类型</li>
              <li><strong>交互功能</strong>：鼠标悬停在图表上可查看详细数据</li>
              <li><strong>响应式设计</strong>：图表会自动适应屏幕大小，支持移动端查看</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-9"><WarningFilled /></el-icon>
              <span>提示：不同报表类型可能适合不同的图表展示方式，建议根据分析目的选择合适的图表类型</span>
            </div>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 数据导出</h3>
            <p>将报表数据导出为文件，便于离线分析和存档：</p>
            <ul>
              <li><strong>导出按钮</strong>：点击"导出报表"按钮开始导出当前报表数据</li>
              <li><strong>导出格式</strong>：支持导出为Excel、CSV等常用格式</li>
              <li><strong>导出范围</strong>：导出当前筛选条件下的所有数据，不受分页限制</li>
              <li><strong>导出进度</strong>：大数据量导出时会显示进度提示</li>
              <li><strong>文件命名</strong>：导出文件自动命名，包含报表类型和导出时间</li>
              <li><strong>刷新数据</strong>：点击"刷新"按钮重新加载最新数据</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-10"><WarningFilled /></el-icon>
              <span>提示：导出操作可能需要一定时间，请耐心等待。建议在非高峰期进行大数据量导出</span>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <el-button data-cy="btn-5" v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
          <el-button data-cy="btn-6" v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
          <el-button data-cy="btn-7" v-if="currentStep === 3" type="success" @click="guideDialogVisible = false"
            >完成</el-button
          >
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Box, Calendar, Coin, Download, QuestionFilled, Refresh, TrendCharts } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { useReports } from '@/composables/useReports';
import { createLogger } from '@/utils/logger';

const logger = createLogger('dataReports');

const {
  loading,
  reportData,
  queryParams,
  reportTypes,
  currentReportType,
  fetchCurrentReport,
  fetchReportSummary,
  exportReportData,
  resetQueryParams,
} = useReports();

const chartRef = ref(null);
const chartInstance = ref(null);
const chartType = ref('line');

const summaryData = computed(() => {
  return reportData.summary || {};
});

const tableData = computed(() => {
  const currentData = reportData[queryParams.reportType];
  return currentData?.list || [];
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

const currentReportLabel = computed(() => {
  const type = reportTypes.find((t) => t.value === queryParams.reportType);
  return type ? type.label : '报表';
});

// 搜索表单
const searchForm = reactive({
  reportType: queryParams.reportType,
  dateRange: queryParams.dateRange || [],
  areaId: queryParams.areaId,
  warehouseId: queryParams.warehouseId,
  deviceTypeId: queryParams.deviceTypeId,
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'reportType',
    label: '报表类型',
    type: 'select',
    placeholder: '请选择报表类型',
    md: 6,
    lg: 4,
    options: reportTypes || [],
  },
  {
    prop: 'dateRange',
    label: '日期范围',
    type: 'dateRange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
    md: 12,
    lg: 8,
  },
  {
    prop: 'areaId',
    label: '区域',
    type: 'select',
    placeholder: '请选择区域',
    clearable: true,
    md: 6,
    lg: 4,
    options: [{ label: '全部区域', value: null }, ...(areas.value || []).map((a) => ({ label: a.name, value: a.id }))],
  },
  {
    prop: 'warehouseId',
    label: '仓库',
    type: 'select',
    placeholder: '请选择仓库',
    clearable: true,
    md: 6,
    lg: 4,
    options: [
      { label: '全部仓库', value: null },
      ...(warehouses.value || []).map((w) => ({ label: w.name, value: w.id })),
    ],
  },
  {
    prop: 'deviceTypeId',
    label: '设备类型',
    type: 'select',
    placeholder: '请选择设备类型',
    clearable: true,
    md: 6,
    lg: 4,
    options: [
      { label: '全部类型', value: null },
      ...(deviceTypes.value || []).map((t) => ({ label: t.name, value: t.id })),
    ],
  },
]);

const areas = ref([]);
const warehouses = ref([]);
const deviceTypes = ref([]);
const guideDialogVisible = ref(false);
const currentStep = ref(0);

// 筛选栏搜索处理
const handleFilterSearch = () => {
  queryParams.reportType = searchForm.reportType;
  queryParams.dateRange = searchForm.dateRange;
  queryParams.areaId = searchForm.areaId;
  queryParams.warehouseId = searchForm.warehouseId;
  queryParams.deviceTypeId = searchForm.deviceTypeId;
  handleSearch();
};

// 筛选栏重置处理
const handleFilterReset = () => {
  searchForm.reportType = 'inventory';
  searchForm.dateRange = [];
  searchForm.areaId = null;
  searchForm.warehouseId = null;
  searchForm.deviceTypeId = null;
  handleReset();
};

const handleShowOperationGuide = () => {
  currentStep.value = 0;
  guideDialogVisible.value = true;
};

const formatCurrency = (value) => {
  if (!value) {
    return '¥0.00';
  }
  return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getStatusType = (status) => {
  const statusMap = {
    normal: 'success',
    warning: 'warning',
    error: 'danger',
    pending: 'info',
  };
  return statusMap[status] || 'info';
};

const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    warning: '警告',
    error: '错误',
    pending: '待处理',
  };
  return statusMap[status] || status;
};

const initChart = () => {
  if (!chartRef.value) {
    return;
  }

  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  chartInstance.value = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance.value) {
    return;
  }

  const currentData = reportData[queryParams.reportType];
  if (!currentData || !currentData.chartData) {
    return;
  }

  const { dates, values, labels } = currentData.chartData;

  let option = {};

  if (chartType.value === 'line') {
    option = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: currentReportLabel.value,
          type: 'line',
          data: values,
          smooth: true,
          areaStyle: {
            opacity: 0.3,
          },
        },
      ],
    };
  } else if (chartType.value === 'bar') {
    option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: labels,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: currentReportLabel.value,
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#409eff',
          },
        },
      ],
    };
  } else if (chartType.value === 'pie') {
    option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: currentReportLabel.value,
          type: 'pie',
          radius: '50%',
          data: labels.map((label, index) => ({
            value: values[index],
            name: label,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  chartInstance.value.setOption(option);
};

const handleSearch = async () => {
  try {
    await fetchCurrentReport();
    await fetchReportSummary();
    await nextTick();
    initChart();
    ElMessage.success('查询成功');
  } catch (error) {
    logger.error('查询失败:', error);
  }
};

const handleReset = () => {
  resetQueryParams();
  handleSearch();
};

const handleRefresh = () => {
  handleSearch();
};

const handleExport = async () => {
  try {
    await exportReportData(queryParams.reportType);
  } catch (error) {
    logger.error('导出失败:', error);
  }
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  handleSearch();
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  handleSearch();
};

watch(chartType, () => {
  updateChart();
});

watch(currentReportType, () => {
  nextTick(() => {
    initChart();
  });
});

onMounted(() => {
  handleSearch();
});

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
});
</script>

<style scoped>
.reports-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-card {
  margin-bottom: 20px;
}

.summary-content {
  padding: 10px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 16px;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 14px;
  color: #909399;
}

.summary-total .summary-icon {
  background: #ecf5ff;
  color: #409eff;
}

.summary-total .summary-value {
  color: #409eff;
}

.summary-today .summary-icon {
  background: #f0f9ff;
  color: #67c23a;
}

.summary-today .summary-value {
  color: #67c23a;
}

.summary-month .summary-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.summary-month .summary-value {
  color: #e6a23c;
}

.summary-value .summary-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.summary-value .summary-value {
  color: #f56c6c;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 10px 0 0 0;
}

.chart-content {
  width: 100%;
}

.chart-tabs {
  margin-bottom: 20px;
  text-align: center;
}

.table-card {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 300px;
}

.guide-item h3 {
  margin-bottom: 15px;
  color: #303133;
}

.guide-item p {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}

.guide-item ul {
  margin-bottom: 20px;
  padding-left: 20px;
}

.guide-item li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.8;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f4f4f5;
  border-left: 4px solid #e6a23c;
  border-radius: 4px;
  color: #e6a23c;
}

.guide-tip .el-icon {
  font-size: 18px;
}

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 767px) {
  .summary-item {
    padding: 16px;
  }

  .summary-icon {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }

  .summary-value {
    font-size: 24px;
  }

  .summary-label {
    font-size: 12px;
  }
}
</style>
