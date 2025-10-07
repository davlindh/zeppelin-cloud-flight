# Fix all corrupted ternary operators with missing closing quote

$files = @(
    "src/components/marketplace/shop/QuickViewModal.tsx",
    "src/components/marketplace/shop/ProductVariantSelector.tsx",
    "src/components/marketplace/shop/MobileFilterBar.tsx",
    "src/components/marketplace/auctions/GuestBidDialog.tsx",
    "src/components/marketplace/auctions/BidSection.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Fix corrupted ternary patterns with missing closing quote before }
        $content = $content -replace "(\? '[^']*' : )'}", "`$1''}"
        $content = $content -replace "(\? '[^']*' : ')``", "`$1''"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "`nAll corrupted ternary operators fixed!"
