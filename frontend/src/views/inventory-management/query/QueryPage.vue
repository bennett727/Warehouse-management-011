<!--
  @file: QueryPage.vue
  @description: 查询管理页面，按区域查询设备信息，支持多维度筛选和导出
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <PageLayout title="查询管理" description="按区域查询设备信息，支持多维度筛选和导出">
    <template #headerActions>
      <el-button type="primary" :icon="Download" @click="handleExport" :loading="exportLoading" data-cy="query-export-btn">导出数据</el-button>
    </template>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
        <el-card class="area-tree-card">
          <template #header>
            <div class="card-header">
              <span>区域列表</span>
              <el-button type="default" :icon="Refresh" @click="loadAreaTree" :loading="areaTreeLoading" data-cy="query-area-refresh-btn"
                >刷新</el-button
              >
            </div>
          </template>
          <AreaTree :data="areaTreeData" :loading="areaTreeLoading" @node-click="handleAreaClick" />
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
        <el-card class="area-info-card">
          <template #header>
            <div class="card-header">
              <span>区域信息</span>
              <div class="header-actions">
                <el-tooltip content="手动刷新当前区域数据" placement="top">
                  <el-button type="default" :icon="Refresh" :loading="refreshing" @click="handleRefresh" data-cy="query-refresh-btn"
                    >刷新</el-button
                  >
                </el-tooltip>
                <el-tooltip :content="autoRefreshEnabled ? '关闭自动刷新' : '开启自动刷新'" placement="top">
                  <el-button type="default" :icon="Clock" @click="toggleAutoRefresh" data-cy="query-auto-refresh-btn">{{
                    autoRefreshEnabled ? '关闭自动刷新' : '开启自动刷新'
                  }}</el-button>
                </el-tooltip>
                <el-tooltip content="根据筛选条件查询设备" placement="top">
                  <el-button type="primary" :icon="Search" @click="handleSearch" data-cy="query-search-btn">查询</el-button>
                </el-tooltip>
              </div>
            </div>
          </template>
          <AreaInfo v-if="selectedArea" :area="selectedArea" :statistics="areaStatistics" :loading="areaInfoLoading" />
          <el-empty v-else description="请选择区域查看详细信息" />
        </el-card>

        <el-card class="device-list-card">
          <template #header>
            <div class="card-header">
              <span>设备列表</span>
              <div class="header-actions">
                <el-button type="primary" :icon="Search" @click="handleSearch" data-cy="query-list-search-btn">查询</el-button>
                <el-button :icon="Refresh" @click="handleReset" data-cy="query-list-reset-btn">重置</el-button>
              </div>
            </div>
          </template>

          <UnifiedFilterBar
            v-model="searchForm"
            :fields="filterConfig.fields"
            :loading="deviceListLoading"
            :header-title="filterConfig.header.title"
            :header-icon="filterConfig.header.icon"
            :result-count="pagination.total"
            @search="handleSearch"
            @reset="handleReset"
          />

          <DataTable
            :data="deviceList"
            :loading="deviceListLoading"
            :total="pagination.total"
            :current-page="pagination.current"
            :page-size="pagination.pageSize"
            :show-actions="true"
            height="600px"
            data-cy="query-device-table"
            @page-change="handlePageChange"
            @size-change="handlePageSizeChange"
            @row-dblclick="handleViewDetail"
          >
            <template #empty>
              <el-empty v-if="!deviceListLoading" description="暂无设备数据">
                <el-button type="primary" @click="handleReset" data-cy="query-empty-reset-btn">重置筛选条件</el-button>
              </el-empty>
              <el-skeleton v-else :rows="5" animated />
            </template>
            <el-table-column prop="deviceCode" label="设备编号" width="120" data-cy="query-device-code-column" />
            <el-table-column prop="deviceName" label="设备名称" width="150" data-cy="query-device-name-column" />
            <el-table-column prop="deviceTypeName" label="设备类型" width="120" data-cy="query-device-type-column" />
            <el-table-column prop="areaName" label="区域" width="100" data-cy="query-device-area-column" />
            <el-table-column prop="binName" label="货位" width="120" data-cy="query-device-bin-column" />
            <el-table-column label="状态" width="100" data-cy="query-device-status-column">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" :data-cy="`query-device-status-tag-${row.id}`">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="currentStock" label="当前库存" width="100" align="center" data-cy="query-device-stock-column" />
            <el-table-column prop="createTime" label="创建时间" width="180" data-cy="query-device-time-column" />
            <el-table-column label="操作" width="100" fixed="right" data-cy="query-device-action-column">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewDetail(row)" :data-cy="`query-device-view-btn-${row.id}`">查看详情</el-button>
              </template>
            </el-table-column>
          </DataTable>
        </el-card>
      </el-col>
    </el-row>

    <DeviceDetailDialog v-model="detailDialogVisible" :device="currentDevice" />
  </PageLayout>
