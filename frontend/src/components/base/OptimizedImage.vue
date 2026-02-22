<!--
  @file: OptimizedImage.vue
  @description: 优化图片组件，提供图片懒加载、WebP支持、错误处理等功能
  @status: 待使用 - 功能完整但未被引用
  @保留原因: 适用于需要优化图片加载性能的场景，提升用户体验
  @适用场景: 设备图片展示、库存图片预览、用户头像等场景
  @author: 系统架构师
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div class="optimized-image" :style="{ width: width, height: height }">
    <img
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      :width="width"
      :height="height"
      :class="{ 'image-loaded': isLoaded, 'image-error': hasError }"
      @load="handleLoad"
      @error="handleError"
      :style="imageStyle"
    />
    <div v-if="isLoading" class="image-placeholder">
      <slot name="placeholder">
        <div class="default-placeholder">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
      </slot>
    </div>
    <div v-if="hasError" class="image-error">
      <slot name="error">
        <div class="default-error">
          <el-icon><Picture /></el-icon>
          <span>图片加载失败</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { Loading, Picture } from '@element-plus/icons-vue';
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: 'auto',
  },
  height: {
    type: [String, Number],
    default: 'auto',
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  quality: {
    type: Number,
    default: 80,
    validator: (value) => value >= 1 && value <= 100,
  },
  fit: {
    type: String,
    default: 'cover',
    validator: (value) => ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(value),
  },
  enableWebP: {
    type: Boolean,
    default: true,
  },
  fallbackSrc: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['load', 'error', 'click']);

const imageRef = ref(null);
const isLoaded = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const supportsWebP = ref(false);

const imageStyle = computed(() => ({
  objectFit: props.fit,
  opacity: isLoaded.value ? 1 : 0,
  transition: 'opacity 0.3s ease',
}));

const currentSrc = computed(() => {
  if (!props.src) {
    return '';
  }

  let { src } = props;

  if (props.enableWebP && supportsWebP.value) {
    src = convertToWebP(src);
  }

  return src;
});

const checkWebPSupport = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  return false;
};

const convertToWebP = (url) => {
  if (!url) {
    return '';
  }

  const ext = url.split('.').pop().toLowerCase();
  const supportedFormats = ['jpg', 'jpeg', 'png'];

  if (!supportedFormats.includes(ext)) {
    return url;
  }

  const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return webpUrl;
};

const handleLoad = (event) => {
  isLoaded.value = true;
  isLoading.value = false;
  hasError.value = false;
  emit('load', event);
};

const handleError = (event) => {
  isLoading.value = false;

  if (props.fallbackSrc && !hasError.value) {
    hasError.value = true;
    if (imageRef.value) {
      imageRef.value.src = props.fallbackSrc;
    }
  } else {
    hasError.value = true;
    emit('error', event);
  }
};

const handleClick = () => {
  emit('click');
};

onMounted(() => {
  supportsWebP.value = checkWebPSupport();

  if (imageRef.value) {
    imageRef.value.addEventListener('click', handleClick);
  }
});

watch(
  () => props.src,
  () => {
    isLoaded.value = false;
    isLoading.value = true;
    hasError.value = false;
  }
);
</script>

<style scoped>
.optimized-image {
  position: relative;
  overflow: hidden;
  display: inline-block;
  background-color: #f5f7fa;
}

.optimized-image img {
  width: 100%;
  height: 100%;
  display: block;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  z-index: 1;
}

.default-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  z-index: 2;
}

.default-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
}

.default-error span {
  font-size: 12px;
}
</style>
