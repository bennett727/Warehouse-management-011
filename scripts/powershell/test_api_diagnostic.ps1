# API诊断测试脚本

$ErrorActionPreference = "Stop"

# 配置
$BASE_URL = "http://localhost:8080"
$HEADERS = @{"Content-Type" = "application/json"}

# 登录获取令牌
function Get-AuthToken {
    $loginBody = @{
        username = "admin"
        password = "Admin123"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post -Body $loginBody -Headers $HEADERS
        if ($response.success) {
            return $response.data.token
        } else {
            throw "登录失败: $($response.message)"
        }
    } catch {
        throw "登录请求失败: $_"
    }
}

# 测试API端点
function Test-ApiEndpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$AuthToken = $null
    )

    Write-Host "`n[测试] $TestName" -ForegroundColor Cyan
    Write-Host "方法: $Method" -ForegroundColor Gray
    Write-Host "端点: $Endpoint" -ForegroundColor Gray

    $headers = @{"Content-Type" = "application/json"}
    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }

    try {
        $bodyJson = if ($Body) { $Body | ConvertTo-Json } else { $null }
        
        $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" -Method $Method -Body $bodyJson -Headers $headers
        
        Write-Host "状态码: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            try {
                $content = $response.Content | ConvertFrom-Json
                Write-Host "响应: $($content | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
            } catch {
                Write-Host "响应: $($response.Content)" -ForegroundColor Gray
            }
        }
        
        return $true
    } catch {
        Write-Host "错误: $_" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "状态码: $statusCode" -ForegroundColor Yellow
            
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $responseBody = $reader.ReadToEnd()
                Write-Host "响应内容: $responseBody" -ForegroundColor Yellow
            } catch {
                Write-Host "无法读取响应内容" -ForegroundColor Yellow
            }
        }
        
        return $false
    }
}

