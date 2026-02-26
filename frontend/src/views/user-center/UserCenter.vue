<template>
  <PageLayout
    title="个人中心"
    description="管理您的个人信息、安全设置和系统偏好"
    data-cy="user-center-page"
    :no-padding="true"
  >
    <div class="user-center-container">
      <el-tabs data-cy="user-center-tabs" v-model="activeTab" class="user-center-tabs">
        <!-- 个人信息 -->
        <el-tab-pane data-cy="user-center-info-tab" name="info">
          <template #label>
            <div class="tab-label">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </div>
          </template>
          <div class="info-section">
            <div class="avatar-upload-section">
              <div class="avatar-wrapper">
                <div class="avatar-container">
                  <el-avatar data-cy="user-center-avatar" :size="120" :src="userInfo.avatar" class="user-avatar">
                    {{ userInfo.username?.charAt(0).toUpperCase() || 'U' }}
                  </el-avatar>
                  <div class="avatar-overlay">
                    <el-icon><Camera /></el-icon>
                  </div>
                </div>
              </div>
              <div class="upload-buttons">
                <el-upload
                  data-cy="user-center-avatar-upload"
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="handleAvatarUpload"
                >
                  <el-button data-cy="user-center-upload-avatar-btn" type="primary" :icon="Upload">上传头像</el-button>
                </el-upload>
                <div class="upload-tip">支持JPG、PNG格式，文件大小不超过2MB</div>
                <el-button data-cy="user-center-remove-avatar-btn" type="default" :icon="Delete" @click="removeAvatar">移除头像</el-button>
              </div>
            </div>

            <el-card class="info-card" shadow="never">
              <el-form data-cy="user-center-info-form" :model="userInfo" label-width="120px" class="info-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="用户名" prop="username">
                      <el-input data-cy="user-center-username-input" v-model="userInfo.username" disabled placeholder="请输入用户名">
                        <template #prefix>
                          <el-icon><User /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="真实姓名" prop="realName">
                      <el-input data-cy="user-center-realname-input" v-model="userInfo.realName" placeholder="请输入姓名">
                        <template #prefix>
                          <el-icon><UserFilled /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="性别" prop="gender">
                      <el-select
                        data-cy="user-center-gender-select"
                        v-model="userInfo.gender"
                        placeholder="请选择性别"
                        style="width: 100%"
                      >
                        <el-option label="男" value="male">
                          <div class="option-item">
                            <el-icon><Male /></el-icon>
                            <span>男</span>
                          </div>
                        </el-option>
                        <el-option label="女" value="female">
                          <div class="option-item">
                            <el-icon><Female /></el-icon>
                            <span>女</span>
                          </div>
                        </el-option>
                        <el-option label="保密" value="secret">
                          <div class="option-item">
                            <el-icon><Lock /></el-icon>
                            <span>保密</span>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input data-cy="user-center-email-input" v-model="userInfo.email" type="email" placeholder="请输入邮箱">
                        <template #prefix>
                          <el-icon><Message /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="手机号" prop="phone">
                      <el-input data-cy="user-center-phone-input" v-model="userInfo.phone" placeholder="请输入手机号码">
                        <template #prefix>
                          <el-icon><Phone /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="部门" prop="department">
                      <el-input data-cy="user-center-department-input" v-model="userInfo.department" placeholder="请输入部门">
                        <template #prefix>
                          <el-icon><OfficeBuilding /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="职位" prop="position">
                      <el-input data-cy="user-center-position-input" v-model="userInfo.position" placeholder="请输入职位">
                        <template #prefix>
                          <el-icon><Briefcase /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="个性签名" prop="signature">
                      <el-input
                        data-cy="user-center-signature-input"
                        v-model="userInfo.signature"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入个性签名"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item class="form-actions">
                  <el-button data-cy="user-center-save-info-btn" type="primary" :icon="Check" @click="saveUserInfo">保存信息</el-button>
                  <el-button data-cy="user-center-reset-info-btn" :icon="RefreshLeft" @click="resetInfoForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane data-cy="user-center-password-tab" name="password">
          <template #label>
            <div class="tab-label">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </div>
          </template>
          <el-card class="password-card" shadow="never">
            <el-alert title="密码安全提示" type="info" :closable="false" show-icon style="margin-bottom: 24px">
              <template #default>
                <div class="password-tips">
                  <p>• 密码长度为8-30个字符</p>
                  <p>• 必须包含大小写字母、数字和特殊字符</p>
                  <p>• 建议定期更换密码以保证账户安全</p>
                </div>
              </template>
            </el-alert>
            <el-form
              data-cy="user-center-password-form"
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="120px"
              class="password-form"
            >
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input
                  data-cy="user-center-old-password-input"
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  data-cy="user-center-new-password-input"
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Unlock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  data-cy="user-center-confirm-password-input"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button data-cy="user-center-change-password-btn" type="primary" :icon="Check" @click="changePassword">修改密码</el-button>
                <el-button data-cy="user-center-reset-password-btn" :icon="RefreshLeft" @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 登录日志 -->
        <el-tab-pane data-cy="user-center-logs-tab" name="logs">
          <template #label>
            <div class="tab-label">
              <el-icon><Clock /></el-icon>
              <span>登录日志</span>
            </div>
          </template>
          <div class="logs-section">
            <TableSkeleton v-if="loginLogsLoading" :row-count="10" :column-count="6" :height="400" />

            <el-card v-else shadow="never">
              <el-table data-cy="user-center-login-logs-table" :data="loginLogs" style="width: 100%" class="logs-table">
                <el-table-column prop="loginTime" label="登录时间" width="180">
                  <template #default="scope">
                    <div class="log-time">
                      <el-icon><Clock /></el-icon>
                      <span>{{ scope.row.loginTime }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="loginIp" label="登录IP" width="150">
                  <template #default="scope">
                    <div class="log-ip">
                      <el-icon><Location /></el-icon>
                      <span>{{ scope.row.loginIp }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="loginLocation" label="登录地点" width="200" />
                <el-table-column prop="browser" label="浏览器" width="200" />
                <el-table-column prop="os" label="操作系统" width="150" />
                <el-table-column prop="loginStatus" label="登录状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.loginStatus === 'success' ? 'success' : 'danger'">
                      <el-icon v-if="scope.row.loginStatus === 'success'"><CircleCheck /></el-icon>
                      <el-icon v-else><CircleClose /></el-icon>
                      {{ scope.row.loginStatus === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-container">
                <el-pagination
                  data-cy="user-center-logs-pagination"
                  v-model:current-page="logsPage.currentPage"
                  v-model:page-size="logsPage.pageSize"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="loginLogsTotal"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 密码保护问题 -->
        <el-tab-pane data-cy="user-center-security-tab" name="security">
          <template #label>
            <div class="tab-label">
              <el-icon><Lock /></el-icon>
              <span>密码保护</span>
            </div>
          </template>
          <el-card class="security-card" shadow="never">
            <el-alert
              title="设置密码保护问题后，忘记密码时可以通过回答问题找回密码"
              type="warning"
              :closable="false"
              show-icon
              style="margin-bottom: 24px"
            />
            <el-form
              data-cy="user-center-security-form"
              ref="securityFormRef"
              :model="securityForm"
              :rules="securityRules"
              label-width="150px"
              class="security-form"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  data-cy="user-center-security-password-input"
                  v-model="securityForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="密保问题1" prop="question1">
                <el-select
                  data-cy="user-center-question1-select"
                  v-model="securityForm.question1"
                  placeholder="请选择密保问题1"
                  style="width: 100%"
                >
                  <el-option label="您的小学名称是什么？" value="question1" />
                  <el-option label="您的父亲姓名是什么？" value="question2" />
                  <el-option label="您的母亲姓名是什么？" value="question3" />
                  <el-option label="您的出生城市是哪里？" value="question4" />
                  <el-option label="您的第一只宠物名字是什么？" value="question5" />
                </el-select>
              </el-form-item>
              <el-form-item label="密保答案1" prop="answer1">
                <el-input
                  data-cy="user-center-answer1-input"
                  v-model="securityForm.answer1"
                  type="password"
                  placeholder="请输入密保答案1"
                  show-password
                />
              </el-form-item>
              <el-form-item label="密保问题2" prop="question2">
                <el-select
                  data-cy="user-center-question2-select"
                  v-model="securityForm.question2"
                  placeholder="请选择密保问题2"
                  style="width: 100%"
                >
                  <el-option label="您的小学名称是什么？" value="question1" />
                  <el-option label="您的父亲姓名是什么？" value="question2" />
                  <el-option label="您的母亲姓名是什么？" value="question3" />
                  <el-option label="您的出生城市是哪里？" value="question4" />
                  <el-option label="您的第一只宠物名字是什么？" value="question5" />
                </el-select>
              </el-form-item>
              <el-form-item label="密保答案2" prop="answer2">
                <el-input
                  data-cy="user-center-answer2-input"
                  v-model="securityForm.answer2"
                  type="password"
                  placeholder="请输入密保答案2"
                  show-password
                />
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button data-cy="user-center-save-security-btn" type="primary" :icon="Check" @click="saveSecurityQuestions"
                  >保存密保问题</el-button
                >
                <el-button data-cy="user-center-reset-security-btn" :icon="RefreshLeft" @click="resetSecurityForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane data-cy="user-center-operation-tab" name="operation">
          <template #label>
            <div class="tab-label">
              <el-icon><Document /></el-icon>
              <span>操作日志</span>
            </div>
          </template>
          <div class="operation-logs-section">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>操作日志查询</span>
                </div>
              </template>
              <el-form data-cy="user-center-operation-search-form" :inline="true" class="operation-logs-search">
                <el-form-item label="操作类型">
                  <el-select
                    data-cy="user-center-operation-type-select"
                    v-model="operationLogsSearch.operationType"
                    placeholder="请选择操作类型"
                    clearable
                    style="width: 180px"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="登录" value="login" />
                    <el-option label="修改信息" value="update_info" />
                    <el-option label="修改密码" value="change_password" />
                    <el-option label="上传头像" value="upload_avatar" />
                    <el-option label="保存设置" value="save_settings" />
                  </el-select>
                </el-form-item>
                <el-form-item data-cy="form-24" label="时间范围">
                  <el-date-picker
                    data-cy="date-picker-0"
                    v-model="operationLogsSearch.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 280px"
                  />
                </el-form-item>
                <el-form-item data-cy="form-25">
                  <el-button data-cy="btn-8" type="primary" @click="searchOperationLogs" :icon="Search">查询</el-button>
                  <el-button data-cy="btn-9" :icon="RefreshLeft" @click="resetOperationLogsSearch">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <TableSkeleton v-if="operationLogsLoading" :row-count="10" :column-count="6" :height="400" />

            <el-card v-else shadow="never" class="logs-table-card">
              <el-table data-cy="table-7" :data="operationLogs" style="width: 100%">
                <el-table-column data-cy="table-8" prop="operationTime" label="操作时间" width="180">
                  <template #default="scope">
                    <div class="log-time">
                      <el-icon><Clock /></el-icon>
                      <span>{{ scope.row.operationTime }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column data-cy="table-9" prop="operationType" label="操作类型" width="120">
                  <template #default="scope">
                    <el-tag data-cy="tag-1" :type="getOperationTypeTag(scope.row.operationType)">
                      {{ getOperationTypeText(scope.row.operationType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column data-cy="table-10" prop="operationDesc" label="操作描述" min-width="250" />
                <el-table-column data-cy="table-11" prop="ipAddress" label="IP地址" width="150">
                  <template #default="scope">
                    <div class="log-ip">
                      <el-icon><Location /></el-icon>
                      <span>{{ scope.row.ipAddress }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column data-cy="table-12" prop="device" label="设备信息" width="200" />
                <el-table-column data-cy="table-13" prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag data-cy="tag-2" :type="scope.row.status === 'success' ? 'success' : 'danger'">
                      <el-icon v-if="scope.row.status === 'success'"><CircleCheck /></el-icon>
                      <el-icon v-else><CircleClose /></el-icon>
                      {{ scope.row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-container">
                <el-pagination
                  data-cy="pagination-1"
                  v-model:current-page="operationLogsPage.currentPage"
                  v-model:page-size="operationLogsPage.pageSize"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="operationLogsTotal"
                  @size-change="handleOperationLogsSizeChange"
                  @current-change="handleOperationLogsCurrentChange"
                />
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 个人设置 -->
        <el-tab-pane data-cy="tab-pane-5" name="settings">
          <template #label>
            <div class="tab-label">
              <el-icon><Setting /></el-icon>
              <span>个人设置</span>
            </div>
          </template>
          <el-card class="settings-card" shadow="never">
            <el-form data-cy="form-26" ref="settingsForm" :model="settings" label-width="150px" class="settings-form">
              <div class="settings-group">
                <h4 class="group-title">
                  <el-icon><Setting /></el-icon>
                  基础设置
                </h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item data-cy="form-27" label="语言偏好">
                      <el-select
                        data-cy="select-4"
                        v-model="settings.language"
                        placeholder="请选择语言"
                        style="width: 100%"
                      >
                        <el-option label="中文" value="zh-CN">
                          <div class="option-item">
                            <span>🇨🇳</span>
                            <span>中文</span>
                          </div>
                        </el-option>
                        <el-option label="English" value="en-US">
                          <div class="option-item">
                            <span>🇺🇸</span>
                            <span>English</span>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item data-cy="form-28" label="主题颜色">
                      <el-color-picker data-cy="color-picker-0" v-model="settings.themeColor" show-alpha />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="settings-group">
                <h4 class="group-title">
                  <el-icon><Clock /></el-icon>
                  时间设置
                </h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item data-cy="form-29" label="日期格式">
                      <el-select
                        data-cy="select-5"
                        v-model="settings.dateFormat"
                        placeholder="请选择日期格式"
                        style="width: 100%"
                      >
                        <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                        <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                        <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item data-cy="form-30" label="时间格式">
                      <el-select
                        data-cy="select-6"
                        v-model="settings.timeFormat"
                        placeholder="请选择时间格式"
                        style="width: 100%"
                      >
                        <el-option label="HH:mm:ss" value="HH:mm:ss" />
                        <el-option label="hh:mm:ss AM/PM" value="hh:mm:ss A" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item data-cy="form-31" label="时区">
                      <el-select
                        data-cy="select-7"
                        v-model="settings.timezone"
                        placeholder="请选择时区"
                        style="width: 100%"
                      >
                        <el-option label="UTC+8 (中国标准时间)" value="Asia/Shanghai" />
                        <el-option label="UTC" value="UTC" />
                        <el-option label="UTC+9 (日本)" value="Asia/Tokyo" />
                        <el-option label="UTC-5 (美国东部)" value="America/New_York" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="settings-group">
                <h4 class="group-title">
                  <el-icon><Bell /></el-icon>
                  通知设置
                </h4>
                <el-form-item data-cy="form-32" label="通知偏好">
                  <el-checkbox-group data-cy="checkbox-0" v-model="settings.notifications">
                    <el-checkbox data-cy="checkbox-1" border>
                      <div class="checkbox-item">
                        <el-icon><Message /></el-icon>
                        <span>系统消息</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox data-cy="checkbox-2" border>
                      <div class="checkbox-item">
                        <el-icon><Message /></el-icon>
                        <span>邮件通知</span>
                      </div>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </div>

              <div class="settings-group">
                <h4 class="group-title">
                  <el-icon><HomeFilled /></el-icon>
                  其他设置
                </h4>
                <el-form-item data-cy="form-33" label="默认页面">
                  <el-select
                    data-cy="select-8"
                    v-model="settings.defaultPage"
                    placeholder="请选择默认页面"
                    style="width: 100%"
                  >
                    <el-option label="仪表盘" value="/dashboard" />
                    <el-option label="设备列表" value="/asset-management/device-list" />
                    <el-option label="库存管理" value="/inventory-management" />
                  </el-select>
                </el-form-item>
              </div>

              <el-form-item data-cy="form-34" class="form-actions">
                <el-button data-cy="btn-10" type="primary" :icon="Check" @click="saveSettings">保存设置</el-button>
                <el-button data-cy="btn-11" :icon="RefreshLeft" @click="resetSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </PageLayout>
</template>

<script setup>
import {
  Search,
  User,
  UserFilled,
  Lock,
  Unlock,
  Clock,
  Document,
  Setting,
  Bell,
  HomeFilled,
  Check,
  RefreshLeft,
  Upload,
  Delete,
  Camera,
  Phone,
  Message,
  OfficeBuilding,
  Briefcase,
  Location,
  CircleCheck,
  CircleClose,
  Male,
  Female,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import {
  changePassword as changeUserPassword,
  getUserLoginLogs,
  getUserOperationLogs,
  setUserSecurityQuestions,
  updateUser as updateUserInfo,
} from '@/api/system/user';
import PageLayout from '@/components/base/PageLayout.vue';
import TableSkeleton from '@/components/base/TableSkeleton.vue';
import { PAGINATION } from '@/constants';
import { createLogger } from '@/utils/logger';
import { handleErrorMessage } from '@/utils/responseHandler';

const logger = createLogger('UserCenter');

// 当前激活的标签页
const activeTab = ref('info');

// 用户信息
const userInfo = reactive({
  username: 'admin',
  realName: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  gender: 'male',
  department: 'IT部门',
  position: '系统管理员',
  signature: '这是一个签名',
  avatar: new URL('@/assets/images/avatar/default.svg', import.meta.url).href,
});

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 密码修改表单引用
const passwordFormRef = ref(null);

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 密码修改表单规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在6-30个字符之间', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 30, message: '密码长度在8-30个字符之间', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        if (!/[a-z]/.test(value)) {
          callback(new Error('密码必须包含至少一个小写字母'));
        } else if (!/[A-Z]/.test(value)) {
          callback(new Error('密码必须包含至少一个大写字母'));
        } else if (!/[0-9]/.test(value)) {
          callback(new Error('密码必须包含至少一个数字'));
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          callback(new Error('密码必须包含至少一个特殊字符'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

// 登录历史数据
const loginHistoryData = ref([]);
const loginLogsLoading = ref(false);
const loginLogsTotal = ref(0);

// 登录日志分页
const logsPage = reactive({
  currentPage: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
});

// 登录日志（用于表格展示）
const loginLogs = computed(() => {
  const start = (logsPage.currentPage - 1) * logsPage.pageSize;
  const end = start + logsPage.pageSize;
  return loginHistoryData.value.slice(start, end);
});

// 密码保护问题表单
const securityForm = reactive({
  currentPassword: '',
  question1: '',
  answer1: '',
  question2: '',
  answer2: '',
});

// 密码保护问题表单引用
const securityFormRef = ref(null);

// 密码保护问题表单规则
const securityRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在6-30个字符之间', trigger: 'blur' },
  ],
  question1: [{ required: true, message: '请选择密保问题1', trigger: 'change' }],
  answer1: [
    { required: true, message: '请输入密保答案1', trigger: 'blur' },
    { min: 2, max: 50, message: '密保答案长度在2-50个字符之间', trigger: 'blur' },
  ],
  question2: [
    { required: true, message: '请选择密保问题2', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value === securityForm.question1) {
          callback(new Error('两个密保问题不能相同'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  answer2: [
    { required: true, message: '请输入密保答案2', trigger: 'blur' },
    { min: 2, max: 50, message: '密保答案长度在2-50个字符之间', trigger: 'blur' },
  ],
};

// 操作日志数据
const operationLogs = ref([]);
const operationLogsLoading = ref(false);
const operationLogsTotal = ref(0);

// 操作日志搜索条件
const operationLogsSearch = reactive({
  operationType: '',
  dateRange: [],
});

// 操作日志分页
const operationLogsPage = reactive({
  currentPage: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
});

// 个人设置
const settings = reactive({
  language: 'zh-CN',
  themeColor: '#409EFF',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  timezone: 'Asia/Shanghai',
  notifications: ['系统消息'],
  defaultPage: '/dashboard',
});

// 个人设置表单引用
const settingsForm = ref(null);

// 加载登录日志
const loadLoginLogs = async () => {
  loginLogsLoading.value = true;
  try {
    const response = await getUserLoginLogs(userInfo.username, {
      page: logsPage.currentPage,
      pageSize: logsPage.pageSize,
    });
    if (response.success && response.data) {
      loginHistoryData.value = response.data.content || [];
      loginLogsTotal.value = response.data.totalElements || 0;
    }
  } catch (error) {
    logger.error('加载登录日志失败:', error);
    ElMessage.error(handleErrorMessage(error, '加载登录日志失败'));
  } finally {
    loginLogsLoading.value = false;
  }
};

// 加载操作日志
const loadOperationLogs = async () => {
  operationLogsLoading.value = true;
  try {
    const params = {
      page: operationLogsPage.currentPage,
      pageSize: operationLogsPage.pageSize,
    };

    if (operationLogsSearch.operationType) {
      params.operationType = operationLogsSearch.operationType;
    }

    if (operationLogsSearch.dateRange && operationLogsSearch.dateRange.length === 2) {
      params.startDate = operationLogsSearch.dateRange[0];
      params.endDate = operationLogsSearch.dateRange[1];
    }

    const response = await getUserOperationLogs(userInfo.username, params);
    if (response.success && response.data) {
      operationLogs.value = response.data.content || [];
      operationLogsTotal.value = response.data.totalElements || 0;
    }
  } catch (error) {
    logger.error('加载操作日志失败:', error);
    ElMessage.error(handleErrorMessage(error, '加载操作日志失败'));
  } finally {
    operationLogsLoading.value = false;
  }
};

// 处理头像上传
const handleAvatarUpload = () => {
  ElMessage.success('头像上传成功');
  return false;
};

// 移除头像
const removeAvatar = () => {
  userInfo.avatar = '';
  ElMessage.success('头像已移除');
};

// 保存用户信息
const saveUserInfo = async () => {
  try {
    await updateUserInfo(userInfo.username, userInfo);
    ElMessage.success('个人信息保存成功');
  } catch (error) {
    logger.error('保存用户信息失败:', error);
    ElMessage.error(handleErrorMessage(error, '保存用户信息失败'));
  }
};

// 重置用户信息表单
const resetInfoForm = () => {
  ElMessage.info('表单已重置');
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) {
    return;
  }

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await changeUserPassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        });
        ElMessage.success('密码修改成功，请重新登录');
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        passwordFormRef.value.resetFields();
      } catch (error) {
        logger.error('修改密码失败:', error);
        ElMessage.error(handleErrorMessage(error, '修改密码失败'));
      }
    }
  });
};

// 重置密码表单
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
  ElMessage.info('表单已重置');
};

// 保存密码保护问题
const saveSecurityQuestions = async () => {
  if (!securityFormRef.value) {
    return;
  }

  await securityFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await setUserSecurityQuestions(userInfo.username, {
          currentPassword: securityForm.currentPassword,
          question1: securityForm.question1,
          answer1: securityForm.answer1,
          question2: securityForm.question2,
          answer2: securityForm.answer2,
        });
        ElMessage.success('密码保护问题设置成功');
        resetSecurityForm();
      } catch (error) {
        logger.error('设置密码保护问题失败:', error);
        ElMessage.error(handleErrorMessage(error, '设置密码保护问题失败'));
      }
    }
  });
};

// 重置密码保护问题表单
const resetSecurityForm = () => {
  if (securityFormRef.value) {
    securityFormRef.value.resetFields();
  }
  ElMessage.info('表单已重置');
};

// 搜索操作日志
const searchOperationLogs = () => {
  operationLogsPage.currentPage = 1;
  loadOperationLogs();
};

// 重置操作日志搜索
const resetOperationLogsSearch = () => {
  operationLogsSearch.operationType = '';
  operationLogsSearch.dateRange = [];
  operationLogsPage.currentPage = 1;
  loadOperationLogs();
};

// 获取操作类型标签类型
const getOperationTypeTag = (type) => {
  const tagMap = {
    login: 'primary',
    update_info: 'success',
    change_password: 'warning',
    upload_avatar: 'info',
    save_settings: 'success',
  };
  return tagMap[type] || 'info';
};

// 获取操作类型文本
const getOperationTypeText = (type) => {
  const textMap = {
    login: '登录',
    update_info: '修改信息',
    change_password: '修改密码',
    upload_avatar: '上传头像',
    save_settings: '保存设置',
  };
  return textMap[type] || type;
};

// 处理登录日志分页大小变化
const handleSizeChange = (newSize) => {
  logsPage.pageSize = newSize;
  loadLoginLogs();
};

// 处理登录日志当前页码变化
const handleCurrentChange = (newPage) => {
  logsPage.currentPage = newPage;
  loadLoginLogs();
};

// 处理操作日志分页大小变化
const handleOperationLogsSizeChange = (newSize) => {
  operationLogsPage.pageSize = newSize;
  loadOperationLogs();
};

// 处理操作日志当前页码变化
const handleOperationLogsCurrentChange = (newPage) => {
  operationLogsPage.currentPage = newPage;
  loadOperationLogs();
};

// 保存个人设置
const saveSettings = () => {
  ElMessage.success('个人设置保存成功');
};

// 重置个人设置
const resetSettings = () => {
  settings.language = 'zh-CN';
  settings.themeColor = '#409EFF';
  settings.dateFormat = 'YYYY-MM-DD';
  settings.timeFormat = 'HH:mm:ss';
  settings.timezone = 'Asia/Shanghai';
  settings.notifications = ['系统消息'];
  settings.defaultPage = '/dashboard';
  ElMessage.info('设置已重置');
};

// 组件挂载时加载数据
onMounted(() => {
  loadLoginLogs();
  loadOperationLogs();
});
</script>

<style scoped>
.user-center-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-center-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.user-center-tabs :deep(.el-tabs__header) {
  background: white;
  border-radius: 12px 12px 0 0;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-center-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.user-center-tabs :deep(.el-tabs__item) {
  padding: 0 24px;
  height: 56px;
  line-height: 56px;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  border: none;
  transition: all 0.3s ease;
}

.user-center-tabs :deep(.el-tabs__item:hover) {
  color: #3b82f6;
}

.user-center-tabs :deep(.el-tabs__item.is-active) {
  color: #3b82f6;
  font-weight: 600;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.user-center-tabs :deep(.el-tabs__content) {
  flex: 1;
  background: transparent;
  padding: 24px 0 0 0;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-label .el-icon {
  font-size: 18px;
}

/* 个人信息样式 */
.info-section {
  max-width: 1000px;
  margin: 0 auto;
}

.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 2px solid #e2e8f0;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.user-avatar {
  width: 100%;
  height: 100%;
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-tip {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.info-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-card :deep(.el-card__body) {
  padding: 32px;
}

.info-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-form :deep(.el-input__wrapper):hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.info-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.info-form :deep(.el-select .el-input__wrapper) {
  cursor: pointer;
}

.info-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-form :deep(.el-textarea__inner):hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.info-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f9ff;
}

.form-actions .el-button {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 500;
}

/* 密码修改样式 */
.password-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.password-card :deep(.el-card__body) {
  padding: 32px;
}

.password-tips {
  line-height: 1.8;
  color: #64748b;
}

.password-tips p {
  margin: 4px 0;
}

/* 登录日志样式 */
.logs-section {
  max-width: 1200px;
  margin: 0 auto;
}

.logs-table-card {
  margin-top: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.logs-table-card :deep(.el-card__body) {
  padding: 0;
}

.logs-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.logs-table :deep(.el-table th) {
  background: transparent;
  color: #1a202c;
  font-weight: 600;
}

.logs-table :deep(.el-table__row:hover) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.log-time,
.log-ip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
}

.log-time .el-icon,
.log-ip .el-icon {
  color: #94a3b8;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 24px 0;
  border-top: 1px solid #e2e8f0;
}

/* 密码保护样式 */
.security-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.security-card :deep(.el-card__body) {
  padding: 32px;
}

/* 操作日志样式 */
.operation-logs-section {
  max-width: 1200px;
  margin: 0 auto;
}

.operation-logs-section .el-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.operation-logs-section .el-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.operation-logs-search {
  padding: 8px 0;
}

/* 个人设置样式 */
.settings-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.settings-card :deep(.el-card__body) {
  padding: 32px;
}

.settings-group {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.group-title .el-icon {
  color: #3b82f6;
  font-size: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item .el-icon {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .avatar-upload-section {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .upload-buttons {
    align-items: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .settings-group {
    padding: 16px;
  }
}
</style>
