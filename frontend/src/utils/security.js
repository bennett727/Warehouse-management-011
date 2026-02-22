export const securityUtils = {
  sanitizeHTML: (html) => {
    if (typeof html !== 'string') {
      return html;
    }

    const tempDiv = document.createElement('div');
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
  },

  sanitizeInput: (input) => {
    if (typeof input !== 'string') {
      return input;
    }

    let sanitized = input.trim();

    sanitized = sanitized.replace(/[<>]/g, '');

    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized;
  },

  sanitizeObject: (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = securityUtils.sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = securityUtils.sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }

    return sanitized;
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  validateURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  validateNumber: (value, min = -Infinity, max = Infinity) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  validateInteger: (value, min = -Infinity, max = Infinity) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= min && num <= max;
  },

  validateStringLength: (str, min = 0, max = Infinity) => {
    if (typeof str !== 'string') {
      return false;
    }
    return str.length >= min && str.length <= max;
  },

  validateAlphanumeric: (str) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(str);
  },

  validateAlphanumericWithUnderscore: (str) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(str);
  },

  validateAlphanumericWithHyphen: (str) => {
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(str);
  },

  validateChineseName: (name) => {
    const regex = /^[\u4e00-\u9fa5]{2,10}$/;
    return regex.test(name);
  },

  validateIdCard: (idCard) => {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  },

  validatePassword: (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/;
    return regex.test(password);
  },

  validateDeviceCode: (code) => {
    const regex = /^[A-Z0-9]{4,20}$/;
    return regex.test(code);
  },

  validateDeviceName: (name) => {
    if (typeof name !== 'string') {
      return false;
    }
    return name.length >= 2 && name.length <= 100;
  },

  validateQuantity: (quantity, min = 0, max = 999999) => {
    const num = Number(quantity);
    return Number.isInteger(num) && num >= min && num <= max;
  },

  validatePrice: (price, min = 0, max = 999999999.99) => {
    const num = Number(price);
    return !isNaN(num) && num >= min && num <= max && /^\d+(\.\d{1,2})?$/.test(price.toString());
  },

  validateDate: (date) => {
    if (typeof date !== 'string') {
      return false;
    }
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  },

  validateDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
  },

  validatePositiveInteger: (value, max = 2147483647) => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0 && num <= max;
  },

  validateNonNegativeInteger: (value, max = 2147483647) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0 && num <= max;
  },

  validateMaxLength: (str, maxLength) => {
    if (typeof str !== 'string') {
      return false;
    }
    return str.length <= maxLength;
  },

  validateMinLength: (str, minLength) => {
    if (typeof str !== 'string') {
      return false;
    }
    return str.length >= minLength;
  },

  validateRange: (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  validateNotEmpty: (value) => {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return true;
  },

  validateEnum: (value, allowedValues) => {
    return allowedValues.includes(value);
  },

  validateRegex: (str, pattern) => {
    if (typeof str !== 'string') {
      return false;
    }
    return pattern.test(str);
  },

  validateNoSpecialChars: (str, allowedChars = '') => {
    if (typeof str !== 'string') {
      return false;
    }
    const regex = new RegExp(`^[a-zA-Z0-9\\s${allowedChars}]+$`);
    return regex.test(str);
  },

  validateNoSQLInjection: (str) => {
    if (typeof str !== 'string') {
      return false;
    }
    const sqlKeywords = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'TRUNCATE',
      'UNION',
      'OR',
      'AND',
      'WHERE',
      'EXEC',
      'EXECUTE',
      'SCRIPT',
      'JAVASCRIPT',
      'VBSCRIPT',
      'ONLOAD',
      'ONERROR',
    ];
    const upperStr = str.toUpperCase();
    return !sqlKeywords.some((keyword) => upperStr.includes(keyword));
  },

  validateNoXSS: (str) => {
    if (typeof str !== 'string') {
      return false;
    }
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*>/g,
    ];
    return !xssPatterns.some((pattern) => pattern.test(str));
  },

  validateBatchSize: (size, maxSize = 100) => {
    const num = Number(size);
    return Number.isInteger(num) && num > 0 && num <= maxSize;
  },

  validatePageNumber: (page) => {
    const num = Number(page);
    return Number.isInteger(num) && num >= 1;
  },

  validatePageSize: (size, minSize = 1, maxSize = 100) => {
    const num = Number(size);
    return Number.isInteger(num) && num >= minSize && num <= maxSize;
  },

  escapeHtml: (text) => {
    if (typeof text !== 'string') {
      return text;
    }
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  unescapeHtml: (text) => {
    if (typeof text !== 'string') {
      return text;
    }
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
    };
    return text.replace(/&(amp|lt|gt|quot|#039);/g, (m) => map[m]);
  },

  truncateString: (str, maxLength, suffix = '...') => {
    if (typeof str !== 'string') {
      return str;
    }
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  validateCoordinates: (latitude, longitude) => {
    const lat = Number(latitude);
    const lon = Number(longitude);
    return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },

  validateIP: (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },

  validatePort: (port) => {
    const num = Number(port);
    return Number.isInteger(num) && num >= 1 && num <= 65535;
  },

  validateFilePath: (path) => {
    if (typeof path !== 'string') {
      return false;
    }
    const regex = /^[a-zA-Z]:\\(?:[^<>:"|?*\n\r]+\\)*[^<>:"|?*\n\r]*$|^[^<>:"|?*\n\r]+(\/[^<>:"|?*\n\r]+)*$/;
    return regex.test(path);
  },

  validateFileName: (fileName) => {
    if (typeof fileName !== 'string') {
      return false;
    }
    const regex = /^[^<>:"|?*\n\r/\\]+$/;
    return regex.test(fileName) && fileName.length > 0 && fileName.length <= 255;
  },

  validateFileExtension: (fileName, allowedExtensions) => {
    if (typeof fileName !== 'string') {
      return false;
    }
    const ext = fileName.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
  },

  validateFileSize: (fileSize, maxSize) => {
    const size = Number(fileSize);
    return !isNaN(size) && size > 0 && size <= maxSize;
  },

  validateArrayLength: (arr, minLength = 0, maxLength = Infinity) => {
    if (!Array.isArray(arr)) {
      return false;
    }
    return arr.length >= minLength && arr.length <= maxLength;
  },

  validateObjectKeys: (obj, allowedKeys) => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    const keys = Object.keys(obj);
    return keys.every((key) => allowedKeys.includes(key));
  },

  sanitizeFileName: (fileName) => {
    if (typeof fileName !== 'string') {
      return fileName;
    }
    return fileName.replace(/[<>:"|?*\n\r/\\]/g, '_');
  },

  sanitizeURL: (url) => {
    if (typeof url !== 'string') {
      return url;
    }
    return url.replace(/[<>"']/g, '');
  },

  validateAndSanitize: (input, validators) => {
    let sanitized = input;

    for (const validator of validators) {
      if (!validator.validate(sanitized)) {
        return {
          valid: false,
          error: validator.error,
          sanitized: null,
        };
      }
      if (validator.sanitize) {
        sanitized = validator.sanitize(sanitized);
      }
    }

    return {
      valid: true,
      error: null,
      sanitized,
    };
  },

  generateRandomString: (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  hashString: async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },

  validateSQLInjection: (input) => {
    if (typeof input !== 'string') {
      return true;
    }

    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|WHERE|OR|AND)\b)/gi,
      /(--|;|\/\*|\*\/|@@|xp_|sp_)/g,
      /('|'')/g,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }

    return true;
  },

  validateXSS: (input) => {
    if (typeof input !== 'string') {
      return true;
    }

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]+>/g,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }

    return true;
  },

  sanitizeFilename: (filename) => {
    if (typeof filename !== 'string') {
      return '';
    }

    let sanitized = filename.trim();

    sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');

    sanitized = sanitized.replace(/\s+/g, '_');

    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const ext = sanitized.substring(sanitized.lastIndexOf('.'));
      const name = sanitized.substring(0, maxLength - ext.length);
      sanitized = name + ext;
    }

    return sanitized;
  },

  validateFileType: (file, allowedTypes) => {
    if (!file || !file.type) {
      return false;
    }
    return allowedTypes.includes(file.type);
  },

  validateImageDimensions: (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isValid = img.width <= maxWidth && img.height <= maxHeight;
        URL.revokeObjectURL(img.src);
        resolve(isValid);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  },
};

export default securityUtils;
