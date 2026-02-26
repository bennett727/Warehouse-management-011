<!--
  @file: DeviceStatusDictionaryPage.vue
  @description: 设备状态字典页面 - 展示系统支持的设备状态列表
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
  @update: 2026-02-12 - 重命名以准确反映功能
-->
<template>
  <PageLayout title="设备状态字典" description="查看系统支持的设备状态列表">
    <el-alert title="说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
      <template #default>
        <div>
          设备状态字典定义了设备在仓库管理系统中的生命周期状态。这些状态由系统预设，用于追踪设备从入库到报废的完整生命周期。
        </div>
      </template>
    </el-alert>

    <DataTable
      :data="tableData"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      height="500px"
      data-cy="device-status-table"
      @page-change="handlePageChange"
    >
      <el-table-column prop="statusCode" label="状态编码" width="120" data-cy="device-status-code-column" />
      <el-table-column prop="statusName" label="状态名称" width="150" data-cy="device-status-name-column" />
      <el-table-column prop="description" label="描述" min-width="200" data-cy="device-status-desc-column" />
      <el-table-column prop="sortOrder" label="排序" width="80" align="center" data-cy="device-status-sort-column" />
      <el-table-column prop="isActive" label="状态" width="100" data-cy="device-status-active-column">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'" :data-cy="`device-status-tag-${row.statusCode}`">{{ row.isActive ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
    </DataTable>
  </PageLayout>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';

import { getDeviceStatusList } from '@/api/device/device-status';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceStatusDictionaryPage');

const loading = ref(false);
const tableData = ref([]);

const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getDeviceStatusList();
    if (response.success || response.code === 200) {
      const list = response.data || response.data?.list || [];
      tableData.value = list.map((item) => ({
        statusCode: item.statusCode ?? item.status ?? 'N/A',
        statusName: item.statusName || item.name || item.description || '未命名',
        description: item.description || '-',
        sortOrder: item.sortOrder ?? item.sort ?? 0,
        isActive: item.isActive !== undefined ? item.isActive : true,
      }));
      pagination.total = tableData.value.length;
    } else {
      ElMessage.error(response.message || '获取设备状态字典失败');
    }
  } catch (error) {
    logger.error('获取设备状态字典失败', error);
    ElMessage.error(error.message || '获取设备状态字典失败');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  pagination.current = page;
};

onMounted(() => {
  fetchData();
});
</script>
