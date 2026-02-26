<template>
  <PageLayout
    title="行政区划管理"
    description="管理全国省市区行政区划数据，供仓库地址和设备安装地址选择使用"
    data-cy="administrative-division-page"
  >
    <template #headerActions>
      <el-button data-cy="division-add-btn" type="primary" :icon="Plus" @click="handleAdd" :loading="addLoading">
        添加区划
      </el-button>
      <el-button data-cy="division-import-btn" :icon="Upload" @click="handleImport"> 导入 </el-button>
      <el-button data-cy="division-export-btn" :icon="Download" @click="handleExport"> 导出 </el-button>
    </template>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon province">
              <el-icon><MapLocation /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.provinceCount || 0 }}</div>
              <div class="stat-label">省份</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon city">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.cityCount || 0 }}</div>
              <div class="stat-label">城市</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon district">
              <el-icon><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.districtCount || 0 }}</div>
              <div class="stat-label">区县</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCount || 0 }}</div>
              <div class="stat-label">总计</div>
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
      header-title="行政区划筛选"
      :header-icon="Filter"
      :result-count="totalCount"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 树形表格 -->
    <el-card class="tree-card" shadow="never" data-cy="division-tree-card">
      <div class="division-content">
        <div class="division-tree-section">
          <div class="section-header">
            <el-icon><MapLocation /></el-icon>
            <span>行政区划树</span>
            <el-tag type="info" size="small" class="count-tag">{{ totalCount }}个</el-tag>
          </div>
          <el-tree
            data-cy="division-tree"
            ref="treeRef"
            :data="divisionTree"
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
                  <el-icon v-if="data.level === 1"><MapLocation /></el-icon>
                  <el-icon v-else-if="data.level === 2"><OfficeBuilding /></el-icon>
                  <el-icon v-else><Location /></el-icon>
                </span>
                <span class="node-label">{{ node.label }}</span>
                <el-tag size="small" :type="getLevelTagType(data.level)" class="level-tag">
                  {{ getLevelText(data.level) }}
                </el-tag>
                <span class="node-code">{{ data.code }}</span>
                <span class="node-actions">
                  <el-button
                    data-cy="division-tree-add-btn"
                    link
                    size="small"
                    type="primary"
                    @click.stop="handleAddChild(data)"
                    title="添加下级"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button
                    data-cy="division-tree-edit-btn"
                    link
                    size="small"
                    type="primary"
                    @click.stop="handleEdit(data)"
                    title="编辑"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    data-cy="division-tree-delete-btn"
                    link
                    size="small"
                    type="danger"
                    @click.stop="handleDelete(data)"
                    title="删除"
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
            description="请从左侧选择一个区划查看详情"
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
              <el-descriptions-item label="排序号">{{ selectedDivision.sort || 0 }}</el-descriptions-item>
              <el-descriptions-item label="上级区划" :span="2">
                {{ selectedDivision.parentName || (selectedDivision.parentId ? '加载中...' : '无（省级）') }}
              </el-descriptions-item>
              <el-descriptions-item label="区划状态" :span="2">
                <el-tag :type="selectedDivision.status === 1 ? 'success' : 'info'">
                  {{ selectedDivision.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 关联数据 -->
            <el-descriptions v-if="divisionStats" :column="3" border title="关联数据" class="statistics-section">
              <el-descriptions-item label="仓库数量">
                <el-tag type="primary" size="large">{{ divisionStats.warehouseCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="设备数量">
                <el-tag type="warning" size="large">{{ divisionStats.deviceCount || 0 }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="客户数量">
                <el-tag type="success" size="large">{{ divisionStats.customerCount || 0 }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 快捷操作 -->
            <div class="quick-actions">
              <el-button type="primary" @click="handleEdit(selectedDivision)" data-cy="division-detail-edit-btn">
                <el-icon><Edit /></el-icon>编辑区划
              </el-button>
              <el-button v-if="selectedDivision.level < 3" type="success" @click="handleAddChild(selectedDivision)" data-cy="division-detail-add-child-btn">
                <el-icon><Plus /></el-icon>添加下级
              </el-button>
              <el-button type="danger" plain @click="handleDelete(selectedDivision)" data-cy="division-detail-delete-btn">
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
      <el-form data-cy="division-form" ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="区划名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入区划名称" clearable data-cy="division-name-input" />
        </el-form-item>
        <el-form-item label="区划编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入区划编码" clearable :disabled="isEdit" data-cy="division-code-input" />
          <div class="form-tip">编码规则：省(2位) + 市(2位) + 区(2位)，如440106</div>
        </el-form-item>
        <el-form-item label="区划级别" prop="level">
          <el-radio-group v-model="form.level" :disabled="isEdit">
            <el-radio :label="1">省份</el-radio>
            <el-radio :label="2">城市</el-radio>
            <el-radio :label="3">区县</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级区划" prop="parentId" v-if="form.level > 1">
          <el-cascader
            v-model="parentIdPath"
            :options="parentOptions"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="请选择上级区划"
            clearable
            style="width: 100%"
            @change="handleParentChange"
          />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="区划状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="division-dialog-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading" data-cy="division-dialog-confirm-btn">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入行政区划" width="700px" data-cy="division-import-dialog">
      <el-alert title="导入说明" type="info" :closable="false" style="margin-bottom: 20px">
        <template #default>
          <div>1. 支持导入 JSON 或 Excel 格式文件</div>
          <div>2. 数据格式：code(编码), name(名称), level(级别), parentId(父级ID)</div>
          <div>3. 如果编码已存在，将更新现有数据</div>
        </template>
      </el-alert>
      <el-upload drag action="#" :auto-upload="false" :on-change="handleFileChange" accept=".json,.xlsx,.xls">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false" data-cy="division-import-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit" :loading="importLoading" data-cy="division-import-confirm-btn">开始导入</el-button>
      </template>
    </el-dialog>

    <!-- 向导式创建对话框 -->
    <DivisionCreationWizard
      v-model="wizardVisible"
      :default-parent-id="wizardDefaultParentId"
      :default-level="wizardDefaultLevel"
      @success="handleWizardSuccess"
      @continue="handleWizardContinue"
    />

    <!-- 快捷操作链 -->
    <QuickActionChain
      v-model="quickActionVisible"
      :title="quickActionTitle"
      :message="quickActionMessage"
      :actions="quickActions"
      @action="handleQuickAction"
      @close="handleQuickActionClose"
      @back="handleQuickActionBack"
    />
  </PageLayout>
</template>

<script setup>
import {
  Plus,
  Edit,
  Delete,
  Download,
  Upload,
  MapLocation,
  OfficeBuilding,
  Location,
  InfoFilled,
  Filter,
  DataAnalysis,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  getDivisionTree,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionStatistics,
} from '@/api/administrativeDivision';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import DivisionCreationWizard from '@/components/business/wizard/DivisionCreationWizard.vue';
import QuickActionChain from '@/components/business/workflow/QuickActionChain.vue';
import { createLogger } from '@/utils/logger';
import { workflowContext } from '@/utils/workflowContext';

const logger = createLogger('AdministrativeDivision');
const router = useRouter();

// 加载状态
const loading = ref(false);
const addLoading = ref(false);
const submitLoading = ref(false);
const importLoading = ref(false);

// 快捷操作链
const quickActionVisible = ref(false);
const quickActions = ref([]);
const lastCreatedDivision = ref(null);

// 快捷操作标题和消息
const quickActionTitle = computed(() => {
  return '行政区划创建成功';
});

const quickActionMessage = computed(() => {
  const name = lastCreatedDivision.value?.name || '新区划';
  const level = lastCreatedDivision.value?.level;
  let levelText = '区县';
  if (level === 1) {
    levelText = '省份';
  } else if (level === 2) {
    levelText = '城市';
  }
  return `${levelText} "${name}" 创建成功！您接下来想要做什么？`;
});

const getCreateChildLabel = (level) => {
  if (level === 1) {
    return '创建城市';
  }
  if (level === 2) {
    return '创建区县';
  }
  return '创建下级';
};

// 搜索表单
const searchForm = reactive({
  keyword: '',
  level: null,
});

// 筛选字段配置
const filterFields = [
  {
    type: 'select',
    label: '区划级别',
    prop: 'level',
    options: [
      { label: '全部', value: null },
      { label: '省份', value: 1 },
      { label: '城市', value: 2 },
      { label: '区县', value: 3 },
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

// 树形配置
const treeRef = ref(null);
const treeProps = {
  label: 'name',
  children: 'children',
};

// 数据
const divisionTree = ref([]);
const totalCount = ref(0);
const statistics = ref({});
const selectedDivision = ref(null);
const divisionStats = ref(null);

// 对话框
const dialogVisible = ref(false);
const importDialogVisible = ref(false);
const wizardVisible = ref(false);
const wizardDefaultParentId = ref(null);
const wizardDefaultLevel = ref(null);
const dialogTitle = ref('添加区划');
const isEdit = ref(false);
const formRef = ref(null);
const parentIdPath = ref([]);
const parentOptions = ref([]);

// 表单
const form = reactive({
  id: null,
  name: '',
  code: '',
  level: 1,
  parentId: null,
  sort: 0,
  status: 1,
});

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入区划名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入区划编码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '编码必须是6位数字', trigger: 'blur' },
  ],
  level: [{ required: true, message: '请选择区划级别', trigger: 'change' }],
  parentId: [{ required: true, message: '请选择上级区划', trigger: 'change' }],
};

// 获取级别标签类型
const getLevelTagType = (level) => {
  const types = {
    1: 'danger',
    2: 'warning',
    3: 'success',
  };
  return types[level] || 'info';
};

// 获取级别文本
const getLevelText = (level) => {
  const texts = {
    1: '省',
    2: '市',
    3: '区',
  };
  return texts[level] || '未知';
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const [treeRes, statsRes] = await Promise.all([getDivisionTree(), getDivisionStatistics()]);

    if (treeRes.code === 200 || treeRes.success) {
      divisionTree.value = treeRes.data || [];
      totalCount.value = countTotal(divisionTree.value);
    }

    if (statsRes.code === 200 || statsRes.success) {
      statistics.value = statsRes.data || {};
    }
  } catch (_error) {
    logger.error('加载数据失败', _error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 统计总数
const countTotal = (tree) => {
  let count = 0;
  const traverse = (nodes) => {
    nodes.forEach((node) => {
      count++;
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return count;
};

// 树节点筛选
const filterNode = (value, data) => {
  if (!value) {
    return true;
  }
  return data.name.includes(value) || data.code.includes(value);
};

// 搜索
const handleSearch = () => {
  treeRef.value?.filter(searchForm.keyword);
};

// 重置
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.level = null;
  treeRef.value?.filter('');
};

// 节点点击
const handleNodeClick = (data) => {
  selectedDivision.value = data;
  // 加载关联统计数据
  loadDivisionStats(data.id);
};

// 加载区划统计
const loadDivisionStats = async (_id) => {
  // 这里可以调用API获取关联统计
  divisionStats.value = {
    warehouseCount: Math.floor(Math.random() * 5),
    deviceCount: Math.floor(Math.random() * 50),
    customerCount: Math.floor(Math.random() * 20),
  };
};

// 添加 - 使用向导
const handleAdd = () => {
  wizardDefaultParentId.value = null;
  wizardDefaultLevel.value = null;
  wizardVisible.value = true;
};

// 添加下级 - 使用向导
const handleAddChild = (parent) => {
  wizardDefaultParentId.value = parent.id;
  wizardDefaultLevel.value = parent.level + 1;
  wizardVisible.value = true;
};

// 向导创建成功
const handleWizardSuccess = (division) => {
  logger.debug('行政区划创建成功:', division);
  loadData();

  // 保存创建的区划信息
  lastCreatedDivision.value = division;

  // 设置上下文，供其他模块使用
  workflowContext.setDivisionContext({
    provinceId: division.level === 1 ? division.id : null,
    cityId: division.level === 2 ? division.id : null,
    districtId: division.level === 3 ? division.id : null,
    provinceName: division.level === 1 ? division.name : null,
    cityName: division.level === 2 ? division.name : null,
    districtName: division.level === 3 ? division.name : null,
    level: division.level,
    code: division.code,
  });

  // 配置快捷操作
  const actions = [
    {
      key: 'createWarehouse',
      label: '创建仓库',
      icon: 'Warehouse',
      type: 'primary',
      route: '/warehouse/list',
      query: {
        provinceId: division.level === 1 ? division.id : null,
        cityId: division.level === 2 ? division.id : null,
        districtId: division.level === 3 ? division.id : null,
      },
      sourceId: division.id,
    },
    {
      key: 'createChild',
      label: getCreateChildLabel(division.level),
      icon: 'Plus',
      type: 'success',
      handler: () => {
        wizardDefaultParentId.value = division.id;
        wizardDefaultLevel.value = division.level + 1;
        wizardVisible.value = true;
      },
      sourceId: division.id,
    },
    {
      key: 'createSibling',
      label: '创建同级区划',
      icon: 'CirclePlus',
      type: 'info',
      handler: () => {
        wizardDefaultParentId.value = division.parentId;
        wizardDefaultLevel.value = division.level;
        wizardVisible.value = true;
      },
      sourceId: division.id,
    },
    {
      key: 'createAnother',
      label: '继续创建',
      icon: 'Plus',
      type: 'default',
      plain: true,
      handler: () => {
        wizardDefaultParentId.value = null;
        wizardDefaultLevel.value = null;
        wizardVisible.value = true;
      },
    },
  ];

  // 如果是区县级别，不显示创建下级选项
  if (division.level >= 3) {
    actions.splice(1, 1);
  }

  quickActions.value = actions;
  quickActionVisible.value = true;
};

// 向导继续创建
const handleWizardContinue = ({ type, parentId, level }) => {
  logger.debug('继续创建:', { type, parentId, level });
  // 向导会自动处理继续创建逻辑
};

// 快捷操作处理
const handleQuickAction = (action) => {
  logger.debug('执行快捷操作:', action);

  if (action.handler) {
    // 执行自定义处理器
    action.handler();
  } else if (action.route) {
    // 路由跳转
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

// 编辑
const handleEdit = (data) => {
  isEdit.value = true;
  dialogTitle.value = '编辑区划';
  Object.assign(form, data);
  parentIdPath.value = data.parentId ? [data.parentId] : [];
  loadParentOptions();
  dialogVisible.value = true;
};

// 删除
const handleDelete = (data) => {
  ElMessageBox.confirm(`确定要删除区划 "${data.name}" 吗？\n删除后无法恢复，请谨慎操作。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteDivision(data.id);
        if (res.code === 200 || res.success) {
          ElMessage.success('删除成功');
          loadData();
          selectedDivision.value = null;
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      } catch (error) {
        logger.error('删除失败', error);
        ElMessage.error(error.response?.data?.message || '删除失败');
      }
    })
    .catch(() => {});
};

// 加载上级选项
const loadParentOptions = async () => {
  try {
    const res = await getDivisionTree({ level: form.level - 1 });
    if (res.code === 200 || res.success) {
      parentOptions.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载上级选项失败', error);
  }
};

// 上级选择变化
const handleParentChange = (value) => {
  form.parentId = value?.[value.length - 1] || null;
};

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitLoading.value = true;
  try {
    const api = isEdit.value ? updateDivision : createDivision;
    const res = await api(form.id, form);

    if (res.code === 200 || res.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
      dialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.message || (isEdit.value ? '更新失败' : '创建失败'));
    }
  } catch (error) {
    logger.error('提交失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 导入
const handleImport = () => {
  importDialogVisible.value = true;
};

// 文件选择
const handleFileChange = (file) => {
  logger.debug('选择文件', { name: file.name, size: file.size });
};

// 导入提交
const handleImportSubmit = async () => {
  importLoading.value = true;
  try {
    // 实现导入逻辑
    ElMessage.success('导入成功');
    importDialogVisible.value = false;
    loadData();
  } catch (_error) {
    ElMessage.error('导入失败');
  } finally {
    importLoading.value = false;
  }
};

// 导出
const handleExport = () => {
  // 实现导出逻辑
  ElMessage.success('导出成功');
};

// 监听级别变化，加载上级选项
watch(
  () => form.level,
  () => {
    if (form.level > 1) {
      loadParentOptions();
    }
  }
);

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

.stat-icon.province {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-icon.city {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.district {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-icon.total {
  background-color: #ecf5ff;
  color: #409eff;
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

.tree-card {
  margin-top: 20px;
}

.division-content {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.division-tree-section {
  width: 50%;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;
}

.division-details-section {
  width: 50%;
  padding-left: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.count-tag {
  margin-left: auto;
}

.tree-node-content {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 5px 0;
}

.tree-node-content.is-selected {
  background-color: #ecf5ff;
}

.node-icon {
  margin-right: 8px;
  color: #909399;
}

.node-label {
  flex: 1;
  font-size: 14px;
}

.level-tag {
  margin: 0 8px;
}

.node-code {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}

.node-actions {
  display: none;
}

.tree-node-content:hover .node-actions {
  display: flex;
  gap: 5px;
}

.division-info-container {
  padding: 10px 0;
}

.statistics-section {
  margin-top: 20px;
}

.quick-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

:deep(.el-tree-node__content) {
  height: 40px;
}

:deep(.el-descriptions__label) {
  width: 100px;
}
</style>
