import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';

import installationApi from '@/api/installation/installation';
import { PAGINATION } from '@/constants';
import { handleErrorMessage } from '@/utils/responseHandler.js';

/**
 * 安装管理Store
 */
export const useInstallationStore = defineStore('installation', {
  state: () => ({
    // 安装记录列表
    installationList: [],
    // 加载状态
    loading: false,
    // 初始加载状态
    initialLoading: true,
    // 分页信息
    pagination: {
      currentPage: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
    },
    // 查询参数
    searchParams: {
      deviceName: '',
      deviceCode: '',
      status: '',
      areaId: '',
      installDateRange: [],
      installer: '',
    },
    // 安装记录详情
    installationDetail: null,
    // 统计数据
    statistics: {
      byArea: [],
      byMonth: [],
      byType: [],
    },
    // 导出加载状态
    exportLoading: false,
  }),

  getters: {
    // 分页后的安装记录
    paginatedInstallationList: (state) => {
      return state.installationList;
    },
  },

  actions: {
    /**
     * 重置查询参数
     */
    resetSearchParams() {
      this.searchParams = {
        deviceName: '',
        deviceCode: '',
        status: '',
        areaId: '',
        installDateRange: [],
        installer: '',
      };
      this.pagination.currentPage = 1;
    },

    /**
     * 设置查询参数
     */
    setSearchParams(params) {
      this.searchParams = { ...this.searchParams, ...params };
    },

    /**
     * 获取安装记录列表
     */
    async loadInstallationList() {
      this.loading = true;
      this.initialLoading = true;
      try {
        const params = {
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          ...this.searchParams,
        };

        // 处理日期范围
        if (this.searchParams.installDateRange && this.searchParams.installDateRange.length === 2) {
          params.startDate = this.searchParams.installDateRange[0];
          params.endDate = this.searchParams.installDateRange[1];
        }

        const response = await installationApi.getInstallationList(params);
        this.installationList = response.data.data;
        this.pagination.total = response.data.total;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '加载安装记录失败'));
        this.installationList = [];
        this.pagination.total = 0;
      } finally {
        this.loading = false;
        this.initialLoading = false;
      }
    },

    /**
     * 切换分页
     * @param {number} currentPage - 当前页码
     */
    async changePage(currentPage) {
      this.pagination.currentPage = currentPage;
      await this.loadInstallationList();
    },

    /**
     * 切换每页显示条数
     * @param {number} pageSize - 每页显示条数
     */
    async changePageSize(pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.currentPage = 1;
      await this.loadInstallationList();
    },

    /**
     * 获取安装记录详情
     * @param {number} id - 安装记录ID
     */
    async loadInstallationDetail(id) {
      this.loading = true;
      try {
        const response = await installationApi.getInstallationDetail(id);
        this.installationDetail = response.data;
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '获取安装记录详情失败'));
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建安装记录
     * @param {Object} data - 安装记录数据
     */
    async createInstallationRecord(data) {
      try {
        const response = await installationApi.createInstallationRecord(data);
        ElMessage.success('创建安装记录成功');
        await this.loadInstallationList();
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '创建安装记录失败'));
        return null;
      }
    },

    /**
     * 更新安装记录
     * @param {number} id - 安装记录ID
     * @param {Object} data - 安装记录数据
     */
    async updateInstallationRecord(id, data) {
      try {
        const response = await installationApi.updateInstallationRecord(id, data);
        ElMessage.success('更新安装记录成功');
        await this.loadInstallationList();
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '更新安装记录失败'));
        return null;
      }
    },

    /**
     * 删除安装记录
     * @param {number} id - 安装记录ID
     */
    async deleteInstallationRecord(id) {
      try {
        await installationApi.deleteInstallationRecord(id);
        ElMessage.success('删除安装记录成功');
        await this.loadInstallationList();
        return true;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '删除安装记录失败'));
        return false;
      }
    },

    /**
     * 批量删除安装记录
     * @param {Array} ids - 安装记录ID列表
     */
    async batchDeleteInstallationRecords(ids) {
      try {
        await installationApi.batchDeleteInstallationRecords(ids);
        ElMessage.success('批量删除安装记录成功');
        await this.loadInstallationList();
        return true;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '批量删除安装记录失败'));
        return false;
      }
    },

    /**
     * 更新安装状态
     * @param {number} id - 安装记录ID
     * @param {string} status - 安装状态
     */
    async updateInstallationStatus(id, status) {
      try {
        const response = await installationApi.updateInstallationStatus(id, status);
        ElMessage.success('更新安装状态成功');
        await this.loadInstallationList();
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '更新安装状态失败'));
        return null;
      }
    },

    /**
     * 导出安装记录
     * @param {Object} params - 导出参数
     */
    async exportInstallationRecords(params = {}) {
      this.exportLoading = true;
      try {
        const exportParams = { ...this.searchParams, ...params };

        // 处理日期范围
        if (this.searchParams.installDateRange && this.searchParams.installDateRange.length === 2) {
          exportParams.startDate = this.searchParams.installDateRange[0];
          exportParams.endDate = this.searchParams.installDateRange[1];
        }

        const response = await installationApi.exportInstallationRecords(exportParams);

        // 处理导出文件
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `安装记录_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        ElMessage.success('导出安装记录成功');
        return true;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '导出安装记录失败'));
        return false;
      } finally {
        this.exportLoading = false;
      }
    },

    /**
     * 获取安装统计数据
     * @param {Object} params - 查询参数
     */
    async loadInstallationStatistics(params = {}) {
      this.loading = true;
      try {
        const response = await installationApi.getInstallationStatistics(params);
        this.statistics = response.data;
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '获取安装统计数据失败'));
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
