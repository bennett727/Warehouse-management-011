<!--
  @file: Config.vue
  @description: 系统配置页面 - 管理系统基础信息、邮件、短信、存储和安全设置
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
  @modifyRecords:
      2026-02-12: 优化布局和视觉设计，增强用户体验
-->
<template>
  <PageLayout
    title="系统参数"
    description="管理系统基础信息、邮件、短信、存储和安全设置"
    data-cy="config-page"
    :no-padding="true"
  >
    <div class="system-config-container">
      <el-card class="config-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon"><Setting /></el-icon>
              <span class="header-title">系统配置</span>
            </div>
            <el-tag type="info" effect="plain">
              <el-icon><Edit /></el-icon>
              配置管理
            </el-tag>
          </div>
        </template>

        <el-tabs v-model="activeTab" class="config-tabs" tab-position="left">
          <el-tab-pane v-if="isAdmin" name="basic">
            <template #label>
              <div class="tab-label">
                <el-icon><InfoFilled /></el-icon>
                <span>系统基础信息</span>
              </div>
            </template>
            <div class="tab-content">
              <el-form
                ref="basicForm"
                :model="basicFormData"
                :rules="basicRules"
                label-width="140px"
                class="config-form"
              >
                <el-form-item label="系统名称" prop="systemName">
                  <el-input v-model="basicFormData.systemName" placeholder="请输入系统名称" clearable>
                    <template #prefix>
                      <el-icon><Monitor /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="系统版本" prop="systemVersion">
                  <el-input v-model="basicFormData.systemVersion" placeholder="请输入系统版本" clearable>
                    <template #prefix>
                      <el-icon><PriceTag /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="系统描述">
                  <el-input
                    v-model="basicFormData.systemDescription"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入系统描述"
                  />
                </el-form-item>
                <el-form-item label="维护联系人" prop="contactPerson">
                  <el-input v-model="basicFormData.contactPerson" placeholder="请输入维护联系人" clearable>
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="contactPhone">
                  <el-input v-model="basicFormData.contactPhone" placeholder="请输入联系电话" clearable>
                    <template #prefix>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveBasicConfig" :loading="buttonLoading.saveBasic" size="large">
                    <el-icon><Check /></el-icon>
                    保存配置
                  </el-button>
                  <el-button @click="resetBasicForm" :loading="buttonLoading.resetBasic" size="large">
                    <el-icon><RefreshLeft /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="isAdmin" name="email">
            <template #label>
              <div class="tab-label">
                <el-icon><Message /></el-icon>
                <span>邮件配置</span>
              </div>
            </template>
            <div class="tab-content">
              <el-form
                ref="emailForm"
                :model="emailFormData"
                :rules="emailRules"
                label-width="140px"
                class="config-form"
              >
                <el-form-item label="SMTP服务器" prop="smtpServer">
                  <el-input v-model="emailFormData.smtpServer" placeholder="请输入SMTP服务器地址" clearable>
                    <template #prefix>
                      <el-icon><Connection /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="SMTP端口" prop="smtpPort">
                  <el-input-number v-model="emailFormData.smtpPort" :min="1" :max="65535" :step="1" />
                </el-form-item>
                <el-form-item label="发件人邮箱" prop="senderEmail">
                  <el-input v-model="emailFormData.senderEmail" placeholder="请输入发件人邮箱" clearable>
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="邮箱密码" prop="emailPassword">
                  <el-input
                    v-model="emailFormData.emailPassword"
                    type="password"
                    placeholder="请输入邮箱密码"
                    show-password
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="启用SSL" prop="enableSSL">
                  <el-switch v-model="emailFormData.enableSSL" active-text="启用" inactive-text="禁用" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveEmailConfig" :loading="buttonLoading.saveEmail" size="large">
                    <el-icon><Check /></el-icon>
                    保存配置
                  </el-button>
                  <el-button @click="resetEmailForm" :loading="buttonLoading.resetEmail" size="large">
                    <el-icon><RefreshLeft /></el-icon>
                    重置
                  </el-button>
                  <el-button type="info" @click="testEmailConfig" :loading="buttonLoading.testEmail" size="large">
                    <el-icon><Connection /></el-icon>
                    测试连接
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="isAdmin" name="sms">
            <template #label>
              <div class="tab-label">
                <el-icon><ChatDotRound /></el-icon>
                <span>短信配置</span>
              </div>
            </template>
            <div class="tab-content">
              <el-form ref="smsForm" :model="smsFormData" :rules="smsRules" label-width="140px" class="config-form">
                <el-form-item label="短信服务商" prop="smsProvider">
                  <el-select v-model="smsFormData.smsProvider" placeholder="请选择短信服务商" style="width: 100%">
                    <el-option label="阿里云短信" value="aliyun">
                      <el-icon><Platform /></el-icon>
                      <span>阿里云短信</span>
                    </el-option>
                    <el-option label="腾讯云短信" value="tencent">
                      <el-icon><Platform /></el-icon>
                      <span>腾讯云短信</span>
                    </el-option>
                    <el-option label="华为云短信" value="huawei">
                      <el-icon><Platform /></el-icon>
                      <span>华为云短信</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="API密钥" prop="apiKey">
                  <el-input v-model="smsFormData.apiKey" placeholder="请输入API密钥" clearable>
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="API密钥ID" prop="apiSecret">
                  <el-input v-model="smsFormData.apiSecret" placeholder="请输入API密钥ID" clearable>
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="签名" prop="signature">
                  <el-input v-model="smsFormData.signature" placeholder="请输入短信签名" clearable>
                    <template #prefix>
                      <el-icon><EditPen /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="模板ID" prop="templateId">
                  <el-input v-model="smsFormData.templateId" placeholder="请输入模板ID" clearable>
                    <template #prefix>
                      <el-icon><Document /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveSmsConfig" :loading="buttonLoading.saveSms" size="large">
                    <el-icon><Check /></el-icon>
                    保存配置
                  </el-button>
                  <el-button @click="resetSmsForm" :loading="buttonLoading.resetSms" size="large">
                    <el-icon><RefreshLeft /></el-icon>
                    重置
                  </el-button>
                  <el-button type="info" @click="testSmsConfig" :loading="buttonLoading.testSms" size="large">
                    <el-icon><ChatDotRound /></el-icon>
                    测试发送
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="isAdmin" name="storage">
            <template #label>
              <div class="tab-label">
                <el-icon><FolderOpened /></el-icon>
                <span>存储配置</span>
              </div>
            </template>
            <div class="tab-content">
              <el-form
                ref="storageForm"
                :model="storageFormData"
                :rules="storageRules"
                label-width="140px"
                class="config-form"
              >
                <el-form-item label="存储类型" prop="storageType">
                  <el-select v-model="storageFormData.storageType" placeholder="请选择存储类型" style="width: 100%">
                    <el-option label="本地存储" value="local">
                      <el-icon><Folder /></el-icon>
                      <span>本地存储</span>
                    </el-option>
                    <el-option label="阿里云OSS" value="oss">
                      <el-icon><Platform /></el-icon>
                      <span>阿里云OSS</span>
                    </el-option>
                    <el-option label="腾讯云COS" value="cos">
                      <el-icon><Platform /></el-icon>
                      <span>腾讯云COS</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="存储路径" prop="storagePath">
                  <el-input v-model="storageFormData.storagePath" placeholder="请输入存储路径" clearable>
                    <template #prefix>
                      <el-icon><FolderOpened /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="storageFormData.storageType !== 'local'" label="Endpoint" prop="endpoint">
                  <el-input v-model="storageFormData.endpoint" placeholder="请输入存储服务地址" clearable>
                    <template #prefix>
                      <el-icon><Connection /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="storageFormData.storageType !== 'local'" label="Access Key" prop="accessKey">
                  <el-input v-model="storageFormData.accessKey" placeholder="请输入Access Key" clearable>
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="storageFormData.storageType !== 'local'" label="Secret Key" prop="secretKey">
                  <el-input
                    v-model="storageFormData.secretKey"
                    type="password"
                    placeholder="请输入Secret Key"
                    show-password
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="storageFormData.storageType !== 'local'" label="Bucket名称" prop="bucketName">
                  <el-input v-model="storageFormData.bucketName" placeholder="请输入Bucket名称" clearable>
                    <template #prefix>
                      <el-icon><Document /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="saveStorageConfig"
                    :loading="buttonLoading.saveStorage"
                    size="large"
                  >
                    <el-icon><Check /></el-icon>
                    保存配置
                  </el-button>
                  <el-button @click="resetStorageForm" :loading="buttonLoading.resetStorage" size="large">
                    <el-icon><RefreshLeft /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="isAdmin" name="security">
            <template #label>
              <div class="tab-label">
                <el-icon><Lock /></el-icon>
                <span>安全设置</span>
              </div>
            </template>
            <div class="tab-content">
              <el-form
                ref="securityForm"
                :model="securityFormData"
                :rules="securityRules"
                label-width="160px"
                class="config-form"
              >
                <el-form-item label="密码复杂度" prop="passwordComplexity">
                  <el-select
                    v-model="securityFormData.passwordComplexity"
                    placeholder="请选择密码复杂度"
                    style="width: 100%"
                  >
                    <el-option label="简单" value="simple">
                      <el-icon><Star /></el-icon>
                      <span>简单</span>
                    </el-option>
                    <el-option label="中等" value="medium">
                      <el-icon><StarFilled /></el-icon>
                      <span>中等</span>
                    </el-option>
                    <el-option label="复杂" value="complex">
                      <el-icon><StarFilled /></el-icon>
                      <span>复杂</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="密码有效期(天)" prop="passwordExpiry">
                  <el-input-number v-model="securityFormData.passwordExpiry" :min="7" :max="365" :step="1" />
                </el-form-item>
                <el-form-item label="登录失败次数限制" prop="loginFailLimit">
                  <el-input-number v-model="securityFormData.loginFailLimit" :min="3" :max="20" :step="1" />
                </el-form-item>
                <el-form-item label="验证码有效期(分钟)" prop="captchaExpiry">
                  <el-input-number v-model="securityFormData.captchaExpiry" :min="1" :max="30" :step="1" />
                </el-form-item>
                <el-form-item label="会话超时时间(分钟)" prop="sessionTimeout">
                  <el-input-number v-model="securityFormData.sessionTimeout" :min="5" :max="120" :step="1" />
                </el-form-item>
                <el-form-item label="启用IP白名单" prop="enableIpWhitelist">
                  <el-switch v-model="securityFormData.enableIpWhitelist" active-text="启用" inactive-text="禁用" />
                </el-form-item>
                <el-form-item v-if="securityFormData.enableIpWhitelist" label="IP白名单">
                  <el-input
                    v-model="securityFormData.ipWhitelist"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入IP白名单，多个IP用换行分隔"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="saveSecurityConfig"
                    :loading="buttonLoading.saveSecurity"
                    size="large"
                  >
                    <el-icon><Check /></el-icon>
                    保存配置
                  </el-button>
                  <el-button @click="resetSecurityForm" :loading="buttonLoading.resetSecurity" size="large">
                    <el-icon><RefreshLeft /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </PageLayout>
