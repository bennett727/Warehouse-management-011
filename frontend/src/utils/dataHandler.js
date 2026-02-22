/**
 * 数据处理工具，主要用于Excel导入导出等功能
 */
import { ElMessage } from 'element-plus';
import ExcelJS from 'exceljs';

import { formatDate } from './date.js';
import { createLogger } from './logger.js';
import { handleErrorMessage } from './responseHandler.js';

const logger = createLogger('dataHandler');

/**
 * 导出数据到Excel文件
 * @param {Object[]} data - 要导出的数据数组
 * @param {string} filename - 文件名（不含扩展名）
 * @param {Object} options - 导出选项
 * @param {Object} options.headers - 表头映射，键为数据字段名，值为表头显示名称
 * @param {Object[]} options.sheets - 多工作表配置 [{name: '工作表1', data: [...], headers: {...}}]
 * @param {boolean} options.autoWidth - 是否自动调整列宽
 */
export async function exportToExcel(data, filename = 'export', options = {}) {
  try {
    const workbook = new ExcelJS.Workbook();

    if (options.sheets && options.sheets.length > 0) {
      for (const sheet of options.sheets) {
        const worksheet = createWorksheet(workbook, sheet.data, sheet.headers, options.autoWidth);
        worksheet.name = sheet.name || `Sheet${workbook.worksheets.length}`;
      }
    } else {
      const worksheet = createWorksheet(workbook, data, options.headers, options.autoWidth);
      worksheet.name = 'Sheet1';
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${formatDate(new Date(), 'YYYYMMDD_HHmmss')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    logger.error('导出Excel失败:', error);
    logger.error('错误详情:', error.message);
    logger.error('错误堆栈:', error.stack);
    ElMessage.error(handleErrorMessage(error, '导出Excel失败，请重试'));
    return false;
  }
}

/**
 * 创建工作表
 * @param {ExcelJS.Workbook} workbook - 工作簿对象
 * @param {Object[]} data - 数据数组
 * @param {Object} headers - 表头映射
 * @param {boolean} autoWidth - 是否自动调整列宽
 * @returns {ExcelJS.Worksheet} 工作表对象
 */
function createWorksheet(workbook, data, headers, autoWidth = true) {
  const worksheet = workbook.addWorksheet();

  if (!data || data.length === 0) {
    if (headers) {
      const headerKeys = Object.keys(headers);
      if (headerKeys.length > 0) {
        const headerValues = headerKeys.map((key) => headers[key]);
        const headerRow = worksheet.addRow(headerValues);
        if (headerRow && typeof headerRow === 'object') {
          try {
            headerRow.font = { bold: true };
            headerRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0E0E0' },
            };
          } catch (error) {
            logger.warn('设置表头样式失败:', error);
          }
        }
      }
    }
    return worksheet;
  }

  let exportData = [];
  if (headers) {
    exportData = data.map((item) => {
      const row = {};
      Object.keys(headers).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          row[headers[key]] = item[key];
        }
      });
      return row;
    });
  } else {
    exportData = [...data];
  }

  if (exportData.length === 0) {
    return worksheet;
  }

  const keys = Object.keys(exportData[0]);

  if (keys.length === 0) {
    return worksheet;
  }

  const headerRow = worksheet.addRow(keys);
  if (headerRow && typeof headerRow === 'object') {
    try {
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    } catch (error) {
      logger.warn('设置表头样式失败:', error);
    }
  }

  exportData.forEach((item) => {
    worksheet.addRow(keys.map((key) => item[key]));
  });

  if (autoWidth && worksheet.columns && worksheet.columns.length > 0) {
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = String(cell.value || '');
        const length = cellValue.split('').reduce((acc, char) => {
          return acc + (char.match(/[\u4e00-\u9fa5]/) ? 2 : 1);
        }, 0);
        maxLength = Math.max(maxLength, length);
      });
      column.width = Math.min(maxLength + 2, 50);
    });
  }

  return worksheet;
}

/**
 * 解析Excel文件
 * @param {File} file - Excel文件对象
 * @returns {Promise<Object[]>} 解析后的数据数组
 */
