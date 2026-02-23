import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateShort,
  formatTime,
  getDaysDiff,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  isDateInRange,
  addDays,
  subtractDays,
  getStartOfDay,
  getEndOfDay,
  getWeekNumber,
  getMonthName,
  isWeekend,
  getQuarter
} from '../../../src/utils/date.js';

describe('日期工具函数测试', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-15 14:30:45');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('应该支持完整格式', () => {
      const date = new Date('2024-01-15 14:30:45');
      expect(formatDate(date)).toBe('2024-01-15 14:30:45');
    });

    it('应该处理字符串日期', () => {
      expect(formatDate('2024-01-15', 'YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('应该对无效日期返回空字符串', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('formatDateShort', () => {
    it('应该返回短日期格式', () => {
      const date = new Date('2024-01-15 14:30:45');
      expect(formatDateShort(date)).toBe('2024-01-15');
    });
  });

  describe('formatTime', () => {
    it('应该正确格式化时间', () => {
      const date = new Date('2024-01-15 14:30:45');
      expect(formatTime(date)).toBe('14:30:45');
    });
  });

  describe('getDaysDiff', () => {
    it('应该正确计算天数差', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-20');
      expect(getDaysDiff(start, end)).toBe(5);
    });

    it('应该处理字符串日期', () => {
      expect(getDaysDiff('2024-01-15', '2024-01-20')).toBe(5);
    });
  });

  describe('getCurrentDate', () => {
    it('应该返回当前日期', () => {
      const result = getCurrentDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getCurrentTime', () => {
    it('应该返回当前时间', () => {
      const result = getCurrentTime();
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('getCurrentDateTime', () => {
    it('应该返回当前日期时间', () => {
      const result = getCurrentDateTime();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('addDays', () => {
    it('应该正确添加天数', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(formatDate(result, 'YYYY-MM-DD')).toBe('2024-01-20');
    });

    it('应该处理跨月', () => {
      const date = new Date('2024-01-30');
      const result = addDays(date, 5);
      expect(formatDate(result, 'YYYY-MM-DD')).toBe('2024-02-04');
    });
  });

  describe('subtractDays', () => {
    it('应该正确减去天数', () => {
      const date = new Date('2024-01-15');
      const result = subtractDays(date, 5);
      expect(formatDate(result, 'YYYY-MM-DD')).toBe('2024-01-10');
    });
  });

  describe('getStartOfDay', () => {
    it('应该返回一天的开始', () => {
      const date = new Date('2024-01-15 14:30:45');
      const result = getStartOfDay(date);
      expect(formatDate(result)).toBe('2024-01-15 00:00:00');
    });
  });

  describe('getEndOfDay', () => {
    it('应该返回一天的结束', () => {
      const date = new Date('2024-01-15 14:30:45');
      const result = getEndOfDay(date);
      expect(formatDate(result)).toBe('2024-01-15 23:59:59');
    });
  });

  describe('getWeekNumber', () => {
    it('应该返回正确的周数', () => {
      const date = new Date('2024-01-15');
      const weekNum = getWeekNumber(date);
      expect(weekNum).toBeGreaterThan(0);
      expect(weekNum).toBeLessThanOrEqual(53);
    });
  });

  describe('getMonthName', () => {
    it('应该返回正确的月份名称', () => {
      expect(getMonthName(0)).toBe('一月');
      expect(getMonthName(6)).toBe('七月');
      expect(getMonthName(11)).toBe('十二月');
    });
  });

  describe('isWeekend', () => {
    it('应该正确识别周末', () => {
      const saturday = new Date('2024-01-13');
      const sunday = new Date('2024-01-14');
      const monday = new Date('2024-01-15');

      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(true);
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('getQuarter', () => {
    it('应该返回正确的季度', () => {
      expect(getQuarter(new Date('2024-01-15'))).toBe(1);
      expect(getQuarter(new Date('2024-04-15'))).toBe(2);
      expect(getQuarter(new Date('2024-07-15'))).toBe(3);
      expect(getQuarter(new Date('2024-10-15'))).toBe(4);
    });
  });

  describe('isDateInRange', () => {
    it('应该正确判断日期在范围内', () => {
      const date = new Date('2024-01-15');
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('应该正确判断日期在范围外', () => {
      const date = new Date('2024-02-15');
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });
});
