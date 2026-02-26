<!--
  @file: DeviceList.vue
  @description: 设备列表页面，用于展示和管理设备档案
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0 - 迁移到 PageLayout
-->
<template>
  <PageLayout title="设备列表" description="管理所有设备档案及状态" data-cy="device-list-page">
    <template #headerActions>
      <el-button type="info" :icon="Setting" data-cy="device-column-config-button" @click="handleColumnConfig">
        列配置
      </el-button>
      <el-button type="success" :icon="Download" data-cy="device-export-button" @click="handleExport"> 导出 </el-button>
      <el-button type="primary" :icon="Plus" data-cy="device-add-button" @click="handleAddDevice"> 添加设备 </el-button>
    </template>

    <!-- 统计信息卡片 -->
    <el-card class="stats-card" shadow="never" data-cy="stats-card">
      <div class="device-stats">
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon :size="24"><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ pagination.total }}</span>
            <span class="stat-label">设备总数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ onlineCount }}</span>
            <span class="stat-label">在线设备</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon :size="24"><Tools /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ maintenanceCount }}</span>
            <span class="stat-label">维修中</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon danger">
            <el-icon :size="24"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ abnormalCount }}</span>
            <span class="stat-label">异常设备</span>
          </div>
        </div>
      </div>
    </el-card>

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

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
      :row-key="getRowKey"
      :height="tableHeight"
      data-cy="device-table"
      class="device-table"
      :row-class-name="getRowClassName"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <template #empty>
        <BaseEmptyState
          type="data"
          description="暂无设备数据"
          :show-action="true"
          action-text="添加设备"
          @action="handleAddDevice"
        />
      </template>
      <el-table-column
        v-if="selectedColumns.includes('deviceCode')"
        prop="deviceCode"
        label="设备编号"
        width="160"
        fixed="left"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="device-code-cell">
            <el-icon class="device-icon" :class="getDeviceIconClass(scope.row)">
              <component :is="getDeviceIcon(scope.row)" />
            </el-icon>
            <span data-cy="device-code-cell" class="device-code-text">{{ scope.row.deviceCode }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('name')"
        prop="name"
        label="设备名称"
        min-width="300"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span data-cy="device-name-cell" class="device-name-text">{{
            scope.row.name || scope.row.deviceName || '-'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="selectedColumns.includes('type')" prop="type" label="设备类型" min-width="140">
        <template #default="scope">
          <el-tag
            size="small"
            :type="getDeviceTypeTagType(scope.row.type)"
            data-cy="device-type-cell"
            class="device-type-tag"
          >
            {{ getDeviceTypeName(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('model')"
        prop="model"
        label="规格型号"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="model-text">{{ scope.row.deviceModel || scope.row.model || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="selectedColumns.includes('status')" prop="status" label="状态" width="110" align="center">
        <template #default="scope">
          <div class="status-cell">
            <div class="status-indicator" :class="getStatusClass(scope.row.status)"></div>
            <el-tag :type="getDeviceStatusTagType(scope.row.status)" size="small" class="status-tag">
              {{ getDeviceStatusText(scope.row.status) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('currentLocation')"
        prop="currentLocation"
        label="当前位置"
        min-width="240"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="location-cell" :class="{ 'incomplete-address': isAddressIncomplete(scope.row) }">
            <el-icon class="location-icon" :class="getLocationIconClass(scope.row)">
              <Location />
            </el-icon>
            <span class="location-text">{{ getStockLocation(scope.row) }}</span>
            <!-- 地址不完整时显示修复按钮 -->
            <el-button
              v-if="isAddressIncomplete(scope.row)"
              type="warning"
              link
              size="small"
              class="fix-address-btn"
              @click.stop="handleFixAddress(scope.row)"
              data-cy="device-fix-address-btn"
            >
              <el-icon><Edit /></el-icon>
              完善地址
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('principal')"
        prop="principalName"
        label="负责人"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="principal-cell">
            <el-avatar :size="24" class="principal-avatar">{{
              (scope.row.principalName || scope.row.principal?.name || '?').charAt(0)
            }}</el-avatar>
            <span>{{ scope.row.principalName || scope.row.principal?.name || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('installer')"
        prop="installerName"
        label="安装人员"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="installer-cell">
            <el-avatar :size="24" class="installer-avatar">{{ (scope.row.installerName || '?').charAt(0) }}</el-avatar>
            <span>{{ scope.row.installerName || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('manufacturer')"
        prop="manufacturer"
        label="制造商"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="manufacturer-text">{{ scope.row.manufacturer || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('inboundPerson')"
        prop="inboundPersonName"
        label="入库人员"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="person-cell">
            <el-avatar :size="24" class="person-avatar">{{ (scope.row.inboundPersonName || '?').charAt(0) }}</el-avatar>
            <span>{{ scope.row.inboundPersonName || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('inboundTime')"
        prop="inboundTime"
        label="入库时间"
        width="170"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="date-text">{{ formatDateTime(scope.row.inboundTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('purchaseDate')"
        prop="purchaseDate"
        label="入库日期"
        width="130"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="date-text">{{ formatDate(scope.row.purchaseDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('outboundPerson')"
        prop="outboundPersonName"
        label="出库人员"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="person-cell">
            <el-avatar :size="24" class="person-avatar">{{
              (scope.row.outboundPersonName || '?').charAt(0)
            }}</el-avatar>
            <span>{{ scope.row.outboundPersonName || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('outboundTime')"
        prop="outboundTime"
        label="出库时间"
        width="170"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="date-text">{{ formatDateTime(scope.row.outboundTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="selectedColumns.includes('remark')"
        prop="remark"
        label="备注"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="remark-text">{{ scope.row.remark || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right" align="center" class-name="action-column">
        <template #default="scope">
          <div class="action-buttons">
            <el-button
              :icon="View"
              size="small"
              data-cy="device-view-button"
              @click.stop="handleView(scope.row)"
              class="action-button view-btn"
            >
              查看详情
            </el-button>
            <el-button
              :icon="Edit"
              size="small"
              data-cy="device-edit-button"
              @click.stop="handleEdit(scope.row)"
              class="action-button edit-btn"
            >
              编辑
            </el-button>
            <el-dropdown @command="(cmd) => handleMoreAction(cmd, scope.row)" trigger="click" class="action-dropdown">
              <el-button :icon="MoreFilled" circle size="small" class="more-action-btn" data-cy="device-more-actions-btn" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="connect" :icon="Connection">
                    <span class="dropdown-item-text">远程连接</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="maintenance" :icon="Tools">
                    <span class="dropdown-item-text">维修记录</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="history" :icon="Clock">
                    <span class="dropdown-item-text">历史记录</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" :icon="Delete" divided>
                    <span class="dropdown-item-text delete-text">删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        data-cy="device-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <DeviceDetailDialog
      v-model="detailDialogVisible"
      :device="currentDevice"
      :device-type-options="deviceTypeOptions"
      @edit="handleEdit"
      @delete="handleDelete"
      @connect="handleConnect"
      @maintenance="handleMaintenance"
      @history="handleHistory"
    />

    <DeviceFormDialog
      v-model="formDialogVisible"
      :device="currentDevice"
      :mode="formMode"
      @success="handleFormSuccess"
    />

    <el-dialog v-model="columnConfigVisible" title="列配置" width="500px" data-cy="device-column-config-dialog">
      <el-checkbox-group v-model="selectedColumns" class="column-config-group">
        <el-checkbox
          v-for="column in availableColumns"
          :key="column.prop"
          :label="column.prop"
          :disabled="column.required"
          class="column-checkbox"
        >
          <span class="column-label">{{ column.label }}</span>
          <el-tag v-if="column.required" size="small" type="info">必选</el-tag>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="handleResetColumns" data-cy="device-columns-reset-btn">重置</el-button>
        <el-button @click="columnConfigVisible = false" data-cy="device-columns-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleSaveColumns" data-cy="device-columns-confirm-btn">确定</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import {
  CircleCheck,
  Clock,
  Connection,
  Delete,
  Download,
  Edit,
  Location,
  Monitor,
  MoreFilled,
  Plus,
  Setting,
  Tools,
  View,
  Warning,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { deleteDevice, exportDevices, getDeviceList } from '@/api/device/device';
import { getDeviceTypes } from '@/api/device/device-type';
import { getAreaList } from '@/api/inventory/area';
import BaseEmptyState from '@/components/base/BaseEmptyState.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import DeviceDetailDialog from '@/components/business/device/DeviceDetailDialog.vue';
import DeviceFormDialog from '@/components/business/device/DeviceFormDialog.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { SYSTEM_API } from '@/constants/apiConstants';
import { DeviceStatus, getDeviceStatusTagType, getDeviceStatusText } from '@/constants/deviceStatus';
import { debounce } from '@/utils';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('DeviceList');
const route = useRoute();

const tableRef = ref(null);
const loading = ref(false);
const tableData = ref([]);

// 用于取消请求的 AbortController
let abortController = null;

const searchForm = reactive({
  keyword: '',
  deviceType: '',
  status: '',
  area: '',
  province: '',
  city: '',
  district: '',
});

// 省市区选项 - 必须在 searchFields 之前定义
const provinceOptions = ref([]);
const cityOptions = ref([]);
const districtOptions = ref([]);

// 设备类型选项 - 必须在 searchFields 之前定义
const deviceTypeOptions = ref([]);
// 区域选项 - 必须在 searchFields 之前定义
const areaOptions = ref([]);

const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '请输入设备编号或名称',
    md: 6,
    lg: 6,
    clearable: true,
    prefixIcon: 'Search',
  },
  {
    prop: 'deviceType',
    label: '设备类型',
    type: 'select',
    placeholder: '请选择设备类型',
    md: 6,
    lg: 6,
    clearable: true,
    options: deviceTypeOptions.value || [],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 6,
    lg: 6,
    clearable: true,
    options: [
      { label: '待入库', value: DeviceStatus.PENDING_INBOUND },
      { label: '在库', value: DeviceStatus.IN_STOCK },
      { label: '使用中', value: DeviceStatus.IN_USE },
      { label: '维护中', value: DeviceStatus.MAINTENANCE },
      { label: '已报废', value: DeviceStatus.SCRAPPED },
    ],
  },
  {
    prop: 'area',
    label: '区域',
    type: 'select',
    placeholder: '请选择区域',
    md: 6,
    lg: 6,
    clearable: true,
    options: areaOptions.value || [],
  },
  {
    prop: 'province',
    label: '省份',
    type: 'select',
    placeholder: '全部省份',
    md: 6,
    lg: 6,
    clearable: true,
    options: [{ label: '全部省份', value: '' }, ...(provinceOptions.value || [])],
  },
  {
    prop: 'city',
    label: '城市',
    type: 'select',
    placeholder: '全部城市',
    md: 6,
    lg: 6,
    clearable: true,
    options: [{ label: '全部城市', value: '' }, ...(cityOptions.value || [])],
    disabled: !searchForm.province,
  },
  {
    prop: 'district',
    label: '区县',
    type: 'select',
    placeholder: '全部区县',
    md: 6,
    lg: 6,
    clearable: true,
    options: [{ label: '全部区县', value: '' }, ...(districtOptions.value || [])],
    disabled: !searchForm.city,
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.inventoryQuery(searchFields.value));

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const detailDialogVisible = ref(false);
const formDialogVisible = ref(false);
const columnConfigVisible = ref(false);
const currentDevice = ref(null);
const formMode = ref('add');

const availableColumns = [
  // 基础信息（核心字段）
  { prop: 'deviceCode', label: '设备编号', required: true },
  { prop: 'name', label: '设备名称', required: true },
  { prop: 'type', label: '设备类型', required: false },
  { prop: 'model', label: '规格型号', required: false },
  { prop: 'manufacturer', label: '制造商', required: false },

  // 状态与位置（业务关键）
  { prop: 'status', label: '状态', required: false },
  { prop: 'currentLocation', label: '当前位置', required: false },

  // 人员信息（责任追溯）
  { prop: 'principal', label: '负责人', required: false },
  { prop: 'installer', label: '安装人员', required: false },

  // 入库信息（入库追溯）
  { prop: 'inboundPerson', label: '入库人员', required: false },
  { prop: 'inboundTime', label: '入库时间', required: false },
  { prop: 'purchaseDate', label: '入库日期', required: false },

  // 出库信息（出库追溯）
  { prop: 'outboundPerson', label: '出库人员', required: false },
  { prop: 'outboundTime', label: '出库时间', required: false },

  // 其他
  { prop: 'remark', label: '备注', required: false },
];

const defaultColumns = ['deviceCode', 'name', 'type', 'model', 'status', 'currentLocation'];

const selectedColumns = ref([...defaultColumns]);

const initFromRoute = () => {
  const { typeId } = route.query;
  if (typeId) {
    searchForm.deviceType = typeId;
    pagination.current = 1;
  }
};

const tableHeight = computed(() => {
  const windowHeight = window.innerHeight;
  const headerHeight = 60;
  const filterHeight = 120;
  const paginationHeight = 60;
  const padding = 40;
  return windowHeight - headerHeight - filterHeight - paginationHeight - padding;
});

const onlineCount = computed(() => {
  if (!Array.isArray(tableData.value)) {
    return 0;
  }
  return tableData.value.filter(
    (device) => device && (device.status === DeviceStatus.IN_STOCK || device.status === DeviceStatus.IN_USE)
  ).length;
});

const maintenanceCount = computed(() => {
  if (!Array.isArray(tableData.value)) {
    return 0;
  }
  return tableData.value.filter((device) => device && device.status === DeviceStatus.MAINTENANCE).length;
});

const abnormalCount = computed(() => {
  if (!Array.isArray(tableData.value)) {
    return 0;
  }
  return tableData.value.filter(
    (device) => device && (device.status === DeviceStatus.SCRAPPED || device.status === DeviceStatus.PENDING_INBOUND)
  ).length;
});

const getDeviceIcon = (device) => {
  if (!device) {
    return Monitor;
  }

  // 获取设备类型名称 - 优先使用 deviceTypeName
  let typeName = '';
  if (device.deviceTypeName) {
    typeName = device.deviceTypeName.toLowerCase();
  } else if (device.type && typeof device.type === 'object' && device.type.name) {
    typeName = device.type.name.toLowerCase();
  } else {
    // 从 deviceTypeOptions 中查找
    const typeId = device.deviceTypeId || device.typeId || device.type;
    if (typeId !== undefined && typeId !== null) {
      const typeOption = deviceTypeOptions.value.find((opt) => opt.value === typeId || opt.value === Number(typeId));
      if (typeOption) {
        typeName = typeOption.label.toLowerCase();
      }
    }
  }

  if (typeName.includes('服务器') || typeName.includes('server')) {
    return Monitor;
  }
  if (typeName.includes('网络') || typeName.includes('network')) {
    return Connection;
  }
  return Monitor;
};

const getDeviceIconClass = (device) => {
  if (!device) {
    return '';
  }
  // status 是数字类型，直接使用数字比较
  const { status } = device;
  if (status === DeviceStatus.IN_STOCK || status === DeviceStatus.IN_USE) {
    return 'icon-online';
  }
  if (status === DeviceStatus.MAINTENANCE) {
    return 'icon-maintenance';
  }
  if (status === DeviceStatus.SCRAPPED || status === DeviceStatus.PENDING_INBOUND) {
    return 'icon-abnormal';
  }
  return 'icon-default';
};

// 获取设备类型显示名称
const getDeviceTypeName = (device) => {
  if (!device) {
    return '未分类';
  }

  // 优先使用后端直接返回的 deviceTypeName
  if (device.deviceTypeName) {
    return device.deviceTypeName;
  }

  // 如果 type 是对象且有 name 属性
  if (device.type && typeof device.type === 'object' && device.type.name) {
    return device.type.name;
  }

  // 如果 type 是数字 ID，从 deviceTypeOptions 中查找
  const typeId = device.deviceTypeId || device.typeId || device.type;
  if (typeId !== undefined && typeId !== null) {
    const typeOption = deviceTypeOptions.value.find((opt) => opt.value === typeId || opt.value === Number(typeId));
    if (typeOption) {
      return typeOption.label;
    }
    // 有typeId但找不到对应的类型名称
    return '未知类型';
  }

  // 完全没有类型信息
  return '未分类';
};

const getDeviceTypeTagType = (deviceType) => {
  if (deviceType === null || deviceType === undefined) {
    return 'info';
  }

  let typeName = '';
  if (typeof deviceType === 'object' && deviceType !== null && deviceType.name) {
    typeName = String(deviceType.name).toLowerCase();
  } else if (typeof deviceType === 'string') {
    typeName = deviceType.toLowerCase();
  } else if (typeof deviceType === 'number') {
    typeName = String(deviceType);
  }

  if (typeName.includes('服务器')) {
    return 'primary';
  }
  if (typeName.includes('网络')) {
    return 'success';
  }
  if (typeName.includes('存储')) {
    return 'warning';
  }
  return 'info';
};

const getStatusClass = (status) => {
  if (status === undefined || status === null) {
    return 'status-default';
  }
  // status 是数字类型，直接使用数字比较
  if (status === DeviceStatus.IN_STOCK || status === DeviceStatus.IN_USE) {
    return 'status-online';
  }
  if (status === DeviceStatus.MAINTENANCE) {
    return 'status-maintenance';
  }
  if (status === DeviceStatus.SCRAPPED || status === DeviceStatus.PENDING_INBOUND) {
    return 'status-abnormal';
  }
  return 'status-default';
};

const getRowClassName = ({ row }) => {
  if (!row) {
    return '';
  }
  // status 是数字类型，直接使用数字比较
  const { status } = row;
  if (status === DeviceStatus.SCRAPPED || status === DeviceStatus.PENDING_INBOUND) {
    return 'row-abnormal';
  }
  if (status === DeviceStatus.MAINTENANCE) {
    return 'row-maintenance';
  }
  return '';
};

const formatDate = (date) => {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleDateString('zh-CN');
};

const formatDateTime = (dateTime) => {
  if (!dateTime) {
    return '-';
  }
  const date = new Date(dateTime);
  return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
};

const handleRowDblClick = (row) => {
  if (!row) {
    logger.warn('handleRowDblClick: row参数为空');
    return;
  }
  handleEdit(row);
};

const handleMoreAction = (command, row) => {
  if (!row) {
    logger.warn('handleMoreAction: row参数为空');
    return;
  }
  switch (command) {
    case 'connect':
      ElMessage.info('远程连接功能开发中');
      break;
    case 'maintenance':
      ElMessage.info('维修记录功能开发中');
      break;
    case 'history':
      ElMessage.info('历史记录功能开发中');
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

/**
 * 加载设备列表
 * @returns {Promise<void>}
 */
const loadDeviceList = async () => {
  // 取消之前的请求
  if (abortController) {
    abortController.abort();
  }

  // 创建新的 AbortController
  abortController = new AbortController();

  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      typeId: searchForm.deviceType || undefined,
      status: searchForm.status || undefined,
      areaId: searchForm.area || undefined,
      keyword: searchForm.keyword || undefined,
      installationProvince: searchForm.province || undefined,
      installationCity: searchForm.city || undefined,
      installationDistrict: searchForm.district || undefined,
    };

    const response = await getDeviceList(params, { signal: abortController.signal });

    if (response.code === 200 && response.data) {
      let devices = response.data.devices || response.data.records || response.data.content || response.data.list || [];
      if (!Array.isArray(devices)) {
        devices = [];
      }
      tableData.value = devices.filter((item) => item !== null);
      pagination.total = response.data.total || 0;
      await loadInstallationRecords();
    } else {
      tableData.value = [];
      ElMessage.error(response.message || '加载设备列表失败');
    }
  } catch (error) {
    if (error.name === 'CanceledError' || error.name === 'AbortError') {
      logger.info('请求已取消');
      return;
    }
    logger.error('加载设备列表失败:', error);
    tableData.value = [];
    ElMessage.error('加载设备列表失败');
  } finally {
    loading.value = false;
  }
};

// 防抖处理的搜索函数（300ms延迟）
const debouncedSearch = debounce(() => {
  pagination.current = 1;
  loadDeviceList();
}, 300);

const handleSearch = () => {
  debouncedSearch();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.deviceType = '';
  searchForm.status = '';
  searchForm.area = '';
  searchForm.province = '';
  searchForm.city = '';
  searchForm.district = '';
  pagination.current = 1;
  loadDeviceList();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  loadDeviceList();
};

const handleCurrentChange = (page) => {
  pagination.current = page;
  loadDeviceList();
};

const handleRowClick = (row) => {
  if (!row) {
    logger.warn('handleRowClick: row参数为空');
    return;
  }
  handleView(row);
};

const handleView = (row) => {
  if (!row) {
    logger.warn('handleView: row参数为空');
    return;
  }
  currentDevice.value = row;
  detailDialogVisible.value = true;
};

const handleEdit = (row) => {
  if (!row) {
    logger.warn('handleEdit: row参数为空');
    return;
  }
  currentDevice.value = row;
  formMode.value = 'edit';
  formDialogVisible.value = true;
};

const handleAddDevice = () => {
  currentDevice.value = null;
  formMode.value = 'add';
  formDialogVisible.value = true;
};

const handleDelete = async (row) => {
  if (!row || !row.id) {
    logger.warn('handleDelete: row参数为空或缺少id');
    ElMessage.warning('设备信息不完整');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除该设备吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteDevice(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadDeviceList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除设备失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleConnect = (_device) => {
  ElMessage.info('远程连接功能开发中');
};

const handleMaintenance = (_device) => {
  ElMessage.info('维修记录功能开发中');
};

const handleHistory = (_device) => {
  ElMessage.info('历史记录功能开发中');
};

const handleFormSuccess = () => {
  loadDeviceList();
};

const handleExport = async () => {
  try {
    const params = {
      typeId: searchForm.deviceType || undefined,
      status: searchForm.status || undefined,
      areaId: searchForm.area || undefined,
      keyword: searchForm.keyword || undefined,
    };

    const response = await exportDevices(params);
    if (response.code === 200) {
      ElMessage.success('导出成功');
    } else {
      ElMessage.error(response.message || '导出失败');
    }
  } catch (error) {
    logger.error('导出设备失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleColumnConfig = () => {
  columnConfigVisible.value = true;
};

const handleSaveColumns = () => {
  columnConfigVisible.value = false;
  ElMessage.success('列配置已保存');
};

const handleResetColumns = () => {
  selectedColumns.value = [...defaultColumns];
};

const getRowKey = (row) => {
  return row?.id || row?.deviceCode || Math.random().toString(36);
};

const getStockLocation = (device) => {
  if (!device) {
    return '-';
  }

  // 根据状态智能判断显示哪种位置
  const { status } = device;

  // 已安装状态 - 强制显示安装地址（省市区），不使用currentLocation
  if (status === 1) {
    // 组合省市区地址
    const parts = [];
    if (device.installationProvince) {
      parts.push(device.installationProvince);
    }
    if (device.installationCity) {
      parts.push(device.installationCity);
    }
    if (device.installationDistrict) {
      parts.push(device.installationDistrict);
    }
    if (device.installationAddress) {
      parts.push(device.installationAddress);
    }

    // 已安装设备必须包含完整的省市区地址信息
    if (parts.length < 3) {
      logger.warn('已安装设备地址信息不完整', device);
      return '地址信息不完整';
    }

    return parts.join(' > ');
  }

  // 待安装状态 - 检查是否有安装地址信息
  if (status === -2) {
    // 组合省市区地址
    const parts = [];
    if (device.installationProvince) {
      parts.push(device.installationProvince);
    }
    if (device.installationCity) {
      parts.push(device.installationCity);
    }
    if (device.installationDistrict) {
      parts.push(device.installationDistrict);
    }
    if (device.installationAddress) {
      parts.push(device.installationAddress);
    }

    // 待安装设备如果缺少地址信息，提示需要完善
    if (parts.length < 3) {
      return '待安装 - 地址待完善';
    }

    return `待安装: ${parts.join(' > ')}`;
  }

  // 优先使用后端计算的 currentLocation（仅对在库等其他状态）
  if (device.currentLocation && device.currentLocation !== '-') {
    return device.currentLocation;
  }

  // 在库状态 - 显示仓库位置
  if (status === 0) {
    const parts = [];
    if (device.warehouseName) {
      parts.push(device.warehouseName);
    }
    if (device.areaName) {
      parts.push(device.areaName);
    }
    if (device.binName) {
      parts.push(device.binName);
    }
    if (parts.length > 0) {
      return parts.join(' > ');
    }
    return '仓库中';
  }

  // 其他状态
  if (status === -1) {
    return '待入库';
  }
  if (status === 2) {
    return '维护中';
  }
  if (status === 3) {
    return '已报废';
  }

  return '-';
};

// 检查设备地址是否完整
const isAddressIncomplete = (device) => {
  if (!device) {
    return false;
  }

  // 已安装或待安装状态才需要检查地址
  if (device.status !== DeviceStatus.IN_USE && device.status !== DeviceStatus.PENDING_INSTALLATION) {
    return false;
  }

  // 检查是否有完整的省市区信息
  const hasProvince = !!device.installationProvince;
  const hasCity = !!device.installationCity;
  const hasDistrict = !!device.installationDistrict;

  return !(hasProvince && hasCity && hasDistrict);
};

// 获取位置图标样式
const getLocationIconClass = (device) => {
  if (!device) {
    return '';
  }

  if (isAddressIncomplete(device)) {
    return 'incomplete';
  }

  switch (device.status) {
    case DeviceStatus.IN_USE:
      return 'installed';
    case DeviceStatus.PENDING_INSTALLATION:
      return 'pending';
    case DeviceStatus.IN_STOCK:
      return 'in-stock';
    case DeviceStatus.MAINTENANCE:
      return 'maintenance';
    default:
      return '';
  }
};

// 处理完善地址
const handleFixAddress = (device) => {
  if (!device) {
    return;
  }

  ElMessageBox.confirm(
    `设备 "${device.deviceName || device.name || device.deviceCode}" 的安装地址信息不完整，是否立即完善？`,
    '完善安装地址',
    {
      confirmButtonText: '立即完善',
      cancelButtonText: '稍后处理',
      type: 'warning',
    }
  )
    .then(() => {
      // 打开设备编辑对话框，并切换到安装信息标签
      handleEdit(device, 'installation');
    })
    .catch(() => {
      // 用户取消，不做任何操作
    });
};

const loadInstallationRecords = async () => {
  // 暂时跳过批量加载安装记录，因为后端没有提供批量查询接口
  // 安装记录将在查看设备详情时单独加载
};

// 加载设备类型选项
const loadDeviceTypeOptions = async () => {
  try {
    const response = await getDeviceTypes();
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      deviceTypeOptions.value = dataArray.map((type) => ({
        label: type.name || type.typeName || '未知类型',
        value: type.id || type.typeId || type.typeCode,
      }));
      logger.debug('设备类型选项加载完成:', deviceTypeOptions.value);
    }
  } catch (error) {
    logger.error('加载设备类型选项失败:', error);
  }
};

// 加载区域选项
const loadAreaOptions = async () => {
  try {
    const response = await getAreaList();
    if (response.code === 200 && response.data) {
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      areaOptions.value = dataArray.map((area) => ({
        label: area.name || area.areaName || '未知区域',
        value: area.id || area.areaId || area.code,
      }));
      logger.debug('区域选项加载完成:', areaOptions.value);
    }
  } catch (error) {
    logger.error('加载区域选项失败:', error);
    // 如果API调用失败，使用空数组
    areaOptions.value = [];
  }
};

// 加载省份选项（从行政区划API获取）
const loadProvinceOptions = async () => {
  try {
    const response = await request.get(SYSTEM_API.DIVISION_PROVINCES);
    if (response.code === 200 && response.data) {
      const dataArray = Array.isArray(response.data) ? response.data : [];
      provinceOptions.value = dataArray.map((item) => ({
        label: item.name || item.divisionName || '未知省份',
        value: item.id || item.code,
      }));
      logger.debug('省份选项加载完成:', provinceOptions.value);
    }
  } catch (error) {
    logger.error('加载省份选项失败:', error);
    provinceOptions.value = [];
  }
};

// 监听省份变化，加载城市选项
watch(
  () => searchForm.province,
  async (newProvince) => {
    if (!newProvince) {
      cityOptions.value = [];
      searchForm.city = '';
      districtOptions.value = [];
      searchForm.district = '';
      return;
    }

    try {
      const response = await request.get(SYSTEM_API.DIVISION_CITIES(newProvince));
      if (response.code === 200 && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        cityOptions.value = dataArray.map((item) => ({
          label: item.name || item.divisionName || '未知城市',
          value: item.id || item.code,
        }));
        logger.debug('城市选项加载完成:', cityOptions.value);
      }
    } catch (error) {
      logger.error('加载城市选项失败:', error);
      cityOptions.value = [];
    }
  }
);

// 监听城市变化，加载区县选项
watch(
  () => searchForm.city,
  async (newCity) => {
    if (!newCity) {
      districtOptions.value = [];
      searchForm.district = '';
      return;
    }

    try {
      const response = await request.get(SYSTEM_API.DIVISION_DISTRICTS(newCity));
      if (response.code === 200 && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        districtOptions.value = dataArray.map((item) => ({
          label: item.name || item.divisionName || '未知区县',
          value: item.id || item.code,
        }));
        logger.debug('区县选项加载完成:', districtOptions.value);
      }
    } catch (error) {
      logger.error('加载区县选项失败:', error);
      districtOptions.value = [];
    }
  }
);

onMounted(async () => {
  await Promise.all([loadDeviceTypeOptions(), loadAreaOptions(), loadProvinceOptions()]);
  initFromRoute();
  loadDeviceList();
});

onUnmounted(() => {
  // 组件卸载时取消 pending 的请求
  if (abortController) {
    abortController.abort();
  }
});

watch(
  () => route.query.typeId,
  (newTypeId) => {
    if (newTypeId) {
      searchForm.deviceType = newTypeId;
      pagination.current = 1;
      loadDeviceList();
    }
  }
);
</script>

<style scoped>
/* 统计卡片样式 */
.stats-card {
  margin-bottom: var(--spacing-5);
  border-radius: var(--border-radius-xl);
  border: none;
}

.stats-card :deep(.el-card__body) {
  padding: var(--spacing-5);
}

.device-stats {
  display: flex;
  gap: var(--spacing-6);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--bg-color);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  flex: 1;
  min-width: 160px;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.stat-icon.total {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
  color: var(--primary-600);
}

.stat-icon.success {
  background: linear-gradient(135deg, var(--success-100) 0%, var(--success-200) 100%);
  color: var(--success-600);
}

.stat-icon.warning {
  background: linear-gradient(135deg, var(--warning-100) 0%, var(--warning-200) 100%);
  color: var(--warning-600);
}

.stat-icon.danger {
  background: linear-gradient(135deg, var(--error-100) 0%, var(--error-200) 100%);
  color: var(--error-600);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.device-table {
  border-radius: var(--border-radius-lg);
  overflow: visible;
}

.device-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, var(--slate-50) 0%, var(--slate-100) 100%);
}

.device-table :deep(.el-table__header th) {
  background: transparent;
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  padding: var(--spacing-4) var(--spacing-3);
  border-bottom: 2px solid var(--border-color);
}

.device-table :deep(.el-table__body tr) {
  transition: all 0.3s ease;
}

.device-table :deep(.el-table__body tr:hover > td) {
  cursor: pointer;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%) !important;
}

.device-table :deep(.el-table__body tr.row-abnormal > td) {
  background: var(--error-fade);
}

.device-table :deep(.el-table__body tr.row-maintenance > td) {
  background: var(--warning-fade);
}

.device-table :deep(.el-table__body td) {
  padding: var(--spacing-3) var(--spacing-3);
  border-bottom: 1px solid var(--border-color-light);
}

.device-code-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2-5);
}

.device-icon {
  font-size: var(--font-size-lg);
  transition: all 0.3s ease;
}

.device-icon.icon-online {
  color: var(--success-color);
}

.device-icon.icon-maintenance {
  color: var(--warning-color);
}

.device-icon.icon-abnormal {
  color: var(--error-color);
}

.device-icon.icon-default {
  color: var(--text-tertiary);
}

.device-icon:hover {
  transform: scale(1.2);
}

.device-code-text {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

.device-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.device-name-text {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.model-tag {
  font-size: var(--font-size-xs);
  padding: var(--spacing-0-5) var(--spacing-2);
  border-radius: var(--border-radius-sm);
}

.device-type-tag {
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

.device-type-tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--box-shadow-sm);
}

.status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.status-online {
  background: var(--success-color);
  box-shadow: 0 0 0 3px var(--success-fade);
}

.status-indicator.status-maintenance {
  background: var(--warning-color);
  box-shadow: 0 0 0 3px var(--warning-fade);
}

.status-indicator.status-abnormal {
  background: var(--error-color);
  box-shadow: 0 0 0 3px var(--error-fade);
}

.status-indicator.status-default {
  background: var(--text-tertiary);
  box-shadow: 0 0 0 3px rgba(var(--slate-500-rgb), 0.2);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-tag {
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

.status-tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--box-shadow-sm);
}

.location-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);

  &.incomplete-address {
    background: rgba(230, 162, 60, 0.1);
    border-radius: 4px;
    padding: 4px 8px;
    margin: -4px -8px;
    border: 1px dashed #e6a23c;

    .location-text {
      color: #e6a23c;
      font-weight: 500;
    }
  }
}

.location-icon {
  color: var(--text-tertiary);
  font-size: var(--font-size-lg);
  transition: all 0.3s ease;

  &.incomplete {
    color: #e6a23c;
    animation: pulse 2s infinite;
  }

  &.installed {
    color: #67c23a;
  }

  &.pending {
    color: #409eff;
  }

  &.in-stock {
    color: #909399;
  }

  &.maintenance {
    color: #f56c6c;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.location-icon:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.location-text {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  flex: 1;
}

.fix-address-btn {
  margin-left: auto;
  padding: 2px 8px;
  font-size: 12px;

  &:hover {
    background: rgba(230, 162, 60, 0.1);
  }
}

.manufacturer-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.date-text {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.principal-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.principal-avatar {
  background: var(--primary-100);
  color: var(--primary-700);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  border: 1px solid var(--primary-200);
}

.installer-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.installer-avatar {
  background: var(--success-100);
  color: var(--success-700);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  border: 1px solid var(--success-200);
}

/* 人员显示样式 */
.person-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.person-avatar {
  background: var(--info-100);
  color: var(--info-700);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  border: 1px solid var(--info-200);
}

.remark-text {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  justify-content: center;
}

.action-button {
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1-5) var(--spacing-3-5);
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.action-button.view-btn {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  color: var(--primary-600);
}

.action-button.view-btn:hover {
  background: var(--primary-100);
  border-color: var(--primary-400);
  color: var(--primary-700);
}

.action-button.edit-btn {
  background: var(--warning-50);
  border: 1px solid var(--warning-200);
  color: var(--warning-600);
}

.action-button.edit-btn:hover {
  background: var(--warning-100);
  border-color: var(--warning-400);
  color: var(--warning-700);
}

.more-action-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-tertiary);
  transition: all 0.3s ease;
}

.more-action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-50);
  transform: rotate(90deg);
}

.action-dropdown :deep(.el-dropdown-menu__item) {
  padding: var(--spacing-2) var(--spacing-4);
  transition: all 0.2s ease;
}

.action-dropdown :deep(.el-dropdown-menu__item:hover) {
  background: var(--slate-100);
  padding-left: var(--spacing-5);
}

.dropdown-item-text {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.dropdown-item-text.delete-text {
  color: var(--error-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-5) 0;
  background: var(--slate-50);
  border-radius: var(--border-radius-lg);
  margin-top: var(--spacing-4);
}

.pagination-wrapper :deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.pagination-wrapper :deep(.el-pagination button) {
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
}

.pagination-wrapper :deep(.el-pagination button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-sm);
}

.pagination-wrapper :deep(.el-pagination .el-pager li) {
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
}

.pagination-wrapper :deep(.el-pagination .el-pager li:hover) {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-sm);
}

.pagination-wrapper :deep(.el-pagination .el-pager li.is-active) {
  background: var(--primary-600);
  color: var(--bg-color);
}

.pagination-wrapper :deep(.el-pagination .el-pager li.is-active:hover) {
  background: var(--primary-700);
}

.column-config-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-2);
}

.column-checkbox {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
  background: var(--bg-color);
}

.column-checkbox:hover {
  border-color: var(--primary-color);
  background: var(--primary-50);
  transform: translateX(var(--spacing-1));
  box-shadow: var(--box-shadow-sm);
}

.column-checkbox.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.column-checkbox.is-disabled:hover {
  border-color: var(--border-color);
  background: var(--bg-color);
  transform: none;
  box-shadow: none;
}

.column-label {
  flex: 1;
  margin-left: var(--spacing-2);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 1200px) {
  .device-stats {
    gap: var(--spacing-4);
  }

  .stat-item {
    padding: var(--spacing-3) var(--spacing-4);
    min-width: 140px;
  }

  .stat-value {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 768px) {
  .device-stats {
    gap: var(--spacing-3);
  }

  .stat-item {
    padding: var(--spacing-3);
    min-width: calc(50% - var(--spacing-3));
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: var(--font-size-lg);
  }

  .stat-label {
    font-size: var(--font-size-xs);
  }

  .device-code-text {
    font-size: var(--font-size-xs);
  }

  .device-name-text {
    font-size: var(--font-size-sm);
  }

  .location-text {
    font-size: var(--font-size-xs);
  }

  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .action-button {
    padding: var(--spacing-1) var(--spacing-2-5);
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .stat-item {
    min-width: 100%;
  }

  .stat-value {
    font-size: var(--font-size-base);
  }
}
</style>
