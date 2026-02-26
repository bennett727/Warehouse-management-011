<template>
  <PageLayout
    title="功能区管理"
    description="管理仓库内部的功能分区，如收货区、存储区、拣货区等"
    data-cy="warehouse-zone-page"
  >
    <template #headerActions>
      <el-button data-cy="warehouse-zone-add-btn" type="primary" :icon="Plus" @click="handleAdd">
        添加功能区
      </el-button>
    </template>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount || 0 }}</div>
              <div class="stat-label">总功能区</div>
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
              <div class="stat-value">{{ stats.activeCount || 0 }}</div>
              <div class="stat-label">启用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon inactive">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inactiveCount || 0 }}</div>
              <div class="stat-label">停用</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <UnifiedFilterBar
        v-model:filters="filters"
        v-model:search-keyword="searchKeyword"
        :filter-configs="filterConfigs"
        search-placeholder="搜索功能区名称或编码"
        @search="handleSearch"
        @reset="handleReset"
      />
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="zoneList" stripe border @sort-change="handleSortChange" data-cy="zone-table">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="编码" width="120" sortable />
        <el-table-column prop="name" label="名称" min-width="150" sortable />
        <el-table-column prop="zoneTypeName" label="类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.zoneTypeName" :type="getZoneTypeTagType(row.zoneTypeCode)">
              {{ row.zoneTypeName }}
            </el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseId" label="所属仓库" width="150">
          <template #default="{ row }">
            {{ getWarehouseName(row.warehouseId) }}
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.capacity">{{ row.capacity }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="usedCapacity" label="已使用" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.usedCapacity">{{ row.usedCapacity }}</span>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column prop="usageRate" label="使用率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              v-if="row.capacity"
              :percentage="Math.round(row.usageRate || 0)"
              :status="getUsageStatus(row.usageRate)"
              :stroke-width="8"
            />
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" sortable />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)" data-cy="warehouse-zone-edit-btn">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)" data-cy="warehouse-zone-delete-btn">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          data-cy="warehouse-zone-pagination"
        />
      </div>
    </el-card>

    <!-- 快捷操作链 -->
    <QuickActionChain
      v-model="quickActionVisible"
      title="功能区创建成功"
      :message="quickActionMessage"
      :actions="quickActions"
      storage-key="zone"
      @action="handleQuickAction"
      @close="handleQuickActionClose"
      @back="handleQuickActionBack"
      @disable="handleQuickActionDisabled"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑功能区' : '添加功能区'" width="600px" destroy-on-close data-cy="warehouse-zone-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" data-cy="warehouse-zone-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入编码" :disabled="isEdit" data-cy="warehouse-zone-code-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" data-cy="warehouse-zone-name-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属仓库" prop="warehouseId">
              <el-select v-model="form.warehouseId" placeholder="选择仓库" style="width: 100%" data-cy="warehouse-zone-warehouse-select">
                <el-option
                  v-for="warehouse in warehouseList"
                  :key="warehouse.warehouseId"
                  :label="warehouse.name"
                  :value="warehouse.warehouseId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="功能区类型" prop="zoneTypeId">
              <el-select v-model="form.zoneTypeId" placeholder="选择类型" style="width: 100%" data-cy="warehouse-zone-type-select">
                <el-option v-for="type in zoneTypeList" :key="type.id" :label="type.name" :value="type.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number v-model="form.capacity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序号" prop="sort">
              <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" data-cy="warehouse-zone-remark-input" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="warehouse-zone-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading" data-cy="warehouse-zone-submit-btn">确定</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { CircleCheck, CircleClose, Delete, Edit, Grid, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getWarehouseList } from '@/api/inventory/warehouse';
import {
  createWarehouseZone,
  deleteWarehouseZone,
  getWarehouseZoneList,
  getWarehouseZoneStats,
  updateWarehouseZone,
  updateWarehouseZoneStatus,
} from '@/api/warehouse/zone';
import { getActiveZoneTypes } from '@/api/warehouse/zoneType';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import QuickActionChain from '@/components/business/workflow/QuickActionChain.vue';
import { createLogger } from '@/utils/logger';
import { getZoneDefaults, setZoneContext } from '@/utils/workflowContext';

