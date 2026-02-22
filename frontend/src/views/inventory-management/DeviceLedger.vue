<template>
  <PageLayout title="设备台账" description="查看各类型设备的统计信息" :show-footer="false">
    <!-- 使用 UnifiedFilterBar 统一筛选栏 -->
    <UnifiedFilterBar
      v-model="filterForm"
      :fields="filterFields"
      :loading="loading"
      header-title="设备类型筛选"
      :header-icon="Filter"
      :result-count="filteredData.length"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <el-row v-else :gutter="20" class="device-type-grid">
      <el-col
        v-for="type in filteredData"
        :key="type.typeId"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="6"
        class="device-type-col"
      >
        <el-card shadow="hover" class="type-card" @click="handleCardClick(type)">
          <div class="card-content">
            <div class="type-icon">
              <el-icon :size="48"><Box /></el-icon>
            </div>
            <div class="type-info">
              <div class="type-name">{{ type.typeName }}</div>
              <div class="type-stats">
                <div class="stat-item">
                  <span class="stat-label">库存:</span>
                  <span class="stat-value">{{ type.totalStock || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">在库:</span>
                  <span class="stat-value in-stock">{{ type.inStockCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已安装:</span>
                  <span class="stat-value installed">{{ type.installedCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">维修中:</span>
                  <span class="stat-value repairing">{{ type.repairingCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && filteredData.length === 0" description="暂无设备类型数据" />
  </PageLayout>
</template>

<script setup>
import { Box, Filter } from '@element-plus/icons-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getDeviceTypeSummary, getDeviceTypes } from '@/api/device/device-type';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceLedger');

const router = useRouter();

const filterForm = reactive({
  keyword: '',
  typeId: '',
  status: '',
});
const loading = ref(false);
const deviceTypes = ref([]);

// 设备类型汇总数据（从API获取）
const summaryData = ref([]);

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索类型名称',
    clearable: true,
    md: 8,
    lg: 6,
  },
  {
    prop: 'typeId',
    label: '设备类型',
    type: 'select',
    placeholder: '请选择设备类型',
    clearable: true,
    md: 8,
    lg: 6,
    options: deviceTypes.value.map((type) => ({
      label: type.name || type.typeName,
      value: type.id || type.typeId,
    })),
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    md: 8,
    lg: 6,
    options: [
      { label: '在库', value: 'in_stock' },
      { label: '已安装', value: 'installed' },
      { label: '维修中', value: 'repairing' },
    ],
  },
]);

const filteredData = computed(() => {
  let result = summaryData.value;
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase();
    result = result.filter((item) => item.typeName.toLowerCase().includes(keyword));
  }
  if (filterForm.typeId) {
    result = result.filter((item) => item.typeId === filterForm.typeId);
  }
  return result;
});

// 加载设备类型列表（用于筛选下拉）
const loadDeviceTypes = async () => {
  try {
    const response = await getDeviceTypes();
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      deviceTypes.value = dataArray.map((type) => ({
        id: type.id || type.typeId,
        name: type.name || type.typeName || '未知类型',
        code: type.code || type.typeCode,
      }));
    }
  } catch (error) {
    logger.error('加载设备类型失败:', error);
  }
};

// 加载设备类型汇总数据
const loadSummaryData = async () => {
  loading.value = true;
  try {
    const response = await getDeviceTypeSummary();
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      // 映射API返回的数据到组件需要的格式
      summaryData.value = dataArray.map((item) => ({
        typeId: item.typeId || item.id,
        typeName: item.typeName || item.name,
        totalStock: item.totalStock || item.totalCount || 0,
        inStockCount: item.inStockCount || item.inStock || 0,
        installedCount: item.installedCount || item.installed || 0,
        repairingCount: item.repairingCount || item.repairing || 0,
      }));
    } else {
      summaryData.value = [];
    }
  } catch (error) {
    logger.error('加载设备类型汇总数据失败:', error);
    summaryData.value = [];
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadDeviceTypes();
  loadSummaryData();
});

const handleCardClick = (type) => {
  // 跳转到设备列表视图，并传递设备类型ID作为查询参数
  router.push({
    path: '/asset-management/device-list',
    query: {
      typeId: type.typeId,
      typeName: type.typeName,
    },
  });
};

const handleSearch = () => {
  // 筛选逻辑已通过 computed 自动处理
  logger.debug('执行搜索:', filterForm);
};

const handleReset = () => {
  filterForm.keyword = '';
  filterForm.typeId = '';
  filterForm.status = '';
  logger.debug('重置筛选条件');
};
</script>

<style scoped>
.loading-container {
  padding: 40px 20px;
}

.device-type-grid {
  margin-top: 20px;
}
.device-type-col {
  margin-bottom: 20px;
}
.type-card {
  cursor: pointer;
  transition: all 0.3s;
}
.type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.card-content {
  display: flex;
  align-items: center;
  padding: 10px;
}
.type-icon {
  margin-right: 20px;
  color: var(--el-color-primary);
}
.type-info {
  flex: 1;
}
.type-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.type-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>
