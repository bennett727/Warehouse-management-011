<!--
  @file: BaseDetailDialog.vue
  @description: 基础详情对话框组件，用于展示详情信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="responsiveWidth"
    :close-on-click-modal="closeOnClickModal"
    data-cy="base-detail-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" element-loading-text="正在加载详情...">
      <el-descriptions v-if="detailData" :column="column" :border="border" :size="size" :direction="direction">
        <template v-for="field in detailFields" :key="field.prop">
          <el-descriptions-item
            :label="field.label"
            :span="field.span || 1"
            :label-align="field.labelAlign || 'right'"
            :content-align="field.contentAlign || 'left'"
            :label-class-name="field.labelClassName"
            :content-class-name="field.contentClassName"
          >
            <slot v-if="field.slot" :name="field.slot" :row="detailData" :field="field">
              {{ detailData[field.prop] }}
            </slot>

            <template v-else-if="field.type === 'tag'">
              <el-tag :type="getTagType(detailData[field.prop], field.tagTypes)">
                {{ getTagText(detailData[field.prop], field.tagOptions) }}
              </el-tag>
            </template>

            <template v-else-if="field.type === 'status'">
              <el-tag :type="getStatusTagType(detailData[field.prop], field.statusTypes)">
                {{ getStatusText(detailData[field.prop], field.statusOptions) }}
              </el-tag>
            </template>

            <template v-else-if="field.type === 'date'">
              {{ formatDate(detailData[field.prop], field.format) }}
            </template>

            <template v-else-if="field.type === 'datetime'">
              {{ formatDateTime(detailData[field.prop], field.format) }}
            </template>

            <template v-else-if="field.type === 'number'">
              {{ formatNumber(detailData[field.prop], field.precision) }}
            </template>

            <template v-else-if="field.type === 'currency'">
              {{ formatCurrency(detailData[field.prop], field.precision) }}
            </template>

            <template v-else-if="field.type === 'image'">
              <el-image
                :src="detailData[field.prop]"
                :preview-src-list="[detailData[field.prop]]"
                fit="cover"
                style="width: 100px; height: 100px; border-radius: 4px"
              />
            </template>

            <template v-else-if="field.type === 'link'">
              <el-link :href="detailData[field.prop]" target="_blank" type="primary">
                {{ detailData[field.prop] }}
              </el-link>
            </template>

            <template v-else-if="field.type === 'array'">
              <el-tag
                v-for="(item, index) in detailData[field.prop]"
                :key="index"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ item }}
              </el-tag>
            </template>

            <template v-else-if="field.type === 'object'">
              <div v-if="detailData[field.prop]" class="object-display">
                <template v-for="(value, key) in detailData[field.prop]" :key="key">
                  <div v-if="field.displayFields ? field.displayFields.includes(key) : true">
                    <span class="object-key">{{ key }}:</span>
                    <span class="object-value">{{ value }}</span>
                  </div>
                </template>
              </div>
              <span v-else>-</span>
            </template>

            <template v-else>
              {{ detailData[field.prop] || '-' }}
            </template>
          </el-descriptions-item>
        </template>
      </el-descriptions>

      <el-empty v-else description="暂无详情数据" />
    </div>

    <template #footer v-if="showFooter">
      <div class="dialog-footer">
        <slot name="footer" :row="detailData">
          <el-button @click="handleClose">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
          <el-button v-if="showEdit" type="primary" @click="handleEdit" :disabled="loading">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="showDelete" type="danger" @click="handleDelete" :disabled="loading">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Close, Edit, Delete } from '@element-plus/icons-vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { getWindowWidth } from '@/utils/helpers';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '详情',
  },
  detailData: {
    type: Object,
    default: null,
  },
  detailFields: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '90%',
  },
  maxWidth: {
    type: String,
    default: '1000px',
  },
  column: {
    type: Number,
    default: 2,
  },
  border: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'default',
  },
  direction: {
    type: String,
    default: 'horizontal',
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showEdit: {
    type: Boolean,
    default: false,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'edit', 'delete', 'close']);

const isMobile = ref(false);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const dialogTitle = computed(() => {
  return props.title;
});

const responsiveWidth = computed(() => {
  const width = getWindowWidth();
  if (width <= 767) {
    return '95%';
  }
  if (width <= 1023) {
    return '70%';
  }
  if (width <= 1439) {
    return props.width;
  }
  return props.maxWidth;
});

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

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

const handleEdit = () => {
  emit('edit', props.detailData);
};

const handleDelete = () => {
  emit('delete', props.detailData);
};

const getTagType = (value, tagTypes) => {
  if (!tagTypes || !tagTypes[value]) {
    return '';
  }
  return tagTypes[value];
};

const getTagText = (value, tagOptions) => {
  if (!tagOptions) {
    return value;
  }
  const option = tagOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
};

const getStatusTagType = (status, statusTypes) => {
  const customTypes = statusTypes || {};
  if (customTypes[status]) {
    return customTypes[status];
  }
  const defaultMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'success',
    cancelled: 'info',
  };
  return defaultMap[status] || 'info';
};

const getStatusText = (status, statusOptions) => {
  const customOptions = statusOptions || [];
  if (customOptions.length > 0) {
    const option = customOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  }
  const defaultMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已取消',
  };
  return defaultMap[status] || status;
};

const formatDate = (value, _format) => {
  if (!value) {
    return '-';
  }
  return value;
};

const formatDateTime = (value, _format) => {
  if (!value) {
    return '-';
  }
  return value;
};

const formatNumber = (value, precision = 2) => {
  if (value === null || value === undefined) {
    return '-';
  }
  return Number(value).toFixed(precision);
};

const formatCurrency = (value, precision = 2) => {
  if (value === null || value === undefined) {
    return '-';
  }
  return `¥${Number(value).toFixed(precision)}`;
};
</script>

<style scoped>
.object-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.object-key {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.object-value {
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media screen and (max-width: 767px) {
  .dialog-footer {
    flex-direction: column;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>
