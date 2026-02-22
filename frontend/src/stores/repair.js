import { addRepair, deleteRepair, getRepairList, updateRepair } from '@/api/repair/repair';
import { PAGINATION } from '@/constants';
import { createFieldMapper, normalizeApiResponse } from '@/utils/dataNormalizer.js';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('repair');
import { handleErrorMessage } from '@/utils/responseHandler.js';

import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * 维修管理Store
 * 负责管理设备维修记录相关的状态和操作
 */
const useRepairStore = defineStore('repair', () => {
  // 状态
  const repairs = ref([]);
  const loading = ref(false);
  const searchParams = ref({});

  // 分页信息
  const pagination = ref({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // ==================== 数据规范化函数 ====================
  const repairFieldMapper = createFieldMapper({
    id: 'id',
    deviceId: 'deviceId',
    deviceName: 'deviceName',
    repairType: 'repairType',
    status: 'status',
    description: 'description',
    repairDate: 'repairDate',
    repairer: 'repairer',
    cost: 'cost',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  function normalizeRepairData(repair) {
    if (!repair || typeof repair !== 'object') {
      return {};
    }
    return repairFieldMapper(repair);
  }

  /**
   * 分页后的维修列表
   * @returns {Array} 维修记录列表
   */
  const paginatedRepairs = computed(() => {
    return repairs.value;
  });

  /**
   * 加载维修列表
   * @throws {Error} 加载失败时抛出错误
   */
  const loadRepairs = async () => {
    try {
      loading.value = true;
      const params = {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...searchParams.value,
      };
      const response = await getRepairList(params);
      const normalizedResponse = normalizeApiResponse(response, {
        listFields: ['devices', 'records', 'items', 'list', 'data'],
        totalField: 'total',
        dataField: 'data',
        normalizer: normalizeRepairData,
      });
      repairs.value = normalizedResponse.list;
      pagination.value.total = normalizedResponse.total;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载维修列表失败'));
      logger.error('加载维修列表失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 搜索维修记录
   * @param {Object} params - 搜索参数
   * @throws {Error} 搜索失败时抛出错误
   */
  const searchRepairs = async (params) => {
    try {
      searchParams.value = params;
      pagination.value.currentPage = 1;
      await loadRepairs();
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '搜索维修记录失败'));
      logger.error('搜索维修记录失败', error);
      throw error;
    }
  };

  /**
   * 执行添加维修记录操作
   * @param {Object} data - 维修记录数据
   * @throws {Error} 添加失败时抛出错误
   */
  const executeAddRepair = async (data) => {
    try {
      loading.value = true;
      await addRepair(data);
      ElMessage.success('添加维修记录成功');
      await loadRepairs();
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '添加维修记录失败'));
      logger.error('添加维修记录失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 执行更新维修记录操作
   * @param {Object} data - 维修记录数据
   * @throws {Error} 更新失败时抛出错误
   */
  const executeUpdateRepair = async (data) => {
    try {
      loading.value = true;
      await updateRepair(data);
      ElMessage.success('更新维修记录成功');
      await loadRepairs();
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '更新维修记录失败'));
      logger.error('更新维修记录失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 执行删除维修记录操作
   * @param {number|string} id - 维修记录ID
   * @throws {Error} 删除失败时抛出错误
   */
  const executeDeleteRepair = async (id) => {
    try {
      loading.value = true;
      await deleteRepair(id);
      ElMessage.success('删除维修记录成功');
      await loadRepairs();
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '删除维修记录失败'));
      logger.error('删除维修记录失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 初始化维修管理
   * @throws {Error} 初始化失败时抛出错误
   */
  const init = async () => {
    try {
      await loadRepairs();
    } catch (error) {
      logger.error('初始化维修管理失败', error);
      throw error;
    }
  };

  // 返回状态和方法
  return {
    // 状态
    repairs,
    loading,
    searchParams,
    pagination,

    // 计算属性
    paginatedRepairs,

    // 方法
    loadRepairs,
    searchRepairs,
    addRepair: executeAddRepair,
    updateRepair: executeUpdateRepair,
    deleteRepair: executeDeleteRepair,
    init,
  };
});

export default useRepairStore;
export { useRepairStore };
