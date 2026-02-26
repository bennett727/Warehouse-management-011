<template>
  <PageLayout title="区域管理" description="管理仓库区域信息及库存统计" data-cy="area-management-page">
    <template #headerActions>
      <el-button data-cy="area-add-btn" type="primary" :icon="Plus" @click="handleAddArea" :loading="addAreaLoading">
        添加区域
      </el-button>
      <el-button data-cy="area-import-btn" :icon="Upload" @click="handleImport"> 导入 </el-button>
      <el-button data-cy="area-export-btn" :icon="Download" @click="handleExport"> 导出 </el-button>
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="区域筛选"
      :header-icon="Location"
      :result-count="areaCount"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="tree-card" shadow="never" data-cy="area-tree-card">
      <div class="area-content">
        <div class="area-tree-section">
          <div class="section-header">
            <el-icon><OfficeBuilding /></el-icon>
            <span>区域列表</span>
            <el-tag type="info" size="small" class="count-tag">{{ areaCount }}个</el-tag>
          </div>
          <el-tree
            data-cy="area-tree"
            ref="areaTreeRef"
            :data="areaTreeData"
            :props="treeProps"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            default-expand-all
            node-key="id"
            empty-text="暂无数据"
            highlight-current
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node-content" :class="{ 'is-selected': selectedArea?.id === data.id }">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-actions">
                  <el-button
                    data-cy="area-tree-edit-btn"
                    link
                    size="small"
                    type="primary"
                    @click.stop="handleEditArea(data)"
                    :loading="editAreaLoadingMap.get(data.id)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    data-cy="area-tree-delete-btn"
                    link
                    size="small"
                    type="danger"
                    @click.stop="handleDeleteArea(data)"
                    :loading="deleteAreaLoadingMap.get(data.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </div>

        <div class="area-details-section">
          <div class="section-header">
            <el-icon><InfoFilled /></el-icon>
            <span>区域详情</span>
          </div>

          <el-empty data-cy="area-empty-state" v-if="!selectedArea" description="请从左侧选择一个区域查看详情" />

          <div v-else class="area-info-container">
            <!-- 基本信息 -->
            <el-descriptions data-cy="area-descriptions" :column="2" border title="基本信息">
              <el-descriptions-item label="区域名称">{{ selectedArea.name }}</el-descriptions-item>
              <el-descriptions-item label="区域编码">{{ selectedArea.code }}</el-descriptions-item>
              <el-descriptions-item label="省份">{{ selectedArea.province || '-' }}</el-descriptions-item>
              <el-descriptions-item label="城市">{{ selectedArea.city || '-' }}</el-descriptions-item>
              <el-descriptions-item label="区县">{{ selectedArea.district || '-' }}</el-descriptions-item>
              <el-descriptions-item label="区域状态">
                <el-tag :type="selectedArea.status === 1 ? 'success' : 'info'">
                  {{ selectedArea.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDate(selectedArea.createTime) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDate(selectedArea.updateTime) }}</el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ selectedArea.remark || '-' }}</el-descriptions-item>
            </el-descriptions>

            <!-- 库存统计信息 -->
            <el-descriptions v-if="areaStatistics" :column="3" border title="库存统计" class="statistics-section">
              <el-descriptions-item label="货位总数">
                <el-tag type="primary" size="large">{{ areaStatistics.binCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="已使用货位">
                <el-tag type="warning" size="large">{{ areaStatistics.usedBinCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="空闲货位">
                <el-tag type="success" size="large">{{ areaStatistics.availableBinCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="设备数量" :span="3">
                <el-tag type="info" size="large">{{ areaStatistics.deviceCount || 0 }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 加载状态 -->
            <div v-if="statisticsLoading" class="statistics-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在加载统计信息...</span>
            </div>

            <!-- 快捷操作 -->
            <div class="quick-actions">
              <el-button type="primary" @click="handleEditArea(selectedArea)" data-cy="area-edit-btn">
                <el-icon><Edit /></el-icon>编辑区域
              </el-button>
              <el-button type="danger" plain @click="handleDeleteArea(selectedArea)" data-cy="area-delete-btn">
                <el-icon><Delete /></el-icon>删除区域
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      data-cy="area-dialog"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form data-cy="area-form" ref="areaFormRef" :model="areaForm" :rules="areaRules" label-width="100px">
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="areaForm.name" placeholder="请输入区域名称" clearable data-cy="area-name-input" />
        </el-form-item>
        <el-form-item label="区域编码" prop="code">
          <el-input v-model="areaForm.code" placeholder="请输入区域编码" clearable data-cy="area-code-input" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="areaForm.warehouseId" placeholder="请选择所属仓库" clearable style="width: 100%" data-cy="area-warehouse-select">
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="areaForm.province" placeholder="请输入省份" clearable data-cy="area-province-input" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="areaForm.city" placeholder="请输入城市" clearable data-cy="area-city-input" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="areaForm.district" placeholder="请输入区县" clearable data-cy="area-district-input" />
        </el-form-item>
        <el-form-item label="区域状态" prop="status">
          <el-radio-group v-model="areaForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="areaForm.remark" type="textarea" placeholder="请输入备注信息" :rows="3" resize="none" data-cy="area-remark-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="area-dialog-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="submitLoading" data-cy="area-dialog-confirm-btn">确定</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import {
  Delete,
  Download,
  Edit,
  InfoFilled,
  Loading,
  Location,
  OfficeBuilding,
  Plus,
  Upload,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getWarehouseList } from '@/api/inventory/warehouse';
import {
  checkAreaCodeExists,
  checkAreaNameExists,
  createArea,
  deleteArea,
  exportAreas,
  getAreaList,
  getAreaStatistics,
  importAreas,
  updateArea,
} from '@/api/system/area';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const _logger = createLogger('AreaManagement');

// 搜索表单
const searchForm = reactive({
  keyword: '',
  warehouseId: '',
});

// 加载状态
const loading = ref(false);
const submitLoading = ref(false);
const addAreaLoading = ref(false);

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'keyword',
    label: '区域名称',
    type: 'input',
    placeholder: '请输入区域名称',
    clearable: true,
    md: 8,
    lg: 6,
  },
  {
    prop: 'warehouseId',
    label: '所属仓库',
    type: 'select',
    placeholder: '请选择仓库',
    clearable: true,
    md: 8,
    lg: 6,
    options: warehouseList.value.map((w) => ({ label: w.name, value: w.id })),
  },
]);

// 数据列表
const areaList = ref([]);
const areaCount = computed(() => areaList.value.length);
const warehouseList = ref([]);

// 树形结构
const areaTreeRef = ref(null);
const treeProps = {
  children: 'children',
  label: 'name',
};

const areaTreeData = computed(() => buildTree(areaList.value));

// 构建树形结构
const buildTree = (list) => {
  // 确保list是数组
  if (!Array.isArray(list)) {
    return [];
  }

  const map = {};
  const roots = [];

  list.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  list.forEach((item) => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
};

// 选中区域
const selectedArea = ref(null);
const areaStatistics = ref(null);
const statisticsLoading = ref(false);

// 表单对话框
const dialogVisible = ref(false);
const dialogTitle = ref('添加区域');
const isEdit = ref(false);
const areaFormRef = ref(null);
const editAreaLoadingMap = ref(new Map());
const deleteAreaLoadingMap = ref(new Map());

const areaForm = reactive({
  id: null,
  name: '',
  code: '',
  warehouseId: '',
  province: '',
  city: '',
  district: '',
  status: 1,
  remark: '',
});

const areaRules = {
  name: [
    { required: true, message: '请输入区域名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入区域编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  warehouseId: [{ required: true, message: '请选择所属仓库', trigger: 'change' }],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
};

// 加载数据
const loadAreaList = async () => {
  loading.value = true;
  try {
    const params = {
      page: 1,
      size: 1000,
      ...searchForm,
    };
    const response = await getAreaList(params);
    if (response.code === 200 || response.success) {
      areaList.value = response.data?.records || response.data || [];
    }
  } catch (error) {
    _logger.error('加载区域列表失败:', error);
    ElMessage.error('加载区域列表失败');
  } finally {
    loading.value = false;
  }
};

const loadWarehouseList = async () => {
  try {
    const response = await getWarehouseList({ page: 1, size: 1000 });
    if (response.code === 200 || response.success) {
      warehouseList.value = response.data?.records || response.data || [];
    }
  } catch (error) {
    _logger.error('加载仓库列表失败:', error);
  }
};

const loadAreaStatistics = async (areaId) => {
  if (!areaId) {
    return;
  }
  statisticsLoading.value = true;
  try {
    const response = await getAreaStatistics(areaId);
    if (response.code === 200 || response.success) {
      areaStatistics.value = response.data;
    }
  } catch (error) {
    _logger.error('加载区域统计信息失败:', error);
  } finally {
    statisticsLoading.value = false;
  }
};

// 搜索和筛选
const handleSearch = () => {
  loadAreaList();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.warehouseId = '';
  loadAreaList();
};

const filterNode = (value, data) => {
  if (!value) {
    return true;
  }
  return data.name.includes(value);
};

// 节点选择
const handleNodeClick = async (data) => {
  selectedArea.value = data;
  await loadAreaStatistics(data.id);
};

// 添加区域
const handleAddArea = () => {
  isEdit.value = false;
  dialogTitle.value = '添加区域';
  resetForm();
  dialogVisible.value = true;
};

// 编辑区域
const handleEditArea = async (data) => {
  isEdit.value = true;
  dialogTitle.value = '编辑区域';
  editAreaLoadingMap.value.set(data.id, true);

  try {
    Object.assign(areaForm, {
      id: data.id,
      name: data.name,
      code: data.code,
      warehouseId: data.warehouseId,
      province: data.province || '',
      city: data.city || '',
      district: data.district || '',
      status: data.status,
      remark: data.remark || '',
    });
    dialogVisible.value = true;
  } catch (_error) {
    ElMessage.error('加载区域信息失败');
  } finally {
    editAreaLoadingMap.value.set(data.id, false);
  }
};

// 删除区域
const handleDeleteArea = async (data) => {
  try {
    await ElMessageBox.confirm(`确定要删除区域"${data.name}"吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    deleteAreaLoadingMap.value.set(data.id, true);
    const response = await deleteArea(data.id);

    if (response.code === 200 || response.success) {
      ElMessage.success('删除成功');
      if (selectedArea.value?.id === data.id) {
        selectedArea.value = null;
        areaStatistics.value = null;
      }
      await loadAreaList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      _logger.error('删除区域失败:', error);
      ElMessage.error('删除失败');
    }
  } finally {
    deleteAreaLoadingMap.value.set(data.id, false);
  }
};

// 提交表单
const handleFormSubmit = async () => {
  if (!areaFormRef.value) {
    return;
  }

  submitLoading.value = true;
  try {
    await areaFormRef.value.validate();

    // 检查名称是否重复
    const nameResponse = await checkAreaNameExists(areaForm.name, areaForm.id);
    if (nameResponse.code === 200 && nameResponse.data) {
      ElMessage.error('区域名称已存在');
      submitLoading.value = false;
      return;
    }

    // 检查编码是否重复
    const codeResponse = await checkAreaCodeExists(areaForm.code, areaForm.id);
    if (codeResponse.code === 200 && codeResponse.data) {
      ElMessage.error('区域编码已存在');
      submitLoading.value = false;
      return;
    }

    const formData = { ...areaForm };
    let response;

    if (isEdit.value) {
      response = await updateArea(formData.id, formData);
    } else {
      response = await createArea(formData);
    }

    if (response.code === 200 || response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
      dialogVisible.value = false;
      resetForm();
      await loadAreaList();

      // 如果编辑的是当前选中的区域，刷新统计
      if (isEdit.value && selectedArea.value?.id === formData.id) {
        await loadAreaStatistics(formData.id);
      }
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error !== false) {
      _logger.error('提交表单失败:', error);
      ElMessage.error('操作失败');
    }
  } finally {
    submitLoading.value = false;
  }
};

// 导入
const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await importAreas(formData);
      if (response.code === 200 || response.success) {
        ElMessage.success('导入成功');
        await loadAreaList();
      } else {
        ElMessage.error(response.message || '导入失败');
      }
    } catch (error) {
      _logger.error('导入失败:', error);
      ElMessage.error('导入失败');
    }
  };
  input.click();
};

// 导出
const handleExport = async () => {
  try {
    const response = await exportAreas();
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `areas_${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    ElMessage.success('导出成功');
  } catch (error) {
    _logger.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(areaForm, {
    id: null,
    name: '',
    code: '',
    warehouseId: '',
    province: '',
    city: '',
    district: '',
    status: 1,
    remark: '',
  });
  areaFormRef.value?.clearValidate();
};

// 格式化日期
const formatDate = (date) => {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 生命周期
onMounted(() => {
  loadAreaList();
  loadWarehouseList();
});
</script>

<style scoped>
.tree-card {
  margin-top: 16px;
}

.area-content {
  display: flex;
  gap: 24px;
  height: calc(100vh - 320px);
}

.area-tree-section,
.area-details-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  margin-bottom: 16px;
  font-weight: 600;
}

.count-tag {
  margin-left: auto;
}

:deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
}

.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.tree-node-content:hover,
.tree-node-content.is-selected {
  background: var(--el-color-primary-light-9);
}

.node-label {
  flex: 1;
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node-content:hover .node-actions {
  opacity: 1;
}

.area-info-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statistics-section {
  margin-top: 8px;
}

.statistics-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--el-text-color-secondary);
}

.quick-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  background: var(--el-fill-color-light);
}
</style>
