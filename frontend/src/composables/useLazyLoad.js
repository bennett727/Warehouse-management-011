/**
 * 图片懒加载 Composable
 * 实现图片的延迟加载，优化页面性能
 * @file: useLazyLoad.js
 * @description: 图片懒加载功能
 * @version: 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 图片懒加载配置
 */
const LAZY_LOAD_CONFIG = {
  // 根元素
  root: null,
  // 根边距
  rootMargin: '50px',
  // 阈值
  threshold: 0.01,
};

/**
 * 使用图片懒加载
 * @param {Object} options - 配置选项
 * @returns {Object} 懒加载相关方法和状态
 */
export function useLazyLoad(options = {}) {
  const config = { ...LAZY_LOAD_CONFIG, ...options };
  const observer = ref(null);
  const loadedImages = ref(new Set());
  const isSupported = ref('IntersectionObserver' in window);

  /**
   * 创建 Intersection Observer
   */
  const createObserver = () => {
    if (!isSupported.value) {
      return null;
    }

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          observer.value?.unobserve(entry.target);
        }
      });
    }, config);
  };

  /**
   * 加载图片
   */
  const loadImage = (img) => {
    const { src } = img.dataset;
    const { srcset } = img.dataset;

    if (!src) {
      return;
    }

    // 创建新图片对象预加载
    const image = new Image();

    image.onload = () => {
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }
      img.classList.add('lazy-loaded');
      img.classList.remove('lazy-loading');
      loadedImages.value.add(src);
    };

    image.onerror = () => {
      img.classList.add('lazy-error');
      img.classList.remove('lazy-loading');
      // 使用占位图
      img.src = '/placeholder-image.png';
    };

    img.classList.add('lazy-loading');
    image.src = src;
  };

  /**
   * 观察元素
   */
  const observe = (el) => {
    if (!observer.value || !el) {
      return;
    }

    // 如果图片已经加载，直接显示
    if (el.dataset.src && loadedImages.value.has(el.dataset.src)) {
      el.src = el.dataset.src;
      el.classList.add('lazy-loaded');
      return;
    }

    observer.value.observe(el);
  };

  /**
   * 停止观察元素
   */
  const unobserve = (el) => {
    observer.value?.unobserve(el);
  };

  /**
   * 自定义指令: v-lazy
   */
  const vLazy = {
    mounted(el, binding) {
      // 设置占位图
      if (!el.src) {
        el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }

      // 设置数据源
      if (binding.value) {
        el.dataset.src = binding.value;
      }

      // 如果浏览器不支持 IntersectionObserver，直接加载
      if (!isSupported.value) {
        loadImage(el);
        return;
      }

      observe(el);
    },
    updated(el, binding) {
      // 更新数据源
      if (binding.value !== binding.oldValue) {
        el.dataset.src = binding.value;
        el.classList.remove('lazy-loaded');
        observe(el);
      }
    },
    unmounted(el) {
      unobserve(el);
    },
  };

  /**
   * 预加载指定图片
   */
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        loadedImages.value.add(src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  /**
   * 预加载多张图片
   */
  const preloadImages = (srcs) => {
    return Promise.all(srcs.map(preloadImage));
  };

  // 生命周期
  onMounted(() => {
    observer.value = createObserver();
  });

  onUnmounted(() => {
    observer.value?.disconnect();
    observer.value = null;
  });

  return {
    // 状态
    isSupported,
    loadedImages,

    // 方法
    observe,
    unobserve,
    preloadImage,
    preloadImages,

    // 指令
    vLazy,
  };
}

/**
 * 使用虚拟滚动
 * 用于处理大量数据列表
 * @param {Object} options - 配置选项
 * @returns {Object} 虚拟滚动相关方法和状态
 */
export function useVirtualScroll(options = {}) {
  const { itemHeight = 50, bufferSize = 5, containerHeight = 400 } = options;

  const containerRef = ref(null);
  const scrollTop = ref(0);
  const visibleData = ref([]);
  const totalHeight = ref(0);
  const offsetY = ref(0);

  /**
   * 计算可见区域
   */
  const calculateVisibleRange = (data, scrollPosition) => {
    const startIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - bufferSize);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + bufferSize * 2;
    const endIndex = Math.min(data.length, startIndex + visibleCount);

    return {
      startIndex,
      endIndex,
      visibleData: data.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight,
    };
  };

  /**
   * 更新可见数据
   */
  const updateVisibleData = (data) => {
    if (!containerRef.value) {
      return;
    }

    const { startIndex, visibleData: newData, offsetY: newOffsetY } = calculateVisibleRange(data, scrollTop.value);

    visibleData.value = newData.map((item, index) => ({
      ...item,
      _index: startIndex + index,
      _style: {
        position: 'absolute',
        top: `${(startIndex + index) * itemHeight}px`,
        height: `${itemHeight}px`,
      },
    }));

    offsetY.value = newOffsetY;
    totalHeight.value = data.length * itemHeight;
  };

  /**
   * 处理滚动事件
   */
  const handleScroll = (event, data) => {
    scrollTop.value = event.target.scrollTop;
    updateVisibleData(data);
  };

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = (index) => {
    if (!containerRef.value) {
      return;
    }
    containerRef.value.scrollTop = index * itemHeight;
  };

  return {
    // Refs
    containerRef,

    // 状态
    visibleData,
    totalHeight,
    offsetY,

    // 方法
    updateVisibleData,
    handleScroll,
    scrollToIndex,
  };
}

/**
 * 使用骨架屏
 * 用于提升感知性能
 * @param {Object} options - 配置选项
 * @returns {Object} 骨架屏相关方法和状态
 */
export function useSkeleton(options = {}) {
  const { rows = 5, animated = true, loading = ref(true) } = options;

  const isLoading = loading;

  /**
   * 显示骨架屏
   */
  const showSkeleton = () => {
    isLoading.value = true;
  };

  /**
   * 隐藏骨架屏
   */
  const hideSkeleton = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    skeletonProps: {
      rows,
      animated,
    },
    showSkeleton,
    hideSkeleton,
  };
}

/**
 * 使用防抖
 * 用于优化高频事件
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 防抖后的函数
 */
export function useDebounce(fn, delay = 300) {
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
 * 使用节流
 * 用于优化高频事件
 * @param {Function} fn - 要节流的函数
 * @param {number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
export function useThrottle(fn, limit = 300) {
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

export default {
  useLazyLoad,
  useVirtualScroll,
  useSkeleton,
  useDebounce,
  useThrottle,
};
