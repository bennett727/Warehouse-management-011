# Spring Security 角色命名规范

## 概述

本文档详细说明了仓库管理系统中Spring Security的角色命名规范，以避免权限验证失败的问题。

## 问题背景

Spring Security的权限验证对角色名称是**大小写敏感**的。如果角色名称大小写不匹配，会导致401 Unauthorized错误。

### 常见错误现象

```java
// 错误示例：使用小写角色名称
@PreAuthorize("hasRole('admin') or hasRole('operator')")

// 结果：权限验证失败，返回401 Unauthorized
// 原因：实际权限是 ROLE_ADMIN，但匹配的是 ROLE_admin
```

### 正确做法

```java
// 正确示例：使用大写角色名称
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")

// 结果：权限验证成功
// 原因：匹配实际的 ROLE_ADMIN 和 ROLE_OPERATOR
```

## 角色定义流程

### 1. 枚举定义

所有角色必须在`EntityType.UserRole`枚举中定义：

```java
package com.backend.enumtype;

public class EntityType {
    public enum UserRole {
        ADMIN(0, "管理员"),
        OPERATOR(1, "操作员"),
        TECHNICIAN(2, "技术员");

        private final int code;
        private final String desc;

        UserRole(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static UserRole fromCode(int code) {
            for (UserRole role : values()) {
                if (role.code == code) {
                    return role;
                }
            }
            throw new IllegalArgumentException("Unknown UserRole code: " + code);
        }
    }
}
```

**重要**：枚举的`name()`方法返回的是**大写**名称（如`ADMIN`、`OPERATOR`）。

### 2. 权限设置

在`UserDetailsServiceImpl`中设置用户权限：

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

        // 获取角色枚举
        UserRole userRole = UserRole.fromCode(user.getRole());
        
        // 获取角色名称（大写）
        String roleName = userRole.name();  // 返回 "ADMIN" 或 "OPERATOR"

        // 创建权限，自动添加 ROLE_ 前缀
        return new org.springframework.security.core.userdetails.User(
                username,
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName)));
    }
}
```

**实际权限**：`ROLE_ADMIN`、`ROLE_OPERATOR`（大写）

### 3. 权限验证

在Controller中使用`@PreAuthorize`注解进行权限验证：

```java
@RestController
@RequestMapping("/api/inventory/bin")
public class BinController {

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ApiResponse<Page<Bin>> getBinList() {
        // 实现
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Bin> createBin(@RequestBody Bin bin) {
        // 实现
    }
}
```

## hasRole() vs hasAuthority()

### hasRole()

- 自动添加`ROLE_`前缀
- 推荐使用
- 示例：`hasRole('ADMIN')` → 匹配`ROLE_ADMIN`

```java
@PreAuthorize("hasRole('ADMIN')")
```

### hasAuthority()

- 不自动添加前缀
- 需要精确指定完整权限
- 不推荐，除非需要精确控制
- 示例：`hasAuthority('ROLE_ADMIN')` → 匹配`ROLE_ADMIN`

```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
```

## 命名规范

### 角色名称规范

- **必须使用大写**：`ADMIN`、`OPERATOR`、`TECHNICIAN`
- **禁止使用小写**：`admin`、`operator`、`technician`
- **禁止使用驼峰**：`Admin`、`Operator`

### 权限注解规范

**推荐写法**：
```java
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR') or hasRole('TECHNICIAN')")
```

**禁止写法**：
```java
@PreAuthorize("hasRole('admin')")  // 小写
@PreAuthorize("hasRole('Admin')")  // 驼峰
@PreAuthorize("hasRole('ADMIN') or hasRole('operator')")  // 混用
```

## 代码检查

项目已配置Checkstyle插件，自动检测小写角色名称：

### 检查规则

- 文件：`config/checkstyle-security.xml`
- 正则表达式：`@PreAuthorize\("hasRole\(&apos;[a-z]`
- 错误级别：warning

### 运行检查

```bash
mvn checkstyle:check
```

### 检查输出示例

```
[ERROR] BinController.java:55: 角色名称必须使用大写，禁止使用小写。例如：hasRole('ADMIN') 而不是 hasRole('admin')
```

## 常见问题

### Q1: 为什么会401 Unauthorized？

**A**: 角色名称大小写不匹配。检查`@PreAuthorize`注解中的角色名称是否使用大写。

### Q2: 如何快速检查所有Controller？

**A**: 使用以下命令：

```bash
# 搜索所有小写角色名称
grep -r "hasRole('[a-z]" src/main/java/com/backend/controller/

# 应该没有输出，如果有输出需要修复
```

### Q3: 新增角色时需要注意什么？

**A**: 
1. 在`EntityType.UserRole`枚举中添加新角色（大写）
2. 更新数据库中的角色数据
3. 在Controller中使用大写角色名称
4. 运行Checkstyle检查

### Q4: 如何调试权限问题？

**A**: 在`UserDetailsServiceImpl`中添加日志：

```java
logger.debug("用户角色: {}", roleName);
logger.debug("用户权限: ROLE_{}", roleName);
```

## 最佳实践

1. **始终使用大写角色名称**
2. **使用枚举定义角色**，避免硬编码字符串
3. **定期运行Checkstyle检查**
4. **在代码审查中检查角色名称**
5. **参考项目规范文档**：[project_rules.md](../../.trae/rules/project_rules.md)

## 参考资料

- [Spring Security官方文档](https://docs.spring.io/spring-security/reference/)
- [项目规范文档](../../.trae/rules/project_rules.md)
- [Checkstyle配置](../config/checkstyle-security.xml)

---

**文档版本**：1.0
**创建时间**：2026-02-07
**维护者**：开发团队
