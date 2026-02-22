import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 路径解析函数
const pathResolve = (dir) => resolve(process.cwd(), '.', dir)

export default defineConfig({
  plugins: [vue()],
  
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局配置
    globals: true,
    
    // 测试文件匹配模式
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // 排除模式
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage',
      // 覆盖率阈值
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      },
      // 排除文件
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mock/**',
        '**/assets/**'
      ]
    },
    
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    //  reporters配置
    reporters: ['verbose'],
    
    // 模拟全局对象
    mockReset: true,
    restoreMocks: true,
    clearMocks: true
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': pathResolve('src'),
      '@components': pathResolve('src/components'),
      '@views': pathResolve('src/views'),
      '@stores': pathResolve('src/stores'),
      '@utils': pathResolve('src/utils'),
      '@api': pathResolve('src/api'),
      '@assets': pathResolve('src/assets'),
      '@tests': pathResolve('tests')
    }
  }
})
