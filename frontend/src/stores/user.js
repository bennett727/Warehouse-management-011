import { ElMessage, ElMessageBox } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { getUserInfo, login, logout } from '@/api/auth/auth';
import {
  createUser,
  deleteUser,
  getAllRoles,
  getUserDetail,
  getUserList,
  updateUser,
  updateUserStatus,
} from '@/api/system/user';
import { PAGINATION } from '@/constants';
import { normalizeRoles } from '@/router/route-permissions.js';
import { formatDate } from '@/utils/date';
import { createLogger } from '@/utils/logger';
import { handleErrorMessage } from '@/utils/responseHandler';
import tokenManager from '@/utils/tokenManager';

const logger = createLogger('user');

const DEFAULT_USER_INFO = {
  userId: '',
  username: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  roles: [],
  permissions: [],
};

const restoreUserInfoFromStorage = () => {
  try {
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      logger.info('从localStorage恢复用户信息:', parsed.username);
      // 标准化角色数据，确保格式一致
      const rawRoles = Array.isArray(parsed.roles) ? parsed.roles : [];
      const normalizedRoles = normalizeRoles(rawRoles);
      return {
        ...DEFAULT_USER_INFO,
        ...parsed,
        roles: normalizedRoles,
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      };
    }
  } catch (error) {
    logger.error('从localStorage恢复用户信息失败:', error);
  }
  return null;
};

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const total = ref(0);
  const currentUser = ref(null);

  const restoredUserInfo = restoreUserInfoFromStorage();
  const userInfo = ref(restoredUserInfo || { ...DEFAULT_USER_INFO });

  const roles = ref([]);
  const token = ref(tokenManager.getAccessToken() || '');
  const refreshToken = ref(tokenManager.getRefreshToken() || '');

  const operationLoading = ref({
    list: false,
    create: false,
    update: false,
    delete: false,
    status: false,
    roles: false,
    detail: false,
  });

  const searchForm = ref({
    username: '',
    realName: '',
    roleId: '',
    status: '',
  });

  const pagination = reactive({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  const dialogVisible = reactive({
    add: false,
    edit: false,
    detail: false,
  });

  const formData = reactive({
    id: '',
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    roleId: '',
    status: 1,
    createTime: '',
  });

  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: '用户名只能包含字母、数字和下划线',
        trigger: 'blur',
      },
      {
        pattern: /^[a-zA-Z]/,
        message: '用户名必须以字母开头',
        trigger: 'blur',
      },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, max: 30, message: '密码长度在 8 到 30 个字符', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback();
            return;
          }
          if (!/[a-z]/.test(value)) {
            callback(new Error('密码必须包含至少一个小写字母'));
          } else if (!/[A-Z]/.test(value)) {
            callback(new Error('密码必须包含至少一个大写字母'));
          } else if (!/[0-9]/.test(value)) {
            callback(new Error('密码必须包含至少一个数字'));
          } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            callback(new Error('密码必须包含至少一个特殊字符'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
    realName: [
      { required: true, message: '请输入真实姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '真实姓名长度在 2 到 20 个字符', trigger: 'blur' },
      {
        pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
        message: '真实姓名只能包含中文、英文和空格',
        trigger: 'blur',
      },
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
      { max: 100, message: '邮箱地址不能超过100个字符', trigger: 'blur' },
    ],
    phone: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' },
    ],
    roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  };

  const getUserById = computed(() => (id) => {
    return users.value.find((user) => user.id === id) || null;
  });

  // 用户名计算属性
  const username = computed(() => userInfo.value?.username || '');

  // 用户头像计算属性
  const avatar = computed(() => userInfo.value?.avatar || '');

  const fetchUserList = async (params = {}) => {
    operationLoading.value.list = true;
    try {
      const queryParams = {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: searchForm.value.username || searchForm.value.realName || undefined,
        role: searchForm.value.roleId || undefined,
        status: searchForm.value.status !== '' ? searchForm.value.status : undefined,
        ...params,
      };

      const response = await getUserList(queryParams);

      if (response.code === 200) {
        users.value = response.data?.records || [];
        pagination.total = response.data?.total || 0;
        total.value = pagination.total;
      } else {
        ElMessage.error(response.message || '获取用户列表失败');
        users.value = [];
        pagination.total = 0;
        total.value = 0;
      }
      return response;
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      ElMessage.error(handleErrorMessage(error, '获取用户列表失败'));
      users.value = [];
      pagination.total = 0;
      total.value = 0;
      throw error;
    } finally {
      operationLoading.value.list = false;
    }
  };

  const fetchUserDetail = async (userId) => {
    operationLoading.value.detail = true;
    try {
      const response = await getUserDetail(userId);

      if (response.code === 200) {
        currentUser.value = response.data;
        return response.data;
      }
      ElMessage.error(response.message || '获取用户详情失败');
      currentUser.value = null;
      return null;
    } catch (error) {
      logger.error('获取用户详情失败:', error);
      ElMessage.error(handleErrorMessage(error, '获取用户详情失败'));
      currentUser.value = null;
      return null;
    } finally {
      operationLoading.value.detail = false;
    }
  };

  const fetchRoles = async () => {
    operationLoading.value.roles = true;
    try {
      const response = await getAllRoles();

      if (response.code === 200) {
        roles.value = response.data.list || [];
      } else {
        ElMessage.error(response.message || '获取角色列表失败');
        roles.value = [];
      }
      return response;
    } catch (error) {
      logger.error('获取角色列表失败:', error);
      ElMessage.error(handleErrorMessage(error, '获取角色列表失败'));
      roles.value = [];
      throw error;
    } finally {
      operationLoading.value.roles = false;
    }
  };

  const createUserAction = async (userData) => {
    operationLoading.value.create = true;
    try {
      const response = await createUser(userData);

      if (response.code === 200) {
        ElMessage.success('用户添加成功');
        await fetchUserList();
      } else {
        ElMessage.error(response.message || '添加用户失败');
      }
      return response;
    } catch (error) {
      logger.error('添加用户失败:', error);
      ElMessage.error(handleErrorMessage(error, '添加用户失败'));
      throw error;
    } finally {
      operationLoading.value.create = false;
    }
  };

  const updateUserAction = async (userId, userData) => {
    operationLoading.value.update = true;
    try {
      const response = await updateUser(userId, userData);

      if (response.code === 200) {
        ElMessage.success('用户更新成功');
        await fetchUserList();
      } else {
        ElMessage.error(response.message || '更新用户失败');
      }
      return response;
    } catch (error) {
      logger.error('更新用户失败:', error);
      ElMessage.error(handleErrorMessage(error, '更新用户失败'));
      throw error;
    } finally {
      operationLoading.value.update = false;
    }
  };

  const deleteUserAction = async (userId) => {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      operationLoading.value.delete = true;

      const response = await deleteUser(userId);

      if (response.code === 200) {
        ElMessage.success('用户删除成功');
        await fetchUserList();
      } else {
        ElMessage.error(response.message || '删除用户失败');
      }
      return response;
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('删除用户失败:', error);
        ElMessage.error(handleErrorMessage(error, '删除用户失败'));
      }
      throw error;
    } finally {
      operationLoading.value.delete = false;
    }
  };

  const updateUserStatusAction = async (userId, newStatus) => {
    try {
      const statusText = newStatus === 1 ? '启用' : '禁用';

      await ElMessageBox.confirm(`确定要${statusText}该用户吗？`, '状态变更', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      operationLoading.value.status = true;

      const response = await updateUserStatus(userId, newStatus);

      if (response.code === 200) {
        ElMessage.success(`${statusText}成功`);
        await fetchUserList();
      } else {
        ElMessage.error(response.message || '更新用户状态失败');
      }
      return response;
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('更新用户状态失败:', error);
        ElMessage.error(handleErrorMessage(error, '更新用户状态失败'));
      }
      throw error;
    } finally {
      operationLoading.value.status = false;
    }
  };

  const handleSearch = () => {
    pagination.currentPage = 1;
    return fetchUserList();
  };

  const handleReset = () => {
    Object.keys(searchForm.value).forEach((key) => {
      searchForm.value[key] = '';
    });
    pagination.currentPage = 1;
    return fetchUserList();
  };

  const handleSizeChange = (val) => {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    return fetchUserList();
  };

  const handleCurrentChange = (val) => {
    pagination.currentPage = val;
    return fetchUserList();
  };

  const openAddDialog = () => {
    dialogVisible.add = true;
    resetCurrentUser();
  };

  const openEditDialog = (row) => {
    dialogVisible.edit = true;
    Object.assign(formData, row);
  };

  const openDetailDialog = (row) => {
    dialogVisible.detail = true;
    Object.assign(formData, row);
  };

  const closeDialog = (dialogType) => {
    dialogVisible[dialogType] = false;
  };

  const closeAllDialogs = () => {
    dialogVisible.add = false;
    dialogVisible.edit = false;
    dialogVisible.detail = false;
  };

  const setSearchForm = (form) => {
    Object.assign(searchForm.value, form);
  };

  const resetSearchForm = () => {
    Object.keys(searchForm.value).forEach((key) => {
      searchForm.value[key] = '';
    });
    pagination.currentPage = 1;
  };

  const setPagination = (pageData) => {
    Object.assign(pagination, pageData);
  };

  const resetPagination = () => {
    pagination.currentPage = PAGINATION.DEFAULT_PAGE;
    pagination.pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
    pagination.total = 0;
  };

  const setCurrentUser = (user) => {
    Object.assign(formData, user);
    currentUser.value = { ...user };
  };

  const updateUserInfo = (info) => {
    if (!info) {
      return;
    }
    const currentUserInfo = userInfo.value || {};
    // 标准化角色数据，确保格式一致
    const rawRoles = info.roles || currentUserInfo.roles || [];
    const normalizedRoles = normalizeRoles(rawRoles);
    userInfo.value = {
      userId: info.userId || info.id || currentUserInfo.userId || '',
      username: info.username || currentUserInfo.username || '',
      realName: info.realName || currentUserInfo.realName || '',
      email: info.email || currentUserInfo.email || '',
      phone: info.phone || currentUserInfo.phone || '',
      avatar: info.avatar || currentUserInfo.avatar || '',
      roles: normalizedRoles,
      permissions: info.permissions || currentUserInfo.permissions || [],
    };
    try {
      localStorage.setItem('user_info', JSON.stringify(userInfo.value));
      // 同时存储兼容格式的用户数据，供其他组件使用
      const compatibleUser = {
        id: userInfo.value.userId,
        username: userInfo.value.username,
        realName: userInfo.value.realName,
        role: userInfo.value.roles[0] || '',
        roles: userInfo.value.roles,
        permissions: userInfo.value.permissions,
      };
      localStorage.setItem('user', JSON.stringify(compatibleUser));
      localStorage.setItem('userId', userInfo.value.userId);
    } catch (e) {
      logger.error('更新localStorage用户信息失败:', e);
    }
  };

  const resetCurrentUser = () => {
    formData.id = '';
    formData.username = '';
    formData.password = '';
    formData.realName = '';
    formData.email = '';
    formData.phone = '';
    formData.roleId = '';
    formData.status = 1;
    formData.createTime = '';
    currentUser.value = null;
  };

  const formatStatus = (status) => {
    return status === 1 ? '启用' : '禁用';
  };

  const formatCreateTime = (time) => {
    return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
  };

  /**
   * 等待Token保存完成的辅助函数
   * @param {number} maxAttempts - 最大尝试次数
   * @param {number} interval - 检查间隔（毫秒）
   * @returns {Promise<boolean>}
   */
  const waitForTokenStorage = async (maxAttempts = 10, interval = 100) => {
    for (let i = 0; i < maxAttempts; i++) {
      const storedToken = tokenManager.getAccessToken();
      if (storedToken && storedToken === token.value) {
        logger.info('Token保存确认成功');
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    logger.warn('Token保存确认超时');
    return false;
  };

  const loginUser = async (loginForm) => {
    try {
      logger.info('开始登录流程，用户名:', loginForm.username);

      const response = await login(loginForm);

      logger.info('登录API响应:', response);

      if (response.code === 200 && response.data) {
        // 后端返回的字段名可能是 accessToken 或 token
        const authToken = response.data.accessToken || response.data.token;
        const authRefreshToken = response.data.refreshToken;

        // 用户信息在userInfo对象中
        const userInfoData = response.data.userInfo || response.data;
        const { userId, id, username, realName, role, phone, permissions, roles: backendRoles } = userInfoData;

        if (!authToken) {
          logger.error('登录响应中未找到token字段');
          throw new Error('登录响应格式错误：缺少token');
        }

        logger.info('登录成功，保存令牌');

        // 先更新响应式状态
        token.value = authToken;

        // 保存到tokenManager
        tokenManager.setAccessToken(authToken);

        // 等待Token保存完成（添加确认机制）
        await waitForTokenStorage();

        if (authRefreshToken) {
          refreshToken.value = authRefreshToken;
          tokenManager.setRefreshToken(authRefreshToken);
          logger.info('刷新令牌已保存');
        }

        currentUser.value = {
          username,
          realName,
          roleName: role,
          phone,
          email: '',
        };

        let rolesToUse = [];
        if (backendRoles && backendRoles.length > 0) {
          rolesToUse = backendRoles;
        } else if (role) {
          rolesToUse = [role];
        }

        userInfo.value = {
          userId: userId || id || '',
          username: username || '',
          realName: realName || '',
          email: '',
          phone: phone || '',
          avatar: '',
          roles: normalizeRoles(rolesToUse),
          permissions: permissions || [],
        };

        // 将用户信息存储到localStorage，供路由守卫使用
        try {
          localStorage.setItem('user_info', JSON.stringify(userInfo.value));
          // 同时存储兼容格式的用户数据
          const compatibleUser = {
            id: userInfo.value.userId,
            username: userInfo.value.username,
            realName: userInfo.value.realName,
            role: userInfo.value.roles[0] || '',
            roles: userInfo.value.roles,
            permissions: userInfo.value.permissions,
          };
          localStorage.setItem('user', JSON.stringify(compatibleUser));
          localStorage.setItem('userId', userInfo.value.userId);
          logger.info('用户信息已存储到localStorage');
        } catch (e) {
          logger.error('存储用户信息到localStorage失败:', e);
        }

        logger.info('用户登录成功:', username);
        logger.info('用户角色:', userInfo.value.roles);
        return response;
      }
      logger.error('登录失败:', response.message || '未知错误');
      return response;
    } catch (error) {
      logger.error('登录过程中发生异常:', error);
      throw error;
    }
  };

  const fetchUserInfo = async () => {
    try {
      if (!token.value) {
        throw new Error('未找到访问令牌');
      }

      const response = await getUserInfo();

      if (response.code === 200 && response.data) {
        const { id, username, realName, role, phone, permissions, roles: backendRoles } = response.data;

        currentUser.value = {
          username,
          realName,
          roleName: role,
          phone,
          email: '',
        };

        let rolesToUse = [];
        if (backendRoles && backendRoles.length > 0) {
          rolesToUse = backendRoles;
        } else if (role) {
          rolesToUse = [role];
        }

        userInfo.value = {
          userId: id || '',
          username: username || '',
          realName: realName || '',
          email: '',
          phone: phone || '',
          avatar: '',
          roles: normalizeRoles(rolesToUse),
          permissions: permissions || [],
        };

        // 更新localStorage中的用户信息
        try {
          localStorage.setItem('user_info', JSON.stringify(userInfo.value));
          // 同时存储兼容格式的用户数据
          const compatibleUser = {
            id: userInfo.value.userId,
            username: userInfo.value.username,
            realName: userInfo.value.realName,
            role: userInfo.value.roles[0] || '',
            roles: userInfo.value.roles,
            permissions: userInfo.value.permissions,
          };
          localStorage.setItem('user', JSON.stringify(compatibleUser));
          localStorage.setItem('userId', userInfo.value.userId);
        } catch (e) {
          logger.error('更新localStorage用户信息失败:', e);
        }

        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('获取用户信息失败:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error('登出API调用失败:', error);
    } finally {
      token.value = '';
      refreshToken.value = '';
      userInfo.value = { ...DEFAULT_USER_INFO };
      currentUser.value = null;

      tokenManager.clearTokens();
      try {
        localStorage.removeItem('user_info');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      } catch (e) {
        logger.error('清除localStorage用户信息失败:', e);
      }
    }
  };

  const clearUserState = () => {
    token.value = '';
    refreshToken.value = '';
    userInfo.value = { ...DEFAULT_USER_INFO };
    currentUser.value = null;
    tokenManager.clearTokens();
    try {
      localStorage.removeItem('user_info');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    } catch (e) {
      logger.error('清除localStorage失败:', e);
    }
  };

  return {
    // State
    users,
    total,
    currentUser,
    userInfo,
    roles,
    token,
    refreshToken,
    operationLoading,
    searchForm,
    pagination,
    dialogVisible,
    formData,
    rules,

    // Getters
    getUserById,
    username,
    avatar,

    // Actions
    fetchUserList,
    fetchUserDetail,
    fetchRoles,
    createUserAction,
    updateUserAction,
    deleteUserAction,
    updateUserStatusAction,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    openAddDialog,
    openEditDialog,
    openDetailDialog,
    closeDialog,
    closeAllDialogs,
    setSearchForm,
    resetSearchForm,
    setPagination,
    resetPagination,
    setCurrentUser,
    resetCurrentUser,
    updateUserInfo,
    formatStatus,
    formatCreateTime,
    loginUser,
    fetchUserInfo,
    logoutUser,
    clearUserState,
  };
});
