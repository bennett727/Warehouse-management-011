# 前后端权限控制一致性指南

## 1. 概述

本文档描述了仓库管理系统(WMS)前后端权限控制的一致性实现方案，确保前端UI展示与后端实际权限严格匹配。

## 2. 角色定义

### 2.1 后端角色定义 (Spring Security)

后端使用 Spring Security 的 `hasRole()` 方法进行权限控制，角色名称使用**大写**：

```java
// UserRole.java - 枚举定义
public enum UserRole {
    ADMIN(0, "管理员"),
    OPERATOR(1, "操作员"),
    TECHNICIAN(2, "技术员"),
    VIEWER(3, "查看者");
}

// UserDetailsServiceImpl.java - 权限设置
SimpleGrantedAuthority("ROLE_" + role.getRoleCode().toUpperCase(Locale.ROOT))
// 结果: ROLE_ADMIN, ROLE_OPERATOR, ROLE_TECHNICIAN, ROLE_VIEWER
```

### 2.2 前端角色定义

前端使用小写的角色代码：

```javascript
// route-permissions.js
export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer',
};
```

### 2.3 角色映射关系

| 后端权限 | 前端角色 | 说明 |
|----------|----------|------|
| `ROLE_ADMIN` | `admin` | 管理员，拥有所有权限 |
| `ROLE_OPERATOR` | `operator` | 操作员，可操作业务数据 |
| `ROLE_TECHNICIAN` | `technician` | 技术员，负责维修安装 |
| `ROLE_VIEWER` | `viewer` | 查看者，只读权限 |

## 3. 权限检查机制

### 3.1 后端权限检查

```java
// 使用 Spring Security 注解
@PreAuthorize("hasRole('ADMIN')")  // 仅管理员
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")  // 管理员或操作员
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")  // 等效写法
```

**重要**：`hasRole()` 会自动添加 `ROLE_` 前缀，所以：
- `hasRole('ADMIN')` 匹配 `ROLE_ADMIN`
- `hasRole('admin')` 不匹配任何权限（必须使用大写）

### 3.2 前端权限检查

```javascript
// 使用权限工具函数
import { hasRole, hasAnyRole, canPerformAction, ROLES } from '@/utils/permission.js';

// 检查单个角色
hasRole(userRoles, 'ADMIN');  // true/false

// 检查多个角色（任意一个）
hasAnyRole(userRoles, ['ADMIN', 'OPERATOR']);

// 综合检查
const canEdit = canPerformAction(userInfo, {
  requiredRoles: ['ADMIN', 'OPERATOR'],
  requiredPermission: 'device:update'
});
```

### 3.3 权限指令

```vue
<!-- 仅管理员可见 -->
<el-button v-permission="'ADMIN'">删除</el-button>

<!-- 管理员或操作员可见 -->
<el-button v-permission="{ roles: ['ADMIN', 'OPERATOR'] }">编辑</el-button>

<!-- 需要特定权限 -->
<el-button v-permission="{ permission: 'device:delete' }">删除</el-button>

<!-- 角色和权限同时满足 -->
<el-button v-permission="{ 
  role: 'OPERATOR', 
  permission: 'device:update',
  logic: 'and' 
}">修改</el-button>

<!-- 简化版角色指令 -->
<el-button v-role="'ADMIN'">管理员专用</el-button>
<el-button v-role="['ADMIN', 'OPERATOR']">管理操作</el-button>
```

## 4. 前后端权限映射

### 4.1 页面访问权限

| 页面 | 后端权限 | 前端路由roles | 说明 |
|------|----------|---------------|------|
| 仪表盘 | `ADMIN/OPERATOR/TECHNICIAN/VIEWER` | `['ADMIN', 'OPERATOR', 'TECHNICIAN', 'VIEWER']` | 所有角色 |
| 设备列表 | `ADMIN/OPERATOR/TECHNICIAN/VIEWER` | `['ADMIN', 'OPERATOR', 'TECHNICIAN', 'VIEWER']` | 所有角色 |
| 入库管理 | `ADMIN/OPERATOR` | `['ADMIN', 'OPERATOR']` | 仅管理员和操作员 |
| 出库管理 | `ADMIN/OPERATOR` | `['ADMIN', 'OPERATOR']` | 仅管理员和操作员 |
| 用户管理 | `ADMIN` | `['ADMIN']` | 仅管理员 |
| 角色管理 | `ADMIN` | `['ADMIN']` | 仅管理员 |

### 4.2 操作权限映射

| 操作 | 后端注解 | 前端检查 |
|------|----------|----------|
| 创建设备 | `@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")` | `v-permission="{ roles: ['ADMIN', 'OPERATOR'] }"` |
| 删除设备 | `@PreAuthorize("hasRole('ADMIN')")` | `v-permission="'ADMIN'"` |
| 审核入库 | `@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")` | `v-permission="{ roles: ['ADMIN', 'OPERATOR'] }"` |
| 系统配置 | `@PreAuthorize("hasRole('ADMIN')")` | `v-permission="'ADMIN'"` |

