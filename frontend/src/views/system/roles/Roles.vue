<template>
  <PageLayout title="角色管理" description="管理系统角色及权限配置" data-cy="roles-management-page">
    <template #headerActions>
      <el-button
        v-if="showPermissionSetting"
        type="primary"
        :icon="Plus"
        @click="openAddDialog"
        data-cy="roles-add-button"
        >添加角色</el-button
      >
      <el-button
        v-if="showPermissionSetting"
        type="warning"
        :icon="Lock"
        @click="openPermissionDialog"
        :disabled="!selectedRole"
        data-cy="roles-permission-button"
        >权限设置</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="角色筛选"
      :header-icon="UserFilled"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="table-card" shadow="never" data-cy="roles-content">
      <div v-if="loading" class="loading-container" data-cy="roles-loading">
        <TableSkeleton :row-count="10" :column-count="4" />
      </div>
      <el-table
        v-else
        :data="roles"
        :row-key="(row) => row.id"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        data-cy="roles-table"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="roleCode" label="角色编码" width="140" align="center" />
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="roleDescription" label="角色描述" min-width="240" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="showPermissionSetting"
              type="primary"
              link
              size="small"
              @click="openPermissionDialog(row)"
              :loading="permissionLoadingMap.get(row.id)"
              data-cy="roles-set-permission-button"
            >
              权限设置
            </el-button>
            <el-button
              v-if="showPermissionSetting && row.roleCode !== 'admin'"
              type="warning"
              link
              size="small"
              @click="openEditDialog(row)"
              data-cy="roles-edit-button"
            >
              编辑
            </el-button>
            <el-button
              v-if="showPermissionSetting && row.roleCode !== 'admin'"
              type="danger"
              link
              size="small"
              @click="handleDeleteRole(row)"
              data-cy="roles-delete-button"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          data-cy="roles-pagination"
        />
      </div>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加角色"
      width="600px"
      :close-on-click-modal="false"
      data-cy="roles-add-dialog"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px" data-cy="roles-add-form">
        <el-form-item prop="roleCode" label="角色编码">
          <el-input
            v-model="addForm.roleCode"
            placeholder="请输入角色编码"
            clearable
            data-cy="roles-add-roleCode-input"
          />
        </el-form-item>
        <el-form-item prop="roleName" label="角色名称">
          <el-input
            v-model="addForm.roleName"
            placeholder="请输入角色名称"
            clearable
            data-cy="roles-add-roleName-input"
          />
        </el-form-item>
        <el-form-item prop="roleDescription" label="角色描述">
          <el-input
            v-model="addForm.roleDescription"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="3"
            resize="none"
            data-cy="roles-add-roleDescription-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false" data-cy="roles-add-cancel-button">取消</el-button>
        <el-button type="primary" @click="handleAddRole" :loading="addLoading" data-cy="roles-add-confirm-button"
          >确定</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑角色"
      width="600px"
      :close-on-click-modal="false"
      data-cy="roles-edit-dialog"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px" data-cy="roles-edit-form">
        <el-form-item prop="roleCode" label="角色编码">
          <el-input
            v-model="editForm.roleCode"
            placeholder="请输入角色编码"
            clearable
            disabled
            data-cy="roles-edit-roleCode-input"
          />
        </el-form-item>
        <el-form-item prop="roleName" label="角色名称">
          <el-input
            v-model="editForm.roleName"
            placeholder="请输入角色名称"
            clearable
            data-cy="roles-edit-roleName-input"
          />
        </el-form-item>
        <el-form-item prop="roleDescription" label="角色描述">
          <el-input
            v-model="editForm.roleDescription"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="3"
            resize="none"
            data-cy="roles-edit-roleDescription-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false" data-cy="roles-edit-cancel-button">取消</el-button>
        <el-button type="primary" @click="handleEditRole" :loading="editLoading" data-cy="roles-edit-confirm-button"
          >确定</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      v-model="permissionVisible"
      :title="`${currentRole.roleName} - 权限设置`"
      width="60%"
      destroy-on-close
      data-cy="roles-permission-dialog"
    >
      <el-tree
        ref="permissionTree"
        :data="permissionTreeData"
        show-checkbox
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        data-cy="roles-permission-tree"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionVisible = false" data-cy="roles-permission-cancel-button">取消</el-button>
          <el-button
            type="primary"
            @click="handlePermissionSave"
            :loading="savePermissionLoading"
            data-cy="roles-permission-save-button"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Lock, Plus, UserFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getPermissionTree } from '@/api/system/permission';
