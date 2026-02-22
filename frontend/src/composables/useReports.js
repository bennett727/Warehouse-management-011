import { ElMessage } from 'element-plus';
import { reactive, computed } from 'vue';

import * as reportApi from '@/api/reports/reports';

export function useReports() {
  const loading = reactive({
    device: false,
    inventory: false,
    repair: false,
    maintenance: false,
    inbound: false,
    outbound: false,
    deviceStatus: false,
    warehouse: false,
    area: false,
    deviceType: false,
    summary: false,
    export: false,
  });

  const reportData = reactive({
    device: null,
    inventory: null,
    repair: null,
    maintenance: null,
    inbound: null,
    outbound: null,
    deviceStatus: null,
    warehouse: null,
    area: null,
    deviceType: null,
    summary: null,
  });

  const queryParams = reactive({
    reportType: 'device',
    dateRange: [],
    startDate: null,
    endDate: null,
    areaId: null,
    warehouseId: null,
    deviceTypeId: null,
    status: null,
  });

  const reportTypes = [
    { value: 'device', label: '设备报表' },
    { value: 'inventory', label: '库存报表' },
    { value: 'repair', label: '维修报表' },
    { value: 'maintenance', label: '维护报表' },
    { value: 'inbound', label: '入库报表' },
    { value: 'outbound', label: '出库报表' },
    { value: 'deviceStatus', label: '设备状态报表' },
    { value: 'warehouse', label: '仓库报表' },
    { value: 'area', label: '区域报表' },
    { value: 'deviceType', label: '设备类型报表' },
  ];

  const currentReportType = computed(() => {
    return queryParams.reportType;
  });

  const fetchDeviceReport = async (params = {}) => {
    loading.device = true;
    try {
      const response = await reportApi.getDeviceReport({ ...queryParams, ...params });
      reportData.device = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取设备报表失败');
      throw error;
    } finally {
      loading.device = false;
    }
  };

  const fetchInventoryReport = async (params = {}) => {
    loading.inventory = true;
    try {
      const response = await reportApi.getInventoryReport({ ...queryParams, ...params });
      reportData.inventory = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取库存报表失败');
      throw error;
    } finally {
      loading.inventory = false;
    }
  };

  const fetchRepairReport = async (params = {}) => {
    loading.repair = true;
    try {
      const response = await reportApi.getRepairReport({ ...queryParams, ...params });
      reportData.repair = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取维修报表失败');
      throw error;
    } finally {
      loading.repair = false;
    }
  };

  const fetchMaintenanceReport = async (params = {}) => {
    loading.maintenance = true;
    try {
      const response = await reportApi.getMaintenanceReport({ ...queryParams, ...params });
      reportData.maintenance = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取维护报表失败');
      throw error;
    } finally {
      loading.maintenance = false;
    }
  };

  const fetchInboundReport = async (params = {}) => {
    loading.inbound = true;
    try {
      const response = await reportApi.getInboundReport({ ...queryParams, ...params });
      reportData.inbound = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取入库报表失败');
      throw error;
    } finally {
      loading.inbound = false;
    }
  };

  const fetchOutboundReport = async (params = {}) => {
    loading.outbound = true;
    try {
      const response = await reportApi.getOutboundReport({ ...queryParams, ...params });
      reportData.outbound = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取出库报表失败');
      throw error;
    } finally {
      loading.outbound = false;
    }
  };

  const fetchDeviceStatusReport = async (params = {}) => {
    loading.deviceStatus = true;
    try {
      const response = await reportApi.getDeviceStatusReport({ ...queryParams, ...params });
      reportData.deviceStatus = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取设备状态报表失败');
      throw error;
    } finally {
      loading.deviceStatus = false;
    }
  };

  const fetchWarehouseReport = async (params = {}) => {
    loading.warehouse = true;
    try {
      const response = await reportApi.getWarehouseReport({ ...queryParams, ...params });
      reportData.warehouse = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取仓库报表失败');
      throw error;
    } finally {
      loading.warehouse = false;
    }
  };

  const fetchAreaReport = async (params = {}) => {
    loading.area = true;
    try {
      const response = await reportApi.getAreaReport({ ...queryParams, ...params });
      reportData.area = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取区域报表失败');
      throw error;
    } finally {
      loading.area = false;
    }
  };

  const fetchDeviceTypeReport = async (params = {}) => {
    loading.deviceType = true;
    try {
      const response = await reportApi.getDeviceTypeReport({ ...queryParams, ...params });
      reportData.deviceType = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取设备类型报表失败');
      throw error;
    } finally {
      loading.deviceType = false;
    }
  };

  const fetchReportSummary = async () => {
    loading.summary = true;
    try {
      const response = await reportApi.getReportSummary();
      reportData.summary = response.data;
      return response;
    } catch (error) {
      ElMessage.error('获取报表汇总失败');
      throw error;
    } finally {
      loading.summary = false;
    }
  };

  const exportReportData = async (reportType, exportFormat = 'excel') => {
    loading.export = true;
    try {
      const response = await reportApi.exportReport(reportType, {
        ...queryParams,
        format: exportFormat,
      });

      const blob = new Blob([response], {
        type: exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().getTime()}.${exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      window.URL.revokeObjectURL(url);

      ElMessage.success('导出成功');
      return response;
    } catch (error) {
      ElMessage.error('导出失败');
      throw error;
    } finally {
      loading.export = false;
    }
  };

  const fetchCurrentReport = async () => {
    switch (queryParams.reportType) {
      case 'device':
        return fetchDeviceReport();
      case 'inventory':
        return fetchInventoryReport();
      case 'repair':
        return fetchRepairReport();
      case 'maintenance':
        return fetchMaintenanceReport();
      case 'inbound':
        return fetchInboundReport();
      case 'outbound':
        return fetchOutboundReport();
      case 'deviceStatus':
        return fetchDeviceStatusReport();
      case 'warehouse':
        return fetchWarehouseReport();
      case 'area':
        return fetchAreaReport();
      case 'deviceType':
        return fetchDeviceTypeReport();
      default:
        return fetchDeviceReport();
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      queryParams.startDate = dates[0];
      queryParams.endDate = dates[1];
    } else {
      queryParams.startDate = null;
      queryParams.endDate = null;
    }
  };

  const handleReportTypeChange = (type) => {
    queryParams.reportType = type;
  };

  const resetQueryParams = () => {
    queryParams.reportType = 'device';
    queryParams.dateRange = [];
    queryParams.startDate = null;
    queryParams.endDate = null;
    queryParams.areaId = null;
    queryParams.warehouseId = null;
    queryParams.deviceTypeId = null;
    queryParams.status = null;
  };

  return {
    loading,
    reportData,
    queryParams,
    reportTypes,
    currentReportType,
    fetchDeviceReport,
    fetchInventoryReport,
    fetchRepairReport,
    fetchMaintenanceReport,
    fetchInboundReport,
    fetchOutboundReport,
    fetchDeviceStatusReport,
    fetchWarehouseReport,
    fetchAreaReport,
    fetchDeviceTypeReport,
    fetchReportSummary,
    exportReportData,
    fetchCurrentReport,
    handleDateRangeChange,
    handleReportTypeChange,
    resetQueryParams,
  };
}
