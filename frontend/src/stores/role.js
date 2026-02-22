import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import {
  createRole,
  deleteRole,
  getRolePermissions,
  getRoles,
  updateRole,
  updateRolePermissions,
} from '@/api/system/role';
import { PAGINATION } from '@/constants';
import { createLogger } from '@/utils/logger';
import { handleErrorMessage } from '@/utils/responseHandler';

const logger = createLogger('role');

export const useRoleStore = defineStore('role', () => {
  const roles = ref([]);
  const total = ref(0);
  const currentRole = ref(null);
  const rolePermissions = ref([]);

  const operationLoading = ref({
    list: false,
    create: false,
    update: false,
    delete: false,
    permissions: false,
    updatePermissions: false,
  });

  const searchForm = ref({
    roleName: '',
    status: '',
  });

  const pagination = reactive({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  const getRoleById = computed(() => (id) => {
    return roles.value.find((role) => role.id === id) || null;
  });

  const fetchRoles = async (params = {}) => {
    operationLoading.value.list = true;
    try {
      const queryParams = {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...searchForm.value,
        ...params,
      };

      const response = await getRoles(queryParams);

      if (response.success) {
        roles.value = response.data.list || response.data.items || [];
        pagination.total = response.data.total || 0;
        total.value = pagination.total;
      } else {
        ElMessage.error(response.message || '获取角色列表失败');
        roles.value = [];
        pagination.total = 0;
        total.value = 0;
      }
      return response;
    } catch (error) {
      logger.error('获取角色列表失败:', error);
      ElMessage.error(handleErrorMessage(error, '获取角色列表失败'));
      roles.value = [];
      pagination.total = 0;
      total.value = 0;
      throw error;
    } finally {
      operationLoading.value.list = false;
    }
  };

  const createRoleAction = async (roleData) => {
    operationLoading.value.create = true;
    try {
      const response = await createRole(roleData);

      if (response.success) {
        ElMessage.success('创建角色成功');
        await fetchRoles();
        return response;
      }
      throw new Error(response.message || '创建角色失败');
    } catch (error) {
      logger.error('创建角色失败:', error);
      ElMessage.error(handleErrorMessage(error, '创建角色失败'));
      throw error;
    } finally {
      operationLoading.value.create = false;
    }
  };

  const updateRoleAction = async (id, roleData) => {
    operationLoading.value.update = true;
    try {
      const response = await updateRole(id, roleData);

      if (response.success) {
        ElMessage.success('更新角色成功');
        await fetchRoles();
        if (currentRole.value && currentRole.value.id === id) {
          currentRole.value = { ...currentRole.value, ...roleData };
        }
        return response;
      }
      throw new Error(response.message || '更新角色失败');
    } catch (error) {
      logger.error('更新角色失败:', error);
      ElMessage.error(handleErrorMessage(error, '更新角色失败'));
      throw error;
    } finally {
      operationLoading.value.update = false;
    }
  };

  const deleteRoleAction = async (id) => {
    operationLoading.value.delete = true;
    try {
      const response = await deleteRole(id);

      if (response.success) {
        ElMessage.success('删除角色成功');
        const index = roles.value.findIndex((role) => role.id === id);
        if (index > -1) {
          roles.value.splice(index, 1);
          pagination.total--;
          total.value--;
        }
        if (currentRole.value && currentRole.value.id === id) {
          currentRole.value = null;
        }
        return response;
      }
      throw new Error(response.message || '删除角色失败');
    } catch (error) {
      logger.error('删除角色失败:', error);
      ElMessage.error(handleErrorMessage(error, '删除角色失败'));
      throw error;
    } finally {
      operationLoading.value.delete = false;
    }
  };

  const fetchRolePermissions = async (roleId) => {
    operationLoading.value.permissions = true;
    try {
      const response = await getRolePermissions(roleId);

      if (response.success) {
        rolePermissions.value = response.data || [];
        return response;
      }
      throw new Error(response.message || '获取角色权限失败');
    } catch (error) {
      logger.error('获取角色权限失败:', error);
      ElMessage.error(handleErrorMessage(error, '获取角色权限失败'));
      throw error;
    } finally {
      operationLoading.value.permissions = false;
    }
  };

  const updateRolePermissionsAction = async (roleId, permissionIds) => {
    operationLoading.value.updatePermissions = true;
    try {
      const response = await updateRolePermissions(roleId, permissionIds);

      if (response.success) {
        ElMessage.success('权限设置保存成功');
        return response;
      }
      throw new Error(response.message || '保存权限设置失败');
    } catch (error) {
      logger.error('保存权限设置失败:', error);
      ElMessage.error(handleErrorMessage(error, '保存权限设置失败'));
      throw error;
    } finally {
      operationLoading.value.updatePermissions = false;
    }
  };

  const updateRoleStatus = async (id, status) => {
    operationLoading.value.update = true;
    try {
      const response = await updateRole(id, { status });

      if (response.success) {
        ElMessage.success(`角色${status === 1 ? '已启用' : '已禁用'}`);
        const role = roles.value.find((r) => r.id === id);
        if (role) {
          role.status = status;
        }
        return response;
      }
      throw new Error(response.message || '状态更新失败');
    } catch (error) {
      logger.error('更新角色状态失败:', error);
      ElMessage.error(handleErrorMessage(error, '更新角色状态失败'));
      throw error;
    } finally {
      operationLoading.value.update = false;
    }
  };

  const setSearchForm = (form) => {
    Object.assign(searchForm.value, form);
  };

  const resetSearchForm = () => {
    Object.assign(searchForm.value, {
      roleName: '',
      status: '',
    });
  };

  const setPagination = (pageData) => {
    Object.assign(pagination, pageData);
  };

  const resetPagination = () => {
    Object.assign(pagination, {
      currentPage: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
    });
  };

  const setCurrentRole = (role) => {
    currentRole.value = role;
  };

  const resetCurrentRole = () => {
    currentRole.value = null;
  };

  return {
    roles,
    total,
    currentRole,
    rolePermissions,
    operationLoading,
    searchForm,
    pagination,
    getRoleById,
    fetchRoles,
    createRole: createRoleAction,
    updateRole: updateRoleAction,
    deleteRole: deleteRoleAction,
    fetchRolePermissions,
    updateRolePermissions: updateRolePermissionsAction,
    updateRoleStatus,
    setSearchForm,
    resetSearchForm,
    setPagination,
    resetPagination,
    setCurrentRole,
    resetCurrentRole,
  };
});
