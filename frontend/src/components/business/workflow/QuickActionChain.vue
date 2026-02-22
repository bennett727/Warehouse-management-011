<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    class="quick-action-chain-dialog"
    @close="handleClose"
  >
    <div class="quick-action-content">
      <div class="success-icon">
        <el-icon :size="48" color="#67c23a"><CircleCheckFilled /></el-icon>
      </div>
      <p class="success-message">{{ message }}</p>

      <div class="action-buttons">
        <template v-for="action in actions" :key="action.key">
          <el-button :type="action.type || 'default'" :icon="action.icon" @click="handleAction(action)">
            {{ action.label }}
          </el-button>
        </template>
      </div>

      <div class="action-footer">
        <el-checkbox v-model="dontShowAgain" size="small"> 不再显示此提示 </el-checkbox>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleBack">返回列表</el-button>
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { CircleCheckFilled } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '操作成功',
  },
  message: {
    type: String,
    default: '操作已成功完成！',
  },
  actions: {
    type: Array,
    default: () => [],
  },
  storageKey: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'action', 'close', 'back', 'disable']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const dontShowAgain = ref(false);

const getStorageKey = () => {
  return props.storageKey ? `quick_action_disabled_${props.storageKey}` : '';
};

const handleAction = (action) => {
  if (dontShowAgain.value && props.storageKey) {
    localStorage.setItem(getStorageKey(), 'true');
    emit('disable');
  }

  emit('action', action);

  if (action.route) {
    window.location.href = action.route;
  }
};

const handleClose = () => {
  if (dontShowAgain.value && props.storageKey) {
    localStorage.setItem(getStorageKey(), 'true');
    emit('disable');
  }

  visible.value = false;
  emit('close');
};

const handleBack = () => {
  if (dontShowAgain.value && props.storageKey) {
    localStorage.setItem(getStorageKey(), 'true');
    emit('disable');
  }

  visible.value = false;
  emit('back');
};

watch(visible, (newVal) => {
  if (newVal) {
    dontShowAgain.value = false;
  }
});
</script>

<style scoped>
.quick-action-chain-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.quick-action-content {
  text-align: center;
}

.success-icon {
  margin-bottom: 16px;
}

.success-message {
  font-size: 16px;
  color: #303133;
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.action-footer {
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
