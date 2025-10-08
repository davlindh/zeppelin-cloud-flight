# Fix imports for marketplace-specific UI components
# These components ONLY exist in marketplace/ui and should be imported from there

Write-Host "=== Fixing Marketplace-Specific Component Imports ===" -ForegroundColor Cyan
Write-Host ""

# List of marketplace-specific components (not in standard ui/)
$marketplaceSpecificComponents = @(
    "advanced-layout",
    "async-error-boundary",
    "auction-card",
    "auction-skeleton",
    "back-to-top",
    "category-personality-badge",
    "enhanced-auction-card",
    "enhanced-breadcrumb",
    "enhanced-button",
    "enhanced-loading-states",
    "enhanced-product-card",
    "enhanced-typography",
    "error-boundary",
    "error-fallback",
    "floating-action-buttons",
    "interactive-link",
    "lightbox-modal",
    "loading-grid",
    "mobile-filter-sheet",
    "mobile-image-swiper",
    "notification-preferences",
    "page-header",
    "product-image-zoom",
    "product-skeleton",
    "quick-actions-overlay",
    "responsive-card-grid",
    "search-filter-bar",
    "select-with-optional",
    "service-error",
    "service-loading",
    "service-skeleton",
    "social-proof-badge",
    "social-proof-notifications",
    "status-indicator",
    "stock-urgency-indicator",
    "theme-customizer",
    "theme-provider",
    "theme-switcher",
    "unified-product-card",
    "unified-service-card"
)

# Get all marketplace TypeScript/TSX files
$files = Get-ChildItem -Path "src/components/marketplace","src/pages/marketplace" -Recurse -Include *.tsx,*.ts -ErrorAction SilentlyContinue

$totalFixed = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changed = $false
    
    foreach ($component in $marketplaceSpecificComponents) {
        $oldImport = "@/components/ui/$component"
        $newImport = "@/components/marketplace/ui/$component"
        
        if ($content -match [regex]::Escape($oldImport)) {
            $content = $content -replace [regex]::Escape($oldImport), $newImport
            $changed = $true
            $totalFixed++
            Write-Host "  Fixed: $component in $($file.Name)" -ForegroundColor Green
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
Write-Host "All marketplace-specific component imports now point to marketplace/ui!" -ForegroundColor Green
