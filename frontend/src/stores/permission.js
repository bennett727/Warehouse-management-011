import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import {
  batchDeletePermissions,
  createPermission,
  deletePermission,
  getPermissionById as getPermissionByIdApi,
  getPermissions,
  getPermissionTree,
  getPermissionTypes,
  movePermission,
  updatePermission,
} from '@/api/system/permission';

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref([]);
  const permissionTree = ref([]);
  const permissionsByParent = ref({});
  const total = ref(0);
  const currentPermission = ref(null);
  const permissionTypes = ref([]);
  const visitedRoutes = ref([]);

  const operationLoading = ref({
    list: false,
    tree: false,
    create: false,
    update: false,
    delete: false,
    batchDelete: false,
    move: false,
    detail: false,
    types: false,
  });

  // 计算属性
  const getPermissionsByParentId = computed(() => (parentId) => {
    return permissionsByParent.value[parentId] || [];
  });

  const getPermissionById = computed(() => (id) => {
    return permissions.value.find((permission) => permission.id === id) || null;
  });

  // 格式化权限树
  const formatPermissionTree = (treeData) => {
    return treeData.map((item) => {
      const formattedItem = {
        ...item,
        label: item.name,
        children: item.children ? formatPermissionTree(item.children) : [],
      };
      return formattedItem;
    });
  };

  // 将权限列表转换为树形结构
  const buildPermissionTree = (permissionList, parentId = null) => {
    const tree = [];
    permissionList.forEach((permission) => {
      if (permission.parentId === parentId) {
        const children = buildPermissionTree(permissionList, permission.id);
        const node = {
          ...permission,
          children: children.length > 0 ? children : null,
        };
        tree.push(node);
      }
    });
    return tree;
  };

  // 按父ID分组权限
  const groupPermissionsByParent = (permissionList) => {
    const groups = {};
    permissionList.forEach((permission) => {
      const parentId = permission.parentId || null;
      if (!groups[parentId]) {
        groups[parentId] = [];
      }
      groups[parentId].push(permission);
    });
    return groups;
  };

  // 展开权限树为扁平列表
  const flattenPermissionTree = (tree) => {
    let flattened = [];
    tree.forEach((node) => {
      flattened.push(node);
      if (node.children && node.children.length > 0) {
        flattened = flattened.concat(flattenPermissionTree(node.children));
      }
    });
    return flattened;
  };

  const fetchPermissions = async (params = {}) => {
    operationLoading.value.list = true;
    try {
      const response = await getPermissions(params);
      permissions.value = response.data.content || [];
      total.value = response.data.totalElements || 0;
      permissionsByParent.value = groupPermissionsByParent(permissions.value);
      return response;
    } finally {
      operationLoading.value.list = false;
    }
  };

  const fetchPermissionTree = async () => {
    operationLoading.value.tree = true;
    try {
      const response = await getPermissionTree();
      permissionTree.value = formatPermissionTree(response.data);
      permissions.value = flattenPermissionTree(response.data);
      permissionsByParent.value = groupPermissionsByParent(permissions.value);
      return response;
    } finally {
      operationLoading.value.tree = false;
    }
  };

  const createPermissionAction = async (permissionData) => {
    operationLoading.value.create = true;
    try {
      const response = await createPermission(permissionData);
      await fetchPermissions();
      await fetchPermissionTree();
      return response;
    } finally {
      operationLoading.value.create = false;
    }
  };

  const updatePermissionAction = async (id, permissionData) => {
    operationLoading.value.update = true;
    try {
      const response = await updatePermission(id, permissionData);
      await fetchPermissions();
      await fetchPermissionTree();
      if (currentPermission.value && currentPermission.value.id === id) {
        currentPermission.value = response.data;
      }
      return response;
    } finally {
      operationLoading.value.update = false;
    }
  };

  const deletePermissionAction = async (id) => {
    operationLoading.value.delete = true;
    try {
      const response = await deletePermission(id);
      await fetchPermissions();
      await fetchPermissionTree();
      if (currentPermission.value && currentPermission.value.id === id) {
        currentPermission.value = null;
      }
      return response;
    } finally {
      operationLoading.value.delete = false;
    }
  };

  const batchDeletePermissionsAction = async (ids) => {
    operationLoading.value.batchDelete = true;
    try {
      const response = await batchDeletePermissions(ids);
      await fetchPermissions();
      await fetchPermissionTree();
      if (currentPermission.value && ids.includes(currentPermission.value.id)) {
        currentPermission.value = null;
      }
      return response;
    } finally {
      operationLoading.value.batchDelete = false;
    }
  };

  const getPermissionDetail = async (id) => {
    operationLoading.value.detail = true;
    try {
      const response = await getPermissionByIdApi(id);
      currentPermission.value = response.data;
      return response;
    } finally {
      operationLoading.value.detail = false;
    }
  };

  const movePermissionAction = async (id, params) => {
    operationLoading.value.move = true;
    try {
      const response = await movePermission(id, params);
      await fetchPermissions();
      await fetchPermissionTree();
      return response;
    } finally {
      operationLoading.value.move = false;
    }
  };

  const fetchPermissionTypes = async () => {
    operationLoading.value.types = true;
    try {
      const response = await getPermissionTypes();
      permissionTypes.value = response.data;
      return response;
    } finally {
      operationLoading.value.types = false;
    }
  };

  // 重置当前权限
  const resetCurrentPermission = () => {
    currentPermission.value = null;
  };

  // 初始化权限数据
  const initializePermissions = async () => {
    await Promise.all([fetchPermissionTree(), fetchPermissionTypes()]);
  };

  // 添加访问的路由记录
  const addVisitedRoute = (route) => {
    if (!route) {
      return;
    }

    const existingIndex = visitedRoutes.value.findIndex((r) => r.path === route.path && r.name === route.name);

    if (existingIndex !== -1) {
      visitedRoutes.value.splice(existingIndex, 1);
    }

    visitedRoutes.value.unshift({
      path: route.path,
      name: route.name,
      title: route.meta?.title || route.name,
      timestamp: Date.now(),
    });

    if (visitedRoutes.value.length > 10) {
      visitedRoutes.value = visitedRoutes.value.slice(0, 10);
    }
  };

  // 清空访问记录
  const clearVisitedRoutes = () => {
    visitedRoutes.value = [];
  };

  return {
    permissions,
    permissionTree,
    permissionsByParent,
    operationLoading,
    total,
    currentPermission,
    permissionTypes,
    visitedRoutes,
    getPermissionsByParentId,
    getPermissionById,
    fetchPermissions,
    fetchPermissionTree,
    createPermission: createPermissionAction,
    updatePermission: updatePermissionAction,
    deletePermission: deletePermissionAction,
    getPermissionDetail,
    batchDeletePermissions: batchDeletePermissionsAction,
    movePermission: movePermissionAction,
    fetchPermissionTypes,
    resetCurrentPermission,
    initializePermissions,
    formatPermissionTree,
    buildPermissionTree,
    groupPermissionsByParent,
    flattenPermissionTree,
    addVisitedRoute,
    clearVisitedRoutes,
  };
});
