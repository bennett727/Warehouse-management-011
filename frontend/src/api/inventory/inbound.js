import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getInboundOrderList(params) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_INBOUND_LIST,
    method: 'get',
    params,
  });
}

export function getInboundOrderDetail(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_INBOUND_DETAIL(id),
    method: 'get',
  });
}

export function createInboundOrder(data) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_INBOUND_SAVE,
    method: 'post',
    data,
  });
}

export function updateInboundOrder(id, data) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_INBOUND_UPDATE(id),
    method: 'put',
    data,
  });
}

export function deleteInboundOrder(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_INBOUND_DELETE(id),
    method: 'delete',
  });
}

export function generateInboundOrderNo() {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_GENERATE_NO,
    method: 'get',
    params: {
      type: 'INBOUND',
    },
  });
}

export function auditInboundOrder(id, status, auditId) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_AUDIT(id),
    method: 'post',
    params: {
      status,
      auditId,
    },
  });
}

export function submitInboundOrder(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_SUBMIT(id),
    method: 'post',
  });
}

export function executeInboundOrder(id) {
  return request({
    url: SYSTEM_API.STOCK_ORDERS_EXECUTE(id),
    method: 'post',
  });
}
