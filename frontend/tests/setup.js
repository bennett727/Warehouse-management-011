/**
 * @file: setup.js
 * @description: Vitest测试环境设置文件
 * @author: AI架构专家
 * @createTime: 2026-02-26
 */

import { vi } from 'vitest';

// Mock indexedDB
global.indexedDB = {
  open: vi.fn().mockReturnValue({
    onerror: null,
    onsuccess: null,
    result: {
      createObjectStore: vi.fn().mockReturnValue({
        createIndex: vi.fn()
      }),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
          get: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
          getAll: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
          delete: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
          clear: vi.fn().mockReturnValue({ onsuccess: null, onerror: null })
        })
      }),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(false)
      }
    }
  }),
  deleteDatabase: vi.fn().mockReturnValue({
    onerror: null,
    onsuccess: null
  })
};

// Mock IDBKeyRange
global.IDBKeyRange = {
  bound: vi.fn(),
  lowerBound: vi.fn(),
  upperBound: vi.fn(),
  only: vi.fn()
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock console methods to reduce noise in tests
// 但保留错误输出以便调试
const originalConsoleError = console.error;
console.error = (...args) => {
  // 过滤掉已知的非关键错误
  const filteredMessages = [
    'indexedDB',
    'LogStorage',
    'logger'
  ];

  const shouldFilter = filteredMessages.some(msg =>
    args[0] && typeof args[0] === 'string' && args[0].includes(msg)
  );

  if (!shouldFilter) {
    originalConsoleError(...args);
  }
};

// 清理函数
export function cleanup() {
  vi.clearAllMocks();
}
