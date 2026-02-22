export const isEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isIdCard = (idCard) => {
  if (!idCard || typeof idCard !== 'string') {
    return false;
  }
  const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (!idCardRegex.test(idCard)) {
    return false;
  }
  const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const parityBit = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard.charAt(i)) * factors[i];
  }
  const checkCode = parityBit[sum % 11];
  return checkCode.toUpperCase() === idCard.charAt(17).toUpperCase();
};

export const isUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(url);
};

export const validatePasswordStrength = (password, options = {}) => {
  const {
    minLength = 8,
    requireUpperCase = true,
    requireLowerCase = true,
    requireNumber = true,
    requireSpecialChar = false,
  } = options;

  if (!password || password.length < minLength) {
    return { valid: false, message: `密码长度不能少于${minLength}个字符` };
  }

  if (requireUpperCase && !/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' };
  }

  if (requireLowerCase && !/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }

  if (requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含特殊字符' };
  }

  return { valid: true, message: '密码强度符合要求' };
};

export const isNumber = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  return /^\d+$/.test(String(value));
};

export const isDate = (date, format = 'YYYY-MM-DD') => {
  if (!date || typeof date !== 'string') {
    return false;
  }

  let regex;
  switch (format) {
    case 'YYYY-MM-DD':
      regex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      break;
    case 'YYYY/MM/DD':
      regex = /^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
      break;
    case 'YYYY.MM.DD':
      regex = /^(\d{4})\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])$/;
      break;
    default:
      regex = new RegExp(
        format.replace('YYYY', '(\\d{4})').replace('MM', '(0[1-9]|1[0-2])').replace('DD', '(0[1-9]|[12]\\d|3[01])')
      );
  }

  if (!regex.test(date)) {
    return false;
  }

  const parts = date.split(/[-/.]/);
  let year, month, day;

  if (format.startsWith('YYYY')) {
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  }

  const dateObj = new Date(year, month, day);
  return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === day;
};

export const isPostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== 'string') {
    return false;
  }
  const postalRegex = /^\d{6}$/;
  return postalRegex.test(postalCode);
};

export const hasSpecialChars = (str, allowSpace = false) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  const pattern = allowSpace ? /[^a-zA-Z0-9\s]/ : /[^a-zA-Z0-9]/;
  return pattern.test(str);
};

export const checkLength = (str, min, max) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  const { length } = str;
  return length >= min && length <= max;
};

export const isDeviceCode = (deviceCode) => {
  if (!deviceCode || typeof deviceCode !== 'string') {
    return false;
  }
  const deviceRegex = /^DEV-[A-Z]{3}-\d{4}$/;
  return deviceRegex.test(deviceCode);
};

export default {
  isEmail,
  isPhone,
  isIdCard,
  isUrl,
  validatePasswordStrength,
  isNumber,
  isDate,
  isPostalCode,
  hasSpecialChars,
  checkLength,
  isDeviceCode,
};
