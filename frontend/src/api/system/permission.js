import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export const getPermissions = (params) => {
  return request({
    url: SYSTEM_API.PERMISSIONS,
    method: 'get',
    params,
  });
};

export const getPermissionTree = () => {
  return request({
    url: SYSTEM_API.PERMISSION_TREE,
    method: 'get',
  });
};

export const createPermission = (permission) => {
  return request({
    url: SYSTEM_API.PERMISSIONS,
    method: 'post',
    data: permission,
  });
};

export const updatePermission = (id, permission) => {
  return request({
    url: `${SYSTEM_API.PERMISSIONS}/${id}`,
    method: 'put',
    data: permission,
  });
};

export const deletePermission = (id) => {
  return request({
    url: `${SYSTEM_API.PERMISSIONS}/${id}`,
    method: 'delete',
  });
};

export const getPermissionById = (id) => {
  return request({
    url: `${SYSTEM_API.PERMISSIONS}/${id}`,
    method: 'get',
  });
};

export const batchDeletePermissions = (ids) => {
  return request({
    url: SYSTEM_API.ROLES_PERMISSIONS_BATCH_DELETE,
    method: 'post',
    data: ids,
  });
};

export const getPermissionTypes = () => {
  return request({
    url: SYSTEM_API.ROLES_PERMISSIONS_TYPES,
    method: 'get',
  });
};

export const movePermission = (id, params) => {
  return request({
    url: SYSTEM_API.ROLES_PERMISSIONS_MOVE(id),
    method: 'put',
    data: params,
  });
};
