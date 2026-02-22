/**
 * ESLint警告修复脚本
 * 自动修复项目中未使用变量的导入警告
 * 
 * @file: fix-eslint-warnings.cjs
 * @description: 扫描指定文件，移除未使用的Element Plus图标导入
 * @version: 1.0.0
 * 
 * 使用方法:
 *   node scripts/fix-eslint-warnings.cjs
 * 
 * 功能说明:
 *   1. 读取配置的文件列表
 *   2. 识别并移除指定的未使用导入
 *   3. 保留文件其他内容不变
 *   4. 输出修复结果
 * 
 * 配置说明:
 *   fixes数组中每个对象包含:
 *   - file: 目标文件路径（相对于项目根目录）
 *   - removeImports: 需要移除的导入名称数组
 * 
 * 注意事项:
 *   - 修改前请确保文件已备份或已提交版本控制
 *   - 仅处理Element Plus图标导入
 *   - 修复后建议运行ESLint验证
 * 
 * 依赖:
 *   - Node.js内置模块: fs, path
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/views/inventory-management/installation/InstallationPage.vue',
    removeImports: ['Setting'],
  },
  {
    file: 'src/views/inventory-management/maintenance/MaintenancePage.vue',
    removeImports: ['Brush'],
  },
  {
    file: 'src/views/inventory-management/stock-count/StockCountPage.vue',
    removeImports: ['Calendar'],
  },
  {
    file: 'src/views/inventory-management/stock-status/StockStatusManagementPage.vue',
    removeImports: ['Collection'],
  },
  {
    file: 'src/views/inventory-management/batch/BatchManagementPage.vue',
    removeImports: ['Box'],
  },
  {
    file: 'src/views/inventory-management/alert-config/EnhancedAlertConfigPage.vue',
    removeImports: ['Bell'],
  },
  {
    file: 'src/views/inventory-management/transfer/TransferPage.vue',
    removeImports: ['Van'],
  },
  {
    file: 'src/views/inventory-management/query/QueryPage.vue',
    removeImports: ['filterTemplates'],
    removeVars: ['searchFields'],
  },
];

function removeFromImport(content, importName) {
  // 匹配 import { ..., Name, ... } from '...' 并移除 Name
  const pattern = new RegExp(`(,\\s*)?${importName}(\\s*,)?`, 'g');
  return content.replace(pattern, (match, before, after) => {
    if (before && after) return ',';
    if (before) return '';
    if (after) return '';
    return '';
  });
}

function removeVariable(content, varName) {
  // 移除 const/varName = ... 行
  const pattern = new RegExp(`const ${varName} = .+?;\\n`, 'g');
  return content.replace(pattern, '');
}

async function runFix() {
  const rootDir = path.resolve(__dirname, '..');
  
  for (const config of fixes) {
    const filePath = path.join(rootDir, config.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${config.file}`);
      continue;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      
      // 移除未使用的导入
      if (config.removeImports) {
        for (const importName of config.removeImports) {
          const newContent = removeFromImport(content, importName);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            console.log(`  移除导入: ${importName}`);
          }
        }
      }
      
      // 移除未使用的变量
      if (config.removeVars) {
        for (const varName of config.removeVars) {
          const newContent = removeVariable(content, varName);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            console.log(`  移除变量: ${varName}`);
          }
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ 修复成功: ${config.file}`);
      } else {
        console.log(`⏭️  无需修复: ${config.file}`);
      }
    } catch (error) {
      console.error(`❌ 修复失败: ${config.file}`, error.message);
    }
  }
  
  console.log('\n🎉 修复完成！');
}

runFix();
