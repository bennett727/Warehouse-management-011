import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('AdministrativeDivisionApi');

const BASE_URL = '/system/divisions';

/**
 * 获取行政区划树形数据
 * @param {Object} params - 查询参数
 * @param {number} params.level - 级别筛选
 * @param {number} params.parentId - 父级ID
 */
export function getDivisionTree(params = {}) {
  return request({
    url: `${BASE_URL}/tree`,
    method: 'get',
    params,
  });
}

/**
 * 获取所有省份
 */
export function getProvinces() {
  return request({
    url: `${BASE_URL}/provinces`,
    method: 'get',
  });
}

/**
 * 根据省份获取城市
 * @param {number} provinceId - 省份ID
 */
export function getCitiesByProvince(provinceId) {
  return request({
    url: `${BASE_URL}/cities`,
    method: 'get',
    params: { provinceId },
  });
}

/**
 * 根据城市获取区县
 * @param {number} cityId - 城市ID
 */
export function getDistrictsByCity(cityId) {
  return request({
    url: `${BASE_URL}/districts`,
    method: 'get',
    params: { cityId },
  });
}

/**
 * 根据ID获取行政区划详情
 * @param {number} id - 行政区划ID
 */
export function getDivisionById(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get',
  });
}

/**
 * 根据编码获取行政区划
 * @param {string} code - 行政区划编码
 */
export function getDivisionByCode(code) {
  return request({
    url: `${BASE_URL}/code/${code}`,
    method: 'get',
  });
}

/**
 * 创建行政区划
 * @param {Object} data - 行政区划数据
 */
export function createDivision(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data,
  });
}

/**
 * 更新行政区划
 * @param {number} id - 行政区划ID
 * @param {Object} data - 行政区划数据
 */
export function updateDivision(id, data) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'put',
    data,
  });
}

/**
 * 删除行政区划
 * @param {number} id - 行政区划ID
 */
export function deleteDivision(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
  });
}

/**
 * 获取行政区划统计信息
 */
export function getDivisionStatistics() {
  return request({
    url: `${BASE_URL}/statistics`,
    method: 'get',
  });
}

/**
 * 批量导入行政区划
 * @param {Array} data - 行政区划数据列表
 */
export function batchImportDivisions(data) {
  return request({
    url: `${BASE_URL}/batch-import`,
    method: 'post',
    data,
  });
}

/**
 * 获取级联信息（省市区完整信息）
 * @param {number} provinceId - 省份ID
 * @param {number} cityId - 城市ID
 * @param {number} districtId - 区县ID
 */
export function getCascadeInfo(provinceId, cityId, districtId) {
  return request({
    url: `${BASE_URL}/cascade/${provinceId}/${cityId}/${districtId}`,
    method: 'get',
  });
}

/**
 * 获取省市区三级联动选择器数据
 * 用于表单中的地址选择
 */
export async function getAddressOptions() {
  try {
    const provincesRes = await getProvinces();
    if (provincesRes.code !== 200 && !provincesRes.success) {
      return [];
    }

    const provinces = provincesRes.data || [];
    const options = [];

    for (const province of provinces) {
      const provinceOption = {
        value: province.id,
        label: province.name,
        code: province.code,
        children: [],
      };

      const citiesRes = await getCitiesByProvince(province.id);
      if (citiesRes.code === 200 || citiesRes.success) {
        const cities = citiesRes.data || [];

        for (const city of cities) {
          const cityOption = {
            value: city.id,
            label: city.name,
            code: city.code,
            children: [],
          };

          const districtsRes = await getDistrictsByCity(city.id);
          if (districtsRes.code === 200 || districtsRes.success) {
            const districts = districtsRes.data || [];
            cityOption.children = districts.map((district) => ({
              value: district.id,
              label: district.name,
              code: district.code,
            }));
          }

          provinceOption.children.push(cityOption);
        }
      }

      options.push(provinceOption);
    }

    return options;
  } catch (error) {
    logger.error('获取地址选项失败', error);
    return [];
  }
}

// 别名导出，用于兼容不同组件的调用方式
export { getCitiesByProvince as getCities, getDistrictsByCity as getDistricts };
