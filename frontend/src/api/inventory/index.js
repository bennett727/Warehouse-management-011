/**
 * 库存管理 API 统一导出
 * 从各个子模块导出库存相关的 API 函数
 */

// 从 inventoryAudit.js 导出盘点相关 API
export {
  createInventoryAudit,
  startInventoryAudit,
  recordAuditItem,
  adjustInventoryByAudit,
  getAuditItems,
  getAuditDifferences,
  getInventoryAuditList,
  cancelInventoryAudit,
  completeInventoryAudit,
} from './inventoryAudit';

// 从 inbound.js 导出入库相关 API
export {
  getInboundOrderList,
  getInboundOrderDetail,
  createInboundOrder,
  updateInboundOrder,
  deleteInboundOrder,
  generateInboundOrderNo,
  auditInboundOrder,
  submitInboundOrder,
  executeInboundOrder,
} from './inbound';

// 从 outbound.js 导出出库相关 API
export {
  getOutboundOrderList,
  getOutboundOrderDetail,
  createOutboundOrder,
  updateOutboundOrder,
  deleteOutboundOrder,
  generateOutboundOrderNo,
  auditOutboundOrder,
  submitOutboundOrder,
  executeOutboundOrder,
} from './outbound';

// 从 records.js 导出库存记录相关 API
export {
  getAllInventoryRecords,
  getInventoryRecordsStatistics,
  getInboundRecords,
  getOutboundRecords,
  getReturnRecords,
  getRecordDetail,
  exportInventoryRecords,
} from './records';

// 从 warehouse.js 导出仓库相关 API
export {
  getWarehouseOverviewStats,
  getWarehouseList,
  getWarehouseDetail,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseInventoryStats,
  getWarehouseZones,
  updateWarehouseAddress,
  getWarehousesByDivision,
  getActiveWarehouses,
} from './warehouse';

// 从 alertThreshold.js 导出预警阈值相关 API
export {
  getAlertThresholds,
  getAlertThresholdDetail,
  createAlertThreshold,
  updateAlertThreshold,
  deleteAlertThreshold,
} from './alertThreshold';

// 从 alertConfig.js 导出预警配置相关 API
export {
  getAlertConfigList,
  getAlertConfigDetail,
  createAlertConfig,
  updateAlertConfig,
  deleteAlertConfig,
} from './alertConfig';

// 从 stockTransfer.js 导出库存调拨相关 API
export {
  getStockTransferList,
  getStockTransferDetail,
  createStockTransfer,
  updateStockTransfer,
  deleteStockTransfer,
  approveStockTransfer,
  rejectStockTransfer,
  completeStockTransfer,
  exportStockTransfer,
} from './stockTransfer';

// 从 stockCount.js 导出库存统计相关 API
export {
  getStockCountList,
  getStockCountDetail,
  createStockCount,
  updateStockCount,
  deleteStockCount,
  approveStockCount,
  rejectStockCount,
  completeStockCount,
  startStockCount,
  exportStockCount,
  importStockCount,
  getStockCountDifferences,
  createInventoryAdjustment,
  getInventoryAdjustmentList,
  getInventoryAdjustmentDetail,
  approveInventoryAdjustment,
} from './stockCount';

// 从 batch.js 导出批次相关 API
export * from './batch';

// 从 area.js 导出区域相关 API
export * from './area';

// 从 bin.js 导出货位相关 API
export * from './bin';

// 从 inventory.js 导出库存基础 API
export * from './inventory';
