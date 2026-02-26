<template>
  <div class="excel-export">
    <el-dropdown @command="handleCommand" :disabled="loading">
      <el-button type="primary" :loading="loading" data-cy="excel-export-btn">
        <el-icon><Download /></el-icon>
        <span>导出Excel</span>
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="devices" v-if="hasPermission('devices')">
            <el-icon><Document /></el-icon>
            <span>导出设备列表</span>
          </el-dropdown-item>
          <el-dropdown-item command="inventory" v-if="hasPermission('inventory')">
            <el-icon><Box /></el-icon>
            <span>导出库存报表</span>
          </el-dropdown-item>
          <el-dropdown-item command="comprehensive" v-if="hasPermission('comprehensive')" divided>
            <el-icon><Files /></el-icon>
            <span>导出综合报表</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Download, ArrowDown, Document, Box, Files } from '@element-plus/icons-vue';
import { exportDevices, exportInventory, exportComprehensiveReport, handleExcelExport } from '@/api/excelExport';
import { useUserStore } from '@/stores/user';

const props = defineProps({
  // 允许导出的类型
  allowedTypes: {
    type: Array,
    default: () => ['devices', 'inventory', 'comprehensive'],
  },
});

const userStore = useUserStore();
const loading = ref(false);

/**
 * 检查是否有权限
 */
const hasPermission = (type) => {
  if (!props.allowedTypes.includes(type)) {
    return false;
  }

  const roles = userStore.roles || [];

  switch (type) {
    case 'devices':
    case 'inventory':
      return roles.includes('ADMIN') || roles.includes('OPERATOR');
    case 'comprehensive':
      return roles.includes('ADMIN');
    default:
      return false;
  }
};

/**
 * 处理导出命令
 */
const handleCommand = async (command) => {
  if (loading.value) {
    return;
  }

  loading.value = true;

  try {
    let response;
    let defaultFilename;

    switch (command) {
      case 'devices':
        response = await exportDevices();
        defaultFilename = '设备列表.xlsx';
        break;
      case 'inventory':
        response = await exportInventory();
        defaultFilename = '库存报表.xlsx';
        break;
      case 'comprehensive':
        response = await exportComprehensiveReport();
        defaultFilename = '综合报表.xlsx';
        break;
      default:
        throw new Error('未知的导出类型');
    }

    await handleExcelExport(response, defaultFilename);
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error(error.message || '导出失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.excel-export {
  display: inline-block;
}

.el-icon {
  margin-right: 4px;
}
</style>
