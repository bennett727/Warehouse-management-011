<!--
  @file: InventoryDetailDialog.vue
  @description: 库存详情对话框组件 - 美化版，展示库存详细信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
  @modifyRecords:
      2026-02-06: 集成OptimizedImage组件，优化库存图片加载性能
-->
<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="title"
    :icon="Document"
    size="large"
    :show-footer="showFooter"
    :show-confirm="false"
    :cancel-text="'关闭'"
    data-cy="inventory-detail-dialog"
    @cancel="handleCancel"
  >
    <div class="detail-container" data-cy="inventory-detail-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="detail-loading" data-cy="inventory-detail-loading">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 详情内容 -->
      <template v-else-if="inventoryData">
        <!-- 基本信息卡片 -->
        <div class="detail-section" data-cy="inventory-basic-info-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon :size="20"><Box /></el-icon>
            </div>
            <h4 class="section-title" data-cy="inventory-basic-info-title">基本信息</h4>
            <el-tag :type="statusType" size="small" effect="dark" class="status-tag" data-cy="inventory-status-tag">
              {{ statusText }}
            </el-tag>
          </div>
          <div class="detail-grid">
            <div
              v-for="item in basicInfoItems"
              :key="item.key"
              class="detail-item"
              :class="{ 'detail-item--highlight': item.highlight }"
              :data-cy="`inventory-detail-item-${item.key}`"
            >
              <div class="detail-item__label">
                <el-icon v-if="item.icon" :size="14">
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.label }}</span>
              </div>
              <div class="detail-item__value" :class="`value--${item.type || 'text'}`">
                <template v-if="item.type === 'image'">
                  <div class="inventory-image-container">
                    <OptimizedImage
                      :src="item.value"
                      :alt="item.label"
                      width="80"
                      height="80"
                      :lazy="true"
                      :quality="80"
                      fit="cover"
                      :enable-webp="true"
                      @load="handleImageLoad"
                      @error="handleImageError"
                      @click="handleImageClick(item.value)"
                    />
                  </div>
                </template>
                <template v-else-if="item.type === 'tag'">
                  <el-tag :type="item.tagType" size="small" effect="light">
                    {{ item.value }}
                  </el-tag>
                </template>
                <template v-else-if="item.type === 'link'">
                  <el-link type="primary" :underline="false" @click="item.onClick">
                    {{ item.value }}
                  </el-link>
                </template>
                <template v-else-if="item.type === 'money'">
                  <span class="money-value">¥ {{ formatMoney(item.value) }}</span>
                </template>
                <template v-else-if="item.type === 'number'">
                  <span class="number-value">{{ formatNumber(item.value) }}</span>
                </template>
                <template v-else-if="item.type === 'date'">
                  <span class="date-value">{{ formatDate(item.value) }}</span>
                </template>
                <template v-else-if="item.type === 'progress'">
                  <div class="progress-wrapper">
                    <el-progress :percentage="item.value" :color="item.progressColor" :stroke-width="8" />
                    <span class="progress-text">{{ item.value }}%</span>
                  </div>
                </template>
                <template v-else>
                  <span :class="{ 'empty-value': !item.value }">
                    {{ item.value || '-' }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 库存统计卡片 -->
        <div class="detail-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon :size="20"><TrendCharts /></el-icon>
            </div>
            <h4 class="section-title">库存统计</h4>
          </div>
          <div class="stats-grid">
            <div v-for="stat in statisticsItems" :key="stat.key" class="stat-card" :class="`stat-card--${stat.type}`">
              <div class="stat-card__icon">
                <el-icon :size="24">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-card__content">
                <div class="stat-card__value">{{ stat.value }}</div>
                <div class="stat-card__label">{{ stat.label }}</div>
              </div>
              <div v-if="stat.trend" class="stat-card__trend" :class="`trend--${stat.trend}`">
                <el-icon :size="12">
                  <component :is="stat.trend === 'up' ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
                <span>{{ stat.trendValue }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 扩展信息 -->
        <div v-if="extendedItems.length > 0" class="detail-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon :size="20"><MoreFilled /></el-icon>
            </div>
            <h4 class="section-title">扩展信息</h4>
          </div>
          <div class="detail-grid detail-grid--compact">
            <div v-for="item in extendedItems" :key="item.key" class="detail-item detail-item--compact">
              <div class="detail-item__label">{{ item.label }}</div>
              <div class="detail-item__value">
                <template v-if="item.type === 'tag'">
                  <el-tag :type="item.tagType" size="small">
                    {{ item.value }}
                  </el-tag>
                </template>
                <template v-else-if="item.type === 'boolean'">
                  <el-icon :size="16" :color="item.value ? '#10b981' : '#ef4444'">
                    <component :is="item.value ? 'CircleCheck' : 'CircleClose'" />
                  </el-icon>
                </template>
                <template v-else>
                  <span :class="{ 'empty-value': !item.value }">
                    {{ item.value || '-' }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作记录时间线 -->
        <div v-if="showTimeline && operationLogs.length > 0" class="detail-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon :size="20"><Clock /></el-icon>
            </div>
            <h4 class="section-title">操作记录</h4>
          </div>
          <div class="timeline-wrapper">
            <el-timeline>
              <el-timeline-item
                v-for="(log, index) in operationLogs"
                :key="index"
                :type="log.type || 'primary'"
                :icon="log.icon"
                :timestamp="formatDateTime(log.timestamp)"
                :hide-timestamp="false"
              >
                <div class="timeline-content">
                  <div class="timeline-title">{{ log.title }}</div>
                  <div class="timeline-desc">{{ log.description }}</div>
                  <div v-if="log.operator" class="timeline-operator">
                    <el-icon :size="12"><User /></el-icon>
                    <span>{{ log.operator }}</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <!-- 自定义内容插槽 -->
        <slot name="custom-content" :data="inventoryData" />
      </template>

      <!-- 空状态 -->
      <div v-else class="detail-empty">
        <el-empty description="暂无数据">
          <template #image>
            <el-icon :size="64" color="#d1d5db"><DocumentDelete /></el-icon>
          </template>
        </el-empty>
      </div>
    </div>

    <!-- 自定义底部 -->
    <template #footer>
      <slot name="footer" :data="inventoryData">
        <div class="detail-footer">
          <el-button @click="handleCancel" size="default">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
          <slot name="footer-actions" :data="inventoryData" />
        </div>
      </slot>
    </template>
  </BaseDialog>
</template>

<script setup>
import { Box, Clock, Close, Document, DocumentDelete, MoreFilled, TrendCharts, User } from '@element-plus/icons-vue';
import { computed } from 'vue';

import BaseDialog from '@/components/base/BaseDialog.vue';
import OptimizedImage from '@/components/base/OptimizedImage.vue';
import { formatDate, formatDateTime, formatMoney, formatNumber } from '@/utils/formatter.js';
import logger from '@/utils/logger';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '库存详情',
  },
  inventoryData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  basicInfoItems: {
    type: Array,
    default: () => [],
  },
  statisticsItems: {
    type: Array,
    default: () => [],
  },
  extendedItems: {
    type: Array,
    default: () => [],
  },
  operationLogs: {
    type: Array,
    default: () => [],
  },
  showTimeline: {
    type: Boolean,
    default: false,
  },
  statusType: {
    type: String,
    default: 'info',
  },
  statusText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'cancel']);

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 处理取消
const handleCancel = () => {
  emit('cancel');
};