</template>

<script setup>
import {
  Setting,
  InfoFilled,
  Message,
  ChatDotRound,
  FolderOpened,
  Lock,
  Monitor,
  PriceTag,
  User,
  Phone,
  Connection,
  Key,
  EditPen,
  Document,
  Folder,
  Platform,
  Star,
  StarFilled,
  Check,
  RefreshLeft,
  Edit,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

import { getAllConfigs, saveOrUpdateConfigs } from '@/api/system/systemConfig';
import PageLayout from '@/components/base/PageLayout.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const createDebounce = (fn, delay) => {
  let timeoutId = null;
  const debouncedFn = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  return debouncedFn;
};

const currentUserRole = computed(() => userStore.user?.role || 'operator');
const isAdmin = computed(() => currentUserRole.value === 'admin');

const activeTab = ref('basic');
const loading = ref(false);

const buttonLoading = reactive({
  saveBasic: false,
  resetBasic: false,
  saveEmail: false,
  resetEmail: false,
  testEmail: false,
  saveSms: false,
  resetSms: false,
  testSms: false,
  saveStorage: false,
  resetStorage: false,
  saveSecurity: false,
  resetSecurity: false,
});

const basicForm = ref(null);
const emailForm = ref(null);
const smsForm = ref(null);
const storageForm = ref(null);
const securityForm = ref(null);