const logger = createLogger('ZoneManagement');
const router = useRouter();

// 加载状态
const loading = ref(false);
const submitLoading = ref(false);

// 快捷操作链
const quickActionVisible = ref(false);
const quickActions = ref([]);
const lastCreatedZone = ref(null);

// 快捷操作消息
const quickActionMessage = computed(() => {
  const name = lastCreatedZone.value?.name || '新功能区';
  return `功能区 "${name}" 创建成功！`;
});

// 搜索表单
const searchKeyword = ref('');
const filters = reactive({
  warehouseId: null,
  zoneTypeId: null,
  status: null,
});

// 筛选配置
const filterConfigs = [
  {
    type: 'select',
    key: 'warehouseId',
    label: '所属仓库',
    options: [],
    placeholder: '选择仓库',
  },
  {
    type: 'select',
    key: 'zoneTypeId',
    label: '功能区类型',
    options: [],
    placeholder: '选择类型',
  },
  {
    type: 'select',
    key: 'status',
    label: '状态',
    options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ],
    placeholder: '选择状态',
  },
];

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

// 统计数据
const stats = reactive({
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
});

// 数据列表
const zoneList = ref([]);
const zoneTypeList = ref([]);
const warehouseList = ref([]);

// 对话框
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const form = reactive({
  id: null,
  code: '',
  name: '',
  warehouseId: null,
  zoneTypeId: null,
  capacity: null,
  sort: 0,
  remark: '',
  status: 1,
});

// 表单验证规则
const rules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '请选择所属仓库', trigger: 'change' }],
};

// 获取使用率状态
const getUsageStatus = (rate) => {
  if (!rate) {
    return '';
  }
  if (rate >= 90) {
    return 'exception';
  }
  if (rate >= 70) {
    return 'warning';
  }
  return 'success';
};

// 获取类型标签样式
const getZoneTypeTagType = (code) => {
  const typeMap = {
    RECEIVING: 'success',
    STORAGE: 'primary',
    PICKING: 'warning',
    SHIPPING: 'danger',
    QC: 'info',
  };
  return typeMap[code] || '';
};

// 获取仓库名称
const getWarehouseName = (warehouseId) => {
  const warehouse = warehouseList.value.find((w) => w.warehouseId === warehouseId);
  return warehouse ? warehouse.name : '-';
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.size,
      keyword: searchKeyword.value || undefined,
      warehouseId: filters.warehouseId || undefined,
      zoneTypeId: filters.zoneTypeId || undefined,
      status: filters.status !== null ? filters.status : undefined,
    };

    const res = await getWarehouseZoneList(params);
    if (res.success) {
      zoneList.value = res.data.content || [];
      pagination.total = res.data.totalElements || 0;
    }
  } catch (error) {
    logger.error('加载功能区列表失败', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getWarehouseZoneStats();
    if (res.success) {
      Object.assign(stats, res.data);
    }
  } catch (error) {
    logger.error('加载统计数据失败', error);
  }
};

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    const res = await getWarehouseList({ page: 0, size: 100 });
    if (res.success) {
      warehouseList.value = res.data.content || [];
      // 更新筛选配置中的仓库选项
      const warehouseFilter = filterConfigs.find((f) => f.key === 'warehouseId');
      if (warehouseFilter) {
        warehouseFilter.options = warehouseList.value.map((w) => ({
          label: w.name,
          value: w.warehouseId,
        }));
      }
    }
  } catch (error) {
    logger.error('加载仓库列表失败', error);
  }
};

