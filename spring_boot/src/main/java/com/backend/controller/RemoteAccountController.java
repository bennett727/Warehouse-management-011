package com.backend.controller;

import com.backend.constants.ApiPathConstants;
import com.backend.dto.ApiResponse;
import com.backend.entity.RemoteAccount;
import com.backend.service.remote.RemoteAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 远程账户管理控制器
 * 提供远程连接账户的CRUD操作和连接测试功能
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-08
 */
@Tag(name = "远程账户管理", description = "远程连接账户的管理和测试接口")
@RestController
@RequestMapping(ApiPathConstants.RemoteAccountApi.BASE)
public class RemoteAccountController {

    private final RemoteAccountService accountService;

    public RemoteAccountController(RemoteAccountService accountService) {
        this.accountService = accountService;
    }

    @Operation(summary = "获取所有远程账户", description = "返回系统中所有远程账户")
    @GetMapping
    public ApiResponse<List<RemoteAccount>> getAllAccounts() {
        List<RemoteAccount> accounts = accountService.getAllAccounts();
        return ApiResponse.success("获取远程账户成功", accounts);
    }

    @Operation(summary = "根据ID获取远程账户", description = "通过账户ID获取详细信息")
    @Parameter(name = "id", description = "账户ID", required = true)
    @GetMapping("/{id}")
    public ApiResponse<RemoteAccount> getAccountById(@PathVariable Long id) {
        RemoteAccount account = accountService.getAccountById(id);
        return ApiResponse.success("获取远程账户成功", account);
    }

    @Operation(summary = "创建远程账户", description = "添加新的远程连接账户")
    @PostMapping
    public ApiResponse<RemoteAccount> createAccount(@RequestBody RemoteAccount account) {
        RemoteAccount createdAccount = accountService.createAccount(account);
        return ApiResponse.success("创建远程账户成功", createdAccount);
    }

    @Operation(summary = "更新远程账户", description = "更新指定的远程账户信息")
    @Parameter(name = "id", description = "账户ID", required = true)
    @PutMapping("/{id}")
    public ApiResponse<RemoteAccount> updateAccount(
            @PathVariable Long id,
            @RequestBody RemoteAccount account) {
        RemoteAccount updatedAccount = accountService.updateAccount(id, account);
        return ApiResponse.success("更新远程账户成功", updatedAccount);
    }

    @Operation(summary = "删除远程账户", description = "删除指定的远程账户")
    @Parameter(name = "id", description = "账户ID", required = true)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ApiResponse.success("删除远程账户成功", null);
    }

    @Operation(summary = "测试远程连接", description = "测试指定远程账户的连接状态")
    @Parameter(name = "id", description = "账户ID", required = true)
    @PostMapping("/{id}/test")
    public ApiResponse<Map<String, Object>> testConnection(@PathVariable Long id) {
        Map<String, Object> result = accountService.testConnection(id);
        return ApiResponse.success("测试连接完成", result);
    }
}