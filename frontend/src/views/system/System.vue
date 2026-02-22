<!--
  @file: System.vue
  @description: 系统管理页面 - 展示系统信息、技术栈、运行状态等
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
  @modifyRecords:
      2026-02-08: 标注为预留功能组件，当前未在路由中配置，保留备用
      2026-02-12: 优化布局和视觉设计，增强用户体验
-->
<template>
  <PageLayout
    title="系统参数"
    description="查看系统信息、技术栈配置和运行状态"
    data-cy="system-page"
    :no-padding="true"
  >
    <div class="system-management-container">
      <el-row :gutter="20" class="system-row">
        <el-col :span="16">
          <el-card class="system-info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon class="header-icon"><InfoFilled /></el-icon>
                  <span class="header-title">系统信息</span>
                </div>
                <el-tag type="success" effect="dark">
                  <el-icon><CircleCheck /></el-icon>
                  运行正常
                </el-tag>
              </div>
            </template>

            <el-descriptions :column="2" border class="system-descriptions">
              <el-descriptions-item label="系统名称">
                <div class="description-content">
                  <el-icon><Monitor /></el-icon>
                  <span>{{ systemInfo.name }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="系统版本">
                <div class="description-content">
                  <el-icon><PriceTag /></el-icon>
                  <span>{{ systemInfo.version }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="前端框架">
                <div class="description-content">
                  <el-icon><Platform /></el-icon>
                  <span>{{ systemInfo.frontendFramework }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="后端框架">
                <div class="description-content">
                  <el-icon><Monitor /></el-icon>
                  <span>{{ systemInfo.backendFramework }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="数据库">
                <div class="description-content">
                  <el-icon><Coin /></el-icon>
                  <span>{{ systemInfo.database }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="开发团队">
                <div class="description-content">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ systemInfo.developTeam }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="上线时间">
                <div class="description-content">
                  <el-icon><Clock /></el-icon>
                  <span>{{ systemInfo.onlineTime }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="最后更新">
                <div class="description-content">
                  <el-icon><Refresh /></el-icon>
                  <span>{{ systemInfo.lastUpdate }}</span>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="system-stats-card" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon class="header-icon"><DataAnalysis /></el-icon>
                  <span class="header-title">系统统计</span>
                </div>
              </div>
            </template>

            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-icon-wrapper stat-icon-blue">
                  <el-icon class="stat-icon"><User /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.userCount }}</div>
                  <div class="stat-label">用户总数</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon-wrapper stat-icon-purple">
                  <el-icon class="stat-icon"><Key /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.roleCount }}</div>
                  <div class="stat-label">角色数量</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon-wrapper stat-icon-green">
                  <el-icon class="stat-icon"><Location /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.areaCount }}</div>
                  <div class="stat-label">区域数量</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon-wrapper stat-icon-orange">
                  <el-icon class="stat-icon"><Monitor /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.deviceCount }}</div>
                  <div class="stat-label">设备数量</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="system-row">
        <el-col :span="24">
          <el-card class="tech-stack-card" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon class="header-icon"><Grid /></el-icon>
                  <span class="header-title">技术栈</span>
                </div>
              </div>
            </template>

            <div class="tech-stack-container">
              <div class="tech-section">
                <h4 class="tech-section-title">
                  <el-icon><Platform /></el-icon>
                  前端技术栈
                </h4>
                <div class="tech-tags">
                  <el-tag type="primary" effect="plain" size="large">Vue.js 3.4.21</el-tag>
                  <el-tag type="success" effect="plain" size="large">Vite 6.3.0</el-tag>
                  <el-tag type="warning" effect="plain" size="large">Element Plus 2.6.3</el-tag>
                  <el-tag type="info" effect="plain" size="large">Pinia 2.1.7</el-tag>
                  <el-tag type="danger" effect="plain" size="large">Vue Router 4.3.0</el-tag>
                  <el-tag type="primary" effect="plain" size="large">Axios 1.11.0</el-tag>
                </div>
              </div>

              <div class="tech-section">
                <h4 class="tech-section-title">
                  <el-icon><Monitor /></el-icon>
                  后端技术栈
                </h4>
                <div class="tech-tags">
                  <el-tag type="primary" effect="plain" size="large">Spring Boot 3.5.5</el-tag>
                  <el-tag type="success" effect="plain" size="large">Java 17</el-tag>
                  <el-tag type="warning" effect="plain" size="large">Spring Security 6.1.0</el-tag>
                  <el-tag type="info" effect="plain" size="large">Spring Data JPA 3.1.0</el-tag>
                  <el-tag type="danger" effect="plain" size="large">JWT 0.11.5</el-tag>
                  <el-tag type="primary" effect="plain" size="large">MySQL 8.0</el-tag>
                </div>
              </div>

              <div class="tech-section">
                <h4 class="tech-section-title">
                  <el-icon><Tools /></el-icon>
                  开发工具
                </h4>
                <div class="tech-tags">
                  <el-tag type="primary" effect="plain" size="large">VS Code</el-tag>
                  <el-tag type="success" effect="plain" size="large">IntelliJ IDEA</el-tag>
                  <el-tag type="warning" effect="plain" size="large">Maven</el-tag>
                  <el-tag type="info" effect="plain" size="large">Git</el-tag>
                  <el-tag type="danger" effect="plain" size="large">Postman</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="system-row">
        <el-col :span="24">
          <el-card class="system-features-card" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon class="header-icon"><Star /></el-icon>
                  <span class="header-title">系统特性</span>
                </div>
              </div>
            </template>

            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon-wrapper feature-icon-blue">
                  <el-icon class="feature-icon"><Lock /></el-icon>
                </div>
                <div class="feature-content">
                  <h5 class="feature-title">安全认证</h5>
                  <p class="feature-desc">基于JWT的令牌认证机制，支持多角色权限控制</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrapper feature-icon-green">
                  <el-icon class="feature-icon"><TrendCharts /></el-icon>
                </div>
                <div class="feature-content">
                  <h5 class="feature-title">实时监控</h5>
                  <p class="feature-desc">设备状态实时监控，支持远程连接和数据采集</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrapper feature-icon-purple">
                  <el-icon class="feature-icon"><DataBoard /></el-icon>
                </div>
                <div class="feature-content">
                  <h5 class="feature-title">数据可视化</h5>
                  <p class="feature-desc">丰富的图表展示，直观呈现仓库运营数据</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrapper feature-icon-orange">
                  <el-icon class="feature-icon"><Operation /></el-icon>
                </div>
                <div class="feature-content">
                  <h5 class="feature-title">操作日志</h5>
                  <p class="feature-desc">完整的操作审计日志，支持日志查询和导出</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrapper feature-icon-red">
                  <el-icon class="feature-icon"><Bell /></el-icon>
                </div>
                <div class="feature-content">
                  <h5 class="feature-title">消息通知</h5>
                  <p class="feature-desc">系统消息和邮件通知，及时提醒重要事件</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrapper feature-icon-cyan">
                  <el-icon class="feature-icon"><Setting /></el-icon>
                </div>
                <div class="feature-content">
                  <h5 class="feature-title">灵活配置</h5>
                  <p class="feature-desc">支持个性化设置，满足不同用户需求</p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </PageLayout>
