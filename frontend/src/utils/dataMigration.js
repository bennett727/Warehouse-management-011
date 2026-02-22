/**
 * 数据迁移工具
 * 用于处理行政区划数据的历史数据整理和迁移
 */

import { createLogger } from './logger';

const logger = createLogger('DataMigration');

/**
 * 数据迁移配置
 */
const MIGRATION_CONFIG = {
  // 版本号
  version: '1.0.0',
  // 存储键名
  storageKey: 'data_migration_status',
  // 批量处理大小
  batchSize: 100,
};

/**
 * 迁移状态管理
 */
class MigrationStatus {
  constructor() {
    this.status = this.loadStatus();
  }

  loadStatus() {
    try {
      const stored = localStorage.getItem(MIGRATION_CONFIG.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('加载迁移状态失败:', error);
      return {};
    }
  }

  saveStatus() {
    try {
      localStorage.setItem(MIGRATION_CONFIG.storageKey, JSON.stringify(this.status));
    } catch (error) {
      logger.error('保存迁移状态失败:', error);
    }
  }

  isMigrated(migrationId) {
    return this.status[migrationId] === true;
  }

  markAsMigrated(migrationId) {
    this.status[migrationId] = true;
    this.saveStatus();
  }

  reset() {
    this.status = {};
    this.saveStatus();
  }
}

const migrationStatus = new MigrationStatus();

/**
 * 数据验证器
 */
export const DataValidator = {
  /**
   * 验证行政区划数据
   */
  validateDivision(division) {
    const errors = [];

    if (!division.name || division.name.trim().length < 2) {
      errors.push('区划名称不能为空且至少2个字符');
    }

    if (!division.code || !/^\d{6,12}$/.test(division.code)) {
      errors.push('区划编码必须是6-12位数字');
    }

    if (![1, 2, 3].includes(division.level)) {
      errors.push('区划等级必须是1(省)、2(市)或3(区)');
    }

    // 市级和区级必须有上级
    if (division.level > 1 && !division.parentId) {
      errors.push('市级和区级区划必须指定上级');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 验证仓库数据
   */
  validateWarehouse(warehouse) {
    const errors = [];

    if (!warehouse.warehouseCode || warehouse.warehouseCode.trim().length < 2) {
      errors.push('仓库编码不能为空且至少2个字符');
    }

    if (!warehouse.warehouseName || warehouse.warehouseName.trim().length < 2) {
      errors.push('仓库名称不能为空且至少2个字符');
    }

    if (!warehouse.provinceId) {
      errors.push('必须选择省份');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 批量验证
   */
  validateBatch(items, validator) {
    const results = {
      valid: [],
      invalid: [],
      total: items.length,
    };

    items.forEach((item, index) => {
      const result = validator(item);
      if (result.valid) {
        results.valid.push(item);
      } else {
        results.invalid.push({
          index,
          item,
          errors: result.errors,
        });
      }
    });

    return results;
  },
};

/**
 * 数据转换器
 */
export const DataTransformer = {
  /**
   * 转换旧版行政区划数据
   */
  transformOldDivision(oldData) {
    return {
      id: oldData.id,
      name: oldData.name || oldData.divisionName,
      code: oldData.code || oldData.divisionCode,
      level: oldData.level,
      parentId: oldData.parentId,
      zipCode: oldData.zipCode || '',
      areaCode: oldData.areaCode || '',
      remark: oldData.remark || '',
      status: oldData.status ?? 1,
      createTime: oldData.createTime,
      updateTime: oldData.updateTime,
    };
  },

  /**
   * 转换旧版仓库数据
   */
  transformOldWarehouse(oldData) {
    return {
      id: oldData.id,
      warehouseCode: oldData.warehouseCode || oldData.code,
      warehouseName: oldData.warehouseName || oldData.name,
      warehouseType: oldData.warehouseType || 1,
      status: oldData.status ?? 1,
      provinceId: oldData.provinceId,
      cityId: oldData.cityId,
      districtId: oldData.districtId,
      detailAddress: oldData.detailAddress || oldData.address,
      longitude: oldData.longitude,
      latitude: oldData.latitude,
      contactPerson: oldData.contactPerson,
      contactPhone: oldData.contactPhone,
      areaSize: oldData.areaSize,
      capacity: oldData.capacity,
    };
  },

  /**
   * 标准化地址数据
   */
  normalizeAddress(address) {
    if (!address) {
      return '';
    }

    return address
      .replace(/[省市区县]/g, '')
      .replace(/\s+/g, '')
      .trim();
  },

  /**
   * 提取行政区划信息
   */
  extractDivisionInfo(address) {
    const patterns = {
      province: /([\u4e00-\u9fa5]{2,}(?:省|自治区|直辖市|特别行政区))/,
      city: /([\u4e00-\u9fa5]{2,}(?:市|自治州|地区|盟))/,
      district: /([\u4e00-\u9fa5]{2,}(?:区|县|市|旗))/,
    };

    const result = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = address.match(pattern);
      result[key] = match ? match[1] : null;
    }

    return result;
  },
};

/**
 * 数据迁移器
 */
export const DataMigrator = {
  /**
   * 迁移行政区划数据
   */
  async migrateDivisions(oldDivisions, api) {
    const migrationId = 'divisions_v1';

    if (migrationStatus.isMigrated(migrationId)) {
      logger.info('行政区划数据已迁移，跳过');
      return { skipped: true };
    }

    logger.info('开始迁移行政区划数据，共', oldDivisions.length, '条');

    // 转换数据
    const transformed = oldDivisions.map(DataTransformer.transformOldDivision);

    // 验证数据
    const validation = DataValidator.validateBatch(transformed, DataValidator.validateDivision);

    if (validation.invalid.length > 0) {
      logger.warn('数据验证失败:', validation.invalid);
      return {
        success: false,
        errors: validation.invalid,
        message: `有 ${validation.invalid.length} 条数据验证失败`,
      };
    }

    // 批量导入
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // 分批处理
    for (let i = 0; i < validation.valid.length; i += MIGRATION_CONFIG.batchSize) {
      const batch = validation.valid.slice(i, i + MIGRATION_CONFIG.batchSize);

      try {
        const res = await api(batch);
        if (res.code === 200) {
          results.success += batch.length;
        } else {
          results.failed += batch.length;
          results.errors.push({ batch: i, message: res.message });
        }
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({ batch: i, error: error.message });
      }

      // 报告进度
      const progress = Math.round(((i + batch.length) / validation.valid.length) * 100);
      logger.info(`迁移进度: ${progress}%`);
    }

    // 标记为已迁移
    if (results.failed === 0) {
      migrationStatus.markAsMigrated(migrationId);
    }

    return {
      success: results.failed === 0,
      total: validation.valid.length,
      ...results,
    };
  },

  /**
   * 修复数据关联关系
   */
  async fixRelationships(data, idMapping) {
    logger.info('开始修复数据关联关系');

    const fixed = data.map((item) => {
      const newItem = { ...item };

      // 修复parentId
      if (item.parentId && idMapping[item.parentId]) {
        newItem.parentId = idMapping[item.parentId];
      }

      // 修复其他关联字段
      if (item.provinceId && idMapping[item.provinceId]) {
        newItem.provinceId = idMapping[item.provinceId];
      }
      if (item.cityId && idMapping[item.cityId]) {
        newItem.cityId = idMapping[item.cityId];
      }
      if (item.districtId && idMapping[item.districtId]) {
        newItem.districtId = idMapping[item.districtId];
      }

      return newItem;
    });

    logger.info('关联关系修复完成');
    return fixed;
  },

  /**
   * 清理重复数据
   */
  async deduplicate(data, keyField) {
    logger.info('开始清理重复数据');

    if (!Array.isArray(data)) {
      return { unique: [], duplicates: [], removedCount: 0 };
    }

    const seen = new Map();
    const duplicates = [];

    const unique = data.filter((item) => {
      const key = item[keyField];
      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: item });
        return false;
      }
      seen.set(key, item);
      return true;
    });

    logger.info(`清理完成，发现 ${duplicates.length} 条重复数据`);

    return {
      unique,
      duplicates,
      removedCount: duplicates.length,
    };
  },

  /**
   * 导出迁移报告
   */
  exportReport(results) {
    const report = {
      version: MIGRATION_CONFIG.version,
      timestamp: new Date().toISOString(),
      results,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `migration-report-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    logger.info('迁移报告已导出');
  },
};

/**
 * 历史数据整理工具
 */
export const DataCleanup = {
  /**
   * 清理无效数据
   */
  cleanupInvalidData(data, validator) {
    const valid = [];
    const invalid = [];

    data.forEach((item) => {
      const result = validator(item);
      if (result.valid) {
        valid.push(item);
      } else {
        invalid.push({ item, errors: result.errors });
      }
    });

    return { valid, invalid };
  },

  /**
   * 填充缺失数据
   */
  fillMissingData(data, defaults) {
    return data.map((item) => ({
      ...defaults,
      ...item,
    }));
  },

  /**
   * 标准化数据格式
   */
  standardizeData(data, schema) {
    return data.map((item) => {
      const standardized = {};

      for (const [key, config] of Object.entries(schema)) {
        let value = item[config.source || key];

        // 应用默认值
        if (value === undefined || value === null) {
          value = config.default;
        }

        // 应用转换函数
        if (config.transform && value !== undefined) {
          value = config.transform(value);
        }

        // 验证值
        if (config.validate && !config.validate(value)) {
          logger.warn(`字段 ${key} 验证失败:`, value);
        }

        standardized[key] = value;
      }

      return standardized;
    });
  },
};

/**
 * 批量导入导出工具
 */
export const BatchOperations = {
  /**
   * 导出为JSON
   */
  exportToJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `export-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  },

  /**
   * 导出为CSV
   */
  exportToCSV(data, headers, filename) {
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // 处理包含逗号或引号的值
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([`\ufeff${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `export-${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  },

  /**
   * 解析JSON文件
   */
  async parseJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  },

  /**
   * 解析CSV文件
   */
  async parseCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter((line) => line.trim());
          const headers = lines[0].split(',').map((h) => h.trim());

          const data = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim());
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index];
            });
            return row;
          });

          resolve(data);
        } catch (error) {
          reject(new Error(`CSV解析失败: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  },
};

export default {
  DataValidator,
  DataTransformer,
  DataMigrator,
  DataCleanup,
  BatchOperations,
  migrationStatus,
};
