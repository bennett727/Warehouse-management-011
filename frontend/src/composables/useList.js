/**
 * 通用列表Composable
 * @file: useList.js
 * @description: 提供通用的列表管理逻辑，包括分页、筛选、搜索等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('useList');

/**
 * 通用列表Composable
 * @param {Function} fetchFn - 数据获取函数
 * @param {object} options - 配置选项
 * @param {boolean} options.autoLoad - 是否自动加载数据
 * @param {number} options.defaultPageSize - 默认每页数量
 * @param {Array<string>} options.filterFields - 筛选字段列表
 * @param {string} options.itemKey - 项目唯一标识字段，默认为'id'
 * @param {Array<number>} options.pageSizeOptions - 分页大小选项
 * @returns {object} 列表管理状态和方法
 */
export function useList(fetchFn, options = {}) {
  const {
    autoLoad = true,
    defaultPageSize = 10,
    filterFields = [],
    itemKey = 'id',
    pageSizeOptions = [10, 20, 50, 100],
  } = options;

  // ==================== 列表状态 ====================
  const list = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(defaultPageSize);
  const total = ref(0);
  const selectedItems = ref([]);
  const sortField = ref('');
  const sortOrder = ref('');

  // ==================== 筛选状态 ====================
  const searchKeyword = ref('');
  const filters = ref({});

  filterFields.forEach((field) => {
    filters.value[field] = '';
  });

  // ==================== 计算属性 ====================
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1);
  const hasData = computed(() => list.value.length > 0);
  const isEmpty = computed(() => list.value.length === 0 && !loading.value);
  const hasMore = computed(() => total.value === 0 || total.value > list.value.length);
  const hasSelection = computed(() => selectedItems.value.length > 0);
  const allSelected = computed(() => {
    return list.value.length > 0 && selectedItems.value.length === list.value.length;
  });
  const selectedItemIds = computed(() => {
    return selectedItems.value.map((item) => item[itemKey]);
  });

  // ==================== 方法 ====================

  /**
   * 加载列表数据
   * @param {object} params - 查询参数
   * @param {boolean} append - 是否追加数据（用于loadMore）
   * @returns {Promise<void>}
   */
  async function loadList(params = {}, append = false) {
    loading.value = true;
    try {
      const queryParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        sortBy: sortField.value,
        sortOrder: sortOrder.value,
        ...filters.value,
        ...params,
      };

      logger.debug('[useList.loadList] 请求参数:', queryParams);
      const response = await fetchFn(queryParams);

      if (response && (response.list || response.records || response.items || response.data)) {
        const newData = response.list || response.records || response.items || response.data;
        if (append) {
          list.value = [...list.value, ...newData];
        } else {
          list.value = newData;
        }
        total.value = response.total || 0;
      } else {
        if (!append) {
          list.value = [];
        }
        total.value = 0;
      }
    } catch (error) {
      logger.error('[useList.loadList] 请求失败:', error);
      ElMessage.error('加载数据失败');
      if (!append) {
        list.value = [];
      }
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 搜索
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<void>}
   */
  async function search(keyword) {
    searchKeyword.value = keyword;
    currentPage.value = 1;
    await loadList();
  }

  /**
   * 设置筛选条件
   * @param {object} newFilters - 新的筛选条件
   * @returns {Promise<void>}
   */
  async function setFilters(newFilters) {
    Object.assign(filters.value, newFilters);
    currentPage.value = 1;
    await loadList();
  }

  /**
   * 重置筛选条件
   * @returns {Promise<void>}
   */
  async function resetFilters() {
    searchKeyword.value = '';
    filters.value = {};
    currentPage.value = 1;
    await loadList();
  }

  /**
   * 刷新列表
   * @returns {Promise<void>}
   */
  async function refresh() {
    await loadList();
  }

  /**
   * 分页大小变化
   * @param {number} size - 新的每页数量
   * @returns {Promise<void>}
   */
  async function handleSizeChange(size) {
    pageSize.value = size;
    currentPage.value = 1;
    await loadList();
  }

  /**
   * 当前页变化
   * @param {number} page - 新的当前页
   * @returns {Promise<void>}
   */
  async function handleCurrentChange(page) {
    currentPage.value = page;
    await loadList();
  }

  /**
   * 跳转到指定页
   * @param {number} page - 目标页码
   * @returns {Promise<void>}
   */
  async function goToPage(page) {
    if (page < 1 || page > totalPages.value) {
      return;
    }
    currentPage.value = page;
    await loadList();
  }

  /**
   * 获取第一页
   * @returns {Promise<void>}
   */
  async function goToFirstPage() {
    await goToPage(1);
  }

  /**
   * 获取最后一页
   * @returns {Promise<void>}
   */
  async function goToLastPage() {
    await goToPage(totalPages.value);
  }

  /**
   * 获取下一页
   * @returns {Promise<void>}
   */
  async function goToNextPage() {
    if (currentPage.value < totalPages.value) {
      await goToPage(currentPage.value + 1);
    }
  }

  /**
   * 获取上一页
   * @returns {Promise<void>}
   */
  async function goToPrevPage() {
    if (currentPage.value > 1) {
      await goToPage(currentPage.value - 1);
    }
  }

  /**
   * 加载更多数据
   * @returns {Promise<void>}
   */
  async function loadMore() {
    if (loading.value || !hasMore.value) {
      return;
    }
    currentPage.value++;
    await loadList({}, true);
  }

  /**
   * 设置单个筛选条件
   * @param {string} key - 筛选字段名
   * @param {any} value - 筛选值
   * @returns {Promise<void>}
   */
  async function setFilter(key, value) {
    filters.value[key] = value;
    currentPage.value = 1;
    await loadList();
  }

  /**
   * 全选/取消全选
   * @param {boolean} selected - 是否全选
   */
  function toggleSelectAll(selected) {
    if (selected) {
      selectedItems.value = [...list.value];
    } else {
      selectedItems.value = [];
    }
  }

  /**
   * 切换选中状态
   * @param {object} item - 要切换的项目
   */
  function toggleSelectItem(item) {
    const index = selectedItems.value.findIndex((selectedItem) => selectedItem[itemKey] === item[itemKey]);
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    } else {
      selectedItems.value.push(item);
    }
  }

  /**
   * 清空选中项
   */
  function clearSelection() {
    selectedItems.value = [];
  }

  /**
   * 设置排序
   * @param {string} field - 排序字段
   * @param {string} order - 排序顺序 ('asc' 或 'desc')
   * @returns {Promise<void>}
   */
  async function sort(field, order) {
    if (order) {
      if (sortField.value === field && sortOrder.value === order) {
        sortField.value = '';
        sortOrder.value = '';
      } else {
        sortField.value = field;
        sortOrder.value = order;
      }
    } else if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortField.value = field;
      sortOrder.value = 'asc';
    }
    currentPage.value = 1;
    await loadList();
  }

  /**
   * 清除排序
   * @returns {Promise<void>}
   */
  async function clearSort() {
    await sort('', '');
  }

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      loadList();
    });
  }

  return {
    // 状态
    list,
    loading,
    currentPage,
    pageSize,
    total,
    searchKeyword,
    filters,
    selectedItems,
    sortField,
    sortOrder,

    // 配置
    itemKey,
    pageSizeOptions,

    // 计算属性
    totalPages,
    hasData,
    isEmpty,
    hasMore,
    hasSelection,
    allSelected,
    selectedItemIds,

    // 方法
    loadList,
    loadMore,
    search,
    setFilters,
    setFilter,
    resetFilters,
    refresh,
    handleSizeChange,
    handleCurrentChange,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    sort,
    clearSort,
  };
}

export default useList;
