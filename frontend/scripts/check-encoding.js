#!/usr/bin/env node
// =============================================================================
// 文件编码检查脚本
// 版本: 1.0.0
// 描述: 检查项目文件编码，确保使用 UTF-8 无 BOM 格式
// =============================================================================

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 要检查的文件扩展名
  extensions: ['.js', '.vue', '.ts', '.json', '.css', '.scss', '.md', '.html'],
  // 忽略的目录
  ignoreDirs: ['node_modules', 'dist', '.git', 'coverage', 'cypress'],
  // 忽略的文件
  ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
};

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// 检查结果
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * 检查文件编码
 * @param {string} filePath - 文件路径
 * @returns {object} - 检查结果
 */
function checkFileEncoding(filePath) {
  const buffer = fs.readFileSync(filePath);

  // 检查 BOM (Byte Order Mark)
  if (buffer.length >= 3 &&
      buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return { status: 'failed', message: '包含 UTF-8 BOM 标记' };
  }

  // 检查是否包含替换字符 (�)
  const content = buffer.toString('utf-8');
  if (content.includes('\uFFFD')) {
    return { status: 'failed', message: '包含 Unicode 替换字符 (编码损坏)' };
  }

  // 检查控制字符
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    // 允许的控制字符: TAB(9), LF(10), CR(13)
    if (char < 32 && char !== 9 && char !== 10 && char !== 13) {
      return { status: 'failed', message: `包含控制字符 (0x${char.toString(16).padStart(2, '0')})` };
    }
  }

  return { status: 'passed', message: '编码正确' };
}

/**
 * 递归遍历目录
 * @param {string} dir - 目录路径
 */
function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 跳过忽略的目录
      if (!CONFIG.ignoreDirs.includes(file)) {
        walkDir(fullPath);
      }
    } else {
      // 检查文件扩展名