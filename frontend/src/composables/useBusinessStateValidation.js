import { ElMessage } from 'element-plus';

import {
  InstallationStatusColor,
  MaintenanceStatusColor,
  StockOrderPurposeColor,
  StockOrderStatusColor,
} from '../constants';
import { DeviceStatus, DeviceStatusMap } from '../constants/deviceStatus';
import {
  InstallationStatus,
  InstallationStatusMap,
  MaintenanceStatus,
  MaintenanceStatusMap,
} from '../constants/installationStatus';
import {
  StockOrderPurpose,
  StockOrderPurposeMap,
  StockOrderStatus,
  StockOrderStatusMap,
} from '../constants/stockOrderStatus';

export const useBusinessStateValidation = () => {
  const getDeviceStatusText = (status) => {
    return DeviceStatusMap[status] || '未知状态';
  };

  const getStockOrderStatusText = (status) => {
    return StockOrderStatusMap[status] || '未知状态';
  };

  const getStockOrderPurposeText = (purpose) => {
    return StockOrderPurposeMap[purpose] || '未知用途';
  };

  const getInstallationStatusText = (status) => {
    return InstallationStatusMap[status] || '未知状态';
  };

  const getMaintenanceStatusText = (status) => {
    return MaintenanceStatusMap[status] || '未知状态';
  };

  const validateDeviceStatusForInbound = (device) => {
    if (!device) {
      ElMessage.error('设备不能为空');
      return false;
    }

    const currentStatus = device.status;

    if (currentStatus === DeviceStatus.SCRAPPED) {
      ElMessage.error('已报废的设备不能入库');
      return false;
    }

    if (currentStatus === DeviceStatus.IN_STOCK) {
      ElMessage.error('设备已在库中，无需重复入库');
      return false;
    }

    return true;
  };

  const validateDeviceStatusForOutbound = (device, purpose) => {
    if (!device) {
      ElMessage.error('设备不能为空');
      return false;
    }

    const currentStatus = device.status;

    switch (purpose) {
      case StockOrderPurpose.INSTALL_OUT:
        if (currentStatus !== DeviceStatus.IN_STOCK) {
          ElMessage.error(`只有在库状态的设备才能进行安装出库，当前状态：${getDeviceStatusText(currentStatus)}`);
          return false;
        }
        break;

      case StockOrderPurpose.REPAIR_OUT:
        if (currentStatus !== DeviceStatus.IN_USE) {
          ElMessage.error(`只有使用中的设备才能进行维修出库，当前状态：${getDeviceStatusText(currentStatus)}`);
          return false;
        }
        break;

      case StockOrderPurpose.SCRAP:
        if (currentStatus === DeviceStatus.SCRAPPED) {
          ElMessage.error('已报废的设备不能再次报废');
          return false;
        }
        break;

      default:
        ElMessage.error(`未知的出库用途：${getStockOrderPurposeText(purpose)}`);
        return false;
    }

    return true;
  };

  const validateStockOrderStatusTransition = (currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) {
      ElMessage.error('订单状态已经是目标状态，无需变更');
      return false;
    }

    switch (currentStatus) {
      case StockOrderStatus.PENDING:
        if (
          targetStatus !== StockOrderStatus.APPROVED &&
          targetStatus !== StockOrderStatus.REJECTED &&
          targetStatus !== StockOrderStatus.CANCELLED
        ) {
          ElMessage.error('待审核状态的订单只能变更为已通过、已驳回或已取消状态');
          return false;
        }
        break;

      case StockOrderStatus.APPROVED:
        if (targetStatus !== StockOrderStatus.COMPLETED) {
          ElMessage.error('已通过状态的订单只能变更为已完成状态');
          return false;
        }
        break;

      case StockOrderStatus.COMPLETED:
      case StockOrderStatus.REJECTED:
      case StockOrderStatus.CANCELLED:
        ElMessage.error('已完成、已驳回或已取消的订单不能变更状态');
        return false;

      default:
        ElMessage.error(`未知的订单状态：${getStockOrderStatusText(currentStatus)}`);
        return false;
    }

    return true;
  };

  const validateDeviceStatusTransition = (currentStatus, targetStatus, reason) => {
    if (currentStatus === targetStatus) {
      ElMessage.error('设备状态已经是目标状态，无需变更');
      return false;
    }

    if (!reason || reason.trim() === '') {
      ElMessage.error('设备状态变更必须提供原因');
      return false;
    }

    switch (currentStatus) {
      case DeviceStatus.IN_STOCK:
        if (
          targetStatus !== DeviceStatus.IN_USE &&
          targetStatus !== DeviceStatus.MAINTENANCE &&
          targetStatus !== DeviceStatus.SCRAPPED
        ) {
          ElMessage.error('在库状态的设备只能变更为使用中、维护中或已报废状态');
          return false;
        }
        break;

      case DeviceStatus.IN_USE:
        if (
          targetStatus !== DeviceStatus.IN_STOCK &&
          targetStatus !== DeviceStatus.MAINTENANCE &&
          targetStatus !== DeviceStatus.SCRAPPED
        ) {
          ElMessage.error('使用中的设备只能变更为在库、维护中或已报废状态');
          return false;
        }
        break;

      case DeviceStatus.MAINTENANCE:
        if (targetStatus !== DeviceStatus.IN_STOCK && targetStatus !== DeviceStatus.SCRAPPED) {
          ElMessage.error('维护中的设备只能变更为在库或已报废状态');
          return false;
        }
        break;

      case DeviceStatus.SCRAPPED:
        ElMessage.error('已报废的设备不能变更状态');
        return false;

      default:
        ElMessage.error(`未知的设备状态：${getDeviceStatusText(currentStatus)}`);
        return false;
    }

    return true;
  };

  const validateStockOrderCompletion = (order) => {
    if (!order) {
      ElMessage.error('订单不能为空');
      return false;
    }

    if (order.status !== StockOrderStatus.APPROVED) {
      ElMessage.error(`只有已通过状态的订单才能完成，当前状态：${getStockOrderStatusText(order.status)}`);
      return false;
    }

    if (!order.items || order.items.length === 0) {
      ElMessage.error('订单必须包含至少一个设备');
      return false;
    }

    return true;
  };

  const validateBusinessDataIntegrity = (order, device) => {
    if (!order || !device) {
      ElMessage.error('订单和设备不能为空');
      return false;
    }

    if (order.orderType === 0) {
      if (device.status === DeviceStatus.IN_STOCK) {
        ElMessage.error('设备已在库中，不能重复入库');
        return false;
      }
    } else if (order.orderType === 1) {
      if (device.status !== DeviceStatus.IN_STOCK && order.purpose === StockOrderPurpose.INSTALL_OUT) {
        ElMessage.error('只有在库状态的设备才能进行安装出库');
        return false;
      }
      if (device.status !== DeviceStatus.IN_USE && order.purpose === StockOrderPurpose.REPAIR_OUT) {
        ElMessage.error('只有使用中的设备才能进行维修出库');
        return false;
      }
    }

    return true;
  };

  const canEditOrder = (order) => {
    // 支持数字和字符串类型的状态比较
    return order && Number(order.status) === StockOrderStatus.PENDING;
  };

  const canCompleteOrder = (order) => {
    // 支持数字和字符串类型的状态比较
    return order && Number(order.status) === StockOrderStatus.APPROVED;
  };

  const canDeleteOrder = (order) => {
    // 支持数字和字符串类型的状态比较
    return order && Number(order.status) === StockOrderStatus.PENDING;
  };

  const canAuditOrder = (order) => {
    // 支持数字和字符串类型的状态比较
    return order && Number(order.status) === StockOrderStatus.PENDING;
  };

  const canCancelOrder = (order) => {
    const status = Number(order?.status);
    return (
      order &&
      status !== StockOrderStatus.APPROVED &&
      status !== StockOrderStatus.COMPLETED &&
      status !== StockOrderStatus.CANCELLED
    );
  };

  const getDeviceStatusColor = (status) => {
    const colorMap = {
      [DeviceStatus.IN_STOCK]: 'success',
      [DeviceStatus.INSTALLED]: 'primary',
      [DeviceStatus.REPAIRING]: 'warning',
      [DeviceStatus.SCRAPPED]: 'danger',
    };
    return colorMap[status] || 'info';
  };

  const getStockOrderStatusColor = (status) => {
    return StockOrderStatusColor[status] || 'info';
  };

  const getStockOrderPurposeColor = (purpose) => {
    return StockOrderPurposeColor[purpose] || 'info';
  };

  const getInstallationStatusColor = (status) => {
    return InstallationStatusColor[status] || 'info';
  };

  const getMaintenanceStatusColor = (status) => {
    return MaintenanceStatusColor[status] || 'info';
  };

  return {
    DeviceStatus,
    StockOrderStatus,
    StockOrderPurpose,
    InstallationStatus,
    MaintenanceStatus,
    getDeviceStatusText,
    getStockOrderStatusText,
    getStockOrderPurposeText,
    getInstallationStatusText,
    getMaintenanceStatusText,
    validateDeviceStatusForInbound,
    validateDeviceStatusForOutbound,
    validateStockOrderStatusTransition,
    validateDeviceStatusTransition,
    validateStockOrderCompletion,
    validateBusinessDataIntegrity,
    canEditOrder,
    canCompleteOrder,
    canDeleteOrder,
    canAuditOrder,
    canCancelOrder,
    getDeviceStatusColor,
    getStockOrderStatusColor,
    getStockOrderPurposeColor,
    getInstallationStatusColor,
    getMaintenanceStatusColor,
  };
};
