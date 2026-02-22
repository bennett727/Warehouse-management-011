import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export const generateReturnNo = () => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_GENERATE_NO,
    method: 'get',
    params: {
      type: 'RETURN',
    },
  });
};

export const saveDeviceReturn = (data) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_SAVE,
    method: 'post',
    data: {
      ...data,
      orderType: 'OUTBOUND',
      purpose: 'RETURN',
    },
  });
};

export const getReturnList = (params) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_LIST,
    method: 'get',
    params: {
      ...params,
      purpose: 'RETURN',
    },
  });
};

export const getReturnDetail = (id) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_DETAIL(id),
    method: 'get',
  });
};

export const deleteReturn = (id) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_DELETE(id),
    method: 'delete',
  });
};

export const approveReturn = (id) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_AUDIT(id),
    method: 'post',
    data: {
      status: 'APPROVED',
    },
  });
};

export const rejectReturn = (id, reason) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_AUDIT(id),
    method: 'post',
    data: {
      status: 'REJECTED',
      reason,
    },
  });
};

export const batchApproveReturn = (ids) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_BATCH_AUDIT,
    method: 'post',
    data: {
      ids,
      status: 'APPROVED',
    },
  });
};

export const batchRejectReturn = (ids, reason) => {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_BATCH_AUDIT,
    method: 'post',
    data: {
      ids,
      status: 'REJECTED',
      reason,
    },
  });
};
