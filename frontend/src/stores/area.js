import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import {
  batchDeleteAreas as batchDeleteAreasApi,
  batchUpdateAreaStatus as batchUpdateAreaStatusApi,
  checkAreaCodeExists as checkAreaCodeExistsApi,
  checkAreaNameExists as checkAreaNameExistsApi,
  createArea as createAreaApi,
  deleteArea as deleteAreaApi,
  getAllCities,
  getAreaById as getAreaByIdApi,
  getAreaDeviceCount,
  getAreaList,
  getAreaPath as getAreaPathApi,
  getAreaTree,
  getDistrictsByCity,
  getLocationsByCityAndDistrict,
  getSubAreas,
  updateArea as updateAreaApi,
} from '@/api/system/area';
import { createFieldMapper, normalizeApiResponse } from '@/utils/dataNormalizer.js';
import { createLogger } from '@/utils/logger.js';
import { handleErrorMessage } from '@/utils/responseHandler.js';

const logger = createLogger('area');

export const useAreaStore = defineStore('area', () => {
  // 区域列表相关状态
  const areas = ref([]);
  const areaTree = ref([]);
  const loading = ref(false);
  const searchKeyword = ref('');

  // 缓存
  const cityCache = ref(new Map()); // 城市 -> 区县列表缓存
  const districtCache = ref(new Map()); // 城市+区县 -> 地点列表缓存
  const citiesCache = ref([]); // 城市列表缓存

  // ==================== 数据规范化函数 ====================
  const areaFieldMapper = createFieldMapper({
    id: 'id',
    name: 'name',
    code: 'code',
    city: 'city',
    district: 'district',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    parentId: 'parentId',
  });

  function normalizeAreaData(area) {
    if (!area || typeof area !== 'object') {
      return {};
    }
    return areaFieldMapper(area);
  }

  // 清除所有缓存
  function clearAllCache() {
    cityCache.value.clear();
    districtCache.value.clear();
    citiesCache.value = [];
  }

  // 清除特定城市的缓存
  function clearCityCache(city) {
    cityCache.value.delete(city);
    // 清除该城市下所有区县的位置缓存
    const keysToDelete = Array.from(districtCache.value.keys()).filter((key) => key.startsWith(`${city}-`));
    keysToDelete.forEach((key) => districtCache.value.delete(key));
  }

  // 清除特定城市和区县的位置缓存
  function clearLocationCache(city, district) {
    const cacheKey = `${city}-${district}`;
    districtCache.value.delete(cacheKey);
  }

  // 区域详情相关状态
  const currentArea = ref(null);
  const detailLoading = ref(false);

  // 计算属性：过滤后的区域列表
  const filteredAreas = computed(() => {
    let result = [...areas.value];

    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter((area) => {
        const name = area.name || '';
        return name.toLowerCase().includes(keyword) || (area.code && area.code.toLowerCase().includes(keyword));
      });
    }

    return result;
  });

  // 计算属性：获取所有区域
  const getAllAreas = computed(() => areas.value);

  // 计算属性：获取顶级区域（没有父级的区域）
  const getTopLevelAreas = computed(() => {
    return areas.value.filter((area) => !area.parentId);
  });

  // 方法：根据ID获取区域
  function getAreaById(areaId) {
    return areas.value.find((area) => area.id === areaId);
  }

  // 方法：获取子区域
  function getChildAreas(parentId) {
    return areas.value.filter((area) => area.parentId === parentId);
  }

  // 方法：加载区域列表
  async function loadAreas(params = {}) {
    loading.value = true;
    try {
      const requestParams = { ...params };
      if (searchKeyword.value && searchKeyword.value.trim()) {
        requestParams.name = searchKeyword.value;
      }
      const response = await getAreaList(requestParams);
      const normalizedResponse = normalizeApiResponse(response, {
        listFields: ['devices', 'records', 'items', 'list', 'data'],
        totalField: 'total',
        dataField: 'data',
        normalizer: normalizeAreaData,
      });
      areas.value = normalizedResponse.data || [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载区域列表失败'));
      logger.error('加载区域列表失败', error);
      areas.value = [];
    } finally {
      loading.value = false;
    }
  }

  // 方法：加载区域树结构
  async function loadAreaTree(status = null) {
    loading.value = true;
    try {
      const params = status !== null ? { status } : {};
      const response = await getAreaTree(params);
      areaTree.value = response.data || [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载区域树结构失败'));
      logger.error('加载区域树结构失败', error);
      areaTree.value = [];
    } finally {
      loading.value = false;
    }
  }

  // 方法：加载区域详情
  async function loadAreaDetail(areaId) {
    detailLoading.value = true;
    try {
      const response = await getAreaByIdApi(areaId);
      currentArea.value = response.data;
      return response.data;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载区域详情失败'));
      logger.error('加载区域详情失败', error);
      currentArea.value = null;
      return null;
    } finally {
      detailLoading.value = false;
    }
  }

  // 方法：创建区域
  async function createArea(areaData) {
    loading.value = true;
    try {
      const response = await createAreaApi(areaData);
      ElMessage.success('区域创建成功');

      const { city, district } = areaData;
      clearLocationCache(city, district);
      clearCityCache(city);
      citiesCache.value = [];

      await loadAreas();
      await loadAreaTree();
      return response.data;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '区域创建失败'));
      logger.error('区域创建失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 方法：更新区域
  async function updateArea(areaId, areaData) {
    loading.value = true;
    try {
      const oldArea = currentArea.value || (await loadAreaDetail(areaId));

      const response = await updateAreaApi(areaId, areaData);
      ElMessage.success('区域更新成功');

      if (oldArea) {
        clearLocationCache(oldArea.city, oldArea.district);

        if (oldArea.city !== areaData.city || oldArea.district !== areaData.district) {
          clearCityCache(oldArea.city);
          clearLocationCache(areaData.city, areaData.district);
        }

        clearCityCache(areaData.city);
      }

      citiesCache.value = [];

      await loadAreas();
      await loadAreaTree();
      if (currentArea.value && currentArea.value.id === areaId) {
        currentArea.value = response.data;
      }
      return response.data;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '区域更新失败'));
      logger.error('区域更新失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 方法：删除区域
  async function deleteArea(areaId) {
    loading.value = true;
    try {
      // 获取要删除的区域数据
      const areaToDelete = currentArea.value || (await loadAreaDetail(areaId));

      // 检查区域下是否有设备
      const deviceCountResponse = await getAreaDeviceCount(areaId);
      const deviceCount = deviceCountResponse.data || 0;

      if (deviceCount > 0) {
        ElMessage.warning(`该区域下有 ${deviceCount} 台设备，无法删除`);
        return false;
      }

      await deleteAreaApi(areaId);
      ElMessage.success('区域删除成功');

      // 清除相关缓存
      if (areaToDelete) {
        clearLocationCache(areaToDelete.city, areaToDelete.district); // 清除该位置的缓存
        clearCityCache(areaToDelete.city); // 清除该城市的区县缓存
      }

      citiesCache.value = []; // 清除城市列表缓存

      await loadAreas();
      await loadAreaTree();
      if (currentArea.value && currentArea.value.id === areaId) {
        currentArea.value = null;
      }
      return true;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '区域删除失败'));
      logger.error('区域删除失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 方法：批量删除区域
  async function batchDeleteAreas(areaIds) {
    try {
      await batchDeleteAreasApi(areaIds);
      ElMessage.success(`成功删除 ${areaIds.length} 个区域`);

      // 批量删除时清除所有缓存，因为无法确定具体影响了哪些区域
      clearAllCache();

      await loadAreas();
      await loadAreaTree();
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '批量删除区域失败'));
      logger.error('批量删除区域失败', error);
      throw error;
    }
  }

  // 方法：批量更新区域状态
  async function batchUpdateAreaStatus(areaIds, status) {
    try {
      await batchUpdateAreaStatusApi(areaIds, status);
      const statusText = status === 1 ? '启用' : '禁用';
      ElMessage.success(`成功${statusText} ${areaIds.length} 个区域`);

      // 批量更新状态时清除所有缓存，因为无法确定具体影响了哪些区域
      clearAllCache();

      await loadAreas();
      await loadAreaTree();
    } catch (error) {
      const statusText = status === 1 ? '启用' : '禁用';
      ElMessage.error(`批量${statusText}区域失败`);
      logger.error(`批量${statusText}区域失败`, error);
      throw error;
    }
  }

  // 方法：加载子区域
  async function loadSubAreas(parentId) {
    try {
      const response = await getSubAreas(parentId);
      return response.data || [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载子区域失败'));
      logger.error('加载子区域失败', error);
      return [];
    }
  }

  // 方法：获取区域路径
  async function getAreaPath(areaId) {
    try {
      const response = await getAreaPathApi(areaId);
      return response.data || [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '获取区域路径失败'));
      logger.error('获取区域路径失败', error);
      return [];
    }
  }

  // 方法：检查区域名称是否已存在
  async function checkAreaNameExists(name, excludeId = null) {
    try {
      const response = await checkAreaNameExistsApi(name, excludeId);
      return response.data.exists;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '检查区域名称失败'));
      logger.error('检查区域名称失败', error);
      return false;
    }
  }

  // 方法：检查区域编码是否已存在
  async function checkAreaCodeExists(code, excludeId = null) {
    try {
      const response = await checkAreaCodeExistsApi(code, excludeId);
      return response.data.exists;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '检查区域编码失败'));
      logger.error('检查区域编码失败', error);
      return false;
    }
  }

  // 方法：重置筛选条件
  function resetFilters() {
    searchKeyword.value = '';
  }

  // 方法：加载所有城市列表
  async function loadCities() {
    // 如果缓存中有城市列表，直接返回
    if (citiesCache.value.length > 0) {
      return citiesCache.value;
    }

    loading.value = true;
    try {
      const response = await getAllCities();
      const result = response.data || [];
      // 缓存城市列表
      citiesCache.value = result;
      return result;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载城市列表失败'));
      logger.error('加载城市列表失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 方法：根据城市加载区县列表
  async function loadDistrictsByCity(city) {
    // 如果缓存中有该城市的区县列表，直接返回
    if (cityCache.value.has(city)) {
      return cityCache.value.get(city);
    }

    loading.value = true;
    try {
      const response = await getDistrictsByCity(city);
      const result = response.data || [];
      // 缓存区县列表
      cityCache.value.set(city, result);
      return result;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载区县列表失败'));
      logger.error('加载区县列表失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 方法：根据城市和区县加载位置列表
  async function loadLocationsByCityAndDistrict(city, district) {
    // 生成缓存键
    const cacheKey = `${city}-${district}`;

    // 如果缓存中有该城市和区县的位置列表，直接返回
    if (districtCache.value.has(cacheKey)) {
      return districtCache.value.get(cacheKey);
    }

    loading.value = true;
    try {
      const response = await getLocationsByCityAndDistrict(city, district);
      const result = response.data || [];
      // 缓存位置列表
      districtCache.value.set(cacheKey, result);
      return result;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载位置列表失败'));
      logger.error('加载位置列表失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    // 状态
    areas,
    areaTree,
    loading,
    searchKeyword,
    currentArea,
    detailLoading,
    cityCache,
    districtCache,
    citiesCache,

    // 计算属性
    filteredAreas,
    getAllAreas,
    getTopLevelAreas,

    // 方法
    loadAreas,
    loadAreaTree,
    loadAreaDetail,
    createArea,
    updateArea,
    deleteArea,
    batchDeleteAreas,
    batchUpdateAreaStatus,
    loadSubAreas,
    getAreaPath,
    checkAreaNameExists,
    checkAreaCodeExists,
    resetFilters,
    loadCities,
    loadDistrictsByCity,
    loadLocationsByCityAndDistrict,
    getAreaById,
    getChildAreas,

    // 缓存管理方法
    clearAllCache,
    clearCityCache,
    clearLocationCache,
  };
});
