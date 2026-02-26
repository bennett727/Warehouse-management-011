/**
 * 日期工具函数
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {string} format - 格式化字符串，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return '';
  }

  // 转换为Date对象
  const d = new Date(date);

  // 检查日期是否有效
  if (isNaN(d.getTime())) {
    return '';
  }

  // 获取日期部分
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  // 替换格式化字符串
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化日期为YYYY-MM-DD
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateShort(date) {
  return formatDate(date, 'YYYY-MM-DD');
}

/**
 * 格式化时间为HH:mm:ss
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date) {
  return formatDate(date, 'HH:mm:ss');
}

/**
 * 计算两个日期之间的天数差
 * @param {Date|string|number} startDate - 开始日期
 * @param {Date|string|number} endDate - 结束日期
 * @returns {number} 天数差
 */
export function getDaysDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取当前日期
 * @returns {string} 当前日期字符串，格式为YYYY-MM-DD
 */
export function getCurrentDate() {
  return formatDate(new Date(), 'YYYY-MM-DD');
}

/**
 * 获取当前时间
 * @returns {string} 当前时间字符串，格式为HH:mm:ss
 */
export function getCurrentTime() {
  return formatDate(new Date(), 'HH:mm:ss');
}

/**
 * 获取当前日期时间
 * @returns {string} 当前日期时间字符串，格式为YYYY-MM-DD HH:mm:ss
 */
export function getCurrentDateTime() {
  return formatDate(new Date());
}

/**
 * 判断日期是否在指定范围内
 * @param {Date|string|number} date - 要判断的日期
 * @param {Date|string|number} startDate - 开始日期
 * @param {Date|string|number} endDate - 结束日期
 * @returns {boolean} 是否在范围内
 */
export function isDateInRange(date, startDate, endDate) {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

/**
 * 获取指定日期所在月份的第一天
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {Date} 第一天的日期对象
 */
export function getFirstDayOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取指定日期所在月份的最后一天
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {Date} 最后一天的日期对象
 */
export function getLastDayOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 计算相对时间
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 相对时间字符串，如'刚刚'、'1分钟前'、'2小时前'、'3天前'等
 */
export function formatRelativeTime(date) {
  if (!date) {
    return '刚刚';
  }

  const now = new Date();
  const d = new Date(date);
  const diff = now - d;

  if (isNaN(d.getTime())) {
    return '刚刚';
  }

  // 计算时间差
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // 返回相对时间
  if (years > 0) {
    return `${years}年前`;
  }
  if (months > 0) {
    return `${months}个月前`;
  }
  if (weeks > 0) {
    return `${weeks}周前`;
  }
  if (days > 0) {
    return `${days}天前`;
  }
  if (hours > 0) {
    return `${hours}小时前`;
  }
  if (minutes > 0) {
    return `${minutes}分钟前`;
  }
  return '刚刚';
}

/**
 * 添加天数
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {number} days - 要添加的天数
 * @returns {Date} 新的日期对象
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 减去天数
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {number} days - 要减去的天数
 * @returns {Date} 新的日期对象
 */
export function subtractDays(date, days) {
  return addDays(date, -days);
}

/**
 * 获取一天的开始时间
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {Date} 一天开始的日期对象 (00:00:00)
 */
export function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取一天的结束时间
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {Date} 一天结束的日期对象 (23:59:59)
 */
export function getEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取周数
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {number} 周数 (1-53)
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * 获取月份名称
 * @param {number} month - 月份 (0-11)
 * @returns {string} 月份名称
 */
export function getMonthName(month) {
  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];
  return monthNames[month] || '';
}

/**
 * 判断是否为周末
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {boolean} 是否为周末
 */
export function isWeekend(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * 获取季度
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {number} 季度 (1-4)
 */
export function getQuarter(date) {
  const d = new Date(date);
  const month = d.getMonth();
  return Math.floor(month / 3) + 1;
}