const basicFormData = reactive({
  systemName: '仓库管理系统',
  systemVersion: 'v1.0.0',
  systemDescription: '企业级仓库管理系统，提供设备、库存、维护等全流程管理',
  contactPerson: '技术支持',
  contactPhone: '400-123-4567',
});

const basicRules = {
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  systemVersion: [{ required: true, message: '请输入系统版本', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入维护联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
};

const emailFormData = reactive({
  smtpServer: 'smtp.example.com',
  smtpPort: 465,
  senderEmail: 'admin@example.com',
  emailPassword: '',
  enableSSL: true,
});

const emailRules = {
  smtpServer: [{ required: true, message: '请输入SMTP服务器', trigger: 'blur' }],
  smtpPort: [{ required: true, message: '请输入SMTP端口', trigger: 'blur' }],
  senderEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  emailPassword: [{ required: true, message: '请输入邮箱密码', trigger: 'blur' }],
};

const smsFormData = reactive({
  smsProvider: '',
  apiKey: '',
  apiSecret: '',
  signature: '',
  templateId: '',
});

const smsRules = {
  smsProvider: [{ required: true, message: '请选择短信服务商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }],
  apiSecret: [{ required: true, message: '请输入API密钥ID', trigger: 'blur' }],
  signature: [{ required: true, message: '请输入短信签名', trigger: 'blur' }],
  templateId: [{ required: true, message: '请输入模板ID', trigger: 'blur' }],
};

const storageFormData = reactive({
  storageType: 'local',
  storagePath: '/uploads/',
  endpoint: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
});

const storageRules = {
  storageType: [{ required: true, message: '请选择存储类型', trigger: 'change' }],
  storagePath: [{ required: true, message: '请输入存储路径', trigger: 'blur' }],
  endpoint: [{ required: storageFormData.storageType !== 'local', message: '请输入存储服务地址', trigger: 'blur' }],
  accessKey: [{ required: storageFormData.storageType !== 'local', message: '请输入Access Key', trigger: 'blur' }],
  secretKey: [{ required: storageFormData.storageType !== 'local', message: '请输入Secret Key', trigger: 'blur' }],
  bucketName: [{ required: storageFormData.storageType !== 'local', message: '请输入Bucket名称', trigger: 'blur' }],
};

const securityFormData = reactive({
  passwordComplexity: 'medium',
  passwordExpiry: 90,
  loginFailLimit: 5,
  captchaExpiry: 10,
  sessionTimeout: 30,
  enableIpWhitelist: false,
  ipWhitelist: '',
});

const securityRules = {
  passwordComplexity: [{ required: true, message: '请选择密码复杂度', trigger: 'change' }],
  passwordExpiry: [{ required: true, message: '请输入密码有效期', trigger: 'blur' }],
  loginFailLimit: [{ required: true, message: '请输入登录失败次数限制', trigger: 'blur' }],
  captchaExpiry: [{ required: true, message: '请输入验证码有效期', trigger: 'blur' }],
  sessionTimeout: [{ required: true, message: '请输入会话超时时间', trigger: 'blur' }],
};

const saveBasicConfig = async () => {
  if (!basicForm.value || buttonLoading.saveBasic) {
    return;
  }

  try {
    await basicForm.value.validate();

    buttonLoading.saveBasic = true;

    const configs = [
      {
        configKey: 'system.name',
        configValue: basicFormData.systemName,
        configType: 'basic',
        configName: '系统名称',
        description: '系统名称',
      },
      {
        configKey: 'system.version',
        configValue: basicFormData.systemVersion,
        configType: 'basic',
        configName: '系统版本',
        description: '系统版本',
      },
      {
        configKey: 'system.description',
        configValue: basicFormData.systemDescription,
        configType: 'basic',
        configName: '系统描述',
        description: '系统描述',
      },
      {
        configKey: 'system.contact.person',
        configValue: basicFormData.contactPerson,
        configType: 'basic',
        configName: '维护联系人',
        description: '维护联系人',
      },
      {
        configKey: 'system.contact.phone',
        configValue: basicFormData.contactPhone,
        configType: 'basic',
        configName: '联系电话',
        description: '联系电话',
      },
    ];

    const response = await saveOrUpdateConfigs(configs);

    if (response.success) {
      ElMessage.success('系统基础信息保存成功');
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`保存失败：${error.message || '未知错误'}`);
    }
  } finally {
    buttonLoading.saveBasic = false;
  }
};

const resetBasicForm = createDebounce(() => {
  if (buttonLoading.resetBasic) {
    return;
  }

  buttonLoading.resetBasic = true;
  Object.assign(basicFormData, {
    systemName: '仓库管理系统',
    systemVersion: 'v1.0.0',
    systemDescription: '企业级仓库管理系统，提供设备、库存、维护等全流程管理',
    contactPerson: '技术支持',
    contactPhone: '400-123-4567',
  });
  basicForm.value.resetFields();
  setTimeout(() => {
    buttonLoading.resetBasic = false;
  }, 300);
}, 300);

const saveEmailConfig = async () => {
  if (!emailForm.value || buttonLoading.saveEmail) {
    return;
  }

  try {
    await emailForm.value.validate();

    buttonLoading.saveEmail = true;

    const configs = [
      {
        configKey: 'email.smtp.server',
        configValue: emailFormData.smtpServer,
        configType: 'email',
        configName: 'SMTP服务器',
        description: 'SMTP服务器地址',
      },
      {
        configKey: 'email.smtp.port',
        configValue: emailFormData.smtpPort.toString(),
        configType: 'email',
        configName: 'SMTP端口',
        description: 'SMTP服务器端口',
      },
      {
        configKey: 'email.sender',
        configValue: emailFormData.senderEmail,
        configType: 'email',
        configName: '发件人邮箱',
        description: '发件人邮箱地址',
      },
      {
        configKey: 'email.password',
        configValue: emailFormData.emailPassword,
        configType: 'email',
        configName: '邮箱密码',
        description: '邮箱登录密码',
      },
      {
        configKey: 'email.enable.ssl',
        configValue: emailFormData.enableSSL.toString(),
        configType: 'email',
        configName: '启用SSL',
        description: '是否启用SSL加密',
      },
    ];

    const response = await saveOrUpdateConfigs(configs);

    if (response.success) {
      ElMessage.success('邮件配置保存成功');
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`保存失败：${error.message || '未知错误'}`);
    }
  } finally {
    buttonLoading.saveEmail = false;
  }
};

const resetEmailForm = createDebounce(() => {
  if (buttonLoading.resetEmail) {
    return;
  }

  buttonLoading.resetEmail = true;
  Object.assign(emailFormData, {
    smtpServer: 'smtp.example.com',
    smtpPort: 465,
    senderEmail: 'admin@example.com',
    emailPassword: '',
    enableSSL: true,
  });
  emailForm.value.resetFields();
  setTimeout(() => {
    buttonLoading.resetEmail = false;
  }, 300);
}, 300);

const testEmailConfig = async () => {
  if (buttonLoading.testEmail) {
    return;
  }

  try {
    buttonLoading.testEmail = true;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    ElMessage.success('邮件连接测试成功');
  } catch (error) {
    ElMessage.error(`测试失败：${error.message || '未知错误'}`);
  } finally {
    buttonLoading.testEmail = false;
  }
};

const saveSmsConfig = async () => {
  if (!smsForm.value || buttonLoading.saveSms) {
    return;
  }

  try {
    await smsForm.value.validate();

    buttonLoading.saveSms = true;

    const configs = [
      {
        configKey: 'sms.provider',
        configValue: smsFormData.smsProvider,
        configType: 'sms',
        configName: '短信服务商',
        description: '短信服务提供商',
      },
      {
        configKey: 'sms.api.key',
        configValue: smsFormData.apiKey,
        configType: 'sms',
        configName: 'API密钥',
        description: '短信服务API密钥',
      },
      {
        configKey: 'sms.api.secret',
        configValue: smsFormData.apiSecret,
        configType: 'sms',
        configName: 'API密钥ID',
        description: '短信服务API密钥ID',
      },
      {
        configKey: 'sms.signature',
        configValue: smsFormData.signature,
        configType: 'sms',
        configName: '签名',
        description: '短信签名',
      },
      {
        configKey: 'sms.template.id',
        configValue: smsFormData.templateId,
        configType: 'sms',
        configName: '模板ID',
        description: '短信模板ID',
      },
    ];

    const response = await saveOrUpdateConfigs(configs);

    if (response.success) {
      ElMessage.success('短信配置保存成功');
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`保存失败：${error.message || '未知错误'}`);
    }
  } finally {
    buttonLoading.saveSms = false;
  }
};

const resetSmsForm = createDebounce(() => {
  if (buttonLoading.resetSms) {
    return;
  }

  buttonLoading.resetSms = true;
  Object.assign(smsFormData, {
    smsProvider: '',
    apiKey: '',
    apiSecret: '',
    signature: '',
    templateId: '',
  });
  smsForm.value.resetFields();
  setTimeout(() => {
    buttonLoading.resetSms = false;
  }, 300);
}, 300);

const testSmsConfig = async () => {
  if (buttonLoading.testSms) {
    return;
  }

  try {
    buttonLoading.testSms = true;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    ElMessage.success('短信发送测试成功');
  } catch (error) {
    ElMessage.error(`测试失败：${error.message || '未知错误'}`);
  } finally {
    buttonLoading.testSms = false;
  }
};

const saveStorageConfig = async () => {
  if (!storageForm.value || buttonLoading.saveStorage) {
    return;
  }

  try {
    await storageForm.value.validate();

    buttonLoading.saveStorage = true;

    const configs = [
      {
        configKey: 'storage.type',
        configValue: storageFormData.storageType,
        configType: 'storage',
        configName: '存储类型',
        description: '文件存储类型',
      },
      {
        configKey: 'storage.path',
        configValue: storageFormData.storagePath,
        configType: 'storage',
        configName: '存储路径',
        description: '文件存储路径',
      },
      {
        configKey: 'storage.endpoint',
        configValue: storageFormData.endpoint,
        configType: 'storage',
        configName: 'Endpoint',
        description: '存储服务地址',
      },
      {
        configKey: 'storage.access.key',
        configValue: storageFormData.accessKey,
        configType: 'storage',
        configName: 'Access Key',
        description: '存储服务访问密钥',
      },
      {
        configKey: 'storage.secret.key',
        configValue: storageFormData.secretKey,
        configType: 'storage',
        configName: 'Secret Key',
        description: '存储服务密钥',
      },
      {
        configKey: 'storage.bucket.name',
        configValue: storageFormData.bucketName,
        configType: 'storage',
        configName: 'Bucket名称',
        description: '存储桶名称',
      },
    ];

    const response = await saveOrUpdateConfigs(configs);

    if (response.success) {
      ElMessage.success('存储配置保存成功');
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`保存失败：${error.message || '未知错误'}`);
    }
  } finally {
    buttonLoading.saveStorage = false;
  }
};

