<template>
  <PageLayout
    title="帮助中心"
    description="快速查找操作指南、常见问题和技术支持"
    data-cy="helpcenter-page"
    :no-padding="true"
  >
    <template #headerActions>
      <el-button :icon="VideoPlay" @click="showVideoTutorials" data-cy="video-tutorials-btn"> 视频教程 </el-button>
      <el-button :icon="Service" @click="showContactSupport" data-cy="contact-support-btn"> 联系支持 </el-button>
    </template>

    <div class="help-center-container">
      <div class="help-content">
        <div class="help-sidebar">
          <div class="search-box">
            <el-input
              data-cy="input-0"
              v-model="searchKeyword"
              placeholder="搜索帮助内容..."
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon data-cy="icon-0"><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="help-menu">
            <div class="menu-title">帮助分类</div>
            <div
              v-for="category in helpCategories"
              :key="category.id"
              :class="['menu-item', { active: activeCategory === category.id }]"
              @click="handleCategoryChange(category.id)"
            >
              <div class="menu-icon">
                <el-icon data-cy="icon-1">
                  <component :is="category.icon" />
                </el-icon>
              </div>
              <div class="menu-content">
                <span class="menu-name">{{ category.name }}</span>
                <span class="menu-count">{{ getCategoryCount(category.id) }}</span>
              </div>
            </div>
          </div>

          <div class="quick-links">
            <h3>快速链接</h3>
            <div class="link-list">
              <div class="link-item" @click="showQuickGuide">
                <el-icon><Guide /></el-icon>
                <span>快速入门指南</span>
              </div>
              <div class="link-item" @click="showKeyboardShortcuts">
                <el-icon><Tools /></el-icon>
                <span>快捷键说明</span>
              </div>
              <div class="link-item" @click="showVideoTutorials">
                <el-icon><VideoPlay /></el-icon>
                <span>视频教程</span>
              </div>
              <div class="link-item" @click="showContactSupport">
                <el-icon><Service /></el-icon>
                <span>联系技术支持</span>
              </div>
            </div>
          </div>
        </div>

        <div class="help-main">
          <div v-if="searchKeyword" class="search-results">
            <div class="section-header">
              <h2>搜索结果</h2>
              <el-tag size="small" type="info">{{ searchResults.length }} 条结果</el-tag>
            </div>
            <div v-if="searchResults.length > 0" class="result-list">
              <div v-for="result in searchResults" :key="result.id" class="result-item" @click="openArticle(result)">
                <div class="result-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="result-content">
                  <h3>{{ result.title }}</h3>
                  <p>{{ result.summary }}</p>
                  <div class="result-meta">
                    <el-tag data-cy="tag-0" size="small" :type="result.type === 'guide' ? 'primary' : 'info'">
                      {{ result.type === 'guide' ? '操作指南' : '常见问题' }}
                    </el-tag>
                    <el-tag size="small" type="success">{{ result.category }}</el-tag>
                    <span class="result-time">{{ result.updateTime }}</span>
                  </div>
                </div>
                <el-icon class="result-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
            <el-empty data-cy="empty-0" v-else description="未找到相关内容">
              <el-button type="primary" @click="clearSearch" data-cy="help-clear-search-btn">清除搜索</el-button>
            </el-empty>
          </div>

          <div v-else class="category-content">
            <div class="section-header">
              <h2>{{ currentCategory.name }}</h2>
              <p class="category-description">{{ currentCategory.description }}</p>
            </div>

            <div class="article-list">
              <div
                v-for="article in currentArticles"
                :key="article.id"
                class="article-item"
                @click="openArticle(article)"
              >
                <div class="article-icon" :class="article.type === 'guide' ? 'guide' : 'faq'">
                  <el-icon data-cy="icon-2">
                    <component :is="article.type === 'guide' ? Guide : QuestionFilled" />
                  </el-icon>
                </div>
                <div class="article-info">
                  <h3>{{ article.title }}</h3>
                  <p>{{ article.summary }}</p>
                  <div class="article-meta">
                    <el-tag data-cy="tag-1" size="small" :type="article.type === 'guide' ? 'primary' : 'info'">
                      {{ article.type === 'guide' ? '操作指南' : '常见问题' }}
                    </el-tag>
                    <span class="article-time">{{ article.updateTime }}</span>
                  </div>
                </div>
                <el-icon data-cy="icon-3" class="article-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      data-cy="dialog-0"
      v-model="articleDialogVisible"
      :title="currentArticle.title"
      width="80%"
      top="5vh"
      class="article-dialog"
    >
      <div class="article-content">
        <div class="article-meta">
          <el-tag data-cy="tag-2" :type="currentArticle.type === 'guide' ? 'primary' : 'info'">
            {{ currentArticle.type === 'guide' ? '操作指南' : '常见问题' }}
          </el-tag>
          <el-tag type="success">{{ currentArticle.category }}</el-tag>
          <span class="article-update-time">更新时间：{{ currentArticle.updateTime }}</span>
        </div>
        <div class="article-body" v-html="currentArticle.content"></div>
      </div>
      <template #footer>
        <el-button data-cy="btn-0" @click="articleDialogVisible = false">关闭</el-button>
        <el-button data-cy="btn-1" type="primary" @click="printArticle">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </template>
    </el-dialog>

    <el-dialog data-cy="dialog-1" v-model="quickGuideDialogVisible" title="快速入门指南" width="70%" top="5vh">
      <div class="quick-guide-content">
        <div class="guide-step" v-for="(step, index) in quickGuideSteps" :key="index">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <ShortcutHelpDialog v-model="shortcutHelpDialogVisible" />
  </PageLayout>
