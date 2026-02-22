/**
 * 库存订单状态常量
 * 定义入库、出库、调拨等库存订单的状态
 */

export const StockOrderStatus = {
  PENDING: 0,
  PROCESSING: 1,
  APPROVED: 2,
  COMPLETED: 3,
  REJECTED: 4,
  CANCELLED: 5,
};

export const StockOrderStatusMap = {
  [StockOrderStatus.PENDING]: '待审核',
  [StockOrderStatus.PROCESSING]: '处理中',
  [StockOrderStatus.APPROVED]: '已通过',
  [StockOrderStatus.COMPLETED]: '已完成',
  [StockOrderStatus.REJECTED]: '已驳回',
  [StockOrderStatus.CANCELLED]: '已取消',
};

export const StockOrderPurpose = {
  NEW: 0,
  INSTALL_OUT: 1,
  REPAIR_OUT: 2,
  RETURN: 3,
  SCRAP: 4,
};

export const StockOrderPurposeMap = {
  [StockOrderPurpose.NEW]: '新设备入库',
  [StockOrderPurpose.INSTALL_OUT]: '安装出库',
  [StockOrderPurpose.REPAIR_OUT]: '维修出库',
  [StockOrderPurpose.RETURN]: '归还入库',
  [StockOrderPurpose.SCRAP]: '报废出库',
};

export const StockOrderStatusColor = {
  [StockOrderStatus.PENDING]: 'warning',
  [StockOrderStatus.PROCESSING]: 'primary',
  [StockOrderStatus.APPROVED]: 'success',
  [StockOrderStatus.COMPLETED]: 'success',
  [StockOrderStatus.REJECTED]: 'danger',
  [StockOrderStatus.CANCELLED]: 'info',
};

export const StockOrderPurposeColor = {
  [StockOrderPurpose.NEW]: 'primary',
  [StockOrderPurpose.INSTALL_OUT]: 'warning',
  [StockOrderPurpose.REPAIR_OUT]: 'danger',
  [StockOrderPurpose.RETURN]: 'info',
  [StockOrderPurpose.SCRAP]: 'danger',
};
