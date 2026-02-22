import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export const getRoles = (params) => {
  return request({
    url: SYSTEM_API.ROLES,
    method: 'get',
    params,
  });
};

export const createRole = (data) => {
  return request({
    url: SYSTEM_API.ROLES,
    method: 'post',
    data,
  });
};

export const updateRole = (id, data) => {
  return request({
    url: `${SYSTEM_API.ROLES}/${id}`,
    method: 'put',
    data,
  });
};

export const deleteRole = (id) => {
  return request({
    url: `${SYSTEM_API.ROLES}/${id}`,
    method: 'delete',
  });
};

export const getRolePermissions = (roleId) => {
  return request({
    url: `${SYSTEM_API.ROLES}/${roleId}/permissions`,
    method: 'get',
  });
};

export const updateRolePermissions = (roleId, permissionIds) => {
  return request({
    url: `${SYSTEM_API.ROLES}/${roleId}/permissions`,
    method: 'put',
    data: { permissionIds },
  });
};
