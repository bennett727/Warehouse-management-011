import {
  batchDeleteDevices as batchDeleteDevicesApi,
  createDevice as createDeviceApi,
  deleteDevice as deleteDeviceApi,
  exportDevices as exportDevicesApi,
  getDeviceDetail,
  getDeviceList,
  updateDevice as updateDeviceApi,
  updateDeviceStatus as updateDeviceStatusApi,
} from '@/api/device/device';
import { getDeviceTypes } from '@/api/device/device-type';
import { getAllCities, getDistrictsByCity, getLocationsByCityAndDistrict } from '@/api/system/area';
import { createFieldMapper, normalizeApiResponse } from '@/utils/dataNormalizer.js';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('device');
import { handleErrorMessage } from '@/utils/responseHandler.js';

import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * 设备管理状态管理
 * @file: device.js
 * @description: 管理设备相关的状态和操作，包括设备列表、详情、类型管理等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 2.0
 */
export const useDeviceStore = defineStore('device', () => {
  // ==================== 设备列表相关状态 ====================
  const devices = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const searchKeyword = ref('');
  const filterType = ref('');
  const filterStatus = ref('');

  // ==================== 设备详情相关状态 ====================
  const currentDevice = ref(null);
  const detailLoading = ref(false);

  // ==================== 设备类型列表 ====================
  const deviceTypes = ref([]);
  const typesLoading = ref(false);

  // ==================== 地理位置数据 ====================
  const cities = ref([]);
  const districts = ref([]);
  const locations = ref([]);
  const citiesLoading = ref(false);
  const districtsLoading = ref(false);
  const locationsLoading = ref(false);

  // ==================== 加载状态管理 ====================
  const operationLoading = ref({
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false,
    batchDelete: false,
    statusUpdate: false,
    export: false,
  });

  // ==================== 数据规范化函数 ====================
  const deviceFieldMapper = createFieldMapper({
    id: 'id',
    deviceCode: 'deviceCode',
    name: 'name',
    model: 'model',
    serialNumber: 'serialNumber',
    deviceType: 'deviceType',
    location: 'location',
    status: 'status',
    currentStock: 'currentStock',
    cityId: 'cityId',
    districtId: 'districtId',
    locationId: 'locationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  function normalizeDeviceData(device) {
    if (!device || typeof device !== 'object') {
      return {};
    }
    return deviceFieldMapper(device);
  }

  /**
   * 加载设备类型列表
   * @description: 从后端获取所有设备类型，并转换为下拉选项格式
   * @returns {Promise<void>}
   */
  async function loadDeviceTypes() {
    typesLoading.value = true;
    try {
      const response = await getDeviceTypes();
      if (response.code === 200 && response.data) {
        // 确保 response.data 是数组
        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data.records || response.data.list || [];
        deviceTypes.value = dataArray.map((type) => ({
          label: type.name || type.typeName,
          value: type.code,
        }));
      } else {
        ElMessage.error('加载设备类型失败');
        deviceTypes.value = [];
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        ElMessage.error(handleErrorMessage(error, '加载设备类型失败'));
        logger.error('加载设备类型失败', error);
      }
      deviceTypes.value = [];
    } finally {
      typesLoading.value = false;
    }
  }

  /**
   * 加载城市列表
   * @description: 从后端获取所有城市数据
   * @returns {Promise<void>}
   */
  async function loadCities() {
    citiesLoading.value = true;
    try {
      const response = await getAllCities();
      cities.value = response.data || [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '获取城市列表失败'));
      logger.error('加载城市列表失败', error);
      cities.value = [];
    } finally {
      citiesLoading.value = false;
    }
  }

  /**
   * 根据城市ID加载区县列表
   * @description: 从后端获取指定城市的区县数据
   * @param {string|number} cityId - 城市ID
   * @returns {Promise<void>}
   */
  async function loadDistricts(cityId) {
    if (!cityId) {
      districts.value = [];
      locations.value = [];
      return;
    }
    districtsLoading.value = true;
    try {
      const response = await getDistrictsByCity(cityId);
      districts.value = response.data || [];
      locations.value = [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '获取区县列表失败'));
      logger.error('加载区县列表失败', error);
      districts.value = [];
    } finally {
      districtsLoading.value = false;
    }
  }

  /**
   * 根据城市和区县ID加载位置列表
   * @description: 从后端获取指定城市和区县的位置数据
   * @param {string|number} cityId - 城市ID
   * @param {string|number} districtId - 区县ID
   * @returns {Promise<void>}
   */
  async function loadLocations(cityId, districtId) {
    if (!cityId || !districtId) {
      locations.value = [];
      return;
    }
    locationsLoading.value = true;
    try {
      const response = await getLocationsByCityAndDistrict(cityId, districtId);
      locations.value = response.data || [];
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '获取位置列表失败'));
      logger.error('加载位置列表失败', error);
      locations.value = [];
    } finally {
      locationsLoading.value = false;
    }
  }

  /**
   * 重置地理位置数据
   * @description: 清空城市、区县和位置数据
   * @returns {void}
   */
  function resetLocationData() {
    cities.value = [];
    districts.value = [];
    locations.value = [];
  }

  /**
   * 获取城市名称
   * @description: 根据城市ID获取城市名称
   * @param {string|number} cityId - 城市ID
   * @returns {string} 城市名称，未找到返回空字符串
   */
  function getCityName(cityId) {
    const city = cities.value.find((c) => c.id === cityId);
    return city?.name || '';
  }

  /**
   * 获取区县名称
   * @description: 根据区县ID获取区县名称
   * @param {string|number} districtId - 区县ID
   * @returns {string} 区县名称，未找到返回空字符串
   */
  function getDistrictName(districtId) {
    const district = districts.value.find((d) => d.id === districtId);
    return district?.name || '';
  }

  /**
   * 获取位置名称
   * @description: 根据位置ID获取位置名称
   * @param {string|number} locationId - 位置ID
   * @returns {string} 位置名称，未找到返回空字符串
   */
  function getLocationName(locationId) {
    const location = locations.value.find((l) => l.id === locationId);
    return location?.name || '';
  }

  /**
   * 获取完整地理位置信息
   * @description: 根据城市、区县和位置ID获取完整的地理位置字符串
   * @param {string|number} cityId - 城市ID
   * @param {string|number} districtId - 区县ID
   * @param {string|number} locationId - 位置ID
   * @returns {string} 完整的地理位置信息
   */
  function getFullLocation(cityId, districtId, locationId) {
    const cityName = getCityName(cityId);
    const districtName = getDistrictName(districtId);
    const locationName = getLocationName(locationId);
    return [cityName, districtName, locationName].filter(Boolean).join(' - ');
  }

  /**
   * 过滤后的设备列表
   * @description: 根据搜索关键词、设备类型和设备状态对设备列表进行过滤
   * @returns {Array} 过滤后的设备数组
   */
  const filteredDevices = computed(() => {
    let result = [...devices.value];

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter(
        (device) =>
          device.name.toLowerCase().includes(keyword) ||
          device.model.toLowerCase().includes(keyword) ||
          device.serialNumber.toLowerCase().includes(keyword) ||
          device.location.toLowerCase().includes(keyword)
      );
    }

    if (filterType.value) {
      result = result.filter((device) => device.deviceType === filterType.value);
    }

    if (filterStatus.value) {
      result = result.filter((device) => device.status === filterStatus.value);
    }

    return result;
  });

  /**
   * 分页后的设备列表
   * @description: 根据当前页码和每页大小对过滤后的设备列表进行分页
   * @returns {Array} 当前页的设备数组
   */
  const paginatedDevices = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredDevices.value.slice(start, end);
  });

  /**
   * 加载设备列表
   * @description: 从后端获取设备列表，支持分页和筛选
   * @param {Object} params - 额外的查询参数
   * @param {number} params.pageNum - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.keyword - 搜索关键词
   * @param {string} params.typeId - 设备类型ID
   * @param {string} params.status - 设备状态
   * @returns {Promise<void>}
   */
  async function loadDevices(params = {}) {
    operationLoading.value.list = true;
    try {
      const response = await getDeviceList({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        typeId: filterType.value,
        status: filterStatus.value,
        ...params,
      });
      const normalizedResponse = normalizeApiResponse(response, {
        listFields: ['devices', 'records', 'items', 'list', 'data'],
        totalField: 'total',
        dataField: 'data',
        normalizer: normalizeDeviceData,
      });
      devices.value = normalizedResponse.data || [];
      total.value = normalizedResponse.total;
    } catch (error) {
      let errorMsg = '加载设备列表失败';
      if (error?.message && !error.message.includes('成功') && !error.message.includes('操作成功')) {
        errorMsg = `加载设备列表失败: ${error.message}`;
      }
      ElMessage.error(errorMsg);
      logger.error('加载设备列表失败', error);
      devices.value = [];
      total.value = 0;
    } finally {
      operationLoading.value.list = false;
    }
  }

  /**
   * 加载设备详情
   * @description: 根据设备ID获取设备详细信息
   * @param {number} deviceId - 设备ID
   * @returns {Promise<Object|null>} 设备详情对象，失败返回null
   */
  async function loadDeviceDetail(deviceId) {
    operationLoading.value.detail = true;
    try {
      const response = await getDeviceDetail(deviceId);
      currentDevice.value = response.data;
      return response.data;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '加载设备详情失败'));
      logger.error('加载设备详情失败', error);
      currentDevice.value = null;
      return null;
    } finally {
      operationLoading.value.detail = false;
    }
  }

  /**
   * 创建设备
   * @description: 创建新的设备记录
   * @param {Object} deviceData - 设备数据
   * @param {string} deviceData.name - 设备名称
   * @param {string} deviceData.model - 设备型号
   * @param {string} deviceData.serialNumber - 序列号
   * @param {string} deviceData.deviceType - 设备类型
   * @param {string} deviceData.location - 存放位置
   * @param {string} deviceData.status - 设备状态
   * @returns {Promise<Object>} 创建的设备数据
   */
  async function createDevice(deviceData) {
    operationLoading.value.create = true;
    try {
      const response = await createDeviceApi(deviceData);
      ElMessage.success('设备创建成功');
      await loadDevices();
      return response.data;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '设备创建失败'));
      logger.error('设备创建失败', error);
      throw error;
    } finally {
      operationLoading.value.create = false;
    }
  }

  /**
   * 更新设备
   * @description: 更新现有设备的信息
   * @param {number} deviceId - 设备ID
   * @param {Object} deviceData - 更新的设备数据
   * @returns {Promise<Object>} 更新后的设备数据
   */
  async function updateDevice(deviceId, deviceData) {
    operationLoading.value.update = true;
    try {
      const response = await updateDeviceApi(deviceId, deviceData);
      ElMessage.success('设备更新成功');
      await loadDevices();
      if (currentDevice.value && currentDevice.value.id === deviceId) {
        currentDevice.value = response.data;
      }
      return response.data;
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '设备更新失败'));
      logger.error('设备更新失败', error);
      throw error;
    } finally {
      operationLoading.value.update = false;
    }
  }

  /**
   * 删除设备
   * @description: 根据设备ID删除设备
   * @param {number} deviceId - 设备ID
   * @returns {Promise<void>}
   */
  async function deleteDevice(deviceId) {
    operationLoading.value.delete = true;
    try {
      await deleteDeviceApi(deviceId);
      ElMessage.success('设备删除成功');
      await loadDevices();
      if (currentDevice.value && currentDevice.value.id === deviceId) {
        currentDevice.value = null;
      }
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '设备删除失败'));
      logger.error('设备删除失败', error);
      throw error;
    } finally {
      operationLoading.value.delete = false;
    }
  }

  /**
   * 批量删除设备
   * @description: 批量删除多个设备
   * @param {Array<number>} deviceIds - 设备ID数组
   * @returns {Promise<void>}
   */
  async function batchDeleteDevices(deviceIds) {
    operationLoading.value.batchDelete = true;
    try {
      await batchDeleteDevicesApi(deviceIds);
      ElMessage.success(`成功删除 ${deviceIds.length} 个设备`);
      await loadDevices();
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '批量删除设备失败'));
      logger.error('批量删除设备失败', error);
      throw error;
    } finally {
      operationLoading.value.batchDelete = false;
    }
  }

  /**
   * 更新设备状态
   * @description: 更新设备的状态信息
   * @param {number} deviceId - 设备ID
   * @param {string} status - 新的状态
   * @param {string} remark - 状态变更备注
   * @returns {Promise<void>}
   */
  async function updateDeviceStatus(deviceId, status, remark = '') {
    operationLoading.value.statusUpdate = true;
    try {
      await updateDeviceStatusApi(deviceId, status, remark);
      ElMessage.success('设备状态更新成功');
      await loadDevices();
      if (currentDevice.value && currentDevice.value.id === deviceId) {
        currentDevice.value.status = status;
      }
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '设备状态更新失败'));
      logger.error('设备状态更新失败', error);
      throw error;
    } finally {
      operationLoading.value.statusUpdate = false;
    }
  }

  /**
   * 导出设备数据
   * @description: 将设备数据导出为Excel文件
   * @param {Object} params - 导出参数
   * @returns {Promise<void>}
   */
  async function exportDevices(params = {}) {
    operationLoading.value.export = true;
    try {
      const response = await exportDevicesApi(params);

      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `设备数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      ElMessage.success('设备数据导出成功');
    } catch (error) {
      ElMessage.error(handleErrorMessage(error, '设备数据导出失败'));
      logger.error('设备数据导出失败', error);
      throw error;
    } finally {
      operationLoading.value.export = false;
    }
  }

  /**
   * 重置筛选条件
   * @description: 清空所有筛选条件并重置到第一页
   * @returns {void}
   */
  function resetFilters() {
    searchKeyword.value = '';
    filterType.value = '';
    filterStatus.value = '';
    currentPage.value = 1;
  }

  /**
   * 获取设备类型名称
   * @description: 根据设备类型代码获取对应的类型名称
   * @param {string} type - 设备类型代码
   * @returns {string} 设备类型名称，未找到返回"未知类型"
   */
  function getDeviceTypeName(type) {
    const deviceType = deviceTypes.value.find((t) => t.value === type);
    return deviceType?.label || '未知类型';
  }

  return {
    // 状态
    devices,
    loading,
    currentPage,
    pageSize,
    total,
    searchKeyword,
    filterType,
    filterStatus,
    currentDevice,
    detailLoading,
    deviceTypes,
    typesLoading,
    cities,
    districts,
    locations,
    citiesLoading,
    districtsLoading,
    locationsLoading,
    operationLoading,

    // 计算属性
    filteredDevices,
    paginatedDevices,

    // 方法
    loadDevices,
    loadDeviceTypes,
    loadDeviceDetail,
    loadCities,
    loadDistricts,
    loadLocations,
    createDevice,
    updateDevice,
    deleteDevice,
    batchDeleteDevices,
    updateDeviceStatus,
    exportDevices,
    resetFilters,
    resetLocationData,
    getDeviceTypeName,
    getCityName,
    getDistrictName,
    getLocationName,
    getFullLocation,
  };
});