export async function parseExcel(file) {
  if (!file) {
    throw new Error('请选择文件');
  }

  const fileType = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'xls'].includes(fileType)) {
    throw new Error('请选择Excel文件');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const firstSheetName = workbook.worksheets[0].name;
    const worksheet = workbook.getWorksheet(firstSheetName);

    const jsonData = [];
    const headers = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => {
          headers.push(cell.value);
        });
      } else {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          if (headers[colNumber - 1]) {
            rowData[headers[colNumber - 1]] = cell.value;
          }
        });
        jsonData.push(rowData);
      }
    });

    return jsonData;
  } catch (error) {
    logger.error('解析Excel文件失败:', error);
    throw new Error('解析Excel文件失败，请检查文件格式');
  }
}

/**
 * 生成Excel导入模板
 * @param {string} filename - 文件名
 * @param {Object} headers - 表头映射
 * @param {Object[]} sampleData - 示例数据
 */
export async function generateImportTemplate(filename, headers, sampleData = []) {
  let templateData = [];

  if (sampleData.length > 0) {
    templateData = sampleData.map((item) => {
      const row = {};
      Object.keys(headers).forEach((key) => {
        row[headers[key]] = item[key] || '';
      });
      return row;
    });
  } else {
    templateData = [{}];
    Object.keys(headers).forEach((key) => {
      templateData[0][headers[key]] = '';
    });
  }

  await exportToExcel(templateData, `${filename}_模板`, { headers: {} });
}

/**
 * 验证导入的数据
 * @param {Object[]} data - 导入的数据
 * @param {Object} rules - 验证规则 {字段名: {required: true, message: '错误消息', validator: function}}
 * @returns {Object} {valid: boolean, errors: Object[], validData: Object[]}
 */
export function validateImportData(data, rules) {
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowErrors = [];
    let isValid = true;

    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = row[field];

      if (rule.required && !value) {
        rowErrors.push(`${field}: ${rule.message || '此字段为必填项'}`);
        isValid = false;
      }

      if (rule.validator && typeof rule.validator === 'function') {
        const validationResult = rule.validator(value, row);
        if (validationResult !== true) {
          rowErrors.push(`${field}: ${validationResult}`);
          isValid = false;
        }
      }
    });

    if (!isValid) {
      errors.push({
        rowIndex: index + 2,
        errors: rowErrors,
      });
    } else {
      validData.push(row);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validData,
  };
}

/**
 * 批量处理数据（用于大数据量的导入处理）
 * @param {Array} data - 数据数组
 * @param {Function} processFn - 处理函数
 * @param {number} batchSize - 每批处理的数量
 * @returns {Promise<Array>} 处理后的结果数组
 */
export async function processDataInBatches(data, processFn, batchSize = 50) {
  const results = [];

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
  }

  return results;
}

/**
 * 过滤数据中的重复项
 * @param {Array} data - 数据数组
 * @param {string} key - 用于判断重复的字段名
 * @returns {Array} 去重后的数据
 */
export function removeDuplicates(data, key) {
  if (!Array.isArray(data)) {
    return [];
  }
  const uniqueMap = new Map();

  return data.filter((item) => {
    const value = item[key];
    if (uniqueMap.has(value)) {
      return false;
    }
    uniqueMap.set(value, true);
    return true;
  });
}

/**
 * 生成导入结果报告
 * @param {Object} importResult - 导入结果对象
 * @returns {Object} 格式化后的报告
 */
export function generateImportReport(importResult) {
  const { totalCount, successCount, failCount, errors } = importResult;

  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return {
    summary: {
      totalCount,
      successCount,
      failCount,
      successRate: `${successRate}%`,
    },
    errors: errors.map((error) => ({
      row: error.rowIndex,
      message: error.errors.join('; '),
    })),
  };
}

/**
 * 导出导入错误报告
 * @param {Object[]} errors - 错误数组
 * @param {string} filename - 文件名
 */
export async function exportErrorReport(errors, filename = 'import_errors') {
  const errorData = errors.map((error) => ({
    行号: error.rowIndex,
    错误信息: error.errors.join('; '),
  }));

  return await exportToExcel(errorData, filename, {
    headers: {
      行号: '行号',
      错误信息: '错误信息',
    },
  });
}
