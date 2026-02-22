import { INSTALLATION_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export default {
  getInstallationList(params) {
    return request({
      url: INSTALLATION_API.LIST,
      method: 'get',
      params,
    });
  },

  getInstallationDetail(id) {
    return request({
      url: INSTALLATION_API.DETAIL(id),
      method: 'get',
    });
  },

  createInstallationRecord(data) {
    return request({
      url: INSTALLATION_API.CREATE,
      method: 'post',
      data,
    });
  },

  updateInstallationRecord(id, data) {
    return request({
      url: INSTALLATION_API.UPDATE(id),
      method: 'put',
      data,
    });
  },

  deleteInstallationRecord(id) {
    return request({
      url: INSTALLATION_API.DELETE(id),
      method: 'delete',
    });
  },

  batchDeleteInstallationRecords(ids) {
    return request({
      url: `${INSTALLATION_API.BASE}/batch-delete`,
      method: 'post',
      data: { ids },
    });
  },

  batchCreateInstallationRecords(data) {
    return request({
      url: `${INSTALLATION_API.BASE}/batch-create`,
      method: 'post',
      data,
    });
  },

  updateInstallationStatus(id, status) {
    return request({
      url: `${INSTALLATION_API.DETAIL(id)}/status`,
      method: 'patch',
      data: { status },
    });
  },

  exportInstallationRecords(params) {
    return request({
      url: `${INSTALLATION_API.BASE}/export`,
      method: 'get',
      params,
      responseType: 'blob',
    });
  },

  getInstallationStatistics(params) {
    return request({
      url: `${INSTALLATION_API.BASE}/statistics`,
      method: 'get',
      params,
    });
  },

  getInstallationsByDevice(deviceId) {
    // 使用专门的设备安装记录查询接口
    return request({
      url: `${INSTALLATION_API.BASE}/device/${deviceId}`,
      method: 'get',
    });
  },

  getInstallationByDeviceIds(deviceIds) {
    return request({
      url: `${INSTALLATION_API.BASE}/device-records`,
      method: 'post',
      data: { deviceIds },
    });
  },
};
