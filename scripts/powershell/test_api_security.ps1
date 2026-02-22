# API Security Test Script
# Test access to protected API endpoints without authentication

$baseUrl = "http://localhost:8080"
$results = @()

# Define API endpoints to test
$endpoints = @(
    # InventoryController
    @{Path="/api/inventory/device/warehouse-list"; Method="GET"; Description="Get device warehouse list"},
    @{Path="/api/inventory/device/detail/1"; Method="GET"; Description="Get device detail"},
    @{Path="/api/inventory/device/distribution/1"; Method="GET"; Description="Get device distribution"},
    @{Path="/api/inventory/device/alerts"; Method="GET"; Description="Get device alerts"},
    @{Path="/api/inventory/warehouse/list"; Method="GET"; Description="Get warehouse list"},
    @{Path="/api/inventory/warehouse/detail/1"; Method="GET"; Description="Get warehouse detail"},
    @{Path="/api/inventory/statistics"; Method="GET"; Description="Get inventory statistics"},

    # DashboardController
    @{Path="/dashboard/overview"; Method="GET"; Description="Get dashboard overview"},
    @{Path="/dashboard/activity"; Method="GET"; Description="Get dashboard activity"},

    # UserController
    @{Path="/users"; Method="GET"; Description="Get user list"},
    @{Path="/users/1"; Method="GET"; Description="Get user detail"},
    @{Path="/users/roles"; Method="GET"; Description="Get role list"},

    # DeviceTypeController
    @{Path="/device-types"; Method="GET"; Description="Get device type list"},
    @{Path="/device-types/1"; Method="GET"; Description="Get device type detail"},
    @{Path="/device-types/tree"; Method="GET"; Description="Get device type tree"},
    @{Path="/device-types/summary"; Method="GET"; Description="Get device type summary"},

    # DeviceController
    @{Path="/devices"; Method="GET"; Description="Get device list"},
    @{Path="/devices/1"; Method="GET"; Description="Get device detail"},
    @{Path="/devices/code/DEV001"; Method="GET"; Description="Get device by code"},
    @{Path="/devices/status/in_stock"; Method="GET"; Description="Get devices by status"},
    @{Path="/devices/types"; Method="GET"; Description="Get device types"},
    @{Path="/devices/locations"; Method="GET"; Description="Get device locations"},
    @{Path="/devices/stats/status"; Method="GET"; Description="Get device status stats"},
    @{Path="/devices/status"; Method="GET"; Description="Get device status list"},
    @{Path="/devices/all"; Method="GET"; Description="Get all devices"},

    # AreaController
    @{Path="/areas"; Method="GET"; Description="Get area list"},
    @{Path="/areas/1"; Method="GET"; Description="Get area detail"},
    @{Path="/areas/tree"; Method="GET"; Description="Get area tree"},

    # StockOrderController
    @{Path="/stock/orders"; Method="GET"; Description="Get stock orders"},
    @{Path="/stock/orders/1"; Method="GET"; Description="Get stock order detail"},

    # LogController
    @{Path="/logs"; Method="GET"; Description="Get log list"},
    @{Path="/logs/1"; Method="GET"; Description="Get log detail"},

    # DeviceBatchController
    @{Path="/device-batch"; Method="GET"; Description="Get device batch list"},
    @{Path="/device-batch/1"; Method="GET"; Description="Get device batch detail"},

    # RoleController
    @{Path="/roles"; Method="GET"; Description="Get role list"},
    @{Path="/roles/1"; Method="GET"; Description="Get role detail"},

    # MaintenanceController
    @{Path="/maintenance"; Method="GET"; Description="Get maintenance list"},
    @{Path="/maintenance/1"; Method="GET"; Description="Get maintenance detail"},

    # DeviceStatisticsController
    @{Path="/devices/statistics"; Method="GET"; Description="Get device statistics"},

    # InstallationController
    @{Path="/installation-records"; Method="GET"; Description="Get installation records"},
    @{Path="/installation-records/1"; Method="GET"; Description="Get installation record detail"},

    # RemoteAccountController
    @{Path="/remote-accounts"; Method="GET"; Description="Get remote accounts"},
    @{Path="/remote-accounts/1"; Method="GET"; Description="Get remote account detail"}
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Security Test - Unauthenticated Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($endpoint in $endpoints) {
    $url = $baseUrl + $endpoint.Path
    $method = $endpoint.Method
    $description = $endpoint.Description

    try {
        $response = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing -ErrorAction Stop
        
        $status = "FAIL"
        $statusCode = $response.StatusCode
        $message = "Not protected! Status code: $statusCode"
        
        Write-Host "[$status] $method $url" -ForegroundColor Red
        Write-Host "    Description: $description" -ForegroundColor Red
        Write-Host "    Issue: $message" -ForegroundColor Red
        Write-Host ""
        
        $results += @{
            Endpoint = $endpoint.Path
            Method = $method
            Description = $description
            Status = "FAIL"
            StatusCode = $statusCode
            Message = $message
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            $status = "PASS"
            $message = "Correctly rejected, status code: $statusCode"
            
            Write-Host "[$status] $method $url" -ForegroundColor Green
            Write-Host "    Description: $description" -ForegroundColor Green
            Write-Host "    Result: $message" -ForegroundColor Green
            Write-Host ""
        }
        elseif ($statusCode -eq 404) {
            $status = "SKIP"
            $message = "Endpoint not found (404)"
            
            Write-Host "[$status] $method $url" -ForegroundColor Gray
            Write-Host "    Description: $description" -ForegroundColor Gray
            Write-Host "    Result: $message" -ForegroundColor Gray
            Write-Host ""
        }
        else {
            $status = "UNKNOWN"
            $message = "Unexpected status code: $statusCode"
            
            Write-Host "[$status] $method $url" -ForegroundColor Yellow
            Write-Host "    Description: $description" -ForegroundColor Yellow
            Write-Host "    Issue: $message" -ForegroundColor Yellow
            Write-Host ""
        }
        
        $results += @{
            Endpoint = $endpoint.Path
            Method = $method
            Description = $description
            Status = $status
            StatusCode = $statusCode
            Message = $message
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$skipCount = ($results | Where-Object { $_.Status -eq "SKIP" }).Count
$unknownCount = ($results | Where-Object { $_.Status -eq "UNKNOWN" }).Count
$totalCount = $results.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor Cyan
Write-Host "Passed (PASS): $passCount" -ForegroundColor Green
Write-Host "Failed (FAIL): $failCount" -ForegroundColor Red
Write-Host "Skipped (SKIP): $skipCount" -ForegroundColor Gray
Write-Host "Unknown (UNKNOWN): $unknownCount" -ForegroundColor Yellow
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Security Vulnerabilities Found! Unprotected Endpoints:" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    
    foreach ($result in $results | Where-Object { $_.Status -eq "FAIL" }) {
        Write-Host "Endpoint: $($result.Endpoint)" -ForegroundColor Red
        Write-Host "Method: $($result.Method)" -ForegroundColor Red
        Write-Host "Description: $($result.Description)" -ForegroundColor Red
        Write-Host "Status Code: $($result.StatusCode)" -ForegroundColor Red
        Write-Host ""
    }
}

# Save results to file
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportFile = "api_security_test_report_$timestamp.txt"

$results | Format-Table -AutoSize | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "Detailed report saved to: $reportFile" -ForegroundColor Cyan
