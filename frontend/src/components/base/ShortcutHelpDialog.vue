<!--
  @file: ShortcutHelpDialog.vue
  @description: 快捷键帮助对话框组件，展示系统支持的键盘快捷键
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="快捷键帮助"
    width="600px"
    :close-on-click-modal="true"
    class="shortcut-help-dialog"
  >
    <div class="shortcut-help-content">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Ctrl + F">
          <span class="shortcut-desc">快速搜索</span>
        </el-descriptions-item>
        <el-descriptions-item label="Ctrl + N">
          <span class="shortcut-desc">新增设备</span>
        </el-descriptions-item>
        <el-descriptions-item label="Ctrl + E">
          <span class="shortcut-desc">导出数据</span>
        </el-descriptions-item>
        <el-descriptions-item label="Ctrl + I">
          <span class="shortcut-desc">导入数据</span>
        </el-descriptions-item>
        <el-descriptions-item label="Ctrl + C">
          <span class="shortcut-desc">列配置</span>
        </el-descriptions-item>
        <el-descriptions-item label="Esc">
          <span class="shortcut-desc">关闭弹窗</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style scoped>
.shortcut-help-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.shortcut-help-content {
  max-height: 400px;
  overflow-y: auto;
}

.shortcut-desc {
  color: #606266;
}
</style>
