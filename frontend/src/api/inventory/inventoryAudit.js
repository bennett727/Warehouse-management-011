import { INVENTORY_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export function createInventoryAudit(auditType, auditDate) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.CREATE,
    method: 'post',
    params: {
      auditType,
      auditDate,
    },
  });
}

export function startInventoryAudit(auditId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.START(auditId),
    method: 'post',
  });
}

export function recordAuditItem(itemId, actualQuantity, notes) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.RECORD(itemId),
    method: 'post',
    params: {
      actualQuantity,
      notes,
    },
  });
}

export function adjustInventoryByAudit(itemId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.ADJUST(itemId),
    method: 'post',
  });
}

export function getAuditItems(auditId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.ITEMS(auditId),
    method: 'get',
  });
}

export function getAuditDifferences(auditId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.DIFFERENCES(auditId),
    method: 'get',
  });
}

export function getInventoryAuditList(params) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.LIST,
    method: 'get',
    params,
  });
}

export function getInventoryAuditDetail(auditId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.DETAIL(auditId),
    method: 'get',
  });
}

export function cancelInventoryAudit(auditId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.CANCEL(auditId),
    method: 'post',
  });
}

export function completeInventoryAudit(auditId) {
  return request({
    url: INVENTORY_API.INVENTORY_AUDIT.COMPLETE(auditId),
    method: 'post',
  });
}
