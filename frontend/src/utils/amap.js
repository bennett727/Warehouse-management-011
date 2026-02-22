/**
 * 高德地图工具类
 * 用于加载地图SDK和提供地图相关功能
 */
import { createLogger } from './logger';

const logger = createLogger('AMap');

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '';
const AMAP_SECURITY_CONFIG = import.meta.env.VITE_AMAP_SECURITY_CONFIG || '';

// 默认地图配置
const DEFAULT_CONFIG = {
  zoom: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 11,
  center: [
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_LNG) || 113.2644,
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT) || 23.1291,
  ],
};

// 加载状态
let isLoading = false;
let isLoaded = false;
let loadCallbacks = [];

/**
 * 检查高德地图是否可用
 * @returns {boolean}
 */
export const isAMapAvailable = () => {
  // 检查是否有配置Key
  if (!AMAP_KEY || AMAP_KEY === 'your_amap_key_here') {
    return false;
  }
  return true;
};

/**
 * 加载高德地图JavaScript API
 * @returns {Promise<void>}
 */
export const loadAMap = () => {
  return new Promise((resolve, reject) => {
    // 如果已经加载完成，直接返回
    if (isLoaded && window.AMap) {
      resolve(window.AMap);
      return;
    }

    // 添加到回调队列
    loadCallbacks.push({ resolve, reject });

    // 如果正在加载中，等待回调
    if (isLoading) {
      return;
    }

    isLoading = true;

    // 配置安全密钥
    if (AMAP_SECURITY_CONFIG && window) {
      window._AMapSecurityConfig = {
        securityJsCode: AMAP_SECURITY_CONFIG,
      };
    }

    // 创建script标签加载地图
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=initAMap`;

    // 全局回调函数
    window.initAMap = () => {
      isLoaded = true;
      isLoading = false;

      // 执行所有等待的回调
      loadCallbacks.forEach(({ resolve }) => {
        resolve(window.AMap);
      });
      loadCallbacks = [];
    };

    script.onerror = (_error) => {
      isLoading = false;
      const errorMsg = '高德地图加载失败';

      // 执行所有等待的回调
      loadCallbacks.forEach(({ reject }) => {
        reject(new Error(errorMsg));
      });
      loadCallbacks = [];
    };

    document.head.appendChild(script);
  });
};

/**
 * 创建地图实例
 * @param {string|HTMLElement} container - 容器ID或DOM元素
 * @param {Object} options - 地图配置选项
 * @returns {Promise<Object>} 地图实例
 */
export const createMap = async (container, options = {}) => {
  const AMap = await loadAMap();

  const mapConfig = {
    zoom: options.zoom || DEFAULT_CONFIG.zoom,
    center: options.center || DEFAULT_CONFIG.center,
    viewMode: options.viewMode || '2D',
    ...options,
  };

  const map = new AMap.Map(container, mapConfig);

  // 添加地图控件
  if (options.controls !== false) {
    addMapControls(map, options.controls);
  }

  return map;
};

/**
 * 添加地图控件
 * @param {Object} map - 地图实例
 * @param {Object} controls - 控件配置
 */
export const addMapControls = (map, controls = {}) => {
  const { AMap } = window;
  if (!AMap) {
    return;
  }

  const defaultControls = {
    zoom: true,
    scale: true,
    toolBar: true,
    ...controls,
  };

  // 添加缩放控件
  if (defaultControls.zoom) {
    map.addControl(new AMap.Zoom());
  }

  // 添加比例尺控件
  if (defaultControls.scale) {
    map.addControl(new AMap.Scale());
  }

  // 添加工具条控件
  if (defaultControls.toolBar) {
    map.addControl(new AMap.ToolBar());
  }
};

/**
 * 创建标记点
 * @param {Object} map - 地图实例
 * @param {Object} options - 标记点配置
 * @returns {Object} 标记点实例
 */
export const createMarker = (map, options = {}) => {
  const { AMap } = window;
  if (!AMap) {
    return null;
  }

  const markerConfig = {
    position: options.position,
    title: options.title || '',
    ...options,
  };

  const marker = new AMap.Marker(markerConfig);
  map.add(marker);

  // 添加点击事件
  if (options.onClick) {
    marker.on('click', options.onClick);
  }

  return marker;
};

/**
 * 创建信息窗体
 * @param {Object} options - 信息窗体配置
 * @returns {Object} 信息窗体实例
 */
export const createInfoWindow = (options = {}) => {
  const { AMap } = window;
  if (!AMap) {
    return null;
  }

  const infoWindowConfig = {
    content: options.content || '',
    offset: options.offset || new AMap.Pixel(0, -30),
    ...options,
  };

  return new AMap.InfoWindow(infoWindowConfig);
};

/**
 * 地址解析（地址转坐标）
 * @param {string} address - 地址
 * @returns {Promise<Object>} 解析结果
 */
export const geocode = (address) => {
  return loadAMap().then((AMap) => {
    return new Promise((resolve, reject) => {
      AMap.plugin(['AMap.Geocoder'], () => {
        const geocoder = new AMap.Geocoder();

        geocoder.getLocation(address, (status, result) => {
          if (status === 'complete' && result.geocodes.length) {
            const lnglat = result.geocodes[0].location;
            resolve({
              lng: lnglat.lng,
              lat: lnglat.lat,
              address: result.geocodes[0].formattedAddress,
            });
          } else {
            reject(new Error('地址解析失败'));
          }
        });
      });
    });
  });
};

/**
 * 逆地址解析（坐标转地址）
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {Promise<Object>} 解析结果
 */
export const reverseGeocode = (lng, lat) => {
  return loadAMap().then((AMap) => {
    return new Promise((resolve, reject) => {
      AMap.plugin(['AMap.Geocoder'], () => {
        const geocoder = new AMap.Geocoder();

        geocoder.getAddress([lng, lat], (status, result) => {
          if (status === 'complete' && result.regeocode) {
            resolve({
              address: result.regeocode.formattedAddress,
              province: result.regeocode.addressComponent.province,
              city: result.regeocode.addressComponent.city,
              district: result.regeocode.addressComponent.district,
              street: result.regeocode.addressComponent.street,
              streetNumber: result.regeocode.addressComponent.streetNumber,
            });
          } else {
            reject(new Error('逆地址解析失败'));
          }
        });
      });
    });
  });
};

/**
 * 设置地图中心点和缩放级别
 * @param {Object} map - 地图实例
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @param {number} zoom - 缩放级别
 */
export const setMapCenter = (map, lng, lat, zoom) => {
  if (!map) {
    return;
  }

  map.setCenter([lng, lat]);
  if (zoom) {
    map.setZoom(zoom);
  }
};

/**
 * 添加仓库标记
 * @param {Object} map - 地图实例
 * @param {Object} warehouse - 仓库信息
 * @param {Function} onClick - 点击回调
 * @returns {Object} 标记点实例
 */
export const addWarehouseMarker = (map, warehouse, onClick) => {
  if (!warehouse.longitude || !warehouse.latitude) {
    logger.warn('仓库没有位置信息', warehouse.warehouseName);
    return null;
  }

  const content = `
    <div class="warehouse-marker">
      <div class="marker-icon">
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="#409EFF" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="marker-label">${warehouse.warehouseName}</div>
    </div>
  `;

  return createMarker(map, {
    position: [warehouse.longitude, warehouse.latitude],
    title: warehouse.warehouseName,
    content,
    anchor: 'bottom-center',
    onClick: () => {
      if (onClick) {
        onClick(warehouse);
      }
    },
  });
};

/**
 * 销毁地图实例
 * @param {Object} map - 地图实例
 */
export const destroyMap = (map) => {
  if (map) {
    map.destroy();
  }
};

export default {
  loadAMap,
  createMap,
  createMarker,
  createInfoWindow,
  geocode,
  reverseGeocode,
  setMapCenter,
  addWarehouseMarker,
  destroyMap,
};
