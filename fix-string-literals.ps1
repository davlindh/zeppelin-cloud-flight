# Fix broken string literals in marketplace page files

$files = @(
    "src/pages/marketplace/AuctionDetail.tsx",
    "src/pages/marketplace/ProductDetail.tsx",
    "src/pages/marketplace/ServiceDetail.tsx",
    "src/pages/marketplace/Services.tsx",
    "src/pages/marketplace/Shop.tsx"
)

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Fix useState('') that became useState(')
        $content = $content -replace "useState\(['\"]'\)", "useState('')"
        
        # Fix ?? '' that became ?? ')
        $content = $content -replace "\?\?\s+['\"]'\)", "?? ''"
        
        # Fix || '' that became || ')
        $content = $content -replace "\|\|\s+['\"]',", "|| '',"
        
        # Fix setSearchTerm('') that became setSearchTerm(')
        $content = $content -replace "setSearchTerm\(['\"]'\)", "setSearchTerm('')"
        
        # Fix any remaining broken empty strings
        $content = $content -replace "([=\(])\s*['\"]'\)", "`$1 ''"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "Fixed string literals in: $filePath"
        }
    }
}

Write-Host "`nString literal fixes completed!"
