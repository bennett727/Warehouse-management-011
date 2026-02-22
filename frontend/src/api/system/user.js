/**
 * 用户管理相关API服务
 * 处理用户的增删改查、角色分配等操作
 */
import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取用户列表
 * @param {object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.role - 角色过滤
 * @param {boolean} params.status - 状态过滤
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 用户列表数据
 */
export const getUserList = async (params) => {
  return request.get(SYSTEM_API.USERS, { params });
};

/**
 * 获取用户详情
 * @param {string} userId - 用户ID
 * @returns {Promise} 用户详情
 */
export const getUserDetail = async (userId) => {
  return request.get(SYSTEM_API.USER_DETAIL(userId));
};

/**
 * 创建新用户
 * @param {object} userData - 用户信息
 * @returns {Promise} 创建结果
 */
export const createUser = async (userData) => {
  return request.post(SYSTEM_API.USERS, userData);
};

/**
 * 更新用户信息
 * @param {string} userId - 用户ID
 * @param {object} userData - 用户信息
 * @returns {Promise} 更新结果
 */
export const updateUser = async (userId, userData) => {
  return request.put(SYSTEM_API.USER_DETAIL(userId), userData);
};

/**
 * 删除用户
 * @param {string} userId - 用户ID
 * @returns {Promise} 删除结果
 */
export const deleteUser = async (userId) => {
  return request.delete(SYSTEM_API.USER_DETAIL(userId));
};

/**
 * 批量删除用户
 * @param {Array<string>} userIds - 用户ID数组
 * @returns {Promise} 删除结果
 */
export const batchDeleteUsers = async (userIds) => {
  return request.delete(SYSTEM_API.USER_BATCH_DELETE, { data: { ids: userIds } });
};

/**
 * 更新用户状态
 * @param {string} userId - 用户ID
 * @param {boolean} status - 新状态
 * @returns {Promise} 更新结果
 */
export const updateUserStatus = async (userId, status) => {
  return request.put(SYSTEM_API.USER_STATUS(userId), { status });
};

/**
 * 重置用户密码（管理员操作）
 * @param {string} userId - 用户ID
 * @returns {Promise} 重置结果
 */
export const resetUserPassword = async (userId) => {
  return request.put(SYSTEM_API.USER_RESET_PASSWORD(userId));
};

/**
 * 更新用户角色
 * @param {string} userId - 用户ID
 * @param {string} roleId - 角色ID
 * @returns {Promise} 更新结果
 */
export const updateUserRole = async (userId, roleId) => {
  return request.put(`${SYSTEM_API.USER_DETAIL(userId)}/role`, { roleId });
};

/**
 * 更新用户权限
 * @param {string} userId - 用户ID
 * @param {Array<string>} permissionIds - 权限ID数组
 * @returns {Promise} 更新结果
 */
export const updateUserPermissions = async (userId, permissionIds) => {
  return request.put(`${SYSTEM_API.USER_DETAIL(userId)}/permissions`, { permissionIds });
};

/**
 * 导出用户列表
 * @param {object} params - 导出参数
 * @returns {Promise} 导出结果
 */
export const exportUsers = async (params) => {
  return request.get(`${SYSTEM_API.USERS}/export`, {
    params,
    responseType: 'blob',
  });
};

/**
 * 导入用户数据
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise} 导入结果
 */
export const importUsers = async (formData) => {
  return request.post(`${SYSTEM_API.USERS}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 获取用户统计数据
 * @returns {Promise} 统计数据
 */
export const getUserStats = async () => {
  return request.get(`${SYSTEM_API.USERS}/stats`);
};

/**
 * 获取用户登录日志
 * @param {string} userId - 用户ID
 * @param {object} params - 查询参数
 * @returns {Promise} 登录日志列表
 */
export const getUserLoginLogs = async (userId, params) => {
  return request.get(SYSTEM_API.USER_LOGIN_LOGS(userId), { params });
};

/**
 * 获取用户操作日志
 * @param {string} userId - 用户ID
 * @param {object} params - 查询参数
 * @returns {Promise} 操作日志列表
 */
export const getUserOperationLogs = async (userId, params) => {
  return request.get(`${SYSTEM_API.USER_DETAIL(userId)}/operation-logs`, { params });
};

/**
 * 获取所有角色列表（用于用户分配角色）
 * @returns {Promise} 角色列表
 */
export const getAllRoles = async () => {
  return request.get(`${SYSTEM_API.ROLES}/all`);
};

/**
 * 获取用户拥有的权限列表
 * @param {string} userId - 用户ID
 * @returns {Promise} 权限列表
 */
export const getUserPermissions = async (userId) => {
  return request.get(`${SYSTEM_API.USER_DETAIL(userId)}/permissions`);
};

/**
 * 检查用户名是否已存在
 * @param {string} username - 用户名
 * @param {string} excludeId - 排除的用户ID（用于编辑场景）
 * @returns {Promise} 检查结果
 */
export const checkUsernameExists = async (username, excludeId = '') => {
  return request.get(SYSTEM_API.USER_CHECK_USERNAME, {
    params: { username, excludeId },
  });
};

/**
 * 检查邮箱是否已存在
 * @param {string} email - 邮箱
 * @param {string} excludeId - 排除的用户ID
 * @returns {Promise} 检查结果
 */
export const checkEmailExists = async (email, excludeId = '') => {
  return request.get(SYSTEM_API.USER_CHECK_EMAIL, {
    params: { email, excludeId },
  });
};

/**
 * 检查手机号是否已存在
 * @param {string} phone - 手机号
 * @param {string} excludeId - 排除的用户ID
 * @returns {Promise} 检查结果
 */
export const checkPhoneExists = async (phone, excludeId = '') => {
  return request.get(SYSTEM_API.USER_CHECK_PHONE, {
    params: { phone, excludeId },
  });
};

/**
 * 更新用户个人信息
 * @param {string} userId - 用户ID
 * @param {object} userData - 用户信息
 * @returns {Promise} 更新结果
 */
export const updateUserInfo = async (userId, userData) => {
  return updateUser(userId, userData);
};

/**
 * 修改用户密码
 * @param {object} passwordData - 密码信息
 * @param {string} passwordData.oldPassword - 旧密码
 * @param {string} passwordData.newPassword - 新密码
 * @returns {Promise} 修改结果
 */
export const changePassword = async (passwordData) => {
  return request.put(SYSTEM_API.USER_CHANGE_PASSWORD, passwordData);
};

/**
 * 获取用户密码保护问题
 * @param {string} userId - 用户ID
 * @returns {Promise} 密码保护问题信息
 */
export const getUserSecurityQuestions = async (userId) => {
  return request.get(`${SYSTEM_API.USER_DETAIL(userId)}/security-questions`);
};

/**
 * 设置用户密码保护问题
 * @param {string} userId - 用户ID
 * @param {object} securityData - 密保问题数据
 * @param {string} securityData.currentPassword - 当前密码
 * @param {string} securityData.question1 - 密保问题1
 * @param {string} securityData.answer1 - 密保答案1
 * @param {string} securityData.question2 - 密保问题2
 * @param {string} securityData.answer2 - 密保答案2
 * @returns {Promise} 设置结果
 */
export const setUserSecurityQuestions = async (userId, securityData) => {
  return request.post(`${SYSTEM_API.USER_DETAIL(userId)}/security-questions`, securityData);
};

/**
 * 验证密码保护问题答案
 * @param {string} userId - 用户ID
 * @param {object} answerData - 答案数据
 * @returns {Promise} 验证结果
 */
export const verifySecurityAnswers = async (userId, answerData) => {
  return request.post(`${SYSTEM_API.USER_DETAIL(userId)}/verify-security-answers`, answerData);
};

/**
 * 通过密保问题重置密码
 * @param {string} userId - 用户ID
 * @param {object} resetData - 重置数据
 * @returns {Promise} 重置结果
 */
export const resetPasswordBySecurity = async (userId, resetData) => {
  return request.post(`${SYSTEM_API.USER_DETAIL(userId)}/reset-password-by-security`, resetData);
};

/**
 * 导出所有用户相关API
 */
export default {
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  resetUserPassword,
  updateUserRole,
  updateUserPermissions,
  exportUsers,
  importUsers,
  getUserStats,
  getUserLoginLogs,
  getUserOperationLogs,
  getAllRoles,
  getUserPermissions,
  checkUsernameExists,
  checkEmailExists,
  checkPhoneExists,
  updateUserInfo,
  changePassword,
  getUserSecurityQuestions,
  setUserSecurityQuestions,
  verifySecurityAnswers,
  resetPasswordBySecurity,
};
