import CryptoJS from 'crypto-js';

import { createLogger } from './logger';

const logger = createLogger('crypto');

const ENCRYPTION_KEY = 'WarehouseManagementSystem2025SecretKey';
const IV_LENGTH = 16;

class CryptoUtils {
  encryptPassword(password) {
    if (!password) {
      return '';
    }

    try {
      const iv = CryptoJS.lib.WordArray.random(IV_LENGTH / 2);
      const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);

      const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const combined = `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.toString()}`;
      return combined;
    } catch (error) {
      logger.error('[CryptoUtils.encryptPassword] AES加密失败:', error);
      throw new Error('密码加密失败');
    }
  }

  encryptSensitiveData(data, fields = ['password', 'pwd', 'secret']) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const encryptedData = { ...data };

    for (const field of fields) {
      if (encryptedData[field]) {
        try {
          encryptedData[field] = this.encryptPassword(encryptedData[field]);
        } catch (error) {
          logger.error(`[CryptoUtils.encryptSensitiveData] 加密字段 ${field} 失败:`, error);
          throw error;
        }
      }
    }

    return encryptedData;
  }

  maskPassword(password) {
    if (!password) {
      return '';
    }
    return '*'.repeat(Math.min(password.length, 12));
  }

  validatePassword(password) {
    if (!password || password.length < 6) {
      return {
        valid: false,
        message: '密码长度至少为6位',
      };
    }

    if (password.length > 32) {
      return {
        valid: false,
        message: '密码长度不能超过32位',
      };
    }

    return {
      valid: true,
      message: '',
    };
  }

  generateRandomPassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }
}

const cryptoUtils = new CryptoUtils();

export default cryptoUtils;