// 处理图片加载成功
const handleImageLoad = () => {
  logger.debug('[InventoryDetailDialog] 库存图片加载成功');
};

// 处理图片加载失败
const handleImageError = (error) => {
  logger.warn('[InventoryDetailDialog] 库存图片加载失败:', error);
};

// 处理图片点击
const handleImageClick = (imageUrl) => {
  if (imageUrl) {
    window.open(imageUrl, '_blank');
  }
};

// 暴露方法
defineExpose({
  open: () => {
    dialogVisible.value = true;
  },
  close: () => {
    dialogVisible.value = false;
  },
});
</script>

<style scoped>
/* 详情容器 */
.detail-container {
  padding: var(--spacing-4);
}

/* 加载状态 */
.detail-loading {
  padding: var(--spacing-8);
}

/* 详情区块 */
.detail-section {
  margin-bottom: var(--spacing-6);
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-5);
  box-shadow: var(--box-shadow-sm);
  border: 1px solid var(--border-color);
}

.detail-section:last-child {
  margin-bottom: 0;
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--border-color);
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-md);
  background: var(--primary-50);
  border: 2px solid var(--primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-600);
}

.section-title {
  flex: 1;
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.status-tag {
  font-weight: var(--font-weight-medium);
}

/* 详情网格 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-4);
}

.detail-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-3);
}

/* 详情项 */
.detail-item {
  padding: var(--spacing-3);
  background: var(--slate-50);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: var(--slate-100);
  transform: translateY(-1px);
}

.detail-item--highlight {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.detail-item--compact {
  padding: var(--spacing-2);
}

.detail-item__label {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item__value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  word-break: break-word;
}

.detail-item__value .empty-value {
  color: var(--text-tertiary);
  font-style: italic;
}

/* 特殊值样式 */
.value--money .money-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--success-color);
}

.value--number .number-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
}

.value--date .date-value {
  color: var(--text-secondary);
  font-family: monospace;
}

/* 图片样式 */
.inventory-image-container {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.inventory-image-container:hover {
  transform: scale(1.05);
}

.detail-image {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.detail-image:hover {
  transform: scale(1.05);
}

.image-error {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-100);
  border-radius: var(--border-radius-md);
  color: var(--text-tertiary);
}

/* 进度条 */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.progress-wrapper :deep(.el-progress) {
  flex: 1;
}

.progress-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--primary-600);
  min-width: 40px;
  text-align: right;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-4);
}

/* 统计卡片 */
.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--slate-50);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-card--primary .stat-card__icon {
  background: var(--primary-100);
  color: var(--primary-600);
}

.stat-card--success .stat-card__icon {
  background: var(--success-100);
  color: var(--success-600);
}

.stat-card--warning .stat-card__icon {
  background: var(--warning-100);
  color: var(--warning-600);
}

.stat-card--danger .stat-card__icon {
  background: var(--error-100);
  color: var(--error-600);
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-card__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-1);
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
}

.trend--up {
  color: var(--success-color);
  background: rgba(16, 185, 129, 0.1);
}

.trend--down {
  color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
}

/* 时间线 */
.timeline-wrapper {
  padding: var(--spacing-3) 0;
}

.timeline-content {
  background: var(--slate-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-2);
}

.timeline-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
}

.timeline-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2);
}

.timeline-operator {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* 空状态 */
.detail-empty {
  padding: var(--spacing-12);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 底部 */
.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-top: 1px solid var(--border-color);
}

/* 响应式 */
@media (max-width: 768px) {
  .detail-container {
    padding: var(--spacing-3);
  }

  .detail-section {
    padding: var(--spacing-4);
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid--compact {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-3);
  }

  .stat-card__icon {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .detail-grid--compact {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  .detail-item,
  .stat-card,
  .detail-image {
    transition: none;
  }
}
</style>
