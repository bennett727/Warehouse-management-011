import { DEVICE_API, INVENTORY_API, SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getDeviceTypes() {
  return request({
    url: `${DEVICE_API.TYPE}`,
    method: 'get',
  });
}

export function getLocations() {
  return request({
    url: SYSTEM_API.DEVICES_LOCATIONS,
    method: 'get',
  });
}

export function stockIn(data) {
  return request({
    url: `${INVENTORY_API.STOCK_ORDERS_INBOUND}/save`,
    method: 'post',
    data,
  });
}

export function stockOut(data) {
  return request({
    url: `${INVENTORY_API.STOCK_ORDERS_OUTBOUND}/save`,
    method: 'post',
    data,
  });
}

export function deleteDevice(id) {
  return request({
    url: DEVICE_API.DELETE(id),
    method: 'delete',
  });
}

export function getInventoryStatistics() {
  return request({
    url: DEVICE_API.STATISTICS_STATUS,
    method: 'get',
  });
}

export function exportInventoryData(params) {
  return request({
    url: DEVICE_API.EXPORT,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

export function importInventoryData(data) {
  return request({
    url: DEVICE_API.IMPORT,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
