# Warehouse Management System CRUD Comprehensive Test Script

# Test Configuration
$BASE_URL = "http://localhost:8080"
$LOGIN_URL = "$BASE_URL/api/auth/login"
$HEADERS = @{"Content-Type" = "application/json"}

# Test Results Statistics
$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0
$TEST_RESULTS = @()

# Test Function
function Test-ApiEndpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$AuthToken = $null,
        [scriptblock]$Validator = $null
    )
    
    $script:TOTAL_TESTS++
    $result = @{
        TestName = $TestName
        Method = $Method
        Endpoint = $Endpoint
        Status = "FAILED"
        Message = ""
        Response = $null
    }
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($AuthToken) {
            $headers["Authorization"] = "Bearer $AuthToken"
        }
        
        $bodyJson = if ($Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }
        
        $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -Body $bodyJson -ErrorAction Stop
        
        if ($Validator) {
            $isValid = & $Validator $response
            if ($isValid) {
                $script:PASSED_TESTS++
                $result.Status = "PASSED"
                $result.Message = "Validation passed"
            } else {
                $script:FAILED_TESTS++
                $result.Message = "Validation failed"
            }
        } else {
            $script:PASSED_TESTS++
            $result.Status = "PASSED"
            $result.Message = "Request successful"
        }
        
        $result.Response = $response
    } catch {
        $script:FAILED_TESTS++
        $result.Message = "Request failed: $($_.Exception.Message)"
        $result.Response = $_.Exception.Message
    }
    
    $TEST_RESULTS += $result
    Write-Host "[$($result.Status)] $TestName" -ForegroundColor $(if ($result.Status -eq "PASSED") { "Green" } else { "Red" })
    if ($result.Message) {
        Write-Host "  - $($result.Message)" -ForegroundColor Gray
    }
    
    return $result
}

# Login Function
function Get-AuthToken {
    param(
        [string]$Username = "admin",
        [string]$Password = "Admin123"
    )
    
    $loginBody = @{
        username = $Username
        password = $Password
    }
    
    $response = Invoke-RestMethod -Uri $LOGIN_URL -Method POST -Headers $HEADERS -Body ($loginBody | ConvertTo-Json) -ErrorAction Stop
    return $response.data.token
}

