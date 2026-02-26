<template>
  <div class="login-container" data-cy="login-page">
    <div class="login-background">
      <div class="login-shape shape-1"></div>
      <div class="login-shape shape-2"></div>
      <div class="login-shape shape-3"></div>
      <div class="login-shape shape-4"></div>
    </div>

    <div class="login-form-wrapper">
      <div class="login-header">
        <div class="login-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 3h18v18H3V3z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 9h18M9 21V9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2>小型仓库管理系统</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <OptimizedForm ref="loginFormRef" v-model="loginForm" :rules="loginRules" data-cy="login-form">
        <el-form-item prop="username" label="用户名" data-cy="login-username-form-item">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
            data-cy="login-username-input"
          >
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password" label="密码" data-cy="login-password-form-item">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            clearable
            data-cy="login-password-input"
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="login-actions">
            <el-checkbox v-model="loginForm.rememberMe" data-cy="login-remember-checkbox">记住我</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
            data-cy="login-submit-button"
          >
            登录
          </el-button>
        </el-form-item>
      </OptimizedForm>

      <div v-if="loading && showProgress" class="login-progress-container">
        <el-progress
          :percentage="progressPercentage"
          :stroke-width="8"
          :show-text="false"
          :color="progressColor"
          :indeterminate="progressPercentage === 0"
          data-cy="login-progress"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import OptimizedForm from '@/components/base/OptimizedForm.vue';
import { useUserStore } from '@/stores/user';
import { getLocalItem } from '@/utils/cache.js';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Login');

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref(null);

const loading = ref(false);
const showProgress = ref(false);
const progressPercentage = ref(0);
const progressText = ref('正在验证用户信息...');
const progressColor = ref([
  { color: '#667eea', percentage: 30 },
  { color: '#764ba2', percentage: 70 },
  { color: '#f56c6c', percentage: 100 },
]);

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  rememberMe: false,
});

const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur',
    },
    {
      pattern: /^[a-zA-Z]/,
      message: '用户名必须以字母开头',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' },
  ],
});

const updateProgress = (percentage, text) => {
  progressPercentage.value = percentage;
  progressText.value = text;
};

const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) {
      return;
    }

    loading.value = true;
    showProgress.value = true;
    progressPercentage.value = 0;
    progressText.value = '正在验证用户信息...';

    updateProgress(30, '正在连接服务器...');

    const result = await userStore.loginUser(loginForm);

    logger.info('登录响应:', result);
    logger.info('result.success:', result.success);
    logger.info('result.code:', result.code);
    logger.info('result.data:', result.data);

    updateProgress(70, '正在验证身份...');

    updateProgress(100, '登录成功，正在跳转...');

    if (result.code === 200) {
      ElMessage.success('登录成功');
      logger.info('准备跳转到dashboard');
      logger.info('currentUser:', userStore.currentUser);
      logger.info('userInfo:', userStore.userInfo);
      logger.info('token:', userStore.token);

      // 确保用户信息已正确存储到 localStorage
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 验证token和用户信息是否正确存储
      const storedToken = localStorage.getItem('access_token');
      const storedUserInfo = localStorage.getItem('user_info');
      logger.info('存储的token:', storedToken ? '存在' : '不存在');
      logger.info('存储的userInfo:', storedUserInfo ? '存在' : '不存在');

      logger.info('开始路由跳转...');
      
      // 获取重定向路径（如果有）
      const redirectPath = router.currentRoute.value.query.redirect || '/dashboard';
      logger.info('重定向路径:', redirectPath);
      
      router
        .push(redirectPath)
        .then(() => {
          logger.info('跳转成功');
          logger.info('当前路由:', router.currentRoute.value);
        })
        .catch((err) => {
          logger.error('跳转失败:', err);
          logger.error('错误详情:', JSON.stringify(err));
        });
    } else {
      ElMessage.error(result.message || '登录失败');
    }
  } catch (error) {
    logger.error('Login failed:', error);
    ElMessage.error(error.message || '登录失败，请重试');
  } finally {
    loading.value = false;
    showProgress.value = false;
    progressPercentage.value = 0;
  }
};

onMounted(() => {
  const savedUsername = getLocalItem('rememberedUsername');
  if (savedUsername) {
    loginForm.username = savedUsername;
    loginForm.rememberMe = true;
  }
});
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  /* 登录背景 - 紫蓝渐变 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.login-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
  filter: blur(40px);
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 100%);
  bottom: -100px;
  left: -100px;
  animation-delay: -5s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
  top: 40%;
  left: 15%;
  animation-delay: -10s;
}

/* 添加更多装饰形状 */
.shape-4 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.02) 100%);
  bottom: 20%;
  right: 10%;
  animation-delay: -15s;
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 25s infinite ease-in-out;
  filter: blur(30px);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }

  33% {
    transform: translateY(-30px) rotate(5deg) scale(1.05);
  }

  66% {
    transform: translateY(20px) rotate(-5deg) scale(0.95);
  }
}

.login-form-wrapper {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.25),
    0 10px 30px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 48px 40px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  background: var(--primary-50);
  border: 2px solid var(--primary-200);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-600);
  box-shadow: var(--box-shadow-md);
}

.login-logo svg {
  width: 32px;
  height: 32px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 15px;
  color: #6b7280;
  font-weight: 400;
}

.login-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-progress-container {
  margin-top: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-text {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

:deep(.el-progress-bar__outer) {
  background-color: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

:deep(.el-progress-bar__inner::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: #1a1a2e;
}

:deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-checkbox__label) {
  color: #6b7280;
  font-size: 14px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

:deep(.el-button--primary) {
  background: var(--primary-600);
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  background: var(--primary-700);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.5);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

@media (max-width: 767px) {
  .login-form-wrapper {
    padding: 36px 28px;
    max-width: 90%;
  }

  .login-header h2 {
    font-size: 24px;
  }

  .login-header p {
    font-size: 14px;
  }

  .login-logo {
    width: 56px;
    height: 56px;
  }

  .login-logo svg {
    width: 28px;
    height: 28px;
  }

  .shape-1 {
    width: 300px;
    height: 300px;
  }

  .shape-2 {
    width: 200px;
    height: 200px;
  }

  .shape-3 {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .login-form-wrapper {
    padding: 28px 20px;
    max-width: 95%;
  }

  .login-header {
    margin-bottom: 32px;
  }

  .login-header h2 {
    font-size: 22px;
  }

  .login-header p {
    font-size: 13px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    padding: 10px 14px;
  }

  :deep(.el-button--primary) {
    padding: 12px 24px;
    font-size: 15px;
  }
}
</style>
