package com.backend.aspect;

import java.lang.reflect.Method;
import java.util.Locale;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.backend.entity.OperationLog;
import com.backend.entity.User;
import com.backend.repository.OperationLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 操作日志记录切面
 * 
 * 功能说明：
 * 通过AOP切面自动记录系统的操作日志，包括：
 * - 操作用户信息
 * - 操作方法名和参数
 * - 请求IP和User-Agent
 * - 执行时间和状态
 * - 异常信息
 * 
 * 记录范围：
 * - 所有Controller层的方法调用
 * - 排除查询类操作（GET请求）
 * 
 * 使用方式：
 * 切面自动生效，无需手动调用
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    /** 操作日志数据访问 */
    private final OperationLogRepository operationLogRepository;

    /** JSON序列化工具 */
    private final ObjectMapper objectMapper;

    /**
     * 定义切点：所有Controller方法
     * 排除查询类操作，只记录增删改操作
     */
    @Pointcut("execution(* com.backend.controller.*.*(..)) && " +
            "!execution(* com.backend.controller.*.get*(..)) && " +
            "!execution(* com.backend.controller.*.list*(..)) && " +
            "!execution(* com.backend.controller.*.query*(..)) && " +
            "!execution(* com.backend.controller.*.search*(..))")
    public void operationLogPointcut() {
    }

    /**
     * 环绕通知：记录操作日志
     * 
     * 记录内容：
     * 1. 操作用户信息（ID、用户名）
     * 2. 操作方法（类名.方法名）
     * 3. 请求参数（JSON格式）
     * 4. 请求IP地址
     * 5. User-Agent信息
     * 6. 执行时间（毫秒）
     * 7. 操作状态（成功/失败）
     * 8. 异常信息（如有）
     * 
     * @param joinPoint 连接点
     * @return 原方法返回值
     * @throws Throwable 异常
     */
    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        // 记录开始时间
        long startTime = System.currentTimeMillis();

        // 获取请求信息
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        // 获取方法信息
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        String fullMethodName = className + "." + methodName;

        // 创建日志对象
        OperationLog operationLog = new OperationLog();
        operationLog.setOperation(getOperationDescription(methodName));
        operationLog.setMethod(fullMethodName);

        // 获取当前用户信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            operationLog.setUserId(user.getId());
            operationLog.setUsername(user.getUsername());
        } else if (authentication != null) {
            operationLog.setUsername(authentication.getName());
        }

        // 获取请求信息
        if (request != null) {
            operationLog.setIp(getClientIp(request));
            operationLog.setUserAgent(request.getHeader("User-Agent"));
        }

        // 记录请求参数
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                // 过滤掉HttpServletRequest等不需要记录的参数
                String params = objectMapper.writeValueAsString(filterArgs(args));
                // 限制参数长度，防止存储过大
                if (params.length() > 2000) {
                    params = params.substring(0, 2000) + "...";
                }
                operationLog.setParams(params);
            }
        } catch (Exception e) {
            operationLog.setParams("参数序列化失败: " + e.getMessage());
        }

        // 执行目标方法
        Object result;
        try {
            result = joinPoint.proceed();
            operationLog.setStatus(1); // 成功
        } catch (Throwable throwable) {
            operationLog.setStatus(0); // 失败
            operationLog.setErrorMsg(throwable.getMessage());
            throw throwable;
        } finally {
            // 计算执行时间
            long executeTime = System.currentTimeMillis() - startTime;
            operationLog.setExecuteTime((int) executeTime);

            // 异步保存日志（避免影响主流程性能）
            saveLogAsync(operationLog);
        }

        return result;
    }

    /**
     * 异步保存操作日志
     * 
     * @param operationLog 操作日志对象
     */
    private void saveLogAsync(OperationLog operationLog) {
        try {
            operationLogRepository.save(operationLog);
        } catch (Exception e) {
            // 日志保存失败不影响主业务流程
            log.error("保存操作日志失败: {}", e.getMessage());
        }
    }

    /**
     * 获取操作描述
     * 
     * 根据方法名推断操作类型：
     * - create/add: 创建
     * - update/modify: 更新
     * - delete/remove: 删除
     * - approve/reject: 审核
     * - import/export: 导入/导出
     * 
     * @param methodName 方法名
     * @return 操作描述
     */
    private String getOperationDescription(String methodName) {
        String lowerMethodName = methodName.toLowerCase(Locale.ROOT);
        if (lowerMethodName.contains("create") || lowerMethodName.contains("add") || lowerMethodName.contains("save")) {
            return "创建操作";
        } else if (lowerMethodName.contains("update") || lowerMethodName.contains("modify")
                || lowerMethodName.contains("edit")) {
            return "更新操作";
        } else if (lowerMethodName.contains("delete") || lowerMethodName.contains("remove")) {
            return "删除操作";
        } else if (lowerMethodName.contains("approve")) {
            return "审核通过";
        } else if (lowerMethodName.contains("reject")) {
            return "审核拒绝";
        } else if (lowerMethodName.contains("import")) {
            return "数据导入";
        } else if (lowerMethodName.contains("export")) {
            return "数据导出";
        } else if (lowerMethodName.contains("login")) {
            return "用户登录";
        } else if (lowerMethodName.contains("logout")) {
            return "用户登出";
        } else {
            return "其他操作";
        }
    }

    /**
     * 过滤参数
     * 
     * 排除不需要记录的参数类型：
     * - HttpServletRequest
     * - HttpServletResponse
     * - MultipartFile
     * 
     * @param args 参数数组
     * @return 过滤后的参数数组
     */
    private Object[] filterArgs(Object[] args) {
        if (args == null) {
            return new Object[0];
        }
        return java.util.Arrays.stream(args)
                .filter(arg -> arg == null || !(arg instanceof HttpServletRequest ||
                        arg instanceof jakarta.servlet.http.HttpServletResponse ||
                        arg instanceof org.springframework.web.multipart.MultipartFile))
                .toArray();
    }

    /**
     * 获取客户端真实IP地址
     * 
     * 支持通过代理服务器获取真实IP：
     * - X-Forwarded-For
     * - X-Real-IP
     * - Proxy-Client-IP
     * - WL-Proxy-Client-IP
     * 
     * @param request HTTP请求
     * @return 客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理情况，取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
