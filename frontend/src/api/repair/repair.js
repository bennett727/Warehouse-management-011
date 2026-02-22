import { REPAIR_RECORD_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getRepairList(params) {
  return request({
    url: REPAIR_RECORD_API.LIST,
    method: 'get',
    params,
  });
}

export function getRepairDetail(id) {
  return request({
    url: REPAIR_RECORD_API.DETAIL(id),
    method: 'get',
  });
}

export function addRepair(data) {
  return request({
    url: REPAIR_RECORD_API.CREATE,
    method: 'post',
    data,
  });
}

export function updateRepair(id, data) {
  return request({
    url: REPAIR_RECORD_API.UPDATE(id),
    method: 'put',
    data,
  });
}

export function deleteRepair(id) {
  return request({
    url: REPAIR_RECORD_API.DELETE(id),
    method: 'delete',
  });
}

export function completeRepair(id, data) {
  return request({
    url: REPAIR_RECORD_API.COMPLETE(id),
    method: 'post',
    data,
  });
}

export function getDeviceRepairHistory(deviceId, params) {
  return request({
    url: REPAIR_RECORD_API.DEVICE_HISTORY(deviceId),
    method: 'get',
    params,
  });
}

export function getRepairStatistics() {
  return request({
    url: REPAIR_RECORD_API.STATISTICS,
    method: 'get',
  });
}

export default {
  getRepairList,
  getRepairDetail,
  addRepair,
  updateRepair,
  deleteRepair,
  completeRepair,
  getDeviceRepairHistory,
  getRepairStatistics,
};
