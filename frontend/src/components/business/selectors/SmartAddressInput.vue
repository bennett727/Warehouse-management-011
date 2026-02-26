<template>
  <div class="smart-address-input">
    <el-input
      v-model="inputValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :size="size"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      style="width: 100%"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      data-cy="smart-address-input"
    >
      <template #prefix>
        <el-icon><Location /></el-icon>
      </template>
      <template #suffix>
        <el-tooltip v-if="showAutoFillTip" content="已根据行政区划自动填充" placement="top">
          <el-icon class="auto-fill-icon"><CircleCheck /></el-icon>
        </el-tooltip>
      </template>
    </el-input>

    <!-- 智能提示下拉框 -->
    <el-popover
      v-model:visible="suggestionsVisible"
      placement="bottom-start"
      :width="popoverWidth"
      trigger="manual"
      popper-class="address-suggestions-popover"
    >
      <template #reference>
        <div></div>
      </template>

      <div class="address-suggestions">
        <div class="suggestions-header">
          <span>地址建议</span>
          <el-button link size="small" @click="suggestionsVisible = false" data-cy="smart-address-close-btn"> 关闭 </el-button>
        </div>

        <!-- 基于行政区划的建议 -->
        <div v-if="divisionBasedSuggestions.length > 0" class="suggestion-group">
          <div class="group-title">基于行政区划</div>
          <div
            v-for="(item, index) in divisionBasedSuggestions"
            :key="`division-${index}`"
            class="suggestion-item"
            @click="selectSuggestion(item)"
          >
            <el-icon><MapLocation /></el-icon>
            <span class="suggestion-text">{{ item }}</span>
          </div>
        </div>

        <!-- 历史地址建议 -->
        <div v-if="historySuggestions.length > 0" class="suggestion-group">
          <div class="group-title">历史地址</div>
          <div
            v-for="(item, index) in historySuggestions"
            :key="`history-${index}`"
            class="suggestion-item"
            @click="selectSuggestion(item)"
          >
            <el-icon><Clock /></el-icon>
            <span class="suggestion-text">{{ item }}</span>
          </div>
        </div>

        <!-- 常用地址模板 -->
        <div v-if="templateSuggestions.length > 0" class="suggestion-group">
          <div class="group-title">常用模板</div>
          <div
            v-for="(item, index) in templateSuggestions"
            :key="`template-${index}`"
            class="suggestion-item"
            @click="selectSuggestion(item.template)"
          >
            <el-icon><Document /></el-icon>
            <span class="suggestion-text">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </el-popover>

    <!-- 地址解析结果展示 -->
    <div v-if="showParseResult && parsedAddress" class="parse-result">
      <el-alert
        :title="`地址解析: ${parsedAddress.province || ''} ${parsedAddress.city || ''} ${parsedAddress.district || ''}`"
        type="success"
        :closable="true"
        @close="showParseResult = false"
      />
    </div>
  </div>
</template>

<script setup>
import { Location, CircleCheck, MapLocation, Clock, Document } from '@element-plus/icons-vue';
import { ref, computed, watch } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('SmartAddressInput');

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  // 行政区划数据
  division: {
    type: Object,
    default: () => ({
      province: '',
      city: '',
      district: '',
    }),
  },
  placeholder: {
    type: String,
    default: '请输入详细地址',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'default',
  },
  maxlength: {
    type: Number,
    default: 255,
  },
  showWordLimit: {
    type: Boolean,
    default: true,
  },
  // 是否启用自动填充
  autoFill: {
    type: Boolean,
    default: true,
  },
  // 自动填充模式: 'prefix'(前缀) | 'full'(完整)
  autoFillMode: {
    type: String,
    default: 'prefix',
  },
  // 是否显示建议
  showSuggestions: {
    type: Boolean,
    default: true,
  },
  // Popover宽度
  popoverWidth: {
    type: Number,
    default: 400,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'parse']);

// 输入值
const inputValue = ref('');

// 是否显示自动填充提示
const showAutoFillTip = ref(false);

// 建议下拉框显示状态
const suggestionsVisible = ref(false);

// 地址解析结果
const parsedAddress = ref(null);
const showParseResult = ref(false);

// 基于行政区划的建议
const divisionBasedSuggestions = computed(() => {
  const suggestions = [];
  const { province, city, district } = props.division;

  if (province && city && district) {
    suggestions.push(`${province}${city}${district}`);
    suggestions.push(`${city}${district}`);
    suggestions.push(`${district}`);
  } else if (province && city) {
    suggestions.push(`${province}${city}`);
    suggestions.push(`${city}`);
  } else if (province) {
    suggestions.push(`${province}`);
  }

  return suggestions;
});

// 历史地址建议（从localStorage读取）
const historySuggestions = computed(() => {
  try {
    const history = localStorage.getItem('smart_address_history');
    if (history) {
      const parsed = JSON.parse(history);
      // 根据当前行政区划过滤相关历史地址
      return parsed
        .filter((item) => {
          const { province, city, district } = props.division;
          return !province || item.includes(province) || item.includes(city) || item.includes(district);
        })
        .slice(0, 5);
    }
  } catch (error) {
    logger.error('读取历史地址失败:', error);
  }
  return [];
});

// 常用地址模板
const templateSuggestions = ref([
  { name: '街道+门牌号', template: 'XX街道XX号' },
  { name: '路+门牌号', template: 'XX路XX号' },
  { name: '工业园区', template: 'XX工业园区XX栋' },
  { name: '写字楼', template: 'XX写字楼XX层XX室' },
]);

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== inputValue.value) {
      inputValue.value = newVal || '';
    }
  },
  { immediate: true }
);

