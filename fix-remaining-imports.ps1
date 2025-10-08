# Fix all remaining marketplace import paths

Write-Host "Fixing remaining marketplace import paths..."

$importFixes = @{
    "@/components/ui/social-proof-badge" = "@/components/marketplace/ui/social-proof-badge"
    "@/components/ui/mobile-filter-sheet" = "@/components/marketplace/ui/mobile-filter-sheet"
    "@/hooks/useSocialProof" = "@/hooks/marketplace/useSocialProof"
    "@/hooks/useDynamicCategories" = "@/hooks/marketplace/useDynamicCategories"
    "@/hooks/useCategoryStats" = "@/hooks/marketplace/useCategoryStats"
    "@/hooks/useSearchHistory" = "@/hooks/marketplace/useSearchHistory"
    "@/utils/dynamicCategoryUtils" = "@/utils/marketplace/dynamicCategoryUtils"
    "@/contexts/ShopContext" = "@/contexts/marketplace/ShopContext"
}

# Get all marketplace files
$files = Get-ChildItem -Path "src/components/marketplace","src/pages/marketplace" -Recurse -Include *.tsx,*.ts -ErrorAction SilentlyContinue

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($old in $importFixes.Keys) {
        $new = $importFixes[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $changed = $true
            Write-Host "  Fixed: $old"
            Write-Host "    in: $($file.Name)"
        }
    }
    
    if ($changed) {
        Set-Content $file.FullName -Value $content -NoNewline
        $totalFixed++
    }
}

Write-Host "`nDone! Fixed $totalFixed files."
Write-Host "`nRemaining issues to address manually:"
Write-Host "  1. Install missing dependencies: npm install react-big-calendar moment"
Write-Host "  2. Fix React Hooks violations in:"
Write-Host "     - src/components/layout/Breadcrumbs.tsx (line 29)"
Write-Host "     - src/components/marketplace/services/ServiceBookingCard.tsx (line 229)"
Write-Host "  3. unicorn/consistent-function-scoping warnings can be addressed by hoisting helper functions"
