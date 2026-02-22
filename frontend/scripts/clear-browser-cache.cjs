/**
 * 清除浏览器缓存脚本
 * 清除Vite和Cypress构建缓存，解决开发环境问题
 * 
 * @file: clear-browser-cache.cjs
 * @description: 删除Vite和Cypress的缓存目录，强制重新构建
 * @version: 1.0.0
 * 
 * 使用方法:
 *   node scripts/clear-browser-cache.cjs
 * 
 * 功能说明:
 *   1. 清除Vite缓存（node_modules/.vite）
 *   2. 清除Cypress缓存（.cypress-cache）
 *   3. 输出清理结果到控制台
 * 
 * 适用场景:
 *   - 开发环境出现缓存问题
 *   - 构建产物与代码不一致
 *   - 切换分支后需要清理缓存
 * 
 * 依赖:
 *   - Node.js内置模块: fs, path
 */

const fs = require('fs');
const path = require('path');

// 清除 Vite 缓存
const viteCachePath = path.resolve(__dirname, '../node_modules/.vite');
if (fs.existsSync(viteCachePath)) {
  try {
    fs.rmSync(viteCachePath, { recursive: true, force: true });
    console.log('✓ Vite 缓存已清除');
  } catch (error) {
    console.error('✗ 清除 Vite 缓存失败:', error.message);
  }
} else {
  console.log('○ Vite 缓存目录不存在');
}

// 清除 Cypress 缓存
const cypressCachePath = path.resolve(__dirname, '../.cypress-cache');
if (fs.existsSync(cypressCachePath)) {
  try {
    fs.rmSync(cypressCachePath, { recursive: true, force: true });
    console.log('✓ Cypress 缓存已清除');
  } catch (error) {
    console.error('✗ 清除 Cypress 缓存失败:', error.message);
  }
} else {
  console.log('○ Cypress 缓存目录不存在');
}

// 清除 dist 目录
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  try {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✓ 构建输出目录已清除');
  } catch (error) {
    console.error('✗ 清除构建输出目录失败:', error.message);
  }
} else {
  console.log('○ 构建输出目录不存在');
}

console.log('\n浏览器缓存清除完成！');
console.log('注意: localStorage 和 sessionStorage 是浏览器端存储，');
console.log('      需要在浏览器中手动清除或使用无痕模式访问。');
