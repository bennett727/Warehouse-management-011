import { INVENTORY_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getStockTransferList(params) {
  return request({
    url: INVENTORY_API.STOCK_TRANSFER,
    method: 'get',
    params,
  });
}

export function getStockTransferDetail(id) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/${id}`,
    method: 'get',
  });
}

export function createStockTransfer(data) {
  return request({
    url: INVENTORY_API.STOCK_TRANSFER,
    method: 'post',
    data,
  });
}

export function updateStockTransfer(id, data) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/${id}`,
    method: 'put',
    data,
  });
}

export function deleteStockTransfer(id) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/${id}`,
    method: 'delete',
  });
}

export function approveStockTransfer(id, data) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/${id}/approve`,
    method: 'post',
    data,
  });
}

export function rejectStockTransfer(id, data) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/${id}/reject`,
    method: 'post',
    data,
  });
}

export function completeStockTransfer(id) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/${id}/complete`,
    method: 'post',
  });
}

export function exportStockTransfer(params) {
  return request({
    url: `${INVENTORY_API.STOCK_TRANSFER}/export`,
    method: 'get',
    params,
    responseType: 'blob',
  });
}
