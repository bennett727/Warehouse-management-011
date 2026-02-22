/**
 * @file: inventoryLockManager.js
 * @description: 库存锁定管理器 - 实现乐观锁和货位预占机制
 * @author: 开发团队
 * @createTime: 2026-02-13
 * @version: 1.0.0
 */

import { createLogger } from './logger.js';

const logger = createLogger('inventoryLockManager');

/**
 * 库存锁定类型
 */
export const LOCK_TYPES = {
  // 乐观锁 - 用于出库防止超卖
  OPTIMISTIC: 'optimistic',
  // 货位预占 - 用于入库货位预留
  BIN_RESERVATION: 'bin_reservation',
  // 盘点锁定 - 用于盘点期间锁定库存
  STOCK_COUNT: 'stock_count',
  // 调拨锁定 - 用于调拨期间锁定
  TRANSFER: 'transfer',
};

/**
 * 锁定状态
 */
export const LOCK_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  RELEASED: 'released',
  EXPIRED: 'expired',
};

/**
 * 库存锁定管理器
 * 管理库存操作中的各种锁定机制
 */
class InventoryLockManager {
  constructor() {
    // 内存中的锁定记录（实际项目中应使用后端存储）
    this.locks = new Map();
    // 货位预占记录
    this.binReservations = new Map();
    // 盘点锁定记录
    this.stockCountLocks = new Map();
    // 锁定时长（毫秒）
    this.lockTimeout = 30 * 60 * 1000; // 30分钟
  }

  /**
   * 生成锁定ID
   * @param {string} type - 锁定类型
   * @param {string} resourceId - 资源ID
   * @returns {string} 锁定ID
   */
  generateLockId(type, resourceId) {
    return `${type}:${resourceId}:${Date.now()}`;
  }

  /**
   * 获取乐观锁版本号
   * @param {string} deviceId - 设备ID
   * @returns {number} 版本号
   */
  getOptimisticVersion(deviceId) {
    const key = `version:${deviceId}`;
    const version = this.locks.get(key);
    return version ? version.version : 0;
  }

  /**
   * 增加乐观锁版本号
   * @param {string} deviceId - 设备ID
   * @returns {number} 新版本号
   */
  incrementVersion(deviceId) {
    const key = `version:${deviceId}`;
    const current = this.getOptimisticVersion(deviceId);
    const newVersion = current + 1;
    this.locks.set(key, {
      version: newVersion,
      updatedAt: Date.now(),
    });
    logger.debug(`设备 ${deviceId} 版本号更新为 ${newVersion}`);
    return newVersion;
  }

  /**
   * 验证乐观锁版本
   * @param {string} deviceId - 设备ID
   * @param {number} expectedVersion - 期望的版本号
   * @returns {boolean} 是否验证通过
   */
  validateOptimisticLock(deviceId, expectedVersion) {
    const currentVersion = this.getOptimisticVersion(deviceId);
    if (currentVersion !== expectedVersion) {
      logger.warn(`乐观锁验证失败: 设备 ${deviceId} 期望版本 ${expectedVersion}, 当前版本 ${currentVersion}`);
      return false;
    }
    return true;
  }

  /**
   * 预占货位
   * @param {string} binId - 货位ID
   * @param {string} orderId - 订单ID
   * @param {Object} options - 选项
   * @returns {Object} 预占结果
   */
  reserveBin(binId, orderId, options = {}) {
    const { quantity = 1, expireMinutes = 30 } = options;

    // 检查货位是否已被预占
    const existingReservation = this.binReservations.get(binId);
    if (existingReservation && existingReservation.status === LOCK_STATUS.ACTIVE) {
      // 检查是否过期
      if (Date.now() - existingReservation.createdAt < existingReservation.expireTime) {
        logger.warn(`货位 ${binId} 已被订单 ${existingReservation.orderId} 预占`);
        return {
          success: false,
          message: '货位已被预占',
          existingOrderId: existingReservation.orderId,
        };
      }
    }

    const reservationId = this.generateLockId(LOCK_TYPES.BIN_RESERVATION, binId);
    const reservation = {
      id: reservationId,
      binId,
      orderId,
      quantity,
      status: LOCK_STATUS.ACTIVE,
      createdAt: Date.now(),
      expireTime: expireMinutes * 60 * 1000,
    };

    this.binReservations.set(binId, reservation);
    logger.info(`货位 ${binId} 已被订单 ${orderId} 预占`, reservation);

    return {
      success: true,
      reservationId,
      message: '货位预占成功',
    };
  }

  /**
   * 释放货位预占
   * @param {string} binId - 货位ID
   * @param {string} orderId - 订单ID
   * @returns {Object} 释放结果
   */
  releaseBinReservation(binId, orderId) {
    const reservation = this.binReservations.get(binId);

    if (!reservation) {
      return {
        success: true,
        message: '货位未预占',
      };
    }

    if (reservation.orderId !== orderId) {
      logger.warn(`释放货位失败: 订单 ${orderId} 无权释放货位 ${binId}`);
      return {
        success: false,
        message: '无权释放此货位',
      };
    }

    reservation.status = LOCK_STATUS.RELEASED;
    reservation.releasedAt = Date.now();
    this.binReservations.delete(binId);

    logger.info(`货位 ${binId} 预占已释放`, { orderId });

    return {
      success: true,
      message: '货位释放成功',
    };
  }