// 加载功能区类型
const loadZoneTypes = async () => {
  try {
    const res = await getActiveZoneTypes();
    if (res.success) {
      zoneTypeList.value = res.data || [];
      // 更新筛选配置中的类型选项
      const typeFilter = filterConfigs.find((f) => f.key === 'zoneTypeId');
      if (typeFilter) {
        typeFilter.options = zoneTypeList.value.map((t) => ({
          label: t.name,
          value: t.id,
        }));
      }
    }
  } catch (error) {
    logger.error('加载功能区类型失败', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchKeyword.value = '';
  filters.warehouseId = null;
  filters.zoneTypeId = null;
  filters.status = null;
  pagination.page = 1;
  loadData();
};

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size;
  loadData();
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadData();
};

// 排序变化
const handleSortChange = ({ prop: _prop, order: _order }) => {
  loadData();
};

// 状态变化
const handleStatusChange = async (row, status) => {
  try {
    await updateWarehouseZoneStatus(row.id, status);
    ElMessage.success('状态更新成功');
    loadStats();
  } catch (error) {
    logger.error('更新状态失败', error);
    ElMessage.error('更新状态失败');
    row.status = status === 1 ? 0 : 1;
  }
};

// 添加
const handleAdd = () => {
  isEdit.value = false;
  resetForm();

  // 应用智能默认值
  const defaults = getZoneDefaults();
  logger.debug('应用智能默认值:', defaults);

  if (defaults.warehouseId) {
    form.warehouseId = defaults.warehouseId;
  }

  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除功能区 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteWarehouseZone(row.id);
        ElMessage.success('删除成功');
        loadData();
        loadStats();
      } catch (error) {
        logger.error('删除失败', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateWarehouseZone(form.id, form);
      ElMessage.success('更新成功');
      dialogVisible.value = false;
      loadData();
      loadStats();
    } else {
      const res = await createWarehouseZone(form);
      ElMessage.success('创建成功');

      // 保存创建的功能区信息
      const newZone = {
        id: res.data?.id,
        name: form.name,
        code: form.code,
        warehouseId: form.warehouseId,
        zoneTypeId: form.zoneTypeId,
      };
      lastCreatedZone.value = newZone;
      setZoneContext(newZone);

      // 配置快捷操作
      quickActions.value = [
        {
          key: 'createBin',
          label: '批量生成货位',
          icon: 'Box',
          type: 'primary',
          route: '/warehouse/bin',
          query: { zoneId: newZone.id, mode: 'batch' },
          sourceId: newZone.id,
        },
        {
          key: 'createAnother',
          label: '继续创建功能区',
          icon: 'Plus',
          type: 'success',
          handler: () => {
            resetForm();
            // 保留仓库选择
            form.warehouseId = newZone.warehouseId;
            dialogVisible.value = true;
          },
        },
        {
          key: 'viewWarehouse',
          label: '查看仓库详情',
          icon: 'View',
          type: 'info',
          route: '/warehouse/list',
          query: { focus: newZone.warehouseId },
        },
      ];

      dialogVisible.value = false;
      loadData();
      loadStats();

      // 检查用户是否禁用了快捷操作链
      const isQuickActionDisabled = localStorage.getItem('quick_action_disabled_zone') === 'true';
      if (!isQuickActionDisabled) {
        quickActionVisible.value = true;
      } else {
        logger.debug('快捷操作链已被用户禁用，跳过显示');
      }
    }
  } catch (error) {
    logger.error('提交失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  form.id = null;
  form.code = '';
  form.name = '';
  form.warehouseId = null;
  form.zoneTypeId = null;
  form.capacity = null;
  form.sort = 0;
  form.remark = '';
  form.status = 1;
};

// 快捷操作处理
const handleQuickAction = (action) => {
  logger.debug('执行快捷操作:', action);

  if (action.handler) {
    action.handler();
  } else if (action.route) {
    router.push({
      path: action.route,
      query: action.query,
    });
  }

  quickActionVisible.value = false;
};

// 快捷操作关闭
const handleQuickActionClose = () => {
  logger.debug('关闭快捷操作链');
  quickActionVisible.value = false;
};

// 快捷操作返回
const handleQuickActionBack = () => {
  logger.debug('返回列表');
  quickActionVisible.value = false;
};

// 处理快捷操作被禁用
const handleQuickActionDisabled = () => {
  logger.debug('用户禁用了功能区快捷操作链');
  ElMessage.info('已记住您的选择，后续创建功能区将不再显示快捷操作');
};

// 初始化
onMounted(() => {
  loadData();
  loadStats();
  loadWarehouses();
  loadZoneTypes();
});
</script>

<style scoped>
.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.stat-icon.total {
  background-color: #ecf5ff;
  color: #409eff;
}

.stat-icon.active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-icon.inactive {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-icon .el-icon {
  font-size: 24px;
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
  margin-top: 4px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.text-gray {
  color: #909399;
}
</style>
