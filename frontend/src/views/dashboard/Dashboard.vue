<!--
  @file: Dashboard.vue
  @description: 重构后的仪表盘页面 - 提供全局数据概览和关键指标展示
  @author: 开发团队
  @createTime: 2026-02-06
  @version: 3.1 - 迁移到 PageLayout
-->
<template>
  <PageLayout title="数据仪表盘" description="全局数据概览和关键指标展示" data-cy="dashboard-page" :no-padding="true">
    <template #headerActions>
      <el-button :icon="Refresh" @click="refreshData" :loading="loading" data-cy="refresh-btn"> 刷新数据 </el-button>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 240px; margin-left: 10px"
        data-cy="date-range-picker"
      />
    </template>

    <div class="dashboard-content">
      <!-- 关键指标卡片 -->
      <el-row :gutter="20" class="kpi-section">
        <el-col :xs="24" :sm="12" :md="6" v-for="(kpi, index) in kpiData" :key="index">
          <el-card class="kpi-card" :class="kpi.type" data-cy="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon">
                <el-icon :size="40">
                  <component :is="kpi.icon" />
                </el-icon>
              </div>
              <div class="kpi-info">
                <div class="kpi-value">{{ kpi.value }}</div>
                <div class="kpi-label">{{ kpi.label }}</div>
                <div class="kpi-trend" :class="kpi.trend > 0 ? 'up' : 'down'">
                  <el-icon><component :is="kpi.trend > 0 ? _ArrowUp : _ArrowDown" /></el-icon>
                  {{ Math.abs(kpi.trend) }}%
                  <span class="trend-text">较上期</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-section">
        <!-- 设备状态分布 -->
        <el-col :xs="24" :lg="8">
          <el-card class="chart-card" data-cy="status-chart">
            <template #header>
              <div class="card-header">
                <span>设备状态分布</span>
                <el-button link :icon="More" @click="goToDeviceList" data-cy="more-btn">查看更多</el-button>
              </div>
            </template>
            <div ref="statusChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 库存趋势 -->
        <el-col :xs="24" :lg="16">
          <el-card class="chart-card" data-cy="trend-chart">
            <template #header>
              <div class="card-header">
                <span>库存变动趋势</span>
                <el-radio-group v-model="trendPeriod" size="small" data-cy="period-selector">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="quarter">本季度</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 业务记录统计 -->
      <el-row :gutter="20" class="charts-section">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" data-cy="business-chart">
            <template #header>
              <div class="card-header">
                <span>业务记录统计</span>
              </div>
            </template>
            <div ref="businessChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 区域设备分布 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" data-cy="area-chart">
            <template #header>
              <div class="card-header">
                <span>区域设备分布</span>
              </div>
            </template>
            <div ref="areaChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 仓库数据概览 -->
      <el-row :gutter="20" class="warehouse-overview-section">
        <el-col :span="24">
          <el-card class="warehouse-overview-card" data-cy="warehouse-overview">
            <template #header>
              <div class="card-header">
                <span>仓库数据概览</span>
                <el-button link type="primary" @click="navigateTo('/warehouse/list')">
                  查看详情 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :xs="12" :sm="8" :md="6">
                <div class="warehouse-stat-item" @click="navigateTo('/warehouse/list')">
                  <div class="stat-icon warehouse">
                    <el-icon :size="28"><House /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ warehouseStats.totalWarehouses }}</div>
                    <div class="stat-label">仓库总数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6">
                <div class="warehouse-stat-item" @click="navigateTo('/warehouse/zone')">
                  <div class="stat-icon zone">
                    <el-icon :size="28"><OfficeBuilding /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ warehouseStats.totalZones }}</div>
                    <div class="stat-label">功能区总数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6">
                <div class="warehouse-stat-item" @click="navigateTo('/inventory-management/bin')">
                  <div class="stat-icon bin">
                    <el-icon :size="28"><Grid /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ warehouseStats.totalBins }}</div>
                    <div class="stat-label">货位总数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6">
                <div class="warehouse-stat-item">
                  <div class="stat-icon active">
                    <el-icon :size="28"><CircleCheck /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ warehouseStats.activeWarehouses }}</div>
                    <div class="stat-label">启用仓库</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快捷入口和待办事项 -->
      <el-row :gutter="20" class="bottom-section">
        <!-- 快捷入口 -->
        <el-col :xs="24" :md="12">
          <el-card class="quick-access-card" data-cy="quick-access">
            <template #header>
              <div class="card-header">
                <span>快捷入口</span>
              </div>
            </template>
            <div class="quick-access-grid">
              <div
                v-for="item in quickAccessItems"
                :key="item.path"
                class="quick-access-item"
                @click="navigateTo(item.path)"
                data-cy="quick-access-item"
              >
                <el-icon :size="28" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
                <span class="item-label">{{ item.label }}</span>
                <span class="item-desc">{{ item.description }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 待办事项和预警 -->
        <el-col :xs="24" :md="12">
          <el-card class="todo-card" data-cy="todo-list">
            <template #header>
              <div class="card-header">
                <span>待办事项</span>
                <el-badge :value="todoList.length" class="todo-badge" />
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(todo, index) in todoList"
                :key="index"
                :type="todo.type"
                :timestamp="todo.time"
                :icon="todo.icon"
              >
                <div class="todo-item" @click="handleTodoClick(todo)" data-cy="todo-item">
                  <span class="todo-title">{{ todo.title }}</span>
                  <span class="todo-desc">{{ todo.description }}</span>
                  <el-tag :type="todo.priority" size="small">{{ todo.priorityText }}</el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-if="todoList.length === 0" description="暂无待办事项" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近活动 -->
      <el-card class="activity-card" data-cy="recent-activity">
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button link :icon="Refresh" @click="loadRecentActivity" :loading="activityLoading">刷新</el-button>
          </div>
        </template>
        <el-table :data="recentActivity" stripe style="width: 100%" v-loading="activityLoading">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="user" label="操作人" width="120" />
          <el-table-column prop="action" label="操作类型" width="150">
            <template #default="{ row }">
              <el-tag :type="row.actionType" size="small">{{ row.action }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-icon :color="row.status === 'success' ? '#67c23a' : '#f56c6c'">
                <component :is="row.status === 'success' ? _CircleCheck : _CircleClose" />
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </PageLayout>
</template>

<script setup>
import {
  ArrowDown as _ArrowDown,
  ArrowUp as _ArrowUp,
  ArrowRight,
  Box as _Box,
  CircleCheck as _CircleCheck,
  CircleClose as _CircleClose,
  Document as _Document,
  Download as _Download,
  Grid,
  House,
  OfficeBuilding,
  Plus as _Plus,
  Search as _Search,
  Switch as _Switch,
  Tools as _Tools,
  Warning as _Warning,
  More,
  Refresh,
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getPendingTasks, getRecentActivity, getSystemOverview } from '@/api/dashboard/dashboard';
import { getWarehouseOverviewStats } from '@/api/inventory/warehouse';
import { getInventoryReport } from '@/api/reports/reports';
import PageLayout from '@/components/base/PageLayout.vue';
import {
  ACTION_TEXT_MAP,
  ACTION_TYPE_MAP,
  BUSINESS_CHART_DEFAULT,
  DEVICE_STATUS_CHART_DEFAULT,
  DEVICE_STATUS_MAP,
  TREND_CHART_CONFIG,
} from '@/constants/chartConstants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Dashboard');
const router = useRouter();

// 加载状态
const loading = ref(false);
const activityLoading = ref(false);

// 日期范围
const dateRange = ref([]);

// 趋势图周期
const trendPeriod = ref('month');

// 图表引用
const statusChartRef = ref(null);
const trendChartRef = ref(null);
const businessChartRef = ref(null);
const areaChartRef = ref(null);

// 图表实例
let statusChart = null;
let trendChart = null;
let businessChart = null;
let areaChart = null;

// 关键指标数据
const kpiData = reactive([
  { label: '设备总数', value: '0', trend: 0, type: 'primary', icon: _Box },
  { label: '在库设备', value: '0', trend: 0, type: 'success', icon: _CircleCheck },
  { label: '维修中', value: '0', trend: 0, type: 'warning', icon: _Tools },
  { label: '库存预警', value: '0', trend: 0, type: 'danger', icon: _Warning },
]);

// 仓库数据概览
const warehouseStats = reactive({
  totalWarehouses: 0,
  activeWarehouses: 0,
  totalZones: 0,
  totalBins: 0,
});

// 快捷入口
const quickAccessItems = [
  {
    label: '设备入库',
    description: '新增设备入库记录',
    icon: _Plus,
    path: '/inventory-management/inbound',
    color: '#409eff',
  },
  {
    label: '设备出库',
    description: '处理设备出库',
    icon: _Download,
    path: '/inventory-management/outbound',
    color: '#67c23a',
  },
  {
    label: '库存调拨',
    description: '仓库间设备调拨',
    icon: _Switch,
    path: '/inventory-management/transfer',
    color: '#e6a23c',
  },
  {
    label: '库存盘点',
    description: '执行库存盘点',
    icon: _Search,
    path: '/inventory-management/count',
    color: '#909399',
  },
  { label: '维修登记', description: '登记设备维修', icon: _Tools, path: '/business-records/repair', color: '#f56c6c' },
  {
    label: '数据查询',
    description: '综合数据查询',
    icon: _Document,
    path: '/query-stats/comprehensive',
    color: '#8e44ad',
  },
];

// 待办事项
const todoList = reactive([]);

// 最近活动
const recentActivity = ref([]);

// 统计数据缓存
const statisticsData = ref({
  deviceStatus: [],
  trendData: [],
  businessData: [],
  areaData: [],
});

// 加载系统概览数据
const loadSystemOverview = async () => {
  try {
    const response = await getSystemOverview();
    if (response.data) {
      const { data } = response;

      // 更新KPI数据
      kpiData[0].value = formatNumber(data.totalDevices || 0);
      kpiData[1].value = formatNumber(data.inStockDevices || data.availableDevices || 0);
      kpiData[2].value = formatNumber(data.repairingDevices || 0);
      kpiData[3].value = formatNumber(data.lowStockAlerts || data.warningDevices || 0);

      // 更新趋势（如果有历史数据）
      if (data.trendData) {
        kpiData.forEach((kpi, index) => {
          const trendKey = ['totalDevicesTrend', 'inStockTrend', 'repairingTrend', 'warningTrend'][index];
          kpi.trend = data.trendData[trendKey] || 0;
        });
      }
    }
  } catch (error) {
    logger.error('加载系统概览数据失败:', error);
    ElMessage.error('加载系统概览数据失败');
  }
};

// 加载库存报表数据
const loadInventoryReport = async () => {
  try {
    const response = await getInventoryReport();
    if (response.data) {
      const { data } = response;

      // 更新设备状态分布数据
      if (data.deviceStatusDistribution) {
        statisticsData.value.deviceStatus = data.deviceStatusDistribution.map((item) => ({
          name: item.name || getStatusText(item.status),
          value: item.count || item.value,
          itemStyle: { color: getStatusColor(item.status) },
        }));
      }

      // 更新趋势数据
      if (data.trendData) {
        statisticsData.value.trendData = data.trendData;
      }

      // 更新业务数据
      if (data.businessStatistics) {
        statisticsData.value.businessData = data.businessStatistics.map((item) => ({
          name: item.name || item.type,
          value: item.count || item.value,
          itemStyle: { color: getBusinessColor(item.type) },
        }));
      }

      // 更新区域分布数据
      if (data.areaDistribution) {
        statisticsData.value.areaData = data.areaDistribution.map((item) => ({
          name: item.areaName || item.name,
          value: item.deviceCount || item.count || item.value,
        }));
      }

      // 更新图表
      updateCharts();
    }
  } catch (error) {
    logger.error('加载库存报表数据失败:', error);
    ElMessage.error('加载库存报表数据失败');
  }
};

// 加载最近活动
const loadRecentActivity = async () => {
  activityLoading.value = true;
  try {
    const response = await getRecentActivity({ limit: 10 });
    if (response.data && response.data.activities) {
      recentActivity.value = response.data.activities.map((activity) => ({
        time: activity.createTime || activity.time,
        user: activity.operatorName || activity.username || activity.user,
        action: getActionText(activity.operationType || activity.action),
        actionType: getActionType(activity.operationType || activity.action),
        content: activity.content || activity.description || activity.operationDesc,
        status: activity.status === 'SUCCESS' || activity.status === 'success' ? 'success' : 'pending',
      }));
    }
  } catch (error) {
    logger.error('加载最近活动失败:', error);
    ElMessage.error('加载最近活动失败');
  } finally {
    activityLoading.value = false;
  }
};

// 加载待办事项
const loadPendingTasks = async () => {
  try {
    const response = await getPendingTasks();
    if (response.success && response.data) {
      const tasks = response.data.tasks || response.data.list || [];
      todoList.length = 0;
      tasks.forEach((task) => {
        todoList.push({
          title: task.title || task.name,
          description: task.description || task.content,
          time: task.time || task.createTime || task.updatedAt,
          type: task.type || 'info',
          icon: task.icon || _Document,
          priority: task.priority || 'info',
          priorityText: task.priorityText || '一般',
          action: task.action ? () => router.push(task.action) : undefined,
        });
      });
    }
  } catch (error) {
    logger.error('加载待办事项失败:', error);
    ElMessage.error('加载待办事项失败');
  }
};

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 获取状态文本 - 使用统一的常量映射
const getStatusText = (status) => {
  return DEVICE_STATUS_MAP[status]?.label || status;
};

// 获取状态颜色 - 使用统一的常量映射
const getStatusColor = (status) => {
  return DEVICE_STATUS_MAP[status]?.color || '#909399';
};

// 获取业务类型颜色
const getBusinessColor = (type) => {
  const colorMap = {
    INSTALL: '#409eff',
    REPAIR: '#f56c6c',
    MAINTENANCE: '#67c23a',
    SCRAP: '#909399',
    TRANSFER: '#e6a23c',
  };
  return colorMap[type] || '#409eff';
};

// 获取操作文本 - 使用统一的常量映射
const getActionText = (action) => {
  return ACTION_TEXT_MAP[action] || action;
};

// 获取操作类型标签样式 - 使用统一的常量映射
const getActionType = (action) => {
  return ACTION_TYPE_MAP[action] || 'info';
};

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initStatusChart();
    initTrendChart();
    initBusinessChart();
    initAreaChart();
  });
};

