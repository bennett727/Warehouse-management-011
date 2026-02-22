import { getWarehouseList } from '@/api/inventory/warehouse';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('warehouse');
import { handleErrorMessage } from '@/utils/responseHandler.js';

import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useWarehouseStore = defineStore('warehouse', () => {
  // 仓库列表
  const warehouses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // ==================== 加载状态管理 ====================
  const operationLoading = ref({
    list: false,
    create: false,
    update: false,
    delete: false,
  });

  // 计算属性：获取所有仓库
  const allWarehouses = computed(() => warehouses.value);

  // 计算属性：根据 ID 获取仓库
  const getWarehouseById = (id) => {
    return warehouses.value.find((warehouse) => warehouse.id === id);
  };

  // 获取仓库列表
  const fetchWarehouses = async () => {
    operationLoading.value.list = true;
    error.value = null;

    try {
      const response = await getWarehouseList();
      warehouses.value = response.data || [];
      return warehouses.value;
    } catch (err) {
      const errorMessage = err?.message || '获取仓库列表失败';
      error.value = errorMessage;
      ElMessage.error(handleErrorMessage(err, '获取仓库列表失败'));
      logger.error('获取仓库列表失败', err);
      throw err;
    } finally {
      operationLoading.value.list = false;
    }
  };

  // 清除仓库列表
  const clearWarehouses = () => {
    warehouses.value = [];
  };

  return {
    warehouses,
    loading,
    error,
    operationLoading,
    allWarehouses,
    getWarehouseById,
    fetchWarehouses,
    clearWarehouses,
  };
});
