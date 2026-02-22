<!--
  @file: BaseEmptyState.vue
  @description: 空状态组件，提供统一的空数据展示样式
  @status: 待使用 - 功能完整但未被引用
  @保留原因: 适用于需要统一空状态展示的场景，提升用户体验
  @适用场景: 搜索无结果、数据加载失败、暂无数据等场景
  @author: 系统架构师
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div
    class="empty-state"
    :class="{ 'is-loading': loading }"
    role="status"
    :aria-live="loading ? 'polite' : 'off'"
    :aria-label="loading ? loadingText : description || '空状态'"
  >
    <el-empty v-if="!loading" :image="image" :image-size="imageSize" :description="description">
      <template #image>
        <slot name="image">
          <el-icon v-if="!image" :size="iconSize" :color="iconColor" aria-hidden="true">
            <component :is="icon" />
          </el-icon>
        </slot>
      </template>

      <template #description>
        <slot name="description">
          <div class="empty-description">{{ description }}</div>
        </slot>
      </template>

      <template #default>
        <slot name="action">
          <el-button
            v-if="showAction"
            :type="actionType"
            :icon="actionIcon"
            :aria-label="actionText"
            @click="handleAction"
          >
            {{ actionText }}
          </el-button>
        </slot>
      </template>
    </el-empty>

    <div v-if="loading" class="empty-loading" role="status" aria-live="polite">
      <el-icon class="is-loading" :size="40" aria-hidden="true">
        <Loading />
      </el-icon>
      <div class="loading-text">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script setup>
import { FolderOpened, Loading, Refresh } from '@element-plus/icons-vue';

defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'data', 'search', 'loading', 'custom'].includes(value),
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  imageSize: {
    type: Number,
    default: 120,
  },
  icon: {
    type: [String, Object],
    default: FolderOpened,
  },
  iconSize: {
    type: Number,
    default: 80,
  },
  iconColor: {
    type: String,
    default: '#dcdfe6',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  actionText: {
    type: String,
    default: '刷新',
  },
  actionType: {
    type: String,
    default: 'primary',
  },
  actionIcon: {
    type: Object,
    default: () => Refresh,
  },
});

const emit = defineEmits(['action']);

const handleAction = () => {
  emit('action');
};
</script>

<style scoped>
.empty-state {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-state.is-loading {
  min-height: 300px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  margin-top: 16px;
}

.empty-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #909399;
}
</style>
