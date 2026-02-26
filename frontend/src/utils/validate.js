/**
 * 验证工具函数
 */

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^1[3-9]\d{9}$/;
const urlRegex = /^https?:\/\/.+/;
const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
const postalCodeRegex = /^\d{6}$/;
const chineseRegex = /^[\u4e00-\u9fa5]+$/;
const englishRegex = /^[a-zA-Z]+$/;
const alphanumericRegex = /^[a-zA-Z0-9]+$/;

export function isValidEmail(email) {
  if (!email) {
    return false;
  }
  return emailRegex.test(email);
}

export function isValidPhone(phone) {
  if (!phone) {
    return false;
  }
  return phoneRegex.test(phone);
}

export function isValidURL(url) {
  if (!url) {
    return false;
  }
  return urlRegex.test(url);
}

export function isValidIP(ip) {
  if (!ip) {
    return false;
  }
  return ipRegex.test(ip);
}

export function isValidPort(port) {
  if (port === null || port === undefined) {
    return false;
  }
  const num = Number(port);
  return Number.isInteger(num) && num >= 1 && num <= 65535;
}

export function isValidIdCard(idCard) {
  if (!idCard) {
    return false;
  }
  return idCardRegex.test(idCard);
}

export function isValidPostalCode(code) {
  if (!code) {
    return false;
  }
  return postalCodeRegex.test(code);
}

export function isValidNumber(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(Number(value));
}

export function isValidInteger(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = Number(value);
  return Number.isInteger(num);
}

export function isValidPositiveInteger(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

export function isValidDecimal(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

export function isValidDate(date) {
  if (!date) {
    return false;
  }
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function isValidDateTime(dateTime) {
  return isValidDate(dateTime);
}

export function isValidTime(time) {
  if (!time) {
    return false;
  }
  const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
  return timeRegex.test(time);
}

export function isRequired(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

export function minLength(value, min) {
  if (!value) {
    return false;
  }
  return String(value).length >= min;
}

export function maxLength(value, max) {
  if (!value) {
    return true;
  }
  return String(value).length <= max;
}

export function rangeLength(value, min, max) {
  if (!value) {
    return false;
  }
  const len = String(value).length;
  return len >= min && len <= max;
}

export function minValue(value, min) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return Number(value) >= min;
}

export function maxValue(value, max) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return Number(value) <= max;
}

export function rangeValue(value, min, max) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = Number(value);
  return num >= min && num <= max;
}

export function isValidPassword(password) {
  if (!password) {
    return false;
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function isValidUsername(username) {
  if (!username) {
    return false;
  }
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

export function isValidChinese(value) {
  if (!value) {
    return false;
  }
  return chineseRegex.test(value);
}

export function isValidEnglish(value) {
  if (!value) {
    return false;
  }
  return englishRegex.test(value);
}

export function isValidAlphanumeric(value) {
  if (!value) {
    return false;
  }
  return alphanumericRegex.test(value);
}

export function isValidCode(code) {
  if (!code) {
    return false;
  }
  const codeRegex = /^[A-Za-z0-9_-]{1,50}$/;
  return codeRegex.test(code);
}
