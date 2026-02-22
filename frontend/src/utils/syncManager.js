/**
 * 数据同步管理器
 * @file: syncManager.js
 * @description: 管理多标签页/窗口间的数据同步，确保数据一致性
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0
 */

import { createLogger } from './logger';

const logger = createLogger('syncManager');

/**
 * 同步事件类型
 */
export const SYNC_EVENTS = {
  // 用户相关
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_INFO_UPDATED: 'user:info:updated',

  // 设备相关
  DEVICE_CREATED: 'device:created',
  DEVICE_UPDATED: 'device:updated',
  DEVICE_DELETED: 'device:deleted',
  DEVICE_STATUS_CHANGED: 'device:status:changed',

  // 库存相关
  STOCK_ORDER_CREATED: 'stock:order:created',
  STOCK_ORDER_UPDATED: 'stock:order:updated',
  STOCK_ORDER_AUDITED: 'stock:order:audited',
  INVENTORY_CHANGED: 'inventory:changed',

  // 区域相关
  AREA_CREATED: 'area:created',
  AREA_UPDATED: 'area:updated',
  AREA_DELETED: 'area:deleted',

  // 系统配置
  CONFIG_UPDATED: 'config:updated',

  // 缓存控制
  CACHE_CLEARED: 'cache:cleared',
  CACHE_UPDATED: 'cache:updated',
};

/**
 * 数据同步管理器类
 */
class SyncManager {
  constructor() {
    this.channel = null;
    this.listeners = new Map();
    this.isSupported = typeof BroadcastChannel !== 'undefined';
    this.sessionId = this.generateSessionId();

    this.init();
  }

  /**
   * 初始化同步管理器
   */
  init() {
    if (this.isSupported) {
      try {
        this.channel = new BroadcastChannel('warehouse_sync_channel');
        this.channel.onmessage = (event) => this.handleMessage(event.data);
        logger.info('BroadcastChannel initialized');
      } catch {
        logger.warn('BroadcastChannel not available, falling back to storage events');
        this.setupStorageFallback();
      }
    } else {
      logger.warn('BroadcastChannel not supported, using storage events');
      this.setupStorageFallback();
    }

    // 监听页面可见性变化
    this.setupVisibilityHandler();
  }

  /**
   * 生成会话ID
   * @returns {string} 会话ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置Storage事件降级方案
   */
  setupStorageFallback() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'warehouse_sync_event') {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.sessionId !== this.sessionId) {
            this.handleMessage(data);
          }
        } catch (error) {
          logger.error('Failed to parse storage event:', error);
        }
      }
    });
  }

  /**
   * 设置页面可见性处理
   */
  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，触发数据刷新检查
        this.emit('app:visibility:changed', { visible: true });
      }
    });
  }

  /**
   * 处理接收到的消息
   * @param {Object} data - 消息数据
   */
  handleMessage(data) {
    if (!data || data.sessionId === this.sessionId) {
      return;
    }

    logger.debug('Received sync message:', data);

    const { event, payload, timestamp, source } = data;

    // 检查消息时效性（5分钟内的消息有效）
    if (timestamp && Date.now() - timestamp > 5 * 60 * 1000) {
      logger.warn('Stale sync message ignored:', event);
      return;
    }

    // 触发对应的事件监听器
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload, source);
        } catch (error) {
          logger.error('Error in sync callback:', error);
        }
      });
    }
  }

  /**
   * 发送同步消息
   * @param {string} event - 事件类型
   * @param {Object} payload - 消息数据
   */
  emit(event, payload = {}) {
    const message = {
      event,
      payload,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      source: window.location.href,
    };

    logger.debug('Sending sync message:', message);

    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // 使用localStorage作为降级方案
      try {
        localStorage.setItem('warehouse_sync_event', JSON.stringify(message));
        // 立即删除，避免影响下次事件
        setTimeout(() => {
          localStorage.removeItem('warehouse_sync_event');
        }, 100);
      } catch (error) {
        logger.error('Failed to send storage event:', error);
      }
    }
  }

  /**
   * 订阅同步事件
   * @param {string} event - 事件类型
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  /**
   * 取消订阅
   * @param {string} event - 事件类型
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 订阅一次性事件
   * @param {string} event - 事件类型
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (payload, source) => {
      callback(payload, source);
      unsubscribe();
    });
  }

  /**
   * 清除所有监听器
   */
  clear() {
    this.listeners.clear();
    logger.info('All sync listeners cleared');
  }

  /**
   * 销毁同步管理器
   */
  destroy() {
    this.clear();
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    logger.info('SyncManager destroyed');
  }

  // ==================== 便捷方法 ====================

  /**
   * 通知设备创建
   * @param {Object} device - 设备数据
   */
  notifyDeviceCreated(device) {
    this.emit(SYNC_EVENTS.DEVICE_CREATED, { device });
  }

  /**
   * 通知设备更新
   * @param {Object} device - 设备数据
   */
  notifyDeviceUpdated(device) {
    this.emit(SYNC_EVENTS.DEVICE_UPDATED, { device });
  }

  /**
   * 通知设备删除
   * @param {string|number} deviceId - 设备ID
   */
  notifyDeviceDeleted(deviceId) {
    this.emit(SYNC_EVENTS.DEVICE_DELETED, { deviceId });
  }

  /**
   * 通知库存订单创建
   * @param {Object} order - 订单数据
   */
  notifyStockOrderCreated(order) {
    this.emit(SYNC_EVENTS.STOCK_ORDER_CREATED, { order });
  }

  /**
   * 通知库存订单更新
   * @param {Object} order - 订单数据
   */
  notifyStockOrderUpdated(order) {
    this.emit(SYNC_EVENTS.STOCK_ORDER_UPDATED, { order });
  }

  /**
   * 通知库存订单审核
   * @param {Object} order - 订单数据
   */
  notifyStockOrderAudited(order) {
    this.emit(SYNC_EVENTS.STOCK_ORDER_AUDITED, { order });
  }

  /**
   * 通知库存变化
   * @param {Object} inventory - 库存数据
   */
  notifyInventoryChanged(inventory) {
    this.emit(SYNC_EVENTS.INVENTORY_CHANGED, { inventory });
  }

  /**
   * 通知区域更新
   * @param {Object} area - 区域数据
   */
  notifyAreaUpdated(area) {
    this.emit(SYNC_EVENTS.AREA_UPDATED, { area });
  }

  /**
   * 通知缓存清除
   * @param {string} cacheType - 缓存类型
   */
  notifyCacheCleared(cacheType = 'all') {
    this.emit(SYNC_EVENTS.CACHE_CLEARED, { cacheType });
  }

  /**
   * 通知用户登出
   */
  notifyUserLogout() {
    this.emit(SYNC_EVENTS.USER_LOGOUT, {});
  }
}

// 创建单例实例
const syncManager = new SyncManager();

export default syncManager;

// 便捷导出
export const {
  emit,
  on,
  off,
  once,
  clear,
  notifyDeviceCreated,
  notifyDeviceUpdated,
  notifyDeviceDeleted,
  notifyStockOrderCreated,
  notifyStockOrderUpdated,
  notifyStockOrderAudited,
  notifyInventoryChanged,
  notifyAreaUpdated,
  notifyCacheCleared,
  notifyUserLogout,
} = syncManager;
