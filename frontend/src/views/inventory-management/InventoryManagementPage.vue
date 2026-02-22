<!--
  @file: InventoryManagementPage.vue
  @description: 库存管理主页面- 美化版，包含设备类型汇总、库存列表、库存预警、出入库记录和库存盘点等功能
  @author: 开发团面  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <div class="inventory-management-container" data-cy="inventory-management-page">
    <el-card class="main-card" :body-style="{ padding: '0' }" data-cy="inventory-main-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <div class="title-icon">
              <el-icon :size="28"><Box /></el-icon>
            </div>
            <div class="title-content">
              <h1 class="page-title" data-cy="inventory-page-title">库存管理</h1>
              <p class="page-subtitle" data-cy="inventory-page-subtitle">全面管理设备库存，实时监控库存状面/p></p>
            </div>
          </div>
          <div class="header-actions">
            <el-button
              type="info"
              :icon="QuestionFilled"
              @click="handleShowOperationGuide"
              class="btn-guide"
              data-cy="inventory-guide-button"
            >
              <el-icon><QuestionFilled /></el-icon>
              操作引导
            </el-button>
            <el-button
              type="success"
              :icon="Download"
              @click="handleExport"
              :loading="exportLoading"
              class="btn-export"
              data-cy="inventory-export-button"
            >
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <div class="tabs-container">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
          <el-tab-pane name="summary">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><Grid /></el-icon>
                <span>设备类型汇总</span>
              </div>
            </template>
            <div class="tab-content">
              <DeviceTypeSummary @device-type-click="handleDeviceTypeClick" />
            </div>
          </el-tab-pane>

          <el-tab-pane name="inventory">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><List /></el-icon>
                <span>库存列表</span>
                <el-badge v-if="statistics.totalStock > 0" :value="statistics.totalStock" class="tab-badge" />
              </div>
            </template>
            <div class="tab-content">
              <div class="inventory-section">
                <InventoryStatisticsCard
                  :statistics="statistics"
                  :loading="loading"
                  @card-click="handleStatCardClick"
                />
                <div class="list-section">
                  <InventoryList
                    ref="inventoryListRef"
                    :show-search="true"
                    :show-toolbar="true"
                    :show-pagination="true"
                    @selection-change="handleSelectionChange"
                    @view="handleViewDetail"
                    @edit="handleEdit"
                    @delete="handleDelete"
                    @audit="handleAudit"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane name="alerts">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><Warning /></el-icon>
                <span>库存预警</span>
                <el-badge
                  v-if="statistics.alertCount > 0"
                  :value="statistics.alertCount"
                  type="danger"
                  class="tab-badge"
                />
              </div>
            </template>
            <div class="tab-content">
              <InventoryAlerts />
            </div>
          </el-tab-pane>

          <el-tab-pane name="records">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><Document /></el-icon>
                <span>出入库记录</span>
              </div>
            </template>
            <div class="tab-content">
              <InventoryRecords />
            </div>
          </el-tab-pane>

          <el-tab-pane name="audit">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><Checked /></el-icon>
                <span>库存盘点</span>
              </div>
            </template>
            <div class="tab-content">
              <InventoryAuditPage />
            </div>
          </el-tab-pane>

          <el-tab-pane name="areas">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><OfficeBuilding /></el-icon>
                <span>区域管理</span>
              </div>
            </template>
            <div class="tab-content">
              <AreaManagement ref="areaManagementRef" />
            </div>
          </el-tab-pane>

          <el-tab-pane name="bins">
            <template #label>
              <div class="tab-label">
                <el-icon :size="16"><Grid /></el-icon>
                <span>货位管理</span>
              </div>
            </template>
            <div class="tab-content">
              <BinManagement ref="binManagementRef" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 详情对话面-->
    <InventoryDetailDialog v-model="detailDialogVisible" :inventory-data="currentInventory" />

    <!-- 表单对话面-->
    <InventoryFormDialog
      v-model="formDialogVisible"
      :mode="formMode"
      :inventory-data="currentInventory"
      @success="handleFormSuccess"
    />

    <!-- 审核对话面-->
    <InventoryAuditDialog
      v-model="auditDialogVisible"
      :inventory-data="currentInventory"
      @success="handleAuditSuccess"
    />

    <!-- 操作引导对话面-->
    <BaseDialog
      v-model="guideDialogVisible"
      title="操作引导"
      :icon="Guide"
      size="large"
      :show-confirm="false"
      cancel-text="关闭"
    >
      <div class="operation-guide">
        <el-steps :active="currentStep" finish-status="success" align-center class="guide-steps">
          <el-step title="设备类型汇总" />
          <el-step title="库存列表管理" />
          <el-step title="库存预警处理" />
          <el-step title="出入库记录查询" />
          <el-step title="库存盘点管理" />
        </el-steps>

        <div class="guide-content">
          <transition name="fade-slide" mode="out-in">
            <div :key="currentStep" class="guide-item">
              <div class="guide-item__header">
                <div class="guide-item__number">{{ currentStep + 1 }}</div>
                <h3 class="guide-item__title">{{ getStepTitle(currentStep) }}</h3>
              </div>
              <div class="guide-item__body">
                <p class="guide-item__desc">{{ getStepDesc(currentStep) }}</p>
                <ul class="guide-item__list">
                  <li v-for="(item, index) in getStepItems(currentStep)" :key="index" class="guide-item__list-item">
                    <el-icon :size="16" class="list-icon"><Check /></el-icon>
                    <span v-html="item"></span>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>

        <div class="guide-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: ((currentStep + 1) / 5) * 100 + '%' }"></div>
          </div>
          <span class="progress-text">步骤 {{ currentStep + 1 }} / 5</span>
        </div>

        <div class="guide-actions">
          <el-button v-if="currentStep > 0" @click="currentStep--" class="btn-prev" data-cy="inventory-guide-prev">
            <el-icon><ArrowLeft /></el-icon>
            上一面
          </el-button>
          <el-button
            v-if="currentStep < 4"
            type="primary"
            @click="currentStep++"
            class="btn-next"
            data-cy="inventory-guide-next"
          >
            下一面 <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button
            v-if="currentStep === 4"
            type="success"
            @click="guideDialogVisible = false"
            class="btn-finish"
            data-cy="inventory-guide-finish"
          >
            <el-icon><CircleCheck /></el-icon>
            完成引导
          </el-button>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  Checked,
  CircleCheck,
  Document,
  Download,
  Grid,
  Guide,
  List,
  OfficeBuilding,
  QuestionFilled,
  Warning,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';

