<template>
  <PageLayout title="仓库管理" description="管理仓库基本信息、地理位置和库存容量" data-cy="warehouse-page">
    <template #headerActions>
      <el-button data-cy="warehouse-add-btn" type="primary" :icon="Plus" @click="handleAdd" :loading="addLoading">
        添加仓库
      </el-button>
      <el-button type="success" :icon="MagicStick" @click="wizardVisible = true" data-cy="warehouse-wizard-btn"> 快速初始化 </el-button>
      <el-button data-cy="warehouse-import-btn" :icon="Upload" @click="handleImport"> 导入 </el-button>
      <el-button data-cy="warehouse-export-btn" :icon="Download" @click="handleExport"> 导出 </el-button>
    </template>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><House /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.totalCount || 0 }}</div>
              <div class="stat-label">总仓库数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.activeCount || 0 }}</div>
              <div class="stat-label">启用仓库</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon area">
              <el-icon><FullScreen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(overviewStats.totalArea) }}㎡</div>
              <div class="stat-label">总面积</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon capacity">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(overviewStats.totalCapacity) }}</div>
              <div class="stat-label">总容量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="仓库筛选"
      :header-icon="Filter"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 仓库列表 -->
    <el-card class="warehouse-list-card" shadow="never" data-cy="warehouse-list-card">
      <div class="warehouse-grid">
        <el-card
          v-for="warehouse in warehouseList"
          :key="warehouse.id"
          class="warehouse-item"
          :class="{ 'is-inactive': warehouse.status !== 1 }"
          shadow="hover"
          data-cy="warehouse-item"
        >
          <div class="warehouse-header">
            <div class="warehouse-icon">
              <el-icon><House /></el-icon>
            </div>
            <div class="warehouse-title">
              <h3>{{ warehouse.warehouseName }}</h3>
              <el-tag :type="warehouse.status === 1 ? 'success' : 'info'" size="small">
                {{ warehouse.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </div>
            <el-dropdown @command="(cmd) => handleCommand(cmd, warehouse)">
              <el-button link data-cy="warehouse-more-btn">
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="address">
                    <el-icon><MapLocation /></el-icon>地址管理
                  </el-dropdown-item>
                  <el-dropdown-item command="zones">
                    <el-icon><OfficeBuilding /></el-icon>功能区管理
                  </el-dropdown-item>
                  <el-dropdown-item command="bins">
                    <el-icon><Grid /></el-icon>货位管理
                  </el-dropdown-item>
                  <el-dropdown-item divided command="delete">
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="warehouse-info">
            <div class="info-item">
              <el-icon><Document /></el-icon>
              <span class="label">编码:</span>
              <span class="value">{{ warehouse.warehouseCode }}</span>
            </div>
            <div class="info-item">
              <el-icon><MapLocation /></el-icon>
              <span class="label">地址:</span>
              <span class="value" :title="warehouse.fullAddress || warehouse.address">
                {{ formatAddress(warehouse) }}
              </span>
            </div>
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span class="label">联系人:</span>
              <span class="value">{{ warehouse.contactPerson || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span class="label">电话:</span>
              <span class="value">{{ warehouse.contactPhone || '-' }}</span>
            </div>
          </div>

          <div class="warehouse-stats">
            <div class="stat-item">
              <div class="stat-label">功能区</div>
              <div class="stat-value">{{ warehouse.zoneCount || 0 }}个</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">货位</div>
              <div class="stat-value">{{ warehouse.binCount || 0 }}个</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">设备</div>
              <div class="stat-value">{{ warehouse.deviceCount || 0 }}台</div>
            </div>
          </div>

          <div class="warehouse-capacity">
            <div class="capacity-header">
              <span>容量使用</span>
              <span>{{ calculateUsageRate(warehouse) }}%</span>
            </div>
            <el-progress
              :percentage="calculateUsageRate(warehouse)"
              :status="getUsageStatus(warehouse)"
              :stroke-width="8"
            />
            <div class="capacity-detail">
              <span>已用: {{ formatNumber(warehouse.usedCapacity) }}</span>
              <span>总容量: {{ formatNumber(warehouse.capacity) }}</span>
            </div>
          </div>

          <div class="warehouse-actions">
            <el-button type="primary" link @click="handleViewDetail(warehouse)" data-cy="warehouse-view-detail-btn">
              <el-icon><View /></el-icon>查看详情
            </el-button>
            <el-button type="success" link @click="handleManageZones(warehouse)" data-cy="warehouse-manage-zones-btn">
              <el-icon><OfficeBuilding /></el-icon>功能区
            </el-button>
            <el-button type="warning" link @click="handleManageBins(warehouse)" data-cy="warehouse-manage-bins-btn">
              <el-icon><Grid /></el-icon>货位
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && warehouseList.length === 0" description="暂无仓库数据" />

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          data-cy="warehouse-list-pagination"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      data-cy="warehouse-dialog"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form data-cy="warehouse-form" ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库编码" prop="warehouseCode">
              <el-input v-model="form.warehouseCode" placeholder="请输入仓库编码" clearable :disabled="isEdit" data-cy="warehouse-code-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库名称" prop="warehouseName">
              <el-input v-model="form.warehouseName" placeholder="请输入仓库名称" clearable data-cy="warehouse-name-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库类型" prop="warehouseType">
              <el-select v-model="form.warehouseType" placeholder="请选择仓库类型" style="width: 100%" data-cy="warehouse-type-select">
                <el-option label="主仓库" :value="1" />
                <el-option label="分仓库" :value="2" />
                <el-option label="临时仓库" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>地址信息</el-divider>

        <!-- 行政区划级联选择器 -->
        <el-form-item label="所在地区" prop="divisionIds">
          <AdministrativeDivisionCascader
            v-model="form.divisionIds"
            placeholder="请选择省/市/区"
            @change="handleDivisionChange"
            @create="handleDivisionCreate"
            allow-create
          />
        </el-form-item>

        <!-- 智能地址输入框 -->
        <el-form-item label="详细地址" prop="detailAddress">
          <SmartAddressInput
            v-model="form.detailAddress"
            :division="selectedDivision"
            placeholder="请输入详细地址"
            @parse="handleAddressParse"
          />
        </el-form-item>

        <el-divider>位置坐标</el-divider>

        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px">
          <template #title>
            <span>手动输入经纬度坐标，用于在地图上定位仓库位置。</span>
            <el-link type="primary" href="https://lbs.amap.com/tools/picker" target="_blank" style="margin-left: 8px">
              去高德地图获取坐标
            </el-link>
          </template>
        </el-alert>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number
                v-model="form.longitude"
                :precision="6"
                :step="0.000001"
                placeholder="如：113.264385"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number
                v-model="form.latitude"
                :precision="6"
                :step="0.000001"
                placeholder="如：23.129163"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>联系信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" clearable data-cy="warehouse-contact-person-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" clearable data-cy="warehouse-contact-phone-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>容量信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="面积(㎡)" prop="areaSize">
              <el-input-number v-model="form.areaSize" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number v-model="form.capacity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="warehouse-dialog-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading" data-cy="warehouse-dialog-submit-btn">确定</el-button>
      </template>
    </el-dialog>

    <!-- 地址管理对话框 -->
    <el-dialog v-model="addressDialogVisible" title="地址管理" width="600px" destroy-on-close data-cy="warehouse-address-dialog">
      <div v-if="selectedWarehouse" class="address-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="当前地址">
            {{ selectedWarehouse.fullAddress || selectedWarehouse.address || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="经度">{{ selectedWarehouse.longitude || '-' }}</el-descriptions-item>
          <el-descriptions-item label="纬度">{{ selectedWarehouse.latitude || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 位置信息展示 -->
        <div class="location-info" v-if="selectedWarehouse.longitude && selectedWarehouse.latitude">
          <el-divider>位置信息</el-divider>
          <div class="location-detail">
            <el-icon :size="20" color="#67c23a"><CircleCheck /></el-icon>
            <span>已设置位置坐标</span>
            <el-tag type="success" size="small">
              {{ selectedWarehouse.longitude.toFixed(6) }}, {{ selectedWarehouse.latitude.toFixed(6) }}
            </el-tag>
          </div>
          <p class="location-hint">
            <el-icon><InfoFilled /></el-icon>
            坐标已保存，可在仓库地图页面查看位置分布
          </p>
        </div>
        <div class="location-info" v-else>
          <el-divider>位置信息</el-divider>
          <div class="location-detail">
            <el-icon :size="20" color="#e6a23c"><Warning /></el-icon>
            <span>未设置位置坐标</span>
          </div>
          <p class="location-hint">
            <el-icon><InfoFilled /></el-icon>
            点击"编辑仓库"设置经纬度坐标，可在地图上定位仓库位置
          </p>
        </div>
      </div>

      <template #footer>
        <el-button @click="addressDialogVisible = false" data-cy="warehouse-address-dialog-close-btn">关闭</el-button>
        <el-button type="primary" @click="handleEditAddress" data-cy="warehouse-address-dialog-edit-btn">编辑地址</el-button>
      </template>
    </el-dialog>

    <!-- 快捷操作链 -->
    <QuickActionChain
      v-model="quickActionVisible"
      title="仓库创建成功"
      :message="quickActionMessage"
      :actions="quickActions"
      storage-key="warehouse"
      @action="handleQuickAction"
      @close="handleQuickActionClose"
      @back="handleQuickActionBack"
      @disable="handleQuickActionDisabled"
    />

    <!-- 仓库初始化向导 -->
    <WarehouseInitWizard v-model="wizardVisible" @complete="handleWizardComplete" />
  </PageLayout>
</template>

<script setup>
import {
  Box,
  CircleCheck,
  Delete,
  Document,
  Download,
  Edit,
  Filter,
  FullScreen,
  Grid,
  House,
  InfoFilled,
  MagicStick,
  MapLocation,
  More,
  OfficeBuilding,
  Phone,
  Plus,
  Upload,
  User,
  View,
  Warning,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getCitiesByProvince, getProvinces } from '@/api/administrativeDivision';
import {
  addWarehouse,
  deleteWarehouse,
  getWarehouseDetail,
  getWarehouseList,
  getWarehouseOverviewStats,
  updateWarehouse,
} from '@/api/inventory/warehouse';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import AdministrativeDivisionCascader from '@/components/business/selectors/AdministrativeDivisionCascader.vue';
import SmartAddressInput from '@/components/business/selectors/SmartAddressInput.vue';
import QuickActionChain from '@/components/business/workflow/QuickActionChain.vue';
import WarehouseInitWizard from '@/components/business/workflow/WarehouseInitWizard.vue';
import { createLogger } from '@/utils/logger';
import { getWarehouseDefaults, setWarehouseContext } from '@/utils/workflowContext';

const logger = createLogger('WarehouseList');

const router = useRouter();

// 加载状态
const loading = ref(false);
const addLoading = ref(false);
const submitLoading = ref(false);

// 快捷操作链
const quickActionVisible = ref(false);
const quickActions = ref([]);
const lastCreatedWarehouse = ref(null);
const quickActionMessage = computed(() => {
  const name = lastCreatedWarehouse.value?.warehouseName || '新仓库';
  return `仓库 "${name}" 创建成功！`;
});

// 仓库初始化向导
const wizardVisible = ref(false);

// 搜索表单
const searchForm = reactive({
  keyword: '',
  provinceId: null,
  cityId: null,
  status: null,
});

// 筛选字段配置
const filterFields = [
  {
    type: 'select',
    label: '省份',
    prop: 'provinceId',
    options: [],
    clearable: true,
  },
  {
    type: 'select',
    label: '城市',
    prop: 'cityId',
    options: [],
    clearable: true,
    disabled: true,
  },
  {
    type: 'select',
    label: '状态',
    prop: 'status',
    options: [
      { label: '全部', value: null },
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ],
    clearable: true,
  },
  {
    type: 'input',
    label: '关键词',
    prop: 'keyword',
    placeholder: '搜索名称或编码',
    clearable: true,
  },
];

// 数据
const warehouseList = ref([]);
const overviewStats = ref({});
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 行政区划选项
const provinceOptions = ref([]);
const cityOptions = ref([]);
const districtOptions = ref([]);

// 对话框
const dialogVisible = ref(false);
const addressDialogVisible = ref(false);
const dialogTitle = ref('添加仓库');
const isEdit = ref(false);
const formRef = ref(null);
const selectedWarehouse = ref(null);

// 表单
const form = reactive({
  id: null,
  warehouseCode: '',
  warehouseName: '',
  warehouseType: 1,
  status: 1,
  provinceId: null,
  cityId: null,
  districtId: null,
  divisionIds: [], // 级联选择器的值 [provinceId, cityId, districtId]
  detailAddress: '',
  longitude: null,
  latitude: null,
  contactPerson: '',
  contactPhone: '',
  areaSize: null,
  capacity: null,
});

// 选中的行政区划数据
const selectedDivision = reactive({
  province: '',
  city: '',
  district: '',
});

// 表单校验规则
const rules = {
  warehouseCode: [
    { required: true, message: '请输入仓库编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  warehouseName: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  divisionIds: [{ required: true, message: '请选择所在地区', trigger: 'change', type: 'array' }],
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const [listRes, statsRes] = await Promise.all([
      getWarehouseList({
        page: pagination.page - 1,
        size: pagination.pageSize,
        keyword: searchForm.keyword,
        provinceId: searchForm.provinceId,
        cityId: searchForm.cityId,
        status: searchForm.status,
      }),
      getWarehouseOverviewStats(),
    ]);

    if (listRes.code === 200 || listRes.success) {
      warehouseList.value = listRes.data?.content || listRes.data?.list || [];
      pagination.total = listRes.data?.totalElements || listRes.data?.total || 0;
    }

    if (statsRes.code === 200 || statsRes.success) {
      overviewStats.value = statsRes.data || {};
    }
  } catch (error) {
    logger.error('加载数据失败', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载省份选项
const loadProvinces = async () => {
  try {
    const res = await getProvinces();
    if (res.code === 200 || res.success) {
      provinceOptions.value = res.data || [];
      filterFields[0].options = provinceOptions.value.map((p) => ({
        label: p.name,
        value: p.id,
      }));
    }
  } catch (error) {
    logger.error('加载省份失败', error);
  }
};

// 加载城市选项
const loadCities = async (provinceId) => {
  if (!provinceId) {
    cityOptions.value = [];
    return;
  }
  try {
    const res = await getCitiesByProvince(provinceId);
    if (res.code === 200 || res.success) {
      cityOptions.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载城市失败', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.provinceId = null;
  searchForm.cityId = null;
  searchForm.status = null;
  pagination.page = 1;
  loadData();
};

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  loadData();
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadData();
};

// 格式化地址
const formatAddress = (warehouse) => {
  const parts = [];
  if (warehouse.provinceName) {
    parts.push(warehouse.provinceName);
  }
  if (warehouse.cityName) {
    parts.push(warehouse.cityName);
  }
  if (warehouse.districtName) {
    parts.push(warehouse.districtName);
  }
  if (warehouse.detailAddress) {
    parts.push(warehouse.detailAddress);
  }
  return parts.join('') || warehouse.address || '-';
};

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) {
    return '0';
  }
  return num.toLocaleString();
};

// 计算使用率
const calculateUsageRate = (warehouse) => {
  if (!warehouse.capacity || warehouse.capacity === 0) {
    return 0;
  }
  const used = warehouse.usedCapacity || 0;
  return Math.round((used / warehouse.capacity) * 100);
};

// 获取使用状态
const getUsageStatus = (warehouse) => {
  const rate = calculateUsageRate(warehouse);
  if (rate >= 90) {
    return 'exception';
  }
  if (rate >= 70) {
    return 'warning';
  }
  return 'success';
};

// 下拉菜单命令
const handleCommand = (command, warehouse) => {
  selectedWarehouse.value = warehouse;
  switch (command) {
    case 'edit':
      handleEdit(warehouse);
      break;
    case 'address':
      addressDialogVisible.value = true;
      break;
    case 'zones':
      handleManageZones(warehouse);
      break;
    case 'bins':
      handleManageBins(warehouse);
      break;
    case 'delete':
      handleDelete(warehouse);
      break;
  }
};

// 添加
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = '添加仓库';
  resetForm();

  // 应用智能默认值
  const defaults = getWarehouseDefaults();
  logger.debug('应用智能默认值:', defaults);

  if (defaults.provinceId) {
    form.provinceId = defaults.provinceId;
    form.divisionIds = [defaults.provinceId];

    if (defaults.cityId) {
      form.cityId = defaults.cityId;
      form.divisionIds.push(defaults.cityId);

      if (defaults.districtId) {
        form.districtId = defaults.districtId;
        form.divisionIds.push(defaults.districtId);
      }
    }

    // 加载城市列表
    loadCities(defaults.provinceId);
  }

  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (warehouse) => {
  isEdit.value = true;
  dialogTitle.value = '编辑仓库';

  // 获取完整的仓库详情
  try {
    const res = await getWarehouseDetail(warehouse.id);
    if (res.code === 200 && res.data) {
      const detail = res.data;
      Object.assign(form, detail);

      // 设置级联选择器的值
      const divisionIds = [];
      if (detail.provinceId) {
        divisionIds.push(detail.provinceId);
      }
      if (detail.cityId) {
        divisionIds.push(detail.cityId);
      }
      if (detail.districtId) {
        divisionIds.push(detail.districtId);
      }
      form.divisionIds = divisionIds;

      // 设置行政区划名称（用于智能地址填充）
      selectedDivision.province = detail.provinceName || '';
      selectedDivision.city = detail.cityName || '';
      selectedDivision.district = detail.districtName || '';
    }
  } catch (error) {
    logger.error('获取仓库详情失败:', error);
    ElMessage.error('获取仓库详情失败');
  }

  dialogVisible.value = true;
};

// 删除
const handleDelete = (warehouse) => {
  ElMessageBox.confirm(`确定要删除仓库 "${warehouse.warehouseName}" 吗？\n删除后无法恢复，请谨慎操作。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteWarehouse(warehouse.id);
        if (res.code === 200 || res.success) {
          ElMessage.success('删除成功');
          loadData();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      } catch (error) {
        logger.error('删除失败', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 查看详情
const handleViewDetail = (warehouse) => {
  router.push(`/warehouse/detail/${warehouse.id}`);
};

// 管理功能区
const handleManageZones = (warehouse) => {
  router.push(`/warehouse/zone?warehouseId=${warehouse.id}`);
};

// 管理货位
const handleManageBins = (warehouse) => {
  router.push(`/warehouse/bin?warehouseId=${warehouse.id}`);
};

// 编辑地址
const handleEditAddress = () => {
  addressDialogVisible.value = false;
  if (selectedWarehouse.value) {
    handleEdit(selectedWarehouse.value);
  }
};

// 行政区划级联选择器变化
const handleDivisionChange = async (data) => {
  logger.debug('行政区划选择变化:', data);

  // 更新表单数据
  if (data.value && data.value.length > 0) {
    form.provinceId = data.value[0] || null;
    form.cityId = data.value[1] || null;
    form.districtId = data.value[2] || null;

    // 更新选中的行政区划名称
    selectedDivision.province = data.province?.name || '';
    selectedDivision.city = data.city?.name || '';
    selectedDivision.district = data.district?.name || '';
  } else {
    form.provinceId = null;
    form.cityId = null;
    form.districtId = null;
    selectedDivision.province = '';
    selectedDivision.city = '';
    selectedDivision.district = '';
  }
};

// 行政区划创建成功
const handleDivisionCreate = (division) => {
  ElMessage.success(`行政区划 "${division.name}" 创建成功`);
  // 级联选择器会自动刷新数据并选中新创建的区划
};

// 地址解析
const handleAddressParse = (parsedAddress) => {
  logger.debug('地址解析结果:', parsedAddress);
  // 可以在这里处理解析结果，例如自动填充坐标等
};

// 重置表单
const resetForm = () => {
  form.id = null;
  form.warehouseCode = '';
  form.warehouseName = '';
  form.warehouseType = 1;
  form.status = 1;
  form.provinceId = null;
  form.cityId = null;
  form.districtId = null;
  form.divisionIds = []; // 重置级联选择器
  form.detailAddress = '';
  form.longitude = null;
  form.latitude = null;
  form.contactPerson = '';
  form.contactPhone = '';
  form.areaSize = null;
  form.capacity = null;

  // 重置行政区划数据
  selectedDivision.province = '';
  selectedDivision.city = '';
  selectedDivision.district = '';

  cityOptions.value = [];
  districtOptions.value = [];
  formRef.value?.resetFields();
};

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitLoading.value = true;
  try {
    const api = isEdit.value ? updateWarehouse : addWarehouse;
    const res = await api(form.id, form);

    if (res.code === 200 || res.success) {
      dialogVisible.value = false;
      loadData();

      if (isEdit.value) {
        ElMessage.success('更新成功');
      } else {
        // 保存创建的仓库信息到上下文
        const newWarehouse = {
          id: res.data?.id,
          warehouseName: form.warehouseName,
          warehouseCode: form.warehouseCode,
          provinceId: form.provinceId,
          cityId: form.cityId,
          districtId: form.districtId,
        };
        setWarehouseContext(newWarehouse);
        lastCreatedWarehouse.value = newWarehouse;

        // 配置快捷操作
        quickActions.value = [
          {
            key: 'createZone',
            label: '创建功能区',
            icon: 'Grid',
            type: 'primary',
            route: '/warehouse/zone',
            query: { warehouseId: newWarehouse.id },
            sourceId: newWarehouse.id,
          },
          {
            key: 'batchCreateBin',
            label: '批量生成货位',
            icon: 'Box',
            type: 'success',
            route: '/warehouse/bin',
            query: { warehouseId: newWarehouse.id, mode: 'batch' },
            sourceId: newWarehouse.id,
          },
          {
            key: 'mapLocation',
            label: '在地图定位',
            icon: 'MapLocation',
            type: 'info',
            route: '/warehouse/map',
            query: { warehouseId: newWarehouse.id, focus: 'true' },
            sourceId: newWarehouse.id,
          },
          {
            key: 'createAnother',
            label: '继续创建仓库',
            icon: 'Plus',
            type: 'default',
            plain: true,
            handler: () => {
              handleAdd();
            },
          },
        ];

        // 检查用户是否禁用了快捷操作链
        const isQuickActionDisabled = localStorage.getItem('quick_action_disabled_warehouse') === 'true';
        if (!isQuickActionDisabled) {
          // 显示快捷操作链
          quickActionVisible.value = true;
        } else {
          logger.debug('快捷操作链已被用户禁用，跳过显示');
        }
      }
    } else {
      ElMessage.error(res.message || (isEdit.value ? '更新失败' : '创建失败'));
    }
  } catch (error) {
    logger.error('提交失败', error);
    ElMessage.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 处理快捷操作
const handleQuickAction = (action) => {
  logger.debug('执行快捷操作:', action);

  // 根据操作类型执行不同的逻辑
  switch (action.key) {
    case 'createZone':
      // 设置上下文
      if (lastCreatedWarehouse.value) {
        setWarehouseContext(lastCreatedWarehouse.value);
      }
      break;
    case 'batchCreateBin':
      // 设置上下文
      if (lastCreatedWarehouse.value) {
        setWarehouseContext(lastCreatedWarehouse.value);
      }
      break;
    case 'createAnother':
      // 继续创建仓库，保持当前行政区划选择
      quickActionVisible.value = false;
      handleAdd();
  }

  // 路由跳转操作由 QuickActionChain 组件内部处理
};

// 处理快捷操作关闭
const handleQuickActionClose = () => {
  quickActionVisible.value = false;
  lastCreatedWarehouse.value = null;
};

// 处理快捷操作返回
const handleQuickActionBack = () => {
  quickActionVisible.value = false;
  lastCreatedWarehouse.value = null;
  // 刷新数据以显示新创建的仓库
  loadData();
};

// 处理快捷操作被禁用
const handleQuickActionDisabled = () => {
  logger.debug('用户禁用了仓库快捷操作链');
  ElMessage.info('已记住您的选择，后续创建仓库将不再显示快捷操作');
};

// 处理仓库初始化向导完成
const handleWizardComplete = (result) => {
  logger.debug('仓库初始化完成:', result);
  ElMessage.success(`仓库初始化成功！创建了 ${result.zoneCount} 个功能区，${result.binCount} 个货位`);
  loadData();
};

// 导入
const handleImport = () => {
  ElMessage.info('导入功能开发中...');
};

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...');
};

// 监听省份变化（筛选）
watch(
  () => searchForm.provinceId,
  (provinceId) => {
    searchForm.cityId = null;
    filterFields[1].disabled = !provinceId;
    if (provinceId) {
      loadCities(provinceId).then(() => {
        filterFields[1].options = cityOptions.value.map((c) => ({
          label: c.name,
          value: c.id,
        }));
      });
    } else {
      filterFields[1].options = [];
    }
  }
);

// 初始化
onMounted(() => {
  loadData();
  loadProvinces();
});
</script>

<style scoped>
.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 15px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.total {
  background-color: #ecf5ff;
  color: #409eff;
}

.stat-icon.active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-icon.area {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.capacity {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.warehouse-list-card {
  margin-top: 20px;
}

.warehouse-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.warehouse-item {
  transition: all 0.3s;
}

.warehouse-item.is-inactive {
  opacity: 0.7;
}

.warehouse-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.warehouse-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.warehouse-icon {
  width: 40px;
  height: 40px;
  background-color: #ecf5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  color: #409eff;
}

.warehouse-title {
  flex: 1;
}

.warehouse-title h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.warehouse-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-item .el-icon {
  margin-right: 8px;
  color: #909399;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
  margin-right: 5px;
  min-width: 50px;
}

.info-item .value {
  color: #606266;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warehouse-stats {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-item .stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.warehouse-capacity {
  margin-bottom: 15px;
}

.capacity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.capacity-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.warehouse-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.address-info {
  padding: 10px 0;
}

.location-info {
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.location-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.location-detail span {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.location-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  color: #909399;
}

:deep(.el-descriptions__label) {
  width: 100px;
}
</style>
