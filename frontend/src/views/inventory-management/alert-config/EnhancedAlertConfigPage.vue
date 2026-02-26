<!--
  @file: EnhancedAlertConfigPage.vue
  @description: 增强预警配置页面
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <PageLayout title="预警配置" description="配置库存预警规则">
    <template #headerActions>
      <el-button type="primary" :icon="Plus" @click="handleCreate" data-cy="alert-config-create-btn">新增配置</el-button>
    </template>

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

    <DataTable
      :data="configList"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      height="500px"
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" align="center" data-cy="alert-config-index-column" />
      <el-table-column prop="name" label="配置名称" min-width="150" data-cy="alert-config-name-column" />
      <el-table-column prop="type" label="预警类型" min-width="120" data-cy="alert-config-type-column">
        <template #default="{ row }">
          <el-tag :data-cy="`alert-config-type-tag-${row.id}`">{{ row.typeText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="threshold" label="阈值" width="100" align="center" data-cy="alert-config-threshold-column" />
      <el-table-column prop="status" label="状态" width="100" align="center" data-cy="alert-config-status-column">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" :data-cy="`alert-config-status-switch-${row.id}`" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" data-cy="alert-config-create-time-column" />
      <el-table-column label="操作" width="200" fixed="right" data-cy="alert-config-actions-column">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)" data-cy="alert-config-edit-btn">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)" data-cy="alert-config-delete-btn">删除</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" data-cy="alert-config-dialog">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef" data-cy="alert-config-form">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入配置名称" data-cy="alert-config-name-input" />
        </el-form-item>
        <el-form-item label="预警类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择预警类型" style="width: 100%" data-cy="alert-config-type-select">
            <el-option label="库存不足" value="low_stock" />
            <el-option label="库存积压" value="over_stock" />
            <el-option label="过期预警" value="expire" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值" prop="threshold">
          <el-input-number v-model="form.threshold" :min="0" style="width: 100%" data-cy="alert-config-threshold-input" />
        </el-form-item>
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="form.notifyMethods">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="app">应用内</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注" data-cy="alert-config-remark-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" data-cy="alert-config-dialog-cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleSubmit" data-cy="alert-config-dialog-confirm-btn">确定</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import {
  batchUpdateAlertConfig,
  createAlertConfig,
  deleteAlertConfig,
  getAlertConfigList,
  updateAlertConfig,
} from '@/api/inventory/alertConfig';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EnhancedAlertConfigPage');

const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const formRef = ref(null);

const searchForm = reactive({
  name: '',
  type: '',
  status: '',
});

const searchFields = computed(() => [
  { prop: 'name', label: '配置名称', type: 'input', placeholder: '请输入配置名称', md: 8, lg: 6, clearable: true },
  {
    prop: 'type',
    label: '预警类型',
    type: 'select',
    placeholder: '请选择预警类型',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '库存不足', value: 'low_stock' },
      { label: '库存积压', value: 'over_stock' },
      { label: '过期预警', value: 'expire' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.config(searchFields.value));

const form = reactive({
  name: '',
  type: '',
  threshold: 0,
  notifyMethods: [],
  remark: '',
});

const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择预警类型', trigger: 'change' }],
  threshold: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
};

const configList = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
const dialogTitle = computed(() => (isEdit.value ? '编辑配置' : '新增配置'));

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status !== '' ? searchForm.status : undefined,
    };
    const response = await getAlertConfigList(params);
    if (response.success) {
      configList.value = response.data.list.map((item) => ({
        ...item,
        typeText: getTypeText(item.type),
      }));
      pagination.total = response.data.total;
    } else {
      ElMessage.error(response.message || '获取预警配置失败');
    }
  } catch (error) {
    logger.error('获取预警配置失败', error);
    ElMessage.error(error.message || '获取预警配置失败');
  } finally {
    loading.value = false;
  }
};

const getTypeText = (type) => {
  const map = {
    low_stock: '库存不足',
    over_stock: '库存积压',
    expire: '过期预警',
  };
  return map[type] || type;
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = '';
  });
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};

const getDefaultFormValue = (key) => {
  if (key === 'notifyMethods') {
    return [];
  }
  if (key === 'threshold') {
    return 0;
  }
  return '';
};

const handleCreate = () => {
  isEdit.value = false;
  currentId.value = null;
  Object.keys(form).forEach((key) => {
    form[key] = getDefaultFormValue(key);
  });
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  currentId.value = row.id;
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除配置 ${row.name} 吗？`, '提示', { type: 'warning' });
    const response = await deleteAlertConfig(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      fetchData();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除失败', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const handleStatusChange = async (row) => {
  try {
    const response = await batchUpdateAlertConfig([{ id: row.id, status: row.status }]);
    if (response.success) {
      ElMessage.success(`配置 ${row.name} 已${row.status === 1 ? '启用' : '禁用'}`);
    } else {
      ElMessage.error(response.message || '状态更新失败');
      row.status = row.status === 1 ? 0 : 1;
    }
  } catch (error) {
    logger.error('状态更新失败', error);
    ElMessage.error(error.message || '状态更新失败');
    row.status = row.status === 1 ? 0 : 1;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    const response = isEdit.value ? await updateAlertConfig(currentId.value, form) : await createAlertConfig(form);
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
      dialogVisible.value = false;
      fetchData();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error !== false) {
      logger.error('操作失败', error);
      ElMessage.error(error.message || '操作失败');
    }
  }
};

onMounted(() => {
  fetchData();
});
</script>
