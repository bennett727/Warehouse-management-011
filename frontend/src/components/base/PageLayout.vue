<!--
  @file: PageLayout.vue
  @description: 页面布局组件，提供统一的页面布局结构
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div
    class="page-layout"
    :class="{ 'full-height': fullHeight }"
    v-bind="$attrs"
    data-cy="page-layout"
    role="main"
    :aria-label="title || '页面内容'"
  >
    <div v-if="showHeader" class="page-header" data-cy="page-header" role="banner">
      <div class="header-left">
        <h2 class="page-title" data-cy="page-title" tabindex="0">{{ title }}</h2>
        <p v-if="description" class="page-description" data-cy="page-description">{{ description }}</p>
      </div>
      <div
        v-if="$slots.headerActions"
        class="header-actions"
        data-cy="header-actions"
        role="toolbar"
        aria-label="页面操作"
      >
        <slot name="headerActions"></slot>
      </div>
    </div>

    <div v-if="$slots.actionBar" class="page-action-bar" data-cy="page-action-bar" role="toolbar" aria-label="操作栏">
      <slot name="actionBar"></slot>
    </div>

    <div
      class="page-content"
      :class="{ 'no-padding': noPadding }"
      data-cy="page-content"
      role="region"
      aria-label="主要内容"
    >
      <slot></slot>
    </div>

    <div v-if="showFooter && $slots.footer" class="page-footer" data-cy="page-footer" role="contentinfo">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  inheritAttrs: false,
});

defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: false,
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, var(--slate-50) 0%, var(--slate-100) 100%);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
}

.page-layout.full-height {
  height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--slate-50) 100%);
  border-bottom: 1px solid var(--border-color);
  gap: var(--spacing-4);
}

.header-left {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2) 0;
  letter-spacing: 0.5px;
}

.page-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-shrink: 0;
}

.page-action-bar {
  padding: var(--spacing-4) var(--spacing-6);
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--slate-50) 100%);
  border-bottom: 1px solid var(--border-color);
}

.page-content {
  flex: 1;
  padding: var(--spacing-6);
  overflow-y: auto;
  overflow-x: auto;
}

.page-content.no-padding {
  padding: 0;
}

.page-footer {
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .page-layout {
    border-radius: var(--border-radius-lg);
  }

  .page-header {
    padding: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-description {
    font-size: 13px;
  }

  .page-content {
    padding: 16px;
  }

  .page-footer {
    padding: 12px 16px;
    flex-direction: column;
  }

  .page-footer :deep(.el-button) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 12px;
  }

  .page-title {
    font-size: 18px;
  }

  .page-content {
    padding: 12px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
