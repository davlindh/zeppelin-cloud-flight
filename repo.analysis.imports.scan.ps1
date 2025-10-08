# Repository-Wide Import Analysis Scanner
# Scans ALL TypeScript/TSX files and catalogs import statements
# Output: JSON data file for further processing

Write-Host "=== Repository Import Scanner ===" -ForegroundColor Cyan
Write-Host "Scanning entire repository for import statements..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$scanPaths = @("src")
$outputDir = "analysis-output"
$outputFile = "$outputDir/repo.analysis.imports.raw-data.json"

# Create output directory
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory: $outputDir" -ForegroundColor Green
}

# Data structure
$importData = @{
    scanDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    totalFiles = 0
    totalImports = 0
    files = @()
    importPatterns = @{}
    pathFrequency = @{}
}

# Get all TypeScript/TSX files
Write-Host "Finding TypeScript files..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $scanPaths -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue

Write-Host "Found $($files.Count) files to scan" -ForegroundColor Green
Write-Host ""

$fileCount = 0
foreach ($file in $files) {
    $fileCount++
    $relativePath = $file.FullName.Replace($PWD.Path + "\", "").Replace("\", "/")
    
    Write-Progress -Activity "Scanning files" -Status "$fileCount of $($files.Count)" -PercentComplete (($fileCount / $files.Count) * 100)
    
    $lines = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if (-not $lines) { continue }
    
    $fileImports = @()
    $lineNum = 0
    
    foreach ($line in $lines) {
        $lineNum++
        
        # Simple pattern matching for imports
        if ($line -match "import .+ from") {
            # Extract the path between quotes
            if ($line -match "from\s+['""]([^'""]+)['""]") {
                $importPath = $matches[1]
                
                $importInfo = @{
                    path = $importPath
                    line = $lineNum
                    fullStatement = $line.Trim()
                }
                
                $fileImports += $importInfo
                $importData.totalImports++
                
                # Track path frequency
                if ($importData.pathFrequency.ContainsKey($importPath)) {
                    $importData.pathFrequency[$importPath]++
                } else {
                    $importData.pathFrequency[$importPath] = 1
                }
                
                # Categorize import pattern
                $category = "external"
                if ($importPath -match "^@/components/") { $category = "components" }
                elseif ($importPath -match "^@/hooks/") { $category = "hooks" }
                elseif ($importPath -match "^@/utils/") { $category = "utils" }
                elseif ($importPath -match "^@/contexts/") { $category = "contexts" }
                elseif ($importPath -match "^@/types/") { $category = "types" }
                elseif ($importPath -match "^@/lib/") { $category = "lib" }
                elseif ($importPath -match "^@/pages/") { $category = "pages" }
                elseif ($importPath -match "^@/schemas/") { $category = "schemas" }
                elseif ($importPath -match "^\.") { $category = "relative" }
                
                if (-not $importData.importPatterns.ContainsKey($category)) {
                    $importData.importPatterns[$category] = 0
                }
                $importData.importPatterns[$category]++
            }
        }
    }
    
    if ($fileImports.Count -gt 0) {
        $importData.files += @{
            path = $relativePath
            imports = $fileImports
            importCount = $fileImports.Count
        }
        
        $importData.totalFiles++
    }
}

Write-Progress -Activity "Scanning files" -Completed

Write-Host ""
Write-Host "=== Scan Complete ===" -ForegroundColor Cyan
Write-Host "Files scanned: $($importData.totalFiles)" -ForegroundColor Green
Write-Host "Total imports found: $($importData.totalImports)" -ForegroundColor Green
Write-Host ""
Write-Host "Import Categories:" -ForegroundColor Yellow
$sortedKeys = $importData.importPatterns.Keys | Sort-Object
foreach ($category in $sortedKeys) {
    $count = $importData.importPatterns[$category]
    Write-Host "  $category : $count" -ForegroundColor White
}
Write-Host ""

# Save to JSON
Write-Host "Saving data to: $outputFile" -ForegroundColor Yellow
$importData | ConvertTo-Json -Depth 10 | Set-Content $outputFile

Write-Host ""
Write-Host "SUCCESS - Analysis data saved!" -ForegroundColor Green
Write-Host "Run repo.analysis.imports.report.ps1 to generate report" -ForegroundColor Cyan
