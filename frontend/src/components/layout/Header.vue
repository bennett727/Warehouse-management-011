<!--
  @file: Header.vue
  @description: 顶部导航栏组件，包含侧边栏切换按钮、用户信息显示和下拉菜单
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <header class="layout-header" data-cy="header">
    <div class="header-left">
      <el-button link class="toggle-btn" @click="toggleSidebar" data-cy="sidebar-toggle-button">
        <el-icon :size="22">
          <Menu />
        </el-icon>
      </el-button>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" data-cy="user-menu">
        <span class="user-info" data-cy="user-info">
          <el-avatar :size="isMobile ? 32 : 36" :src="userAvatar || defaultAvatar" class="user-avatar" />
          <span class="user-name" v-show="!isMobile">{{ displayUserName }}</span>
          <el-icon class="dropdown-icon" v-show="!isMobile">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="navigateToUserCenter" data-cy="user-center-menu-item">
              <el-icon>
                <User />
              </el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="showShortcutHelp" data-cy="shortcut-help-menu-item">
              <el-icon>
                <QuestionFilled />
              </el-icon>
              快捷键帮助
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout" data-cy="logout-menu-item">
              <el-icon class="logout-icon">
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <ShortcutHelpDialog v-model="shortcutHelpVisible" />
  </header>
</template>

<script setup>
import { ArrowDown, Menu, QuestionFilled, SwitchButton, User } from '@element-plus/icons-vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import ShortcutHelpDialog from '@/components/base/ShortcutHelpDialog.vue';
import { useUserStore } from '@/stores/user';
import { getWindowWidth } from '@/utils/helpers';

const router = useRouter();
const userStore = useUserStore();
const isMobile = ref(false);
const shortcutHelpVisible = ref(false);

const checkMobile = () => {
  isMobile.value = getWindowWidth() <= 767;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const defaultAvatar = new URL('@/assets/images/avatar/default.svg', import.meta.url).href;

const userName = computed(() => userStore?.username ?? '');
const userAvatar = computed(() => userStore?.avatar ?? '');

const displayUserName = computed(() => {
  if (isMobile.value) {
    return userName.value ? userName.value.substring(0, 1) : '用';
  }
  return userName.value || '用户';
});

const emit = defineEmits(['toggleSidebar']);
const toggleSidebar = () => {
  emit('toggleSidebar');
};

const navigateToUserCenter = () => {
  router.push('/user-center');
};

const showShortcutHelp = () => {
  shortcutHelpVisible.value = true;
};

const handleLogout = async () => {
  await userStore.logoutUser();
  router.push('/login');
};
</script>

<style scoped>
.layout-header {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-btn {
  color: #fff;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-name {
  margin-left: 10px;
  margin-right: 6px;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

.logout-icon {
  color: #f56c6c;
}
</style>
