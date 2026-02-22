/*
 * @file: tokenManager.js
 * @description: Token管理模块，集中管理token的存储、获取、清除等操作
 * @author: 开发团队
 * @createTime: 2026-02-01
 * @version: 2.0
 */

import { createLogger } from './logger';

const logger = createLogger('TokenManager');

/**
 * Token管理类
 * 用于集中管理JWT token的存储、获取、清除等操作
 */
class TokenManager {
  constructor() {
    this.ACCESS_TOKEN_KEY = 'access_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.TOKEN_EXPIRE_TIME_KEY = 'token_expire_time';
  }

  /**
   * 检测是否为Vitest单元测试环境
   * 注意：Cypress E2E测试使用真实的localStorage，不使用global.__tokenStore__
   * @returns {boolean}
   */
  isVitestEnvironment() {
    // 仅在明确的Vitest环境中返回true
    const hasVitestGlobal = typeof global !== 'undefined' && global.__VITEST__ === true;
    const hasVitestEnv = typeof import.meta !== 'undefined' && import.meta.env?.TEST === 'true';

    return hasVitestGlobal || hasVitestEnv;
  }

  /**
   * 存储访问令牌
   * @param {string} token - 访问令牌
   * @param {number} expiresIn - 过期时间（秒）
   */
  setAccessToken(token, expiresIn = 3600) {
    const expireTime = Date.now() + expiresIn * 1000;
    const isVitestEnv = this.isVitestEnvironment();

    logger.debug('[TokenManager] setAccessToken called');
    logger.debug('[TokenManager] isVitestEnvironment:', isVitestEnv);
    logger.debug('[TokenManager] token:', token ? `${token.substring(0, 20)}...` : 'null');

    if (isVitestEnv) {
      // 仅在Vitest单元测试中使用global.__tokenStore__
      if (typeof global !== 'undefined') {
        if (!global.__tokenStore__) {
          global.__tokenStore__ = {};
        }
        global.__tokenStore__[this.ACCESS_TOKEN_KEY] = token;
        global.__tokenStore__[this.TOKEN_EXPIRE_TIME_KEY] = expireTime.toString();
        logger.debug('[TokenManager] Token stored in global.__tokenStore__');
      }
    } else {
      // 生产环境和Cypress E2E测试都使用localStorage
      try {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
        localStorage.setItem(this.TOKEN_EXPIRE_TIME_KEY, expireTime.toString());
        logger.debug('[TokenManager] Token stored in localStorage');
      } catch (e) {
        logger.error('[TokenManager] Failed to store token in localStorage:', e);
      }
    }
  }

  /**
   * 获取访问令牌
   * @returns {string|null} 访问令牌
   */
  getAccessToken() {
    const isVitestEnv = this.isVitestEnvironment();
    logger.debug('[TokenManager] getAccessToken called, isVitestEnvironment:', isVitestEnv);

    if (isVitestEnv) {
      // Vitest单元测试环境
      const token = (typeof global !== 'undefined' && global.__tokenStore__?.[this.ACCESS_TOKEN_KEY]) || null;
      logger.debug('[TokenManager] Token from global.__tokenStore__:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    }

    // 生产环境和Cypress E2E测试都从localStorage获取
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      logger.debug('[TokenManager] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    } catch (e) {
      logger.error('[TokenManager] Failed to get token from localStorage:', e);
      return null;
    }
  }

  /**
   * 存储刷新令牌
   * @param {string} token - 刷新令牌
   */
  setRefreshToken(token) {
    const isVitestEnv = this.isVitestEnvironment();

    if (isVitestEnv) {
      if (typeof global !== 'undefined') {
        if (!global.__tokenStore__) {
          global.__tokenStore__ = {};
        }
        global.__tokenStore__[this.REFRESH_TOKEN_KEY] = token;
      }
    } else {
      try {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      } catch (e) {
        logger.error('[TokenManager] Failed to store refresh token:', e);
      }
    }
  }

  /**
   * 获取刷新令牌
   * @returns {string|null} 刷新令牌
   */
  getRefreshToken() {
    const isVitestEnv = this.isVitestEnvironment();

    if (isVitestEnv) {
      return (typeof global !== 'undefined' && global.__tokenStore__?.[this.REFRESH_TOKEN_KEY]) || null;
    }

    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (e) {
      logger.error('[TokenManager] Failed to get refresh token:', e);
      return null;
    }
  }

  /**
   * 检查访问令牌是否过期
   * @returns {boolean} 是否过期
   */
  isAccessTokenExpired() {
    let expireTime;
    const isVitestEnv = this.isVitestEnvironment();

    if (isVitestEnv) {
      expireTime = typeof global !== 'undefined' && global.__tokenStore__?.[this.TOKEN_EXPIRE_TIME_KEY];
    } else {
      try {
        expireTime = localStorage.getItem(this.TOKEN_EXPIRE_TIME_KEY);
      } catch {
        return true;
      }
    }

    if (!expireTime) {
      return true;
    }
    return Date.now() > parseInt(expireTime);
  }

  /**
   * 清除所有令牌
   */
  clearTokens() {
    const isVitestEnv = this.isVitestEnvironment();

    if (isVitestEnv) {
      if (typeof global !== 'undefined' && global.__tokenStore__) {
        delete global.__tokenStore__[this.ACCESS_TOKEN_KEY];
        delete global.__tokenStore__[this.REFRESH_TOKEN_KEY];
        delete global.__tokenStore__[this.TOKEN_EXPIRE_TIME_KEY];
      }
    } else {
      try {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRE_TIME_KEY);
      } catch (e) {
        logger.error('[TokenManager] Failed to clear tokens:', e);
      }
    }
  }

  /**
   * 检查是否有有效的令牌
   * @returns {boolean} 是否有有效令牌
   */
  hasValidToken() {
    const token = this.getAccessToken();
    return token && !this.isAccessTokenExpired();
  }

  /**
   * 获取令牌过期时间
   * @returns {number|null} 过期时间戳
   */
  getTokenExpireTime() {
    const isVitestEnv = this.isVitestEnvironment();
    let expireTime;

    if (isVitestEnv) {
      expireTime = typeof global !== 'undefined' && global.__tokenStore__?.[this.TOKEN_EXPIRE_TIME_KEY];
    } else {
      try {
        expireTime = localStorage.getItem(this.TOKEN_EXPIRE_TIME_KEY);
      } catch {
        return null;
      }
    }

    return expireTime ? parseInt(expireTime) : null;
  }
}

// 导出单例实例
const tokenManager = new TokenManager();
export default tokenManager;

// 导出便捷函数
export const getToken = () => tokenManager.getAccessToken();
export const setToken = (token, expiresIn) => tokenManager.setAccessToken(token, expiresIn);
export const removeToken = () => tokenManager.clearAllTokens();
