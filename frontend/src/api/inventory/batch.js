import request from '../../utils/request';

import { INVENTORY_API } from '@/constants/apiConstants';

export const batchManagementApi = {
  getBatchList: (params) => {
    return request({
      url: INVENTORY_API.BATCH,
      method: 'get',
      params,
    });
  },

  getBatchById: (id) => {
    return request({
      url: INVENTORY_API.BATCH_CODE(id),
      method: 'get',
    });
  },

  createBatch: (data) => {
    return request({
      url: INVENTORY_API.BATCH,
      method: 'post',
      data,
    });
  },

  updateBatch: (id, data) => {
    return request({
      url: INVENTORY_API.BATCH_CODE(id),
      method: 'put',
      data,
    });
  },

  deleteBatch: (id) => {
    return request({
      url: INVENTORY_API.BATCH_CODE(id),
      method: 'delete',
    });
  },

  getBatchByCode: (batchCode) => {
    return request({
      url: INVENTORY_API.BATCH_CODE(batchCode),
      method: 'get',
    });
  },

  getBatchByDevice: (deviceId) => {
    return request({
      url: INVENTORY_API.BATCH_DEVICE(deviceId),
      method: 'get',
    });
  },

  checkBatchCodeUnique: (batchCode, excludeId = null) => {
    return request({
      url: INVENTORY_API.BATCH_CHECK_CODE,
      method: 'get',
      params: { batchCode, excludeId },
    });
  },

  getBatchStatistics: (params) => {
    return request({
      url: INVENTORY_API.BATCH_STATISTICS,
      method: 'get',
      params,
    });
  },

  getBatchExpiringSoon: (days = 30) => {
    return request({
      url: INVENTORY_API.BATCH_EXPIRING_SOON,
      method: 'get',
      params: { days },
    });
  },

  getBatchExpired: () => {
    return request({
      url: INVENTORY_API.BATCH_EXPIRED,
      method: 'get',
    });
  },

  freezeBatch: (id, reason) => {
    return request({
      url: INVENTORY_API.BATCH_FREEZE(id),
      method: 'post',
      data: { reason },
    });
  },

  unfreezeBatch: (id, reason) => {
    return request({
      url: INVENTORY_API.BATCH_UNFREEZE(id),
      method: 'post',
      data: { reason },
    });
  },

  transferBatch: (id, targetLocationId) => {
    return request({
      url: INVENTORY_API.BATCH_TRANSFER(id),
      method: 'post',
      data: { targetLocationId },
    });
  },
};
