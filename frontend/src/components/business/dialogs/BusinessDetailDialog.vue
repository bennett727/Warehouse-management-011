<!--
  @file: BusinessDetailDialog.vue
  @description: 业务详情对话框组件 - 展示业务单据详细信息
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="visible"
    title="业务详情"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    class="business-detail-dialog"
  >
    <div class="detail-content" v-if="business">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="业务编号">
              <el-tag type="primary">{{ business.businessNo }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="业务类型">
              <el-tag :type="getBusinessTypeTag(business.businessType)">
                {{ getBusinessTypeText(business.businessType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请人">{{ business.applicant }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ business.applyTime }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusTagType(business.status)">
                {{ getStatusText(business.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前审批人">{{ business.currentApprover || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ business.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ business.updateTime }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ business.remark || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="设备清单" name="devices">
          <el-table :data="business.devices || []" border stripe max-height="400">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="deviceCode" label="设备编号" width="140" />
            <el-table-column prop="deviceName" label="设备名称" min-width="150" />
            <el-table-column prop="deviceType" label="设备类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.deviceType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="warehouseName" label="仓库" width="120" />
          </el-table>
          <el-empty v-if="!business.devices?.length" description="暂无设备数据" />
        </el-tab-pane>

        <el-tab-pane label="审批记录" name="approval">
          <el-timeline v-if="business.approvalHistory?.length">
            <el-timeline-item
              v-for="(item, index) in business.approvalHistory"
              :key="index"
              :type="getTimelineType(item.action)"
              :timestamp="item.time"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="action-text">{{ item.actionText }}</span>
                  <el-tag :type="getActionTagType(item.action)" size="small">
                    {{ item.statusText }}
                  </el-tag>
                </div>
                <div class="timeline-body">
                  <span class="operator">操作人：{{ item.operator }}</span>
                  <span v-if="item.comment" class="comment">意见：{{ item.comment }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无审批记录" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button v-if="business?.status === 'pending'" type="success" @click="$emit('approve', business)">
          去审批
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  business: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'approve']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const activeTab = ref('basic');

const BUSINESS_TYPE_MAP = {
  outbound: { text: '出库', type: 'primary' },
  inbound: { text: '入库', type: 'success' },
  transfer: { text: '调拨', type: 'warning' },
  installation: { text: '安装', type: 'info' },
  repair: { text: '维修', type: 'warning' },
  scrap: { text: '报废', type: 'danger' },
};

const STATUS_MAP = {
  draft: { text: '草稿', type: 'info' },
  pending: { text: '待审批', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  executing: { text: '执行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' },
};

const ACTION_TYPE_MAP = {
  submit: { timeline: 'primary', tag: 'primary' },
  approve: { timeline: 'success', tag: 'success' },
  reject: { timeline: 'danger', tag: 'danger' },
  withdraw: { timeline: 'warning', tag: 'warning' },
};

const getBusinessTypeText = (type) => BUSINESS_TYPE_MAP[type]?.text || type;
const getBusinessTypeTag = (type) => BUSINESS_TYPE_MAP[type]?.type || 'info';
const getStatusText = (status) => STATUS_MAP[status]?.text || status;
const getStatusTagType = (status) => STATUS_MAP[status]?.type || 'info';
const getTimelineType = (action) => ACTION_TYPE_MAP[action]?.timeline || 'info';
const getActionTagType = (action) => ACTION_TYPE_MAP[action]?.tag || 'info';
</script>

<style scoped>
.business-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.timeline-content {
  padding: 8px 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.action-text {
  font-weight: 500;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
