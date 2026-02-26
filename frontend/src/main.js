/*
 * @file: main.js
 * @description: 应用入口文件，初始化Vue应用、插件和全局配置
 * @author: 开发团队
 * @createTime: 2025-12-21
 * @version: 1.0.0
 * @modifyRecords:
 *     2025-12-21: 初始版本创建
 *     2026-01-30: 添加全局加载和错误处理组件
 */
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
// 样式系统版本
const STYLE_VERSION = '2.0.0';

// 统一样式入口（推荐方式）
import './assets/styles/_index.scss';

// 注意：以下文件已被整合到统一样式中，不再单独导入
// - components.scss -> 整合到 components-unified.scss
// - layout-optimization.scss -> 整合到 global.scss
// - search-form-enhancement.scss -> 整合到 components-unified.scss
// - unified-search-bar.scss -> 整合到 components-unified.scss
// - ui-fixes.scss -> 整合到 element-override.scss
import ActionBar from './components/base/ActionBar.vue';
import DataTable from './components/base/DataTable.vue';
import ErrorBoundary from './components/base/ErrorBoundary.vue';
import GlobalError from './components/base/GlobalError.vue';
import GlobalLoading from './components/base/GlobalLoading.vue';
import OptimizedForm from './components/base/OptimizedForm.vue';
import PageLayout from './components/base/PageLayout.vue';
import { permission, role } from './directives/permission.js';
import router from './router';
import { initErrorMonitor } from './utils/errors/errorMonitor';
import { initNetworkMonitor } from './utils/network';
import { initPerformanceMonitor } from './utils/performance';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 初始化错误监控
// 注意：错误监控API直接上报到后端，使用相对路径（不带/api前缀）
// Vite代理会将 /error-report 转发到 /api/error-report
if (import.meta.env.PROD) {
  initErrorMonitor({
    enabled: true,
    reportUrl: '/error-report',
    batchSize: 10,
    reportInterval: 30000,
  });
} else {
  initErrorMonitor({
    enabled: true,
    reportUrl: '/error-report',
    batchSize: 5,
    reportInterval: 60000,
  });
}

// 初始化性能监控
// 注意：性能监控API直接上报到后端，使用相对路径（不带/api前缀）
// Vite代理会将 /performance-report 转发到 /api/performance-report
if (import.meta.env.PROD) {
  initPerformanceMonitor({
    enabled: true,
    reportUrl: '/performance-report',
    batchSize: 5,
    reportInterval: 30000,
  });
} else {
  // 开发环境下禁用性能监控，避免控制台报错
  initPerformanceMonitor({
    enabled: false,
    reportUrl: '/performance-report',
    batchSize: 3,
    reportInterval: 60000,
  });
}

// 注册全局组件
app.component('GlobalLoading', GlobalLoading);
app.component('GlobalError', GlobalError);
app.component('ErrorBoundary', ErrorBoundary);
app.component('PageLayout', PageLayout);
app.component('DataTable', DataTable);
app.component('ActionBar', ActionBar);
app.component('OptimizedForm', OptimizedForm);

// 注册权限指令
app.directive('permission', permission);
app.directive('role', role);

// 初始化网络状态监控
initNetworkMonitor();

// 注册Element Plus，使用中文语言包
app.use(ElementPlus, {
  locale: zhCn,
});

// 开发环境调试日志
if (import.meta.env.DEV) {
  // 调试信息已禁用，使用logger模块记录关键信息
}

app.mount('#app');

if (import.meta.env.DEV) {
  window.app = app;
}