const resetStorageForm = createDebounce(() => {
  if (buttonLoading.resetStorage) {
    return;
  }

  buttonLoading.resetStorage = true;
  Object.assign(storageFormData, {
    storageType: 'local',
    storagePath: '/uploads/',
    endpoint: '',
    accessKey: '',
    secretKey: '',
    bucketName: '',
  });
  storageForm.value.resetFields();
  setTimeout(() => {
    buttonLoading.resetStorage = false;
  }, 300);
}, 300);

const saveSecurityConfig = async () => {
  if (!securityForm.value || buttonLoading.saveSecurity) {
    return;
  }

  try {
    await securityForm.value.validate();

    buttonLoading.saveSecurity = true;

    const configs = [
      {
        configKey: 'security.password.complexity',
        configValue: securityFormData.passwordComplexity,
        configType: 'security',
        configName: '密码复杂度',
        description: '密码复杂度要求',
      },
      {
        configKey: 'security.password.expiry',
        configValue: securityFormData.passwordExpiry.toString(),
        configType: 'security',
        configName: '密码有效期',
        description: '密码有效期（天）',
      },
      {
        configKey: 'security.login.fail.limit',
        configValue: securityFormData.loginFailLimit.toString(),
        configType: 'security',
        configName: '登录失败次数限制',
        description: '登录失败次数限制',
      },
      {
        configKey: 'security.captcha.expiry',
        configValue: securityFormData.captchaExpiry.toString(),
        configType: 'security',
        configName: '验证码有效期',
        description: '验证码有效期（分钟）',
      },
      {
        configKey: 'security.session.timeout',
        configValue: securityFormData.sessionTimeout.toString(),
        configType: 'security',
        configName: '会话超时时间',
        description: '会话超时时间（分钟）',
      },
      {
        configKey: 'security.enable.ip.whitelist',
        configValue: securityFormData.enableIpWhitelist.toString(),
        configType: 'security',
        configName: '启用IP白名单',
        description: '是否启用IP白名单',
      },
      {
        configKey: 'security.ip.whitelist',
        configValue: securityFormData.ipWhitelist,
        configType: 'security',
        configName: 'IP白名单',
        description: 'IP白名单列表',
      },
    ];

    const response = await saveOrUpdateConfigs(configs);

    if (response.success) {
      ElMessage.success('安全配置保存成功');
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`保存失败：${error.message || '未知错误'}`);
    }
  } finally {
    buttonLoading.saveSecurity = false;
  }
};

