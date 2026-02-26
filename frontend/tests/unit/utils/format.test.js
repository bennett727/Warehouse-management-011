import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatDuration,
  truncate,
  padZero,
  toThousands,
  capitalize,
  camelCase,
  kebabCase,
  snakeCase
} from '../../../src/utils/format.js';

describe('格式化工具函数测试', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2026-02-25');
      expect(formatDate(date)).toBe('2026-02-25');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2026/02/25');
      expect(formatDate(date, 'DD-MM-YYYY')).toBe('25-02-2026');
    });

    it('应该处理时间戳', () => {
      const timestamp = new Date('2026-02-25').getTime();
      expect(formatDate(timestamp)).toBe('2026-02-25');
    });

    it('应该处理无效输入', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('应该正确格式化日期时间', () => {
      const date = new Date('2026-02-25 14:30:00');
      expect(formatDateTime(date)).toContain('2026-02-25');
      expect(formatDateTime(date)).toContain('14:30');
    });

    it('应该支持自定义格式', () => {
      const date = new Date('2026-02-25 14:30:00');
      expect(formatDateTime(date, 'YYYY年MM月DD日 HH:mm')).toBe('2026年02月25日 14:30');
    });
  });

  describe('formatTime', () => {
    it('应该正确格式化时间', () => {
      const date = new Date('2026-02-25 14:30:45');
      expect(formatTime(date)).toBe('14:30:45');
      expect(formatTime(date, 'HH:mm')).toBe('14:30');
    });
  });

  describe('formatNumber', () => {
    it('应该正确格式化数字', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(0)).toBe('0');
    });

    it('应该支持小数位数', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57');
      expect(formatNumber(1234.5, 2)).toBe('1,234.50');
    });

    it('应该处理无效输入', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('abc')).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('应该正确格式化货币', () => {
      expect(formatCurrency(1234567.89)).toBe('¥1,234,567.89');
      expect(formatCurrency(1000)).toBe('¥1,000.00');
    });

    it('应该支持不同货币符号', () => {
      expect(formatCurrency(100, '$')).toBe('$100.00');
      expect(formatCurrency(100, '€')).toBe('€100.00');
    });
  });

  describe('formatPercent', () => {
    it('应该正确格式化百分比', () => {
      expect(formatPercent(0.25)).toBe('25.00%');
      expect(formatPercent(1)).toBe('100.00%');
      expect(formatPercent(0)).toBe('0.00%');
    });

    it('应该支持小数位数', () => {
      expect(formatPercent(0.2555, 1)).toBe('25.6%');
      expect(formatPercent(0.2555, 0)).toBe('26%');
    });
  });

  describe('formatFileSize', () => {
    it('应该正确格式化文件大小', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('应该处理字节', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('应该处理无效输入', () => {
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(-1)).toBe('0 B');
    });
  });

  describe('formatDuration', () => {
    it('应该正确格式化时长', () => {
      expect(formatDuration(3661000)).toBe('1小时1分钟1秒');
      expect(formatDuration(60000)).toBe('1分钟0秒');
      expect(formatDuration(1000)).toBe('1秒');
    });

    it('应该处理毫秒', () => {
      expect(formatDuration(500, true)).toBe('500毫秒');
    });
  });

  describe('truncate', () => {
    it('应该正确截断字符串', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('应该支持自定义后缀', () => {
      expect(truncate('Hello World', 5, '***')).toBe('Hello***');
    });
  });

  describe('padZero', () => {
    it('应该正确补零', () => {
      expect(padZero(5, 2)).toBe('05');
      expect(padZero(5, 3)).toBe('005');
      expect(padZero(123, 2)).toBe('123');
    });
  });

  describe('toThousands', () => {
    it('应该正确添加千分位', () => {
      expect(toThousands(1000)).toBe('1,000');
      expect(toThousands(1000000)).toBe('1,000,000');
      expect(toThousands(1234567.89)).toBe('1,234,567.89');
    });
  });

  describe('capitalize', () => {
    it('应该正确首字母大写', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
    });
  });

  describe('camelCase', () => {
    it('应该正确转换为驼峰命名', () => {
      expect(camelCase('hello world')).toBe('helloWorld');
      expect(camelCase('hello-world')).toBe('helloWorld');
      expect(camelCase('hello_world')).toBe('helloWorld');
    });
  });

  describe('kebabCase', () => {
    it('应该正确转换为短横线命名', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world');
      expect(kebabCase('Hello World')).toBe('hello-world');
    });
  });

  describe('snakeCase', () => {
    it('应该正确转换为下划线命名', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world');
      expect(snakeCase('Hello World')).toBe('hello_world');
    });
  });
});
