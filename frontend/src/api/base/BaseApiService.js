/**
 * 基础API服务类
 * @file: BaseApiService.js
 * @description: 提供通用的API调用方法，包括请求封装、错误处理、缓存等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import cache from '@/utils/cache';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('BaseApiService');

/**
 * 基础API服务类
 * 提供通用的CRUD操作和高级查询功能
 */
export class BaseApiService {
  constructor(resourcePath, options = {}) {
    this.resourcePath = resourcePath;
    this.options = {
      enableCache: false,
      cacheTimeout: 5 * 60 * 1000,
      enableRetry: true,
      ...options,
    };
  }

  /**
   * 获取完整URL路径
   * @param {string} path - 相对路径
   * @returns {string} 完整URL
   */
  getUrl(path = '') {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath ? `${this.resourcePath}/${cleanPath}` : this.resourcePath;
  }

  /**
   * GET请求
   * @param {string} path - 路径
   * @param {object} params - 查询参数
   * @param {object} config - 请求配置
   * @returns {Promise} 响应数据
   */
  async get(path = '', params = {}, config = {}) {
    const url = this.getUrl(path);
    logger.debug(`[GET] ${url}`, params);

    try {
      const hasParams = Object.keys(params).length > 0;
      const hasConfig = Object.keys(config).length > 0;

      let response;
      if (hasParams && !hasConfig) {
        response = await request.get(url, params);
      } else if (hasParams || hasConfig) {
        const requestConfig = { ...config };
        if (hasParams) {
          requestConfig.params = params;
        }
        response = await request.get(url, requestConfig);
      } else {
        response = await request.get(url);
      }
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'GET', url);
    }
  }

  /**
   * POST请求
   * @param {string} path - 路径
   * @param {object} data - 请求数据
   * @param {object} config - 请求配置
   * @returns {Promise} 响应数据
   */
  async post(path = '', data = {}, config = {}) {
    const url = this.getUrl(path);
    logger.debug(`[POST] ${url}`, data);

    try {
      const response =
        Object.keys(config).length > 0 ? await request.post(url, data, config) : await request.post(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'POST', url);
    }
  }

  /**
   * PUT请求
   * @param {string} path - 路径
   * @param {object} data - 请求数据
   * @param {object} config - 请求配置
   * @returns {Promise} 响应数据
   */
  async put(path = '', data = {}, config = {}) {
    const url = this.getUrl(path);
    logger.debug(`[PUT] ${url}`, data);

    try {
      const response =
        Object.keys(config).length > 0 ? await request.put(url, data, config) : await request.put(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'PUT', url);
    }
  }

  /**
   * DELETE请求
   * @param {string} path - 路径
   * @param {object} config - 请求配置
   * @returns {Promise} 响应数据
   */
  async delete(path = '', config = {}) {
    const url = this.getUrl(path);
    logger.debug(`[DELETE] ${url}`);

    try {
      const response = Object.keys(config).length > 0 ? await request.delete(url, config) : await request.delete(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'DELETE', url);
    }
  }

  /**
   * PATCH请求
   * @param {string} path - 路径
   * @param {object} data - 请求数据
   * @param {object} config - 请求配置
   * @returns {Promise} 响应数据
   */
  async patch(path = '', data = {}, config = {}) {
    const url = this.getUrl(path);
    logger.debug(`[PATCH] ${url}`, data);

    try {
      const response =
        Object.keys(config).length > 0 ? await request.patch(url, data, config) : await request.patch(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'PATCH', url);
    }
  }

  /**
   * 处理响应数据
   * @param {object} response - 响应对象
   * @returns {object} 处理后的数据
   */
  handleResponse(response) {
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} method - 请求方法
   * @param {string} url - 请求URL
   * @returns {Promise} 拒绝的Promise
   */
  handleError(error, method, url) {
    logger.error(`[${method}] ${url} 请求失败:`, error);

    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
      throw new Error(errorData);
    }

    if (error.message) {
      throw new Error(error.message);
    }

    throw new Error('未知错误');
  }

  /**
   * 获取列表数据（分页）
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.orderBy - 排序字段
   * @param {string} params.orderDirection - 排序方向
   * @returns {Promise} 列表数据
   */
  async getList(params = {}) {
    return this.get('', params);
  }

  /**
   * 获取所有数据（不分页）
   * @param {object} params - 查询参数
   * @returns {Promise} 所有数据
   */
  async getAll(params = {}) {
    return this.get('all', params);
  }

  /**
   * 根据ID获取详情
   * @param {string|number} id - 资源ID
   * @param {object} params - 查询参数
   * @returns {Promise} 详情数据
   */
  async getById(id, params = {}) {
    return this.get(String(id), params);
  }

  /**
   * 创建资源
   * @param {object} data - 资源数据
   * @returns {Promise} 创建结果
   */
  async create(data) {
    return this.post('', data);
  }

  /**
   * 更新资源
   * @param {string|number} id - 资源ID
   * @param {object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  async update(id, data) {
    return this.put(String(id), data);
  }

  /**
   * 删除资源
   * @param {string|number} id - 资源ID
   * @returns {Promise} 删除结果
   */
  async remove(id) {
    return this.delete(String(id));
  }

  /**
   * 批量删除资源
   * @param {Array<string|number>} ids - 资源ID数组
   * @returns {Promise} 删除结果
   */
  async batchRemove(ids) {
    return this.delete('batch', { data: { ids } });
  }

  /**
   * 批量创建资源
   * @param {string} path - 路径
   * @param {Array<object>} items - 资源数据数组
   * @returns {Promise} 创建结果
   */
  async batchCreate(path = '', items = []) {
    const url = this.getUrl(`${path.replace(/^\/+/, '')}/batch`);
    logger.debug(`[BATCH CREATE] ${url}`, items);

    try {
      const response = await request.post(url, { items });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'POST', url);
    }
  }

  /**
   * 批量更新资源
   * @param {string} path - 路径
   * @param {Array<object>} items - 资源数据数组
   * @returns {Promise} 更新结果
   */
  async batchUpdate(path = '', items = []) {
    const url = this.getUrl(`${path.replace(/^\/+/, '')}/batch`);
    logger.debug(`[BATCH UPDATE] ${url}`, items);

    try {
      const response = await request.put(url, { items });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'PUT', url);
    }
  }

  /**
   * 批量删除资源
   * @param {string} path - 路径
   * @param {Array<string|number>} ids - 资源ID数组
   * @returns {Promise} 删除结果
   */
  async batchDelete(path = '', ids = []) {
    const url = this.getUrl(`${path.replace(/^\/+/, '')}/batch`);
    logger.debug(`[BATCH DELETE] ${url}`, ids);

    try {
      const response = await request.delete(url, { data: { ids } });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'DELETE', url);
    }
  }

  /**
   * 上传文件
   * @param {string} path - 上传路径
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 上传结果
   */
  async uploadFile(path = '', formData = new FormData()) {
    const url = this.getUrl(path.replace(/^\/+/, ''));
    logger.debug(`[UPLOAD] ${url}`);

    try {
      const response = await request.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'POST', url);
    }
  }

  /**
   * 下载文件
   * @param {string} path - 下载路径
   * @param {object} params - 查询参数
   * @returns {Promise} 下载结果
   */
  async downloadFile(path = '', params = {}) {
    const url = this.getUrl(path.replace(/^\/+/, ''));
    logger.debug(`[DOWNLOAD] ${url}`, params);

    try {
      const hasParams = Object.keys(params).length > 0;
      let response;
      if (hasParams) {
        response = await request.get(url, { params, responseType: 'blob' });
      } else {
        response = await request.get(url, { responseType: 'blob' });
      }
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, 'GET', url);
    }
  }

  /**
   * 导出数据
   * @param {object} params - 查询参数
   * @returns {Promise} 导出结果
   */
  async export(params = {}) {
    return this.get('export', params, { responseType: 'blob' });
  }

  /**
   * 导入数据
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 导入结果
   */
  async import(formData) {
    return this.post('import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any} 缓存数据
   */
  getCache(key) {
    if (!this.options.enableCache) {
      return null;
    }
    return cache.get(key);
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   */
  setCache(key, data) {
    if (!this.options.enableCache) {
      return;
    }
    cache.set(key, data, this.options.cacheTimeout);
  }

  /**
   * 清除缓存
   * @param {string} key - 缓存键（不传则清除所有）
   */
  clearCache(key) {
    if (key) {
      cache.remove(key);
    } else {
      cache.clear();
    }
  }
}

export default BaseApiService;
