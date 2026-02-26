<template>
  <div class="error-404" data-cy="error-404-page">
    <div class="error-container">
      <div class="error-illustration">
        <div class="illustration-circle"></div>
        <div class="illustration-content">
          <div class="error-code" data-cy="error-code">404</div>
          <div class="error-icon">
            <el-icon><Warning /></el-icon>
          </div>
        </div>
      </div>

      <div class="error-info" data-cy="error-info">
        <h1 class="error-title" data-cy="error-title">页面不存在</h1>
        <p class="error-description" data-cy="error-description">
          抱歉，您访问的页面不存在或已被移除。<br />
          请检查您输入的URL是否正确，或返回首页继续浏览。
        </p>

        <div class="action-buttons" data-cy="action-buttons">
          <el-button type="primary" size="large" @click="goToHome" data-cy="go-home-button">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack" data-cy="go-back-button">
            <el-icon><Back /></el-icon>
            返回上一页
          </el-button>
        </div>
      </div>

      <div class="nav-hint" data-cy="nav-hint">
        <h3 data-cy="nav-hint-title">您可以尝试访问以下页面</h3>
        <div class="quick-links" data-cy="quick-links">
          <div class="link-card" @click="goToPage('/dashboard')" data-cy="link-dashboard">
            <div
              class="link-icon"
              style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb"
            >
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="link-content">
              <span class="link-title">仪表盘</span>
              <span class="link-desc">查看数据概览</span>
            </div>
          </div>
          <div class="link-card" @click="goToPage('/asset-management/device-list')" data-cy="link-device">
            <div
              class="link-icon"
              style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #059669"
            >
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="link-content">
              <span class="link-title">设备管理</span>
              <span class="link-desc">管理设备信息</span>
            </div>
          </div>
          <div class="link-card" @click="goToPage('/stock-management')" data-cy="link-stock">
            <div
              class="link-icon"
              style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706"
            >
              <el-icon><Box /></el-icon>
            </div>
            <div class="link-content">
              <span class="link-title">库存管理</span>
              <span class="link-desc">管理库存出入</span>
            </div>
          </div>
          <div class="link-card" @click="goToPage('/installation-management')" data-cy="link-installation">
            <div
              class="link-icon"
              style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #4f46e5"
            >
              <el-icon><Setting /></el-icon>
            </div>
            <div class="link-content">
              <span class="link-title">安装管理</span>
              <span class="link-desc">管理设备安装</span>
            </div>
          </div>
          <div class="link-card" @click="goToPage('/repair-management')" data-cy="link-repair">
            <div
              class="link-icon"
              style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #db2777"
            >
              <el-icon><Tools /></el-icon>
            </div>
            <div class="link-content">
              <span class="link-title">维修管理</span>
              <span class="link-desc">管理设备维修</span>
            </div>
          </div>
          <div class="link-card" @click="goToPage('/help')" data-cy="link-help">
            <div class="link-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white">
              <el-icon><QuestionFilled /></el-icon>
            </div>
            <div class="link-content">
              <span class="link-title">帮助中心</span>
              <span class="link-desc">获取使用帮助</span>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-info">
        <p>如果问题持续存在，请联系技术支持</p>
        <el-button link type="primary" @click="goToPage('/contact-support')" data-cy="contact-support-btn">
          <el-icon><Service /></el-icon>
          联系技术支持
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  House,
  Back,
  DataAnalysis,
  Monitor,
  Box,
  Setting,
  Tools,
  QuestionFilled,
  Warning,
  Service,
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = () => {
  router.push('/dashboard');
};

const goBack = () => {
  router.back();
};

const goToPage = (path) => {
  router.push(path);
};
</script>

<style scoped>
.error-404 {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.error-404::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
  pointer-events: none;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-20px, -20px) rotate(5deg);
  }
}

.error-container {
  max-width: 900px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}

.error-illustration {
  position: relative;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration-circle {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  opacity: 0.1;
  position: absolute;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.15;
  }
}

.illustration-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.error-code {
  font-size: 140px;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
  text-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
  animation: slideDown 0.8s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  font-size: 48px;
  color: #f59e0b;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-info {
  margin-bottom: 50px;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.error-title {
  font-size: 36px;
  color: #1a202c;
  margin: 0 0 20px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.error-description {
  font-size: 16px;
  color: #64748b;
  line-height: 1.8;
  margin: 0 0 40px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
}

.action-buttons .el-button--primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.action-buttons .el-button:not(.el-button--primary):hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-buttons .el-icon {
  font-size: 18px;
}

.nav-hint {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

.nav-hint h3 {
  font-size: 18px;
  color: #1a202c;
  margin: 0 0 28px 0;
  font-weight: 600;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.link-card:hover {
  background: white;
  border-color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.link-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.link-card:hover .link-icon {
  transform: scale(1.1);
}

.link-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.link-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
}

.link-desc {
  font-size: 12px;
  color: #64748b;
}

.contact-info {
  animation: fadeIn 0.8s ease-out 0.6s both;
}

.contact-info p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
}

.contact-info .el-button {
  font-size: 14px;
  font-weight: 500;
}

.contact-info .el-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .error-404 {
    padding: 20px;
  }

  .illustration-circle {
    width: 200px;
    height: 200px;
  }

  .error-code {
    font-size: 100px;
  }

  .error-icon {
    font-size: 36px;
  }

  .error-title {
    font-size: 28px;
  }

  .error-description {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .el-button {
    width: 200px;
    justify-content: center;
  }

  .nav-hint {
    padding: 24px;
  }

  .nav-hint h3 {
    font-size: 16px;
  }

  .quick-links {
    grid-template-columns: 1fr;
  }

  .link-card {
    padding: 12px;
  }

  .link-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .link-title {
    font-size: 13px;
  }

  .link-desc {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 13px;
  }

  .action-buttons .el-button {
    width: 100%;
    padding: 12px 24px;
  }
}
</style>