# Main Test Function
function Start-CRUDTests {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Warehouse Management System CRUD Tests" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # 1. Login Test
    Write-Host "`n[1. Login Test]" -ForegroundColor Yellow
    
    try {
        $authToken = Get-AuthToken
        Write-Host "[PASSED] Login successful" -ForegroundColor Green
        Write-Host "  - Token: $($authToken.Substring(0, 20))..." -ForegroundColor Gray
    } catch {
        Write-Host "[FAILED] Login failed: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
    # 2. Warehouse Management CRUD Tests
    Write-Host "`n[2. Warehouse Management CRUD Tests]" -ForegroundColor Yellow
    
    # 2.1 Create Warehouse
    Test-ApiEndpoint -TestName "Create Warehouse" -Method "POST" -Endpoint "/api/warehouses" -AuthToken $authToken -Body @{
        warehouseCode = "TEST001"
        warehouseName = "Test Warehouse"
        address = "Test Address"
        manager = "Test Manager"
        phone = "13800138000"
        status = 1
    } -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 2.2 Read Warehouse List
    Test-ApiEndpoint -TestName "Read Warehouse List" -Method "GET" -Endpoint "/api/warehouses?page=0&size=10" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 2.3 Read Warehouse Detail
    Test-ApiEndpoint -TestName "Read Warehouse Detail" -Method "GET" -Endpoint "/api/warehouses/1" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 2.4 Update Warehouse
    Test-ApiEndpoint -TestName "Update Warehouse" -Method "PUT" -Endpoint "/api/warehouses/1" -AuthToken $authToken -Body @{
        warehouseCode = "TEST001"
        warehouseName = "Test Warehouse Updated"
        address = "Test Address Updated"
        manager = "Test Manager Updated"
        phone = "13800138000"
        status = 1
    } -Validator {
        param($response)
        $response.success -eq $true
    }
    
    # 3. Area Management CRUD Tests
    Write-Host "`n[3. Area Management CRUD Tests]" -ForegroundColor Yellow
    
    # 3.1 Create Area
    Test-ApiEndpoint -TestName "Create Area" -Method "POST" -Endpoint "/api/areas" -AuthToken $authToken -Body @{
        areaCode = "AREA001"
        areaName = "Test Area"
        warehouseId = 1
        areaType = 1
        capacity = 100
        status = 1
    } -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 3.2 Read Area List
    Test-ApiEndpoint -TestName "Read Area List" -Method "GET" -Endpoint "/api/areas?page=0&size=10" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 3.3 Read Area Detail
    Test-ApiEndpoint -TestName "Read Area Detail" -Method "GET" -Endpoint "/api/areas/1" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 3.4 Update Area
    Test-ApiEndpoint -TestName "Update Area" -Method "PUT" -Endpoint "/api/areas/1" -AuthToken $authToken -Body @{
        areaCode = "AREA001"
        areaName = "Test Area Updated"
        warehouseId = 1
        areaType = 1
        capacity = 100
        status = 1
    } -Validator {
        param($response)
        $response.success -eq $true
    }
    
    # 4. Device Management CRUD Tests
    Write-Host "`n[4. Device Management CRUD Tests]" -ForegroundColor Yellow
    
    # 4.1 Create Device
    Test-ApiEndpoint -TestName "Create Device" -Method "POST" -Endpoint "/api/devices" -AuthToken $authToken -Body @{
        deviceCode = "DEV001"
        deviceName = "Test Device"
        deviceType = 1
        model = "Test Model"
        manufacturer = "Test Manufacturer"
        purchaseDate = "2026-01-01"
        status = 1
        warehouseId = 1
        areaId = 1
    } -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 4.2 Read Device List
    Test-ApiEndpoint -TestName "Read Device List" -Method "GET" -Endpoint "/api/devices?page=0&size=10" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 4.3 Read Device Detail
    Test-ApiEndpoint -TestName "Read Device Detail" -Method "GET" -Endpoint "/api/devices/1" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 4.4 Update Device
    Test-ApiEndpoint -TestName "Update Device" -Method "PUT" -Endpoint "/api/devices/1" -AuthToken $authToken -Body @{
        deviceCode = "DEV001"
        deviceName = "Test Device Updated"
        deviceType = 1
        model = "Test Model"
        manufacturer = "Test Manufacturer"
        purchaseDate = "2026-01-01"
        status = 1
        warehouseId = 1
        areaId = 1
    } -Validator {
        param($response)
        $response.success -eq $true
    }
    
    # 5. Inventory Management CRUD Tests
    Write-Host "`n[5. Inventory Management CRUD Tests]" -ForegroundColor Yellow
    
    # 5.1 Create Inventory
    Test-ApiEndpoint -TestName "Create Inventory" -Method "POST" -Endpoint "/api/inventory" -AuthToken $authToken -Body @{
        deviceId = 1
        warehouseId = 1
        areaId = 1
        quantity = 100
        unit = "pcs"
        minStock = 10
        maxStock = 200
    } -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 5.2 Read Inventory List
    Test-ApiEndpoint -TestName "Read Inventory List" -Method "GET" -Endpoint "/api/inventory?page=0&size=10" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 5.3 Read Inventory Detail
    Test-ApiEndpoint -TestName "Read Inventory Detail" -Method "GET" -Endpoint "/api/inventory/1" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 5.4 Update Inventory
    Test-ApiEndpoint -TestName "Update Inventory" -Method "PUT" -Endpoint "/api/inventory/1" -AuthToken $authToken -Body @{
        deviceId = 1
        warehouseId = 1
        areaId = 1
        quantity = 150
        unit = "pcs"
        minStock = 10
        maxStock = 200
    } -Validator {
        param($response)
        $response.success -eq $true
    }
    
    # 6. Device Installation Management CRUD Tests
    Write-Host "`n[6. Device Installation Management CRUD Tests]" -ForegroundColor Yellow
    
    # 6.1 Create Installation Record
    Test-ApiEndpoint -TestName "Create Installation Record" -Method "POST" -Endpoint "/api/installation-record" -AuthToken $authToken -Body @{
        deviceId = 1
        installTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        operatorId = 1
        province = "Guangdong"
        city = "Shenzhen"
        district = "Nanshan"
        detailAddr = "Test Address"
        status = 2
        remark = "Test installation"
    } -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 6.2 Read Installation List
    Test-ApiEndpoint -TestName "Read Installation List" -Method "GET" -Endpoint "/api/installation-records?page=0&size=10" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 6.3 Read Installation Detail
    Test-ApiEndpoint -TestName "Read Installation Detail" -Method "GET" -Endpoint "/api/installation-records/1" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 6.4 Update Installation Record
    Test-ApiEndpoint -TestName "Update Installation Record" -Method "PUT" -Endpoint "/api/installation-records/1" -AuthToken $authToken -Body @{
        deviceId = 1
        installTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        operatorId = 1
        province = "Guangdong"
        city = "Shenzhen"
        district = "Nanshan"
        detailAddr = "Test Address Updated"
        status = 2
        remark = "Test installation-updated"
    } -Validator {
        param($response)
        $response.success -eq $true
    }
    
    # 7. Device Repair Management CRUD Tests
    Write-Host "`n[7. Device Repair Management CRUD Tests]" -ForegroundColor Yellow
    
    # 7.1 Create Repair Record
    Test-ApiEndpoint -TestName "Create Repair Record" -Method "POST" -Endpoint "/api/maintenance" -AuthToken $authToken -Body @{
        deviceId = 1
        faultDesc = "Test repair content"
        maintenanceType = 1
        operatorId = 1
        repairTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        remark = "Test repair"
    } -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 7.2 Read Repair List
    Test-ApiEndpoint -TestName "Read Repair List" -Method "GET" -Endpoint "/api/maintenance?page=0&size=10" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 7.3 Read Repair Detail
    Test-ApiEndpoint -TestName "Read Repair Detail" -Method "GET" -Endpoint "/api/maintenance/1" -AuthToken $authToken -Validator {
        param($response)
        $response.success -eq $true -and $response.data -ne $null
    }
    
    # 7.4 Update Repair Record
    Test-ApiEndpoint -TestName "Update Repair Record" -Method "PUT" -Endpoint "/api/maintenance/1" -AuthToken $authToken -Body @{
        deviceId = 1
        faultDesc = "Test repair content-updated"
        maintenanceType = 1
        operatorId = 1
        repairTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        remark = "Test repair-updated"
    } -Validator {
        param($response)
        $response.success -eq $true
    }
    
    # Output Test Results Summary
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Test Results Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Total Tests: $TOTAL_TESTS" -ForegroundColor White
    Write-Host "Passed: $PASSED_TESTS" -ForegroundColor Green
    Write-Host "Failed: $FAILED_TESTS" -ForegroundColor Red
    Write-Host "Success Rate: $([math]::Round(($PASSED_TESTS / $TOTAL_TESTS) * 100, 2))%" -ForegroundColor $(if ($PASSED_TESTS -eq $TOTAL_TESTS) { "Green" } else { "Yellow" })
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # Output Detailed Results
    Write-Host "Detailed Test Results:" -ForegroundColor Cyan
    foreach ($result in $TEST_RESULTS) {
        Write-Host "`n$($result.TestName)" -ForegroundColor White
        Write-Host "  Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "PASSED") { "Green" } else { "Red" })
        Write-Host "  Method: $($result.Method)" -ForegroundColor Gray
        Write-Host "  Endpoint: $($result.Endpoint)" -ForegroundColor Gray
        Write-Host "  Message: $($result.Message)" -ForegroundColor Gray
    }
}

# Run Tests
Start-CRUDTests