  /**
   * 检查货位是否可用
   * @param {string} binId - 货位ID
   * @returns {boolean} 是否可用
   */
  isBinAvailable(binId) {
    const reservation = this.binReservations.get(binId);
    if (!reservation) {
      return true;
    }

    // 检查是否过期
    if (reservation.status === LOCK_STATUS.ACTIVE) {
      const isExpired = Date.now() - reservation.createdAt > reservation.expireTime;
      if (isExpired) {
        reservation.status = LOCK_STATUS.EXPIRED;
        this.binReservations.delete(binId);
        return true;
      }
      return false;
    }

    return true;
  }

  /**
   * 获取货位预占信息
   * @param {string} binId - 货位ID
   * @returns {Object|null} 预占信息
   */
  getBinReservation(binId) {
    return this.binReservations.get(binId) || null;
  }

  /**
   * 锁定库存（用于盘点）
   * @param {string} warehouseId - 仓库ID
   * @param {string} countId - 盘点单ID
   * @returns {Object} 锁定结果
   */
  lockStockForCount(warehouseId, countId) {
    const lockKey = `count:${warehouseId}`;

    if (this.stockCountLocks.has(lockKey)) {
      const existing = this.stockCountLocks.get(lockKey);
      if (existing.status === LOCK_STATUS.ACTIVE) {
        return {
          success: false,
          message: `仓库 ${warehouseId} 正在被盘点单 ${existing.countId} 锁定`,
        };
      }
    }

    const lock = {
      id: this.generateLockId(LOCK_TYPES.STOCK_COUNT, warehouseId),
      warehouseId,
      countId,
      status: LOCK_STATUS.ACTIVE,
      createdAt: Date.now(),
    };

    this.stockCountLocks.set(lockKey, lock);
    logger.info(`仓库 ${warehouseId} 已被盘点单 ${countId} 锁定`);

    return {
      success: true,
      lockId: lock.id,
      message: '库存锁定成功',
    };
  }

  /**
   * 释放盘点锁定
   * @param {string} warehouseId - 仓库ID
   * @param {string} countId - 盘点单ID
   * @returns {Object} 释放结果
   */
  unlockStockForCount(warehouseId, countId) {
    const lockKey = `count:${warehouseId}`;
    const lock = this.stockCountLocks.get(lockKey);

    if (!lock) {
      return {
        success: true,
        message: '未找到锁定记录',
      };
    }

    if (lock.countId !== countId) {
      return {
        success: false,
        message: '无权释放此锁定',
      };
    }

    lock.status = LOCK_STATUS.RELEASED;
    lock.releasedAt = Date.now();
    this.stockCountLocks.delete(lockKey);

    logger.info(`仓库 ${warehouseId} 盘点锁定已释放`);

    return {
      success: true,
      message: '库存锁定已释放',
    };
  }

  /**
   * 检查仓库是否被锁定
   * @param {string} warehouseId - 仓库ID
   * @returns {boolean} 是否被锁定
   */
  isWarehouseLocked(warehouseId) {
    const lockKey = `count:${warehouseId}`;
    const lock = this.stockCountLocks.get(lockKey);
    return lock && lock.status === LOCK_STATUS.ACTIVE;
  }

  /**
   * 获取仓库锁定信息
   * @param {string} warehouseId - 仓库ID
   * @returns {Object|null} 锁定信息
   */
  getWarehouseLock(warehouseId) {
    const lockKey = `count:${warehouseId}`;
    return this.stockCountLocks.get(lockKey) || null;
  }

  /**
   * 清理过期锁定
   */
  cleanupExpiredLocks() {
    const now = Date.now();
    let cleanedCount = 0;

    // 清理货位预占
    for (const [binId, reservation] of this.binReservations.entries()) {
      if (reservation.status === LOCK_STATUS.ACTIVE) {
        const isExpired = now - reservation.createdAt > reservation.expireTime;
        if (isExpired) {
          reservation.status = LOCK_STATUS.EXPIRED;
          this.binReservations.delete(binId);
          cleanedCount++;
          logger.debug(`货位 ${binId} 预占已过期清理`);
        }
      }
    }

    logger.info(`清理完成，共清理 ${cleanedCount} 个过期锁定`);
    return cleanedCount;
  }

  /**
   * 获取所有锁定统计
   * @returns {Object} 统计信息
   */
  getLockStatistics() {
    return {
      binReservations: this.binReservations.size,
      stockCountLocks: this.stockCountLocks.size,
      totalLocks: this.locks.size,
    };
  }
}

// 创建单例实例
const inventoryLockManager = new InventoryLockManager();

// 定期清理过期锁定（每5分钟）
setInterval(
  () => {
    inventoryLockManager.cleanupExpiredLocks();
  },
  5 * 60 * 1000
);

export default inventoryLockManager;
export { InventoryLockManager };
