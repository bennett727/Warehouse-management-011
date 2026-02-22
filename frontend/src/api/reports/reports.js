import { REPORTS_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function getDeviceReport(params) {
  return request({
    url: REPORTS_API.DEVICE,
    method: 'get',
    params,
  });
}

export function getInventoryReport(params) {
  return request({
    url: REPORTS_API.INVENTORY,
    method: 'get',
    params,
  });
}

export function getMaintenanceReport(params) {
  return request({
    url: REPORTS_API.MAINTENANCE,
    method: 'get',
    params,
  });
}

export function getOutboundReport(params) {
  return request({
    url: REPORTS_API.OUTBOUND,
    method: 'get',
    params,
  });
}

export function getInboundReport(params) {
  return request({
    url: REPORTS_API.INBOUND,
    method: 'get',
    params,
  });
}

export function getDeviceStatistics(params) {
  return request({
    url: REPORTS_API.DEVICE_STATISTICS,
    method: 'get',
    params,
  });
}

export function getInventoryStatistics(params) {
  return request({
    url: REPORTS_API.INVENTORY_STATISTICS,
    method: 'get',
    params,
  });
}

export function exportDeviceReport(params) {
  return request({
    url: REPORTS_API.EXPORT_DEVICE,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

export function exportInventoryReport(params) {
  return request({
    url: REPORTS_API.EXPORT_INVENTORY,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

export function exportMaintenanceReport(params) {
  return request({
    url: REPORTS_API.EXPORT_MAINTENANCE,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

export default {
  getDeviceReport,
  getInventoryReport,
  getMaintenanceReport,
  getOutboundReport,
  getInboundReport,
  getDeviceStatistics,
  getInventoryStatistics,
  exportDeviceReport,
  exportInventoryReport,
  exportMaintenanceReport,
};
