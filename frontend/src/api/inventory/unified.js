import { STOCK_ORDERS_UNIFIED_API } from '@/constants/apiConstants';
import request from '@/utils/request';

export const inventoryApi = {
  generateOrderNumber: (type) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.GENERATE_NO,
      method: 'get',
      params: { type },
    });
  },

  saveOrder: (data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.SAVE,
      method: 'post',
      data,
    });
  },

  getOrderList: (params) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.LIST,
      method: 'get',
      params,
    });
  },

  getOrderDetail: (id) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.DETAIL(id),
      method: 'get',
    });
  },

  updateOrder: (id, data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.UPDATE(id),
      method: 'put',
      data,
    });
  },

  deleteOrder: (id) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.DELETE(id),
      method: 'delete',
    });
  },

  batchDeleteOrders: (ids) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.BATCH_DELETE,
      method: 'post',
      data: { ids },
    });
  },

  auditOrder: (id, data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.AUDIT(id),
      method: 'post',
      data,
    });
  },

  batchAuditOrders: (data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.BATCH_AUDIT,
      method: 'post',
      data,
    });
  },

  exportOrders: (params) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.EXPORT,
      method: 'get',
      params,
      responseType: 'blob',
    });
  },

  getOrderStatistics: (params) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.STATISTICS,
      method: 'get',
      params,
    });
  },

  validateInventory: (data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.VALIDATE_INVENTORY,
      method: 'post',
      data,
    });
  },

  // ==================== 订单流程接口 ====================

  /**
   * 提交订单审核
   * @param {number} id - 订单ID
   * @param {object} data - 提交数据 { operatorId }
   * @returns {Promise}
   */
  submitOrder: (id, data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.SUBMIT(id),
      method: 'post',
      data,
    });
  },

  /**
   * 审核订单
   * @param {number} id - 订单ID
   * @param {object} data - 审核数据 { approved, approverId, remark }
   * @returns {Promise}
   */
  approveOrder: (id, data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.AUDIT(id),
      method: 'post',
      data,
    });
  },

  /**
   * 执行订单
   * @param {number} id - 订单ID
   * @param {object} data - 执行数据
   * @returns {Promise}
   */
  executeOrder: (id, data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.EXECUTE(id),
      method: 'post',
      data,
    });
  },

  /**
   * 取消订单
   * @param {number} id - 订单ID
   * @param {object} data - 取消数据 { reason }
   * @returns {Promise}
   */
  cancelOrder: (id, data) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.CANCEL(id),
      method: 'post',
      data,
    });
  },

  /**
   * 获取订单明细
   * @param {number} id - 订单ID
   * @returns {Promise}
   */
  getOrderItems: (id) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.ITEMS(id),
      method: 'get',
    });
  },

  /**
   * 根据订单号查询订单
   * @param {string} orderNo - 订单号
   * @returns {Promise}
   */
  getOrderByNo: (orderNo) => {
    return request({
      url: STOCK_ORDERS_UNIFIED_API.BY_NO(orderNo),
      method: 'get',
    });
  },
};

export const inboundApi = {
  generateInboundNumber: () => {
    return inventoryApi.generateOrderNumber('INBOUND');
  },

  saveInbound: (data) => {
    return inventoryApi.saveOrder({
      ...data,
      orderType: 'INBOUND',
    });
  },

  getInboundList: (params) => {
    return inventoryApi.getOrderList({
      ...params,
      orderType: 'INBOUND',
    });
  },

  getInboundDetail: (id) => {
    return inventoryApi.getOrderDetail(id);
  },

  updateInbound: (id, data) => {
    return inventoryApi.updateOrder(id, data);
  },

  deleteInbound: (id) => {
    return inventoryApi.deleteOrder(id);
  },

  batchDeleteInbounds: (ids) => {
    return inventoryApi.batchDeleteOrders(ids);
  },

  auditInbound: (id, data) => {
    return inventoryApi.auditOrder(id, data);
  },

  batchAuditInbounds: (data) => {
    return inventoryApi.batchAuditOrders(data);
  },

  exportInbounds: (params) => {
    return inventoryApi.exportOrders({
      ...params,
      orderType: 'INBOUND',
    });
  },

  getInboundStatistics: (params) => {
    return inventoryApi.getOrderStatistics({
      ...params,
      orderType: 'INBOUND',
    });
  },
};