</template>

<script setup>
import {
  ArrowRight,
  Document,
  Search,
  Setting,
  Tools,
  User,
  Box,
  DataAnalysis,
  Guide,
  QuestionFilled,
  VideoPlay,
  Service,
  Printer,
} from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import PageLayout from '@/components/base/PageLayout.vue';
import ShortcutHelpDialog from '@/components/base/ShortcutHelpDialog.vue';

const router = useRouter();
const searchKeyword = ref('');
const activeCategory = ref('getting-started');
const articleDialogVisible = ref(false);
const quickGuideDialogVisible = ref(false);
const shortcutHelpDialogVisible = ref(false);

const currentArticle = ref({
  title: '',
  type: '',
  category: '',
  updateTime: '',
  content: '',
});

const helpCategories = [
  {
    id: 'getting-started',
    name: '快速入门',
    description: '了解系统基本功能和操作流程',
    icon: DataAnalysis,
  },
  {
    id: 'device-management',
    name: '设备管理',
    description: '设备信息管理、远程连接、设备报废等',
    icon: Box,
  },
  {
    id: 'inventory-management',
    name: '库存管理',
    description: '采购入库、安装出库、维修归还等',
    icon: Tools,
  },
  {
    id: 'installation-management',
    name: '安装管理',
    description: '设备安装、安装记录查询等',
    icon: Setting,
  },
  {
    id: 'repair-management',
    name: '维修管理',
    description: '设备维修、维修记录查询等',
    icon: Tools,
  },
  {
    id: 'user-management',
    name: '用户管理',
    description: '用户信息、权限设置、操作日志等',
    icon: User,
  },
  {
    id: 'troubleshooting',
    name: '故障排除',
    description: '常见问题解决方案和故障排查',
    icon: Setting,
  },
];

