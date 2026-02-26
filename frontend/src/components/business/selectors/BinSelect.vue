<!--
  @file: BinSelect.vue
  @description: 货位选择组件，支持智能推荐、按区域筛选和货位属性筛选 - 优化版
  @author: 开发团队
  @createTime: 2026-02-07
  @version: 2.0 - 增加智能推荐功能
  @modifyRecords:
      2026-02-07: 初始版本创建
      2026-02-13: 优化版本 - 增加设备类型智能推荐、推荐货位优先展示
-->
<template>
  <div class="bin-select-container">
    <!-- 智能推荐提示 -->
    <div v-if="showRecommendation && recommendedBins.length > 0" class="recommendation-section">
      <div class="recommendation-header">
        <el-icon><StarFilled /></el-icon>
        <span>智能推荐货位</span>
        <el-tag size="small" type="warning">{{ recommendedBins.length }}个</el-tag>
      </div>
      <div class="recommendation-list">
        <el-tag
          v-for="bin in recommendedBins.slice(0, 3)"
          :key="bin.id"
          class="recommendation-tag"
          :type="selectedBin === bin.id ? 'primary' : 'info'"
          :effect="selectedBin === bin.id ? 'dark' : 'plain'"
          @click="handleRecommendClick(bin)"
        >
          {{ bin.code }}
          <el-icon v-if="selectedBin === bin.id"><Check /></el-icon>
        </el-tag>
      </div>
    </div>

    <el-select
      v-model="selectedBin"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :filterable="filterable"
      :loading="loading"
      :remote="remote"
      :remote-method="remoteMethod"
      style="width: 100%"
      @change="handleChange"
      @clear="handleClear"
      data-cy="bin-select"
    >
      <template #prefix>
        <el-icon><Box /></el-icon>
      </template>

      <!-- 推荐货位分组 -->
      <el-option-group v-if="groupByRecommendation && recommendedBins.length > 0" label="⭐ 推荐货位">
        <el-option
          v-for="bin in recommendedBins"
          :key="bin.id"
          :label="getBinLabel(bin)"
          :value="bin.id"
          :disabled="bin.status !== 'AVAILABLE'"
        >
          <div class="bin-option recommended">
            <div class="bin-option-main">
              <span class="bin-code">{{ bin.code }}</span>
              <el-tag type="warning" size="small" effect="dark">推荐</el-tag>
              <el-tag v-if="showStatus" :type="getBinStatusType(bin.status)" size="small">
                {{ getBinStatusText(bin.status) }}
              </el-tag>
            </div>
            <div class="bin-option-detail">
              <span>{{ bin.area?.location || bin.areaName || '' }}</span>
              <span class="bin-location">{{ bin.zone }}-{{ bin.row }}-{{ bin.column }}-{{ bin.level }}</span>
              <span v-if="bin.matchScore" class="match-score">匹配度: {{ bin.matchScore }}%</span>
            </div>
          </div>
        </el-option>
      </el-option-group>

      <!-- 其他可用货位 -->
      <el-option-group label="📦 其他货位">
        <el-option
          v-for="bin in otherBins"
          :key="bin.id"
          :label="getBinLabel(bin)"
          :value="bin.id"
          :disabled="bin.status !== 'AVAILABLE'"
        >
          <div class="bin-option">
            <div class="bin-option-main">
              <span class="bin-code">{{ bin.code }}</span>
              <el-tag v-if="showStatus" :type="getBinStatusType(bin.status)" size="small">
                {{ getBinStatusText(bin.status) }}
              </el-tag>
            </div>
            <div class="bin-option-detail">
              <span>{{ bin.area?.location || bin.areaName || '' }}</span>
              <span class="bin-location">{{ bin.zone }}-{{ bin.row }}-{{ bin.column }}-{{ bin.level }}</span>
            </div>
          </div>
        </el-option>
      </el-option-group>

      <!-- 空状态 -->
      <template #empty>
        <el-empty description="暂无可用货位" :image-size="60">
          <template #description>
            <p>暂无可用货位</p>
            <p v-if="deviceType" class="empty-tip">建议检查设备类型与货位类型的匹配</p>
          </template>
        </el-empty>
      </template>
    </el-select>

    <!-- 货位匹配说明 -->
    <div v-if="deviceType && showMatchHint" class="match-hint">
      <el-icon><InfoFilled /></el-icon>
      <span>正在为您推荐适合"{{ getDeviceTypeLabel(deviceType) }}"设备的货位</span>
    </div>
  </div>
