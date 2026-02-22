/**
 * @file: inventory.js
 * @description: 库存管理相关工具函数，提供数据格式化、验证和常量定义
 * @author: 开发团队
 * @createTime: 2026-01-07
 * @version: 1.0.0
 */

import { createLogger } from './logger.js';

const logger = createLogger('inventory');

export const OPERATION_TYPE_MAP = {
  PURCHASE_INBOUND: '采购入库',
  INSTALLATION_OUTBOUND: '安装出库',
  REPAIR_RETURN: '维修归还',
  RETURN_INBOUND: '退货入库',
  TRANSFER_OUTBOUND: '调拨出库',
  TRANSFER_INBOUND: '调拨入库',
  LOSS_OUTBOUND: '损耗出库',
  OTHER_INBOUND: '其他入库',
  OTHER_OUTBOUND: '其他出库',
};

export const OPERATION_STATUS_MAP = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  FAILED: '失败',
  PENDING_INBOUND: '待入库',
};

export const WAREHOUSE_STATUS_MAP = {
  AVAILABLE: '可用',
  LOCKED: '锁定',
  MAINTENANCE: '维护中',
  DISABLED: '禁用',
};

export const DEVICE_STATUS_MAP = {
  pending_inbound: '待入库',
  inventory: '在库',
  installed: '已安装',
  repair: '维修中',
  scrapped: '已报废',
};

export const getOperationTypeLabel = (type) => {
  return OPERATION_TYPE_MAP[type] || type;
};

export const getOperationStatusLabel = (status) => {
  return OPERATION_STATUS_MAP[status] || status;
};

export const getWarehouseStatusLabel = (status) => {
  return WAREHOUSE_STATUS_MAP[status] || status;
};

export const getDeviceStatusLabel = (status) => {
  return DEVICE_STATUS_MAP[status] || status;
};

export const getDeviceStatusColor = (status) => {
  const colorMap = {
    pending_inbound: 'warning',
    inventory: 'success',
    installed: 'primary',
    repair: 'danger',
    scrapped: 'info',
  };

  return colorMap[status] || 'info';
};

export const getDeviceStatusTagType = (status) => {
  return getDeviceStatusColor(status);
};

export const getDeviceStatusText = (status) => {
  return getDeviceStatusLabel(status);
};

export const getOperationTypeOptions = () => {
  return Object.entries(OPERATION_TYPE_MAP).map(([value, label]) => ({
    label,
    value,
  }));
};

export const getOperationStatusOptions = () => {
  return Object.entries(OPERATION_STATUS_MAP).map(([value, label]) => ({
    label,
    value,
  }));
};

export const getWarehouseStatusOptions = () => {
  return Object.entries(WAREHOUSE_STATUS_MAP).map(([value, label]) => ({
    label,
    value,
  }));
};

export const formatInventoryRecord = (record) => {
  if (!record) {
    return null;
  }

  return {
    ...record,
    operationTypeLabel: getOperationTypeLabel(record.operationType),
    operationStatusLabel: getOperationStatusLabel(record.status),
    formattedDate: formatDate(record.operationDate),
    formattedTime: formatTime(record.operationDate),
  };
};

export const formatDate = (date) => {
  if (!date) {
    return '';
  }

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatTime = (date) => {
  if (!date) {
    return '';
  }

  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

export const formatDateTime = (date) => {
  if (!date) {
    return '';
  }

  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '0.00';
  }

  return Number(amount).toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) {
    return '0';
  }

  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const validateStockQuantity = (quantity, availableStock) => {
  if (quantity === null || quantity === undefined || quantity === '') {
    return {
      valid: false,
      message: '数量不能为空',
    };
  }

  const numQuantity = Number(quantity);

  if (isNaN(numQuantity) || numQuantity <= 0) {
    return {
      valid: false,
      message: '数量必须大于0',
    };
  }

  if (!Number.isInteger(numQuantity)) {
    return {
      valid: false,
      message: '数量必须为整数',
    };
  }

  if (availableStock !== undefined && numQuantity > availableStock) {
    return {
      valid: false,
      message: `数量不能超过可用库存 ${availableStock}`,
    };
  }

  return {
    valid: true,
    message: '',
  };
};

export const validateOperationDate = (date) => {
  if (!date) {
    return {
      valid: false,
      message: '操作日期不能为空',
    };
  }

  const operationDate = new Date(date);
  const now = new Date();

  if (operationDate > now) {
    return {
      valid: false,
      message: '操作日期不能大于当前日期',
    };
  }

  return {
    valid: true,
    message: '',
  };
};

export const calculateStockChange = (records, operationType) => {
  return records.reduce((total, record) => {
    if (record.operationType === operationType) {
      return total + (record.quantity || 0);
    }
    return total;
  }, 0);
};

export const calculateTotalStock = (records) => {
  const inboundRecords = records.filter(
    (r) => r.operationType.includes('INBOUND') || r.operationType === 'REPAIR_RETURN'
  );
  const outboundRecords = records.filter((r) => r.operationType.includes('OUTBOUND'));

  const totalInbound = inboundRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const totalOutbound = outboundRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);

  return totalInbound - totalOutbound;
};

export const groupRecordsByDate = (records) => {
  const grouped = {};

  records.forEach((record) => {
    const date = formatDate(record.operationDate);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });

  return grouped;
};

export const groupRecordsByDevice = (records) => {
  const grouped = {};

  records.forEach((record) => {
    const deviceCode = record.deviceCode || 'unknown';
    if (!grouped[deviceCode]) {
      grouped[deviceCode] = [];
    }
    grouped[deviceCode].push(record);
  });

  return grouped;
};

