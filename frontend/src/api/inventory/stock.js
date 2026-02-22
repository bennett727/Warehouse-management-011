import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取库存列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getStockList = (params = {}) => {
  return request({
    url: SYSTEM_API.INVENTORY_STOCK_LIST || '/inventory/stock',
    method: 'get',
    params,
  });
};

/**
 * 获取库存详情
 * @param {string} id - 库存ID
 * @returns {Promise}
 */
export const getStockDetail = (id) => {
  return request({
    url: SYSTEM_API.INVENTORY_STOCK_DETAIL?.(id) || `/inventory/stock/${id}`,
    method: 'get',
  });
};

/**
 * 生成盘点单号
 * @returns {Promise}
 */
export const generateStockCountNo = () => {
  return request({
    url: SYSTEM_API.GENERATE_STOCK_COUNT_NO || '/inventory/stock/count-no',
    method: 'get',
  });
};

/**
 * 更新库存
 * @param {string} id - 库存ID
 * @param {Object} data - 库存数据
 * @returns {Promise}
 */
export const updateStock = (id, data) => {
  return request({
    url: SYSTEM_API.INVENTORY_STOCK_UPDATE?.(id) || `/inventory/stock/${id}`,
    method: 'put',
    data,
  });
};
