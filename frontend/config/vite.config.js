// 导入所需模块
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import compression from 'vite-plugin-compression'
import progress from 'vite-plugin-progress'

// 路径解析函数
const pathResolve = (dir) => resolve(process.cwd(), '.', dir)

// 环境变量加载
const loadEnvConfig = (mode) => {
  const env = loadEnv(mode, resolve(process.cwd(), 'config/env'), '')
  return {
    VITE_API_BASE_URL: env.VITE_API_BASE_URL && env.VITE_API_BASE_URL.trim() !== '' ? env.VITE_API_BASE_URL : 'http://localhost:8080',
    VITE_API_TIMEOUT: parseInt(env.VITE_API_TIMEOUT) || 30000,
    VITE_PROXY_ENABLED: env.VITE_PROXY_ENABLED === 'true',
    VITE_HTTPS_ENABLED: env.VITE_HTTPS_ENABLED === 'true',
    VITE_DEV_PORT: parseInt(env.VITE_DEV_PORT) || 5173,
    VITE_OPEN_BROWSER: env.VITE_OPEN_BROWSER === 'true',
    VITE_SOURCE_MAP_ENABLED: env.VITE_SOURCE_MAP_ENABLED !== 'false',
    VITE_BUILD_ANALYZE: env.VITE_BUILD_ANALYZE === 'true',
    VITE_COMPRESSION_ENABLED: env.VITE_COMPRESSION_ENABLED === 'true'
  }
}

