# Fix remaining incorrect import paths that should point to marketplace

Write-Host "Fixing missing marketplace import paths..."

# Get all TypeScript/TSX files in marketplace components
$files = Get-ChildItem -Path "src/components/marketplace" -Recurse -Include *.tsx,*.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    # Fix utility imports
    if ($content -match "@/utils/auctionUtils") {
        $content = $content -replace "@/utils/auctionUtils", "@/utils/marketplace/auctionUtils"
        $changed = $true
        Write-Host "  Fixed auctionUtils import in: $($file.Name)"
    }
    
    if ($content -match "@/utils/imageUtils") {
        $content = $content -replace "@/utils/imageUtils", "@/utils/marketplace/imageUtils"
        $changed = $true
        Write-Host "  Fixed imageUtils import in: $($file.Name)"
    }
    
    # Fix component imports
    if ($content -match "@/components/ui/enhanced-auction-card") {
        $content = $content -replace "@/components/ui/enhanced-auction-card", "@/components/marketplace/ui/enhanced-auction-card"
        $changed = $true
        Write-Host "  Fixed enhanced-auction-card import in: $($file.Name)"
    }
    
    if ($content -match "@/components/ui/auction-skeleton") {
        $content = $content -replace "@/components/ui/auction-skeleton", "@/components/marketplace/ui/auction-skeleton"
        $changed = $true
        Write-Host "  Fixed auction-skeleton import in: $($file.Name)"
    }
    
    if ($content -match "@/components/ui/product-skeleton") {
        $content = $content -replace "@/components/ui/product-skeleton", "@/components/marketplace/ui/product-skeleton"
        $changed = $true
        Write-Host "  Fixed product-skeleton import in: $($file.Name)"
    }
    
    if ($content -match "@/components/ui/service-loading") {
        $content = $content -replace "@/components/ui/service-loading", "@/components/marketplace/ui/service-loading"
        $changed = $true
        Write-Host "  Fixed service-loading import in: $($file.Name)"
    }
    
    if ($content -match "@/components/ui/service-error") {
        $content = $content -replace "@/components/ui/service-error", "@/components/marketplace/ui/service-error"
        $changed = $true
        Write-Host "  Fixed service-error import in: $($file.Name)"
    }
    
    if ($content -match "@/components/ui/enhanced-product-card") {
        $content = $content -replace "@/components/ui/enhanced-product-card", "@/components/marketplace/ui/enhanced-product-card"
        $changed = $true
        Write-Host "  Fixed enhanced-product-card import in: $($file.Name)"
    }
    
    if ($changed) {
        Set-Content $file.FullName -Value $content -NoNewline
    }
}

Write-Host "`nDone! All marketplace imports fixed."
