import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('DOMOptimization');

export function useVirtualList(options = {}) {
  const { itemSize = 50, containerHeight = 600, overscan = 5, data = [] } = options;

  const scrollTop = ref(0);
  const visibleStart = ref(0);
  const visibleEnd = ref(0);
  const containerRef = ref(null);

  const totalHeight = computed(() => data.length * itemSize);
  const visibleCount = computed(() => Math.ceil(containerHeight / itemSize));
  const visibleData = computed(() => {
    const start = Math.max(0, visibleStart.value - overscan);
    const end = Math.min(data.length, visibleEnd.value + overscan);
    return data.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }));
  });

  const offsetY = computed(() => visibleStart.value * itemSize);

  const handleScroll = (e) => {
    scrollTop.value = e.target.scrollTop;
    updateVisibleRange();
  };

  const updateVisibleRange = () => {
    const start = Math.floor(scrollTop.value / itemSize);
    const end = Math.min(data.length, start + visibleCount.value + 1);
    visibleStart.value = start;
    visibleEnd.value = end;
  };

  const scrollToIndex = (index) => {
    if (containerRef.value) {
      const targetScrollTop = index * itemSize;
      containerRef.value.scrollTop = targetScrollTop;
      scrollTop.value = targetScrollTop;
      updateVisibleRange();
    }
  };

  const scrollToTop = () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
      scrollTop.value = 0;
      updateVisibleRange();
    }
  };

  const scrollToBottom = () => {
    if (containerRef.value) {
      const targetScrollTop = totalHeight.value - containerHeight;
      containerRef.value.scrollTop = targetScrollTop;
      scrollTop.value = targetScrollTop;
      updateVisibleRange();
    }
  };

  onMounted(() => {
    updateVisibleRange();
  });

  return {
    containerRef,
    scrollTop,
    visibleStart,
    visibleEnd,
    visibleData,
    offsetY,
    totalHeight,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
}

export function useDebounce(fn, delay = 300) {
  let timeoutId = null;
  let lastCallTime = 0;

  const debouncedFn = (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    clearTimeout(timeoutId);

    if (timeSinceLastCall >= delay) {
      fn(...args);
      lastCallTime = now;
    } else {
      timeoutId = setTimeout(() => {
        fn(...args);
        lastCallTime = Date.now();
      }, delay - timeSinceLastCall);
    }
  };

  const cancel = () => {
    clearTimeout(timeoutId);
  };

  return {
    debouncedFn,
    cancel,
  };
}

export function useThrottle(fn, limit = 300) {
  let inThrottle = false;
  let lastResult = null;

  const throttledFn = (...args) => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = fn(...args);
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };

  const cancel = () => {
    inThrottle = false;
  };

  return {
    throttledFn,
    cancel,
  };
}

export function useIntersectionObserver(options = {}) {
  const { threshold = 0.1, rootMargin = '0px', root = null } = options;

  const isIntersecting = ref(false);
  const elementRef = ref(null);
  let observer = null;

  const startObserving = () => {
    if (!elementRef.value || typeof IntersectionObserver === 'undefined') {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting.value = entry.isIntersecting;
        });
      },
      { threshold, rootMargin, root }
    );

    observer.observe(elementRef.value);
  };

  const stopObserving = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  onMounted(() => {
    startObserving();
  });

  onUnmounted(() => {
    stopObserving();
  });

  return {
    elementRef,
    isIntersecting,
    startObserving,
    stopObserving,
  };
}

export function useLazyLoad(options = {}) {
  const { threshold = 0.1, rootMargin = '100px', onLoad = null } = options;

  const { elementRef, isIntersecting, startObserving, stopObserving } = useIntersectionObserver({
    threshold,
    rootMargin,
  });

  const loaded = ref(false);
  const error = ref(false);

  const reset = () => {
    loaded.value = false;
    error.value = false;
    startObserving();
  };

  const handleError = () => {
    error.value = true;
    loaded.value = false;
  };

  const handleLoad = () => {
    loaded.value = true;
    error.value = false;
    if (onLoad) {
      onLoad();
    }
  };

  watch(isIntersecting, (newVal) => {
    if (newVal && !loaded.value && !error.value) {
      stopObserving();
    }
  });

  return {
    elementRef,
    isIntersecting,
    loaded,
    error,
    reset,
    handleError,
    handleLoad,
  };
}

export function useResizeObserver(options = {}) {
  const { debounceDelay = 100 } = options;

  const size = ref({
    width: 0,
    height: 0,
  });

  const elementRef = ref(null);
  let observer = null;

  const { debouncedFn: handleResize } = useDebounce((entries) => {
    const entry = entries[0];
    if (entry) {
      const { width, height } = entry.contentRect;
      size.value = { width, height };
    }
  }, debounceDelay);

  const startObserving = () => {
    if (!elementRef.value || typeof ResizeObserver === 'undefined') {
      return;
    }

    observer = new ResizeObserver(handleResize);
    observer.observe(elementRef.value);
  };

  const stopObserving = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  onMounted(() => {
    startObserving();
  });

  onUnmounted(() => {
    stopObserving();
  });

  return {
    elementRef,
    size,
    startObserving,
    stopObserving,
  };
}

export function useAnimationFrame() {
  let rafId = null;
  let callbacks = [];

  const schedule = (callback) => {
    callbacks.push(callback);

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        const currentCallbacks = [...callbacks];
        callbacks = [];
        rafId = null;

        currentCallbacks.forEach((cb) => {
          try {
            cb();
          } catch (error) {
            logger.error('AnimationFrame callback error:', error);
          }
        });
      });
    }
  };

  const cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    callbacks = [];
  };

  onUnmounted(() => {
    cancel();
  });

  return {
    schedule,
    cancel,
  };
}

export function useBatchUpdate(options = {}) {
  const { batchSize = 50, delay = 16 } = options;

  const queue = ref([]);
  const processing = ref(false);

  const add = (item) => {
    queue.value.push(item);
    if (!processing.value) {
      processQueue();
    }
  };

  const addBatch = (items) => {
    queue.value.push(...items);
    if (!processing.value) {
      processQueue();
    }
  };

  const processQueue = async () => {
    if (queue.value.length === 0) {
      processing.value = false;
      return;
    }

    processing.value = true;

    queue.value.splice(0, batchSize);
    await nextTick();

    await new Promise((resolve) => setTimeout(resolve, delay));

    if (queue.value.length > 0) {
      processQueue();
    } else {
      processing.value = false;
    }
  };

  const clear = () => {
    queue.value = [];
    processing.value = false;
  };

  return {
    queue,
    processing,
    add,
    addBatch,
    clear,
  };
}

export function useDOMOptimization() {
  const measurePerformance = (fn, label) => {
    if (typeof performance === 'undefined' || !performance.mark) {
      return fn();
    }

    const startMark = `${label}-start`;
    const endMark = `${label}-end`;

    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    performance.measure(label, startMark, endMark);

    const measure = performance.getEntriesByName(label)[0];
    if (measure) {
      logger.debug(`${label}: ${measure.duration.toFixed(2)}ms`);
    }

    return result;
  };

  const requestIdleCallback = (callback, options = {}) => {
    if (typeof requestIdleCallback === 'function') {
      return requestIdleCallback(callback, options);
    }
    return setTimeout(callback, 1);
  };

  const cancelIdleCallback = (handle) => {
    if (typeof cancelIdleCallback === 'function') {
      cancelIdleCallback(handle);
    } else {
      clearTimeout(handle);
    }
  };

  return {
    measurePerformance,
    requestIdleCallback,
    cancelIdleCallback,
  };
}