const helpArticles = {
  'getting-started': [
    {
      id: 'gs-001',
      title: '系统登录和基本操作',
      summary: '了解如何登录系统，以及系统界面的基本操作方法',
      type: 'guide',
      category: '快速入门',
      updateTime: '2025-12-21',
      content: `
        <h2>系统登录</h2>
        <p>1. 打开浏览器，输入系统地址</p>
        <p>2. 输入用户名和密码</p>
        <p>3. 点击"登录"按钮进入系统</p>
        <h2>界面介绍</h2>
        <p>系统采用左侧导航栏+右侧内容区的布局方式：</p>
        <ul>
          <li><strong>左侧导航栏</strong>：包含所有功能模块的入口</li>
          <li><strong>顶部工具栏</strong>：显示当前用户信息、通知等</li>
          <li><strong>右侧内容区</strong>：显示当前功能的操作界面</li>
        </ul>
        <h2>基本操作</h2>
        <ul>
          <li>点击导航栏菜单切换功能模块</li>
          <li>使用搜索功能快速查找数据</li>
          <li>点击"新增"按钮添加数据</li>
          <li>点击"编辑"按钮修改数据</li>
          <li>点击"删除"按钮删除数据</li>
        </ul>
      `,
    },
    {
      id: 'gs-002',
      title: '如何修改个人信息',
      summary: '修改头像、联系方式等个人信息的方法',
      type: 'guide',
      category: '快速入门',
      updateTime: '2025-12-21',
      content: `
        <h2>修改个人信息</h2>
        <p>1. 点击右上角用户头像，选择"个人中心"</p>
        <p>2. 在"个人信息"标签页中修改相关信息</p>
        <p>3. 点击"保存信息"按钮保存修改</p>
        <h2>上传头像</h2>
        <p>1. 在个人中心页面，点击"上传头像"按钮</p>
        <p>2. 选择要上传的图片文件（支持JPG、PNG格式）</p>
        <p>3. 文件大小不超过2MB</p>
        <h2>修改密码</h2>
        <p>1. 在个人中心页面，切换到"修改密码"标签页</p>
        <p>2. 输入当前密码</p>
        <p>3. 输入新密码（密码长度8-30位，必须包含大小写字母、数字和特殊字符）</p>
        <p>4. 再次输入新密码确认</p>
        <p>5. 点击"修改密码"按钮</p>
      `,
    },
  ],
  'device-management': [
    {
      id: 'dm-001',
      title: '如何查看设备列表',
      summary: '查看和管理设备信息',
      type: 'guide',
      category: '设备管理',
      updateTime: '2026-02-06',
      content: `
        <h2>查看设备列表</h2>
        <p>1. 进入"设备列表"页面</p>
        <p>2. 使用搜索功能筛选设备：</p>
        <ul>
          <li><strong>关键字</strong>：按设备编号或名称搜索</li>
          <li><strong>设备类型</strong>：筛选特定类型的设备</li>
          <li><strong>状态</strong>：按设备状态筛选（在线、离线、维修中、异常）</li>
          <li><strong>区域</strong>：按所在区域筛选</li>
        </ul>
        <p>3. 查看设备详情和操作：</p>
        <ul>
          <li><strong>查看详情</strong>：点击"查看详情"按钮查看完整信息</li>
          <li><strong>编辑</strong>：修改设备基本信息</li>
          <li><strong>远程连接</strong>：连接到设备进行远程操作</li>
          <li><strong>维修记录</strong>：查看设备的维修历史</li>
          <li><strong>历史记录</strong>：查看设备的操作历史</li>
        </ul>
        <h2>注意事项</h2>
        <ul>
          <li>新设备必须通过"入库管理"模块添加</li>
          <li>设备状态会自动更新</li>
          <li>支持导出设备列表为Excel文件</li>
        </ul>
      `,
    },
    {
      id: 'dm-002',
      title: '设备远程连接配置',
      summary: '配置设备远程连接的方法和步骤',
      type: 'guide',
      category: '设备管理',
      updateTime: '2026-02-06',
      content: `
        <h2>远程连接配置</h2>
        <p>1. 在设备列表中，点击"远程连接"按钮</p>
        <p>2. 填写远程连接信息：</p>
        <ul>
          <li><strong>连接类型</strong>：SSH、RDP、VNC等</li>
          <li><strong>主机地址</strong>：设备的IP地址或主机名</li>
          <li><strong>端口</strong>：连接端口号</li>
          <li><strong>用户名</strong>：登录用户名</li>
          <li><strong>密码</strong>：登录密码</li>
        </ul>
        <p>3. 点击"测试连接"验证配置是否正确</p>
        <p>4. 点击"保存"按钮保存配置</p>
        <h2>注意事项</h2>
        <ul>
          <li>密码信息会加密存储</li>
          <li>建议定期更换远程连接密码</li>
          <li>确保网络连接正常</li>
        </ul>
      `,
    },
    {
      id: 'dm-003',
      title: '设备报废流程',
      summary: '设备报废的申请和审批流程',
      type: 'guide',
      category: '设备管理',
      updateTime: '2026-02-06',
      content: `
        <h2>设备报废流程</h2>
        <p>1. 在设备列表中，点击"报废"按钮</p>
        <p>2. 填写报废信息：</p>
        <ul>
          <li><strong>报废原因</strong>：选择报废原因（老化、损坏、技术淘汰等）</li>
          <li><strong>报废说明</strong>：详细说明报废原因</li>
          <li><strong>报废日期</strong>：选择报废日期</li>
        </ul>
        <p>3. 点击"提交"按钮提交报废申请</p>
        <p>4. 等待管理员审核</p>
        <h2>审核流程</h2>
        <ul>
          <li>管理员收到报废申请后进行审核</li>
          <li>审核通过后，设备状态更新为"已报废"</li>
          <li>审核驳回后，设备状态保持不变</li>
        </ul>
      `,
    },
  ],
  'inventory-management': [
    {
      id: 'im-001',
      title: '采购入库操作指南',
      summary: '采购入库的完整操作流程和注意事项',
      type: 'guide',
      category: '库存管理',
      updateTime: '2025-12-21',
      content: `
        <h2>采购入库流程</h2>
        <p>1. 进入"采购入库"页面</p>
        <p>2. 点击"新增入库"按钮</p>
        <p>3. 填写入库信息：</p>
        <ul>
          <li><strong>入库单号</strong>：系统自动生成，也可手动输入</li>
          <li><strong>设备编号</strong>：输入设备编号，系统自动填充设备信息</li>
          <li><strong>入库数量</strong>：输入入库数量</li>
          <li><strong>入库原因</strong>：选择入库原因（新采购、归还、调拨等）</li>
          <li><strong>所在区域</strong>：选择设备存储的城市和区县</li>
        </ul>
        <p>4. 点击"提交"按钮提交入库申请</p>
        <p>5. 等待管理员审核</p>
        <h2>审核流程</h2>
        <ul>
          <li>管理员收到入库申请后进行审核</li>
          <li>审核通过后，库存数量增加，设备状态更新为"库存中"</li>
          <li>审核驳回后，需要重新提交申请</li>
        </ul>
        <h2>快捷键</h2>
        <ul>
          <li><strong>Ctrl + N</strong>：新增入库</li>
          <li><strong>Ctrl + A</strong>：批量审核通过</li>
          <li><strong>Ctrl + R</strong>：批量驳回</li>
          <li><strong>Ctrl + F</strong>：聚焦搜索框</li>
          <li><strong>Esc</strong>：关闭对话框</li>
        </ul>
      `,
    },
    {
      id: 'im-002',
      title: '安装出库操作指南',
      summary: '安装出库的完整操作流程和注意事项',
      type: 'guide',
      category: '库存管理',
      updateTime: '2025-12-21',
      content: `
        <h2>安装出库流程</h2>
        <p>1. 进入"安装出库"页面</p>
        <p>2. 点击"新增出库"按钮</p>
        <p>3. 填写出库信息：</p>
        <ul>
          <li><strong>出库单号</strong>：系统自动生成，也可手动输入</li>
          <li><strong>设备编号</strong>：输入设备编号，系统自动填充设备信息</li>
          <li><strong>出库数量</strong>：输入出库数量（不能超过库存数量）</li>
          <li><strong>安装城市</strong>：选择设备安装的城市</li>
          <li><strong>安装区县</strong>：选择设备安装的区县</li>
          <li><strong>安装地址</strong>：输入详细的安装地址</li>
          <li><strong>联系人</strong>：输入联系人姓名</li>
          <li><strong>联系电话</strong>：输入联系电话</li>
        </ul>
        <p>4. 点击"提交"按钮提交出库申请</p>
        <p>5. 等待管理员审核</p>
        <h2>审核流程</h2>
        <ul>
          <li>管理员收到出库申请后进行审核</li>
          <li>审核通过后，库存数量减少，设备状态更新为"使用中"</li>
          <li>审核驳回后，需要重新提交申请</li>
        </ul>
        <h2>快捷键</h2>
        <ul>
          <li><strong>Ctrl + N</strong>：新增出库</li>
          <li><strong>Ctrl + A</strong>：批量审核通过</li>
          <li><strong>Ctrl + R</strong>：批量驳回</li>
          <li><strong>Ctrl + F</strong>：聚焦搜索框</li>
          <li><strong>Esc</strong>：关闭对话框</li>
        </ul>
      `,
    },
    {
      id: 'im-003',
      title: '维修归还操作指南',
      summary: '维修归还的完整操作流程和注意事项',
      type: 'guide',
      category: '库存管理',
      updateTime: '2025-12-21',
      content: `
        <h2>维修归还流程</h2>
        <p>1. 进入"维修归还"页面</p>
        <p>2. 点击"新增归还"按钮</p>
        <p>3. 填写归还信息：</p>
        <ul>
          <li><strong>归还单号</strong>：系统自动生成，也可手动输入</li>
          <li><strong>设备编号</strong>：输入设备编号，系统自动填充设备信息</li>
          <li><strong>归还数量</strong>：输入归还数量</li>
          <li><strong>所在区域</strong>：选择设备存储的城市和区县</li>
          <li><strong>归还原因</strong>：选择归还原因（维修完成、故障修复等）</li>
        </ul>
        <p>4. 点击"提交"按钮提交归还申请</p>
        <p>5. 等待管理员审核</p>
        <h2>审核流程</h2>
        <ul>
          <li>管理员收到归还申请后进行审核</li>
          <li>审核通过后，设备状态更新为"库存中"</li>
          <li>审核驳回后，需要重新提交申请</li>
        </ul>
        <h2>快捷键</h2>
        <ul>
          <li><strong>Ctrl + N</strong>：新增归还</li>
          <li><strong>Ctrl + A</strong>：批量审核通过</li>
          <li><strong>Ctrl + R</strong>：批量驳回</li>
          <li><strong>Ctrl + F</strong>：聚焦搜索框</li>
          <li><strong>Esc</strong>：关闭对话框</li>
        </ul>
      `,
    },
  ],
  'installation-management': [
    {
      id: 'inm-001',
      title: '设备安装流程',
      summary: '设备安装的完整流程和注意事项',
      type: 'guide',
      category: '安装管理',
      updateTime: '2025-12-21',
      content: `
        <h2>设备安装流程</h2>
        <p>1. 在"安装管理"页面，点击"新增安装"按钮</p>
        <p>2. 填写安装信息：</p>
        <ul>
          <li><strong>安装单号</strong>：系统自动生成</li>
          <li><strong>设备编号</strong>：选择要安装的设备</li>
          <li><strong>安装城市</strong>：选择安装城市</li>
          <li><strong>安装区县</strong>：选择安装区县</li>
          <li><strong>安装地址</strong>：输入详细安装地址</li>
          <li><strong>安装日期</strong>：选择安装日期</li>
          <li><strong>安装人员</strong>：输入安装人员姓名</li>
          <li><strong>联系电话</strong>：输入联系电话</li>
        </ul>
        <p>3. 点击"提交"按钮保存安装记录</p>
        <h2>注意事项</h2>
        <ul>
          <li>安装前确保设备已出库</li>
          <li>安装完成后及时更新设备状态</li>
          <li>保留安装记录以备查询</li>
        </ul>
      `,
    },
  ],
  'repair-management': [
    {
      id: 'rm-001',
      title: '设备维修流程',
      summary: '设备维修的完整流程和注意事项',
      type: 'guide',
      category: '维修管理',
      updateTime: '2025-12-21',
      content: `
        <h2>设备维修流程</h2>
        <p>1. 在"维修管理"页面，点击"新增维修"按钮</p>
        <p>2. 填写维修信息：</p>
        <ul>
          <li><strong>维修单号</strong>：系统自动生成</li>
          <li><strong>设备编号</strong>：选择要维修的设备</li>
          <li><strong>故障描述</strong>：详细描述设备故障</li>
          <li><strong>维修类型</strong>：选择维修类型（硬件维修、软件维修、其他）</li>
          <li><strong>维修日期</strong>：选择维修日期</li>
          <li><strong>维修人员</strong>：输入维修人员姓名</li>
          <li><strong>维修费用</strong>：输入维修费用</li>
        </ul>
        <p>3. 点击"提交"按钮保存维修记录</p>
        <h2>注意事项</h2>
        <ul>
          <li>维修前设备状态应为"使用中"</li>
          <li>维修完成后设备状态更新为"维修中"</li>
          <li>维修完成后需要通过"维修归还"流程将设备归还到库存</li>
        </ul>
      `,
    },
  ],
  'user-management': [
    {
      id: 'um-001',
      title: '用户权限管理',
      summary: '用户角色和权限的配置方法',
      type: 'guide',
      category: '用户管理',
      updateTime: '2025-12-21',
      content: `
        <h2>用户角色</h2>
        <p>系统支持两种用户角色：</p>
        <ul>
          <li><strong>管理员</strong>：拥有所有权限，可以管理所有数据和用户</li>
          <li><strong>操作员</strong>：可以查看和操作业务数据，但不能管理用户</li>
        </ul>
        <h2>权限配置</h2>
        <p>1. 进入"用户管理"页面</p>
        <p>2. 选择要配置权限的用户</p>
        <p>3. 点击"编辑权限"按钮</p>
        <p>4. 选择用户角色和权限</p>
        <p>5. 点击"保存"按钮</p>
      `,
    },
  ],
  troubleshooting: [
    {
      id: 'ts-001',
      title: '无法登录系统',
      summary: '解决登录失败的问题',
      type: 'faq',
      category: '故障排除',
      updateTime: '2025-12-21',
      content: `
        <h2>问题描述</h2>
        <p>输入用户名和密码后，无法登录系统</p>
        <h2>可能原因</h2>
        <ul>
          <li>用户名或密码输入错误</li>
          <li>账号已被禁用</li>
          <li>网络连接问题</li>
        </ul>
        <h2>解决方案</h2>
        <ul>
          <li>检查用户名和密码是否正确</li>
          <li>联系管理员确认账号状态</li>
          <li>检查网络连接是否正常</li>
          <li>清除浏览器缓存后重试</li>
        </ul>
      `,
    },
    {
      id: 'ts-002',
      title: '设备无法远程连接',
      summary: '解决设备远程连接失败的问题',
      type: 'faq',
      category: '故障排除',
      updateTime: '2025-12-21',
      content: `
        <h2>问题描述</h2>
        <p>点击"远程连接"按钮后，无法连接到设备</p>
        <h2>可能原因</h2>
        <ul>
          <li>设备已离线</li>
          <li>网络连接问题</li>
          <li>远程连接配置错误</li>
          <li>防火墙阻止连接</li>
        </ul>
        <h2>解决方案</h2>
        <ul>
          <li>检查设备状态是否为"在线"</li>
          <li>检查网络连接是否正常</li>
          <li>验证远程连接配置是否正确</li>
          <li>检查防火墙设置</li>
          <li>联系网络管理员协助排查</li>
        </ul>
      `,
    },
  ],
};

