<!--
  @file: ActionBar.vue
  @description: 操作栏组件，用于放置页面操作按钮和工具栏
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div
    class="action-bar"
    :class="{ vertical: vertical, compact: compact }"
    role="toolbar"
    :aria-label="ariaLabel || '操作工具栏'"
    data-cy="action-bar"
  >
    <div class="action-bar-left" role="group" aria-label="左侧操作" data-cy="action-bar-left">
      <slot name="left"></slot>
    </div>
    <div class="action-bar-right" role="group" aria-label="右侧操作" data-cy="action-bar-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  vertical: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-bar.vertical {
  flex-direction: column;
  align-items: stretch;
}

.action-bar.compact {
  padding: 12px 16px;
  gap: 8px;
}

.action-bar-left,
.action-bar-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.action-bar-right {
  justify-content: flex-end;
}

.action-bar :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 20px;
  transition: all 0.3s ease;
  min-width: 100px;
}

.action-bar :deep(.el-button--default) {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
}

.action-bar :deep(.el-button--default:hover) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.action-bar :deep(.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
}

.action-bar :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-bar :deep(.el-button--success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.action-bar :deep(.el-button--success:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-bar :deep(.el-button--warning) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
}

.action-bar :deep(.el-button--warning:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-bar :deep(.el-button--danger) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
}

.action-bar :deep(.el-button--danger:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-bar :deep(.el-button--info) {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border: none;
}

.action-bar :deep(.el-button--info:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
  }

  .action-bar-left,
  .action-bar-right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-bar :deep(.el-button) {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .action-bar {
    padding: 10px 12px;
  }

  .action-bar-left,
  .action-bar-right {
    flex-direction: column;
  }
}
</style>
