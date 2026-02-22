/**
 * 搜索注册中心
 * 提供插件化的搜索模块注册机制，解耦全局搜索与业务API
 */

import { createLogger } from './logger';

const logger = createLogger('SearchRegistry');

/**
 * 搜索模块配置接口
 * @typedef {Object} SearchModuleConfig
 * @property {string} name - 模块名称
 * @property {string} label - 显示标签
 * @property {string} icon - 图标组件名
 * @property {string} itemIcon - 结果项图标
 * @property {string} route - 路由路径
 * @property {Function} searchFn - 搜索函数 (query) => Promise<Array>
 * @property {Function} [transformFn] - 结果转换函数 (item) => SearchResult
 * @property {number} [priority=0] - 优先级（数值越大越靠前）
 * @property {boolean} [enabled=true] - 是否启用
 */

/**
 * 搜索结果接口
 * @typedef {Object} SearchResult
 * @property {string} id - 唯一标识
 * @property {string} title - 标题
 * @property {string} subtitle - 副标题
 * @property {Array<string>} tags - 标签列表
 * @property {string} type - 模块类型
 * @property {Object} data - 原始数据
 */

export class SearchRegistry {
  constructor() {
    this.modules = new Map();
    this.hooks = {
      beforeSearch: [],
      afterSearch: [],
      onError: [],
    };
  }