const quickGuideSteps = [
  {
    title: '登录系统',
    description: '使用您的用户名和密码登录系统，首次登录后建议立即修改密码',
  },
  {
    title: '熟悉界面',
    description: '浏览系统界面，了解左侧导航栏和顶部工具栏的功能',
  },
  {
    title: '查看设备',
    description: '进入设备列表页面，查看和管理设备信息',
  },
  {
    title: '学习操作',
    description: '阅读操作指南，学习如何进行采购入库、安装出库等操作',
  },
  {
    title: '获取帮助',
    description: '遇到问题时，可以通过帮助中心查找解决方案或联系技术支持',
  },
];

const currentCategory = computed(() => {
  return helpCategories.find((cat) => cat.id === activeCategory.value) || helpCategories[0];
});

const currentArticles = computed(() => {
  return helpArticles[activeCategory.value] || [];
});

const searchResults = computed(() => {
  if (!searchKeyword.value) {
    return [];
  }
  const keyword = searchKeyword.value.toLowerCase();
  const results = [];
  Object.keys(helpArticles).forEach((categoryId) => {
    const category = helpCategories.find((cat) => cat.id === categoryId);
    helpArticles[categoryId].forEach((article) => {
      if (article.title.toLowerCase().includes(keyword) || article.summary.toLowerCase().includes(keyword)) {
        results.push({
          ...article,
          category: category ? category.name : '',
        });
      }
    });
  });
  return results;
});

