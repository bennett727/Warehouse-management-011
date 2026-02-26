/**
 * 数据处理工具，主要用于Excel导入导出等功能
 * 安全说明：本模块使用exceljs处理Excel文件，请注意以下安全事项：
 * 1. 仅处理可信来源的Excel文件
 * 2. 避免解析用户上传的未知来源文件
 * 3. 生产环境中建议在后端进行Excel处理
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
 * 安全警告：此函数解析用户上传的Excel文件，请确保文件来源可信
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

  // 文件大小限制（10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('文件大小超过限制（最大10MB）');
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