# 主测试流程
function Start-DiagnosticTests {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "API诊断测试" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan

    # 1. 登录测试
    Write-Host "`n[1. 登录测试]" -ForegroundColor Yellow
    try {
        $authToken = Get-AuthToken
        Write-Host "登录成功，获取令牌" -ForegroundColor Green
    } catch {
        Write-Host "登录失败: $_" -ForegroundColor Red
        return
    }

    # 2. 测试设备管理API
    Write-Host "`n[2. 设备管理API测试]" -ForegroundColor Yellow
    
    # 创建设备
    Test-ApiEndpoint -TestName "创建设备" -Method "POST" -Endpoint "/api/devices" -AuthToken $authToken -Body @{
        name = "测试设备"
        code = "TEST001"
        type = 1
        status = 1
        manufacturer = "测试厂商"
        model = "测试型号"
    }

    # 读取设备列表
    Test-ApiEndpoint -TestName "读取设备列表" -Method "GET" -Endpoint "/api/devices?page=0&size=10" -AuthToken $authToken

    # 读取设备详情
    Test-ApiEndpoint -TestName "读取设备详情" -Method "GET" -Endpoint "/api/devices/1" -AuthToken $authToken

    # 更新设备
    Test-ApiEndpoint -TestName "更新设备" -Method "PUT" -Endpoint "/api/devices/1" -AuthToken $authToken -Body @{
        name = "更新后的设备"
        code = "TEST001"
        type = 1
        status = 1
        manufacturer = "测试厂商"
        model = "测试型号"
    }

    # 删除设备
    Test-ApiEndpoint -TestName "删除设备" -Method "DELETE" -Endpoint "/api/devices/999" -AuthToken $authToken

    # 3. 测试用户管理API
    Write-Host "`n[3. 用户管理API测试]" -ForegroundColor Yellow
    
    # 创建用户
    Test-ApiEndpoint -TestName "创建用户" -Method "POST" -Endpoint "/api/users" -AuthToken $authToken -Body @{
        username = "testuser"
        password = "Test123"
        realName = "测试用户"
        email = "test@example.com"
        phone = "13800138000"
        role = 1
    }

    # 读取用户列表
    Test-ApiEndpoint -TestName "读取用户列表" -Method "GET" -Endpoint "/api/users?page=0&size=10" -AuthToken $authToken

    # 读取用户详情
    Test-ApiEndpoint -TestName "读取用户详情" -Method "GET" -Endpoint "/api/users/2" -AuthToken $authToken

    # 更新用户
    Test-ApiEndpoint -TestName "更新用户" -Method "PUT" -Endpoint "/api/users/2" -AuthToken $authToken -Body @{
        username = "testuser"
        realName = "更新后的用户"
        email = "test@example.com"
        phone = "13800138000"
        role = 1
    }

    # 删除用户
    Test-ApiEndpoint -TestName "删除用户" -Method "DELETE" -Endpoint "/api/users/999" -AuthToken $authToken

    # 4. 测试库存管理API
    Write-Host "`n[4. 库存管理API测试]" -ForegroundColor Yellow
    
    # 读取库存列表
    Test-ApiEndpoint -TestName "读取库存列表" -Method "GET" -Endpoint "/api/inventory/device/warehouse-list" -AuthToken $authToken

    # 读取库存详情
    Test-ApiEndpoint -TestName "读取库存详情" -Method "GET" -Endpoint "/api/inventory/device/detail/1" -AuthToken $authToken

    # 读取库存统计
    Test-ApiEndpoint -TestName "读取库存统计" -Method "GET" -Endpoint "/api/inventory/statistics" -AuthToken $authToken

    # 5. 测试区域管理API
    Write-Host "`n[5. 区域管理API测试]" -ForegroundColor Yellow
    
    # 创建区域
    Test-ApiEndpoint -TestName "创建区域" -Method "POST" -Endpoint "/api/areas" -AuthToken $authToken -Body @{
        city = "北京市"
        district = "朝阳区"
        location = "测试位置"
        code = "BJ-CY-001"
        status = 1
        sort = 1
    }

    # 读取区域列表
    Test-ApiEndpoint -TestName "读取区域列表" -Method "GET" -Endpoint "/api/areas?page=0&size=10" -AuthToken $authToken

    # 读取区域树
    Test-ApiEndpoint -TestName "读取区域树" -Method "GET" -Endpoint "/api/areas/tree" -AuthToken $authToken

    # 更新区域
    Test-ApiEndpoint -TestName "更新区域" -Method "PUT" -Endpoint "/api/areas/1" -AuthToken $authToken -Body @{
        city = "北京市"
        district = "朝阳区"
        location = "更新后的位置"
        code = "BJ-CY-001"
        status = 1
        sort = 1
    }

    # 删除区域
    Test-ApiEndpoint -TestName "删除区域" -Method "DELETE" -Endpoint "/api/areas/999" -AuthToken $authToken

    # 6. 测试设备安装管理API
    Write-Host "`n[6. 设备安装管理API测试]" -ForegroundColor Yellow
    
    # 创建安装记录
    Test-ApiEndpoint -TestName "创建安装记录" -Method "POST" -Endpoint "/api/installation-records" -AuthToken $authToken -Body @{
        deviceId = 1
        areaId = 1
        installDate = "2026-01-23T12:00:00"
        installStatus = 1
        installer = "测试人员"
    }

    # 读取安装列表
    Test-ApiEndpoint -TestName "读取安装列表" -Method "GET" -Endpoint "/api/installation-records?page=0&size=10" -AuthToken $authToken

    # 读取安装详情
    Test-ApiEndpoint -TestName "读取安装详情" -Method "GET" -Endpoint "/api/installation-records/1" -AuthToken $authToken

    # 更新安装记录
    Test-ApiEndpoint -TestName "更新安装记录" -Method "PUT" -Endpoint "/api/installation-records/1" -AuthToken $authToken -Body @{
        deviceId = 1
        areaId = 1
        installDate = "2026-01-23T12:00:00"
        installStatus = 2
        installer = "测试人员"
    }

    # 删除安装记录
    Test-ApiEndpoint -TestName "删除安装记录" -Method "DELETE" -Endpoint "/api/installation-records/999" -AuthToken $authToken

    # 7. 测试设备维修管理API
    Write-Host "`n[7. 设备维修管理API测试]" -ForegroundColor Yellow
    
    # 创建维修记录
    Test-ApiEndpoint -TestName "创建维修记录" -Method "POST" -Endpoint "/api/maintenance" -AuthToken $authToken -Body @{
        deviceId = 1
        repairType = 1
        repairDate = "2026-01-23T12:00:00"
        repairStatus = 1
        repairPerson = "维修人员"
        description = "测试维修"
    }

    # 读取维修列表
    Test-ApiEndpoint -TestName "读取维修列表" -Method "GET" -Endpoint "/api/maintenance?page=0&size=10" -AuthToken $authToken

    # 读取维修详情
    Test-ApiEndpoint -TestName "读取维修详情" -Method "GET" -Endpoint "/api/maintenance/1" -AuthToken $authToken

    # 更新维修记录
    Test-ApiEndpoint -TestName "更新维修记录" -Method "PUT" -Endpoint "/api/maintenance/1" -AuthToken $authToken -Body @{
        deviceId = 1
        repairType = 1
        repairDate = "2026-01-23T12:00:00"
        repairStatus = 2
        repairPerson = "维修人员"
        description = "测试维修"
    }

    # 删除维修记录
    Test-ApiEndpoint -TestName "删除维修记录" -Method "DELETE" -Endpoint "/api/maintenance/999" -AuthToken $authToken

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "诊断测试完成" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

# 执行测试
try {
    Start-DiagnosticTests
} catch {
    Write-Host "`n诊断测试失败: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
}
