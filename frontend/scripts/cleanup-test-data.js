/**
 * 测试数据清理脚本
 * 清理后端数据库中的测试数据
 * 
 * @file: cleanup-test-data.js
 * @description: 连接后端API，删除以TEST_DATA_前缀标记的测试数据
 * @version: 1.0.0
 * 
 * 使用方法:
 *   npm run test:cleanup
 * 或
 *   API_URL=http://localhost:8080/api node scripts/cleanup-test-data.js
 * 
 * 环境变量:
 *   - API_URL: 后端API基础URL（默认: http://localhost:8080/api）
 * 
 * 功能说明:
 *   1. 使用admin账号登录获取认证令牌
 *   2. 查询所有标记为测试数据（TEST_DATA_前缀）的记录
 *   3. 依次调用删除API清理测试数据
 *   4. 输出清理统计信息
 * 
 * 安全说明:
 *   - 仅删除带有TEST_DATA_前缀的数据
 *   - 需要有效的管理员认证令牌
 *   - 建议在测试环境使用，生产环境慎用
 */

const https = require('https');
const http = require('http');

// 配置
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const TEST_DATA_PREFIX = 'TEST_DATA_';

async function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getAuthToken() {
  try {
    const response = await makeRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'Admin@123456'
    });
    return response.data?.data?.token;
  } catch (err) {
    console.error('获取认证令牌失败:', err.message);
    return null;
  }
}

async function cleanupTestData() {
  console.log('🧹 开始清理测试数据...\n');
  
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ 无法获取认证令牌，清理终止');
    return;
  }
  
  console.log('✅ 认证成功\n');
  
  const endpoints = [
    { name: '设备', url: '/devices', idField: 'id', nameField: 'deviceCode' },
    { name: '库存订单', url: '/stock-orders', idField: 'id', nameField: 'orderNo' },
    { name: '用户', url: '/users', idField: 'id', nameField: 'username' }
  ];
  
  let totalCleaned = 0;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📋 检查${endpoint.name}数据...`);
      
      const response = await makeRequest('GET', `${endpoint.url}?size=100`, null, token);
      
      if (response.status === 200 && response.data?.data) {
        const items = response.data.data.content || response.data.data;
        const testItems = items.filter(item => {
          const name = item[endpoint.nameField] || '';
          return name.startsWith(TEST_DATA_PREFIX);
        });
        
        if (testItems.length === 0) {
          console.log(`   ✓ 无需清理的${endpoint.name}数据\n`);
          continue;
        }
        
        console.log(`   发现 ${testItems.length} 条测试数据`);
        
        for (const item of testItems) {
          try {
            await makeRequest('DELETE', `${endpoint.url}/${item[endpoint.idField]}`, null, token);
            console.log(`   ✓ 已删除: ${item[endpoint.nameField]}`);
            totalCleaned++;
          } catch (err) {
            console.log(`   ✗ 删除失败: ${item[endpoint.nameField]} - ${err.message}`);
          }
        }
        console.log('');
      }
    } catch (err) {
      console.log(`   ⚠️ 检查${endpoint.name}数据失败: ${err.message}\n`);
    }
  }
  
  console.log('='.repeat(50));
  console.log(`🧹 清理完成！共清理 ${totalCleaned} 条测试数据`);
  console.log('='.repeat(50));
}

cleanupTestData().catch(err => {
  console.error('清理过程中发生错误:', err);
  process.exit(1);
});
