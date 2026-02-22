# 异常处理规范文档

## 1. 概述

本文档定义了仓库管理系统(WMS)项目中统一的异常处理规范，确保错误捕获、错误分类、错误信息格式化及错误响应机制在整个项目中保持一致。

## 2. 异常分类体系

### 2.1 异常层级结构

```
Throwable
├── Error (系统级错误，不应捕获)
└── Exception
    ├── RuntimeException (未检查异常)
    │   ├── BusinessException (业务异常)
    │   ├── ValidationException (验证异常)
    │   ├── BadRequestException (请求参数错误)
    │   ├── ResourceNotFoundException (资源未找到)
    │   ├── DuplicateOrderException (订单重复)
    │   ├── InsufficientStockException (库存不足)
    │   └── ... (其他业务异常)
    └── CheckedException (已检查异常，应转换为业务异常)
```

### 2.2 异常类型定义

#### 2.2.1 业务异常 (BusinessException)
- **用途**：处理业务逻辑相关的异常
- **HTTP状态码**：400 Bad Request
- **日志级别**：WARN
- **示例**：库存不足、设备状态无效、业务规则违反

#### 2.2.2 验证异常 (ValidationException)
- **用途**：处理数据验证失败的异常
- **HTTP状态码**：400 Bad Request
- **日志级别**：WARN
- **示例**：数据格式错误、字段验证失败

#### 2.2.3 请求参数错误 (BadRequestException)
- **用途**：处理请求参数不合法的异常
- **HTTP状态码**：400 Bad Request
- **日志级别**：WARN
- **示例**：参数缺失、参数类型错误

#### 2.2.4 资源未找到 (ResourceNotFoundException)
- **用途**：处理请求的资源不存在的异常
- **HTTP状态码**：404 Not Found
- **日志级别**：WARN
- **示例**：用户不存在、设备不存在、订单不存在

#### 2.2.5 订单重复 (DuplicateOrderException)
- **用途**：处理订单编号重复的异常
- **HTTP状态码**：409 Conflict
- **日志级别**：WARN
- **示例**：订单编号已存在

#### 2.2.6 库存不足 (InsufficientStockException)
- **用途**：处理库存不足的异常
- **HTTP状态码**：400 Bad Request
- **日志级别**：WARN
- **示例**：出库数量超过库存

## 3. 异常处理原则

### 3.1 服务层异常处理

#### 3.1.1 异常捕获原则
- **必须捕获**：所有可能抛出的受检异常
- **必须转换**：将受检异常转换为业务异常
- **必须记录**：使用适当的日志级别记录异常
- **必须传递**：保留原始异常信息

#### 3.1.2 异常日志级别规范

| 异常类型 | 日志级别 | 说明 |
|---------|---------|------|
| 业务异常 | WARN | 预期的业务异常，不需要立即处理 |
| 验证异常 | WARN | 参数验证失败，属于正常业务流程 |
| 资源未找到 | WARN | 查询的资源不存在，属于正常业务流程 |
| 系统异常 | ERROR | 未预期的系统错误，需要立即关注 |
| 数据库异常 | ERROR | 数据库操作失败，需要立即关注 |

#### 3.1.3 服务层异常处理模板

```java
@Override
public ReturnType methodName(ParameterType parameter) {
    logger.info("操作描述，参数: {}", parameter);
    
    try {
        ReturnType result = repository.method(parameter);
        logger.info("操作成功");
        return result;
    } catch (BusinessException e) {
        logger.warn("业务异常: {}", e.getMessage());
        throw e;
    } catch (ResourceNotFoundException e) {
        logger.warn("资源未找到: {}", e.getMessage());
        throw e;
    } catch (IllegalArgumentException e) {
        logger.warn("参数错误: {}", e.getMessage());
        throw new BadRequestException("参数错误: " + e.getMessage(), e);
    } catch (Exception e) {
        logger.error("系统异常: {}", e.getMessage(), e);
        throw new BusinessException("操作失败: " + e.getMessage(), ErrorCode.INTERNAL_ERROR, e);
    }
}
```

### 3.2 控制器层异常处理

#### 3.2.1 异常处理原则
- **不捕获**：业务异常和验证异常，交给GlobalExceptionHandler处理
- **仅捕获**：需要特殊处理的异常
- **统一响应**：使用ApiResponse统一响应格式

#### 3.2.2 控制器层异常处理模板

```java
@RestController
@RequestMapping("/api/resource")
public class ResourceController {
    
    private static final Logger logger = LoggerFactory.getLogger(ResourceController.class);
    
    @Autowired
    private ResourceService resourceService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createResource(@Valid @RequestBody ResourceDTO dto) {
        logger.info("创建资源，参数: {}", dto);
        
        try {
            Resource resource = resourceService.createResource(dto);
            return ResponseEntity.ok(ApiResponse.success(resource));
        } catch (BusinessException e) {
            logger.warn("业务异常: {}", e.getMessage());
            throw e;
        }
    }
}
```

### 3.3 全局异常处理

