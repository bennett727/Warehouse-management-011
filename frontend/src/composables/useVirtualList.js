/**
 * 虚拟列表组合式函数
 * @file: useVirtualList.js
 * @description: 提供大数据量列表的虚拟滚动支持，优化渲染性能
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0
 */

import { computed, nextTick, ref, watch } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('useVirtualList');

/**
 * 默认配置
 */
const DEFAULT_OPTIONS = {
  itemHeight: 50, // 默认每项高度
  bufferSize: 5, // 缓冲区大小（上下各多渲染几项）
  containerHeight: 400, // 容器默认高度
};

/**
 * 虚拟列表组合式函数
 * @param {Ref<Array>} listRef - 列表数据引用
 * @param {Object} options - 配置选项
 * @returns {Object} 虚拟列表相关状态和方法
 */
export function useVirtualList(listRef, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // 容器相关
  const containerRef = ref(null);
  const containerHeight = ref(config.containerHeight);
  const scrollTop = ref(0);

  // 列表总高度
  const totalHeight = computed(() => {
    return (listRef.value?.length || 0) * config.itemHeight;
  });

  // 可视区域能显示的项数
  const visibleCount = computed(() => {
    return Math.ceil(containerHeight.value / config.itemHeight);
  });

  // 起始索引（考虑缓冲区）
  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / config.itemHeight);
    return Math.max(0, index - config.bufferSize);
  });

  // 结束索引（考虑缓冲区）
  const endIndex = computed(() => {
    const index = Math.floor(scrollTop.value / config.itemHeight) + visibleCount.value;
    return Math.min((listRef.value?.length || 0) - 1, index + config.bufferSize);
  });

  // 实际渲染的列表数据
  const visibleData = computed(() => {
    const list = listRef.value || [];
    return list.slice(startIndex.value, endIndex.value + 1).map((item, index) => ({
      ...item,
      _index: startIndex.value + index,
      _style: {
        position: 'absolute',
        top: `${(startIndex.value + index) * config.itemHeight}px`,
        height: `${config.itemHeight}px`,
        width: '100%',
      },
    }));
  });

  // 偏移量（用于定位可视区域）
  const offsetStyle = computed(() => ({
    paddingTop: `${startIndex.value * config.itemHeight}px`,
    paddingBottom: `${Math.max(0, totalHeight.value - (endIndex.value + 1) * config.itemHeight)}px`,
  }));

  // 列表容器样式
  const listStyle = computed(() => ({
    height: `${totalHeight.value}px`,
    position: 'relative',
  }));

  /**
   * 处理滚动事件
   * @param {Event} event - 滚动事件
   */
  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop;
  };

  /**
   * 滚动到指定索引
   * @param {number} index - 目标索引
   */
  const scrollToIndex = (index) => {
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = index * config.itemHeight;
      }
    });
  };

  /**
   * 滚动到顶部
   */
  const scrollToTop = () => {
    scrollToIndex(0);
  };

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = totalHeight.value;
      }
    });
  };

  /**
   * 更新容器高度
   */
  const updateContainerHeight = () => {
    nextTick(() => {
      if (containerRef.value) {
        containerHeight.value = containerRef.value.clientHeight;
      }
    });
  };

  // 监听容器大小变化
  watch(containerRef, (newVal) => {
    if (newVal) {
      updateContainerHeight();

      // 使用 ResizeObserver 监听容器大小变化
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(() => {
          updateContainerHeight();
        });
        resizeObserver.observe(newVal);

        // 组件卸载时清理
        return () => {
          resizeObserver.disconnect();
        };
      }
    }
  });

  return {
    // 状态
    containerRef,
    scrollTop,
    totalHeight,
    visibleCount,
    startIndex,
    endIndex,
    visibleData,
    offsetStyle,
    listStyle,

    // 方法
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    updateContainerHeight,
  };
}

/**
 * 动态高度虚拟列表组合式函数
 * @param {Ref<Array>} listRef - 列表数据引用
 * @param {Object} options - 配置选项
 * @returns {Object} 虚拟列表相关状态和方法
 */
