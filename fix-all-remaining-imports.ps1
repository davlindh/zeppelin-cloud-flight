# Final comprehensive script to fix ALL remaining marketplace import issues

Write-Host "=== Final Comprehensive Import Fix ===" -ForegroundColor Cyan
Write-Host ""

$allFixes = @{
    # Context imports
    "@/contexts/WishlistContext" = "@/contexts/marketplace/WishlistContext"
    "@/contexts/CartContext" = "@/contexts/marketplace/CartProvider"
    "@/contexts/ShopContext" = "@/contexts/marketplace/ShopContext"
    
    # Hook imports that might still be wrong
    "@/hooks/useAuctions" = "@/hooks/marketplace/useAuctions"
    "@/hooks/useDynamicCategories" = "@/hooks/marketplace/useDynamicCategories"
}

$files = Get-ChildItem -Path "src/hooks/marketplace","src/components/marketplace","src/pages/marketplace","src/utils/marketplace" -Recurse -Include *.tsx,*.ts -ErrorAction SilentlyContinue

$totalFixed = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($old in $allFixes.Keys) {
        $new = $allFixes[$old]
        
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
Write-Host "Imports fixed: $totalFixed" -ForegroundColor Green
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host ""
Write-Host "All marketplace imports should now be correct!" -ForegroundColor Green