</template>

<script setup>
import { Box, StarFilled, Check, InfoFilled } from '@element-plus/icons-vue';
import { computed, onMounted, ref, watch } from 'vue';

import { getAvailableBins, getBinList } from '@/api/inventory/bin';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BinSelect');

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  placeholder: {
    type: String,
    default: '请选择货位',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  filterable: {
    type: Boolean,
    default: true,
  },
  remote: {
    type: Boolean,
    default: false,
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
  areaId: {
    type: [Number, String],
    default: null,
  },
  warehouseId: {
    type: [Number, String],
    default: null,
  },
  binType: {
    type: String,
    default: null,
  },
  onlyAvailable: {
    type: Boolean,
    default: true,
  },
  // 新增：设备类型，用于智能推荐
  deviceType: {
    type: String,
    default: null,
  },
  // 新增：是否显示智能推荐
  showRecommendation: {
    type: Boolean,
    default: true,
  },
  // 新增：是否按推荐分组显示
  groupByRecommendation: {
    type: Boolean,
    default: true,
  },
  // 新增：是否显示匹配提示
  showMatchHint: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'clear']);

const selectedBin = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);
const binList = ref([]);
const allBins = ref([]);

// 设备类型与货位类型的匹配映射
const deviceTypeToBinTypeMap = {
  // 冷藏设备 -> 冷藏货位、普通货位
  REFRIGERATED: ['REFRIGERATED', 'NORMAL'],
  COLD_CHAIN: ['REFRIGERATED', 'NORMAL'],
  // 危险品 -> 危险品货位
  HAZARDOUS: ['HAZARDOUS'],
  CHEMICAL: ['HAZARDOUS'],
  // 易碎品 -> 易碎品货位、普通货位
  FRAGILE: ['FRAGILE', 'NORMAL'],
  GLASS: ['FRAGILE', 'NORMAL'],
  // 重货 -> 重货货位
  HEAVY: ['HEAVY', 'NORMAL'],
  METAL: ['HEAVY', 'NORMAL'],
  // 轻货 -> 轻货货位
  LIGHT: ['LIGHT', 'NORMAL'],
  TEXTILE: ['LIGHT', 'NORMAL'],
  // 普通设备 -> 普通货位
  NORMAL: ['NORMAL'],
  GENERAL: ['NORMAL'],
  // 电子产品 -> 普通货位、轻货货位
  ELECTRONIC: ['NORMAL', 'LIGHT'],
  // 默认 -> 普通货位
  DEFAULT: ['NORMAL'],
};

// 获取设备类型标签
function getDeviceTypeLabel(type) {
  const labelMap = {
    REFRIGERATED: '冷藏设备',
    COLD_CHAIN: '冷链设备',
    HAZARDOUS: '危险品',
    CHEMICAL: '化学品',
    FRAGILE: '易碎品',
    GLASS: '玻璃制品',
    HEAVY: '重货',
    METAL: '金属制品',
    LIGHT: '轻货',
    TEXTILE: '纺织品',
    NORMAL: '普通设备',
    GENERAL: '通用设备',
    ELECTRONIC: '电子产品',
  };
  return labelMap[type] || type || '普通设备';
}

