import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getAreaList(params) {
  return request({
    url: SYSTEM_API.AREAS,
    method: 'get',
    params,
  });
}

export function getAreaTree(params) {
  return request({
    url: SYSTEM_API.AREA_TREE,
    method: 'get',
    params,
  });
}

export function getAreaById(id) {
  return request({
    url: `${SYSTEM_API.AREAS}/${id}`,
    method: 'get',
  });
}

export function getAreaDeviceCount(id) {
  return request({
    url: SYSTEM_API.AREA_DEVICE_COUNT(id),
    method: 'get',
  });
}

export function getSubAreas(parentId) {
  return request({
    url: SYSTEM_API.AREA_SUB_AREAS(parentId),
    method: 'get',
  });
}

export function getAreaPath(id) {
  return request({
    url: SYSTEM_API.AREA_PATH(id),
    method: 'get',
  });
}

export function checkAreaNameExists(name, excludeId) {
  return request({
    url: SYSTEM_API.AREA_CHECK_NAME,
    method: 'get',
    params: { name, excludeId },
  });
}

export function checkAreaCodeExists(code, excludeId) {
  return request({
    url: SYSTEM_API.AREA_CHECK_CODE,
    method: 'get',
    params: { code, excludeId },
  });
}

export function getAllCities() {
  return request({
    url: SYSTEM_API.AREA_CITIES,
    method: 'get',
  });
}

export function getDistrictsByCity(city) {
  return request({
    url: SYSTEM_API.AREA_DISTRICTS(city),
    method: 'get',
  });
}

export function getLocationsByCityAndDistrict(city, district) {
  return request({
    url: SYSTEM_API.AREA_LOCATIONS(city, district),
    method: 'get',
  });
}

export function getAreaStatistics(id) {
  return request({
    url: SYSTEM_API.AREA_STATISTICS(id),
    method: 'get',
  });
}

export function getAllAreas() {
  return request({
    url: SYSTEM_API.AREA_ALL,
    method: 'get',
  });
}

export function createArea(data) {
  return request({
    url: SYSTEM_API.AREAS,
    method: 'post',
    data,
  });
}

export function updateArea(id, data) {
  return request({
    url: `${SYSTEM_API.AREAS}/${id}`,
    method: 'put',
    data,
  });
}

export function deleteArea(id) {
  return request({
    url: `${SYSTEM_API.AREAS}/${id}`,
    method: 'delete',
  });
}

export function batchDeleteAreas(ids) {
  return request({
    url: SYSTEM_API.AREA_BATCH_DELETE,
    method: 'delete',
    data: { ids },
  });
}

export function batchUpdateAreaStatus(ids, status) {
  return request({
    url: SYSTEM_API.AREA_BATCH_UPDATE_STATUS,
    method: 'post',
    data: { ids, status },
  });
}

export function importAreas(data) {
  return request({
    url: SYSTEM_API.AREA_IMPORT,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  });
}

export function exportAreas(params) {
  return request({
    url: SYSTEM_API.AREA_EXPORT,
    method: 'get',
    params,
    responseType: 'blob',
  });
}
