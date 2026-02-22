/**
 * 认证相关工具函数
 * @file: auth.js
 * @description: 处理令牌的存储和获取，改进安全性
 * @author: Trae AI
 * @createTime: 2025-12-21 23:55:00
 * @version: 2.0
 */

import { createLogger } from './logger.js';

const logger = createLogger('auth');

// 令牌存储键名
const TOKEN_KEY = 'wms_v1_token';
const REFRESH_TOKEN_KEY = 'wms_v1_refresh_token';
const TOKEN_METADATA_KEY = 'wms_v1_token_metadata';

// 令牌过期时间（毫秒）- 24小时
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;

// 刷新令牌过期时间（毫秒）- 7天
const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// 自动刷新窗口（毫秒）- 令牌过期前5分钟
const AUTO_REFRESH_WINDOW = 5 * 60 * 1000;

// 保存令牌
export function setToken(token, expiresIn = TOKEN_EXPIRATION) {
  try {
    const data = {
      value: token,
      timestamp: Date.now(),
      expiresIn,
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(data));

    const metadata = {
      issuedAt: Date.now(),
      expiresAt: Date.now() + expiresIn,
    };
    localStorage.setItem(TOKEN_METADATA_KEY, JSON.stringify(metadata));

    logger.info('Token saved successfully');
  } catch (error) {
    logger.error('Failed to save token:', error);
    throw error;
  }
}

// 保存刷新令牌
export function setRefreshToken(refreshToken) {
  try {
    const data = {
      value: refreshToken,
      timestamp: Date.now(),
      expiresAt: Date.now() + REFRESH_TOKEN_EXPIRATION,
    };
    localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(data));
    logger.info('Refresh token saved successfully');
  } catch (error) {
    logger.error('Failed to save refresh token:', error);
    throw error;
  }
}

// 获取令牌
export function getToken() {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      return null;
    }
    const data = JSON.parse(stored);
    return data.value;
  } catch (error) {
    logger.error('Failed to get token:', error);
    throw error;
  }
}

// 获取刷新令牌
export function getRefreshToken() {
  try {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      return null;
    }
    const data = JSON.parse(stored);
    return data.value;
  } catch (error) {
    logger.error('Failed to get refresh token:', error);
    throw error;
  }
}

// 删除令牌
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_METADATA_KEY);
    logger.info('Tokens removed successfully');
  } catch (error) {
    logger.error('Failed to remove token:', error);
    throw error;
  }
}

// 检查是否有令牌
export function hasToken() {
  return !!getToken();
}

// 检查令牌是否即将过期
export function isTokenExpiringSoon() {
  try {
    const metadata = localStorage.getItem(TOKEN_METADATA_KEY);
    if (!metadata) {
      return false;
    }
    const data = JSON.parse(metadata);
    const now = Date.now();
    const timeUntilExpiry = data.expiresAt - now;
    return timeUntilExpiry > 0 && timeUntilExpiry < AUTO_REFRESH_WINDOW;
  } catch (error) {
    logger.error('Failed to check token expiration:', error);
    return false;
  }
}

// 检查令牌是否已过期
export function isTokenExpired() {
  try {
    const metadata = localStorage.getItem(TOKEN_METADATA_KEY);
    if (!metadata) {
      return true;
    }
    const data = JSON.parse(metadata);
    return Date.now() >= data.expiresAt;
  } catch (error) {
    logger.error('Failed to check token expiration:', error);
    return true;
  }
}

// 获取令牌剩余时间（毫秒）
export function getTokenRemainingTime() {
  try {
    const metadata = localStorage.getItem(TOKEN_METADATA_KEY);
    if (!metadata) {
      return 0;
    }
    const data = JSON.parse(metadata);
    const remaining = data.expiresAt - Date.now();
    return Math.max(0, remaining);
  } catch (error) {
    logger.error('Failed to get token remaining time:', error);
    return 0;
  }
}

// 检查刷新令牌是否有效
export function isRefreshTokenValid() {
  try {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      return false;
    }
    const data = JSON.parse(stored);
    return Date.now() < data.expiresAt;
  } catch (error) {
    logger.error('Failed to check refresh token validity:', error);
    return false;
  }
}

// 清理过期的令牌
export function cleanExpiredTokens() {
  try {
    if (isTokenExpired()) {
      logger.info('Cleaning expired access token');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_METADATA_KEY);
    }

    if (!isRefreshTokenValid()) {
      logger.info('Cleaning expired refresh token');
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    logger.error('Failed to clean expired tokens:', error);
  }
}

// 获取令牌信息（用于调试）
export function getTokenInfo() {
  try {
    const tokenMetadata = localStorage.getItem(TOKEN_METADATA_KEY);
    const refreshTokenData = localStorage.getItem(REFRESH_TOKEN_KEY);

    const info = {
      hasAccessToken: !!localStorage.getItem(TOKEN_KEY),
      hasRefreshToken: !!refreshTokenData,
      accessTokenExpiresAt: tokenMetadata ? JSON.parse(tokenMetadata).expiresAt : null,
      refreshTokenExpiresAt: refreshTokenData ? JSON.parse(refreshTokenData).expiresAt : null,
      accessTokenRemainingTime: getTokenRemainingTime(),
    };

    return info;
  } catch (error) {
    logger.error('Failed to get token info:', error);
    return null;
  }
}
