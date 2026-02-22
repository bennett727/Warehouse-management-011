/**
 * 筛选配置统一导出
 * @description 集中管理所有页面的筛选配置
 */

// 入库管理
export { inboundFilterConfig, defaultInboundFilter } from './inbound.config';

// 出库管理
export { outboundFilterConfig, defaultOutboundFilter } from './outbound.config';

// 维修记录
export { repairFilterConfig, defaultRepairFilter } from './repair.config';

// 配置工具函数
export const filterConfigUtils = {
  /**
   * 合并配置
   * @param {Object} baseConfig - 基础配置
   * @param {Object} overrideConfig - 覆盖配置
   * @returns {Object} 合并后的配置
   */
  merge(baseConfig, overrideConfig = {}) {
    return {
      header: { ...baseConfig.header, ...overrideConfig.header },
      fields: overrideConfig.fields || baseConfig.fields,
      buttons: { ...baseConfig.buttons, ...overrideConfig.buttons },
      behavior: { ...baseConfig.behavior, ...overrideConfig.behavior },
    };
  },

  /**
   * 创建字段
   * @param {Object} field - 字段配置
   * @returns {Object} 完整字段配置
   */
  createField(field) {
    const defaults = {
      clearable: true,
      filterable: true,
      autoSearch: false,
    };
    return { ...defaults, ...field };
  },

  /**
   * 创建默认筛选值
   * @param {Array} fields - 字段配置数组
   * @returns {Object} 默认筛选值对象
   */
  createDefaultValues(fields) {
    const defaults = {};
    fields.forEach((field) => {
      if (field.type === 'daterange' || field.multiple) {
        defaults[field.prop] = [];
      } else if (field.type === 'number') {
        defaults[field.prop] = null;
      } else {
        defaults[field.prop] = '';
      }
    });
    return defaults;
  },
};

export default filterConfigUtils;