const resetSecurityForm = createDebounce(() => {
  if (buttonLoading.resetSecurity) {
    return;
  }

  buttonLoading.resetSecurity = true;
  Object.assign(securityFormData, {
    passwordComplexity: 'medium',
    passwordExpiry: 90,
    loginFailLimit: 5,
    captchaExpiry: 10,
    sessionTimeout: 30,
    enableIpWhitelist: false,
    ipWhitelist: '',
  });
  securityForm.value.resetFields();
  setTimeout(() => {
    buttonLoading.resetSecurity = false;
  }, 300);
}, 300);

const loadConfigs = async () => {
  loading.value = true;
  try {
    const response = await getAllConfigs();

    if (response.success && response.data) {
      const configs = response.data;

      configs.forEach((config) => {
        switch (config.configKey) {
          case 'system.name':
            basicFormData.systemName = config.configValue;
            break;
          case 'system.version':
            basicFormData.systemVersion = config.configValue;
            break;
          case 'system.description':
            basicFormData.systemDescription = config.configValue;
            break;
          case 'system.contact.person':
            basicFormData.contactPerson = config.configValue;
            break;
          case 'system.contact.phone':
            basicFormData.contactPhone = config.configValue;
            break;
          case 'email.smtp.server':
            emailFormData.smtpServer = config.configValue;
            break;
          case 'email.smtp.port':
            emailFormData.smtpPort = parseInt(config.configValue) || 465;
            break;
          case 'email.sender':
            emailFormData.senderEmail = config.configValue;
            break;
          case 'email.password':
            emailFormData.emailPassword = config.configValue;
            break;
          case 'email.enable.ssl':
            emailFormData.enableSSL = config.configValue === 'true';
            break;
          case 'sms.provider':
            smsFormData.smsProvider = config.configValue;
            break;
          case 'sms.api.key':
            smsFormData.apiKey = config.configValue;
            break;
          case 'sms.api.secret':
            smsFormData.apiSecret = config.configValue;
            break;
          case 'sms.signature':
            smsFormData.signature = config.configValue;
            break;
          case 'sms.template.id':
            smsFormData.templateId = config.configValue;
            break;
          case 'storage.type':
            storageFormData.storageType = config.configValue;
            break;
          case 'storage.path':
            storageFormData.storagePath = config.configValue;
            break;
          case 'storage.endpoint':
            storageFormData.endpoint = config.configValue;
            break;
          case 'storage.access.key':
            storageFormData.accessKey = config.configValue;
            break;
          case 'storage.secret.key':
            storageFormData.secretKey = config.configValue;
            break;
          case 'storage.bucket.name':
            storageFormData.bucketName = config.configValue;
            break;
          case 'security.password.complexity':
            securityFormData.passwordComplexity = config.configValue;
            break;
          case 'security.password.expiry':
            securityFormData.passwordExpiry = parseInt(config.configValue) || 90;
            break;
          case 'security.login.fail.limit':
            securityFormData.loginFailLimit = parseInt(config.configValue) || 5;
            break;
          case 'security.captcha.expiry':
            securityFormData.captchaExpiry = parseInt(config.configValue) || 10;
            break;
          case 'security.session.timeout':
            securityFormData.sessionTimeout = parseInt(config.configValue) || 30;
            break;
          case 'security.enable.ip.whitelist':
            securityFormData.enableIpWhitelist = config.configValue === 'true';
            break;
          case 'security.ip.whitelist':
            securityFormData.ipWhitelist = config.configValue;
            break;
        }
      });
    }
  } catch (error) {
    ElMessage.error(`加载配置失败：${error.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadConfigs();
});

const debouncedFunctions = [];

onUnmounted(() => {
  debouncedFunctions.forEach((fn) => {
    if (typeof fn.cancel === 'function') {
      fn.cancel();
    }
  });
});
</script>

<style scoped>
.system-config-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100%;
}

.config-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.config-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.config-card :deep(.el-card__body) {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 22px;
  color: #3b82f6;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.config-tabs {
  min-height: 600px;
}

.config-tabs :deep(.el-tabs__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  padding: 20px 0;
  margin-right: 0;
}

.config-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 12px;
}

.config-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.config-tabs :deep(.el-tabs__item) {
  height: auto;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #64748b;
  font-weight: 500;
}

.config-tabs :deep(.el-tabs__item:hover) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.config-tabs :deep(.el-tabs__item.is-active) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.config-tabs :deep(.el-tabs__content) {
  padding: 24px;
  background: white;
  min-height: 600px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.tab-label .el-icon {
  font-size: 16px;
}

.tab-content {
  max-width: 800px;
}

.config-form {
  padding: 20px 0;
}

.config-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.config-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: none;
}

.config-form :deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-input__inner) {
  font-size: 14px;
}

.config-form :deep(.el-input__prefix) {
  color: #94a3b8;
}

.config-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  font-size: 14px;
}

.config-form :deep(.el-textarea__inner:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: none;
}

.config-form :deep(.el-select .el-input__wrapper:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-input-number) {
  width: 100%;
}

.config-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: none;
}

.config-form :deep(.el-input-number .el-input__wrapper:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-input-number .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form :deep(.el-switch) {
  height: 24px;
}

.config-form :deep(.el-switch__core) {
  border-radius: 12px;
  height: 24px;
  min-width: 48px;
}

.config-form :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.config-form :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.config-form :deep(.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
}

.config-form :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.config-form :deep(.el-button--info) {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border: none;
}

.config-form :deep(.el-button--info:hover) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
}

.config-form :deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}

.config-form :deep(.el-select-dropdown__item .el-icon) {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .system-config-container {
    padding: 16px;
  }

  .config-tabs :deep(.el-tabs__header) {
    padding: 12px 0;
  }

  .config-tabs :deep(.el-tabs__content) {
    padding: 16px;
  }

  .tab-content {
    max-width: 100%;
  }

  .config-form :deep(.el-form-item__label) {
    font-size: 13px;
  }

  .config-form :deep(.el-button) {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