// 更新图表
const updateCharts = () => {
  nextTick(() => {
    updateStatusChart();
    updateTrendChart();
    updateBusinessChart();
    updateAreaChart();
  });
};

// 设备状态分布图
const initStatusChart = () => {
  if (!statusChartRef.value) {
    return;
  }
  statusChart = echarts.init(statusChartRef.value);
  updateStatusChart();
};

const updateStatusChart = () => {
  if (!statusChart) {
    return;
  }

  const data =
    statisticsData.value.deviceStatus.length > 0 ? statisticsData.value.deviceStatus : DEVICE_STATUS_CHART_DEFAULT.data;

  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
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
          label: { show: true, fontSize: 20, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data,
      },
    ],
  };
  statusChart.setOption(option);
};

// 库存趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) {
    return;
  }
  trendChart = echarts.init(trendChartRef.value);
  updateTrendChart();
};

const updateTrendChart = () => {
  if (!trendChart) {
    return;
  }

  const { trendData } = statisticsData.value;
  // 使用动态生成的最近12个月份，而非硬编码
  const months = trendData.months || TREND_CHART_CONFIG.getRecentMonths();
  const emptyData = TREND_CHART_CONFIG.getEmptyData(months.length);

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['入库', '出库', '库存'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: TREND_CHART_CONFIG.series.inbound.name,
        type: 'line',
        smooth: true,
        data: trendData.inbound || emptyData,
        itemStyle: { color: TREND_CHART_CONFIG.series.inbound.color },
        areaStyle: { opacity: 0.1 },
      },
      {
        name: TREND_CHART_CONFIG.series.outbound.name,
        type: 'line',
        smooth: true,
        data: trendData.outbound || emptyData,
        itemStyle: { color: TREND_CHART_CONFIG.series.outbound.color },
        areaStyle: { opacity: 0.1 },
      },
      {
        name: TREND_CHART_CONFIG.series.stock.name,
        type: 'line',
        smooth: true,
        data: trendData.stock || emptyData,
        itemStyle: { color: TREND_CHART_CONFIG.series.stock.color },
        areaStyle: { opacity: 0.1 },
      },
    ],
  };
  trendChart.setOption(option);
};

