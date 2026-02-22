/**
 * 格式化工具函数
 * 提供日期、数字、货币等格式化功能
 */

/**
 * 格式化日期
 * @param {string|Date} date - 日期字符串或Date对象
 * @param {string} format - 格式化模式，默认为 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) {
    return '-';
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '-';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format.replace('YYYY', year).replace('MM', month).replace('DD', day);
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期字符串或Date对象
 * @param {string} format - 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return '-';
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '-';
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return formatDate(date, format).replace('HH', hours).replace('mm', minutes).replace('ss', seconds);
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数，默认为 0
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const number = parseFloat(num);
  return number.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化货币金额
 * @param {number} amount - 金额
 * @param {string} currency - 货币符号，默认为 '¥'
 * @returns {string} 格式化后的货币字符串
 */
export function formatMoney(amount, currency = '¥') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0.00`;
  }

  const number = parseFloat(amount);
  return `${currency}${number.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * 格式化百分比
 * @param {number} value - 数值（0-1之间）
 * @param {number} decimals - 小数位数，默认为 2
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentage = parseFloat(value) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化手机号（隐藏中间4位）
 * @param {string} phone - 手机号
 * @returns {string} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone) {
    return '-';
  }
  const str = String(phone);
  if (str.length !== 11) {
    return str;
  }

  return `${str.slice(0, 3)}****${str.slice(7)}`;
}

/**
 * 格式化身份证号（隐藏中间8位）
 * @param {string} idCard - 身份证号
 * @returns {string} 格式化后的身份证号
 */
export function formatIdCard(idCard) {
  if (!idCard) {
    return '-';
  }
  const str = String(idCard);
  if (str.length !== 18) {
    return str;
  }

  return `${str.slice(0, 6)}********${str.slice(14)}`;
}

/**
 * 格式化银行卡号（显示后4位）
 * @param {string} cardNo - 银行卡号
 * @returns {string} 格式化后的银行卡号
 */
export function formatBankCard(cardNo) {
  if (!cardNo) {
    return '-';
  }
  const str = String(cardNo);
  if (str.length < 4) {
    return str;
  }

  return `****${str.slice(-4)}`;
}