import AreaManagement from './area/AreaManagement.vue';
import BinManagement from './bin/BinManagement.vue';
import DeviceTypeSummary from './DeviceTypeSummary.vue';
import InventoryAlerts from './InventoryAlerts.vue';
import InventoryAuditPage from './InventoryAuditPage.vue';
import InventoryRecords from './InventoryRecords.vue';

import BaseDialog from '@/components/base/BaseDialog.vue';
import InventoryAuditDialog from '@/components/business/dialogs/InventoryAuditDialog.vue';
import InventoryDetailDialog from '@/components/business/dialogs/InventoryDetailDialog.vue';
import InventoryFormDialog from '@/components/business/dialogs/InventoryFormDialog.vue';
import InventoryList from '@/components/business/inventory/InventoryList.vue';
import InventoryStatisticsCard from '@/components/business/summary/InventoryStatisticsCard.vue';
import { useInventory } from '@/composables/useInventory';
import { createLogger } from '@/utils/logger';

const logger = createLogger('InventoryManagementPage');

const { loading, exportLoading, selectedRows, statistics, fetchStatistics, exportInventory } = useInventory();

const activeTab = ref('summary');
const inventoryListRef = ref(null);
const areaManagementRef = ref(null);
const binManagementRef = ref(null);
const detailDialogVisible = ref(false);
const formDialogVisible = ref(false);
const auditDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentStep = ref(0);
const currentInventory = ref(null);
const formMode = ref('add');

// 步骤标题
const getStepTitle = (step) => {
  const titles = ['设备类型汇总', '库存列表管理', '库存预警处理', '出入库记录查询', '库存盘点管理'];
  return titles[step];
};

// 步骤描述
const getStepDesc = (step) => {
  const descs = [
    '设备类型汇总页面展示各类设备的库存概况，帮助您快速了解整体库存分布：',
    '库存列表页面提供全面的库存管理功能，支持多种操作和筛选：',
    '库存预警页面帮助您及时发现和处理库存异常，确保库存安全：',
    '出入库记录页面提供完整的库存变动记录，便于追溯和审计：',
    '库存盘点页面提供完整的库存盘点功能，确保账实相符：',
  ];
  return descs[step];
};

