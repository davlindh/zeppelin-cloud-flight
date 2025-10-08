# Fix all remaining utils imports that should use marketplace path

Write-Host "=== Fixing Final Utils Imports ===" -ForegroundColor Cyan
Write-Host ""

# Map of util imports that need marketplace path
$utilFixes = @{
    "@/utils/productUtils" = "@/utils/marketplace/productUtils"
    "@/utils/colorUtils" = "@/utils/marketplace/colorUtils"
    "@/utils/errorReporting" = "@/utils/marketplace/errorReporting"
}

# Get all marketplace files
$files = Get-ChildItem -Path "src/components/marketplace","src/pages/marketplace" -Recurse -Include *.tsx,*.ts -ErrorAction SilentlyContinue

$totalFixed = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($old in $utilFixes.Keys) {
        $new = $utilFixes[$old]
        
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $changed = $true
            $totalFixed++
            Write-Host "  Fixed: $old in $($file.Name)" -ForegroundColor Green
        }
    }
    
    if ($changed) {
        Set-Content $file.FullName -Value $content -NoNewline
        $filesModified++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Utils imports fixed: $totalFixed" -ForegroundColor Green
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host ""
Write-Host "All marketplace utils imports now use correct paths!" -ForegroundColor Green