import {
  createRole,
  deleteRole,
  getRolePermissions,
  getRoles,
  updateRole,
  updateRolePermissions,
} from '@/api/system/role';
import PageLayout from '@/components/base/PageLayout.vue';
import TableSkeleton from '@/components/base/TableSkeleton.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('roles');

// 搜索表单
const searchForm = reactive({
  keyword: '',
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'keyword',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称',
    clearable: true,
    md: 8,
    lg: 6,
  },
]);

const searchQuery = ref('');
const loading = ref(false);
const roles = ref([]);
const selectedRoles = ref([]);
const selectedRole = ref(null);
const permissionTreeData = ref([]);
const permissionVisible = ref(false);
const permissionTree = ref(null);
const savePermissionLoading = ref(false);
const permissionLoadingMap = ref(new Map());
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const addLoading = ref(false);
const editLoading = ref(false);

const addFormRef = ref(null);
const editFormRef = ref(null);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const currentRole = reactive({
  id: null,
  roleName: '',
});

const addForm = reactive({
  roleCode: '',
  roleName: '',
  roleDescription: '',
});

const editForm = reactive({
  id: null,
  roleCode: '',
  roleName: '',
  roleDescription: '',
});

const addRules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 100, message: '角色名称长度在 2 到 100 个字符', trigger: 'blur' },
  ],
};

const editRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 100, message: '角色名称长度在 2 到 100 个字符', trigger: 'blur' },
  ],
};

const userRole = computed(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // 角色已经标准化为小写，直接返回
      return user.role || 'operator';
    } catch {
      return 'operator';
    }
  }
  return 'operator';
});

// 检查是否为管理员，使用小写比较
const showPermissionSetting = computed(() => userRole.value === 'admin');

const loadRoles = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchQuery.value,
    };
    const response = await getRoles(params);
    if (response.success || response.code === 200) {
      roles.value = response.data.content || response.data || [];
      pagination.total = response.data.totalElements || response.data.total || 0;
    }
  } catch (error) {
    logger.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败');
  } finally {
    loading.value = false;
  }
};

const loadPermissionTree = async () => {
  try {
    const response = await getPermissionTree();
    if (response.success || response.code === 200) {
      permissionTreeData.value = response.data || [];
    }
  } catch (error) {
    logger.error('加载权限树失败:', error);
    ElMessage.error('加载权限树失败');
  }
};

const handleSearch = () => {
  searchQuery.value = searchForm.keyword;
  pagination.currentPage = 1;
  loadRoles();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchQuery.value = '';
  pagination.currentPage = 1;
  loadRoles();
};

const handleSelectionChange = (selection) => {
  selectedRoles.value = selection;
  selectedRole.value = selection.length === 1 ? selection[0] : null;
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadRoles();
};

const handleCurrentChange = (current) => {
  pagination.currentPage = current;
  loadRoles();
};

const openAddDialog = () => {
  resetAddForm();
  addDialogVisible.value = true;
};

const openEditDialog = (role) => {
  Object.assign(editForm, {
    id: role.id,
    roleCode: role.roleCode,
    roleName: role.roleName,
    roleDescription: role.roleDescription,
  });
  editDialogVisible.value = true;
};