</template>

<script setup>
import { Download, Refresh, Search, Clock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';

import { getDeviceList } from '@/api/device/device';
import { getDeviceTypes } from '@/api/device/device-type';
import { getAreaTree, getAreaStatistics } from '@/api/system/area';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import DeviceDetailDialog from '@/components/business/device/DeviceDetailDialog.vue';
import AreaInfo from '@/components/business/query/AreaInfo.vue';
import AreaTree from '@/components/business/query/AreaTree.vue';
import { useDeviceStatusOptions } from '@/composables/useDevice';
import { createFilterConfig } from '@/config/filter/common.filter.config';
import { createLogger } from '@/utils/logger';

const logger = createLogger('QueryPage');

// 区域树数据
const areaTreeData = ref([]);
const areaTreeLoading = ref(false);
const selectedArea = ref(null);
const areaStatistics = ref({});
const areaInfoLoading = ref(false);

// 设备列表数据
const deviceList = ref([]);
const deviceListLoading = ref(false);
const refreshing = ref(false);
const autoRefreshEnabled = ref(false);
let autoRefreshTimer = null;

// 设备类型选项
const deviceTypeOptions = ref([]);

// 导出加载状态
const exportLoading = ref(false);

// 详情对话框
const detailDialogVisible = ref(false);
const currentDevice = ref(null);

// 筛选表单
const filterForm = reactive({
  deviceCode: '',
  deviceName: '',
  deviceType: '',
  status: '',
  areaId: '',
  installDateStart: '',
  installDateEnd: '',
});

// 获取设备状态选项
const { statusOptions } = useDeviceStatusOptions();

// 筛选配置
const filterConfig = computed(() =>
  createFilterConfig({
    title: '设备筛选',
    icon: Search,
    fields: searchFields.value,
  })
);

// 搜索字段配置
const searchFields = computed(() => [
  { type: 'input', prop: 'deviceCode', label: '设备编号', placeholder: '请输入设备编号', clearable: true },
  { type: 'input', prop: 'deviceName', label: '设备名称', placeholder: '请输入设备名称', clearable: true },
  {
    type: 'select',
    prop: 'deviceType',
    label: '设备类型',
    placeholder: '请选择设备类型',
    clearable: true,
    options: deviceTypeOptions.value,
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    clearable: true,
    options: statusOptions.value,
  },
  {
    type: 'daterange',
    prop: 'installDate',
    label: '安装日期',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 分页
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

// 状态映射（优化版 - 5种核心状态，使用数字状态码）
const getStatusTagType = (status) => {
  const typeMap = {
    [-1]: 'info',
    0: 'success',
    1: 'primary',
    2: 'warning',
    3: 'danger',
    4: 'warning',
    5: 'success',
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    [-1]: '待入库',
    0: '在库',
    1: '使用中',
    2: '维护中',
    3: '已报废',
    4: '维修中',
    5: '正常',
  };
  return textMap[status] || '未知';
};

// 加载设备类型选项
const loadDeviceTypeOptions = async () => {
  try {
    const response = await getDeviceTypes();
    if (response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      deviceTypeOptions.value = dataArray.map((type) => ({
        label: type.name || type.typeName || '未知类型',
        value: (type.id || type.typeId)?.toString(),
      }));
    }
  } catch (error) {
    logger.error('加载设备类型失败:', error);
  }
};

// 加载区域树
const loadAreaTree = async () => {
  areaTreeLoading.value = true;
  try {
    const response = await getAreaTree();
    if (response.data) {
      // 转换区域树数据格式
      areaTreeData.value = convertAreaTreeData(response.data);
    }
  } catch (error) {
    logger.error('加载区域树失败:', error);
    ElMessage.error('加载区域树失败');
  } finally {
    areaTreeLoading.value = false;
  }
};

// 转换区域树数据
const convertAreaTreeData = (areas) => {
  if (!Array.isArray(areas)) {
    return [];
  }

  return areas.map((area) => ({
    id: area.id,
    label: area.name,
    name: area.name,
    code: area.code,
    province: area.province,
    city: area.city,
    district: area.district,
    status: area.status,
    children: area.children ? convertAreaTreeData(area.children) : [],
  }));
};

// 加载区域统计
const loadAreaStatistics = async (areaId) => {
  if (!areaId) {
    return;
  }

  areaInfoLoading.value = true;
  try {
    const response = await getAreaStatistics(areaId);
    if (response.data) {
      areaStatistics.value = response.data;
    }
  } catch (error) {
    logger.error('加载区域统计失败:', error);
  } finally {
    areaInfoLoading.value = false;
  }
};

// 区域点击处理
const handleAreaClick = (data) => {
  selectedArea.value = data;
  filterForm.areaId = data.id;
  loadAreaStatistics(data.id);
  handleSearch();
};

// 搜索设备
const handleSearch = async () => {
  deviceListLoading.value = true;
  try {
    const params = {
      page: pagination.current, // 后端页码从1开始，直接使用前端值
      size: pagination.pageSize, // 使用size而非pageSize，与后端一致
      keyword: filterForm.deviceCode || filterForm.deviceName || undefined,
      typeId: filterForm.deviceType || undefined,
      status: filterForm.status || undefined,
      areaId: filterForm.areaId || undefined,
      startDate: filterForm.installDateStart || undefined,
      endDate: filterForm.installDateEnd || undefined,
    };

    const response = await getDeviceList(params);

    if (response.data) {
      // 转换设备数据格式
      deviceList.value = (response.data.devices || response.data.records || []).map((device) => ({
        id: device.id,
        deviceCode: device.deviceCode,
        deviceName: device.deviceName,
        deviceTypeName: device.deviceType?.typeName || device.deviceTypeName || '-',
        areaName: device.area?.name || device.areaName || '-',
        binName: device.bin?.name || device.binName || '-',
        status: device.status,
        currentStock: device.currentStock || 0,
        createTime: device.createTime,
      }));
      pagination.total = response.data.total || 0;
    }
  } catch (error) {
    logger.error('加载设备列表失败:', error);
    ElMessage.error('加载设备列表失败');
    deviceList.value = [];
    pagination.total = 0;
  } finally {
    deviceListLoading.value = false;
    refreshing.value = false;
  }
};

// 重置筛选
const handleReset = () => {
  Object.keys(filterForm).forEach((key) => {
    if (key !== 'areaId') {
      filterForm[key] = Array.isArray(filterForm[key]) ? [] : '';
    }
  });
  pagination.current = 1;
  handleSearch();
};

// 分页变化
const handlePageChange = (page) => {
  pagination.current = page;
  handleSearch();
};

// 每页数量变化
const handlePageSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  handleSearch();
};

// 查看详情
const handleViewDetail = (row) => {
  currentDevice.value = row;
  detailDialogVisible.value = true;
};

// 导出数据
const handleExport = async () => {
  exportLoading.value = true;
  try {
    // 获取所有数据用于导出
    const params = {
      page: 0,
      pageSize: 10000,
      keyword: filterForm.deviceCode || filterForm.deviceName || undefined,
      typeId: filterForm.deviceType || undefined,
      status: filterForm.status || undefined,
      areaId: filterForm.areaId || undefined,
    };

    const response = await getDeviceList(params);

    if (response.data) {
      const exportData = (response.data.devices || response.data.records || []).map((device) => ({
        设备编号: device.deviceCode,
        设备名称: device.deviceName,
        设备类型: device.deviceType?.typeName || '-',
        区域: device.area?.name || '-',
        货位: device.bin?.name || '-',
        状态: getStatusText(device.status),
        当前库存: device.currentStock || 0,
        创建时间: device.createTime,
      }));

      // 导出为CSV
      exportToCSV(exportData, `设备查询_${new Date().toISOString().split('T')[0]}.csv`);
      ElMessage.success('导出成功');
    }
  } catch (error) {
    logger.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 导出CSV
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          // 处理包含逗号或换行符的值
          if (typeof val === 'string' && (val.includes(',') || val.includes('\n'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 刷新
const handleRefresh = () => {
  refreshing.value = true;
  handleSearch();
};

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value;
  if (autoRefreshEnabled.value) {
    autoRefreshTimer = setInterval(() => {
      handleSearch();
    }, 30000); // 30秒自动刷新
    ElMessage.success('已开启自动刷新（30秒）');
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
    }
    ElMessage.info('已关闭自动刷新');
  }
};

// 组件挂载
onMounted(() => {
  loadAreaTree();
  loadDeviceTypeOptions();
  handleSearch();
});

// 组件卸载
onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
});
</script>

<style scoped>
.area-tree-card {
  height: calc(100vh - 200px);
}
.area-info-card {
  margin-bottom: 20px;
}
.device-list-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 10px;
}
</style>
