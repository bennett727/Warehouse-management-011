import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  clearSecureStorage,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  setUserPreference,
  getUserPreference,
  setCache,
  getCache,
  clearExpiredCache,
  getStorageStats
} from '../../../src/utils/storage.js';

describe('存储工具函数测试', () => {
  let localStorageData = {};
  
  beforeEach(() => {
    localStorageData = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => localStorageData[key] || null,
      setItem: (key, value) => { localStorageData[key] = value; },
      removeItem: (key) => { delete localStorageData[key]; },
      clear: () => { localStorageData = {}; },
      get length() { return Object.keys(localStorageData).length; },
      key: (index) => Object.keys(localStorageData)[index] || null
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('setSecureItem & getSecureItem', () => {
    it('应该存储和读取非加密数据', () => {
      const key = 'testKey';
      const value = { name: 'test' };
      
      setSecureItem(key, value, false);
      
      expect(localStorageData['wms_testKey']).toBeDefined();
      const storedData = JSON.parse(localStorageData['wms_testKey']);
      expect(storedData.value).toEqual(value);
      expect(storedData.encrypted).toBe(false);
    });

    it('应该返回默认值当key不存在', () => {
      const result = getSecureItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('应该处理存储错误', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => { throw new Error('Storage full'); },
        removeItem: () => {},
        clear: () => {},
        get length() { return 0; },
        key: () => null
      });
      
      expect(() => setSecureItem('key', 'value')).not.toThrow();
    });

    it('应该处理读取错误', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => { throw new Error('Storage error'); },
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        get length() { return 0; },
        key: () => null
      });
      
      const result = getSecureItem('key', 'default');
      expect(result).toBe('default');
    });

    it('应该正确处理带时间戳的数据', () => {
      const value = 'valid';
      setSecureItem('data', value, false);
      
      const result = getSecureItem('data', 'default');
      expect(result).toBe('valid');
    });
  });

  describe('removeSecureItem', () => {
    it('应该移除指定key', () => {
      setSecureItem('testKey', 'value');
      removeSecureItem('testKey');
      expect(localStorageData['wms_testKey']).toBeUndefined();
    });

    it('应该处理移除错误', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => { throw new Error('Remove error'); },
        clear: () => {},
        get length() { return 0; },
        key: () => null
      });
      
      expect(() => removeSecureItem('key')).not.toThrow();
    });
  });

  describe('clearSecureStorage', () => {
    it('应该只清除wms前缀的数据', () => {
      localStorageData = {
        'wms_key1': 'value1',
        'other_key': 'value2',
        'wms_key2': 'value3'
      };

      clearSecureStorage();

      expect(localStorageData).toEqual({ 'other_key': 'value2' });
    });

    it('应该处理清除错误', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        get length() { return 0; },
        key: () => { throw new Error('Key error'); }
      });
      
      expect(() => clearSecureStorage()).not.toThrow();
    });
  });

  describe('saveFormDraft & loadFormDraft', () => {
    it('应该保存表单草稿', () => {
      const formId = 'testForm';
      const formData = { name: 'test', value: 123 };
      
      saveFormDraft(formId, formData, false);
      
      expect(localStorageData['wms_draft_testForm']).toBeDefined();
      const storedData = JSON.parse(localStorageData['wms_draft_testForm']);
      expect(storedData.value.data).toEqual(formData);
    });

    it('应该加载表单草稿', () => {
      const formData = { name: 'test' };
      const storedData = JSON.stringify({
        value: {
          data: formData,
          savedAt: Date.now()
        },
        timestamp: Date.now(),
        encrypted: false
      });
      
      localStorageData['wms_draft_testForm'] = storedData;
      
      const result = loadFormDraft('testForm');
      expect(result).toEqual(formData);
    });

    it('应该返回null当草稿不存在', () => {
      const result = loadFormDraft('nonexistent');
      expect(result).toBeNull();
    });

    it('应该清除表单草稿', () => {
      localStorageData['wms_draft_testForm'] = 'data';
      clearFormDraft('testForm');
      expect(localStorageData['wms_draft_testForm']).toBeUndefined();
    });
  });

  describe('setUserPreference & getUserPreference', () => {
    it('应该保存用户偏好设置', () => {
      setUserPreference('theme', 'dark');
      
      expect(localStorageData['wms_pref_theme']).toBeDefined();
      const storedData = JSON.parse(localStorageData['wms_pref_theme']);
      expect(storedData.value).toBe('dark');
    });

    it('应该读取用户偏好设置', () => {
      const storedData = JSON.stringify({
        value: 'dark',
        timestamp: Date.now(),
        encrypted: false
      });
      
      localStorageData['wms_pref_theme'] = storedData;
      
      const result = getUserPreference('theme', 'light');
      expect(result).toBe('dark');
    });

    it('应该返回默认值当偏好不存在', () => {
      const result = getUserPreference('theme', 'light');
      expect(result).toBe('light');
    });
  });

  describe('setCache & getCache', () => {
    it('应该设置缓存数据', () => {
      const cacheData = { items: [1, 2, 3] };
      
      setCache('testCache', cacheData);
      
      expect(localStorageData['wms_cache_testCache']).toBeDefined();
      const storedData = JSON.parse(localStorageData['wms_cache_testCache']);
      expect(storedData.value.data).toEqual(cacheData);
    });

    it('应该获取缓存数据', () => {
      const cacheData = { items: [1, 2, 3] };
      const storedData = JSON.stringify({
        value: {
          data: cacheData,
          expiresAt: Date.now() + 5 * 60 * 1000
        },
        timestamp: Date.now(),
        encrypted: false
      });
      
      localStorageData['wms_cache_testCache'] = storedData;
      
      const result = getCache('testCache');
      expect(result).toEqual(cacheData);
    });

    it('应该返回null当缓存不存在', () => {
      const result = getCache('nonexistent');
      expect(result).toBeNull();
    });

    it('应该返回null当缓存已过期', () => {
      const cacheData = { items: [1, 2, 3] };
      const storedData = JSON.stringify({
        value: {
          data: cacheData,
          expiresAt: Date.now() - 1000
        },
        timestamp: Date.now() - 10000,
        encrypted: false
      });
      
      localStorageData['wms_cache_expired'] = storedData;
      
      const result = getCache('expired');
      expect(result).toBeNull();
    });
  });

  describe('clearExpiredCache', () => {
    it('应该清除过期缓存', () => {
      const now = Date.now();
      
      const expiredCache = JSON.stringify({
        value: {
          data: 'old',
          expiresAt: now - 1000
        },
        timestamp: now - 10000,
        encrypted: false
      });
      
      const validCache = JSON.stringify({
        value: {
          data: 'new',
          expiresAt: now + 5 * 60 * 1000
        },
        timestamp: now,
        encrypted: false
      });
      
      localStorageData = {
        'wms_cache_expired': expiredCache,
        'wms_cache_valid': validCache,
        'other_key': 'value'
      };

      clearExpiredCache();

      expect(localStorageData['wms_cache_expired']).toBeUndefined();
      expect(localStorageData['wms_cache_valid']).toBeDefined();
      expect(localStorageData['other_key']).toBe('value');
    });

    it('应该处理无缓存情况', () => {
      localStorageData = {
        'other_key': 'value'
      };

      expect(() => clearExpiredCache()).not.toThrow();
      expect(localStorageData['other_key']).toBe('value');
    });
  });

  describe('getStorageStats', () => {
    it('应该返回存储统计信息', () => {
      localStorageData = {
        'wms_key1': JSON.stringify({ value: 'test1', timestamp: Date.now() }),
        'wms_key2': JSON.stringify({ value: 'test2', timestamp: Date.now() }),
        'other_key': 'value'
      };

      const stats = getStorageStats();
      
      expect(stats.itemCount).toBe(2);
      expect(stats.totalBytes).toBeGreaterThan(0);
      expect(stats.totalSize).toContain('KB');
    });

    it('应该处理获取统计错误', () => {
      vi.stubGlobal('localStorage', null);
      
      const stats = getStorageStats();
      expect(stats.itemCount).toBe(0);
      expect(stats.totalBytes).toBe(0);
    });

    it('应该处理空localStorage', () => {
      localStorageData = {};

      const stats = getStorageStats();
      expect(stats.itemCount).toBe(0);
      expect(stats.totalBytes).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理复杂对象', () => {
      const complexValue = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        date: new Date('2024-01-15').toISOString(),
        nullValue: null,
        undefinedValue: undefined
      };
      
      setSecureItem('complex', complexValue);
      
      const storedData = JSON.parse(localStorageData['wms_complex']);
      expect(storedData.value).toEqual(complexValue);
    });

    it('应该处理损坏的数据', () => {
      localStorageData['wms_corrupted'] = 'invalid-json';
      
      const result = getSecureItem('corrupted', 'default');
      expect(result).toBe('default');
    });

    it('应该处理空值', () => {
      setSecureItem('nullKey', null);
      
      const storedData = JSON.parse(localStorageData['wms_nullKey']);
      expect(storedData.value).toBeNull();
    });

    it('应该处理undefined值', () => {
      setSecureItem('undefinedKey', undefined);
      
      const storedData = JSON.parse(localStorageData['wms_undefinedKey']);
      expect(storedData.value).toBeUndefined();
    });
  });
});