// 步骤项目
const getStepItems = (step) => {
  const items = [
    [
      '<strong>设备类型卡片</strong>：显示设备类型图片、名称、库存数量、仓库位置',
      '<strong>筛选功能</strong>：支持按仓库、设备类型进行筛选',
      '<strong>快速导航</strong>：点击设备类型卡片可跳转到该类型的详细库存列表',
      '<strong>统计信息</strong>：显示各设备类型的库存占比和趋势',
    ],
    [
      '<strong>搜索功能</strong>：支持按设备编号、名称、类型、仓库等多条件搜索',
      '<strong>统计卡片</strong>：显示库存总数、本月入库、本月出库、预警数量',
      '<strong>批量操作</strong>：支持批量导出、批量审核等操作',
      '<strong>库存操作</strong>：支持查看详情、编辑、删除、审核等操作',
    ],
    [
      '<strong>预警类型</strong>：库存不足、库存超限、库存积压',
      '<strong>预警级别</strong>：严重、一般、提示',
      '<strong>预警处理</strong>：查看详情、标记已处理、添加处理备注',
      '<strong>预警统计</strong>：显示严重预警、一般预警、预警总数、已处理数量',
    ],
    [
      '<strong>记录查询</strong>：支持按记录编号、操作类型、设备信息、操作员等条件查询',
      '<strong>操作类型</strong>：采购入库、安装出库、维修归还',
      '<strong>记录统计</strong>：显示总入库数量、总出库数量、当前库存、记录总数',
      '<strong>记录导出</strong>：支持导出出入库记录为Excel文件',
    ],
    [
      '<strong>创建盘点</strong>：支持全盘、抽盘、循环盘点三种盘点类型',
      '<strong>盘点执行</strong>：开始盘点后生成盘点明细，逐个记录实际数量',
      '<strong>差异处理</strong>：自动计算系统数量与实际数量的差异，支持库存调整',
      '<strong>盘点报告</strong>：完成盘点后生成盘点报告，显示匹配数、差异数等统计信息',
    ],
  ];
  return items[step];
};

const handleTabChange = (tabName) => {
  logger.info('切换标签页', { tabName });
};

const handleDeviceTypeClick = (deviceType) => {
  logger.info('点击设备类型', { deviceType });
  activeTab.value = 'inventory';
  if (inventoryListRef.value) {
    inventoryListRef.value.setSearchFilter({ deviceType });
  }
};

const handleStatCardClick = (type) => {
  logger.info('点击统计卡片', { type });
  switch (type) {
    case 'total':
      if (inventoryListRef.value) {
        inventoryListRef.value.setSearchFilter({});
      }
      break;
    case 'inbound':
      activeTab.value = 'records';
      break;
    case 'outbound':
      activeTab.value = 'records';
      break;
    case 'alert':
      activeTab.value = 'alerts';
      break;
  }
};

const handleSelectionChange = (selection) => {
  logger.info('选择变更', { count: selection.length });
};

const handleViewDetail = (row) => {
  logger.info('查看详情', { id: row.id });
  currentInventory.value = row;
  detailDialogVisible.value = true;
};

const handleEdit = (row) => {
  logger.info('编辑库存', { id: row.id });
  currentInventory.value = row;
  formMode.value = 'edit';
  formDialogVisible.value = true;
};

const handleDelete = (row) => {
  logger.info('删除库存', { id: row.id });
};

const handleAudit = (row) => {
  logger.info('审核库存', { id: row.id });
  currentInventory.value = row;
  auditDialogVisible.value = true;
};

const handleFormSuccess = () => {
  logger.info('表单提交成功');
  formDialogVisible.value = false;
  if (inventoryListRef.value) {
    inventoryListRef.value.refresh();
  }
};

const handleAuditSuccess = () => {
  logger.info('审核成功');
  auditDialogVisible.value = false;
  if (inventoryListRef.value) {
    inventoryListRef.value.refresh();
  }
};

const handleExport = async () => {
  try {
    const params = {
      records: selectedRows.value.length > 0 ? selectedRows.value : null,
    };
    await exportInventory(params);
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error('导出失败');
  }
};