// 监听输入值变化
watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal);
  emit('change', newVal);
});

// 监听行政区划变化，自动填充
watch(
  () => props.division,
  (newDivision, oldDivision) => {
    if (!props.autoFill) {
      return;
    }

    const newPrefix = buildAddressPrefix(newDivision);
    const oldPrefix = buildAddressPrefix(oldDivision);

    // 如果前缀发生变化，进行自动填充
    if (newPrefix && newPrefix !== oldPrefix) {
      autoFillAddress(newPrefix);
    }
  },
  { deep: true }
);

// 构建地址前缀
function buildAddressPrefix(division) {
  if (!division) {
    return '';
  }
  const { province, city, district } = division;
  const parts = [];
  if (province) {
    parts.push(province);
  }
  if (city) {
    parts.push(city);
  }
  if (district) {
    parts.push(district);
  }
  return parts.join('');
}

// 自动填充地址
function autoFillAddress(prefix) {
  const currentValue = inputValue.value || '';

  if (props.autoFillMode === 'prefix') {
    // 前缀模式：如果当前值不以prefix开头，则添加prefix
    if (!currentValue.startsWith(prefix)) {
      // 检查是否包含其他行政区划前缀，如果是则替换
      const oldPrefix = findExistingPrefix(currentValue);
      if (oldPrefix) {
        inputValue.value = currentValue.replace(oldPrefix, prefix);
      } else {
        inputValue.value = prefix + currentValue;
      }
      showAutoFillTip.value = true;
      setTimeout(() => {
        showAutoFillTip.value = false;
      }, 3000);
    }
  } else if (props.autoFillMode === 'full') {
    // 完整模式：直接设置为prefix
    if (!currentValue) {
      inputValue.value = prefix;
      showAutoFillTip.value = true;
      setTimeout(() => {
        showAutoFillTip.value = false;
      }, 3000);
    }
  }
}

// 查找现有前缀
function findExistingPrefix(value) {
  // 简单的正则匹配常见行政区划后缀
  const regex = /^(.*?省)?(.*?市)?(.*?区|.*?县)?/;
  const match = value.match(regex);
  return match ? match[0] : '';
}

// 处理输入
function handleInput(value) {
  if (props.showSuggestions) {
    // 显示建议
    suggestionsVisible.value = true;
  }

  // 尝试解析地址
  parseAddress(value);
}

// 处理失去焦点
function handleBlur() {
  // 延迟关闭建议，以便点击建议项
  setTimeout(() => {
    suggestionsVisible.value = false;
  }, 200);

  // 保存到历史
  saveToHistory(inputValue.value);
}

// 处理获得焦点
function handleFocus() {
  if (props.showSuggestions) {
    suggestionsVisible.value = true;
  }
}

// 选择建议
function selectSuggestion(suggestion) {
  inputValue.value = suggestion;
  suggestionsVisible.value = false;
  emit('change', suggestion);
  saveToHistory(suggestion);
}

// 解析地址
function parseAddress(value) {
  if (!value) {
    parsedAddress.value = null;
    return;
  }

  // 简单的地址解析逻辑
  const result = {
    province: '',
    city: '',
    district: '',
    street: '',
    detail: '',
  };

  // 匹配省
  const provinceMatch = value.match(/(.+?省)/);
  if (provinceMatch) {
    result.province = provinceMatch[1];
  }

  // 匹配市
  const cityMatch = value.match(/(.+?市)/);
  if (cityMatch) {
    result.city = cityMatch[1];
  }

  // 匹配区/县
  const districtMatch = value.match(/(.+?[区县])/);
  if (districtMatch) {
    result.district = districtMatch[1];
  }

  // 匹配街道
  const streetMatch = value.match(/(.+?(街道|镇|乡))/);
  if (streetMatch) {
    result.street = streetMatch[1];
  }

  // 剩余部分作为详细地址
  result.detail = value
    .replace(result.province, '')
    .replace(result.city, '')
    .replace(result.district, '')
    .replace(result.street, '')
    .trim();

  parsedAddress.value = result;
  showParseResult.value = true;

  emit('parse', result);
}

// 保存到历史
function saveToHistory(address) {
  if (!address || address.length < 5) {
    return;
  }

  try {
    let history = [];
    const stored = localStorage.getItem('smart_address_history');
    if (stored) {
      history = JSON.parse(stored);
    }

    // 去重并添加到开头
    history = history.filter((item) => item !== address);
    history.unshift(address);

    // 最多保存20条
    if (history.length > 20) {
      history = history.slice(0, 20);
    }

    localStorage.setItem('smart_address_history', JSON.stringify(history));
  } catch (error) {
    logger.error('保存历史地址失败:', error);
  }
}
</script>

<style scoped>
.smart-address-input {
  width: 100%;
  position: relative;
}

.auto-fill-icon {
  color: #67c23a;
  font-size: 16px;
}

.parse-result {
  margin-top: 8px;
}

.address-suggestions {
  max-height: 300px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: #303133;
}

.suggestion-group {
  padding: 8px 0;
}

.group-title {
  padding: 4px 12px;
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-item .el-icon {
  margin-right: 8px;
  color: #909399;
  font-size: 14px;
}

.suggestion-text {
  flex: 1;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
