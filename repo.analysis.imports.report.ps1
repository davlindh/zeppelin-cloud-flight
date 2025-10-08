# Repository Import Analysis Report Generator
# Processes raw scan data and generates comprehensive report
# Input: repo.analysis.imports.raw-data.json
# Output: Markdown report with actionable insights

Write-Host "=== Repository Import Report Generator ===" -ForegroundColor Cyan
Write-Host ""

$inputFile = "analysis-output/repo.analysis.imports.raw-data.json"
$outputFile = "analysis-output/repo.analysis.imports.report.md"

# Check if input file exists
if (-not (Test-Path $inputFile)) {
    Write-Host "ERROR: Raw data file not found!" -ForegroundColor Red
    Write-Host "Please run 'repo.analysis.imports.scan.ps1' first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Loading scan data..." -ForegroundColor Yellow
$data = Get-Content $inputFile -Raw | ConvertFrom-Json

Write-Host "Generating report..." -ForegroundColor Yellow
Write-Host ""

# Build report
$report = @"
# Repository Import Analysis Report

**Generated:** $($data.scanDate)  
**Total Files Scanned:** $($data.totalFiles)  
**Total Imports Found:** $($data.totalImports)

---

## Import Categories Overview

| Category | Count | Percentage |
|----------|-------|------------|
"@

# Add category statistics
$sortedCategories = $data.importPatterns.PSObject.Properties | Sort-Object Value -Descending
foreach ($cat in $sortedCategories) {
    $percentage = [math]::Round(($cat.Value / $data.totalImports) * 100, 1)
    $report += "| $($cat.Name) | $($cat.Value) | $percentage% |`n"
}

$report += @"

---

## Top 50 Most Frequently Used Imports

| Rank | Import Path | Usage Count | Category |
|------|-------------|-------------|----------|
"@

# Get top 50 imports by frequency
$topImports = $data.pathFrequency.PSObject.Properties | 
    Sort-Object Value -Descending | 
    Select-Object -First 50

$rank = 1
foreach ($import in $topImports) {
    $path = $import.Name
    $count = $import.Value
    
    # Determine category
    $category = "external"
    if ($path -match "^@/components/marketplace/") { $category = "marketplace-components" }
    elseif ($path -match "^@/components/") { $category = "components" }
    elseif ($path -match "^@/hooks/marketplace/") { $category = "marketplace-hooks" }
    elseif ($path -match "^@/hooks/") { $category = "hooks" }
    elseif ($path -match "^@/utils/marketplace/") { $category = "marketplace-utils" }
    elseif ($path -match "^@/utils/") { $category = "utils" }
    elseif ($path -match "^@/contexts/marketplace/") { $category = "marketplace-contexts" }
    elseif ($path -match "^@/contexts/") { $category = "contexts" }
    elseif ($path -match "^\.") { $category = "relative" }
    
    $report += "| $rank | ``$path`` | $count | $category |`n"
    $rank++
}

$report += @"

---

## Potential Issues Detected

### Missing 'marketplace/' in Paths

These imports might need 'marketplace/' added to their path:

"@

# Find potential marketplace imports without 'marketplace/' in path
$potentialIssues = @()
foreach ($import in $data.pathFrequency.PSObject.Properties) {
    $path = $import.Name
    
    # Check for auction/shop/service related imports without marketplace/
    if ($path -match "@/components/(auctions|shop|services|ui/(auction|product|service))" -and 
        $path -notmatch "marketplace") {
        $potentialIssues += @{
            path = $path
            count = $import.Value
            suggestion = $path -replace "@/components/", "@/components/marketplace/"
        }
    }
    
    if ($path -match "@/hooks/(use[A-Z][a-zA-Z]*)" -and 
        $path -notmatch "marketplace" -and
        $path -match "(Auction|Product|Service|Shop|Quick|Guest|Category|Wishlist)") {
        $potentialIssues += @{
            path = $path
            count = $import.Value
            suggestion = $path -replace "@/hooks/", "@/hooks/marketplace/"
        }
    }
    
    if ($path -match "@/utils/([a-z]+Utils)" -and 
        $path -notmatch "marketplace" -and
        $path -match "(auction|product|service|shop|category|image)") {
        $potentialIssues += @{
            path = $path
            count = $import.Value
            suggestion = $path -replace "@/utils/", "@/utils/marketplace/"
        }
    }
}

if ($potentialIssues.Count -gt 0) {
    $report += "| Current Path | Usage | Suggested Fix |`n"
    $report += "|--------------|-------|---------------|`n"
    
    $potentialIssues | Sort-Object { $_.count } -Descending | ForEach-Object {
        $report += "| ``$($_.path)`` | $($_.count) | ``$($_.suggestion)`` |`n"
    }
    
    Write-Host "⚠ Found $($potentialIssues.Count) potential issues" -ForegroundColor Yellow
} else {
    $report += "*No potential issues detected.*`n`n"
}

$report += @"

---

## Marketplace vs Non-Marketplace Breakdown

"@

# Count marketplace vs standard imports
$marketplaceCount = 0
$standardCount = 0

foreach ($import in $data.pathFrequency.PSObject.Properties) {
    if ($import.Name -match "/marketplace/") {
        $marketplaceCount += $import.Value
    } else {
        $standardCount += $import.Value
    }
}

$report += @"
- **Marketplace imports:** $marketplaceCount ($([math]::Round(($marketplaceCount / $data.totalImports) * 100, 1))%)
- **Standard imports:** $standardCount ($([math]::Round(($standardCount / $data.totalImports) * 100, 1))%)

---

## Recommendations

"@

if ($potentialIssues.Count -gt 0) {
    $report += @"
### Priority Fixes

1. **Review marketplace imports** - $($potentialIssues.Count) imports may need marketplace path prefix
2. **Run targeted fix scripts** for identified issues
3. **Test after fixes** to ensure no breaking changes

"@
} else {
    $report += @"
### Status

✅ All imports appear to follow correct patterns  
✅ No obvious path issues detected

"@
}

$report += @"

### Best Practices

- Use ``@/components/marketplace/`` for marketplace-specific components
- Use ``@/hooks/marketplace/`` for marketplace-specific hooks
- Use ``@/utils/marketplace/`` for marketplace-specific utilities
- Use ``@/contexts/marketplace/`` for marketplace-specific contexts
- Keep standard UI components in ``@/components/ui/``

---

*Report generated by repo.analysis.imports.report.ps1*
"@

# Save report
Set-Content -Path $outputFile -Value $report

Write-Host "✓ Report generated successfully!" -ForegroundColor Green
Write-Host "  Location: $outputFile" -ForegroundColor Cyan
Write-Host ""

if ($potentialIssues.Count -gt 0) {
    Write-Host "⚠ Action Required: $($potentialIssues.Count) potential issues found" -ForegroundColor Yellow
    Write-Host "  Review the report for details" -ForegroundColor White
} else {
    Write-Host "✓ No issues detected - imports look good!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Opening report..." -ForegroundColor Cyan
Start-Process $outputFile