const openPermissionDialog = async (role) => {
  if (!role) {
    return;
  }

  permissionLoadingMap.value.set(role.id, true);
  try {
    Object.assign(currentRole, { id: role.id, roleName: role.roleName });

    const response = await getRolePermissions(role.id);
    if (response.success || response.code === 200) {
      if (permissionTree.value) {
        const permissions = response.data || [];
        const checkedKeys = Array.isArray(permissions) ? permissions.filter((p) => p.checked).map((p) => p.id) : [];
        permissionTree.value.setCheckedKeys(checkedKeys);
      }
      permissionVisible.value = true;
    }
  } catch (error) {
    logger.error('获取角色权限失败:', error);
    ElMessage.error('获取角色权限失败');
  } finally {
    permissionLoadingMap.value.delete(role.id);
  }
};

const handleAddRole = async () => {
  if (!addFormRef.value) {
    return;
  }

  try {
    await addFormRef.value.validate();
    addLoading.value = true;

    const response = await createRole(addForm);
    if (response.success || response.code === 200) {
      ElMessage.success('添加角色成功');
      addDialogVisible.value = false;
      resetAddForm();
      await loadRoles();
    } else {
      ElMessage.error(response.message || '添加角色失败');
    }
  } catch (error) {
    logger.error('添加角色失败:', error);
    if (error !== false) {
      ElMessage.error('添加角色失败');
    }
  } finally {
    addLoading.value = false;
  }
};

const handleEditRole = async () => {
  if (!editFormRef.value) {
    return;
  }

  try {
    await editFormRef.value.validate();
    editLoading.value = true;

    const response = await updateRole(editForm.id, editForm);
    if (response.success || response.code === 200) {
      ElMessage.success('更新角色成功');
      editDialogVisible.value = false;
      await loadRoles();
    } else {
      ElMessage.error(response.message || '更新角色失败');
    }
  } catch (error) {
    logger.error('更新角色失败:', error);
    if (error !== false) {
      ElMessage.error('更新角色失败');
    }
  } finally {
    editLoading.value = false;
  }
};

const handleDeleteRole = async (role) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色"${role.roleName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteRole(role.id);
    if (response.success || response.code === 200) {
      ElMessage.success('删除角色成功');
      await loadRoles();
    } else {
      ElMessage.error(response.message || '删除角色失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除角色失败:', error);
      ElMessage.error('删除角色失败');
    }
  }
};

const handlePermissionSave = async () => {
  if (!permissionTree.value) {
    return;
  }

  try {
    savePermissionLoading.value = true;
    const checkedNodes = permissionTree.value.getCheckedNodes();
    const permissionIds = checkedNodes.map((node) => node.id);

    const response = await updateRolePermissions(currentRole.id, permissionIds);
    if (response.success || response.code === 200) {
      ElMessage.success('权限设置保存成功');
      permissionVisible.value = false;
    } else {
      ElMessage.error(response.message || '保存权限设置失败');
    }
  } catch (error) {
    logger.error('保存权限设置失败:', error);
    ElMessage.error('保存权限设置失败');
  } finally {
    savePermissionLoading.value = false;
  }
};

const resetAddForm = () => {
  Object.assign(addForm, {
    roleCode: '',
    roleName: '',
    roleDescription: '',
  });
  if (addFormRef.value) {
    addFormRef.value.clearValidate();
  }
};

onMounted(() => {
  loadRoles();
  loadPermissionTree();
});
</script>

<style scoped>
.roles-container {
  height: 100%;
  padding: var(--spacing-6);
  background: var(--bg-color-page);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-50);
  color: var(--primary-600);
  border: 2px solid var(--primary-100);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-xl);
  transition: var(--transition-base);
}

.header-icon:hover {
  background: var(--primary-100);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.header-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.roles-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--bg-color-light);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow-sm);
}

.roles-content {
  min-height: 400px;
}

.loading-container {
  padding: var(--spacing-6) 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-5);
  padding: var(--spacing-4) 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

:deep(.el-tree) {
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
}
</style>