## 5. 常见问题与解决方案

### 5.1 问题1：前端按钮显示但后端返回403

**原因**：前端权限检查与后端不一致

**解决方案**：
1. 检查前端 `v-permission` 指令的角色名称是否大写
2. 确保前后端使用相同的角色代码
3. 使用 `canPerformAction` 函数进行统一检查

```javascript
// 错误示例
v-if="userRole === 'admin'"  // 小写，可能不一致

// 正确示例
import { hasRole } from '@/utils/permission.js';
v-if="hasRole(userRoles, 'ADMIN')"  // 使用统一工具函数
```

### 5.2 问题2：角色名称大小写问题

**原因**：后端使用大写，前端使用小写

**解决方案**：
- 后端 `hasRole('ADMIN')` 匹配 `ROLE_ADMIN`
- 前端使用 `normalizeRoles()` 函数统一转换
- 权限工具函数会自动处理大小写转换

### 5.3 问题3：权限缓存导致的不一致

**原因**：用户权限变更后前端未刷新

**解决方案**：
1. 用户登录时重新获取权限
2. 权限变更后刷新页面或重新获取用户信息
3. 使用 Pinia store 管理权限状态

## 6. 最佳实践

### 6.1 前端开发规范

1. **使用权限指令**：优先使用 `v-permission` 和 `v-role` 指令
2. **统一工具函数**：使用 `permission.js` 中的工具函数
3. **避免硬编码**：不要在模板中直接比较角色字符串
4. **权限注释**：在代码中注释需要的权限

```vue
<!-- 需要管理员权限：删除用户 -->
<el-button 
  v-permission="'ADMIN'" 
  type="danger" 
  @click="handleDelete"
>
  删除用户
</el-button>
```

### 6.2 后端开发规范

1. **统一使用大写**：`hasRole('ADMIN')` 而不是 `hasRole('admin')`
2. **使用 hasAnyRole**：多个角色时使用 `hasAnyRole('ADMIN', 'OPERATOR')`
3. **方法级权限**：在 Controller 方法上添加 `@PreAuthorize`
4. **权限注释**：注释每个接口需要的权限

```java
/**
 * 删除设备
 * 需要权限：ADMIN
 */
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/api/devices/{id}")
public ApiResponse<Void> deleteDevice(@PathVariable Long id) {
    // 实现
}
```

### 6.3 前后端联调检查清单

- [ ] 前端按钮 `v-permission` 与后端 `@PreAuthorize` 一致
- [ ] 角色名称大小写正确（后端大写，前端小写）
- [ ] 权限变更后前端状态更新
- [ ] 无权限时前端正确隐藏按钮
- [ ] 无权限时后端返回403状态码

## 7. 调试技巧

### 7.1 前端调试

```javascript
// 在控制台检查权限
import { hasRole, hasPermission } from '@/utils/permission.js';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
console.log('用户角色:', userStore.userInfo?.roles);
console.log('是否管理员:', hasRole(userStore.userInfo?.roles, 'ADMIN'));
```

### 7.2 后端调试

```java
// 在控制器中打印当前用户权限
@GetMapping("/api/debug/permissions")
@PreAuthorize("hasRole('ADMIN')")
public ApiResponse<Map<String, Object>> debugPermissions() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Map<String, Object> debug = new HashMap<>();
    debug.put("authorities", auth.getAuthorities());
    debug.put("principal", auth.getPrincipal());
    debug.put("isAdmin", SecurityUtils.isAdmin());
    return ApiResponse.success(debug);
}
```

## 8. 权限测试用例

### 8.1 前端测试

```javascript
// permission.test.js
describe('权限工具函数', () => {
  test('hasRole 应该正确检查角色', () => {
    expect(hasRole(['admin', 'operator'], 'ADMIN')).toBe(true);
    expect(hasRole(['operator'], 'ADMIN')).toBe(false);
  });

  test('hasAnyRole 应该正确检查多个角色', () => {
    expect(hasAnyRole(['operator'], ['ADMIN', 'OPERATOR'])).toBe(true);
    expect(hasAnyRole(['viewer'], ['ADMIN', 'OPERATOR'])).toBe(false);
  });
});
```

### 8.2 后端测试

```java
// PermissionTest.java
@SpringBootTest
@AutoConfigureMockMvc
public class PermissionTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/system/users"))
               .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "VIEWER")
    void viewerCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/system/users"))
               .andExpect(status().isForbidden());
    }
}
```

## 9. 总结

通过本文档的规范，我们实现了：

1. **统一的角色定义**：前后端使用相同的角色代码（大小写转换通过工具处理）
2. **一致的权限检查**：前端 `v-permission` 与后端 `@PreAuthorize` 逻辑一致
3. **细粒度控制**：支持角色和权限的双重检查
4. **易于维护**：权限逻辑集中在 `permission.js` 和 `route-permissions.js`

遵循这些规范，可以确保前端UI展示与后端实际权限严格匹配，避免权限控制不一致的问题。
