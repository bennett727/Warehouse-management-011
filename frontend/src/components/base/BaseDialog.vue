<!--
  @file: BaseDialog.vue
  @description: 基础对话框组件 - 美化版，提供统一的对话框样式和功能，支持表单验证、响应式设计和自定义插槽
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div
        v-if="visible"
        class="dialog-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="subtitleId"
        data-cy="dialog-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          class="dialog-container"
          :class="[`dialog--${size}`, { 'dialog--fullscreen': fullscreen }]"
          :style="dialogStyles"
          data-cy="dialog-container"
        >
          <!-- 对话框头部 -->
          <div class="dialog-header" :class="{ 'dialog-header--divided': showDividers }">
            <div class="dialog-header__content">
              <div v-if="icon" class="dialog-header__icon" aria-hidden="true">
                <el-icon :size="24">
                  <component :is="icon" />
                </el-icon>
              </div>
              <div class="dialog-header__text">
                <h3 :id="titleId" class="dialog-header__title">{{ title }}</h3>
                <p v-if="subtitle" :id="subtitleId" class="dialog-header__subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button
              v-if="showClose"
              class="dialog-header__close"
              type="button"
              aria-label="关闭对话框"
              data-cy="dialog-close-btn"
              @click="handleClose"
            >
              <el-icon :size="18" aria-hidden="true"><Close /></el-icon>
            </button>
          </div>

          <!-- 对话框内容 -->
          <div class="dialog-body" :class="{ 'dialog-body--padding': bodyPadding }">
            <el-form
              v-if="showForm"
              ref="formRef"
              :model="formModel"
              :rules="formRules"
              :label-width="labelWidth"
              :label-position="labelPosition"
              class="dialog-form"
              data-cy="dialog-form"
            >
              <slot name="form" />
            </el-form>
            <slot v-else />
          </div>

          <!-- 对话框底部 -->
          <div v-if="showFooter" class="dialog-footer" :class="{ 'dialog-footer--divided': showDividers }">
            <slot name="footer">
              <div class="dialog-footer__actions">
                <el-button
                  v-if="showCancel"
                  @click="handleCancel"
                  :size="buttonSize"
                  class="dialog-btn dialog-btn--cancel"
                  :aria-label="cancelText"
                  data-cy="dialog-cancel-button"
                >
                  <el-icon v-if="cancelIcon" aria-hidden="true"><component :is="cancelIcon" /></el-icon>
                  {{ cancelText }}
                </el-button>
                <el-button
                  v-if="showConfirm"
                  type="primary"
                  @click="handleConfirm"
                  :loading="confirmLoading"
                  :disabled="confirmDisabled"
                  :size="buttonSize"
                  class="dialog-btn dialog-btn--confirm"
                  :aria-label="confirmText"
                  data-cy="dialog-confirm-button"
                >
                  <el-icon v-if="confirmIcon && !confirmLoading" aria-hidden="true"
                    ><component :is="confirmIcon"
                  /></el-icon>
                  {{ confirmText }}
                </el-button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '提示',
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: [String, Object],
    default: null,
  },
  width: {
    type: [String, Number],
    default: '600px',
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large', 'fullscreen'].includes(value),
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  top: {
    type: String,
    default: '10vh',
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  showConfirm: {
    type: Boolean,
    default: true,
  },
  confirmText: {
    type: String,
    default: '确定',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmIcon: {
    type: [String, Object],
    default: null,
  },
  cancelIcon: {
    type: [String, Object],
    default: null,
  },
  confirmLoading: {
    type: Boolean,
    default: false,
  },
  confirmDisabled: {
    type: Boolean,
    default: false,
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  showForm: {
    type: Boolean,
    default: false,
  },
  formModel: {
    type: Object,
    default: () => ({}),
  },
  formRules: {
    type: Object,
    default: () => ({}),
  },
  labelWidth: {
    type: [String, Number],
    default: '100px',
  },
  labelPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right', 'top'].includes(value),
  },
  bodyPadding: {
    type: Boolean,
    default: true,
  },
  showDividers: {
    type: Boolean,
    default: true,
  },
  beforeClose: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close', 'open', 'opened', 'closed']);

const formRef = ref(null);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const titleId = computed(() => `dialog-title-${Math.random().toString(36).slice(2, 9)}`);
const subtitleId = computed(() => `dialog-subtitle-${Math.random().toString(36).slice(2, 9)}`);

const buttonSize = computed(() => {
  const sizeMap = { small: 'small', default: 'default', large: 'large' };
  return sizeMap[props.size] || 'default';
});

const dialogStyles = computed(() => {
  if (props.fullscreen) {
    return {};
  }
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    marginTop: props.top,
  };
});

watch(visible, (newVal) => {
  if (newVal) {
    emit('open');
    setTimeout(() => emit('opened'), 300);
  }
});

const handleClose = async () => {
  if (props.beforeClose) {
    try {
      await props.beforeClose();
    } catch {
      return;
    }
  }
  visible.value = false;
  emit('close');
  setTimeout(() => emit('closed'), 300);
};

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose();
  }
};