const getCategoryCount = (categoryId) => {
  return helpArticles[categoryId]?.length || 0;
};

const handleCategoryChange = (categoryId) => {
  activeCategory.value = categoryId;
  searchKeyword.value = '';
};

const handleSearch = () => {
  if (searchKeyword.value) {
    activeCategory.value = '';
  }
};

const clearSearch = () => {
  searchKeyword.value = '';
  activeCategory.value = 'getting-started';
};

const openArticle = (article) => {
  currentArticle.value = article;
  articleDialogVisible.value = true;
};

const printArticle = () => {
  window.print();
};

const showQuickGuide = () => {
  quickGuideDialogVisible.value = true;
};

const showKeyboardShortcuts = () => {
  shortcutHelpDialogVisible.value = true;
};

const showVideoTutorials = () => {
  router.push('/video-tutorials');
};

const showContactSupport = () => {
  router.push('/contact-support');
};
</script>

<style scoped>
.help-center-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.help-content {
  display: flex;
  gap: 24px;
  height: 100%;
  min-height: calc(100vh - 200px);
}

.help-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.search-box {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.help-menu {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
  overflow-y: auto;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 4px;
  color: #606266;
  background: transparent;

  &:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    color: #3b82f6;
    transform: translateX(4px);
  }

  &.active {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  .menu-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f9ff;
    border-radius: 8px;
    margin-right: 12px;
    color: #3b82f6;
    font-size: 18px;
    transition: all 0.3s ease;
  }

  .menu-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .menu-name {
    font-size: 14px;
  }

  .menu-count {
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.quick-links {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  color: white;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: white;
  }

  .link-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .link-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 14px;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      transform: translateX(4px);
    }

    .el-icon {
      font-size: 16px;
    }
  }
}