export const outboundApi = {
  generateOutboundNumber: () => {
    return inventoryApi.generateOrderNumber('OUTBOUND');
  },

  saveOutbound: (data) => {
    return inventoryApi.saveOrder({
      ...data,
      orderType: 'OUTBOUND',
    });
  },

  getOutboundList: (params) => {
    return inventoryApi.getOrderList({
      ...params,
      orderType: 'OUTBOUND',
    });
  },

  getOutboundDetail: (id) => {
    return inventoryApi.getOrderDetail(id);
  },

  updateOutbound: (id, data) => {
    return inventoryApi.updateOrder(id, data);
  },

  deleteOutbound: (id) => {
    return inventoryApi.deleteOrder(id);
  },

  batchDeleteOutbounds: (ids) => {
    return inventoryApi.batchDeleteOrders(ids);
  },

  auditOutbound: (id, data) => {
    return inventoryApi.auditOrder(id, data);
  },

  batchAuditOutbounds: (data) => {
    return inventoryApi.batchAuditOrders(data);
  },

  exportOutbounds: (params) => {
    return inventoryApi.exportOrders({
      ...params,
      orderType: 'OUTBOUND',
    });
  },

  getOutboundStatistics: (params) => {
    return inventoryApi.getOrderStatistics({
      ...params,
      orderType: 'OUTBOUND',
    });
  },

  validateInventory: (data) => {
    return inventoryApi.validateInventory(data);
  },
};

export const returnApi = {
  generateReturnNumber: () => {
    return inventoryApi.generateOrderNumber('RETURN');
  },

  saveReturn: (data) => {
    return inventoryApi.saveOrder({
      ...data,
      orderType: 'OUTBOUND',
      purpose: 'RETURN',
    });
  },

  getReturnList: (params) => {
    return inventoryApi.getOrderList({
      ...params,
      orderType: 'OUTBOUND',
      purpose: 'RETURN',
    });
  },

  getReturnDetail: (id) => {
    return inventoryApi.getOrderDetail(id);
  },

  deleteReturn: (id) => {
    return inventoryApi.deleteOrder(id);
  },

  batchDeleteReturns: (ids) => {
    return inventoryApi.batchDeleteOrders(ids);
  },

  auditReturn: (id, data) => {
    return inventoryApi.auditOrder(id, data);
  },

  batchAuditReturns: (data) => {
    return inventoryApi.batchAuditOrders(data);
  },

  exportReturns: (params) => {
    return inventoryApi.exportOrders({
      ...params,
      orderType: 'OUTBOUND',
      purpose: 'RETURN',
    });
  },

  getReturnStatistics: (params) => {
    return inventoryApi.getOrderStatistics({
      ...params,
      orderType: 'OUTBOUND',
      purpose: 'RETURN',
    });
  },
};

export const recordApi = {
  getInboundRecords: (params) => {
    return inventoryApi.getOrderList({
      ...params,
      orderType: 'INBOUND',
    });
  },

  getOutboundRecords: (params) => {
    return inventoryApi.getOrderList({
      ...params,
      orderType: 'OUTBOUND',
    });
  },

  getReturnRecords: (params) => {
    return inventoryApi.getOrderList({
      ...params,
      orderType: 'OUTBOUND',
      purpose: 'RETURN',
    });
  },

  getRecordDetail: (id) => {
    return inventoryApi.getOrderDetail(id);
  },

  exportRecords: (params) => {
    return inventoryApi.exportOrders(params);
  },

  getStatistics: (params) => {
    return inventoryApi.getOrderStatistics(params);
  },
};

export default {
  inventory: inventoryApi,
  inbound: inboundApi,
  outbound: outboundApi,
  return: returnApi,
  record: recordApi,
};