export function useDynamicVirtualList(listRef, options = {}) {
  const config = {
    estimateHeight: 50, // 预估每项高度
    bufferSize: 5,
    containerHeight: 400,
    ...options,
  };

  const containerRef = ref(null);
  const containerHeight = ref(config.containerHeight);
  const scrollTop = ref(0);
  const heightCache = ref(new Map()); // 缓存每项实际高度

  // 获取项高度
  const getItemHeight = (index) => {
    return heightCache.value.get(index) || config.estimateHeight;
  };

  // 计算累计高度
  const getOffsetHeight = (index) => {
    let height = 0;
    for (let i = 0; i < index; i++) {
      height += getItemHeight(i);
    }
    return height;
  };

  // 根据滚动位置查找起始索引
  const findStartIndex = (scrollTop) => {
    let totalHeight = 0;
    for (let i = 0; i < (listRef.value?.length || 0); i++) {
      totalHeight += getItemHeight(i);
      if (totalHeight >= scrollTop) {
        return i;
      }
    }
    return 0;
  };

  // 总高度
  const totalHeight = computed(() => {
    let height = 0;
    for (let i = 0; i < (listRef.value?.length || 0); i++) {
      height += getItemHeight(i);
    }
    return height;
  });

  // 起始索引
  const startIndex = computed(() => {
    const index = findStartIndex(scrollTop.value);
    return Math.max(0, index - config.bufferSize);
  });

  // 结束索引
  const endIndex = computed(() => {
    let currentHeight = 0;
    const visibleHeight = containerHeight.value;

    for (let i = startIndex.value; i < (listRef.value?.length || 0); i++) {
      currentHeight += getItemHeight(i);
      if (currentHeight >= visibleHeight + config.bufferSize * config.estimateHeight) {
        return Math.min((listRef.value?.length || 0) - 1, i);
      }
    }
    return (listRef.value?.length || 0) - 1;
  });

  // 可视数据
  const visibleData = computed(() => {
    const list = listRef.value || [];
    return list.slice(startIndex.value, endIndex.value + 1).map((item, index) => {
      const realIndex = startIndex.value + index;
      return {
        ...item,
        _index: realIndex,
        _style: {
          position: 'absolute',
          top: `${getOffsetHeight(realIndex)}px`,
          width: '100%',
        },
      };
    });
  });

  // 偏移样式
  const offsetStyle = computed(() => ({
    paddingTop: `${getOffsetHeight(startIndex.value)}px`,
    paddingBottom: `${Math.max(0, totalHeight.value - getOffsetHeight(endIndex.value + 1))}px`,
  }));

  // 列表样式
  const listStyle = computed(() => ({
    height: `${totalHeight.value}px`,
    position: 'relative',
  }));

  /**
   * 更新项高度缓存
   * @param {number} index - 索引
   * @param {number} height - 高度
   */
  const updateItemHeight = (index, height) => {
    heightCache.value.set(index, height);
  };

  /**
   * 处理滚动
   * @param {Event} event - 滚动事件
   */
  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop;
  };

  /**
   * 滚动到指定索引
   * @param {number} index - 目标索引
   */
  const scrollToIndex = (index) => {
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = getOffsetHeight(index);
      }
    });
  };

  /**
   * 清空高度缓存
   */
  const clearHeightCache = () => {
    heightCache.value.clear();
  };

  return {
    containerRef,
    scrollTop,
    totalHeight,
    startIndex,
    endIndex,
    visibleData,
    offsetStyle,
    listStyle,
    handleScroll,
    scrollToIndex,
    updateItemHeight,
    clearHeightCache,
  };
}

/**
 * 分页加载组合式函数
 * @param {Function} fetchFn - 数据获取函数
 * @param {Object} options - 配置选项
 * @returns {Object} 分页加载相关状态和方法
 */
export function useInfiniteScroll(fetchFn, options = {}) {
  const config = {
    pageSize: 20,
    threshold: 100, // 距离底部多少像素触发加载
    ...options,
  };

  const list = ref([]);
  const loading = ref(false);
  const finished = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const containerRef = ref(null);

  /**
   * 加载数据
   * @param {boolean} isRefresh - 是否刷新
   */
  const loadData = async (isRefresh = false) => {
    if (loading.value || (finished.value && !isRefresh)) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const page = isRefresh ? 1 : currentPage.value;
      const result = await fetchFn({
        page,
        pageSize: config.pageSize,
      });

      const items = result.data || result.list || [];
      const total = result.total || 0;

      if (isRefresh) {
        list.value = items;
        currentPage.value = 1;
        finished.value = false;
      } else {
        list.value.push(...items);
        currentPage.value++;
      }

      // 检查是否已加载全部数据
      if (list.value.length >= total || items.length < config.pageSize) {
        finished.value = true;
      }
    } catch (err) {
      error.value = err;
      logger.error('Failed to load data:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 处理滚动
   * @param {Event} event - 滚动事件
   */
  const handleScroll = (event) => {
    const { target } = event;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom < config.threshold && !loading.value && !finished.value) {
      loadData();
    }
  };

  /**
   * 刷新数据
   */
  const refresh = () => {
    return loadData(true);
  };

  /**
   * 重置状态
   */
  const reset = () => {
    list.value = [];
    loading.value = false;
    finished.value = false;
    error.value = null;
    currentPage.value = 1;
  };

  return {
    list,
    loading,
    finished,
    error,
    containerRef,
    loadData,
    handleScroll,
    refresh,
    reset,
  };
}

export default useVirtualList;