const handleShowOperationGuide = () => {
  currentStep.value = 0;
  guideDialogVisible.value = true;
};

onMounted(async () => {
  logger.info('库存管理页面加载完成');
  await fetchStatistics();
});
</script>

<style scoped>
.inventory-management-container {
  padding: var(--spacing-5);
  height: 100%;
  overflow-y: auto;
  background: var(--bg-color);
}

/* 主卡面*/
.main-card {
  border: none;
  box-shadow: var(--box-shadow-lg);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
}

.main-card :deep(.el-card__header) {
  padding: var(--spacing-6) var(--spacing-6);
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--slate-50) 0%, var(--bg-color-light) 100%);
}

/* 头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.title-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-50);
  color: var(--primary-600);
  border: 2px solid var(--primary-100);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
}

.title-icon:hover {
  background: var(--primary-100);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.page-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.btn-guide {
  background: var(--slate-100);
  border-color: var(--slate-200);
  color: var(--text-secondary);
}

.btn-guide:hover {
  background: var(--slate-200);
  border-color: var(--slate-300);
}

.btn-export {
  background: var(--success-600);
  border: none;
}

.btn-export:hover {
  background: var(--success-700);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* 标签页容面*/
.tabs-container {
  background: var(--bg-color-light);
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 var(--spacing-6);
  background: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color);
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--primary-600);
}

.custom-tabs :deep(.el-tabs__item) {
  padding: var(--spacing-4) var(--spacing-5);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.custom-tabs :deep(.el-tabs__item:hover) {
  color: var(--primary-600);
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-600);
  font-weight: var(--font-weight-semibold);
}

/* 标签标签 */
.tab-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.tab-badge {
  margin-left: var(--spacing-2);
}

.tab-badge :deep(.el-badge__content) {
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 6px;
}

/* 标签内容 */
.tab-content {
  padding: var(--spacing-6);
  min-height: 600px;
}

/* 库存区域 */
.inventory-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.list-section {
  background: var(--bg-color-light);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

/* 操作引导 */
.operation-guide {
  padding: var(--spacing-6);
}

.guide-steps {
  margin-bottom: var(--spacing-8);
}

.guide-steps :deep(.el-step__title) {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.guide-steps :deep(.el-step__icon) {
  width: 32px;
  height: 32px;
}

.guide-content {
  min-height: 280px;
  margin-bottom: var(--spacing-6);
}

.guide-item {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.guide-item__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.guide-item__number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-600);
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  border-radius: 50%;
  flex-shrink: 0;
}

.guide-item__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.guide-item__body {
  padding-left: var(--spacing-12);
}

.guide-item__desc {
  margin: 0 0 var(--spacing-4);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
}

.guide-item__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.guide-item__list-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.list-icon {
  color: var(--success-color);
  margin-top: 2px;
  flex-shrink: 0;
}

/* 进度面*/
.guide-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  padding: 0 var(--spacing-12);
}

.guide-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: var(--slate-200);
  border-radius: 3px;
  overflow: hidden;
}

.guide-progress .progress-fill {
  height: 100%;
  background: var(--primary-600);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.guide-progress .progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-medium);
  min-width: 80px;
  text-align: right;
}

/* 引导按钮 */
.guide-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-3);
  padding: 0 var(--spacing-12);
}

.btn-prev,
.btn-next,
.btn-finish {
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.btn-next {
  background: var(--primary-600);
  border: none;
}

.btn-next:hover {
  background: var(--primary-700);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-finish {
  background: var(--success-600);
  border: none;
}

.btn-finish:hover {
  background: var(--success-700);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应面*/
@media (max-width: 768px) {
  .inventory-management-container {
    padding: var(--spacing-3);
  }

  .card-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .title-icon {
    width: 44px;
    height: 44px;
  }

  .page-title {
    font-size: var(--font-size-xl);
  }

  .page-subtitle {
    font-size: var(--font-size-xs);
  }

  .tab-content {
    padding: var(--spacing-4);
  }

  .guide-item__body {
    padding-left: 0;
  }

  .guide-progress,
  .guide-actions {
    padding: 0;
  }

  .guide-steps :deep(.el-step__title) {
    font-size: var(--font-size-xs);
  }
}

/* 无障面*/
@media (prefers-reduced-motion: reduce) {
  .guide-item,
  .guide-progress .progress-fill,
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
