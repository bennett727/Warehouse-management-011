/**
 * 基础Store类
 * @file: BaseStore.js
 * @description: 提供通用的状态管理功能，包括加载状态、错误处理、数据规范化等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('BaseStore');

/**
 * 基础Store类
 * 提供通用的状态管理方法和工具函数
 */
export class BaseStore {
  constructor(storeName) {
    this.storeName = storeName;
    this._state = {};
    this._actions = {};
    this._getters = {};
  }

  /**
   * 创建加载状态
   * @param {string} key - 状态键名
   * @returns {object} 加载状态对象
   */
  createLoadingState(key = 'loading') {
    const loading = ref(false);
    this._state[key] = loading;
    return loading;
  }

  /**
   * 创建操作加载状态
   * @param {Array<string>} operations - 操作名称列表
   * @returns {object} 操作加载状态对象
   */
  createOperationLoading(operations = []) {
    const operationLoading = ref({});
    operations.forEach((op) => {
      operationLoading.value[op] = false;
    });
    this._state.operationLoading = operationLoading;
    return operationLoading;
  }

  /**
   * 创建列表状态
   * @param {string} key - 列表键名
   * @returns {object} 列表状态对象
   */
  createListState(key = 'list') {
    const list = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);

    this._state[key] = list;
    this._state[`${key}Total`] = total;
    this._state[`${key}CurrentPage`] = currentPage;
    this._state[`${key}PageSize`] = pageSize;

    return { list, total, currentPage, pageSize };
  }

  /**
   * 创建筛选状态
   * @param {object} filters - 筛选字段配置
   * @returns {object} 筛选状态对象
   */
  createFilterState(filters = {}) {
    const filterState = ref({});
    Object.keys(filters).forEach((key) => {
      filterState.value[key] = filters[key].default || '';
    });
    this._state.filters = filterState;
    return filterState;
  }

  /**
   * 创建详情状态
   * @param {string} key - 详情键名
   * @returns {object} 详情状态对象
   */
  createDetailState(key = 'detail') {
    const detail = ref(null);
    const detailLoading = ref(false);
    this._state[key] = detail;
    this._state[`${key}Loading`] = detailLoading;
    return { detail, detailLoading };
  }

  /**
   * 执行异步操作
   * @param {Function} asyncFn - 异步函数
   * @param {object} options - 配置选项
   * @param {string} options.loadingKey - 加载状态键名
   * @param {string} options.successMessage - 成功消息
   * @param {string} options.errorMessage - 错误消息
   * @param {Function} options.onSuccess - 成功回调
   * @param {Function} options.onError - 错误回调
   * @returns {Promise} 异步操作结果
   */
  async executeAsync(asyncFn, options = {}) {
    const {
      loadingKey = 'loading',
      successMessage = '',
      errorMessage = '',
      onSuccess = null,
      onError = null,
    } = options;

    const loading = this._state[loadingKey];
    if (loading) {
      loading.value = true;
    }

    try {
      const result = await asyncFn();

      if (successMessage) {
        ElMessage.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const message = errorMessage || '操作失败';
      ElMessage.error(message);
      logger.error(`[${this.storeName}] ${message}:`, error);

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      if (loading) {
        loading.value = false;
      }
    }
  }

  /**
   * 创建分页计算属性
   * @param {string} listKey - 列表键名
   * @param {string} totalKey - 总数键名
   * @param {string} currentPageKey - 当前页键名
   * @param {string} pageSizeKey - 每页大小键名
   * @returns {object} 分页计算属性
   */
  createPaginationComputed(
    listKey = 'list',
    totalKey = 'listTotal',
    currentPageKey = 'listCurrentPage',
    pageSizeKey = 'listPageSize'
  ) {
    const list = this._state[listKey];
    const total = this._state[totalKey];
    const currentPage = this._state[currentPageKey];
    const pageSize = this._state[pageSizeKey];

    return {
      list: computed(() => list.value),
      total: computed(() => total.value),
      currentPage: computed(() => currentPage.value),
      pageSize: computed(() => pageSize.value),
      totalPages: computed(() => Math.ceil(total.value / pageSize.value) || 1),
    };
  }

  /**
   * 创建筛选后的列表计算属性
   * @param {string} listKey - 列表键名
   * @param {string} filtersKey - 筛选键名
   * @param {Function} filterFn - 自定义筛选函数
   * @returns {ComputedRef} 筛选后的列表
   */
  createFilteredComputed(listKey = 'list', filtersKey = 'filters', filterFn = null) {
    const list = this._state[listKey];
    const filters = this._state[filtersKey];

    return computed(() => {
      if (!filters) {
        return list.value;
      }

      const result = [...list.value];

      if (filterFn) {
        return filterFn(result, filters.value);
      }

      return result;
    });
  }

  /**
   * 重置状态
   * @param {Array<string>} keys - 要重置的状态键名
   */
  resetState(keys = []) {
    keys.forEach((key) => {
      const state = this._state[key];
      if (state && typeof state.value !== 'undefined') {
        if (Array.isArray(state.value)) {
          state.value = [];
        } else if (typeof state.value === 'object') {
          state.value = {};
        } else {
          state.value = null;
        }
      }
    });
  }

  /**
   * 重置筛选条件
   * @param {string} filtersKey - 筛选键名
   */
  resetFilters(filtersKey = 'filters') {
    const filters = this._state[filtersKey];
    if (filters) {
      Object.keys(filters.value).forEach((key) => {
        filters.value[key] = '';
      });
    }
  }

  /**
   * 重置分页
   * @param {string} currentPageKey - 当前页键名
   */
  resetPagination(currentPageKey = 'listCurrentPage') {
    const currentPage = this._state[currentPageKey];
    if (currentPage) {
      currentPage.value = 1;
    }
  }

  /**
   * 获取状态值
   * @param {string} key - 状态键名
   * @returns {any} 状态值
   */
  getState(key) {
    const state = this._state[key];
    return state ? state.value : undefined;
  }

  /**
   * 设置状态值
   * @param {string} key - 状态键名
   * @param {any} value - 状态值
   */
  setState(key, value) {
    const state = this._state[key];
    if (state) {
      state.value = value;
    }
  }

  /**
   * 批量设置状态
   * @param {object} states - 状态键值对
   */
  setStates(states) {
    Object.keys(states).forEach((key) => {
      this.setState(key, states[key]);
    });
  }

  /**
   * 导出状态和方法
   * @returns {object} 状态和方法对象
   */
  export() {
    const result = {};

    Object.keys(this._state).forEach((key) => {
      result[key] = this._state[key];
    });

    return result;
  }
}

export default BaseStore;