#### 3.3.1 异常处理原则
- **统一处理**：所有未处理的异常
- **统一格式**：使用ApiResponse统一响应格式
- **统一日志**：记录所有异常信息
- **统一监控**：支持异常监控和告警

#### 3.3.2 全局异常处理器模板

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @Autowired
    private ExceptionHandlingConfig config;
    
    @Autowired
    private ExceptionUtils exceptionUtils;
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException ex, WebRequest request) {
        logger.warn("业务异常: {}", ex.getMessage(), ex);
        
        ApiResponse<?> response = ApiResponse.error(
            ex.getMessage(),
            ex.getErrorCode() != null ? ex.getErrorCode().getCode() : ErrorCode.INTERNAL_ERROR.getCode(),
            HttpStatus.BAD_REQUEST.value(),
            ex.getErrorData()
        );
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnhandledException(Exception ex, WebRequest request) {
        logger.error("未处理的异常: {}", ex.getMessage(), ex);
        
        String message = config.isShowDetailsInProduction() ? 
            ex.getMessage() : "服务器内部错误";
        
        ApiResponse<?> response = ApiResponse.error(
            message,
            ErrorCode.INTERNAL_ERROR.getCode(),
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## 4. 异常信息格式化规范

### 4.1 异常消息格式

#### 4.1.1 消息格式模板

```
[操作名称]失败: [具体原因]
```

#### 4.1.2 消息格式示例

| 操作类型 | 正确格式 | 错误格式 |
|---------|---------|---------|
| 保存 | "保存设备失败: 设备编号已存在" | "保存失败" / "设备编号已存在" |
| 查询 | "查询设备失败: 设备ID不存在" | "查询失败" / "设备ID不存在" |
| 删除 | "删除设备失败: 设备正在使用中" | "删除失败" / "设备正在使用中" |
| 更新 | "更新设备失败: 设备状态不允许修改" | "更新失败" / "设备状态不允许修改" |

### 4.2 异常数据附加规范

#### 4.2.1 附加数据原则
- **必要信息**：必须包含错误相关的关键数据
- **结构化**：使用Map结构存储附加数据
- **安全性**：不包含敏感信息

#### 4.2.2 附加数据示例

```java
BusinessException exception = new BusinessException(
    "批量更新设备类型失败",
    ErrorCode.BATCH_UPDATE_FAILED
)
    .addErrorData("deviceCount", 100)
    .addErrorData("targetType", "TYPE001")
    .addErrorData("failedCount", 5);
```

## 5. 错误码规范

### 5.1 错误码定义原则

- **唯一性**：每个错误码在系统中唯一
- **语义化**：错误码名称应能描述错误类型
- **层次性**：错误码应体现模块和错误类型
- **可扩展**：支持新增错误码而不影响现有代码

### 5.2 错误码命名规范

```
[模块]_[错误类型]_[具体错误]
```

#### 5.2.1 错误码示例

| 错误码 | 说明 | 模块 | 错误类型 |
|--------|------|------|---------|
| DEVICE_NOT_FOUND | 设备不存在 | DEVICE | NOT_FOUND |
| DEVICE_STATUS_INVALID | 设备状态无效 | DEVICE | INVALID |
| INVENTORY_INSUFFICIENT | 库存不足 | INVENTORY | INSUFFICIENT |
| USER_NOT_FOUND | 用户不存在 | USER | NOT_FOUND |
| LOGIN_FAILED | 登录失败 | 通用 | FAILED |

### 5.3 错误码使用规范

```java
throw new BusinessException(
    "设备不存在",
    ErrorCode.DEVICE_NOT_FOUND
);

throw new BusinessException(
    "库存不足",
    ErrorCode.INVENTORY_INSUFFICIENT
)
    .addErrorData("required", 100)
    .addErrorData("available", 50);
```

## 6. 日志记录规范

### 6.1 日志级别使用规范

| 日志级别 | 使用场景 | 示例 |
|---------|---------|------|
| DEBUG | 详细的调试信息 | "查询设备，参数: deviceId=123" |
| INFO | 正常的业务操作 | "保存设备成功，设备ID: 123" |
| WARN | 预期的异常情况 | "业务异常: 设备不存在" |
| ERROR | 未预期的系统错误 | "系统异常: 数据库连接失败" |

### 6.2 日志记录模板

```java
logger.info("操作开始，参数: {}", parameter);

try {
    result = operation(parameter);
    logger.info("操作成功，结果: {}", result);
    return result;
} catch (BusinessException e) {
    logger.warn("业务异常: {}", e.getMessage());
    throw e;
} catch (Exception e) {
    logger.error("系统异常: {}", e.getMessage(), e);
    throw new BusinessException("操作失败", ErrorCode.INTERNAL_ERROR, e);
}
```

### 6.3 日志记录最佳实践

1. **操作开始时**：记录操作类型和关键参数
2. **操作成功时**：记录操作结果和关键数据
3. **业务异常时**：使用WARN级别，记录异常消息
4. **系统异常时**：使用ERROR级别，记录异常消息和堆栈
5. **避免重复**：同一异常不要在多个地方重复记录
6. **敏感信息**：不要记录密码、令牌等敏感信息

## 7. 异常响应规范

### 7.1 统一响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE",
  "data": {
    "field1": "error1",
    "field2": "error2"
  }
}
```

### 7.2 响应字段说明

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| success | boolean | 操作是否成功 | 是 |
| message | string | 错误描述 | 是 |
| code | string | 错误码 | 是 |
| data | object | 附加错误数据 | 否 |

### 7.3 响应示例

#### 7.3.1 业务异常响应

```json
{
  "success": false,
  "message": "设备不存在",
  "code": "DEVICE_NOT_FOUND",
  "data": {
    "deviceId": 123
  }
}
```

#### 7.3.2 验证异常响应

```json
{
  "success": false,
  "message": "参数验证失败",
  "code": "VALIDATION_ERROR",
  "data": {
    "deviceCode": "设备编号不能为空",
    "deviceName": "设备名称长度不能超过50个字符"
  }
}
```

#### 7.3.3 系统异常响应

```json
{
  "success": false,
  "message": "服务器内部错误",
  "code": "INTERNAL_ERROR",
  "data": null
}
```

## 8. 异常处理最佳实践

### 8.1 服务层最佳实践

1. **使用自定义异常**：不要直接抛出RuntimeException
2. **包含错误码**：使用ErrorCode枚举提供标准错误码
3. **附加上下文数据**：使用addErrorData()方法添加错误上下文
4. **保留原始异常**：使用cause参数保留原始异常信息
5. **适当的日志级别**：根据异常类型选择合适的日志级别

### 8.2 控制器层最佳实践

1. **参数验证**：使用@Valid注解进行参数验证
2. **不吞没异常**：不要捕获异常后不处理
3. **统一响应格式**：使用ApiResponse包装响应数据
4. **RESTful风格**：使用合适的HTTP状态码

### 8.3 全局异常处理最佳实践

1. **覆盖所有异常**：确保所有异常都有对应的处理器
2. **统一响应格式**：使用ApiResponse统一响应格式
3. **记录所有异常**：确保所有异常都被记录
4. **支持监控**：提供异常监控和告警能力

## 9. 测试中的异常处理

### 9.1 测试异常处理原则

1. **预期异常**：测试用例中的预期异常使用WARN级别
2. **异常验证**：验证异常消息包含关键信息
3. **Mock配置**：正确配置Mock以触发预期异常
4. **日志隔离**：测试环境使用独立的日志配置

### 9.2 测试异常处理模板

```java
@Test
void testOperation_WithException() {
    when(repository.method(any()))
        .thenThrow(new RuntimeException("Database error"));
    
    BusinessException exception = assertThrows(BusinessException.class, () -> {
        service.method(parameter);
    });
    
    assertTrue(exception.getMessage().contains("操作失败"));
    assertTrue(exception.getMessage().contains("Database error"));
    verify(repository, times(1)).method(parameter);
}
```

## 10. 异常处理检查清单

### 10.1 代码审查检查清单

- [ ] 是否使用了自定义异常而不是RuntimeException
- [ ] 异常消息是否遵循格式规范
- [ ] 是否包含了适当的错误码
- [ ] 是否使用了正确的日志级别
- [ ] 是否保留了原始异常信息
- [ ] 是否附加了必要的上下文数据
- [ ] 是否记录了适当的日志信息
- [ ] 测试用例是否验证了异常处理

### 10.2 异常处理审查流程

1. **代码提交前**：使用检查清单自我审查
2. **代码审查时**：审查者使用检查清单检查
3. **测试阶段**：验证异常处理是否正确
4. **部署前**：确认异常处理符合规范

## 11. 附录

### 11.1 异常类清单

| 异常类 | 用途 | HTTP状态码 | 日志级别 |
|--------|------|------------|---------|
| BusinessException | 业务异常 | 400 | WARN |
| ValidationException | 验证异常 | 400 | WARN |
| BadRequestException | 请求参数错误 | 400 | WARN |
| ResourceNotFoundException | 资源未找到 | 404 | WARN |
| DuplicateOrderException | 订单重复 | 409 | WARN |
| InsufficientStockException | 库存不足 | 400 | WARN |

### 11.2 错误码清单

详见 [ErrorCode.java](file:///d:/Warehouse%20management-011/spring_boot/src/main/java/com/backend/common/ErrorCode.java)

### 11.3 相关文档

- [全局异常处理器](file:///d:/Warehouse%20management-011/spring_boot/src/main/java/com/backend/config/exception/GlobalExceptionHandler.java)
- [异常处理配置](file:///d:/Warehouse%20management-011/spring_boot/src/main/java/com/backend/config/exception/ExceptionHandlingConfig.java)
- [异常工具类](file:///d:/Warehouse%20management-011/spring_boot/src/main/java/com/backend/util/ExceptionUtils.java)

---

**文档版本**：1.0
**创建时间**：2026-01-18
**最后更新**：2026-01-18
**维护人**：开发团队