export default defineConfig(({ mode }) => {
  const envConfig = loadEnvConfig(mode)
  const isProduction = mode === 'production'

  return {
    // 基础路径配置
    base: '/',

    // 全局变量定义
    define: {
      'process.env': JSON.stringify({}),
      'process.env.TEST': JSON.stringify('false')
    },

    // 构建目标
    esbuild: {
      target: 'es2015',
      drop: []
    },

    // 插件配置
    plugins: [
      vue({
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
          whitespace: 'preserve',
          onWarn: (msg, warn) => {
            if (msg.code === 998) {
              return
            }
            warn(msg)
          }
        }
      }),

      // 浏览器兼容性支持
      isProduction && legacy({
        targets: ['> 1%', 'last 2 versions', 'not dead', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: [
          'es.symbol',
          'es.array.filter',
          'es.promise',
          'es.promise.finally',
          'es/map',
          'es/set',
          'es.array.for-each',
          'es.object.define-properties',
          'es.object.define-property',
          'es.object.get-own-property-descriptor',
          'es.object.get-own-property-descriptors',
          'es.object.keys',
          'es.object.to-string',
          'web.dom-collections.for-each'
        ]
      }),

      // 构建进度条
      progress({
        format: ' :percent | :bar | :current/:total files | :file' + '\n',
        width: 60,
        complete: '=',
        incomplete: '>',
        clear: true
      }),

      // 自动导入Vue API和第三方库
      AutoImport({
        resolvers: [ElementPlusResolver()],
        // 自动导入的目录
        dirs: ['src/hooks'],
        // 生成的类型声明文件
        dts: 'src/auto-imports.d.ts',
        // 明确指定要自动导入的API
        imports: [
          'vue',
          'vue-router',
          'pinia',
          {
            'axios': [
              ['default', 'axios']
            ]
          }
        ],
        // 配置eslint
        eslintrc: {
          enabled: true,
          filepath: 'config/.eslintrc-auto-import.json'
        }
      }),

      // 自动导入组件
      Components({
        resolvers: [
          ElementPlusResolver({
            // 不使用自动导入样式，避免路径问题
            importStyle: false
          })
        ],
        // 生成的组件类型声明文件
        dts: 'src/components.d.ts',
        // 组件搜索目录
        dirs: ['src/components', 'src/views'],
        // 忽略不存在的组件
        exclude: [/ElUploadList/]
      }),

      // 构建体积分析
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'build-stats.html'
      }),

      // 资源压缩
      envConfig.VITE_COMPRESSION_ENABLED && isProduction && compression({
        verbose: true,
        disable: !isProduction,
        threshold: 10240, // 10KB以上的文件才进行压缩
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false // 不删除原始文件
      }),

      // Brotli压缩
      envConfig.VITE_COMPRESSION_ENABLED && isProduction && compression({
        verbose: true,
        disable: !isProduction,
        threshold: 10240, // 10KB以上的文件才进行压缩
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false // 不删除原始文件
      })
    ],

    // 路径解析配置
    resolve: {
      alias: {
        '@': pathResolve('src'),
        'assets': pathResolve('src/assets'),
        'components': pathResolve('src/components'),
        'views': pathResolve('src/views'),
        'api': pathResolve('src/api'),
        'stores': pathResolve('src/stores'),
        'utils': pathResolve('src/utils'),
        'composables': pathResolve('src/composables'),
        'config': pathResolve('src/config'),
        'router': pathResolve('src/router')
      },
      // 导入时可省略的扩展名
      extensions: ['.vue', '.js', '.ts', '.jsx', '.tsx', '.json'],
      // 依赖解析策略
      dedupe: ['vue']
    },

    // 开发服务器配置
    server: {
      // 配置historyApiFallback，解决HTML5 History模式下的路由404问题
      historyApiFallback: true,
      // 启用HTTPS
      https: envConfig.VITE_HTTPS_ENABLED,
      // 配置代理
      // 重要说明：
      // 1. 后端配置了 context-path=/api，所有Controller路径会自动加上/api前缀
      // 2. 前端API路径不包含/api前缀（API_BASE = ''）
      // 3. 代理配置分为两部分：
      //    a) ^/api - 直接转发以/api开头的请求
      //    b) ^/(auth|devices|...)/ - 匹配API路径（必须包含子路径/），rewrite添加/api前缀
      // 4. 前端路由路径（如/dashboard）不会被代理，由historyApiFallback处理
      //
      // 路径映射示例：
      // API请求：/auth/login -> 匹配 ^/auth/ -> rewrite -> /api/auth/login -> 后端
      // 路由刷新：/dashboard -> 不匹配代理规则 -> historyApiFallback -> 返回index.html
      proxy: envConfig.VITE_PROXY_ENABLED ? {
        // 统一代理所有API请求到后端（添加/api前缀）
        // 匹配规则：
        // 1. 匹配所有以 /api 开头的请求（直接转发）
        // 2. 匹配其他API路径，但要求路径包含更多段（如 /auth/login）或查询参数
        // 注意：单纯的前端路由路径（如 /dashboard）不应该被代理，而应由historyApiFallback处理
        '^/api': {
          target: envConfig.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path,
          headers: {
            Connection: 'keep-alive'
          }
        },
        // 匹配其他API路径（确保路径包含子路径，如 /auth/login, /devices/list）
        '^/(auth|devices|device-status|users|system|areas|stock|orders|reports|dashboard|performance-report|error-report|upload|export|import|logs|repair-records|scrap-records|batches|bin|inventory|maintenance|installation|warehouses|warehouse-zones|zones|business|excel|permissions|roles|zone-types|monitor|remote-accounts|health|csrf|installations)/': {
          target: envConfig.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => `/api${path}`,
          headers: {
            Connection: 'keep-alive'
          }
        }
      } : {},
      // 启动时自动打开浏览器
      open: envConfig.VITE_OPEN_BROWSER,
      // 开发服务器端口
      port: envConfig.VITE_DEV_PORT,
      // 严格端口模式：端口被占用时不自动切换，直接报错
      // 修改为true确保端口唯一性，防止多实例冲突
      strictPort: true,
      // 热模块替换增强
      hmr: {
        overlay: {
          errors: true,
          warnings: false
        },
        timeout: 5000,
        clientPort: envConfig.VITE_DEV_PORT
      },
      // 监听所有网络接口
      host: true,
      // 增加文件监听限制
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/reports/**'],
        usePolling: false,
        // 等待时间，避免文件频繁变化导致的多次重新构建
        awaitWriteFinish: {
          stabilityThreshold: 200,
          pollInterval: 100
        }
      },
      // 启用响应头优化
      headers: {
        'X-Powered-By': 'Vite',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-XSS-Protection': '1; mode=block',
        'X-Frame-Options': 'SAMEORIGIN'
      },
      // 优化开发服务器启动速度
      force: true,
      // 禁用HTTP 2
      http2: false,
      // 增加文件写入限制
      maxConcurrentFileWrites: 100,
      // 增加服务器稳定性配置
      middlewareMode: false,
      cors: true,
      // 增加连接超时设置
      fs: {
        strict: false,
        allow: ['..']
      }
    },

    // 构建优化配置
    build: {
      // 目标浏览器支持
      target: 'es2015',
      // 生成源映射，便于调试
      sourcemap: !isProduction && envConfig.VITE_SOURCE_MAP_ENABLED,
      // 开启CSS代码分割
      cssCodeSplit: true,
      // 压缩资源
      minify: isProduction ? 'terser' : 'esbuild',
      // 调整chunk大小警告限制（KB）
      chunkSizeWarningLimit: 1000,
      // 打包输出目录
      outDir: '../spring_boot/src/main/resources/static/',
      // 静态资源处理
      assetsDir: 'assets',
      // 静态资源文件名哈希长度
      assetsInlineLimit: 4096, // 4KB以下的资源内联
      // 启用文件压缩报告
      reportCompressedSize: true,
      // 多页面入口配置
      rollupOptions: {
        output: {
          // 配置静态资源分类打包
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          // 代码分割优化
          manualChunks: (id) => {
            // 将第三方库分割成独立的chunk
            if (id.includes('node_modules')) {
              if (id.includes('vue')) {
                return 'vue-vendor';
              }
              if (id.includes('vue-router')) {
                return 'vue-vendor';
              }
              if (id.includes('pinia')) {
                return 'vue-vendor';
              }
              if (id.includes('element-plus')) {
                if (id.includes('@element-plus/icons-vue')) {
                  return 'element-plus-icons';
                }
                return 'element-plus-core';
              }
              if (id.includes('echarts')) {
                return 'charting';
              }
              if (id.includes('axios')) {
                return 'utilities';
              }
              if (id.includes('exceljs')) {
                return 'utilities';
              }
              return 'vendor';
            }

            // 按业务模块分割代码
            if (id.includes('components/business/device')) {
              return 'device-module';
            }
            if (id.includes('views/inventory-management/repair')) {
              return 'repair-module';
            }
            if (id.includes('components/layout')) {
              return 'layout-components';
            }
            if (id.includes('views/system')) {
              return 'system-module';
            }
            if (id.includes('views/user-center')) {
              return 'user-module';
            }
            if (id.includes('views/dashboard')) {
              return 'dashboard-module';
            }
            if (id.includes('views/reports')) {
              return 'reports-module';
            }
          },
          // 外部化大型依赖，减少打包体积
          external: [],
          // 排除示例文件不参与构建
          input: {
            main: pathResolve('index.html'),
          },
        },
        // Terser压缩配置
        terserOptions: isProduction ? {
          compress: {
            unused: true,
            collapse_vars: true,
            warnings: false,
            keep_classnames: false,
            keep_fargs: false,
            keep_fnames: false,
            keep_infinity: false,
            passes: 3,
            drop_console: true,
            drop_debugger: true
          },
          format: {
            comments: false,
            beautify: false,
            ascii_only: true,
            quote_keys: true
          },
          ecma: 2015,
          keep_classnames: false,
          keep_fnames: false,
          ie8: false,
          module: true,
          safari10: false
        } : {}
      },
      // 启用CSS压缩
      cssMinify: isProduction
    },

    // 优化依赖预构建
    optimizeDeps: {
      // 强制预构建的依赖
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        '@element-plus/icons-vue',
        'axios',
        'echarts',
        'exceljs'
      ],
      // 排除不需要预构建的依赖
      exclude: [],
      // 启用依赖缓存
      cache: true,
      // 提高预构建速度
      esbuildOptions: {
        target: 'es2015',
        define: {
          global: 'globalThis'
        },
        supported: {
          'top-level-await': true
        }
      },
      // 启用并行构建
      maxWorkers: process.env.CI ? 1 : undefined
    },

    // CSS预处理器配置
    css: {
      // 启用CSS模块化
      modules: {
        generateScopedName: '[name]__[local]__[hash:base64:5]',
        hashPrefix: 'prefix'
      },
      // 全局CSS变量配置
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      },
      // 开发环境下的CSS sourcemap
      devSourcemap: !isProduction,
      // 配置CSS postcss
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              '> 1%',
              'last 2 versions',
              'not dead',
              'not IE 11'
            ]
          }),
          cssnano({
            preset: 'default'
          })
        ]
      }
    },

    // 日志配置
    logLevel: 'info',

    // 优化开发体验
    devBundler: 'esbuild',

    // 错误处理配置
    ssr: {
      noExternal: ['element-plus', '@element-plus/icons-vue']
    },

    // 实验性功能
    experimental: {
      // 启用vite的一些实验性功能
      hmrPartialAccept: true,
      // 配置CSS嵌套
      cssNesting: true,
      // 启用优化的依赖分析
      optimizeDepsAnalysis: true
    },

    // 调试配置
    debug: !isProduction,


  }
})
