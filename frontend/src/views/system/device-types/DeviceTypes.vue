<template>
  <PageLayout title="设备类型管理" description="管理设备类型分类" data-cy="device-types-page">
    <template #headerActions>
      <el-button data-cy="device-types-add-btn" type="primary" @click="handleAdd" :loading="operationLoading.create">
        <el-icon data-cy="device-types-add-icon"><Plus /></el-icon>
        添加类型
      </el-button>
      <el-button data-cy="device-types-export-btn" @click="handleExport" :loading="exportLoading">
        <el-icon data-cy="device-types-export-icon"><Download /></el-icon>
        导出
      </el-button>
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="类型筛选"
      :header-icon="Grid"
      :result-count="filteredDeviceTypes.length"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="table-card" shadow="never" data-cy="device-types-table-card">
      <el-table
        data-cy="device-types-table"
        :data="paginatedDeviceTypes"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column data-cy="device-types-table-column-index" label="序号" width="100" align="center">
          <template #default="{ $index }">
            {{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column data-cy="device-types-table-column-name" label="类型名称" min-width="160">
          <template #default="{ row }">
            {{ row.name || row.typeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column data-cy="device-types-table-column-code" label="类型编码" min-width="120">
          <template #default="{ row }">
            {{ row.code || row.typeCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          data-cy="device-types-table-column-description"
          prop="description"
          label="描述"
          min-width="240"
          show-overflow-tooltip
        />
        <el-table-column
          data-cy="device-types-table-column-status"
          prop="status"
          label="状态"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <el-tag data-cy="device-types-status-tag" :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column data-cy="device-types-table-column-createtime" prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          data-cy="device-types-table-column-actions"
          label="操作"
          width="200"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button data-cy="device-types-edit-btn" link type="primary" size="small" @click="handleEdit(row)">
              <el-icon data-cy="device-types-edit-icon"><Edit /></el-icon>
              编辑
            </el-button>
            <el-button data-cy="device-types-delete-btn" link type="danger" size="small" @click="handleDelete(row)">
              <el-icon data-cy="device-types-delete-icon"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        data-cy="device-types-pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredDeviceTypes.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      data-cy="device-types-dialog"
      v-model="dialogVisible"
      :title="isEdit ? '编辑设备类型' : '添加设备类型'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form data-cy="device-types-form" ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item data-cy="device-types-form-item-name" label="类型名称" prop="name">
          <el-input
            data-cy="device-types-name-input"
            v-model="formData.name"
            placeholder="请输入类型名称，如：自助机"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item data-cy="device-types-form-item-code" label="类型编码" prop="code">
          <el-input
            data-cy="device-types-code-input"
            v-model="formData.code"
            placeholder="请输入类型编码，如：ZJ"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item data-cy="device-types-form-item-status" label="状态" prop="status">
          <el-radio-group data-cy="device-types-status-radio-group" v-model="formData.status">
            <el-radio data-cy="device-types-status-radio-enabled" :label="1">启用</el-radio>
            <el-radio data-cy="device-types-status-radio-disabled" :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item data-cy="device-types-form-item-description" label="描述" prop="description">
          <el-input
            data-cy="device-types-description-input"
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button data-cy="device-types-cancel-btn" @click="dialogVisible = false">取消</el-button>
        <el-button
          data-cy="device-types-submit-btn"
          type="primary"
          @click="handleSubmit"
          :loading="operationLoading.create || operationLoading.update"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Delete, Download, Edit, Grid, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { deleteDeviceType, exportDeviceTypes, getDeviceTypes } from '@/api/device/device-type';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const _logger = createLogger('DeviceTypes');

// 表格数据
const deviceTypes = ref([]);
const loading = ref(false);
const operationLoading = ref({
  create: false,
  update: false,
  delete: false,
});

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索类型名称或编码',
    clearable: true,
    md: 12,
    lg: 8,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    md: 8,
    lg: 6,
    options: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ],
  },
]);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
});

// 过滤后的数据
const filteredDeviceTypes = computed(() => {
  let result = deviceTypes.value;

  // 关键词筛选
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase();
    result = result.filter((item) => {
      const name = (item.name || item.typeName || '').toLowerCase();
      const code = (item.code || item.typeCode || '').toLowerCase();
      return name.includes(keyword) || code.includes(keyword);
    });
  }

  // 状态筛选
  if (searchForm.status !== '') {
    const statusValue = parseInt(searchForm.status);
    result = result.filter((item) => item.status === statusValue);
  }

  return result;
});

// 分页后的数据
const paginatedDeviceTypes = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredDeviceTypes.value.slice(start, end);
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const response = await getDeviceTypes();
    if (response.code === 200 && response.data) {
      deviceTypes.value = response.data;
    } else {
      deviceTypes.value = [];
      ElMessage.warning(response.message || '获取数据失败');
    }
  } catch (error) {
    _logger.error('加载设备类型失败:', error);
    ElMessage.error('加载数据失败');
    deviceTypes.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
};

// 重置处理
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  pagination.page = 1;
};

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
};

const handlePageChange = (page) => {
  pagination.page = page;
};

// 对话框
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const exportLoading = ref(false);

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  code: '',
  status: 1,
  description: '',
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '类型名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { min: 2, max: 20, message: '类型编码长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '类型编码只能包含大写字母和数字', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 添加
const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id || row.typeId,
    name: row.name || row.typeName,
    code: row.code || row.typeCode,
    status: row.status ?? 1,
    description: row.description || '',
  });
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  try {
    const typeName = row.name || row.typeName || '未知类型';
    await ElMessageBox.confirm(`确定要删除设备类型"${typeName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    operationLoading.value.delete = true;
    const response = await deleteDeviceType(row.id || row.typeId);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadData();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      _logger.error('删除设备类型失败:', error);
      ElMessage.error('删除失败');
    }
  } finally {
    operationLoading.value.delete = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    if (isEdit.value) {
      operationLoading.value.update = true;
      const { updateDeviceType } = await import('@/api/device/device-type');
      const response = await updateDeviceType(formData);
      if (response.code === 200) {
        ElMessage.success('更新成功');
        dialogVisible.value = false;
        loadData();
      } else {
        ElMessage.error(response.message || '更新失败');
      }
    } else {
      operationLoading.value.create = true;
      const { addDeviceType } = await import('@/api/device/device-type');
      const response = await addDeviceType(formData);
      if (response.code === 200) {
        ElMessage.success('添加成功');
        dialogVisible.value = false;
        loadData();
      } else {
        ElMessage.error(response.message || '添加失败');
      }
    }
  } catch (error) {
    _logger.error('提交表单失败:', error);
    ElMessage.error('操作失败');
  } finally {
    operationLoading.value.create = false;
    operationLoading.value.update = false;
  }
};

// 重置表单
const resetForm = () => {
  formData.id = null;
  formData.name = '';
  formData.code = '';
  formData.status = 1;
  formData.description = '';
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    await exportDeviceTypes();
    ElMessage.success('导出成功');
  } catch (error) {
    _logger.error('导出设备类型失败:', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
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

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.table-card {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
