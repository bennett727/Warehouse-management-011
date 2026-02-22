import { AUTH_API } from '../../constants/apiConstants';
import request from '../../utils/request';
import tokenManager from '../../utils/tokenManager';

/**
 * 认证相关API
 * @file: auth.js
 * @description: 处理用户登录、登出、获取用户信息和刷新令牌等认证相关操作
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 2.0
 */

/**
 * 用户登录
 * @description: 使用用户名和密码进行登录认证
 * @param {Object} loginForm - 登录表单数据
 * @param {string} loginForm.username - 用户名
 * @param {string} loginForm.password - 密码
 * @param {string} [loginForm.captcha] - 验证码（可选）
 * @returns {Promise<Object>} 登录响应，包含令牌和用户信息
 */
export function login(loginForm) {
  return request({
    url: AUTH_API.LOGIN,
    method: 'post',
    data: loginForm,
  });
}

/**
 * 用户登出
 * @description: 执行用户登出操作，清除服务端会话
 * @returns {Promise<Object>} 登出响应
 */
export function logout() {
  return request({
    url: AUTH_API.LOGOUT,
    method: 'post',
  });
}

/**
 * 获取用户信息
 * @description: 获取当前登录用户的详细信息
 * @returns {Promise<Object>} 用户信息响应
 */
export function getUserInfo() {
  return request({
    url: `${AUTH_API.BASE}/info`,
    method: 'get',
  });
}

/**
 * 刷新令牌
 * @description: 使用刷新令牌获取新的访问令牌
 * @returns {Promise<Object>} 新的令牌响应
 */
export function refreshToken() {
  return request({
    url: AUTH_API.REFRESH_TOKEN,
    method: 'post',
  });
}

/**
 * 导出token管理器
 */
export { tokenManager };
export default { login, logout, getUserInfo, refreshToken, tokenManager };
