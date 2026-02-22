/**
 * 批量迁移脚本：将使用 el-card header 的视图迁移到 PageLayout
 * 使用方法：node scripts/migrate-to-pagelayout.cjs
 */

const fs = require('fs');
const path = require('path');

// 需要迁移的文件列表
const migrations = [
  {
    file: 'src/views/inventory-management/bin/BinManagement.vue',
    title: '货位管理',
    description: '管理仓库货位信息及状态'
  },
  {
    file: 'src/views/system/device-types/DeviceTypes.vue',
    title: '设备类型管理',
    description: '管理设备类型分类'
  },
  {
    file: 'src/views/device/DeviceStatusApprovalPage.vue',
    title: '设备状态变更审批',
    description: '审批设备状态变更申请'
  }
];

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
      
      // 检查是否已经使用 PageLayout
      if (content.includes('PageLayout')) {
        console.log(`✅ 已迁移: ${config.file}`);
        continue;
      }

      console.log(`🔄 正在迁移: ${config.file}`);
      
      // 这里只是标记，实际迁移需要手动处理因为每个文件结构不同
      console.log(`⚠️  请手动迁移: ${config.file}`);
      
    } catch (error) {
      console.error(`❌ 迁移失败: ${config.file}`, error.message);
    }
  }
  
  console.log('\n🎉 检查完成！');
}

runMigration();
