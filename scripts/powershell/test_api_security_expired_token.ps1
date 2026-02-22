# API Security Test Script - Expired Token
# Test access to protected API endpoints with expired token

$baseUrl = "http://localhost:8080"
$expiredToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTYwMDAwMDAwMH0.invalid.signature"
$results = @()

# Define API endpoints to test
$endpoints = @(
    # InventoryController
    @{Path="/api/inventory/device/warehouse-list"; Method="GET"; Description="Get device warehouse list"},
    @{Path="/api/inventory/device/detail/1"; Method="GET"; Description="Get device detail"},
    @{Path="/api/inventory/warehouse/list"; Method="GET"; Description="Get warehouse list"},
    @{Path="/api/inventory/statistics"; Method="GET"; Description="Get inventory statistics"}
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Security Test - Expired Token" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($endpoint in $endpoints) {
    $url = $baseUrl + $endpoint.Path
    $method = $endpoint.Method
    $description = $endpoint.Description

    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Authorization" = $expiredToken
        }
        
        $response = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -UseBasicParsing -ErrorAction Stop
        
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
    Write-Host "Security Vulnerabilities Found! Expired Token Not Rejected:" -ForegroundColor Red
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
$reportFile = "api_security_test_expired_token_$timestamp.txt"

$results | Format-Table -AutoSize | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "Detailed report saved to: $reportFile" -ForegroundColor Cyan