</template>

<script setup>
import {
  Setting,
  InfoFilled,
  CircleCheck,
  DataAnalysis,
  Grid,
  Star,
  Monitor,
  PriceTag,
  Platform,
  Coin,
  UserFilled,
  Clock,
  Refresh,
  User,
  Key,
  Location,
  Tools,
  Lock,
  TrendCharts,
  DataBoard,
  Operation,
  Bell,
} from '@element-plus/icons-vue';
import { onMounted, reactive } from 'vue';

import { getSystemOverview } from '@/api/dashboard/dashboard';
import PageLayout from '@/components/base/PageLayout.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('System');

const loading = reactive({
  stats: false,
  info: false,
});

const stats = reactive({
  userCount: 0,
  roleCount: 0,
  areaCount: 0,
  deviceCount: 0,
});

const systemInfo = reactive({
  name: '仓库管理系统',
  version: 'v2.0.0',
  frontendFramework: 'Vue 3 + Vite + Element Plus',
  backendFramework: 'Spring Boot 3.5.5',
  database: 'MySQL 8.0',
  developTeam: '开发团队',
  onlineTime: '2025-01-01',
  lastUpdate: '2026-02-12',
});

const loadSystemStats = async () => {
  loading.stats = true;
  try {
    const response = await getSystemOverview();
    if (response.code === 200 && response.data) {
      Object.assign(stats, {
        userCount: response.data.userCount || 0,
        roleCount: response.data.roleCount || 0,
        areaCount: response.data.areaCount || 0,
        deviceCount: response.data.deviceCount || 0,
      });
    }
  } catch (error) {
    logger.error('加载系统统计信息失败:', error);
  } finally {
    loading.stats = false;
  }
};

const loadSystemInfo = async () => {
  loading.info = true;
  try {
    const response = await getSystemOverview();
    if (response.code === 200 && response.data) {
      Object.assign(systemInfo, {
        name: response.data.systemName || '仓库管理系统',
        version: response.data.systemVersion || 'v2.0.0',
        frontendFramework: response.data.frontendFramework || 'Vue 3 + Vite + Element Plus',
        backendFramework: response.data.backendFramework || 'Spring Boot 3.5.5',
        database: response.data.database || 'MySQL 8.0',
        developTeam: response.data.developTeam || '开发团队',
        onlineTime: response.data.onlineTime || '2025-01-01',
        lastUpdate: response.data.lastUpdate || '2026-02-12',
      });
    }
  } catch (error) {
    logger.error('加载系统信息失败:', error);
  } finally {
    loading.info = false;
  }
};

onMounted(() => {
  loadSystemStats();
  loadSystemInfo();
});
</script>

<style scoped>
.system-management-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100%;
}

.system-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 22px;
  color: #3b82f6;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

/* 系统信息卡片 */
.system-info-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.system-info-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.system-info-card :deep(.el-card__body) {
  padding: 24px;
}

.system-descriptions :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.system-descriptions :deep(.el-descriptions__content) {
  color: #1a202c;
}

.description-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-content .el-icon {
  color: #3b82f6;
  font-size: 16px;
}

/* 系统统计卡片 */
.system-stats-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.system-stats-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.system-stats-card :deep(.el-card__body) {
  padding: 24px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.stat-icon-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.stat-icon-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.stat-icon-orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.stat-icon {
  font-size: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* 技术栈卡片 */
.tech-stack-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tech-stack-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.tech-stack-card :deep(.el-card__body) {
  padding: 24px;
}

.tech-stack-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tech-section {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.tech-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 16px 0;
}

.tech-section-title .el-icon {
  color: #3b82f6;
  font-size: 20px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-tags .el-tag {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tech-tags .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 系统特性卡片 */
.system-features-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.system-features-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.system-features-card :deep(.el-card__body) {
  padding: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.feature-icon-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.feature-icon-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.feature-icon-orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.feature-icon-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.feature-icon-cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.feature-icon {
  font-size: 24px;
  color: white;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.feature-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .system-management-container {
    padding: 16px;
  }

  .system-row {
    margin-bottom: 16px;
  }

  .stats-container {
    gap: 16px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-number {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-tags {
    gap: 8px;
  }

  .tech-tags .el-tag {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
