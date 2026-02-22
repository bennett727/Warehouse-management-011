/**
 * 防抖节流组合式函数
 * @file: useDebounce.js
 * @description: 提供防抖和节流功能的组合式函数
 * @author: 技术架构团队
 * @version: 1.0
 */

import { ref, watch } from 'vue';

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;

  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, limit = 100) {
  let inThrottle = false;

  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 防抖Ref
 * @param {*} initialValue - 初始值
 * @param {number} delay - 延迟时间
 * @returns {Object} 包含value和debouncedValue的对象
 */
export function useDebouncedRef(initialValue, delay = 300) {
  const value = ref(initialValue);
  const debouncedValue = ref(initialValue);
  let timeout = null;

  watch(value, (newValue) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return {
    value,
    debouncedValue,
  };
}

/**
 * 搜索防抖Hook
 * @param {Function} searchFn - 搜索函数
 * @param {number} delay - 延迟时间
 * @returns {Object} 搜索相关的方法和状态
 */
export function useSearchDebounce(searchFn, delay = 300) {
  const searchQuery = ref('');
  const isSearching = ref(false);
  const searchResults = ref([]);
  let debounceTimer = null;

  const debouncedSearch = (query) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      if (!query || query.trim() === '') {
        searchResults.value = [];
        isSearching.value = false;
        return;
      }

      isSearching.value = true;
      try {
        const results = await searchFn(query);
        searchResults.value = results;
      } catch (error) {
        console.error('搜索失败:', error);
        searchResults.value = [];
      } finally {
        isSearching.value = false;
      }
    }, delay);
  };

  // 监听搜索词变化
  watch(searchQuery, (newQuery) => {
    debouncedSearch(newQuery);
  });

  // 立即搜索（用于回车键）
  const immediateSearch = async () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const query = searchQuery.value;
    if (!query || query.trim() === '') {
      searchResults.value = [];
      return;
    }

    isSearching.value = true;
    try {
      const results = await searchFn(query);
      searchResults.value = results;
    } catch (error) {
      console.error('搜索失败:', error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  };

  // 清空搜索
  const clearSearch = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    searchQuery.value = '';
    searchResults.value = [];
    isSearching.value = false;
  };

  return {
    searchQuery,
    isSearching,
    searchResults,
    immediateSearch,
    clearSearch,
  };
}

/**
 * 输入防抖Hook
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间
 * @returns {Object} 输入相关的方法和状态
 */
export function useInputDebounce(callback, delay = 300) {
  const inputValue = ref('');
  let debounceTimer = null;

  const handleInput = (value) => {
    inputValue.value = value;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      callback(value);
    }, delay);
  };

  // 立即执行
  const handleImmediate = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    callback(inputValue.value);
  };

  return {
    inputValue,
    handleInput,
    handleImmediate,
  };
}

/**
 * 滚动节流Hook
 * @param {Function} callback - 滚动回调函数
 * @param {number} limit - 限制时间
 * @returns {Object} 滚动相关的方法
 */
export function useScrollThrottle(callback, limit = 100) {
  let isThrottled = false;

  const handleScroll = (event) => {
    if (!isThrottled) {
      callback(event);
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, limit);
    }
  };

  return {
    handleScroll,
  };
}

/**
 * 窗口调整节流Hook
 * @param {Function} callback - 调整大小回调函数
 * @param {number} limit - 限制时间
 * @returns {Object} 调整大小相关的方法
 */
export function useResizeThrottle(callback, limit = 200) {
  let isThrottled = false;

  const handleResize = () => {
    if (!isThrottled) {
      callback();
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, limit);
    }
  };

  return {
    handleResize,
  };
}

export default {
  debounce,
  throttle,
  useDebouncedRef,
  useSearchDebounce,
  useInputDebounce,
  useScrollThrottle,
  useResizeThrottle,
};