// 业务记录统计图
const initBusinessChart = () => {
  if (!businessChartRef.value) {
    return;
  }
  businessChart = echarts.init(businessChartRef.value);
  updateBusinessChart();
};

const updateBusinessChart = () => {
  if (!businessChart) {
    return;
  }

  const data =
    statisticsData.value.businessData.length > 0 ? statisticsData.value.businessData : BUSINESS_CHART_DEFAULT.data;

  const categories =
    statisticsData.value.businessData.length > 0
      ? statisticsData.value.businessData.map((item) => item.name)
      : BUSINESS_CHART_DEFAULT.categories;

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data,
        barWidth: '60%',
        label: { show: true, position: 'top', color: '#303133', fontSize: 12, fontWeight: 'bold' },
      },
    ],
  };
  businessChart.setOption(option);
};

// 区域设备分布图
const initAreaChart = () => {
  if (!areaChartRef.value) {
    return;
  }
  areaChart = echarts.init(areaChartRef.value);
  updateAreaChart();
};

const updateAreaChart = () => {
  if (!areaChart) {
    return;
  }

  const { areaData } = statisticsData.value;
  const categories = areaData.length > 0 ? areaData.map((item) => item.name).reverse() : ['暂无数据'];
  const values = areaData.length > 0 ? areaData.map((item) => item.value).reverse() : [0];

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: categories,
    },
    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        barWidth: '60%',
        label: { show: true, position: 'right', color: '#303133', fontSize: 12, fontWeight: 'bold' },
      },
    ],
  };
  areaChart.setOption(option);
};

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadSystemOverview(),
      loadInventoryReport(),
      loadRecentActivity(),
      loadPendingTasks(),
      loadWarehouseStats(),
    ]);
    ElMessage.success('数据已刷新');
  } catch (error) {
    logger.error('刷新数据失败:', error);
    ElMessage.error('刷新数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载仓库统计数据
const loadWarehouseStats = async () => {
  try {
    const response = await getWarehouseOverviewStats();
    if (response.data) {
      const { data } = response;
      warehouseStats.totalWarehouses = data.totalWarehouses || 0;
      warehouseStats.activeWarehouses = data.activeWarehouses || 0;
      warehouseStats.totalZones = data.totalZones || 0;
      warehouseStats.totalBins = data.totalBins || 0;
    }
  } catch (error) {
    logger.error('加载仓库统计数据失败:', error);
  }
};

// 导航
const navigateTo = (path) => {
  router.push(path);
};

// 查看更多
const goToDeviceList = () => {
  router.push('/asset-management/device-list');
};

// 处理待办点击
const handleTodoClick = (todo) => {
  if (todo.action) {
    todo.action();
  }
};

// 窗口大小改变时重新调整图表
const handleResize = () => {
  statusChart?.resize();
  trendChart?.resize();
  businessChart?.resize();
  areaChart?.resize();
};

// 监听趋势周期变化
watch(trendPeriod, () => {
  // 可以根据不同周期加载不同的趋势数据
  loadInventoryReport();
});

onMounted(() => {
  initCharts();
  refreshData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  statusChart?.dispose();
  trendChart?.dispose();
  businessChart?.dispose();
  areaChart?.dispose();
});
</script>

<style scoped>
/* Dashboard 内容区域 */
.dashboard-content {
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--slate-50) 0%, var(--slate-100) 100%);
  min-height: calc(100vh - 200px);
}

