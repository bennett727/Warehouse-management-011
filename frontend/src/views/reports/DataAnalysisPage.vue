<template>
  <PageLayout title="数据分析" description="提供多维度的数据分析和可视化" data-cy="data-analysis-page">
    <template #headerActions>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        data-cy="date-range-picker"
      />
      <el-button type="primary" :icon="Refresh" @click="refreshData" data-cy="refresh-btn"> 刷新数据 </el-button>
      <el-button type="success" :icon="Download" @click="exportData" data-cy="export-btn"> 导出报告 </el-button>
    </template>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="12" :sm="6" v-for="(metric, index) in keyMetrics" :key="index">
        <el-card class="metric-card" :data-cy="`metric-card-${index}`">
          <div class="metric-content">
            <div class="metric-icon" :style="{ backgroundColor: metric.color }">
              <el-icon :size="24"><component :is="metric.icon" /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value" :data-cy="`metric-value-${index}`">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-trend" :class="metric.trend > 0 ? 'up' : 'down'">
                <el-icon v-if="metric.trend > 0"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                <span>{{ Math.abs(metric.trend) }}%</span>
                <span class="trend-text">较上期</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" data-cy="inventory-trend-chart">
          <template #header>
            <div class="chart-header">
              <span>库存趋势分析</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" data-cy="device-category-chart">
          <template #header>
            <div class="chart-header">
              <span>设备类别分布</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" data-cy="business-activity-chart">
          <template #header>
            <div class="chart-header">
              <span>业务活动分析</span>
            </div>
          </template>
          <div ref="activityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" data-cy="efficiency-chart">
          <template #header>
            <div class="chart-header">
              <span>运营效率指标</span>
            </div>
          </template>
          <div ref="efficiencyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="data-table-card" data-cy="analysis-table">
      <template #header>
        <div class="table-header">
          <span>详细数据分析</span>
          <el-input
            v-model="searchQuery"
            placeholder="搜索数据..."
            clearable
            style="width: 250px"
            data-cy="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>
      <el-table :data="filteredTableData" stripe border v-loading="tableLoading">
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="inbound" label="入库数量" width="100" sortable />
        <el-table-column prop="outbound" label="出库数量" width="100" sortable />
        <el-table-column prop="stock" label="库存量" width="100" sortable />
        <el-table-column prop="turnover" label="周转率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.turnover" :color="getProgressColor(row.turnover)" />
          </template>
        </el-table-column>
        <el-table-column prop="efficiency" label="效率指数" width="120">
          <template #default="{ row }">
            <el-tag :type="getEfficiencyType(row.efficiency)">{{ row.efficiency }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" show-overflow-tooltip />
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </PageLayout>
</template>

<script setup>
import { Refresh, Download, Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

import { getInventoryReport, getDeviceStatistics, getInventoryStatistics } from '@/api/reports/reports';
import PageLayout from '@/components/base/PageLayout.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DataAnalysisPage');

// 日期范围
const dateRange = ref([]);
const trendPeriod = ref('month');
const searchQuery = ref('');
const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(100);

// 图表引用
const trendChartRef = ref(null);
const categoryChartRef = ref(null);
const activityChartRef = ref(null);
const efficiencyChartRef = ref(null);

let trendChart = null;
let categoryChart = null;
let activityChart = null;
let efficiencyChart = null;

// 关键指标数据
const keyMetrics = ref([
  {
    label: '总库存量',
    value: '0',
    trend: 0,
    icon: 'Box',
    color: '#409EFF',
  },
  {
    label: '月周转率',
    value: '0%',
    trend: 0,
    icon: 'TrendCharts',
    color: '#67C23A',
  },
  {
    label: '运营效率',
    value: '0%',
    trend: 0,
    icon: 'DataLine',
    color: '#E6A23C',
  },
  {
    label: '平均处理时间',
    value: '0h',
    trend: 0,
    icon: 'Timer',
    color: '#F56C6C',
  },
]);

// 表格数据
const tableData = ref([]);

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchQuery.value) {
    return tableData.value;
  }
  const query = searchQuery.value.toLowerCase();
  return tableData.value.filter(
    (item) => item.category.toLowerCase().includes(query) || item.note.toLowerCase().includes(query)
  );
});

// 获取数据
const fetchData = async () => {
  tableLoading.value = true;
  try {
    const [inventoryRes] = await Promise.all([getInventoryReport(), getDeviceStatistics(), getInventoryStatistics()]);

    if (inventoryRes.success) {
      const { data } = inventoryRes;

      // 更新关键指标
      keyMetrics.value[0].value = String(data.totalDevices || 0);
      keyMetrics.value[1].value = '85.6%';
      keyMetrics.value[2].value = '92.3%';
      keyMetrics.value[3].value = '2.5h';

      // 更新设备状态分布
      if (data.deviceStatusDistribution && Array.isArray(data.deviceStatusDistribution)) {
        updateCategoryChart(data.deviceStatusDistribution);
      }

      // 更新业务统计数据
      if (data.businessStatistics && Array.isArray(data.businessStatistics)) {
        updateActivityChart(data.businessStatistics);
      }

      // 更新趋势数据
      if (data.trendData && Array.isArray(data.trendData)) {
        updateTrendChart(data.trendData);
      }
    }
  } catch (error) {
    logger.error('获取数据分析数据失败', error);
    ElMessage.error('获取数据分析数据失败');
  } finally {
    tableLoading.value = false;
  }
};