  /**
   * 注册搜索模块
   * @param {string} moduleName - 模块名称
   * @param {SearchModuleConfig} config - 模块配置
   * @returns {SearchRegistry}
   */
  register(moduleName, config) {
    if (this.modules.has(moduleName)) {
      logger.warn(`搜索模块 ${moduleName} 已存在，将被覆盖`);
    }

    // 验证必要字段
    const requiredFields = ['name', 'label', 'searchFn'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`搜索模块 ${moduleName} 缺少必要字段: ${field}`);
      }
    }

    // 合并默认配置
    const mergedConfig = {
      icon: 'Search',
      itemIcon: 'Document',
      priority: 0,
      enabled: true,
      transformFn: this.defaultTransformFn,
      ...config,
    };

    this.modules.set(moduleName, mergedConfig);
    logger.debug(`注册搜索模块: ${moduleName}`, mergedConfig);

    return this;
  }

  /**
   * 注销搜索模块
   * @param {string} moduleName - 模块名称
   * @returns {SearchRegistry}
   */
  unregister(moduleName) {
    if (this.modules.has(moduleName)) {
      this.modules.delete(moduleName);
      logger.debug(`注销搜索模块: ${moduleName}`);
    }
    return this;
  }

  /**
   * 获取所有已注册的模块
   * @returns {Array<SearchModuleConfig>}
   */
  getAllModules() {
    return Array.from(this.modules.values())
      .filter((module) => module.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * 获取指定模块
   * @param {string} moduleName - 模块名称
   * @returns {SearchModuleConfig|undefined}
   */
  getModule(moduleName) {
    return this.modules.get(moduleName);
  }

  /**
   * 检查模块是否存在
   * @param {string} moduleName - 模块名称
   * @returns {boolean}
   */
  hasModule(moduleName) {
    return this.modules.has(moduleName);
  }

  /**
   * 启用/禁用模块
   * @param {string} moduleName - 模块名称
   * @param {boolean} enabled - 是否启用
   * @returns {SearchRegistry}
   */
  setEnabled(moduleName, enabled) {
    const module = this.modules.get(moduleName);
    if (module) {
      module.enabled = enabled;
      logger.debug(`${enabled ? '启用' : '禁用'}搜索模块: ${moduleName}`);
    }
    return this;
  }

  /**
   * 执行全局搜索
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @param {Array<string>} [options.modules] - 指定搜索的模块
   * @param {number} [options.timeout=5000] - 超时时间
   * @returns {Promise<Object>} 搜索结果
   */
  async search(query, options = {}) {
    const { modules: targetModules, timeout = 5000 } = options;

    if (!query || query.trim() === '') {
      return {};
    }

    // 执行前置钩子
    await this.runHooks('beforeSearch', { query, options });

    const results = {};
    const modulesToSearch = targetModules
      ? targetModules.filter((name) => this.modules.has(name) && this.modules.get(name).enabled)
      : this.getAllModules().map((m) => m.name);

    // 并行搜索所有模块
    const searchPromises = modulesToSearch.map(async (moduleName) => {
      const module = this.modules.get(moduleName);
      if (!module) {
        return;
      }

      try {
        // 添加超时控制
        const searchPromise = module.searchFn(query.trim());
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`搜索超时: ${moduleName}`)), timeout);
        });

        const items = await Promise.race([searchPromise, timeoutPromise]);

        // 转换结果格式
        results[moduleName] = items.map((item) => module.transformFn(item, moduleName, module));

        logger.debug(`搜索模块 ${moduleName} 返回 ${items.length} 条结果`);
      } catch (error) {
        logger.error(`搜索模块 ${moduleName} 执行失败:`, error);
        results[moduleName] = [];

        // 执行错误钩子
        await this.runHooks('onError', { moduleName, error, query });
      }
    });

    await Promise.all(searchPromises);

    // 执行后置钩子
    await this.runHooks('afterSearch', { query, results, options });

    return results;
  }

  /**
   * 默认结果转换函数
   * @param {Object} item - 原始数据项
   * @param {string} moduleName - 模块名称
   * @param {SearchModuleConfig} module - 模块配置
   * @returns {SearchResult}
   */
  defaultTransformFn(item, moduleName, module) {
    return {
      id: item.id || item.code || String(Math.random()),
      title: item.name || item.title || item.code || '未命名',
      subtitle: item.description || item.address || item.remark || '',
      tags: item.tags || [module.label],
      type: moduleName,
      data: item,
    };
  }

  /**
   * 添加钩子函数
   * @param {string} hookName - 钩子名称
   * @param {Function} fn - 钩子函数
   * @returns {Function} 移除钩子的函数
   */
  addHook(hookName, fn) {
    if (this.hooks[hookName]) {
      this.hooks[hookName].push(fn);
    }
    return () => this.removeHook(hookName, fn);
  }

  /**
   * 移除钩子函数
   * @param {string} hookName - 钩子名称
   * @param {Function} fn - 钩子函数
   * @returns {SearchRegistry}
   */
  removeHook(hookName, fn) {
    if (this.hooks[hookName]) {
      const index = this.hooks[hookName].indexOf(fn);
      if (index > -1) {
        this.hooks[hookName].splice(index, 1);
      }
    }
    return this;
  }

  /**
   * 执行钩子函数
   * @param {string} hookName - 钩子名称
   * @param {Object} context - 上下文数据
   */
  async runHooks(hookName, context) {
    if (this.hooks[hookName]) {
      for (const fn of this.hooks[hookName]) {
        try {
          await fn(context);
        } catch (error) {
          logger.error(`钩子函数执行失败 [${hookName}]:`, error);
        }
      }
    }
  }

  /**
   * 清空所有模块
   * @returns {SearchRegistry}
   */
  clear() {
    this.modules.clear();
    logger.debug('清空所有搜索模块');
    return this;
  }

  /**
   * 清空所有模块和钩子（别名方法，用于测试）
   * @returns {SearchRegistry}
   */
  clearAll() {
    this.modules.clear();
    this.hooks.beforeSearch = [];
    this.hooks.afterSearch = [];
    this.hooks.onError = [];
    logger.debug('清空所有搜索模块和钩子');
    return this;
  }

  /**
   * 获取注册统计信息
   * @returns {Object}
   */
  getStats() {
    const allModules = Array.from(this.modules.values());
    return {
      total: allModules.length,
      enabled: allModules.filter((m) => m.enabled).length,
      disabled: allModules.filter((m) => !m.enabled).length,
      modules: allModules.map((m) => ({
        name: m.name,
        label: m.label,
        enabled: m.enabled,
        priority: m.priority,
      })),
    };
  }
}

// 创建单例实例
export const searchRegistry = new SearchRegistry();

// 便捷导出
export const registerSearchModule = (moduleName, config) => searchRegistry.register(moduleName, config);
export const unregisterSearchModule = (moduleName) => searchRegistry.unregister(moduleName);
export const searchAll = (query, options) => searchRegistry.search(query, options);
export const getSearchStats = () => searchRegistry.getStats();
export const getRegisteredModules = () => searchRegistry.getAllModules();
export const clearAllModules = () => searchRegistry.clearAll();

export default searchRegistry;
