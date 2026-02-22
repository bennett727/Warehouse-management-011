<!--
  @file: GlobalLoading.vue
  @description: 全局加载组件，用于显示全局加载状态
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <transition name="fade">
    <div v-if="visible" class="global-loading" :class="{ fullscreen: fullscreen }">
      <div class="loading-container">
        <div class="loading-spinner">
          <svg class="circular" viewBox="25 25 50 50">
            <circle class="path" cx="50" cy="50" r="20" fill="none" :stroke="color" stroke-width="4" />
          </svg>
        </div>
        <div v-if="text" class="loading-text">{{ text }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#409EFF',
  },
});
</script>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.global-loading.fullscreen {
  z-index: 10000;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
}

.circular {
  display: block;
  width: 100%;
  height: 100%;
  animation: rotate 2s linear infinite;
}

.path {
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  letter-spacing: 0.5px;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .loading-spinner {
    width: 40px;
    height: 40px;
  }

  .loading-text {
    font-size: 14px;
  }
}
</style>
