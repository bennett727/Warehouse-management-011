import { INVENTORY_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getStockCountList(params) {
  return request({
    url: INVENTORY_API.STOCK_COUNT,
    method: 'get',
    params,
  });
}

export function getStockCountDetail(id) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}`,
    method: 'get',
  });
}

export function createStockCount(data) {
  return request({
    url: INVENTORY_API.STOCK_COUNT,
    method: 'post',
    data,
  });
}

export function updateStockCount(id, data) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}`,
    method: 'put',
    data,
  });
}

export function deleteStockCount(id) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}`,
    method: 'delete',
  });
}

export function approveStockCount(id, data) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}/approve`,
    method: 'post',
    data,
  });
}

export function rejectStockCount(id, data) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}/reject`,
    method: 'post',
    data,
  });
}

export function completeStockCount(id) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}/complete`,
    method: 'post',
  });
}

export function startStockCount(id) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}/start`,
    method: 'post',
  });
}

export function exportStockCount(params) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/export`,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

export function importStockCount(data) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/import`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function getStockCountDifferences(id) {
  return request({
    url: `${INVENTORY_API.STOCK_COUNT}/${id}/differences`,
    method: 'get',
  });
}

export function createInventoryAdjustment(data) {
  return request({
    url: INVENTORY_API.ADJUSTMENT_CREATE,
    method: 'post',
    data,
  });
}

export function getInventoryAdjustmentList(params) {
  return request({
    url: INVENTORY_API.ADJUSTMENT_LIST,
    method: 'get',
    params,
  });
}

export function getInventoryAdjustmentDetail(adjustmentId) {
  return request({
    url: INVENTORY_API.ADJUSTMENT_DETAIL(adjustmentId),
    method: 'get',
  });
}

export function approveInventoryAdjustment(adjustmentId, data) {
  return request({
    url: INVENTORY_API.ADJUSTMENT_APPROVE(adjustmentId),
    method: 'post',
    data,
  });
}