const handleCancel = () => {
  emit('cancel');
  handleClose();
};

const handleConfirm = async () => {
  if (props.showForm && formRef.value) {
    try {
      await formRef.value.validate();
      emit('confirm');
    } catch {
      // 表单验证失败
    }
  } else {
    emit('confirm');
  }
};

const validateForm = async () => {
  if (formRef.value) {
    return formRef.value.validate();
  }
  return true;
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

defineExpose({
  validateForm,
  resetForm,
  formRef,
});
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-index-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--spacing-6);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow-y: auto;
}

.dialog-container {
  position: relative;
  background: var(--bg-color-light);
  border-radius: var(--dialog-border-radius);
  box-shadow: var(--dialog-shadow);
  max-height: calc(100vh - var(--spacing-12));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dialog-enter 0.3s var(--ease-out);
}

.dialog--small {
  max-width: 400px;
}

.dialog--default {
  max-width: 600px;
}

.dialog--large {
  max-width: 900px;
}

.dialog--fullscreen {
  width: calc(100vw - var(--spacing-12));
  height: calc(100vh - var(--spacing-12));
  max-width: none;
  max-height: none;
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-5) var(--spacing-6);
  background: linear-gradient(135deg, var(--slate-50) 0%, var(--bg-color-light) 100%);
}

.dialog-header--divided {
  border-bottom: 1px solid var(--border-color);
}

.dialog-header__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.dialog-header__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-lg);
  background: var(--primary-50);
  border: 2px solid var(--primary-100);
  color: var(--primary-600);
  flex-shrink: 0;
}

.dialog-header__text {
  flex: 1;
  min-width: 0;
}

.dialog-header__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.dialog-header__subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: var(--spacing-1) 0 0;
  line-height: 1.4;
}

.dialog-header__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-md);
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-left: var(--spacing-3);
  flex-shrink: 0;
}

.dialog-header__close:hover {
  background: var(--slate-100);
  color: var(--text-primary);
}

.dialog-header__close:active {
  background: var(--slate-200);
}

/* 对话框内容 */
.dialog-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.dialog-body--padding {
  padding: var(--spacing-6);
}

.dialog-form {
  :deep(.el-form-item) {
    margin-bottom: var(--spacing-5);
  }

  :deep(.el-form-item__label) {
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
  }
}

/* 对话框底部 */
.dialog-footer {
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--slate-50);
}

.dialog-footer--divided {
  border-top: 1px solid var(--border-color);
}

.dialog-footer__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

.dialog-btn {
  min-width: 88px;
  transition: var(--transition-base);
}

.dialog-btn:hover {
  transform: translateY(-1px);
}

.dialog-btn--cancel {
  &:hover {
    background: var(--slate-100);
  }
}

.dialog-btn--confirm {
  background: var(--primary-600);
  border: none;

  &:hover {
    background: var(--primary-700);
    box-shadow: var(--box-shadow-glow);
  }

  &:active {
    background: var(--primary-800);
  }
}

/* 动画 */
@keyframes dialog-enter {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s var(--ease-in-out);
}

.dialog-fade-enter-active .dialog-container,
.dialog-fade-leave-active .dialog-container {
  transition:
    transform 0.3s var(--ease-out),
    opacity 0.3s var(--ease-out);
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-container,
.dialog-fade-leave-to .dialog-container {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* 响应式 */
@media (max-width: 768px) {
  .dialog-overlay {
    padding: var(--spacing-4);
    align-items: flex-end;
  }

  .dialog-container {
    width: 100% !important;
    max-width: none !important;
    margin-top: 0 !important;
    max-height: calc(100vh - var(--spacing-8));
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  }

  .dialog--fullscreen {
    width: 100vw !important;
    height: calc(100vh - var(--spacing-8));
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  }

  .dialog-header {
    padding: var(--spacing-4);
  }

  .dialog-header__title {
    font-size: var(--font-size-lg);
  }

  .dialog-body--padding {
    padding: var(--spacing-4);
  }

  .dialog-footer {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .dialog-footer__actions {
    flex-direction: column-reverse;
    gap: var(--spacing-2);
  }

  .dialog-btn {
    width: 100%;
    min-width: auto;
  }
}

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  .dialog-container {
    animation: none;
  }

  .dialog-fade-enter-active,
  .dialog-fade-leave-active,
  .dialog-fade-enter-active .dialog-container,
  .dialog-fade-leave-active .dialog-container {
    transition: none;
  }
}
</style>
