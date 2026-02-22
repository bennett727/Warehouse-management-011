/**
 * 批量迁移脚本：UnifiedSearchBar → UnifiedFilterBar
 * 使用方法：node scripts/migrate-filter-bar.cjs
 */

const fs = require('fs');
const path = require('path');

// 迁移配置
const migrations = [
  {
    file: 'src/views/inventory-management/query/QueryPage.vue',
    template: 'inventoryQuery',
    icon: 'Search'
  },
  {
    file: 'src/views/inventory-management/InventoryAlerts.vue',
    template: 'alert',
    icon: 'Warning'
  },
  {
    file: 'src/views/inventory-management/InventoryRecords.vue',
    template: 'records',
    icon: 'Document'
  },
  {
    file: 'src/views/inventory-management/stock-status/StockStatusManagementPage.vue',
    template: 'status',
    icon: 'Collection'
  },
  {
    file: 'src/views/inventory-management/stock-transfer/StockTransferPage.vue',
    template: 'transfer',
    icon: 'Van'
  },
  {
    file: 'src/views/inventory-management/stock-count/StockCountPage.vue',
    template: 'stockCount',
    icon: 'Calendar'
  },
  {
    file: 'src/views/inventory-management/batch/BatchManagementPage.vue',
    template: 'inventoryQuery',
    icon: 'Search'
  },
  {
    file: 'src/views/inventory-management/transfer/TransferPage.vue',
    template: 'transfer',
    icon: 'Van'
  },
  {
    file: 'src/views/inventory-management/alert-config/EnhancedAlertConfigPage.vue',
    template: 'config',
    icon: 'Bell'
  },
  {
    file: 'src/views/system/users/Users.vue',
    template: 'users',
    icon: 'User'
  },
  {
    file: 'src/views/device/DeviceList.vue',
    template: 'inventoryQuery',
    icon: 'Search'
  }
];

// 替换模板
function replaceUnifiedSearchBar(content, config) {
  // 1. 替换导入
  content = content.replace(
    /import UnifiedSearchBar from ['"]@\/components\/base\/UnifiedSearchBar\.vue['"];?/g,
    `import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';\nimport { filterTemplates } from '@/config/filter/common.filter.config';`
  );

  // 2. 替换组件标签
  content = content.replace(
    /<UnifiedSearchBar\s+([^>]+)\/>/gs,
    (match, attrs) => {
      // 提取关键属性
      const fieldsMatch = attrs.match(/:fields="([^"]+)"/);
      const loadingMatch = attrs.match(/:loading="([^"]+)"/);
      const totalMatch = attrs.match(/:total="([^"]+)"/);

      const fields = fieldsMatch ? fieldsMatch[1] : 'searchFields';
      const loading = loadingMatch ? loadingMatch[1] : 'loading';
      const total = totalMatch ? totalMatch[1] : 'pagination.total';

      return `<UnifiedFilterBar
        v-model="searchForm"
        :fields="filterConfig.fields"
        :loading="${loading}"
        :header-title="filterConfig.header.title"
        :header-icon="filterConfig.header.icon"
        :result-count="${total}"
        @search="handleSearch"
        @reset="handleReset"
      />`;
    }
  );

  // 3. 添加 filterConfig 计算属性（在 searchFields 后面）
  if (!content.includes('filterConfig')) {
    content = content.replace(
      /(const searchFields = computed\(\(\) => \[[\s\S]*?\]\);)/,
      `$1\n\n// 筛选配置\nconst filterConfig = computed(() => filterTemplates.${config.template}(searchFields.value));`
    );
  }

  return content;
}

// 执行迁移
async function runMigration() {
  const rootDir = path.resolve(__dirname, '..');

  for (const config of migrations) {
    const filePath = path.join(rootDir, config.file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${config.file}`);
      continue;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');

      // 检查是否已经迁移过
      if (content.includes('UnifiedFilterBar')) {
        console.log(`✅ 已迁移: ${config.file}`);
        continue;
      }

      // 执行替换
      content = replaceUnifiedSearchBar(content, config);

      // 写回文件
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ 迁移成功: ${config.file}`);
    } catch (error) {
      console.error(`❌ 迁移失败: ${config.file}`, error.message);
    }
  }

  console.log('\n🎉 批量迁移完成！');
}

runMigration();
