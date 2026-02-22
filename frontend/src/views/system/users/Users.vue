<template>
  <PageLayout title="用户管理" description="管理系统用户账号及权限" data-cy="users-management-page">
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="handleShowOperationGuide" data-cy="users-guide-button"
        >操作指引</el-button
      >
      <el-button type="primary" :icon="Plus" @click="openAddDialog" data-cy="users-add-button">添加用户</el-button>
      <el-button
        :icon="Delete"
        @click="handleBatchDelete"
        :disabled="selectedUsers.length === 0"
        data-cy="users-batch-delete-button"
        >批量删除</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="searchFields"
      :loading="loading"
      header-title="用户筛选"
      :header-icon="User"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="table-card" shadow="never" data-cy="users-content">
      <div v-if="loading" class="loading-container" data-cy="users-loading">
        <TableSkeleton :row-count="10" :column-count="8" />
      </div>
      <el-table
        v-else
        :data="users"
        :row-key="(row) => row.id"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        data-cy="users-table"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="realName" label="真实姓名" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号码" min-width="140" />
        <el-table-column prop="roleName" label="角色" min-width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="row.roleCode === 'admin' ? 'danger' : 'primary'">
              {{ row.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              @change="toggleUserStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="200" align="center">
          <template #default="{ row }">
            {{ formatCreateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link size="small" @click="openDetailDialog(row)" data-cy="users-view-button">
                查看
              </el-button>
              <el-button type="warning" link size="small" @click="openEditDialog(row)" data-cy="users-edit-button">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteUser(row)" data-cy="users-delete-button">
                删除
              </el-button>
            </div>
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
        />
      </div>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加用户" width="600px" :close-on-click-modal="false">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="addForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item prop="realName" label="真实姓名">
          <el-input v-model="addForm.realName" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="addForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item prop="phone" label="手机号码">
          <el-input v-model="addForm.phone" placeholder="请输入手机号码" clearable />
        </el-form-item>
        <el-form-item prop="roleId" label="角色">
          <el-select v-model="addForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.roleName" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="isActive" label="状态">
          <el-radio-group v-model="addForm.isActive">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="remark" label="备注">
          <el-input v-model="addForm.remark" type="textarea" placeholder="请输入备注信息" :rows="3" resize="none" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddUser" :loading="addLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑用户" width="600px" :close-on-click-modal="false">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="editForm.username" placeholder="请输入用户名" clearable disabled />
        </el-form-item>
        <el-form-item prop="realName" label="真实姓名">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item prop="phone" label="手机号码">
          <el-input v-model="editForm.phone" placeholder="请输入手机号码" clearable />
        </el-form-item>
        <el-form-item prop="roleId" label="角色">
          <el-select v-model="editForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.roleName" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="isActive" label="状态">
          <el-radio-group v-model="editForm.isActive">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="remark" label="备注">
          <el-input v-model="editForm.remark" type="textarea" placeholder="请输入备注信息" :rows="3" resize="none" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditUser" :loading="editLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentUser.realName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentUser.roleName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.isActive === 1 ? 'success' : 'info'">
            {{ currentUser.isActive === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatCreateTime(currentUser.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{
          formatCreateTime(currentUser.updateTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentUser.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="guideDialogVisible" title="操作指引" width="900px" :close-on-click-modal="false">
      <div class="operation-guide">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="添加用户" />
          <el-step title="查询筛选" />
          <el-step title="编辑管理" />
          <el-step title="删除操作" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 添加用户</h3>
            <p>创建新的系统用户账号：</p>
            <ul>
              <li><strong>用户名</strong>：输入登录系统的用户名，必须唯一</li>
              <li><strong>密码</strong>：设置用户登录密码，建议使用复杂密码</li>
              <li><strong>真实姓名</strong>：输入用户的真实姓名</li>
              <li><strong>邮箱</strong>：输入用户的邮箱地址，用于接收通知</li>
              <li><strong>手机号码</strong>：输入用户的手机号码，用于身份验证</li>
              <li><strong>角色</strong>：为用户分配角色，决定其系统权限</li>
              <li><strong>状态</strong>：设置用户状态为启用或禁用</li>
              <li><strong>备注</strong>：填写用户相关的备注信息（选填）</li>
            </ul>
            <div class="guide-tip">
              <el-icon><WarningFilled /></el-icon>
              <span>提示：用户名必须唯一，密码长度至少6位</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 查询筛选</h3>
            <p>使用搜索功能快速查找用户：</p>
            <ul>
              <li><strong>关键词搜索</strong>：在搜索框中输入用户名或真实姓名进行模糊查询</li>
              <li><strong>实时搜索</strong>：输入关键词后系统会自动过滤显示匹配的用户</li>
              <li><strong>清空搜索</strong>：点击搜索框的清除按钮清空搜索条件</li>
              <li><strong>用户列表</strong>：表格中显示所有用户的详细信息</li>
              <li><strong>分页浏览</strong>：使用分页控件浏览大量用户数据</li>
            </ul>
            <div class="guide-tip">
              <el-icon><WarningFilled /></el-icon>
              <span>提示：搜索功能支持用户名和真实姓名的模糊匹配</span>
            </div>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 编辑管理</h3>
            <p>对用户信息进行编辑和状态管理：</p>
            <ul>
              <li><strong>查看详情</strong>：点击"查看"按钮查看用户的完整信息</li>
              <li><strong>编辑用户</strong>：点击"编辑"按钮修改用户信息</li>
              <li><strong>状态切换</strong>：使用开关控件快速启用或禁用用户</li>
              <li><strong>角色分配</strong>：在编辑对话框中修改用户的角色</li>
              <li><strong>信息更新</strong>：修改用户名、邮箱、手机号码等信息</li>
              <li><strong>密码修改</strong>：在编辑对话框中可以修改用户密码</li>
            </ul>
            <div class="guide-warning">
              <el-icon><Warning /></el-icon>
              <span>警告：禁用用户后，该用户将无法登录系统！</span>
            </div>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 删除操作</h3>
            <p>删除不再需要的用户账号：</p>
            <ul>
              <li><strong>单个删除</strong>：点击"删除"按钮删除单个用户</li>
              <li><strong>批量删除</strong>：勾选多个用户后点击"批量删除"按钮</li>
              <li><strong>确认删除</strong>：系统会弹出确认对话框，确认后执行删除</li>
              <li><strong>删除限制</strong>：不能删除当前登录的用户</li>
              <li><strong>数据清理</strong>：删除用户后，相关的操作记录会保留</li>
            </ul>
            <div class="guide-warning">
              <el-icon><Warning /></el-icon>
              <span>警告：删除操作不可恢复，请谨慎操作！</span>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
          <el-button v-else type="primary" @click="handleGuideFinish">完成</el-button>
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Delete, Plus, QuestionFilled, User, Warning, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getRoles } from '@/api/system/role';
import {
  checkEmailExists,
  checkPhoneExists,
  checkUsernameExists,
  createUser,
  deleteUser,
  getUserList,
  updateUser,
  updateUserStatus,
} from '@/api/system/user';
import PageLayout from '@/components/base/PageLayout.vue';
import TableSkeleton from '@/components/base/TableSkeleton.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('users');

const loading = ref(false);
const users = ref([]);
const roles = ref([]);
const selectedUsers = ref([]);
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentStep = ref(0);
const addLoading = ref(false);
const editLoading = ref(false);
const currentUser = ref({});

const handleShowOperationGuide = () => {
  guideDialogVisible.value = true;
  currentStep.value = 0;
};

const handleGuideFinish = () => {
  guideDialogVisible.value = false;
  currentStep.value = 0;
};

const addFormRef = ref(null);
const editFormRef = ref(null);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 搜索表单
const searchForm = reactive({
  keyword: '',
  roleId: '',
  status: '',
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '搜索用户名/姓名',
    md: 8,
    lg: 6,
    clearable: true,
    prefixIcon: 'Search',
  },
  {
    prop: 'roleId',
    label: '角色',
    type: 'select',
    placeholder: '请选择角色',
    md: 8,
    lg: 6,
    clearable: true,
    options: Array.isArray(roles.value)
      ? roles.value.map((role) => ({ label: role.roleName || role.name, value: role.id }))
      : [],
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
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ],
  },
]);

// 筛选配置

const addForm = reactive({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  roleId: null,
  isActive: 1,
  remark: '',
});

const editForm = reactive({
  id: null,
  username: '',
  realName: '',
  email: '',
  phone: '',
  roleId: null,
  isActive: 1,
  remark: '',
});

const addRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      validator: async (rule, value, callback) => {
        if (value) {
          try {
            const response = await checkUsernameExists(value);
            if (response.success && response.data) {
              callback(new Error('用户名已存在'));
            } else {
              callback();
            }
          } catch (error) {
            logger.error('检查用户名存在性失败:', error);
            callback(new Error('检查用户名存在性失败'));
          }
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '真实姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur',
    },
    {
      validator: async (rule, value, callback) => {
        if (value) {
          try {
            const response = await checkEmailExists(value);
            if (response.success && response.data) {
              callback(new Error('邮箱已存在'));
            } else {
              callback();
            }
          } catch (error) {
            logger.error('检查邮箱存在性失败:', error);
            callback(new Error('检查邮箱存在性失败'));
          }
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur',
    },
    {
      validator: async (rule, value, callback) => {
        if (value) {
          try {
            const response = await checkPhoneExists(value);
            if (response.success && response.data) {
              callback(new Error('手机号码已存在'));
            } else {
              callback();
            }
          } catch (error) {
            logger.error('检查手机号码存在性失败:', error);
            callback(new Error('检查手机号码存在性失败'));
          }
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const editRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const loadUsers = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
    };
    const response = await getUserList(params);
    if (response.success || response.code === 200) {
      users.value = response.data.content || response.data || [];
      pagination.total = response.data.totalElements || response.data.total || 0;
    }
  } catch (error) {
    logger.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const loadRoles = async () => {
  try {
    const response = await getRoles();
    if (response.success || response.code === 200) {
      const { data } = response;
      if (Array.isArray(data)) {
        roles.value = data;
      } else if (data && Array.isArray(data.content)) {
        roles.value = data.content;
      } else if (data && Array.isArray(data.list)) {
        roles.value = data.list;
      } else if (data && Array.isArray(data.items)) {
        roles.value = data.items;
      } else {
        roles.value = [];
      }
    } else {
      roles.value = [];
    }
  } catch (error) {
    logger.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败');
    roles.value = [];
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  loadUsers();
};

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  loadUsers();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadUsers();
};

const openAddDialog = () => {
  resetAddForm();
  addDialogVisible.value = true;
};

const openEditDialog = (user) => {
  Object.assign(editForm, {
    id: user.id,
    username: user.username,
    realName: user.realName,
    email: user.email,
    phone: user.phone,
    roleId: user.roleId || user.role,
    isActive: user.isActive,
    remark: user.remark,
  });
  editDialogVisible.value = true;
};

const openDetailDialog = (user) => {
  currentUser.value = { ...user };
  detailDialogVisible.value = true;
};

const handleAddUser = async () => {
  if (!addFormRef.value) {
    return;
  }

  try {
    await addFormRef.value.validate();
    addLoading.value = true;

    const response = await createUser(addForm);
    if (response.success || response.code === 200) {
      ElMessage.success('添加用户成功');
      addDialogVisible.value = false;
      resetAddForm();
      await loadUsers();
    } else {
      ElMessage.error(response.message || '添加用户失败');
    }
  } catch (error) {
    logger.error('添加用户失败:', error);
    if (error !== false) {
      ElMessage.error('添加用户失败');
    }
  } finally {
    addLoading.value = false;
  }
};

const handleEditUser = async () => {
  if (!editFormRef.value) {
    return;
  }

  try {
    await editFormRef.value.validate();
    editLoading.value = true;

    const response = await updateUser(editForm.id, editForm);
    if (response.success || response.code === 200) {
      ElMessage.success('更新用户成功');
      editDialogVisible.value = false;
      await loadUsers();
    } else {
      ElMessage.error(response.message || '更新用户失败');
    }
  } catch (error) {
    logger.error('更新用户失败:', error);
    if (error !== false) {
      ElMessage.error('更新用户失败');
    }
  } finally {
    editLoading.value = false;
  }
};

const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${user.username}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteUser(user.id);
    if (response.success || response.code === 200) {
      ElMessage.success('删除用户成功');
      await loadUsers();
    } else {
      ElMessage.error(response.message || '删除用户失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
    }
  }
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const userIds = selectedUsers.value.map((user) => user.id);
    const response = await deleteUser(userIds[0]);

    if (response.success || response.code === 200) {
      ElMessage.success('批量删除成功');
      await loadUsers();
    } else {
      ElMessage.error(response.message || '批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

const toggleUserStatus = async (user) => {
  const originalStatus = user.isActive;
  try {
    const response = await updateUserStatus(user.id, user.isActive);
    if (response.success || response.code === 200) {
      ElMessage.success('更新状态成功');
    } else {
      user.isActive = originalStatus;
      ElMessage.error(response.message || '更新状态失败');
    }
  } catch (error) {
    user.isActive = originalStatus;
    logger.error('更新用户状态失败:', error);
    ElMessage.error('更新状态失败');
  }
};

const resetAddForm = () => {
  Object.assign(addForm, {
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    roleId: null,
    isActive: 1,
    remark: '',
  });
  if (addFormRef.value) {
    addFormRef.value.clearValidate();
  }
};

const formatCreateTime = (date) => {
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

onMounted(() => {
  loadUsers();
  loadRoles();
});
</script>

<style scoped>
.users-container {
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

/* 表格操作按钮样式 */
.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
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

.users-toolbar {
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

.users-content {
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

:deep(.el-table) {
  margin-top: 0;
}

:deep(.el-descriptions) {
  margin-top: var(--spacing-5);
}

:deep(.el-descriptions__label) {
  font-weight: var(--font-weight-semibold);
  background: var(--slate-50);
}

.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 300px;
}

.guide-item h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #303133;
}

.guide-item p {
  margin: 0 0 15px;
  color: #606266;
  line-height: 1.6;
}

.guide-item ul {
  margin: 0 0 20px;
  padding-left: 20px;
}

.guide-item li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.guide-item li strong {
  color: #303133;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ecf5ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  color: #606266;
}

.guide-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef0f0;
  border-left: 4px solid #f56c6c;
  border-radius: 4px;
  color: #606266;
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
