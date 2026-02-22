/**
 * API服务管理器
 * @file: ApiManager.js
 * @description: 统一管理所有API服务实例，提供统一的访问接口
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import DeviceApiService from './services/DeviceApiService.js';

import { createLogger } from '@/utils/logger';

const logger = createLogger('ApiManager');

/**
 * API服务管理器
 * 单例模式，统一管理所有API服务实例
 */
class ApiManager {
  constructor() {
    if (ApiManager.instance) {
      return ApiManager.instance;
    }

    this.services = {};
    this._initializeServices();
    ApiManager.instance = this;
  }

  /**
   * 初始化所有API服务
   * @private
   */
  _initializeServices() {
    logger.debug('[ApiManager] 初始化API服务');

    this.services = {
      device: DeviceApiService,
    };

    logger.debug('[ApiManager] API服务初始化完成', Object.keys(this.services));
  }

  /**
   * 获取API服务实例
   * @param {string} serviceName - 服务名称
   * @returns {object} API服务实例
   */
  getService(serviceName) {
    if (!this.services[serviceName]) {
      logger.error(`[ApiManager] 服务 ${serviceName} 不存在`);
      throw new Error(`API服务 ${serviceName} 不存在`);
    }

    return this.services[serviceName];
  }

  /**
   * 注册API服务
   * @param {string} serviceName - 服务名称
   * @param {object} serviceInstance - 服务实例
   */
  registerService(serviceName, serviceInstance) {
    if (this.services[serviceName]) {
      logger.warn(`[ApiManager] 服务 ${serviceName} 已存在，将被覆盖`);
    }

    this.services[serviceName] = serviceInstance;
    logger.debug(`[ApiManager] 注册服务: ${serviceName}`);
  }

  /**
   * 移除API服务
   * @param {string} serviceName - 服务名称
   */
  unregisterService(serviceName) {
    if (this.services[serviceName]) {
      delete this.services[serviceName];
      logger.debug(`[ApiManager] 移除服务: ${serviceName}`);
    }
  }

  /**
   * 获取所有服务名称
   * @returns {Array<string>} 服务名称列表
   */
  getServiceNames() {
    return Object.keys(this.services);
  }

  /**
   * 清除所有服务的缓存
   */
  clearAllCache() {
    Object.values(this.services).forEach((service) => {
      if (typeof service.clearCache === 'function') {
        service.clearCache();
      }
    });
    logger.debug('[ApiManager] 清除所有服务缓存');
  }

  /**
   * 获取设备API服务
   * @returns {object} 设备API服务实例
   */
  get device() {
    return this.getService('device');
  }
}

export default new ApiManager();
