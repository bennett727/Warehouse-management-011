/**
 * 调拨服务
 * 负责管理设备调拨的完整业务流程，与出入库系统紧密集成
 * @module transferService
 */

import inventoryLockManager from '@/utils/inventoryLockManager.js';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('transferService');

/**
 * 调拨状态枚举
 */
export const TRANSFER_STATUS = {
  DRAFT: 'draft', // 草稿
  PENDING: 'pending', // 待审核
  APPROVED: 'approved', // 已审核
  OUTBOUND: 'outbound', // 已出库
  INBOUND: 'inbound', // 已入库
  COMPLETED: 'completed', // 已完成
  CANCELLED: 'cancelled', // 已取消
};

/**
 * 调拨状态标签
 */
export const TRANSFER_STATUS_LABELS = {
  [TRANSFER_STATUS.DRAFT]: '草稿',
  [TRANSFER_STATUS.PENDING]: '待审核',
  [TRANSFER_STATUS.APPROVED]: '已审核',
  [TRANSFER_STATUS.OUTBOUND]: '已出库',
  [TRANSFER_STATUS.INBOUND]: '已入库',
  [TRANSFER_STATUS.COMPLETED]: '已完成',
  [TRANSFER_STATUS.CANCELLED]: '已取消',
};

/**
 * 调拨状态标签类型
 */
export const TRANSFER_STATUS_TAG_TYPES = {
  [TRANSFER_STATUS.DRAFT]: 'info',
  [TRANSFER_STATUS.PENDING]: 'warning',
  [TRANSFER_STATUS.APPROVED]: 'success',
  [TRANSFER_STATUS.OUTBOUND]: 'primary',
  [TRANSFER_STATUS.INBOUND]: 'primary',
  [TRANSFER_STATUS.COMPLETED]: 'success',
  [TRANSFER_STATUS.CANCELLED]: 'danger',
};

/**
 * 调拨服务类
 */
class TransferService {
  constructor() {
    this.activeTransfers = new Map();
  }

