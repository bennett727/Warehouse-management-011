<template>
  <div class="error-403" data-cy="error-403-page">
    <div class="error-container">
      <!-- 错误信息 -->
      <div class="error-info" data-cy="error-info">
        <h1 class="error-code" data-cy="error-code">403</h1>
        <h2 class="error-title" data-cy="error-title">访问被拒绝</h2>
        <p class="error-description" data-cy="error-description">
          抱歉，您没有权限访问此页面。<br />
          如需访问，请联系管理员获取相应权限。
        </p>
        <!-- 返回首页按钮 -->
        <div class="action-buttons" data-cy="action-buttons">
          <el-button type="primary" size="large" @click="goToHome" data-cy="go-home-button">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button type="default" size="large" @click="goBack" data-cy="go-back-button">
            <el-icon><Back /></el-icon>
            返回上一页
          </el-button>
        </div>
      </div>

      <!-- 权限说明 -->
      <div class="permission-info" data-cy="permission-info">
        <h3 data-cy="permission-title">当前用户权限</h3>
        <div class="current-role" data-cy="current-role">
          <el-tag type="info" size="large" data-cy="user-role-tag">{{ userRole || '未登录' }}</el-tag>
        </div>
        <div class="permission-list" data-cy="permission-list">
          <h4 data-cy="available-features-title">可用功能：</h4>
          <ul data-cy="features-list">
            <li v-for="(item, index) in availableFeatures" :key="index" :data-cy="`feature-item-${index}`">
              <el-icon><Check /></el-icon>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { House, Back, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { ROLES, normalizeRoles } from '@/router/route-permissions.js';
import { useUserStore } from '@/stores/user.js';

const router = useRouter();
const userStore = useUserStore();

const userRole = computed(() => userStore.currentUser?.roleName);

const availableFeatures = computed(() => {
  const role = userRole.value;
  if (!role) {
    return ['请先登录'];
  }

  const features = [];
  const normalizedRole = role.toLowerCase();

  switch (normalizedRole) {
    case ROLES.ADMIN:
      features.push(
        '仪表盘查看',
        '设备管理（增删改查）',
        '库存管理（出入库、调拨、盘点）',
        '维修管理',
        '安装管理',
        '系统管理（用户、角色、权限）',
        '报表查看',
        '记录查询'
      );
      break;
    case ROLES.OPERATOR:
      features.push(
        '仪表盘查看',
        '设备管理（增改、导入导出）',
        '库存管理（出入库、调拨、盘点）',
        '维修管理',
        '安装管理',
        '报表查看',
        '记录查询'
      );
      break;
    case ROLES.TECHNICIAN:
      features.push('仪表盘查看', '设备查看', '维修管理', '安装管理', '记录查询');
      break;
    case ROLES.VIEWER:
      features.push('仪表盘查看', '设备查看', '报表查看', '记录查询');
      break;
    default:
      features.push('请联系管理员分配权限');
  }

  return features;
});

// 返回首页
const goToHome = () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  if (!userStore.userInfo || !userStore.userInfo.roles || userStore.userInfo.roles.length === 0) {
    ElMessage.warning('用户信息不完整，请重新登录');
    router.push('/login');
    return;
  }

  const userRoles = normalizeRoles(userStore.userInfo.roles);
  const userRole = userRoles[0];
  const normalizedRole = userRole ? userRole.toLowerCase() : '';

  if (normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.OPERATOR || normalizedRole === ROLES.VIEWER) {
    router.push('/dashboard');
  } else if (normalizedRole === ROLES.TECHNICIAN) {
    router.push('/repair-management');
  } else {
    ElMessage.warning('无法确定您的访问权限，请联系管理员');
    router.push('/login');
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.error-403 {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 40px 20px;
}

.error-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.error-info {
  margin-bottom: 60px;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #f56c6c;
  margin: 0 0 20px 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(245, 108, 108, 0.2);
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.error-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 40px 0;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
}

.action-buttons .el-icon {
  font-size: 18px;
}

.permission-info {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.permission-info h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 24px 0;
  font-weight: 600;
  text-align: center;
}

.current-role {
  text-align: center;
  margin-bottom: 24px;
}

.permission-list h4 {
  font-size: 16px;
  color: #606266;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.permission-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.permission-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.permission-list li:last-child {
  border-bottom: none;
}

.permission-list .el-icon {
  color: #67c23a;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
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

  .permission-info {
    padding: 24px;
  }
}
</style>