/* KPI卡片样式 */
.kpi-section {
  margin-bottom: 24px;
}

.kpi-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.kpi-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.kpi-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.kpi-card.primary .kpi-icon {
  background: var(--primary-100);
  color: var(--primary-600);
  border: 2px solid var(--primary-200);
}

.kpi-card.success .kpi-icon {
  background: var(--success-100);
  color: var(--success-600);
  border: 2px solid var(--success-200);
}

.kpi-card.warning .kpi-icon {
  background: var(--warning-100);
  color: var(--warning-600);
  border: 2px solid var(--warning-200);
}

.kpi-card.danger .kpi-icon {
  background: var(--error-100);
  color: var(--error-600);
  border: 2px solid var(--error-200);
}

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.kpi-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  margin-top: 8px;
  font-weight: 500;
}

.kpi-trend.up {
  color: #67c23a;
}

.kpi-trend.down {
  color: #f56c6c;
}

.trend-text {
  color: #909399;
  font-weight: normal;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-container {
  height: 320px;
  width: 100%;
}

/* 仓库数据概览样式 */
.warehouse-overview-section {
  margin-bottom: 24px;
}

.warehouse-overview-card {
  margin-bottom: 20px;
}

.warehouse-stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.warehouse-stat-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.warehouse-stat-item .stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.warehouse-stat-item .stat-icon.warehouse {
  background: linear-gradient(135deg, #409eff 0%, #1677ff 100%);
}

.warehouse-stat-item .stat-icon.zone {
  background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
}

.warehouse-stat-item .stat-icon.bin {
  background: linear-gradient(135deg, #e6a23c 0%, #faad14 100%);
}

.warehouse-stat-item .stat-icon.active {
  background: linear-gradient(135deg, #909399 0%, #bfbfbf 100%);
}

.warehouse-stat-item .stat-info {
  flex: 1;
}

.warehouse-stat-item .stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.warehouse-stat-item .stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 快捷入口样式 */
.bottom-section {
  margin-bottom: 24px;
}

.quick-access-card {
  margin-bottom: 20px;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quick-access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f5f7fa;
}

.quick-access-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.item-label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.item-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

/* 待办事项样式 */
.todo-card {
  margin-bottom: 20px;
}

.todo-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
}

.todo-item {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.todo-item:hover {
  background-color: #f5f7fa;
}

.todo-title {
  display: block;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.todo-desc {
  display: block;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

/* 最近活动样式 */
.activity-card {
  margin-bottom: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .kpi-content {
    flex-direction: column;
    text-align: center;
  }

  .kpi-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .quick-access-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-container {
    height: 240px;
  }
}
</style>