// 计算推荐货位列表
const recommendedBins = computed(() => {
  if (!props.deviceType || !props.showRecommendation) {
    return [];
  }

  const compatibleTypes = deviceTypeToBinTypeMap[props.deviceType] || deviceTypeToBinTypeMap.DEFAULT;

  return binList.value
    .filter((bin) => {
      // 只推荐可用货位
      if (bin.status !== 'AVAILABLE') {
        return false;
      }
      // 匹配货位类型
      return compatibleTypes.includes(bin.type);
    })
    .map((bin) => {
      // 计算匹配分数
      let matchScore = 100;
      if (bin.type === 'NORMAL') {
        matchScore = 80; // 普通货位匹配度稍低
      }
      return {
        ...bin,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
});

// 其他货位（非推荐）
const otherBins = computed(() => {
  const recommendedIds = new Set(recommendedBins.value.map((b) => b.id));
  return binList.value.filter((bin) => !recommendedIds.has(bin.id));
});

function getBinLabel(bin) {
  const parts = [];
  if (bin.code) {
    parts.push(bin.code);
  }
  if (bin.area?.location || bin.areaName) {
    parts.push(bin.area?.location || bin.areaName);
  }
  if (bin.zone) {
    parts.push(`${bin.zone}-${bin.row}-${bin.column}-${bin.level}`);
  }
  return parts.join(' | ');
}

function getBinStatusType(status) {
  const typeMap = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    LOCKED: 'warning',
    MAINTENANCE: 'info',
    DISABLED: 'info',
  };
  return typeMap[status] || 'info';
}

function getBinStatusText(status) {
  const textMap = {
    AVAILABLE: '可用',
    OCCUPIED: '已占用',
    LOCKED: '已锁定',
    MAINTENANCE: '维护中',
    DISABLED: '已禁用',
  };
  return textMap[status] || status;
}

async function loadBinList() {
  loading.value = true;
  try {
    const params = {};

    if (props.areaId) {
      params.areaId = props.areaId;
    }
    if (props.warehouseId) {
      params.warehouseId = props.warehouseId;
    }
    // 如果有设备类型，不过滤货位类型，让前端进行智能推荐
    if (props.binType && !props.deviceType) {
      params.type = props.binType;
    }
    if (props.onlyAvailable) {
      params.status = 'AVAILABLE';
    }

    const apiFunc = props.onlyAvailable ? getAvailableBins : getBinList;
    const response = await apiFunc(params);

    if (response.success) {
      binList.value = response.data?.list || response.data || [];
      allBins.value = [...binList.value];
    } else {
      binList.value = [];
      allBins.value = [];
    }
  } catch (error) {
    logger.error('加载货位列表失败', error);
    binList.value = [];
    allBins.value = [];
  } finally {
    loading.value = false;
  }
}

function remoteMethod(query) {
  if (query) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      binList.value = allBins.value.filter((bin) => {
        const label = getBinLabel(bin).toLowerCase();
        return label.includes(query.toLowerCase());
      });
    }, 300);
  } else {
    binList.value = allBins.value;
  }
}

function handleChange(value) {
  const selectedBinData = binList.value.find((bin) => bin.id === value);
  emit('change', value, selectedBinData);
}

function handleClear() {
  emit('clear');
}

// 处理推荐货位点击
function handleRecommendClick(bin) {
  selectedBin.value = bin.id;
  handleChange(bin.id);
}

onMounted(() => {
  loadBinList();
});

watch(
  () => props.areaId,
  () => {
    loadBinList();
  }
);

watch(
  () => props.warehouseId,
  () => {
    loadBinList();
  }
);

watch(
  () => props.binType,
  () => {
    loadBinList();
  }
);

watch(
  () => props.onlyAvailable,
  () => {
    loadBinList();
  }
);

watch(
  () => props.deviceType,
  () => {
    // 设备类型变化时，重新计算推荐，但不需要重新加载列表
    logger.info('设备类型变化:', props.deviceType);
  }
);
</script>

<style scoped lang="scss">
.bin-select-container {
  width: 100%;
}

// 智能推荐区域
.recommendation-section {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
  border-radius: 8px;
  border: 1px solid #ffe4b3;

  .recommendation-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #e6a23c;

    .el-icon {
      font-size: 16px;
    }
  }

  .recommendation-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .recommendation-tag {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

// 货位选项样式
.bin-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;

  &.recommended {
    background: rgba(255, 243, 224, 0.5);
    margin: -6px -12px;
    padding: 6px 12px;
    border-radius: 4px;
  }

  .bin-option-main {
    display: flex;
    align-items: center;
    gap: 8px;

    .bin-code {
      font-weight: 500;
      color: #303133;
    }
  }

  .bin-option-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: #909399;

    .bin-location {
      font-family: 'Courier New', monospace;
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .match-score {
      color: #e6a23c;
      font-weight: 500;
    }
  }
}

// 匹配提示
.match-hint {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;

  .el-icon {
    color: #409eff;
  }
}

// 空状态提示
.empty-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

:deep(.el-select__placeholder) {
  color: #a8abb2;
}

:deep(.el-select__prefix) {
  color: #909399;
}

:deep(.el-select-group__title) {
  font-weight: 500;
  color: #606266;
  padding-left: 12px;
}
</style>
