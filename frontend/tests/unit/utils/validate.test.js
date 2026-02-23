import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidURL,
  isValidIP,
  isValidPort,
  isValidIdCard,
  isValidPostalCode,
  isValidNumber,
  isValidInteger,
  isValidPositiveInteger,
  isValidDecimal,
  isValidDate,
  isValidDateTime,
  isValidTime,
  isRequired,
  minLength,
  maxLength,
  rangeLength,
  minValue,
  maxValue,
  rangeValue,
  isValidPassword,
  isValidUsername,
  isValidChinese,
  isValidEnglish,
  isValidAlphanumeric,
  isValidCode
} from '../../../src/utils/validate.js';

describe('验证工具函数测试', () => {
  describe('isValidEmail', () => {
    it('应该验证有效邮箱', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('应该验证无效邮箱', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('应该验证有效手机号', () => {
      expect(isValidPhone('13800138000')).toBe(true);
      expect(isValidPhone('15912345678')).toBe(true);
      expect(isValidPhone('18612345678')).toBe(true);
    });

    it('应该验证无效手机号', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('12345678901')).toBe(false);
      expect(isValidPhone('1380013800')).toBe(false);
      expect(isValidPhone('138001380000')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('应该验证有效URL', () => {
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('https://www.example.com')).toBe(true);
      expect(isValidURL('https://example.com/path')).toBe(true);
    });

    it('应该验证无效URL', () => {
      expect(isValidURL('')).toBe(false);
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('ftp://example.com')).toBe(false);
    });
  });

  describe('isValidIP', () => {
    it('应该验证有效IP地址', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
    });

    it('应该验证无效IP地址', () => {
      expect(isValidIP('')).toBe(false);
      expect(isValidIP('256.1.1.1')).toBe(false);
      expect(isValidIP('192.168.1')).toBe(false);
      expect(isValidIP('192.168.1.1.1')).toBe(false);
    });
  });

  describe('isValidPort', () => {
    it('应该验证有效端口号', () => {
      expect(isValidPort(80)).toBe(true);
      expect(isValidPort(8080)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
    });

    it('应该验证无效端口号', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
    });
  });

  describe('isValidIdCard', () => {
    it('应该验证有效身份证号', () => {
      expect(isValidIdCard('110101199001011234')).toBe(true);
      expect(isValidIdCard('31010119800101123X')).toBe(true);
    });

    it('应该验证无效身份证号', () => {
      expect(isValidIdCard('')).toBe(false);
      expect(isValidIdCard('123456789012345678')).toBe(false);
      expect(isValidIdCard('11010119900101')).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('应该验证有效数字', () => {
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber(123.45)).toBe(true);
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('123.45')).toBe(true);
    });

    it('应该验证无效数字', () => {
      expect(isValidNumber('')).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber(NaN)).toBe(false);
    });
  });

  describe('isValidInteger', () => {
    it('应该验证有效整数', () => {
      expect(isValidInteger(123)).toBe(true);
      expect(isValidInteger(-123)).toBe(true);
      expect(isValidInteger(0)).toBe(true);
    });

    it('应该验证无效整数', () => {
      expect(isValidInteger(123.45)).toBe(false);
      expect(isValidInteger('123.45')).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('应该验证必填字段', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
    });

    it('应该验证空值', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('minLength', () => {
    it('应该验证最小长度', () => {
      expect(minLength('test', 3)).toBe(true);
      expect(minLength([1, 2, 3], 2)).toBe(true);
    });

    it('应该验证长度不足', () => {
      expect(minLength('te', 3)).toBe(false);
      expect(minLength([1], 2)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('应该验证最大长度', () => {
      expect(maxLength('test', 5)).toBe(true);
      expect(maxLength([1, 2, 3], 5)).toBe(true);
    });

    it('应该验证长度超出', () => {
      expect(maxLength('testing', 5)).toBe(false);
      expect(maxLength([1, 2, 3, 4, 5, 6], 5)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('应该验证有效密码', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('Test@1234')).toBe(true);
    });

    it('应该验证无效密码', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('123')).toBe(false);
      expect(isValidPassword('password')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('应该验证有效用户名', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('test_user')).toBe(true);
    });

    it('应该验证无效用户名', () => {
      expect(isValidUsername('')).toBe(false);
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('user@name')).toBe(false);
    });
  });

  describe('isValidChinese', () => {
    it('应该验证中文字符', () => {
      expect(isValidChinese('中文')).toBe(true);
      expect(isValidChinese('测试')).toBe(true);
    });

    it('应该验证非中文字符', () => {
      expect(isValidChinese('test')).toBe(false);
      expect(isValidChinese('123')).toBe(false);
    });
  });

  describe('isValidCode', () => {
    it('应该验证有效编码', () => {
      expect(isValidCode('CODE001')).toBe(true);
      expect(isValidCode('ABC-123')).toBe(true);
    });

    it('应该验证无效编码', () => {
      expect(isValidCode('')).toBe(false);
      expect(isValidCode('CODE@001')).toBe(false);
    });
  });
});
