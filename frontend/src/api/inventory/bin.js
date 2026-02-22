import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export const getBinList = (params = {}) => {
  return request({
    url: SYSTEM_API.BIN_LIST,
    method: 'get',
    params,
  });
};

export const getBinDetail = (id) => {
  return request({
    url: SYSTEM_API.BIN_DETAIL(id),
    method: 'get',
  });
};

export const addBin = (data) => {
  return request({
    url: SYSTEM_API.BIN_ADD,
    method: 'post',
    data,
  });
};

export const updateBin = (id, data) => {
  return request({
    url: SYSTEM_API.BIN_UPDATE(id),
    method: 'put',
    data,
  });
};

export const deleteBin = (id) => {
  return request({
    url: SYSTEM_API.BIN_DELETE(id),
    method: 'delete',
  });
};

export const getAvailableBins = (params = {}) => {
  return request({
    url: SYSTEM_API.BIN_AVAILABLE,
    method: 'get',
    params,
  });
};

export const batchCreateBins = (data) => {
  return request({
    url: SYSTEM_API.BIN_BATCH_CREATE,
    method: 'post',
    data,
  });
};

export const getBinStatistics = (params = {}) => {
  return request({
    url: SYSTEM_API.BIN_STATISTICS,
    method: 'get',
    params,
  });
};

export const exportBins = (params = {}) => {
  return request({
    url: SYSTEM_API.BIN_EXPORT,
    method: 'get',
    params,
    responseType: 'blob',
  });
};

export const importBins = (formData) => {
  return request({
    url: SYSTEM_API.BIN_IMPORT,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
