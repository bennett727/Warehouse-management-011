import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getOutboundOrderList(params) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_LIST,
    method: 'get',
    params,
  });
}

export function getOutboundOrderDetail(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_DETAIL(id),
    method: 'get',
  });
}

export function createOutboundOrder(data) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_SAVE,
    method: 'post',
    data,
  });
}

export function updateOutboundOrder(id, data) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_UPDATE(id),
    method: 'put',
    data,
  });
}

export function deleteOutboundOrder(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_OUTBOUND_DELETE(id),
    method: 'delete',
  });
}

export function generateOutboundOrderNo() {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_GENERATE_NO,
    method: 'get',
    params: {
      type: 'OUTBOUND',
    },
  });
}

export function auditOutboundOrder(id, status, auditId) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_AUDIT(id),
    method: 'post',
    params: {
      status,
      auditId,
    },
  });
}

export function submitOutboundOrder(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_AUDIT(id),
    method: 'post',
    params: {
      status: 1,
    },
  });
}

export function executeOutboundOrder(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_AUDIT(id),
    method: 'post',
    params: {
      status: 3,
    },
  });
}