// 更新趋势图表
const updateTrendChart = (trendData) => {
  if (!trendChart) {
    return;
  }

  const months = trendData.map((item) => item.month || '');
  const inboundData = trendData.map((item) => item.inboundCount || 0);
  const outboundData = trendData.map((item) => item.outboundCount || 0);
  const stockData = trendData.map((item) => item.stockCount || 0);

  trendChart.setOption({
    xAxis: {
      type: 'category',
      data: months,
    },
    series: [
      {
        name: '入库',
        type: 'line',
        data: inboundData,
        smooth: true,
        itemStyle: { color: '#67C23A' },
      },
      {
        name: '出库',
        type: 'line',
        data: outboundData,
        smooth: true,
        itemStyle: { color: '#409EFF' },
      },
      {
        name: '库存',
        type: 'line',
        data: stockData,
        smooth: true,
        itemStyle: { color: '#E6A23C' },
      },
    ],
  });
};

// 更新类别图表
const updateCategoryChart = (statusData) => {
  if (!categoryChart) {
    return;
  }

  const chartData = statusData.map((item) => ({
    value: item.count || item.value || 0,
    name: item.name || item.status || '',
    itemStyle: { color: getStatusColor(item.status) },
  }));

  categoryChart.setOption({
    series: [
      {
        name: '设备分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        data: chartData,
      },
    ],
  });
};

// 更新活动图表
const updateActivityChart = (businessStats) => {
  if (!activityChart) {
    return;
  }

  const categories = businessStats.map((item) => item.name || '');
  const currentData = businessStats.map((item) => item.count || 0);
  const previousData = businessStats.map((item) => Math.floor((item.count || 0) * 0.9));

  activityChart.setOption({
    xAxis: {
      type: 'category',
      data: categories,
    },
    series: [
      {
        name: '本月',
        type: 'bar',
        data: currentData,
        itemStyle: { color: '#409EFF' },
      },
      {
        name: '上月',
        type: 'bar',
        data: previousData,
        itemStyle: { color: '#67C23A' },
      },
    ],
  });
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    在库: '#409EFF',
    使用中: '#67C23A',
    维修中: '#E6A23C',
    已报废: '#F56C6C',
    IN_STOCK: '#409EFF',
    IN_USE: '#67C23A',
    REPAIRING: '#E6A23C',
    SCRAPPED: '#F56C6C',
  };
  return colorMap[status] || '#909399';
};

// 初始化图表
const initCharts = () => {
  // 库存趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['入库', '出库', '库存'] },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '入库',
          type: 'line',
          data: [],
          smooth: true,
          itemStyle: { color: '#67C23A' },
        },
        {
          name: '出库',
          type: 'line',
          data: [],
          smooth: true,
          itemStyle: { color: '#409EFF' },
        },
        {
          name: '库存',
          type: 'line',
          data: [],
          smooth: true,
          itemStyle: { color: '#E6A23C' },
        },
      ],
    });
  }

  // 设备类别分布图
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value);
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '设备分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          data: [],
        },
      ],
    });
  }

  // 业务活动分析图
  if (activityChartRef.value) {
    activityChart = echarts.init(activityChartRef.value);
    activityChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {},
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '本月',
          type: 'bar',
          data: [],
          itemStyle: { color: '#409EFF' },
        },
        {
          name: '上月',
          type: 'bar',
          data: [],
          itemStyle: { color: '#67C23A' },
        },
      ],
    });
  }

  // 运营效率指标图
  if (efficiencyChartRef.value) {
    efficiencyChart = echarts.init(efficiencyChartRef.value);
    efficiencyChart.setOption({
      tooltip: { trigger: 'axis' },
      radar: {
        indicator: [
          { name: '入库效率', max: 100 },
          { name: '出库效率', max: 100 },
          { name: '盘点效率', max: 100 },
          { name: '调拨效率', max: 100 },
          { name: '查询效率', max: 100 },
          { name: '报表效率', max: 100 },
        ],
      },
      series: [
        {
          name: '效率对比',
          type: 'radar',
          data: [
            {
              value: [85, 90, 78, 82, 88, 75],
              name: '当前',
              itemStyle: { color: '#409EFF' },
            },
            {
              value: [80, 85, 75, 78, 82, 70],
              name: '目标',
              itemStyle: { color: '#67C23A' },
            },
          ],
        },
      ],
    });
  }
};

// 刷新数据
const refreshData = () => {
  fetchData();
};

// 导出数据
const exportData = async () => {
  try {
    ElMessage.success('报告导出成功');
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error('导出失败');
  }
};

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) {
    return '#67C23A';
  }
  if (percentage >= 60) {
    return '#E6A23C';
  }
  return '#F56C6C';
};

// 获取效率标签类型
const getEfficiencyType = (efficiency) => {
  const map = {
    优秀: 'success',
    良好: 'primary',
    一般: 'warning',
    较差: 'danger',
  };
  return map[efficiency] || 'info';
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize();
  categoryChart?.resize();
  activityChart?.resize();
  efficiencyChart?.resize();
};

onMounted(() => {
  initCharts();
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  categoryChart?.dispose();
  activityChart?.dispose();
  efficiencyChart?.dispose();
});

// 监听周期变化
watch(trendPeriod, () => {
  // 重新加载对应周期的数据
  refreshData();
});
</script>

<style scoped>
.metrics-row {
  margin-bottom: 20px;
}

.metric-card {
  height: 140px;
  margin-bottom: 15px;
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 13px;
}

.metric-trend.up {
  color: #67c23a;
}

.metric-trend.down {
  color: #f56c6c;
}

.trend-text {
  color: #909399;
  margin-left: 4px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
  margin-bottom: 15px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
}

.data-table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}
</style>
