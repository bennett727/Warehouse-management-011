/**
 * 带自动重启功能的开发服务器启动脚本
 * 检测端口占用，自动终止旧进程，然后启动Vite开发服务器
 */

import net from 'net';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const PORT = 5173;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * 检测端口是否被占用
 * @param {number} port - 端口号
 * @returns {Promise<boolean>} - 是否被占用
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

/**
 * 获取占用端口的进程信息
 * @param {number} port - 端口号
 * @returns {Promise<string|null>} - 进程信息
 */
async function getProcessUsingPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        try {
          const { stdout: processInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
          if (processInfo && processInfo.includes('node')) {
            return `PID: ${pid}, 进程: node.exe`;
          }
        } catch (e) {
          // 忽略错误
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 终止占用指定端口的进程
 * @param {number} port - 端口号
 * @returns {Promise<boolean>} - 是否成功终止
 */
async function killProcessUsingPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        try {
          const { stdout: processInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
          if (processInfo && processInfo.includes('node')) {
            console.log(`🔄 正在终止Node进程 (PID: ${pid})...`);
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`✅ 成功终止进程 (PID: ${pid})`);
            return true;
          }
        } catch (e) {
          // 忽略错误
        }
      }
    }
    return false;
  } catch (error) {
    console.error('终止进程时发生错误:', error.message);
    return false;
  }
}

/**
 * 启动Vite开发服务器
 */
function startViteServer() {
  console.log('🚀 正在启动Vite开发服务器...\n');

  const viteConfigPath = path.join(projectRoot, 'config', 'vite.config.js');

  // 使用spawn启动Vite，保持stdin/stdout/stderr连接
  // 使用cwd和相对路径避免空格问题
  const viteProcess = spawn('npx', ['vite', '--config', 'config/vite.config.js', '--port', PORT.toString()], {
    cwd: projectRoot,
    stdio: 'inherit', // 继承父进程的stdio，这样可以看到Vite的输出
    shell: true,
    windowsHide: false // 在Windows上显示窗口
  });

  viteProcess.on('error', (error) => {
    console.error('启动Vite失败:', error.message);
    process.exit(1);
  });

  viteProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Vite进程退出，退出码: ${code}`);
    }
    process.exit(code);
  });

  // 处理进程信号
  process.on('SIGINT', () => {
    console.log('\n👋 收到中断信号，正在关闭开发服务器...');
    viteProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 收到终止信号，正在关闭开发服务器...');
    viteProcess.kill('SIGTERM');
  });
}

/**
 * 主函数
 */
async function main() {
  console.log(`🔍 正在检测端口 ${PORT} 是否被占用...`);

  const inUse = await isPortInUse(PORT);

  if (inUse) {
    console.error(`❌ 端口 ${PORT} 已被占用！`);

    const processInfo = await getProcessUsingPort(PORT);
    if (processInfo) {
      console.error(`📋 占用进程信息: ${processInfo}`);
    }

    // 尝试自动终止旧进程
    console.log('\n🔄 正在尝试自动终止旧进程...');
    const killed = await killProcessUsingPort(PORT);

    if (killed) {
      console.log('⏳ 等待端口释放...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 再次检查端口
      const stillInUse = await isPortInUse(PORT);
      if (!stillInUse) {
        console.log(`✅ 端口 ${PORT} 已释放\n`);
        startViteServer();
        return;
      } else {
        console.error('❌ 端口仍然被占用，无法自动释放\n');
      }
    } else {
      console.error('❌ 自动终止旧进程失败\n');
    }

    console.error('💡 解决方案:');
    console.error('   1. 手动停止已运行的前端开发服务器');
    console.error('   2. 或者使用其他端口: npm run dev -- --port 5174');
    console.error('   3. 强制终止进程: taskkill /F /IM node.exe\n');

    process.exit(1);
  } else {
    console.log(`✅ 端口 ${PORT} 可用\n`);
    startViteServer();
  }
}

main().catch((error) => {
  console.error('启动开发服务器时发生错误:', error);
  process.exit(1);
});
