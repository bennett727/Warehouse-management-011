import { DEBOUNCE, THROTTLE } from './constants';

const debounceMap = new Map();
const throttleMap = new Map();

const debounce = (fn, delay = DEBOUNCE.DEFAULT_DELAY) => {
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
};

const createDebouncedFn = (fn, key, delay = DEBOUNCE.DEFAULT_DELAY) => {
  if (debounceMap.has(key)) {
    return debounceMap.get(key);
  }
  const debouncedFn = debounce(fn, delay);
  debounceMap.set(key, debouncedFn);
  return debouncedFn;
};

const clearDebounce = (key) => {
  if (debounceMap.has(key)) {
    debounceMap.delete(key);
  }
};

const clearAllDebounces = () => {
  debounceMap.clear();
};

const throttle = (fn, delay = THROTTLE.DEFAULT_DELAY) => {
  let lastCall = 0;
  let timer = null;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn.apply(this, args);
      lastCall = now;
    } else if (!timer) {
      timer = setTimeout(
        () => {
          fn.apply(this, args);
          lastCall = Date.now();
          timer = null;
        },
        delay - (now - lastCall)
      );
    }
  };
};

const createThrottledFn = (fn, key, delay = THROTTLE.DEFAULT_DELAY) => {
  if (throttleMap.has(key)) {
    return throttleMap.get(key);
  }
  const throttledFn = throttle(fn, delay);
  throttleMap.set(key, throttledFn);
  return throttledFn;
};

const clearThrottle = (key) => {
  if (throttleMap.has(key)) {
    throttleMap.delete(key);
  }
};

const clearAllThrottles = () => {
  throttleMap.clear();
};

export {
  debounce,
  createDebouncedFn,
  clearDebounce,
  clearAllDebounces,
  throttle,
  createThrottledFn,
  clearThrottle,
  clearAllThrottles,
};
