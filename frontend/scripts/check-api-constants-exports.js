/**
 * API常量导入导出检查脚本
 * 
 * 功能：
 * 1. 检查 apiConstants.js 中导出的常量
 * 2. 检查所有使用 apiConstants 的文件中的导入
 * 3. 报告不存在的导入
 * 
 * 使用方法：
 * node scripts/check-api-constants-exports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const constantsFile = path.join(rootDir, 'src/constants/apiConstants.js');

function extractExports(content) {
  const exports = [];
  
  const namedExportRegex = /export\s+const\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  const defaultExportRegex = /export\s+default\s*\{([^}]+)\}/s;
  const defaultMatch = content.match(defaultExportRegex);
  if (defaultMatch) {
    const defaultExports = defaultMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('//'));
    exports.push(...defaultExports);
  }
  
  return [...new Set(exports)];
}

function extractImports(content, sourcePath) {
  const imports = new Set();
  
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"](@\/constants\/apiConstants|@\/constants\/apiConstants\.js)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importNames = match[1]
      .split(',')
      .map(s => s.trim().split(/\s+as\s+/).pop())
      .filter(s => s);
    importNames.forEach(name => imports.add(name));
  }
  
  return imports;
}

function findFilesUsingApiConstants(dir) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'coverage', '.git'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.vue')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('apiConstants')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🔍 检查 API 常量导入导出一致性...\n');
  
  if (!fs.existsSync(constantsFile)) {
    console.error('❌ 找不到 apiConstants.js 文件');
    process.exit(1);
  }
  
  const constantsContent = fs.readFileSync(constantsFile, 'utf-8');
  const exports = extractExports(constantsContent);
  
  console.log(`📦 apiConstants.js 导出了 ${exports.length} 个常量:\n`);
  console.log(exports.slice(0, 10).join(', ') + (exports.length > 10 ? ' ...' : '') + '\n');
  
  const usageFiles = findFilesUsingApiConstants(path.join(rootDir, 'src'));
  console.log(`📁 找到 ${usageFiles.length} 个使用 apiConstants 的文件\n`);
  
  const errors = [];
  const warnings = [];
  
  for (const file of usageFiles) {
    const relativePath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content, file);
    
    for (const importName of imports) {
      if (!exports.includes(importName)) {
        errors.push({
          file: relativePath,
          import: importName,
        });
      }
    }
  }
  
  if (errors.length > 0) {
    console.log('❌ 发现以下导入错误:\n');
    for (const error of errors) {
      console.log(`  ${error.file}`);
      console.log(`    └─ 导入了不存在的常量: \x1b[31m${error.import}\x1b[0m\n`);
    }
    console.log(`\n❌ 共发现 ${errors.length} 个导入错误\n`);
    process.exit(1);
  }
  
  console.log('✅ 所有导入导出检查通过！\n');
  process.exit(0);
}

main();