.help-main {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  min-height: 600px;
}

.section-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f9ff;

  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .category-description {
    color: #64748b;
    font-size: 15px;
    margin: 0;
    line-height: 1.6;
  }
}

.search-results,
.category-content {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.result-list,
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item,
.article-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fafafa 0%, #f8fafc 100%);

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }

  .result-icon,
  .article-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    transition: all 0.3s ease;
  }

  .result-icon {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
  }

  .article-icon {
    &.guide {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb;
    }

    &.faq {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #d97706;
    }
  }

  .result-content,
  .article-info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      line-height: 1.4;
    }

    p {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .result-meta,
  .article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .result-time,
    .article-time {
      color: #94a3b8;
      font-size: 13px;
    }
  }

  .result-arrow,
  .article-arrow {
    flex-shrink: 0;
    color: #cbd5e1;
    font-size: 20px;
    transition: all 0.3s ease;
  }

  &:hover .result-arrow,
  &:hover .article-arrow {
    color: #3b82f6;
    transform: translateX(4px);
  }
}

.article-dialog {
  :deep(.el-dialog__body) {
    max-height: 70vh;
    overflow-y: auto;
    padding: 24px;
  }

  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
  }
}

.article-content {
  .article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 2px solid #f0f9ff;
    margin-bottom: 24px;

    .article-category,
    .article-update-time {
      color: #64748b;
      font-size: 14px;
    }
  }

  .article-body {
    line-height: 1.8;
    color: #334155;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1a202c;
      margin: 32px 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 3px solid #3b82f6;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1a202c;
      margin: 24px 0 12px 0;
    }

    p {
      margin: 12px 0;
      color: #475569;
      font-size: 15px;
    }

    ul,
    ol {
      margin: 12px 0;
      padding-left: 24px;
      color: #475569;

      li {
        margin: 8px 0;
        font-size: 15px;
      }
    }

    strong {
      color: #1a202c;
      font-weight: 600;
    }
  }
}

.quick-guide-content {
  .guide-step {
    display: flex;
    align-items: flex-start;
    padding: 24px 0;
    border-bottom: 1px solid #e2e8f0;

    &:last-child {
      border-bottom: none;
    }

    .step-number {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      margin-right: 20px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .step-content {
      flex: 1;

      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a202c;
      }

      p {
        margin: 0;
        color: #64748b;
        line-height: 1.6;
        font-size: 15px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .help-sidebar {
    width: 260px;
  }
}

@media (max-width: 768px) {
  .help-content {
    flex-direction: column;
  }

  .help-sidebar {
    width: 100%;
  }

  .help-main {
    padding: 20px;
  }

  .section-header {
    h2 {
      font-size: 22px;
    }
  }

  .result-item,
  .article-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-arrow,
  .article-arrow {
    display: none;
  }
}
</style>
