import { ref, reactive } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceSyncManager');

class DeviceSyncManager {
  constructor() {
    this.subscribers = new Map();
    this.deviceCache = new Map();
    this.ledgerCache = new Map();
    this.syncQueue = [];
    this.isSyncing = false;
  }

  subscribe(eventType, callback, subscriberId) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Map());
    }
    this.subscribers.get(eventType).set(subscriberId, callback);
    logger.debug('[subscribe] 订阅事件', { eventType, subscriberId });
  }

  unsubscribe(eventType, subscriberId) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).delete(subscriberId);
      logger.debug('[unsubscribe] 取消订阅', { eventType, subscriberId });
    }
  }

  publish(eventType, data) {
    if (this.subscribers.has(eventType)) {
      const callbacks = this.subscribers.get(eventType);
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          logger.error('[publish] 回调执行失败', { eventType, error });
        }
      });
      logger.debug('[publish] 发布事件', { eventType, subscriberCount: callbacks.size });
    }
  }

  cacheDevice(device) {
    if (device && device.id) {
      this.deviceCache.set(device.id, { ...device, cachedAt: Date.now() });
      logger.debug('[cacheDevice] 缓存设备数据', { deviceId: device.id });
    }
  }

  cacheLedger(ledger) {
    if (ledger && (ledger.ledgerId || ledger.id)) {
      const key = ledger.ledgerId || ledger.id;
      this.ledgerCache.set(key, { ...ledger, cachedAt: Date.now() });
      logger.debug('[cacheLedger] 缓存台账数据', { ledgerId: key });
    }
  }

  getCachedDevice(deviceId) {
    const cached = this.deviceCache.get(deviceId);
    if (cached) {
      const age = Date.now() - cached.cachedAt;
      if (age < 5 * 60 * 1000) {
        return cached;
      }
      this.deviceCache.delete(deviceId);
    }
    return null;
  }

  getCachedLedger(ledgerId) {
    const cached = this.ledgerCache.get(ledgerId);
    if (cached) {
      const age = Date.now() - cached.cachedAt;
      if (age < 5 * 60 * 1000) {
        return cached;
      }
      this.ledgerCache.delete(ledgerId);
    }
    return null;
  }

  async syncDeviceUpdate(deviceData) {
    logger.info('[syncDeviceUpdate] 开始同步设备更新', { deviceId: deviceData.id });

    try {
      this.publish('device:before-update', deviceData);

      this.cacheDevice(deviceData);

      const ledgerData = this.convertDeviceToLedger(deviceData);
      this.cacheLedger(ledgerData);

      this.publish('device:updated', deviceData);
      this.publish('ledger:updated', ledgerData);

      logger.info('[syncDeviceUpdate] 设备更新同步完成', { deviceId: deviceData.id });
      return { success: true, data: deviceData };
    } catch (error) {
      logger.error('[syncDeviceUpdate] 设备更新同步失败', { deviceId: deviceData.id, error });
      this.publish('device:update-failed', { deviceData, error });
      return { success: false, error };
    }
  }

  async syncLedgerUpdate(ledgerData) {
    logger.info('[syncLedgerUpdate] 开始同步台账更新', { ledgerId: ledgerData.ledgerId || ledgerData.id });

    try {
      this.publish('ledger:before-update', ledgerData);

      this.cacheLedger(ledgerData);

      const deviceData = this.convertLedgerToDevice(ledgerData);
      this.cacheDevice(deviceData);

      this.publish('ledger:updated', ledgerData);
      this.publish('device:updated', deviceData);

      logger.info('[syncLedgerUpdate] 台账更新同步完成', { ledgerId: ledgerData.ledgerId || ledgerData.id });
      return { success: true, data: ledgerData };
    } catch (error) {
      logger.error('[syncLedgerUpdate] 台账更新同步失败', { ledgerId: ledgerData.ledgerId || ledgerData.id, error });
      this.publish('ledger:update-failed', { ledgerData, error });
      return { success: false, error };
    }
  }

  convertDeviceToLedger(device) {
    return {
      ledgerId: device.id,
      ledgerCode: `LEDGER${String(device.id).padStart(3, '0')}`,
      deviceCode: device.deviceNumber,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      warehouseName: device.warehouseName || device.areaName,
      status: this.convertDeviceStatus(device.status),
      purchaseDate: device.purchaseDate || device.installDate,
      purchasePrice: device.purchasePrice || 0,
      depreciationRate: device.depreciationRate || 10,
      currentValue: device.currentValue || device.purchasePrice || 0,
      installDate: device.installDate,
      lastOnlineTime: device.lastOnlineTime,
      remark: device.remark,
    };
  }

  convertLedgerToDevice(ledger) {
    return {
      id: ledger.ledgerId || ledger.id,
      deviceNumber: ledger.deviceCode,
      deviceName: ledger.deviceName,
      deviceType: ledger.deviceType,
      areaName: ledger.warehouseName,
      status: this.convertLedgerStatus(ledger.status),
      installDate: ledger.installDate || ledger.purchaseDate,
      lastOnlineTime: ledger.lastOnlineTime,
      remark: ledger.remark,
      purchaseDate: ledger.purchaseDate,
      purchasePrice: ledger.purchasePrice,
      depreciationRate: ledger.depreciationRate,
      currentValue: ledger.currentValue,
    };
  }

  convertDeviceStatus(status) {
    const statusMap = {
      normal: 'normal',
      in_use: 'normal',
      idle: 'normal',
      maintenance: 'maintenance',
      repairing: 'maintenance',
      scrapped: 'scrapped',
      lost: 'lost',
      offline: 'normal',
    };
    return statusMap[status] || 'normal';
  }

  convertLedgerStatus(status) {
    const statusMap = {
      normal: 'normal',
      maintenance: 'maintenance',
      scrapped: 'scrapped',
      lost: 'lost',
    };
    return statusMap[status] || 'normal';
  }

  async syncStatusChange(deviceId, newStatus, remark = '') {
    logger.info('[syncStatusChange] 开始同步状态变更', { deviceId, newStatus });

    try {
      this.publish('device:status-changing', { deviceId, newStatus, remark });

      const cachedDevice = this.getCachedDevice(deviceId);
      if (cachedDevice) {
        const updatedDevice = { ...cachedDevice, status: newStatus };
        await this.syncDeviceUpdate(updatedDevice);
      }

      const cachedLedger = this.getCachedLedger(deviceId);
      if (cachedLedger) {
        const updatedLedger = { ...cachedLedger, status: this.convertDeviceStatus(newStatus) };
        await this.syncLedgerUpdate(updatedLedger);
      }

      this.publish('device:status-changed', { deviceId, newStatus, remark });

      logger.info('[syncStatusChange] 状态变更同步完成', { deviceId, newStatus });
      return { success: true };
    } catch (error) {
      logger.error('[syncStatusChange] 状态变更同步失败', { deviceId, newStatus, error });
      this.publish('device:status-change-failed', { deviceId, newStatus, error });
      return { success: false, error };
    }
  }

  clearCache(deviceId = null) {
    if (deviceId) {
      this.deviceCache.delete(deviceId);
      this.ledgerCache.delete(deviceId);
      logger.debug('[clearCache] 清除指定设备缓存', { deviceId });
    } else {
      this.deviceCache.clear();
      this.ledgerCache.clear();
      logger.debug('[clearCache] 清除所有缓存');
    }
  }

  getCacheStats() {
    return {
      deviceCacheSize: this.deviceCache.size,
      ledgerCacheSize: this.ledgerCache.size,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, map) => sum + map.size, 0),
    };
  }
}

