<!--
  @file: OutboundCreationWizard.vue
  @description: 出库申请向导 - 支持多种出库类型的动态步骤式引导
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 4.0
  @features:
    - 四步引导式流程
    - 根据出库类型动态显示不同表单
    - 实时表单验证
    - 设备智能选择
    - 数据自动保存
    - 提交后自动跳转审批
-->
<template>
  <el-dialog
    v-model="visible"
    title="出库申请向导"
    width="95%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    class="outbound-wizard-dialog"
    data-cy="outbound-creation-wizard-dialog"
    @close="handleDialogClose"
  >
    <div class="wizard-container">
      <div class="wizard-sidebar">
        <div class="wizard-title">
          <el-icon :size="24" color="#409EFF"><Upload /></el-icon>
          <h2>出库申请</h2>
        </div>

        <div class="step-navigation">
          <div
            v-for="(step, index) in currentSteps"
            :key="index"
            class="step-item"
            :class="{
              active: currentStep === index,
              completed: currentStep > index,
              clickable: index < currentStep || (index === currentStep + 1 && canProceedToNext),
            }"
            @click="goToStep(index)"
          >
            <div class="step-number">
              <el-icon v-if="currentStep > index" :size="16"><Check /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-info">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.description }}</div>
            </div>
            <div
              v-if="index < currentSteps.length - 1"
              class="step-connector"
              :class="{ completed: currentStep > index }"
            />
          </div>
        </div>

        <div class="wizard-progress">
          <el-progress :percentage="progressPercentage" :stroke-width="8" :show-text="false" :color="progressColor" />
          <span class="progress-text">完成进度 {{ progressPercentage }}%</span>
        </div>

        <div class="wizard-tips">
          <el-alert v-if="currentStep === 0" title="提示" type="info" :closable="false" show-icon>
            请填写出库单的基本信息，带 * 的为必填项
          </el-alert>
          <el-alert v-else-if="currentStep === 1" title="提示" type="info" :closable="false" show-icon>
            请从设备列表中选择需要出库的设备，支持多选
          </el-alert>
          <el-alert v-else-if="currentStep === 2" title="提示" type="info" :closable="false" show-icon>
            {{ getDetailStepTip() }}
          </el-alert>
          <el-alert v-else-if="currentStep === 3" title="提示" type="warning" :closable="false" show-icon>
            请仔细核对以下信息，确认无误后提交审批
          </el-alert>
        </div>
      </div>

      <div class="wizard-main">
        <transition name="slide-fade" mode="out-in">
          <div v-if="currentStep === 0" key="step0" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><Document /></el-icon> 基本信息
              </h3>
              <p>填写出库单的基础信息</p>
            </div>

            <el-form
              ref="basicFormRef"
              :model="formData.basic"
              :rules="basicRules"
              label-width="120px"
              label-position="right"
              class="wizard-form"
              data-cy="outbound-basic-form"
            >
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="出库单号" prop="orderNo" data-cy="outbound-order-no-form-item">
                    <el-input v-model="formData.basic.orderNo" placeholder="系统自动生成" disabled data-cy="outbound-order-no-input">
                      <template #prefix>
                        <el-icon><Tickets /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="出库日期" prop="orderDate">
                    <el-date-picker
                      v-model="formData.basic.orderDate"
                      type="date"
                      placeholder="选择出库日期"
                      style="width: 100%"
                      :disabled-date="disabledDate"
                      value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="出库类型" prop="outboundType">
                    <el-select
                      v-model="formData.basic.outboundType"
                      placeholder="请选择出库类型"
                      style="width: 100%"
                      @change="handleOutboundTypeChange"
                     data-cy="outbound-wizard-form-data.basic.outbound-type-select">
                      <el-option :value="1" label="安装出库">
                        <el-icon><SetUp /></el-icon> 安装出库
                      </el-option>
                      <el-option :value="2" label="维修出库">
                        <el-icon><Tools /></el-icon> 维修出库
                      </el-option>
                      <el-option :value="3" label="保养出库">
                        <el-icon><Timer /></el-icon> 保养出库
                      </el-option>
                      <el-option :value="4" label="报废出库">
                        <el-icon><Delete /></el-icon> 报废出库
                      </el-option>
                      <el-option :value="5" label="调拨出库">
                        <el-icon><Sort /></el-icon> 调拨出库
                      </el-option>
                      <el-option :value="6" label="其他出库">
                        <el-icon><MoreFilled /></el-icon> 其他出库
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="源仓库" prop="warehouseId">
                    <el-select
                      v-model="formData.basic.warehouseId"
                      placeholder="请选择源仓库"
                      style="width: 100%"
                      filterable
                     data-cy="outbound-wizard-form-data.basic.warehouse-id-select">
                      <el-option v-for="wh in warehouseList" :key="wh.id" :label="wh.name" :value="wh.id">
                        <span>{{ wh.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 12px">
                          {{ wh.code }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="申请人" prop="applicant">
                    <el-input v-model="formData.basic.applicant" placeholder="请输入申请人姓名" data-cy="outbound-applicant-input" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="formData.basic.contactPhone" placeholder="请输入联系电话" data-cy="outbound-contact-phone-input">
                      <template #prefix>
                        <el-icon><Phone /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="出库原因" prop="reason">
                <el-input
                  v-model="formData.basic.reason"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入出库原因"
                  maxlength="500"
                  show-word-limit
                  data-cy="outbound-reason-input"
                />
              </el-form-item>

              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.basic.remark"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注信息（选填）"
                  maxlength="300"
                  show-word-limit
                  data-cy="outbound-remark-input"
                />
              </el-form-item>
            </el-form>
          </div>

          <div v-else-if="currentStep === 1" key="step1" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><Box /></el-icon> 设备选择
              </h3>
              <p>选择需要出库的设备</p>
            </div>

            <div class="device-selection-area">
              <div class="selection-toolbar">
                <div class="toolbar-left">
                  <el-input
                    v-model="deviceSearchKeyword"
                    placeholder="搜索设备编号/名称/型号"
                    clearable
                    style="width: 300px"
                    :prefix-icon="Search"
                    @input="handleDeviceSearch"
                    data-cy="outbound-device-search-input"
                  />
                  <el-select
                    v-model="deviceTypeFilter"
                    placeholder="设备类型"
                    clearable
                    style="width: 150px"
                    @change="handleDeviceSearch"
                   data-cy="outbound-wizard-device-type-filter-select">
                    <el-option label="全部类型" value="" />
                    <el-option v-for="type in deviceTypes" :key="type.value" :label="type.label" :value="type.value" />
                  </el-select>
                  <el-select
                    v-model="deviceStatusFilter"
                    placeholder="设备状态"
                    clearable
                    style="width: 120px"
                    @change="handleDeviceSearch"
                   data-cy="outbound-wizard-device-status-filter-select">
                    <el-option label="全部状态" value="" />
                    <el-option label="在库" value="in_stock" />
                    <el-option label="可用" value="available" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <el-button :icon="Delete" :disabled="selectedDevices.length === 0" @click="clearDeviceSelection" data-cy="outbound-clear-selection-btn">
                    清空选择
                  </el-button>
                </div>
              </div>

              <div class="device-table-wrapper">
                <el-table
                  ref="deviceTableRef"
                  v-loading="deviceLoading"
                  :data="filteredDeviceList"
                  border
                  height="400px"
                  row-key="id"
                  @selection-change="handleDeviceSelectionChange"
                  highlight-selection-row
                  data-cy="outbound-device-table"
                >
                  <el-table-column type="selection" width="55" align="center" :selectable="checkDeviceSelectable" />
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="deviceCode" label="设备编号" width="150">
                    <template #default="{ row }">
                      <div class="device-code-cell">
                        <el-icon :size="14" color="#409EFF"><Cpu /></el-icon>
                        <span>{{ row.deviceCode }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="deviceName" label="设备名称" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="deviceType" label="设备类型" width="120">
                    <template #default="{ row }">
                      <el-tag size="small" effect="plain">{{ row.deviceType }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="model" label="规格型号" width="120" show-overflow-tooltip />
                  <el-table-column prop="warehouseName" label="所在仓库" width="120" />
                  <el-table-column prop="location" label="货位" width="100" />
                  <el-table-column prop="status" label="状态" width="90" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getDeviceStatusType(row.status)" size="small">
                        {{ getDeviceStatusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="出库数量" width="120" align="center">
                    <template #default="{ row }">
                      <el-input-number
                        v-model="row.outQuantity"
                        :min="1"
                        :max="row.quantity || 1"
                        size="small"
                        controls-position="right"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="selection-summary">
                <div class="summary-item">
                  <el-icon :size="18" color="#409EFF"><Box /></el-icon>
                  <span
                    >已选择 <strong>{{ selectedDevices.length }}</strong> 台设备</span
                  >
                </div>
                <div class="summary-item" v-if="selectedDevices.length > 0">
                  <el-icon :size="18" color="#67C23A"><Goods /></el-icon>
                  <span
                    >总数量 <strong>{{ totalOutQuantity }}</strong> 件</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 2" key="step2" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><List /></el-icon> {{ getDetailStepTitle() }}
              </h3>
              <p>{{ getDetailStepDescription() }}</p>
            </div>

            <InstallationDetailForm
              v-if="formData.basic.outboundType === 1"
              ref="detailFormRef"
              v-model="formData.detail"
            />
            <RepairDetailForm
              v-else-if="formData.basic.outboundType === 2"
              ref="detailFormRef"
              v-model="formData.detail"
            />
            <MaintenanceDetailForm
              v-else-if="formData.basic.outboundType === 3"
              ref="detailFormRef"
              v-model="formData.detail"
            />
            <ScrapDetailForm
              v-else-if="formData.basic.outboundType === 4"
              ref="detailFormRef"
              v-model="formData.detail"
            />
            <TransferDetailForm
              v-else-if="formData.basic.outboundType === 5"
              ref="detailFormRef"
              v-model="formData.detail"
              :warehouse-list="warehouseList"
              :source-warehouse-id="formData.basic.warehouseId"
            />
            <OtherDetailForm v-else ref="detailFormRef" v-model="formData.detail" />
          </div>

          <div v-else-if="currentStep === 3" key="step3" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><CircleCheck /></el-icon> 确认提交
              </h3>
              <p>请仔细核对以下信息，确认无误后提交审批</p>
            </div>

            <div class="confirm-content">
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="基本信息" name="basic">
                  <template #title>
                    <div class="collapse-title">
                      <el-icon><Document /></el-icon>
                      <span>基本信息</span>
                      <el-tag type="success" size="small" v-if="isBasicInfoComplete">已填写</el-tag>
                      <el-tag type="warning" size="small" v-else>待完善</el-tag>
                    </div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="出库单号">
                      {{ formData.basic.orderNo || '自动生成' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="出库日期">
                      {{ formData.basic.orderDate || '未选择' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="出库类型">
                      <el-tag size="small">{{ getOutboundTypeText(formData.basic.outboundType) }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="源仓库">
                      {{ getWarehouseName(formData.basic.warehouseId) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="申请人">
                      {{ formData.basic.applicant || '未填写' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="联系电话">
                      {{ formData.basic.contactPhone || '未填写' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="出库原因" :span="2">
                      {{ formData.basic.reason || '无' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="备注" :span="2">
                      {{ formData.basic.remark || '无' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>

                <el-collapse-item title="设备列表" name="devices">
                  <template #title>
                    <div class="collapse-title">
                      <el-icon><Box /></el-icon>
                      <span>设备列表</span>
                      <el-tag type="success" size="small" v-if="selectedDevices.length > 0">
                        {{ selectedDevices.length }} 台
                      </el-tag>
                      <el-tag type="warning" size="small" v-else>未选择</el-tag>
                    </div>
                  </template>
                  <el-table :data="selectedDevices" size="small" border max-height="200" data-cy="outbound-selected-devices-table">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="deviceCode" label="设备编号" width="150" />
                    <el-table-column prop="deviceName" label="设备名称" min-width="150" />
                    <el-table-column prop="deviceType" label="设备类型" width="100">
                      <template #default="{ row }">
                        <el-tag size="small" effect="plain">{{ row.deviceType }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="model" label="规格型号" width="120" />
                    <el-table-column label="出库数量" width="100" align="center">
                      <template #default="{ row }">
                        {{ row.outQuantity || 1 }}
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>

                <el-collapse-item title="详细信息" name="detail">
                  <template #title>
                    <div class="collapse-title">
                      <el-icon><List /></el-icon>
                      <span>{{ getDetailStepTitle() }}</span>
                      <el-tag type="success" size="small" v-if="isDetailInfoComplete">已填写</el-tag>
                      <el-tag type="warning" size="small" v-else>待完善</el-tag>
                    </div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <template v-if="formData.basic.outboundType === 1">
                      <el-descriptions-item label="安装地址">{{
                        formData.detail.installationAddress || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="联系人">{{
                        formData.detail.contactPerson || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="联系电话">{{
                        formData.detail.contactPhone || '未填写'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else-if="formData.basic.outboundType === 2">
                      <el-descriptions-item label="故障描述" :span="2">{{
                        formData.detail.faultDescription || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="维修人员">{{
                        formData.detail.repairPerson || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="计划日期">{{
                        formData.detail.scheduledDate || '未选择'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else-if="formData.basic.outboundType === 3">
                      <el-descriptions-item label="保养内容" :span="2">{{
                        formData.detail.maintenanceContent || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="保养人员">{{
                        formData.detail.maintenancePerson || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="计划日期">{{
                        formData.detail.scheduledDate || '未选择'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else-if="formData.basic.outboundType === 4">
                      <el-descriptions-item label="报废原因" :span="2">{{
                        formData.detail.scrapReason || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="处理方式">{{
                        formData.detail.disposalMethod || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="申请人">{{
                        formData.detail.applicant || '未填写'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else-if="formData.basic.outboundType === 5">
                      <el-descriptions-item label="目标仓库">{{
                        getWarehouseName(formData.detail.targetWarehouseId)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="调拨原因" :span="2">{{
                        formData.detail.transferReason || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="接收人">{{
                        formData.detail.receiverName || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="联系电话">{{
                        formData.detail.receiverPhone || '未填写'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else>
                      <el-descriptions-item label="出库用途">{{
                        formData.detail.usage || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="详细说明" :span="2">{{
                        formData.detail.description || '未填写'
                      }}</el-descriptions-item>
                    </template>
                    <el-descriptions-item label="备注" :span="2">
                      {{ formData.detail.attachments?.length || 0 }} 个文件
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>

              <div class="confirm-actions">
                <el-checkbox v-model="confirmed" size="large"> 我已确认以上信息准确无误，同意提交审批 </el-checkbox>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <template #footer>
      <div class="wizard-footer">
        <div class="footer-left">
          <el-button link @click="handleSaveDraft" :loading="savingDraft" data-cy="outbound-save-draft-btn">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
          <span v-if="lastSaveTime" class="last-save-time"> 上次保存: {{ lastSaveTime }} </span>
        </div>
        <div class="footer-right">
          <el-button v-if="currentStep > 0" @click="handlePrev" data-cy="outbound-prev-btn">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="handleNext" :disabled="!canProceedToNext" data-cy="outbound-next-btn">
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-else type="success" :loading="submitting" :disabled="!confirmed" @click="handleSubmit" data-cy="outbound-submit-btn">
            <el-icon><Check /></el-icon>
            提交审批
          </el-button>
          <el-button @click="handleCancel" data-cy="outbound-cancel-btn">取消</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CircleCheck,
  Cpu,
  Delete,
  Document,
  Goods,
  List,
  MoreFilled,
  Phone,
  Search,
  SetUp,
  Sort,
  Tickets,
  Timer,
  Tools,
  Upload,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import InstallationDetailForm from './outbound-detail-forms/InstallationDetailForm.vue';
import MaintenanceDetailForm from './outbound-detail-forms/MaintenanceDetailForm.vue';
import OtherDetailForm from './outbound-detail-forms/OtherDetailForm.vue';
import RepairDetailForm from './outbound-detail-forms/RepairDetailForm.vue';
import ScrapDetailForm from './outbound-detail-forms/ScrapDetailForm.vue';
import TransferDetailForm from './outbound-detail-forms/TransferDetailForm.vue';

import { STOCK_ORDERS_UNIFIED_API } from '@/constants/apiConstants';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('OutboundCreationWizard');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  warehouseList: {
    type: Array,
    default: () => [],
  },
  userList: {
    type: Array,
    default: () => [],
  },
  deviceList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'save-draft']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const baseSteps = [
  { title: '基本信息', description: '填写出库单基础信息' },
  { title: '设备选择', description: '选择出库设备' },
  { title: '详细信息', description: '填写详细信息' },
  { title: '确认提交', description: '核对并提交申请' },
];

const stepTitlesByType = {
  1: { title: '安装信息', description: '填写安装地址和联系人' },
  2: { title: '维修信息', description: '填写故障描述和维修安排' },
  3: { title: '保养信息', description: '填写保养内容和时间安排' },
  4: { title: '报废信息', description: '填写报废原因和处理方式' },
  5: { title: '调拨信息', description: '填写目标仓库和接收人' },
  6: { title: '详细信息', description: '填写出库用途和说明' },
};

const currentSteps = computed(() => {
  const steps = [...baseSteps];
  const type = formData.basic.outboundType;
  if (type && stepTitlesByType[type]) {
    steps[2] = {
      title: stepTitlesByType[type].title,
      description: stepTitlesByType[type].description,
    };
  }
  return steps;
});

const currentStep = ref(0);
const submitting = ref(false);
const savingDraft = ref(false);
const confirmed = ref(false);
const lastSaveTime = ref('');
const deviceLoading = ref(false);

const basicFormRef = ref(null);
const detailFormRef = ref(null);
const deviceTableRef = ref(null);

const deviceSearchKeyword = ref('');
const deviceTypeFilter = ref('');
const deviceStatusFilter = ref('');
const selectedDevices = ref([]);
const activeCollapse = ref(['basic', 'devices', 'detail']);

const deviceTypes = ref([
  { label: '服务器', value: 'server' },
  { label: '网络设备', value: 'network' },
  { label: '存储设备', value: 'storage' },
  { label: '终端设备', value: 'terminal' },
]);

const getInitialDetail = () => ({
  // 安装出库字段
  projectName: '',
  projectNo: '',
  installationAddress: '',
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  backupPhone: '',
  requiredInstallDate: '',
  installTimeSlot: '',
  installRequirements: '',
  // 维修出库字段
  repairNo: '',
  faultType: '',
  faultDescription: '',
  faultSymptoms: '',
  reporterName: '',
  reporterDept: '',
  reporterPhone: '',
  reportDate: '',
  repairMethod: 'internal',
  repairUnit: '',
  repairContact: '',
  repairPhone: '',
  repairAddress: '',
  requiredCompleteDate: '',
  urgencyLevel: 'normal',
  // 保养出库字段
  maintenanceNo: '',
  maintenanceType: '',
  maintenanceContent: [],
  maintenanceDescription: '',
  applicantName: '',
  applicantDept: '',
  applicantPhone: '',
  applyDate: '',
  maintenanceMethod: 'internal',
  maintenanceUnit: '',
  maintenanceContact: '',
  maintenancePhone: '',
  maintenanceAddress: '',
  planStartDate: '',
  planEndDate: '',
  estimatedHours: 1,
  priority: 'medium',
  // 报废出库字段
  scrapNo: '',
  scrapType: '',
  scrapReason: '',
  deviceCondition: '',
  originalValue: 0,
  usedYears: 0,
  residualValue: 0,
  disposalMethod: '',
  technicalAppraisal: 'passed',
  appraiser: '',
  appraisalOpinion: '',
  // 调拨出库字段
  targetWarehouseId: '',
  transferType: '',
  transferReason: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  requiredDate: '',
  transportMethod: '',
  // 其他出库字段
  usage: '',
  expectedReturnDate: '',
  description: '',
  handler: '',
  handlerPhone: '',
  deliveryAddress: '',
  shippingMethod: '',
  // 通用字段
  remark: '',
  attachments: [],
});

const formData = reactive({
  basic: {
    orderNo: '',
    orderDate: null,
    outboundType: '',
    warehouseId: '',
    applicant: '',
    contactPhone: '',
    reason: '',
    remark: '',
  },
  detail: getInitialDetail(),
});

const basicRules = {
  orderDate: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
  outboundType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择源仓库', trigger: 'change' }],
  applicant: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  reason: [{ required: true, message: '请输入出库原因', trigger: 'blur' }],
};

const progressPercentage = computed(() => {
  return Math.round((currentStep.value / (currentSteps.value.length - 1)) * 100);
});

const progressColor = computed(() => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#67C23A'];
  return colors[currentStep.value];
});

const canProceedToNext = computed(() => {
  if (currentStep.value === 0) {
    return !!(
      formData.basic.orderDate &&
      formData.basic.outboundType &&
      formData.basic.warehouseId &&
      formData.basic.applicant &&
      formData.basic.contactPhone &&
      formData.basic.reason
    );
  }
  if (currentStep.value === 1) {
    return selectedDevices.value.length > 0;
  }
  if (currentStep.value === 2) {
    return isDetailInfoComplete.value;
  }
  return true;
});

const isBasicInfoComplete = computed(() => {
  return !!(
    formData.basic.orderDate &&
    formData.basic.outboundType &&
    formData.basic.warehouseId &&
    formData.basic.applicant &&
    formData.basic.contactPhone &&
    formData.basic.reason
  );
});

const isDetailInfoComplete = computed(() => {
  const type = formData.basic.outboundType;
  const { detail } = formData;

  switch (type) {
    case 1:
      return !!(
        detail.projectName &&
        detail.installationAddress &&
        detail.customerName &&
        detail.contactPerson &&
        detail.contactPhone &&
        detail.requiredInstallDate
      );
    case 2:
      return !!(
        detail.repairNo &&
        detail.faultType &&
        detail.faultDescription &&
        detail.reporterName &&
        detail.reporterPhone &&
        detail.reportDate &&
        detail.requiredCompleteDate
      );
    case 3:
      return !!(
        detail.maintenanceNo &&
        detail.maintenanceType &&
        detail.maintenanceContent?.length > 0 &&
        detail.applicantName &&
        detail.applicantPhone &&
        detail.applyDate &&
        detail.planStartDate &&
        detail.planEndDate
      );
    case 4:
      return !!(
        detail.scrapNo &&
        detail.scrapType &&
        detail.scrapReason &&
        detail.applicantName &&
        detail.applicantPhone &&
        detail.applyDate &&
        detail.disposalMethod &&
        detail.appraiser
      );
    case 5:
      return !!(
        detail.targetWarehouseId &&
        detail.transferType &&
        detail.transferReason &&
        detail.receiverName &&
        detail.receiverPhone &&
        detail.requiredDate
      );
    case 6:
      return !!(detail.usage && detail.description && detail.handler && detail.handlerPhone);
    default:
      return false;
  }
});

const filteredDeviceList = computed(() => {
  let list = props.deviceList;

  if (deviceSearchKeyword.value) {
    const keyword = deviceSearchKeyword.value.toLowerCase();
    list = list.filter(
      (device) =>
        device.deviceCode?.toLowerCase().includes(keyword) ||
        device.deviceName?.toLowerCase().includes(keyword) ||
        device.model?.toLowerCase().includes(keyword)
    );
  }

  if (deviceTypeFilter.value) {
    list = list.filter((device) => device.deviceType === deviceTypeFilter.value);
  }

  if (deviceStatusFilter.value) {
    list = list.filter((device) => device.status === deviceStatusFilter.value);
  }

  return list;
});

const totalOutQuantity = computed(() => {
  return selectedDevices.value.reduce((sum, d) => sum + (d.outQuantity || 1), 0);
});

const disabledDate = (date) => {
  return date < new Date(new Date().setHours(0, 0, 0, 0));
};

const getOutboundTypeText = (type) => {
  const typeMap = {
    1: '安装出库',
    2: '维修出库',
    3: '保养出库',
    4: '报废出库',
    5: '调拨出库',
    6: '其他出库',
  };
  return typeMap[type] || '未知类型';
};

const getWarehouseName = (id) => {
  const warehouse = props.warehouseList.find((w) => w.id === id);
  return warehouse?.name || '未选择';
};

const getUserName = (id) => {
  const user = props.userList.find((u) => u.id === id);
  return user?.name || '未选择';
};

const getShippingMethodText = (method) => {
  const methodMap = {
    self_pickup: '自提',
    express: '快递配送',
    dedicated: '专车配送',
    logistics: '物流运输',
  };
  return methodMap[method] || '未选择';
};

const getTransferTypeText = (type) => {
  const typeMap = {
    normal: '正常调拨',
    emergency: '紧急调拨',
    borrow: '借调',
  };
  return typeMap[type] || '未选择';
};

const getTransportMethodText = (method) => {
  const methodMap = {
    self_pickup: '自提',
    express: '快递',
    logistics: '物流',
    dedicated: '专车',
  };
  return methodMap[method] || '未选择';
};

const getUsageText = (usage) => {
  const usageMap = {
    borrow: '借用',
    trial: '试用',
    display: '展示',
    test: '测试',
    other: '其他',
  };
  return usageMap[usage] || '未选择';
};

const getDeviceStatusType = (status) => {
  const statusTypeMap = {
    in_stock: 'success',
    available: 'primary',
    in_use: 'warning',
    maintenance: 'info',
    scrapped: 'danger',
  };
  return statusTypeMap[status] || 'info';
};

const getDeviceStatusText = (status) => {
  const statusTextMap = {
    in_stock: '在库',
    available: '可用',
    in_use: '使用中',
    maintenance: '维护中',
    scrapped: '已报废',
  };
  return statusTextMap[status] || '未知';
};

const getDetailStepTitle = () => {
  const type = formData.basic.outboundType;
  return stepTitlesByType[type]?.title || '详细信息';
};

const getDetailStepDescription = () => {
  const type = formData.basic.outboundType;
  return stepTitlesByType[type]?.description || '填写详细信息';
};

const getDetailStepTip = () => {
  const type = formData.basic.outboundType;
  const tips = {
    1: '请填写安装项目、客户信息和安装地址',
    2: '请填写故障描述、报修信息和时间安排',
    3: '请填写保养内容、申请信息和时间安排',
    4: '请填写报废原因、资产信息和处理方式',
    5: '请填写目标仓库、接收人和调拨原因',
    6: '请填写出库用途和详细说明',
  };
  return tips[type] || '请填写详细信息';
};

const checkDeviceSelectable = (row) => {
  return row.status === 'in_stock' || row.status === 'available';
};

const handleOutboundTypeChange = (type) => {
  logger.info('出库类型变更', { type });
  formData.detail = getInitialDetail();
};

const handleDeviceSearch = () => {
  logger.info('设备搜索', {
    keyword: deviceSearchKeyword.value,
    type: deviceTypeFilter.value,
    status: deviceStatusFilter.value,
  });
};

const handleDeviceSelectionChange = (selection) => {
  selectedDevices.value = selection.map((d) => ({
    ...d,
    outQuantity: d.outQuantity || 1,
  }));
};

const clearDeviceSelection = () => {
  selectedDevices.value = [];
  deviceTableRef.value?.clearSelection();
};

const goToStep = (index) => {
  if (index <= currentStep.value || (index === currentStep.value + 1 && canProceedToNext.value)) {
    currentStep.value = index;
  }
};

const validateCurrentStep = async () => {
  if (currentStep.value === 0) {
    return await basicFormRef.value?.validate().catch(() => false);
  }
  if (currentStep.value === 1) {
    if (selectedDevices.value.length === 0) {
      ElMessage.warning('请至少选择一台设备');
      return false;
    }
    return true;
  }
  if (currentStep.value === 2) {
    return await detailFormRef.value?.validate().catch(() => false);
  }
  return true;
};

const handleNext = async () => {
  const valid = await validateCurrentStep();
  if (valid) {
    currentStep.value++;
    if (currentStep.value === 3) {
      activeCollapse.value = ['basic', 'devices', 'detail'];
    }
  }
};

const handlePrev = () => {
  currentStep.value--;
};

const handleSaveDraft = async () => {
  savingDraft.value = true;
  try {
    const draftData = {
      step: currentStep.value,
      formData: JSON.parse(JSON.stringify(formData)),
      selectedDevices: JSON.parse(JSON.stringify(selectedDevices.value)),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('outbound_wizard_draft', JSON.stringify(draftData));

    lastSaveTime.value = new Date().toLocaleTimeString('zh-CN');

    ElMessage.success('草稿保存成功');
    emit('save-draft', draftData);
  } catch (error) {
    logger.error('保存草稿失败', error);
    ElMessage.error('保存草稿失败');
  } finally {
    savingDraft.value = false;
  }
};

const loadDraft = () => {
  const draftStr = localStorage.getItem('outbound_wizard_draft');
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      const savedTime = new Date(draft.savedAt);
      const now = new Date();
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        ElMessageBox.confirm('检测到未完成的出库申请草稿，是否恢复？', '恢复草稿', {
          confirmButtonText: '恢复',
          cancelButtonText: '重新开始',
          type: 'info',
        })
          .then(() => {
            currentStep.value = draft.step;
            Object.assign(formData.basic, draft.formData.basic);
            Object.assign(formData.detail, draft.formData.detail);
            selectedDevices.value = draft.selectedDevices;
            ElMessage.success('草稿已恢复');
          })
          .catch(() => {
            localStorage.removeItem('outbound_wizard_draft');
          });
      } else {
        localStorage.removeItem('outbound_wizard_draft');
      }
    } catch (e) {
      logger.error('加载草稿失败', e);
      localStorage.removeItem('outbound_wizard_draft');
    }
  }
};

const generateOrderNo = async () => {
  try {
    const response = await request.get(STOCK_ORDERS_UNIFIED_API.GENERATE_NO, {
      params: { orderType: 'OUTBOUND' },
    });
    if (response.data?.success) {
      formData.basic.orderNo = response.data.data;
    }
  } catch (error) {
    logger.error('生成单号失败', error);
    formData.basic.orderNo = `CK${Date.now()}`;
  }
};

const handleSubmit = async () => {
  if (!confirmed.value) {
    ElMessage.warning('请勾选确认选项');
    return;
  }

  submitting.value = true;
  try {
    const submitData = {
      orderType: 2,
      outboundType: formData.basic.outboundType,
      orderDate: formData.basic.orderDate,
      warehouseId: formData.basic.warehouseId,
      applicant: formData.basic.applicant,
      contactPhone: formData.basic.contactPhone,
      reason: formData.basic.reason,
      remark: formData.basic.remark,
      items: selectedDevices.value.map((d) => ({
        deviceId: d.id,
        deviceCode: d.deviceCode,
        deviceName: d.deviceName,
        quantity: d.outQuantity || 1,
      })),
      ...formData.detail,
    };

    // 触发submit事件，由父组件处理API调用
    emit('submit', submitData);

    localStorage.removeItem('outbound_wizard_draft');
    visible.value = false;
    resetForm();
  } catch (error) {
    logger.error('提交失败', error);
    ElMessage.error(`提交失败：${error.message || '网络错误'}`);
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  const hasData =
    formData.basic.outboundType || selectedDevices.value.length > 0 || formData.detail.installationAddress;

  if (hasData) {
    ElMessageBox.confirm('确定要取消吗？未保存的数据将丢失。', '提示', {
      confirmButtonText: '确定取消',
      cancelButtonText: '继续编辑',
      type: 'warning',
    })
      .then(() => {
        visible.value = false;
        resetForm();
      })
      .catch(() => {});
  } else {
    visible.value = false;
    resetForm();
  }
};

const handleDialogClose = () => {
  resetForm();
};

const resetForm = () => {
  currentStep.value = 0;
  selectedDevices.value = [];
  confirmed.value = false;
  lastSaveTime.value = '';

  formData.basic = {
    orderNo: '',
    orderDate: null,
    outboundType: '',
    warehouseId: '',
    applicant: '',
    contactPhone: '',
    reason: '',
    remark: '',
  };

  formData.detail = getInitialDetail();

  basicFormRef.value?.resetFields();
};

watch(visible, (val) => {
  if (val) {
    generateOrderNo();
    loadDraft();
  }
});

onMounted(() => {
  if (visible.value) {
    generateOrderNo();
    loadDraft();
  }
});

onBeforeUnmount(() => {
  if (currentStep.value < 3 || !confirmed.value) {
    handleSaveDraft();
  }
});
</script>

<style scoped lang="scss">
.outbound-wizard-dialog {
  :deep(.el-dialog) {
    max-width: 1400px;
    height: 90vh;
    margin: 5vh auto;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    height: calc(100% - 120px);
    overflow: hidden;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #ebeef5;
    padding: 16px 24px;
  }
}

.wizard-container {
  display: flex;
  height: 100%;
  background: #f5f7fa;
}

.wizard-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%);
  padding: 24px;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.wizard-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.step-navigation {
  flex: 1;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: default;
  transition: all 0.3s ease;
  position: relative;

  &.active {
    background: rgba(64, 158, 255, 0.2);

    .step-number {
      background: #409eff;
      color: #fff;
    }

    .step-title {
      color: #409eff;
      font-weight: 600;
    }
  }

  &.completed {
    .step-number {
      background: #67c23a;
      color: #fff;
    }

    .step-title {
      color: #67c23a;
    }
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-info {
  margin-left: 12px;
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  transition: color 0.3s ease;
}

.step-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.step-connector {
  position: absolute;
  left: 26px;
  top: 52px;
  width: 2px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);

  &.completed {
    background: #67c23a;
  }
}

.wizard-progress {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .progress-text {
    display: block;
    margin-top: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }
}

.wizard-tips {
  margin-top: 16px;

  :deep(.el-alert) {
    background: rgba(255, 255, 255, 0.1);
    border: none;

    .el-alert__title {
      color: #fff;
    }
  }
}

.wizard-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.wizard-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.device-selection-area {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selection-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  .toolbar-left {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.device-table-wrapper {
  margin-bottom: 16px;
}

.device-code-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.selection-summary {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;

    strong {
      color: #409eff;
      font-size: 16px;
    }
  }
}

.confirm-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.confirm-actions {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .last-save-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .footer-right {
    display: flex;
    gap: 8px;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .wizard-container {
    flex-direction: column;
  }

  .wizard-sidebar {
    width: 100%;
    padding: 16px;
  }

  .step-navigation {
    display: flex;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px;
  }

  .step-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 80px;
  }

  .step-connector {
    display: none;
  }

  .wizard-main {
    padding: 16px;
  }

  .selection-toolbar {
    flex-direction: column;
    align-items: stretch;

    .toolbar-left,
    .toolbar-right {
      flex-direction: column;
    }
  }
}
</style>
