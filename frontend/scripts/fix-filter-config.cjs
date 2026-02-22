/**
 * FilterConfig修复脚本
 * 为缺少filterConfig的视图文件自动添加筛选配置
 *
 * @file: fix-filter-config.cjs
 * @description: 扫描指定视图文件，添加缺失的filterConfig计算属性
 * @version: 1.0.0
 *
 * 使用方法:
 *   node scripts/fix-filter-config.cjs
 *
 * 功能说明:
 *   1. 读取配置的文件列表
 *   2. 检查文件是否已存在filterConfig
 *   3. 在searchFields计算属性后插入filterConfig配置
 *   4. 根据模板类型使用不同的筛选配置
 *
 * 配置说明:
 *   filesToFix数组中每个对象包含:
 *   - file: 目标文件路径（相对于项目根目录）
 *   - template: 筛选配置模板名称
 *
 * 支持的模板:
 *   - records: 记录查询筛选
 *   - status: 状态管理筛选
 *   - transfer: 库存转移筛选
 *   - stockCount: 盘点管理筛选
 *   - inventoryQuery: 库存查询筛选
 *   - config: 配置管理筛选
 *   - users: 用户管理筛选
 *
 * 注意事项:
 *   - 仅处理缺少filterConfig的文件
 *   - 修改前请确保文件已备份
 *   - 修复后建议验证页面功能
 *
 * 依赖:
 *   - Node.js内置模块: fs, path
 */

const fs = require('fs');
const path = require('path');

// 文件和模板映射
const filesToFix = [
  { file: 'src/views/inventory-management/InventoryRecords.vue', template: 'records' },
  { file: 'src/views/inventory-management/stock-status/StockStatusManagementPage.vue', template: 'status' },
  { file: 'src/views/inventory-management/stock-transfer/StockTransferPage.vue', template: 'transfer' },
  { file: 'src/views/inventory-management/stock-count/StockCountPage.vue', template: 'stockCount' },
  { file: 'src/views/inventory-management/batch/BatchManagementPage.vue', template: 'inventoryQuery' },
  { file: 'src/views/inventory-management/transfer/TransferPage.vue', template: 'transfer' },
  { file: 'src/views/inventory-management/alert-config/EnhancedAlertConfigPage.vue', template: 'config' },
  { file: 'src/views/system/users/Users.vue', template: 'users' },
  { file: 'src/views/device/DeviceList.vue', template: 'inventoryQuery' },
];

function addFilterConfig(content, template) {
  // 如果已经有 filterConfig，跳过
  if (content.includes('const filterConfig')) {
    return content;
  }

  // 在 searchFields 计算属性后面添加 filterConfig
  const pattern = /(const searchFields = computed\(\(\) => \[[\s\S]*?\]\);)/;
  const replacement = `$1\n\n// 筛选配置\nconst filterConfig = computed(() => filterTemplates.${template}(searchFields.value));`;
  
  return content.replace(pattern, replacement);
}

async function runFix() {
  const rootDir = path.resolve(__dirname, '..');
  let fixedCount = 0;
  let skippedCount = 0;
  
  for (const config of filesToFix) {
    const filePath = path.join(rootDir, config.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${config.file}`);
      continue;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // 检查是否已经有 filterConfig
      if (content.includes('const filterConfig')) {
        console.log(`⏭️  跳过 (已有filterConfig): ${config.file}`);
        skippedCount++;
        continue;
      }

      // 添加 filterConfig
      const newContent = addFilterConfig(content, config.template);
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`✅ 修复成功: ${config.file}`);
        fixedCount++;
      } else {
        console.log(`⚠️  未找到匹配: ${config.file}`);
      }
    } catch (error) {
      console.error(`❌ 修复失败: ${config.file}`, error.message);
    }
  }
  
  console.log(`\n🎉 修复完成！修复: ${fixedCount}, 跳过: ${skippedCount}`);
}

runFix();
