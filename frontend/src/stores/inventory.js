import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useDeviceStore } from './device.js';

import { getDeviceTypes } from '@/api/device/device-type';
import { createInboundOrder } from '@/api/inventory/inbound.js';
import { createOutboundOrder } from '@/api/inventory/outbound.js';
import { getAllAreas } from '@/api/system/area';
import { PAGINATION } from '@/constants';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('inventory');

/**
 * 库存管理Store
 * 负责管理设备库存相关的状态和操作
 * 注意：设备数据统一从deviceStore获取，避免数据重复
 */
export const useInventoryStore = defineStore('inventory', () => {
  const deviceStore = useDeviceStore();

  // 状态 - 从deviceStore引用设备数据，避免重复存储
  const deviceTypes = ref([]);
  const locations = ref([]);
  const loading = ref(false);
  const searchParams = ref({});

  // 分页信息
  const pagination = ref({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  /**
   * 设备类型映射
   * @returns {Object} 设备ID到设备类型名称的映射
   */
  const deviceTypeMap = computed(() => {
    return deviceTypes.value.reduce((map, type) => {
      map[type.id] = type.name || type.typeName;
      return map;
    }, {});
  });

  /**
   * 位置映射
   * @returns {Object} 位置ID到位置名称的映射
   */
  const locationMap = computed(() => {
    return locations.value.reduce((map, location) => {
      const fullLocation = [location.city, location.district, location.location].filter(Boolean).join('-');
      map[location.id] = fullLocation;
      return map;
    }, {});
  });

  /**
   * 设备列表 - 从deviceStore引用
   * @returns {Array} 设备列表
   */
  const devices = computed(() => deviceStore.devices.value);

  /**
   * 分页后的设备列表
   * @returns {Array} 设备列表
   */
  const paginatedDevices = computed(() => {
    return deviceStore.devices.value;
  });

  /**
   * 加载设备类型
   * @throws {Error} 加载失败时抛出错误
   */
  const loadDeviceTypes = async () => {
    try {
      const response = await getDeviceTypes();
      if (response.code === 200 && response.data) {
        // 确保 response.data 是数组
        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data.records || response.data.list || [];
        deviceTypes.value = dataArray.map((type) => ({
          id: type.id,
          name: type.name || type.typeName,
          code: type.code,
        }));
      } else {
        deviceTypes.value = [];
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        logger.error('加载设备类型失败', error);
      }
      deviceTypes.value = [];
    }
  };

  /**
   * 加载位置列表
   * @throws {Error} 加载失败时抛出错误
   */
  const loadLocations = async () => {
    try {
      const response = await getAllAreas();
      locations.value = response.data || [];
    } catch (error) {
      logger.error('加载位置列表失败', error);
      throw error;
    }
  };

  /**
   * 搜索设备 - 委托给deviceStore
   * @param {Object} params - 搜索参数
   * @throws {Error} 搜索失败时抛出错误
   */
  const searchDevices = async (params) => {
    try {
      searchParams.value = params;
      pagination.value.currentPage = 1;
      await deviceStore.loadDevices(params);
    } catch (error) {
      logger.error('搜索设备失败', error);
      throw error;
    }
  };

  /**
   * 执行设备入库操作
   * @param {Object} data - 入库数据
   * @throws {Error} 入库失败时抛出错误
   */
  const executeStockIn = async (data) => {
    try {
      loading.value = true;
      await createInboundOrder(data);
      await deviceStore.loadDevices();
    } catch (error) {
      logger.error('入库失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 执行设备出库操作
   * @param {Object} data - 出库数据
   * @throws {Error} 出库失败时抛出错误
   */
  const executeStockOut = async (data) => {
    try {
      loading.value = true;
      await createOutboundOrder(data);
      await deviceStore.loadDevices();
    } catch (error) {
      logger.error('出库失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 执行删除设备操作 - 委托给deviceStore
   * @param {number|string} id - 设备ID
   * @throws {Error} 删除失败时抛出错误
   */
  const executeDeleteDevice = async (id) => {
    try {
      loading.value = true;
      await deviceStore.deleteDevice(id);
    } catch (error) {
      logger.error('删除设备失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 初始化库存管理
   * 加载设备类型、位置列表和设备列表
   * @throws {Error} 初始化失败时抛出错误
   */
  const init = async () => {
    try {
      await Promise.all([loadDeviceTypes(), loadLocations()]);
      await deviceStore.loadDevices();
    } catch (error) {
      logger.error('初始化库存管理失败', error);
      throw error;
    }
  };

  // 返回状态和方法
  return {
    // 状态
    devices,
    deviceTypes,
    locations,
    loading,
    searchParams,
    pagination,

    // 计算属性
    deviceTypeMap,
    locationMap,
    paginatedDevices,

    // 方法
    loadDeviceTypes,
    loadLocations,
    searchDevices,
    stockIn: executeStockIn,
    stockOut: executeStockOut,
    deleteDevice: executeDeleteDevice,
    init,
  };
});
