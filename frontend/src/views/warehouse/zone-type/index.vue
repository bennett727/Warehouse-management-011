<template>
  <PageLayout title="功能区类型管理" description="管理仓库功能区的类型定义，支持自定义类型" data-cy="zone-type-page">
    <template #headerActions>
      <el-button data-cy="zone-type-add-btn" type="primary" :icon="Plus" @click="handleAdd"> 添加类型 </el-button>
      <el-button data-cy="zone-type-init-btn" :icon="Refresh" @click="handleInitialize"> 初始化系统类型 </el-button>
    </template>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount || 0 }}</div>
              <div class="stat-label">总类型数</div>
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
              <div class="stat-label">启用类型</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon system">
              <el-icon><SetUp /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.systemCount || 0 }}</div>
              <div class="stat-label">系统预设</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon custom">
              <el-icon><EditPen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.customCount || 0 }}</div>
              <div class="stat-label">自定义类型</div>
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
      header-title="类型筛选"
      :header-icon="Filter"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 类型列表 -->
    <el-card class="zone-type-list-card" shadow="never" data-cy="zone-type-list-card">
      <el-table v-loading="loading" :data="zoneTypeList" stripe border style="width: 100%" data-cy="zone-type-table">
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column label="类型信息" min-width="200">
          <template #default="{ row }">
            <div class="type-info">
              <div class="type-icon" :style="{ backgroundColor: row.color || '#409EFF' }">
                <el-icon><component :is="row.icon || 'Box'" /></el-icon>
              </div>
              <div class="type-detail">
                <div class="type-name">
                  {{ row.name }}
                  <el-tag v-if="row.isSystem" type="info" size="small">系统</el-tag>
                  <el-tag v-else type="success" size="small">自定义</el-tag>
                </div>
                <div class="type-code">{{ row.code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

        <el-table-column label="排序" width="80" align="center">
          <template #default="{ row }">
            <span>{{ row.sort }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val)"
              :disabled="row.isSystem"
            />
          </template>
        </el-table-column>

        <el-table-column label="使用统计" width="120" align="center">
          <template #default="{ row }">
            <el-tooltip content="使用数量" placement="top">
              <el-tag :type="row.usageCount > 0 ? 'warning' : 'info'"> {{ row.usageCount || 0 }} 个功能区 </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)" data-cy="zone-type-edit-btn"> 编辑 </el-button>
            <el-button
              type="danger"
              link
              :icon="Delete"
              @click="handleDelete(row)"
              :disabled="row.isSystem || row.usageCount > 0"
              data-cy="zone-type-delete-btn"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!loading && zoneTypeList.length === 0" description="暂无功能区类型数据" />

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
          data-cy="zone-type-pagination"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      data-cy="zone-type-dialog"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form data-cy="zone-type-form" ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型编码" prop="code">
              <el-input
                v-model="form.code"
                placeholder="请输入类型编码"
                clearable
                :disabled="isEdit && form.isSystem"
                data-cy="zone-type-code-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入类型名称" clearable data-cy="zone-type-name-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入类型描述" data-cy="zone-type-description-input" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-select v-model="form.icon" placeholder="选择图标" style="width: 100%" data-cy="zone-type-icon-select">
                <el-option v-for="icon in iconOptions" :key="icon.value" :label="icon.label" :value="icon.value">
                  <div class="icon-option">
                    <el-icon><component :is="icon.value" /></el-icon>
                    <span>{{ icon.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="color">
              <el-color-picker v-model="form.color" show-alpha />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序号" prop="sort">
              <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="zone-type-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading" data-cy="zone-type-submit-btn">确定</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Plus, Edit, Delete, Filter, CircleCheck, Collection, SetUp, EditPen, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';

import {
  getZoneTypeList,
  createZoneType,
  updateZoneType,
  deleteZoneType,
  updateZoneTypeStatus,
  getZoneTypeStats,
  initializeZoneTypes,
} from '@/api/warehouse/zoneType';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ZoneTypeManagement');

// 加载状态
const loading = ref(false);
const submitLoading = ref(false);

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: null,
  isSystem: null,
});

// 筛选字段配置
const filterFields = [
  {
    type: 'select',
    label: '类型来源',
    prop: 'isSystem',
    options: [
      { label: '全部', value: null },
      { label: '系统预设', value: true },
      { label: '自定义', value: false },
    ],
    clearable: true,
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

// 图标选项
const iconOptions = [
  { label: '盒子', value: 'Box' },
  { label: '房屋', value: 'House' },
  { label: '指针', value: 'Pointer' },
  { label: '促销', value: 'Promotion' },
  { label: '刷新左', value: 'RefreshLeft' },
  { label: '勾选', value: 'CircleCheck' },
  { label: '工具', value: 'Tools' },
  { label: '计时器', value: 'Timer' },
  { label: '仓库', value: 'OfficeBuilding' },
  { label: '网格', value: 'Grid' },
  { label: '文档', value: 'Document' },
  { label: '设置', value: 'Setting' },
];

// 数据
const zoneTypeList = ref([]);
const stats = ref({});
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 对话框
const dialogVisible = ref(false);
const dialogTitle = ref('添加类型');
const isEdit = ref(false);
const formRef = ref(null);

// 表单
const form = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  icon: 'Box',
  color: '#409EFF',
  sort: 0,
  status: 1,
  isSystem: false,
});

// 表单校验规则
const rules = {
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '编码只能包含大写字母和下划线', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const [listRes, statsRes] = await Promise.all([
      getZoneTypeList({
        page: pagination.page - 1,
        size: pagination.pageSize,
        keyword: searchForm.keyword,
        status: searchForm.status,
        isSystem: searchForm.isSystem,
      }),
      getZoneTypeStats(),
    ]);

    if (listRes.code === 200 || listRes.success) {
      zoneTypeList.value = listRes.data?.content || listRes.data?.list || [];
      pagination.total = listRes.data?.totalElements || listRes.data?.total || 0;
    }

    if (statsRes.code === 200 || statsRes.success) {
      stats.value = statsRes.data || {};
    }
  } catch (error) {
    logger.error('加载数据失败', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
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
  searchForm.status = null;
  searchForm.isSystem = null;
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

// 添加
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = '添加功能区类型';
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  isEdit.value = true;
  dialogTitle.value = '编辑功能区类型';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  if (row.isSystem) {
    ElMessage.warning('系统预设类型不能删除');
    return;
  }
  if (row.usageCount > 0) {
    ElMessage.warning('该类型正在使用，不能删除');
    return;
  }

  ElMessageBox.confirm(`确定要删除功能区类型 "${row.name}" 吗？\n删除后无法恢复，请谨慎操作。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteZoneType(row.id);
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

// 状态变更
const handleStatusChange = async (row, status) => {
  if (row.isSystem) {
    ElMessage.warning('系统预设类型不能修改状态');
    row.status = status === 1 ? 0 : 1; // 恢复原状态
    return;
  }

  try {
    const res = await updateZoneTypeStatus(row.id, status);
    if (res.code === 200 || res.success) {
      ElMessage.success(status === 1 ? '已启用' : '已停用');
    } else {
      ElMessage.error(res.message || '操作失败');
      row.status = status === 1 ? 0 : 1; // 恢复原状态
    }
  } catch (error) {
    logger.error('状态更新失败', error);
    ElMessage.error('操作失败');
    row.status = status === 1 ? 0 : 1;
  }
};

// 初始化系统类型
const handleInitialize = () => {
  ElMessageBox.confirm(
    '确定要初始化系统预设功能区类型吗？\n这将创建8种常用的功能区类型（收货区、存储区、拣货区等）。',
    '确认初始化',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      try {
        const res = await initializeZoneTypes();
        if (res.code === 200 || res.success) {
          ElMessage.success('系统预设类型初始化成功');
          loadData();
        } else {
          ElMessage.error(res.message || '初始化失败');
        }
      } catch (error) {
        logger.error('初始化失败', error);
        ElMessage.error('初始化失败');
      }
    })
    .catch(() => {});
};

// 重置表单
const resetForm = () => {
  form.id = null;
  form.code = '';
  form.name = '';
  form.description = '';
  form.icon = 'Box';
  form.color = '#409EFF';
  form.sort = 0;
  form.status = 1;
  form.isSystem = false;
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
    const api = isEdit.value ? updateZoneType : createZoneType;
    const res = await api(isEdit.value ? form.id : undefined, form);

    if (res.code === 200 || res.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
      dialogVisible.value = false;
      loadData();
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

// 初始化
onMounted(() => {
  loadData();
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

.stat-icon.system {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.custom {
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

.zone-type-list-card {
  margin-top: 20px;
}

.type-info {
  display: flex;
  align-items: center;
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  color: #fff;
}

.type-detail {
  flex: 1;
}

.type-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.type-code {
  font-size: 12px;
  color: #909399;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