  /**
   * 创建调拨单
   * @param {Object} transferData - 调拨数据
   * @returns {Promise<Object>} 创建结果
   */
  async createTransfer(transferData) {
    logger.info('创建调拨单', transferData);

    try {
      // 验证调拨数据
      const validation = this.validateTransferData(transferData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // 检查调出仓库库存
      const stockCheck = await this.checkSourceStock(transferData);
      if (!stockCheck.sufficient) {
        throw new Error(
          `调出仓库库存不足: ${stockCheck.details.map((d) => `${d.deviceName} 缺 ${d.shortage} 件`).join(', ')}`
        );
      }

      // 预占调出仓库货位
      const reservations = [];
      for (const item of transferData.items) {
        const reservation = inventoryLockManager.reserveBin(item.fromBinId, transferData.orderNo, {
          quantity: item.quantity,
          expireMinutes: 60,
        });
        if (!reservation.success) {
          // 释放已预占的货位
          reservations.forEach((r) => inventoryLockManager.releaseBin(r.binId, transferData.orderNo));
          throw new Error(`货位预占失败: ${reservation.message}`);
        }
        reservations.push({ binId: item.fromBinId, reservationId: reservation.reservationId });
      }

      // 生成调拨单号
      const orderNo = await this.generateTransferNo();

      const transfer = {
        ...transferData,
        orderNo,
        status: TRANSFER_STATUS.DRAFT,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        reservations,
      };

      this.activeTransfers.set(orderNo, transfer);

      logger.info('调拨单创建成功', { orderNo, transfer });
      return { success: true, orderNo, transfer };
    } catch (error) {
      logger.error('创建调拨单失败', error);
      throw error;
    }
  }

  /**
   * 提交调拨单审核
   * @param {string} orderNo - 调拨单号
   * @returns {Promise<Object>} 提交结果
   */
  async submitTransfer(orderNo) {
    logger.info('提交调拨单审核', { orderNo });

    const transfer = this.activeTransfers.get(orderNo);
    if (!transfer) {
      throw new Error('调拨单不存在');
    }

    if (transfer.status !== TRANSFER_STATUS.DRAFT) {
      throw new Error('只有草稿状态的调拨单可以提交审核');
    }

    try {
      // 重新验证库存
      const stockCheck = await this.checkSourceStock(transfer);
      if (!stockCheck.sufficient) {
        throw new Error(
          `库存已变化，请重新确认: ${stockCheck.details.map((d) => `${d.deviceName} 缺 ${d.shortage} 件`).join(', ')}`
        );
      }

      transfer.status = TRANSFER_STATUS.PENDING;
      transfer.updateTime = new Date().toISOString();

      logger.info('调拨单提交审核成功', { orderNo });
      return { success: true, transfer };
    } catch (error) {
      logger.error('提交调拨单审核失败', error);
      throw error;
    }
  }

  /**
   * 审核调拨单
   * @param {string} orderNo - 调拨单号
   * @param {boolean} approved - 是否通过
   * @param {string} remark - 审核备注
   * @returns {Promise<Object>} 审核结果
   */
  async approveTransfer(orderNo, approved, remark = '') {
    logger.info('审核调拨单', { orderNo, approved, remark });

    const transfer = this.activeTransfers.get(orderNo);
    if (!transfer) {
      throw new Error('调拨单不存在');
    }

    if (transfer.status !== TRANSFER_STATUS.PENDING) {
      throw new Error('只有待审核状态的调拨单可以进行审核');
    }

    try {
      if (approved) {
        transfer.status = TRANSFER_STATUS.APPROVED;
        transfer.approveRemark = remark;
        transfer.approveTime = new Date().toISOString();
      } else {
        transfer.status = TRANSFER_STATUS.DRAFT;
        transfer.rejectRemark = remark;
        transfer.rejectTime = new Date().toISOString();

        // 释放货位预占
        this.releaseReservations(transfer);
      }

      transfer.updateTime = new Date().toISOString();

      logger.info('调拨单审核完成', { orderNo, approved });
      return { success: true, transfer };
    } catch (error) {
      logger.error('审核调拨单失败', error);
      throw error;
    }
  }

  /**
   * 执行调拨出库
   * @param {string} orderNo - 调拨单号
   * @param {Object} outboundData - 出库数据
   * @returns {Promise<Object>} 出库结果
   */
  async executeOutbound(orderNo, outboundData) {
    logger.info('执行调拨出库', { orderNo, outboundData });

    const transfer = this.activeTransfers.get(orderNo);
    if (!transfer) {
      throw new Error('调拨单不存在');
    }

    if (transfer.status !== TRANSFER_STATUS.APPROVED) {
      throw new Error('调拨单未审核通过，无法出库');
    }

    try {
      // 验证乐观锁版本
      for (const item of transfer.items) {
        const versionValid = inventoryLockManager.validateOptimisticLock(item.deviceId, item.version || 1);
        if (!versionValid) {
          throw new Error(`设备 ${item.deviceName} 库存数据已变化，请刷新后重试`);
        }
      }

      // 执行出库操作
      const outboundResult = await this.performOutbound(transfer, outboundData);
      if (!outboundResult.success) {
        throw new Error(outboundResult.message);
      }

      transfer.status = TRANSFER_STATUS.OUTBOUND;
      transfer.outboundTime = new Date().toISOString();
      transfer.outboundData = outboundData;
      transfer.updateTime = new Date().toISOString();

      // 释放货位预占
      this.releaseReservations(transfer);

      logger.info('调拨出库成功', { orderNo });
      return { success: true, transfer, outboundResult };
    } catch (error) {
      logger.error('调拨出库失败', error);
      throw error;
    }
  }

  /**
   * 执行调拨入库
   * @param {string} orderNo - 调拨单号
   * @param {Object} inboundData - 入库数据
   * @returns {Promise<Object>} 入库结果
   */
  async executeInbound(orderNo, inboundData) {
    logger.info('执行调拨入库', { orderNo, inboundData });

    const transfer = this.activeTransfers.get(orderNo);
    if (!transfer) {
      throw new Error('调拨单不存在');
    }

    if (transfer.status !== TRANSFER_STATUS.OUTBOUND) {
      throw new Error('调拨单未出库，无法入库');
    }

    try {
      // 预占调入仓库货位
      const reservations = [];
      for (const item of inboundData.items) {
        const reservation = inventoryLockManager.reserveBin(item.toBinId, orderNo, {
          quantity: item.quantity,
          expireMinutes: 30,
        });
        if (!reservation.success) {
          reservations.forEach((r) => inventoryLockManager.releaseBin(r.binId, orderNo));
          throw new Error(`调入货位预占失败: ${reservation.message}`);
        }
        reservations.push({ binId: item.toBinId, reservationId: reservation.reservationId });
      }

      // 执行入库操作
      const inboundResult = await this.performInbound(transfer, inboundData);
      if (!inboundResult.success) {
        throw new Error(inboundResult.message);
      }

      transfer.status = TRANSFER_STATUS.COMPLETED;
      transfer.inboundTime = new Date().toISOString();
      transfer.inboundData = inboundData;
      transfer.updateTime = new Date().toISOString();

      // 释放货位预占
      reservations.forEach((r) => inventoryLockManager.releaseBin(r.binId, orderNo));

      logger.info('调拨入库成功', { orderNo });
      return { success: true, transfer, inboundResult };
    } catch (error) {
      logger.error('调拨入库失败', error);
      throw error;
    }
  }

  /**
   * 取消调拨单
   * @param {string} orderNo - 调拨单号
   * @param {string} reason - 取消原因
   * @returns {Promise<Object>} 取消结果
   */
  async cancelTransfer(orderNo, reason = '') {
    logger.info('取消调拨单', { orderNo, reason });

    const transfer = this.activeTransfers.get(orderNo);
    if (!transfer) {
      throw new Error('调拨单不存在');
    }

    if (transfer.status === TRANSFER_STATUS.COMPLETED || transfer.status === TRANSFER_STATUS.CANCELLED) {
      throw new Error('已完成或已取消的调拨单不能再次取消');
    }

    try {
      // 释放货位预占
      this.releaseReservations(transfer);

      transfer.status = TRANSFER_STATUS.CANCELLED;
      transfer.cancelReason = reason;
      transfer.cancelTime = new Date().toISOString();
      transfer.updateTime = new Date().toISOString();

      logger.info('调拨单取消成功', { orderNo });
      return { success: true, transfer };
    } catch (error) {
      logger.error('取消调拨单失败', error);
      throw error;
    }
  }

  /**
   * 验证调拨数据
   * @param {Object} transferData - 调拨数据
   * @returns {Object} 验证结果
   */
  validateTransferData(transferData) {
    if (!transferData.fromWarehouseId) {
      return { valid: false, message: '请选择调出仓库' };
    }

    if (!transferData.toWarehouseId) {
      return { valid: false, message: '请选择调入仓库' };
    }

    if (transferData.fromWarehouseId === transferData.toWarehouseId) {
      return { valid: false, message: '调出仓库和调入仓库不能相同' };
    }

    if (!transferData.items || transferData.items.length === 0) {
      return { valid: false, message: '请至少添加一个调拨设备' };
    }

    for (const item of transferData.items) {
      if (!item.deviceId) {
        return { valid: false, message: '请选择调拨设备' };
      }
      if (!item.quantity || item.quantity <= 0) {
        return { valid: false, message: '调拨数量必须大于0' };
      }
      if (!item.fromBinId) {
        return { valid: false, message: '请选择调出货位' };
      }
    }

    return { valid: true };
  }

  /**
   * 检查调出仓库库存
   * @param {Object} transfer - 调拨单
   * @returns {Promise<Object>} 检查结果
   */
  async checkSourceStock(transfer) {
    const details = [];
    let sufficient = true;

    for (const item of transfer.items) {
      // 这里应该调用API检查实际库存
      // 简化处理，假设库存充足
      const availableStock = item.maxQuantity || 9999;
      if (availableStock < item.quantity) {
        sufficient = false;
        details.push({
          deviceId: item.deviceId,
          deviceName: item.deviceName,
          required: item.quantity,
          available: availableStock,
          shortage: item.quantity - availableStock,
        });
      }
    }

    return { sufficient, details };
  }

  /**
   * 执行出库操作
   * @param {Object} transfer - 调拨单
   * @param {Object} outboundData - 出库数据
   * @returns {Promise<Object>} 出库结果
   */
  async performOutbound(transfer, outboundData) {
    // 这里应该调用出库API
    // 简化处理，返回成功
    logger.info('执行出库操作', { transfer, outboundData });
    return { success: true, message: '出库成功' };
  }

  /**
   * 执行入库操作
   * @param {Object} transfer - 调拨单
   * @param {Object} inboundData - 入库数据
   * @returns {Promise<Object>} 入库结果
   */
  async performInbound(transfer, inboundData) {
    // 这里应该调用入库API
    // 简化处理，返回成功
    logger.info('执行入库操作', { transfer, inboundData });
    return { success: true, message: '入库成功' };
  }

  /**
   * 释放货位预占
   * @param {Object} transfer - 调拨单
   */
  releaseReservations(transfer) {
    if (transfer.reservations) {
      transfer.reservations.forEach((r) => {
        inventoryLockManager.releaseBin(r.binId, transfer.orderNo);
      });
      transfer.reservations = [];
    }
  }

  /**
   * 生成调拨单号
   * @returns {Promise<string>} 调拨单号
   */
  async generateTransferNo() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `TF${dateStr}${random}`;
  }

  /**
   * 获取调拨单
   * @param {string} orderNo - 调拨单号
   * @returns {Object|null} 调拨单
   */
  getTransfer(orderNo) {
    return this.activeTransfers.get(orderNo) || null;
  }

  /**
   * 获取所有调拨单
   * @param {Object} filters - 过滤条件
   * @returns {Array} 调拨单列表
   */
  getAllTransfers(filters = {}) {
    let transfers = Array.from(this.activeTransfers.values());

    if (filters.status) {
      transfers = transfers.filter((t) => t.status === filters.status);
    }

    if (filters.fromWarehouseId) {
      transfers = transfers.filter((t) => t.fromWarehouseId === filters.fromWarehouseId);
    }

    if (filters.toWarehouseId) {
      transfers = transfers.filter((t) => t.toWarehouseId === filters.toWarehouseId);
    }

    if (filters.startDate && filters.endDate) {
      transfers = transfers.filter((t) => {
        const createTime = new Date(t.createTime);
        return createTime >= new Date(filters.startDate) && createTime <= new Date(filters.endDate);
      });
    }

    return transfers.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }
}

// 导出单例
const transferService = new TransferService();
export default transferService;
