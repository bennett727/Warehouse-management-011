/**
 * 搜索模块注册配置
 * 集中注册所有业务模块的搜索功能
 */

import { createLogger } from './logger';
import { registerSearchModule } from './searchRegistry';

import { searchWarehouses, searchZones, searchBins, searchDevices } from '@/api/search';

const logger = createLogger('SearchModules');

/**
 * 注册仓库搜索模块
 */
export function registerWarehouseSearch() {
  registerSearchModule('warehouse', {
    name: 'warehouse',
    label: '仓库',
    icon: 'House',
    itemIcon: 'OfficeBuilding',
    route: '/warehouse',
    priority: 100,
    searchFn: searchWarehouses,
    transformFn: (item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.address || item.code || '',
      tags: [item.status === 'active' ? '启用' : '停用', `面积: ${item.totalArea || 0}m²`],
      type: 'warehouse',
      data: item,
    }),
  });
}

/**
 * 注册功能区搜索模块
 */
export function registerZoneSearch() {
  registerSearchModule('zone', {
    name: 'zone',
    label: '功能区',
    icon: 'Grid',
    itemIcon: 'MapLocation',
    route: '/warehouse/zone',
    priority: 90,
    searchFn: searchZones,
    transformFn: (item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.warehouseName || ''} - ${item.typeName || ''}`,
      tags: [item.typeName, `容量: ${item.capacity || 0}`],
      type: 'zone',
      data: item,
    }),
  });
}

/**
 * 注册货位搜索模块
 */
export function registerBinSearch() {
  registerSearchModule('bin', {
    name: 'bin',
    label: '货位',
    icon: 'Box',
    itemIcon: 'FirstAidKit',
    route: '/inventory-management/bin',
    priority: 80,
    searchFn: searchBins,
    transformFn: (item) => ({
      id: item.id,
      title: item.code,
      subtitle: `${item.warehouseName || ''} - ${item.zoneName || ''}`,
      tags: [item.status === 'occupied' ? '占用' : '空闲', item.zoneTypeName || ''],
      type: 'bin',
      data: item,
    }),
  });
}

/**
 * 注册设备搜索模块
 */
export function registerDeviceSearch() {
  registerSearchModule('device', {
    name: 'device',
    label: '设备',
    icon: 'Cpu',
    itemIcon: 'Monitor',
    route: '/device/list',
    priority: 70,
    searchFn: searchDevices,
    transformFn: (item) => ({
      id: item.id,
      title: item.name || item.deviceCode,
      subtitle: `${item.deviceTypeName || ''} - ${item.statusName || ''}`,
      tags: [item.deviceTypeName, item.statusName],
      type: 'device',
      data: item,
    }),
  });
}

/**
 * 注册所有搜索模块
 */
export function registerAllSearchModules() {
  registerWarehouseSearch();
  registerZoneSearch();
  registerBinSearch();
  registerDeviceSearch();

  logger.debug('所有搜索模块已注册');
}

/**
 * 根据用户权限注册搜索模块
 * @param {Array<string>} permissions - 用户权限列表
 */
export function registerSearchModulesByPermission(permissions = []) {
  const modulePermissions = {
    warehouse: 'warehouse:view',
    zone: 'zone:view',
    bin: 'bin:view',
    device: 'device:view',
  };

  Object.entries(modulePermissions).forEach(([moduleName, permission]) => {
    if (permissions.includes(permission) || permissions.includes('admin')) {
      switch (moduleName) {
        case 'warehouse':
          registerWarehouseSearch();
          break;
        case 'zone':
          registerZoneSearch();
          break;
        case 'bin':
          registerBinSearch();
          break;
        case 'device':
          registerDeviceSearch();
          break;
      }
    }
  });

  logger.debug('根据权限注册搜索模块完成');
}

export default {
  registerWarehouseSearch,
  registerZoneSearch,
  registerBinSearch,
  registerDeviceSearch,
  registerAllSearchModules,
  registerSearchModulesByPermission,
};
