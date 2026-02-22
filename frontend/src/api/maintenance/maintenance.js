import { MAINTENANCE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getMaintenanceRecordsByPage(params) {
  return request({
    url: MAINTENANCE_API.LIST,
    method: 'get',
    params,
  });
}

export function getMaintenanceDetail(id) {
  return request({
    url: `${MAINTENANCE_API.DETAIL(id)}`,
    method: 'get',
  });
}

export function saveMaintenanceRecord(data) {
  return request({
    url: MAINTENANCE_API.SAVE,
    method: 'post',
    data,
  });
}

export function updateMaintenanceRecord(id, data) {
  return request({
    url: MAINTENANCE_API.UPDATE(id),
    method: 'put',
    data,
  });
}

export function deleteMaintenanceRecord(id) {
  return request({
    url: MAINTENANCE_API.DELETE(id),
    method: 'delete',
  });
}

export function batchDeleteMaintenanceRecords(ids) {
  return request({
    url: MAINTENANCE_API.BATCH_DELETE,
    method: 'delete',
    data: { ids },
  });
}

export function getDeviceMaintenanceHistory(deviceId, params) {
  return request({
    url: MAINTENANCE_API.DEVICE(deviceId),
    method: 'get',
    params,
  });
}

export function completeMaintenance(id, data) {
  return request({
    url: MAINTENANCE_API.COMPLETE(id),
    method: 'post',
    data,
  });
}

export function generateMaintenanceNumber() {
  return request({
    url: MAINTENANCE_API.GENERATE_NUMBER,
    method: 'get',
  });
}

export function exportMaintenanceRecords(params) {
  return request({
    url: MAINTENANCE_API.EXPORT,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

export default {
  getMaintenanceRecordsByPage,
  getMaintenanceDetail,
  saveMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  batchDeleteMaintenanceRecords,
  getDeviceMaintenanceHistory,
  completeMaintenance,
  generateMaintenanceNumber,
  exportMaintenanceRecords,
};