export const getOperationTypeColor = (type) => {
  const colorMap = {
    PURCHASE_INBOUND: 'success',
    INSTALLATION_OUTBOUND: 'warning',
    REPAIR_RETURN: 'info',
    RETURN_INBOUND: 'primary',
    TRANSFER_OUTBOUND: 'warning',
    TRANSFER_INBOUND: 'success',
    LOSS_OUTBOUND: 'danger',
    OTHER_INBOUND: 'success',
    OTHER_OUTBOUND: 'warning',
  };

  return colorMap[type] || 'info';
};

export const getOperationTypeTagType = (type) => {
  return getOperationTypeColor(type);
};

export const getOperationTypeText = (type) => {
  return getOperationTypeLabel(type);
};

export const getOperationStatusColor = (status) => {
  const colorMap = {
    PENDING: 'info',
    PROCESSING: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'info',
    FAILED: 'danger',
    PENDING_INBOUND: 'warning',
  };

  return colorMap[status] || 'info';
};

export const getStatusTagType = (status) => {
  return getOperationStatusColor(status);
};

export const getStatusText = (status) => {
  return getOperationStatusLabel(status);
};

export const filterRecordsByDateRange = (records, startDate, endDate) => {
  if (!startDate && !endDate) {
    return records;
  }

  return records.filter((record) => {
    const recordDate = new Date(record.operationDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && recordDate < start) {
      return false;
    }
    if (end && recordDate > end) {
      return false;
    }

    return true;
  });
};

export const filterRecordsByType = (records, types) => {
  if (!types || types.length === 0) {
    return records;
  }

  return records.filter((record) => types.includes(record.operationType));
};

export const filterRecordsByStatus = (records, statuses) => {
  if (!statuses || statuses.length === 0) {
    return records;
  }

  return records.filter((record) => statuses.includes(record.status));
};

export const sortRecordsByDate = (records, order = 'desc') => {
  return [...records].sort((a, b) => {
    const dateA = new Date(a.operationDate);
    const dateB = new Date(b.operationDate);

    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    logger.warn('没有数据可导出');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `export_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateBatchImportTemplate = () => {
  const template = {
    deviceCode: '设备编号',
    deviceName: '设备名称',
    quantity: '数量',
    warehouse: '仓库',
    operator: '操作人',
    remark: '备注',
  };

  return template;
};

export const parseBatchImportData = (data, operationType) => {
  return data.map((row, index) => ({
    ...row,
    operationType,
    rowIndex: index + 1,
  }));
};

export const validateBatchImportData = (data) => {
  const errors = [];

  data.forEach((row, index) => {
    if (!row.deviceCode) {
      errors.push({
        row: index + 1,
        field: 'deviceCode',
        message: '设备编号不能为空',
      });
    }

    if (!row.quantity || row.quantity <= 0) {
      errors.push({
        row: index + 1,
        field: 'quantity',
        message: '数量必须大于0',
      });
    }
  });

  return errors;
};

export const getInventorySummary = (records) => {
  const summary = {
    totalRecords: records.length,
    totalInbound: 0,
    totalOutbound: 0,
    currentStock: 0,
    operationTypeStats: {},
    statusStats: {},
  };

  records.forEach((record) => {
    const quantity = record.quantity || 0;

    if (record.operationType.includes('INBOUND') || record.operationType === 'REPAIR_RETURN') {
      summary.totalInbound += quantity;
    } else if (record.operationType.includes('OUTBOUND')) {
      summary.totalOutbound += quantity;
    }

    if (!summary.operationTypeStats[record.operationType]) {
      summary.operationTypeStats[record.operationType] = 0;
    }
    summary.operationTypeStats[record.operationType] += quantity;

    if (!summary.statusStats[record.status]) {
      summary.statusStats[record.status] = 0;
    }
    summary.statusStats[record.status]++;
  });

  summary.currentStock = summary.totalInbound - summary.totalOutbound;

  return summary;
};

export const formatArea = (record) => {
  if (!record) {
    return '';
  }

  const parts = [];

  if (record.areaName) {
    parts.push(record.areaName);
  }

  if (record.location) {
    parts.push(record.location);
  }

  if (record.cityName) {
    parts.unshift(record.cityName);
  }

  if (record.districtName) {
    parts.unshift(record.districtName);
  }

  return parts.join(' - ') || '-';
};

export default {
  OPERATION_TYPE_MAP,
  OPERATION_STATUS_MAP,
  WAREHOUSE_STATUS_MAP,
  DEVICE_STATUS_MAP,
  getOperationTypeLabel,
  getOperationStatusLabel,
  getWarehouseStatusLabel,
  getDeviceStatusLabel,
  getDeviceStatusColor,
  getDeviceStatusTagType,
  getDeviceStatusText,
  getOperationTypeOptions,
  getOperationStatusOptions,
  getWarehouseStatusOptions,
  formatInventoryRecord,
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatNumber,
  validateStockQuantity,
  validateOperationDate,
  calculateStockChange,
  calculateTotalStock,
  groupRecordsByDate,
  groupRecordsByDevice,
  getOperationTypeColor,
  getOperationTypeTagType,
  getOperationTypeText,
  getOperationStatusColor,
  getStatusTagType,
  getStatusText,
  filterRecordsByDateRange,
  filterRecordsByType,
  filterRecordsByStatus,
  sortRecordsByDate,
  exportToCSV,
  generateBatchImportTemplate,
  parseBatchImportData,
  validateBatchImportData,
  getInventorySummary,
  formatArea,
};
