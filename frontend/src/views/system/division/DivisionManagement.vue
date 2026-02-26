<template>
  <PageLayout title="行政区划管理" description="管理省市区三级行政区划数据" data-cy="division-management-page">
    <template #headerActions>
      <el-button
        data-cy="division-add-btn"
        type="primary"
        :icon="Plus"
        @click="handleAddDivision"
        :loading="addLoading"
      >
        添加区划
      </el-button>
      <el-button data-cy="division-import-btn" :icon="Upload" @click="handleImport"> 导入 </el-button>
      <el-button data-cy="division-export-btn" :icon="Download" @click="handleExport"> 导出 </el-button>
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="区划筛选"
      :header-icon="MapLocation"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="tree-card" shadow="never" data-cy="division-tree-card">
      <div class="division-content">
        <div class="division-tree-section">
          <div class="section-header">
            <el-icon><MapLocation /></el-icon>
            <span>行政区划树</span>
            <el-tag type="info" size="small" class="count-tag">{{ divisionCount }}个</el-tag>
          </div>
          <el-tree
            data-cy="division-tree"
            ref="divisionTreeRef"
            :data="divisionTreeData"
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
              <div class="tree-node-content" :class="{ 'is-selected': selectedDivision?.id === data.id }">
                <span class="node-icon">
                  <el-icon v-if="data.level === 1"><OfficeBuilding /></el-icon>
                  <el-icon v-else-if="data.level === 2"><School /></el-icon>
                  <el-icon v-else><Location /></el-icon>
                </span>
                <span class="node-label">{{ node.label }}</span>
                <span class="node-code">{{ data.code }}</span>
                <span class="node-actions">
                  <el-button
                    data-cy="division-tree-add-btn"
                    link
                    size="small"
                    type="success"
                    v-if="data.level < 3"
                    @click.stop="handleAddChild(data)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button
                    data-cy="division-tree-edit-btn"
                    link
                    size="small"
                    type="primary"
                    @click.stop="handleEditDivision(data)"
                    :loading="editLoadingMap.get(data.id)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    data-cy="division-tree-delete-btn"
                    link
                    size="small"
                    type="danger"
                    @click.stop="handleDeleteDivision(data)"
                    :loading="deleteLoadingMap.get(data.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </div>

        <div class="division-details-section">
          <div class="section-header">
            <el-icon><InfoFilled /></el-icon>
            <span>区划详情</span>
          </div>

          <el-empty
            data-cy="division-empty-state"
            v-if="!selectedDivision"
            description="请从左侧选择一个行政区划查看详情"
          />
          <div v-else class="division-info-container">
            <!-- 基本信息 -->
            <el-descriptions data-cy="division-descriptions" :column="2" border title="基本信息">
              <el-descriptions-item label="区划名称">{{ selectedDivision.name }}</el-descriptions-item>
              <el-descriptions-item label="区划编码">{{ selectedDivision.code }}</el-descriptions-item>
              <el-descriptions-item label="区划级别">
                <el-tag :type="getLevelTagType(selectedDivision.level)">
                  {{ getLevelText(selectedDivision.level) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="父级区划">{{ selectedDivision.parentName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="排序">{{ selectedDivision.sort || 0 }}</el-descriptions-item>
              <el-descriptions-item label="区划状态">
                <el-tag :type="selectedDivision.status === 1 ? 'success' : 'info'">
                  {{ selectedDivision.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{
                formatDate(selectedDivision.createTime)
              }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{
                formatDate(selectedDivision.updateTime)
              }}</el-descriptions-item>
            </el-descriptions>

            <!-- 统计信息 -->
            <el-descriptions v-if="divisionStats" :column="2" border title="关联统计" class="statistics-section">
              <el-descriptions-item label="下级区划数">
                <el-tag type="primary">{{ divisionStats.childrenCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="关联仓库数">
                <el-tag type="warning">{{ divisionStats.warehouseCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="设备安装数">
                <el-tag type="success">{{ divisionStats.deviceCount || 0 }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 加载状态 -->
            <div v-if="statisticsLoading" class="statistics-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在加载统计信息...</span>
            </div>

            <!-- 快捷操作 -->
            <div class="quick-actions">
              <el-button v-if="selectedDivision.level < 3" type="success" @click="handleAddChild(selectedDivision)" data-cy="division-quick-add-btn">
                <el-icon><Plus /></el-icon>添加下级
              </el-button>
              <el-button type="primary" @click="handleEditDivision(selectedDivision)" data-cy="division-quick-edit-btn">
                <el-icon><Edit /></el-icon>编辑区划
              </el-button>
              <el-button type="danger" plain @click="handleDeleteDivision(selectedDivision)" data-cy="division-quick-delete-btn">
                <el-icon><Delete /></el-icon>删除区划
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      data-cy="division-dialog"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        data-cy="division-form"
        ref="divisionFormRef"
        :model="divisionForm"
        :rules="divisionRules"
        label-width="100px"
      >
        <el-form-item label="区划编码" prop="code">
          <el-input v-model="divisionForm.code" placeholder="请输入区划编码" clearable data-cy="division-code-input" />
        </el-form-item>
        <el-form-item label="区划名称" prop="name">
          <el-input v-model="divisionForm.name" placeholder="请输入区划名称" clearable data-cy="division-name-input" />
        </el-form-item>
        <el-form-item label="区划级别" prop="level">
          <el-radio-group v-model="divisionForm.level" :disabled="isEdit">
            <el-radio :label="1">省/直辖市</el-radio>
            <el-radio :label="2">市</el-radio>
            <el-radio :label="3">区/县</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父级区划" prop="parentId" v-if="divisionForm.level > 1">
          <el-cascader
            v-model="divisionForm.parentId"
            :options="parentOptions"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="请选择父级区划"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="divisionForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="区划状态" prop="status">
          <el-radio-group v-model="divisionForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="division-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="submitLoading" data-cy="division-submit-btn">确定</el-button>
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
  MapLocation,
  OfficeBuilding,
  Plus,
  School,
  Upload,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { SYSTEM_API } from '@/constants/apiConstants';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const _logger = createLogger('DivisionManagement');

// 搜索表单
const searchForm = reactive({
  keyword: '',
  level: '',
});

// 加载状态
const loading = ref(false);
const submitLoading = ref(false);
const addLoading = ref(false);
const statisticsLoading = ref(false);

// 筛选字段配置
const filterFields = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '请输入区划名称或编码',
    clearable: true,
    md: 8,
    lg: 6,
  },
  {
    prop: 'level',
    label: '区划级别',
    type: 'select',
    placeholder: '请选择级别',
    clearable: true,
    md: 8,
    lg: 6,
    options: [
      { label: '省/直辖市', value: 1 },
      { label: '市', value: 2 },
      { label: '区/县', value: 3 },
    ],
  },
];

// 数据列表
const divisionList = ref([]);
const divisionCount = computed(() => divisionList.value.length);

// 树形结构
const divisionTreeRef = ref(null);
const treeProps = {
  children: 'children',
  label: 'name',
};

const divisionTreeData = computed(() => buildTree(divisionList.value));

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

  // 按排序和名称排序
  const sortTree = (nodes) => {
    nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0) || a.name.localeCompare(b.name));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children);
      }
    });
    return nodes;
  };

  return sortTree(roots);
};

// 父级选项（用于级联选择）
const parentOptions = computed(() => {
  if (divisionForm.level === 2) {
    // 市级，父级只能是省级
    return divisionTreeData.value.filter((item) => item.level === 1);
  }
  if (divisionForm.level === 3) {
    // 区级，父级只能是市级
    const cities = [];
    divisionTreeData.value.forEach((province) => {
      if (province.children) {
        cities.push(...province.children.filter((item) => item.level === 2));
      }
    });
    return cities;
  }
  return [];
});

// 选中区划
const selectedDivision = ref(null);
const divisionStats = ref(null);

// 表单对话框
const dialogVisible = ref(false);
const dialogTitle = ref('添加区划');
const isEdit = ref(false);
const divisionFormRef = ref(null);
const editLoadingMap = ref(new Map());
const deleteLoadingMap = ref(new Map());

const divisionForm = reactive({
  id: null,
  code: '',
  name: '',
  level: 1,
  parentId: null,
  sort: 0,
  status: 1,
});

const divisionRules = {
  code: [
    { required: true, message: '请输入区划编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入区划名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  level: [{ required: true, message: '请选择区划级别', trigger: 'change' }],
  parentId: [{ required: true, message: '请选择父级区划', trigger: 'change' }],
};

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 1000,
  total: 0,
});

// 加载数据
const loadDivisionList = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: SYSTEM_API.DIVISIONS,
      method: 'get',
      params: {
        ...searchForm,
      },
    });

    if (response.code === 200 || response.success) {
      divisionList.value = response.data || [];
      pagination.total = divisionList.value.length;
    } else {
      ElMessage.error(response.message || '加载区划列表失败');
    }
  } catch (error) {
    _logger.error('加载区划列表失败:', error);
    ElMessage.error('加载区划列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载统计信息
const loadDivisionStatistics = async (divisionId) => {
  if (!divisionId) {
    return;
  }
  statisticsLoading.value = true;
  try {
    const response = await request({
      url: SYSTEM_API.DIVISION_STATS(divisionId),
      method: 'get',
    });

    if (response.code === 200 || response.success) {
      divisionStats.value = response.data || {
        childrenCount: 0,
        warehouseCount: 0,
        deviceCount: 0,
      };
    } else {
      divisionStats.value = {
        childrenCount: 0,
        warehouseCount: 0,
        deviceCount: 0,
      };
    }
  } catch (error) {
    _logger.error('加载区划统计信息失败:', error);
    divisionStats.value = {
      childrenCount: 0,
      warehouseCount: 0,
      deviceCount: 0,
    };
  } finally {
    statisticsLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  loadDivisionList();
};

// 重置
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.level = '';
  loadDivisionList();
};

// 树节点过滤
const filterNode = (value, data) => {
  if (!value) {
    return true;
  }
  return data.name.toLowerCase().includes(value.toLowerCase()) || data.code.toLowerCase().includes(value.toLowerCase());
};

// 节点点击
const handleNodeClick = (data) => {
  selectedDivision.value = data;
  loadDivisionStatistics(data.id);
};

// 添加区划
const handleAddDivision = () => {
  isEdit.value = false;
  dialogTitle.value = '添加区划';
  resetForm();
  dialogVisible.value = true;
};

// 添加子级
const handleAddChild = (parent) => {
  isEdit.value = false;
  dialogTitle.value = `添加${getLevelText(parent.level + 1)}`;
  resetForm();
  divisionForm.level = parent.level + 1;
  divisionForm.parentId = parent.id;
  dialogVisible.value = true;
};

// 编辑区划
const handleEditDivision = (row) => {
  isEdit.value = true;
  dialogTitle.value = '编辑区划';
  Object.assign(divisionForm, {
    id: row.id,
    code: row.code,
    name: row.name,
    level: row.level,
    parentId: row.parentId,
    sort: row.sort || 0,
    status: row.status,
  });
  dialogVisible.value = true;
};

// 删除区划
const handleDeleteDivision = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除"${row.name}"吗？如果该区划有下级区划或关联数据，将无法删除。`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    deleteLoadingMap.value.set(row.id, true);

    const response = await request({
      url: SYSTEM_API.DIVISION_DETAIL(row.id),
      method: 'delete',
    });

    if (response.code === 200 || response.success) {
      ElMessage.success('删除成功');
      loadDivisionList();
      if (selectedDivision.value?.id === row.id) {
        selectedDivision.value = null;
      }
    } else {
      throw new Error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      _logger.error('删除区划失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  } finally {
    deleteLoadingMap.value.delete(row.id);
  }
};

// 提交表单
const handleFormSubmit = async () => {
  if (!divisionFormRef.value) {
    return;
  }

  submitLoading.value = true;
  try {
    await divisionFormRef.value.validate();

    const formData = { ...divisionForm };
    if (Array.isArray(formData.parentId)) {
      formData.parentId = formData.parentId[formData.parentId.length - 1];
    }

    let response;
    if (isEdit.value) {
      response = await request({
        url: SYSTEM_API.DIVISION_DETAIL(formData.id),
        method: 'put',
        data: formData,
      });
    } else {
      response = await request({
        url: SYSTEM_API.DIVISIONS,
        method: 'post',
        data: formData,
      });
    }

    if (response.code === 200 || response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
      dialogVisible.value = false;
      resetForm();
      loadDivisionList();
    } else {
      throw new Error(response.message || '操作失败');
    }
  } catch (error) {
    if (error !== false) {
      _logger.error('提交表单失败:', error);
      ElMessage.error(error.message || '操作失败');
    }
  } finally {
    submitLoading.value = false;
  }
};

// 导入
const handleImport = () => {
  ElMessage.info('导入功能开发中...');
};

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...');
};

// 重置表单
const resetForm = () => {
  Object.assign(divisionForm, {
    id: null,
    code: '',
    name: '',
    level: 1,
    parentId: null,
    sort: 0,
    status: 1,
  });
  divisionFormRef.value?.clearValidate();
};

// 获取级别文本
const getLevelText = (level) => {
  const levelMap = {
    1: '省/直辖市',
    2: '市',
    3: '区/县',
  };
  return levelMap[level] || '未知';
};

// 获取级别标签类型
const getLevelTagType = (level) => {
  const typeMap = {
    1: 'danger',
    2: 'warning',
    3: 'success',
  };
  return typeMap[level] || 'info';
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

// 监听搜索关键词变化，过滤树
watch(
  () => searchForm.keyword,
  (val) => {
    divisionTreeRef.value?.filter(val);
  }
);

// 生命周期
onMounted(() => {
  loadDivisionList();
});
</script>

<style scoped>
.tree-card {
  margin-top: 16px;
}

.division-content {
  display: flex;
  gap: 20px;
  min-height: 600px;
}

.division-tree-section {
  flex: 1;
  min-width: 400px;
  border-right: 1px solid var(--el-border-color-light);
  padding-right: 20px;
}

.division-details-section {
  flex: 1;
  min-width: 400px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.count-tag {
  margin-left: auto;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tree-node-content:hover,
.tree-node-content.is-selected {
  background-color: var(--el-fill-color-light);
}

.node-icon {
  color: var(--el-color-primary);
}

.node-label {
  flex: 1;
  font-weight: 500;
}

.node-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
}

.node-actions {
  display: none;
  gap: 4px;
}

.tree-node-content:hover .node-actions {
  display: flex;
}

.division-info-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.statistics-section {
  margin-top: 8px;
}

.statistics-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
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

:deep(.el-tree-node__content) {
  height: 40px;
}
</style>
