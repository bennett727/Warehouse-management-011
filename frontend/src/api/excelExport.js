/**
 * Excel导出API
 * 调用服务端Excel导出接口
 */
import request from '@/utils/request';
import { EXCEL_API } from '@/constants/apiConstants';

/**
 * 导出设备列表
 * @returns {Promise} 返回Blob数据
 */
export function exportDevices() {
  return request({
    url: EXCEL_API.DEVICE_EXPORT,
    method: 'get',
    responseType: 'blob',
    timeout: 60000, // Excel导出可能需要较长时间
  });
}

/**
 * 导出库存报表
 * @returns {Promise} 返回Blob数据
 */
export function exportInventory() {
  return request({
    url: EXCEL_API.INVENTORY_EXPORT,
    method: 'get',
    responseType: 'blob',
    timeout: 60000,
  });
}

/**
 * 导出综合报表（多工作表）
 * @returns {Promise} 返回Blob数据
 */
export function exportComprehensiveReport() {
  return request({
    url: EXCEL_API.COMPREHENSIVE_EXPORT,
    method: 'get',
    responseType: 'blob',
    timeout: 60000,
  });
}

/**
 * 下载Blob文件
 * @param {Blob} blob - Blob数据
 * @param {string} filename - 文件名
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 处理Excel导出响应
 * @param {Blob} blob - 响应数据
 * @param {string} defaultFilename - 默认文件名
 */
export function handleExcelExport(blob, defaultFilename = '导出文件.xlsx') {
  // 尝试从响应头获取文件名
  const filename = defaultFilename;

  // 检查是否是错误响应（JSON格式）
  if (blob.type === 'application/json') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const error = JSON.parse(reader.result);
          reject(new Error(error.message || '导出失败'));
        } catch {
          reject(new Error('导出失败'));
        }
      };
      reader.readAsText(blob);
    });
  }

  downloadBlob(blob, filename);
  return Promise.resolve();
}
