/**
 * 数据处理Web Worker
 * @file: dataProcessor.worker.js
 * @description: 在后台线程执行复杂数据处理任务，避免阻塞主线程
 */

// 消息处理器映射
const handlers = {
  /**
   * 大数据量排序
   * @param {Object} data - 包含items和sortConfig的数据对象
   * @returns {Array} 排序后的数组
   */
  sort: (data) => {
    const { items, sortConfig } = data;
    const { key, order = 'ascending' } = sortConfig;

    const sorted = [...items].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // 处理null/undefined
      if (aVal === null || aVal === undefined) {
        aVal = '';
      }
      if (bVal === null || bVal === undefined) {
        bVal = '';
      }

      // 日期比较
      if (aVal instanceof Date && bVal instanceof Date) {
        return order === 'ascending' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }

      // 数字比较
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'ascending' ? aVal - bVal : bVal - aVal;
      }

      // 字符串比较
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (order === 'ascending') {
        if (aStr < bStr) {
          return -1;
        }
        if (aStr > bStr) {
          return 1;
        }
        return 0;
      }
      if (aStr > bStr) {
        return -1;
      }
      if (aStr < bStr) {
        return 1;
      }
      return 0;
    });

    return sorted;
  },

  /**
   * 数据筛选
   * @param {Object} data - 包含items和filters的数据对象
   * @returns {Array} 筛选后的数组
   */
  filter: (data) => {
    const { items, filters } = data;

    return items.filter((item) => {
      return filters.every((filter) => {
        const { key, value, operator = 'eq' } = filter;
        const itemValue = item[key];

        switch (operator) {
          case 'eq':
            return itemValue === value;
          case 'ne':
            return itemValue !== value;
          case 'gt':
            return itemValue > value;
          case 'gte':
            return itemValue >= value;
          case 'lt':
            return itemValue < value;
          case 'lte':
            return itemValue <= value;
          case 'contains':
            return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
          case 'startsWith':
            return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase());
          case 'in':
            return Array.isArray(value) && value.includes(itemValue);
          case 'between':
            return Array.isArray(value) && itemValue >= value[0] && itemValue <= value[1];
          default:
            return true;
        }
      });
    });
  },

  /**
   * 数据分组聚合
   * @param {Object} data - 包含items、groupKey和aggregations的数据对象
   * @returns {Array} 分组聚合后的数组
   */
  groupBy: (data) => {
    const { items, groupKey, aggregations = [] } = data;
    const groups = new Map();

    // 分组
    items.forEach((item) => {
      const key = item[groupKey];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(item);
    });

    // 聚合计算
    const result = [];
    groups.forEach((groupItems, key) => {
      const group = {
        [groupKey]: key,
        count: groupItems.length,
      };

      aggregations.forEach((agg) => {
        const { field, type, alias } = agg;
        const values = groupItems.map((item) => item[field]).filter((v) => v !== null && v !== undefined);

        switch (type) {
          case 'sum':
            group[alias || `${field}_sum`] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            group[alias || `${field}_avg`] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'max':
            group[alias || `${field}_max`] = values.length > 0 ? Math.max(...values) : null;
            break;
          case 'min':
            group[alias || `${field}_min`] = values.length > 0 ? Math.min(...values) : null;
            break;
          case 'count':
            group[alias || `${field}_count`] = values.length;
            break;
          default:
            break;
        }
      });

      result.push(group);
    });

    return result;
  },

  /**
   * 数据去重
   * @param {Object} data - 包含items和key的数据对象
   * @returns {Array} 去重后的数组
   */
  unique: (data) => {
    const { items, key } = data;
    const seen = new Set();

    return items.filter((item) => {
      const value = key ? item[key] : JSON.stringify(item);
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  /**
   * 数据转换/映射
   * @param {Object} data - 包含items和mappings的数据对象
   * @returns {Array} 转换后的数组
   */
  transform: (data) => {
    const { items, mappings } = data;

    return items.map((item) => {
      const transformed = { ...item };

      mappings.forEach((mapping) => {
        const { from, to, transform } = mapping;
        let value = item[from];

        if (transform) {
          switch (transform) {
            case 'uppercase':
              value = String(value).toUpperCase();
              break;
            case 'lowercase':
              value = String(value).toLowerCase();
              break;
            case 'date':
              value = value ? new Date(value).toISOString() : null;
              break;
            case 'number':
              value = Number(value) || 0;
              break;
            case 'boolean':
              value = Boolean(value);
              break;
            default:
              if (typeof transform === 'function') {
                // 注意：Worker中无法传递函数，这里仅作占位
                // 保持原始值不变
              }
              break;
          }
        }

        transformed[to] = value;
      });

      return transformed;
    });
  },

  /**
   * 复杂查询（组合筛选、排序、分页）
   * @param {Object} data - 查询参数
   * @returns {Object} 包含data和total的结果对象
   */
  query: (data) => {
    const { items, filters, sort, pagination } = data;
    let result = [...items];

    // 筛选
    if (filters && filters.length > 0) {
      result = handlers.filter({ items: result, filters });
    }

    const total = result.length;

    // 排序
    if (sort && sort.key) {
      result = handlers.sort({ items: result, sortConfig: sort });
    }

    // 分页
    if (pagination) {
      const { page = 1, pageSize = 10 } = pagination;
      const start = (page - 1) * pageSize;
      result = result.slice(start, start + pageSize);
    }

    return { data: result, total };
  },

  /**
   * 统计分析
   * @param {Object} data - 包含items和stats的数据对象
   * @returns {Object} 统计结果
   */
  statistics: (data) => {
    const { items, stats } = data;
    const result = {};

    stats.forEach((stat) => {
      const { field, type } = stat;
      const values = items.map((item) => item[field]).filter((v) => typeof v === 'number');

      if (values.length === 0) {
        result[field] = null;
        return;
      }

      switch (type) {
        case 'sum':
          result[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[field] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'max':
          result[field] = Math.max(...values);
          break;
        case 'min':
          result[field] = Math.min(...values);
          break;
        case 'median': {
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          result[field] = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          break;
        }
        case 'std': {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
          result[field] = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
          break;
        }
        default:
          break;
      }
    });

    return result;
  },

  /**
   * 搜索高亮
   * @param {Object} data - 包含items、keyword和fields的数据对象
   * @returns {Array} 带高亮标记的结果
   */
  search: (data) => {
    const { items, keyword, fields } = data;
    const lowerKeyword = keyword.toLowerCase();

    return items
      .map((item) => {
        let score = 0;
        const highlighted = { ...item };

        fields.forEach((field) => {
          const value = String(item[field] || '').toLowerCase();
          const index = value.indexOf(lowerKeyword);

          if (index !== -1) {
            score += 1;
            // 前缀匹配加分
            if (index === 0) {
              score += 0.5;
            }
            // 完全匹配加分
            if (value === lowerKeyword) {
              score += 1;
            }

            // 添加高亮标记
            const originalValue = String(item[field]);
            highlighted[`${field}_highlighted`] = originalValue.replace(
              new RegExp(`(${escapeRegExp(keyword)})`, 'gi'),
              '<mark>$1</mark>'
            );
          }
        });

        return { ...highlighted, _score: score };
      })
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score);
  },
};

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 处理消息
 */
self.onmessage = function (e) {
  const { id, type, data } = e.data;

  try {
    const startTime = performance.now();

    if (!handlers[type]) {
      throw new Error(`Unknown handler type: ${type}`);
    }

    const result = handlers[type](data);
    const duration = performance.now() - startTime;

    self.postMessage({
      id,
      success: true,
      result,
      duration,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
    });
  }
};

/**
 * 心跳检测，保持Worker活跃
 */
setInterval(() => {
  self.postMessage({ type: 'ping' });
}, 30000);
