/**
 * @file: validate-data-cy.js
 * @description: 在CI/CD流程中验证data-cy属性的完整性和规范性
 * @author: Trae AI
 * @createTime: 2026-02-26
 * @version: 1.3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  requiredElements: [
    'el-input',
    'el-select',
    'el-button',
    'el-dialog',
    'el-form',
    'button',
    'el-pagination',
    'el-tabs',
    'el-menu'
  ],
  namingPattern: /^[a-z][a-z0-9-]*$/,
  sensitivePatterns: ['password', 'token', 'secret', 'key', 'api', 'auth']
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type] || ''}${message}${colors.reset}`);
}

function extractTemplate(content) {
  const templateStart = content.indexOf('<template>');
  if (templateStart === -1) return null;

  const templateEnd = content.lastIndexOf('</template>');
  if (templateEnd === -1) return null;

  const templateContent = content.substring(templateStart + 10, templateEnd);

  return {
    path: '',
    template: templateContent,
    content: content
  };
}

function hasDataCy(element) {
  return element.includes('data-cy=') || element.includes('data-cy="') || element.includes("data-cy='") ||
    element.includes(':data-cy=') || element.includes(':data-cy="') || element.includes(":data-cy='") ||
    element.includes('v-bind:data-cy');
}

function extractDataCyValue(element) {
  const staticMatch = element.match(/data-cy="([^"]*)"/);
  if (staticMatch) return staticMatch[1];

  const staticMatchSingle = element.match(/data-cy='([^']*)'/);
  if (staticMatchSingle) return staticMatchSingle[1];

  const dynamicMatch = element.match(/:data-cy="([^"]*)"/);
  if (dynamicMatch) return dynamicMatch[1];

  const dynamicMatchSingle = element.match(/:data-cy='([^']*)'/);
  if (dynamicMatchSingle) return dynamicMatchSingle[1];

  const vBindMatch = element.match(/v-bind:data-cy="([^"]*)"/);
  if (vBindMatch) return vBindMatch[1];

  return null;
}

function shouldSkipElement(element) {
  if (element.includes(':data-cy=') || element.includes('v-bind:data-cy')) {
    return true;
  }

  if (element.includes('v-if=') && !element.includes('data-cy=') && !element.includes(':data-cy=')) {
    return true;
  }

  if (element.includes('v-for=')) {
    return true;
  }

  if (element.includes('v-show=')) {
    return true;
  }

  if (element.includes('#default=') || element.includes('slot=')) {
    return true;
  }

  return false;
}

function validateNaming(value, element) {
  if (!value) return { valid: false, error: '值为空' };

  if (value.includes('${') || value.includes('{{')) {
    return { valid: true, isDynamic: true };
  }

  if (value.includes('?') && value.includes(':')) {
    return { valid: true, isDynamic: true };
  }

  if (element && (element.includes(':data-cy=') || element.includes('v-bind:data-cy'))) {
    return { valid: true, isDynamic: true };
  }

  if (!CONFIG.namingPattern.test(value)) {
    return { valid: false, error: `命名不符合规范: ${value}` };
  }

  for (const pattern of CONFIG.sensitivePatterns) {
    if (value.toLowerCase().includes(pattern)) {
      return { valid: false, error: `包含敏感信息: ${pattern}` };
    }
  }

  return { valid: true };
}

function checkFile(file) {
  const issues = [];
  const dataCyValues = [];

  for (const element of CONFIG.requiredElements) {
    const regex = new RegExp(`<${element}(?:\\s+(?:[^>"']|"[^"]*"|'[^']*')*)?>`, 'gi');
    let match;
    while ((match = regex.exec(file.template)) !== null) {
      const matchStr = match[0];
      const cleanMatch = matchStr.replace(/\s+/g, ' ').trim();

      const hasStaticDataCy = /data-cy=/.test(cleanMatch);
      const hasDynamicDataCy = /:data-cy=/.test(cleanMatch);
      const hasVBindDataCy = /v-bind:data-cy=/.test(cleanMatch);

      if (!hasStaticDataCy && !hasDynamicDataCy && !hasVBindDataCy) {
        if (shouldSkipElement(cleanMatch)) continue;

        issues.push({
          type: 'missing',
          element: cleanMatch.substring(0, 80),
          message: `${element} 元素缺少data-cy属性`
        });
      } else {
        const value = extractDataCyValue(cleanMatch);
        if (value) {
          const validation = validateNaming(value, cleanMatch);
          if (!validation.valid) {
            issues.push({
              type: 'invalid',
              element: cleanMatch.substring(0, 80),
              message: validation.error
            });
          }
          dataCyValues.push(value);
        }
      }
    }
  }

  const duplicates = findDuplicates(dataCyValues);
  if (duplicates.length > 0) {
    issues.push({
      type: 'duplicate',
      message: `发现重复的data-cy值: ${duplicates.join(', ')}`
    });
  }

  return issues;
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return Array.from(duplicates);
}

function scanDirectory(dir, vueFiles = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, vueFiles);
    } else if (file.endsWith('.vue')) {
      vueFiles.push(filePath);
    }
  }

  return vueFiles;
}

function main() {
  log('🔍 开始验证 data-cy 属性...', 'info');

  const srcDir = path.join(__dirname, '../src');
  const vueFiles = scanDirectory(srcDir);

  log(`📁 找到 ${vueFiles.length} 个 Vue 文件`, 'info');

  let totalIssues = 0;
  const filesWithIssues = new Set();

  for (const filePath of vueFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const file = extractTemplate(content);

    if (!file) continue;

    file.path = filePath;
    const issues = checkFile(file);

    if (issues.length > 0) {
      totalIssues += issues.length;
      filesWithIssues.add(filePath);

      const relativePath = path.relative(srcDir, filePath);
      log(`\n📄 ${relativePath}`, 'warning');

      for (const issue of issues) {
        if (issue.type === 'missing') {
          log(`  ❌ ${issue.message}`, 'error');
          log(`     元素: ${issue.element}...`, 'error');
        } else if (issue.type === 'invalid') {
          log(`  ⚠️  ${issue.message}`, 'warning');
          log(`     元素: ${issue.element}...`, 'warning');
        } else {
          log(`  ⚠️  ${issue.message}`, 'warning');
        }
      }
    }
  }

  log('\n' + '='.repeat(60), 'info');

  if (totalIssues === 0) {
    log('✅ 所有 data-cy 属性验证通过！', 'success');
    process.exit(0);
  } else {
    log(`❌ 发现 ${totalIssues} 个问题，涉及 ${filesWithIssues.size} 个文件`, 'error');
    log('\n💡 提示:', 'info');
    log('   - 所有交互元素必须包含 data-cy 属性', 'info');
    log('   - 命名规范: [模块]-[元素类型]-[动作]', 'info');
    log('   - 使用小写字母和连字符', 'info');
    log('   - 避免使用敏感信息', 'info');
    process.exit(1);
  }
}

main();
