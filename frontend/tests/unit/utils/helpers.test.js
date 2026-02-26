import { describe, it, expect } from 'vitest';
import {
  isValidFileType,
  generateRandomString,
  deepClone,
  isEqual,
  throttle,
  formatFileSize,
  downloadFile,
  getFileExtension,
  stripHtml,
  truncateText,
  camelToKebab,
  kebabToCamel,
  snakeToCamel,
  camelToSnake,
  groupBy,
  sortBy,
  unique,
  flatten,
  chunk,
  pick,
  omit,
  merge
} from '../../../src/utils/helpers.js';
import { debounce } from '../../../src/utils/debounce.js';

describe('通用工具函数测试', () => {
  describe('isValidFileType', () => {
    it('应该验证允许的文件类型', () => {
      const file = { name: 'test.jpg' };
      expect(isValidFileType(file, ['jpg', 'png'])).toBe(true);
    });

    it('应该拒绝不允许的文件类型', () => {
      const file = { name: 'test.exe' };
      expect(isValidFileType(file, ['jpg', 'png'])).toBe(false);
    });

    it('应该处理空文件', () => {
      expect(isValidFileType(null, ['jpg'])).toBe(false);
      expect(isValidFileType({}, ['jpg'])).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('应该生成指定长度的随机字符串', () => {
      const str = generateRandomString(10);
      expect(str.length).toBe(10);
      expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
    });

    it('应该生成默认长度的随机字符串', () => {
      const str = generateRandomString();
      expect(str.length).toBe(16);
    });
  });

  describe('deepClone', () => {
    it('应该深拷贝对象', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('应该深拷贝数组', () => {
      const arr = [1, 2, { a: 3 }];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('应该处理Date对象', () => {
      const date = new Date('2024-01-15');;
      const cloned = deepClone(date);
      expect(cloned.getTime()).toBe(date.getTime());
      expect(cloned).not.toBe(date);
    });

    it('应该处理基本类型', () => {
      expect(deepClone(1)).toBe(1);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(null)).toBe(null);
    });
  });

  describe('isEqual', () => {
    it('应该判断基本类型相等', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual('a', 'a')).toBe(true);
      expect(isEqual(1, 2)).toBe(false);
    });

    it('应该判断对象相等', () => {
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('应该判断数组相等', () => {
      expect(isEqual([1, 2], [1, 2])).toBe(true);
      expect(isEqual([1, 2], [2, 1])).toBe(false);
    });

    it('应该判断嵌套对象相等', () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });
  });

  describe('debounce', () => {
    it('应该防抖执行函数', async () => {
      let count = 0;
      const fn = debounce(() => count++, 100);
      
      fn();
      fn();
      fn();
      expect(count).toBe(0);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(count).toBe(1);
    });
  });

  describe('throttle', () => {
    it('应该节流执行函数', async () => {
      let count = 0;
      const fn = throttle(() => count++, 100);
      
      fn();
      expect(count).toBe(1);
      
      fn();
      expect(count).toBe(1);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      fn();
      expect(count).toBe(2);
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化文件大小', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('应该处理0', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('应该处理字节', () => {
      expect(formatFileSize(100)).toBe('100 B');
    });
  });

  describe('getFileExtension', () => {
    it('应该获取文件扩展名', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg');
      expect(getFileExtension('test.PNG')).toBe('png');
    });

    it('应该处理无扩展名', () => {
      expect(getFileExtension('test')).toBe('');
    });
  });

  describe('stripHtml', () => {
    it('应该去除HTML标签', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test');
    });

    it('应该处理空字符串', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('应该截断文本', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
    });

    it('应该保留短文本', () => {
      expect(truncateText('Hi', 10)).toBe('Hi');
    });
  });

  describe('camelToKebab', () => {
    it('应该转换驼峰为短横线', () => {
      expect(camelToKebab('camelCase')).toBe('camel-case');
      expect(camelToKebab('HTTPRequest')).toBe('http-request');
    });
  });

  describe('kebabToCamel', () => {
    it('应该转换短横线为驼峰', () => {
      expect(kebabToCamel('kebab-case')).toBe('kebabCase');
      expect(kebabToCamel('hello-world')).toBe('helloWorld');
    });
  });

  describe('snakeToCamel', () => {
    it('应该转换下划线为驼峰', () => {
      expect(snakeToCamel('snake_case')).toBe('snakeCase');
      expect(snakeToCamel('hello_world')).toBe('helloWorld');
    });
  });

  describe('camelToSnake', () => {
    it('应该转换驼峰为下划线', () => {
      expect(camelToSnake('camelCase')).toBe('camel_case');
      expect(camelToSnake('helloWorld')).toBe('hello_world');
    });
  });

  describe('groupBy', () => {
    it('应该按属性分组', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 }
      ];
      const grouped = groupBy(items, 'type');
      expect(grouped.a).toHaveLength(2);
      expect(grouped.b).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('应该按属性排序', () => {
      const items = [{ a: 3 }, { a: 1 }, { a: 2 }];
      const sorted = sortBy(items, 'a');
      expect(sorted[0].a).toBe(1);
      expect(sorted[2].a).toBe(3);
    });

    it('应该支持降序', () => {
      const items = [{ a: 1 }, { a: 3 }, { a: 2 }];
      const sorted = sortBy(items, 'a', false);
      expect(sorted[0].a).toBe(3);
      expect(sorted[2].a).toBe(1);
    });
  });

  describe('unique', () => {
    it('应该去重数组', () => {
      expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    });

    it('应该按属性去重对象', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 1 }];
      expect(unique(items, 'id')).toHaveLength(2);
    });
  });

  describe('flatten', () => {
    it('应该扁平化数组', () => {
      expect(flatten([1, [2, 3], [4, [5]]])).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('chunk', () => {
    it('应该分块数组', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('pick', () => {
    it('应该挑选属性', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('应该排除属性', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('merge', () => {
    it('应该合并对象', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      expect(merge(obj1, obj2)).toEqual({ a: 1, b: 2 });
    });

    it('应该深度合并', () => {
      const obj1 = { a: { x: 1 } };
      const obj2 = { a: { y: 2 } };
      expect(merge(obj1, obj2)).toEqual({ a: { x: 1, y: 2 } });
    });
  });
});