const deviceSyncManager = new DeviceSyncManager();

export function useDeviceSync() {
  const syncStatus = ref('idle');
  const lastSyncTime = ref(null);
  const cacheStats = reactive(deviceSyncManager.getCacheStats());

  const syncDeviceUpdate = async (deviceData) => {
    syncStatus.value = 'syncing';
    try {
      const result = await deviceSyncManager.syncDeviceUpdate(deviceData);
      lastSyncTime.value = Date.now();
      Object.assign(cacheStats, deviceSyncManager.getCacheStats());
      syncStatus.value = result.success ? 'success' : 'error';
      return result;
    } catch (error) {
      syncStatus.value = 'error';
      throw error;
    }
  };

  const syncLedgerUpdate = async (ledgerData) => {
    syncStatus.value = 'syncing';
    try {
      const result = await deviceSyncManager.syncLedgerUpdate(ledgerData);
      lastSyncTime.value = Date.now();
      Object.assign(cacheStats, deviceSyncManager.getCacheStats());
      syncStatus.value = result.success ? 'success' : 'error';
      return result;
    } catch (error) {
      syncStatus.value = 'error';
      throw error;
    }
  };

  const syncStatusChange = async (deviceId, newStatus, remark) => {
    syncStatus.value = 'syncing';
    try {
      const result = await deviceSyncManager.syncStatusChange(deviceId, newStatus, remark);
      lastSyncTime.value = Date.now();
      Object.assign(cacheStats, deviceSyncManager.getCacheStats());
      syncStatus.value = result.success ? 'success' : 'error';
      return result;
    } catch (error) {
      syncStatus.value = 'error';
      throw error;
    }
  };

  const subscribe = (eventType, callback, subscriberId) => {
    deviceSyncManager.subscribe(eventType, callback, subscriberId);
  };

  const unsubscribe = (eventType, subscriberId) => {
    deviceSyncManager.unsubscribe(eventType, subscriberId);
  };

  const refreshCacheStats = () => {
    Object.assign(cacheStats, deviceSyncManager.getCacheStats());
  };

  return {
    syncStatus,
    lastSyncTime,
    cacheStats,
    syncDeviceUpdate,
    syncLedgerUpdate,
    syncStatusChange,
    subscribe,
    unsubscribe,
    refreshCacheStats,
  };
}

export default deviceSyncManager;
