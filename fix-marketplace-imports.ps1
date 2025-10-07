# PowerShell script to fix import paths in marketplace files

$marketplacePaths = @(
    "src/components/marketplace",
    "src/pages/marketplace",
    "src/hooks/marketplace",
    "src/utils/marketplace",
    "src/types/marketplace",
    "src/schemas/marketplace",
    "src/contexts/marketplace"
)

foreach ($basePath in $marketplacePaths) {
    if (Test-Path $basePath) {
        Get-ChildItem -Path $basePath -Recurse -Include *.tsx,*.ts | ForEach-Object {
            $file = $_
            $content = Get-Content $file.FullName -Raw
            $originalContent = $content
            
            # Fix import paths
            $content = $content -replace "from ['""]hooks/", "from '@/hooks/marketplace/"
            $content = $content -replace "from ['""]utils/", "from '@/utils/marketplace/"
            $content = $content -replace "from ['""]types/", "from '@/types/marketplace/"
            $content = $content -replace "from ['""]schemas/", "from '@/schemas/marketplace/"
            $content = $content -replace "from ['""]contexts/CartContext", "from '@/contexts/marketplace/CartContext"
            $content = $content -replace "from ['""]contexts/WishlistContext", "from '@/contexts/marketplace/WishlistContext"
            $content = $content -replace "from ['""]contexts/ShopContext", "from '@/contexts/marketplace/ShopContext"
            $content = $content -replace "from ['""]contexts/NotificationContext", "from '@/contexts/marketplace/NotificationContext"
            $content = $content -replace "from ['""]contexts/ThemeContext", "from '@/contexts/marketplace/ThemeContext"
            $content = $content -replace "from ['""]contexts/DensityContext", "from '@/contexts/marketplace/DensityContext"
            $content = $content -replace "from ['""]contexts/WatchListContext", "from '@/contexts/marketplace/WatchListContext"
            $content = $content -replace "from ['""]components/ui/", "from '@/components/marketplace/ui/"
            $content = $content -replace "from ['""]components/security/", "from '@/components/marketplace/security/"
            $content = $content -replace "from ['""]components/communication/", "from '@/components/marketplace/communication/"
            $content = $content -replace "from ['""]components/cart/", "from '@/components/marketplace/cart/"
            $content = $content -replace "from ['""]components/reviews/", "from '@/components/marketplace/reviews/"
            $content = $content -replace "from ['""]components/auctions/", "from '@/components/marketplace/auctions/"
            $content = $content -replace "from ['""]components/shop/", "from '@/components/marketplace/shop/"
            $content = $content -replace "from ['""]components/services/", "from '@/components/marketplace/services/"
            
            # Fix integrations/supabase imports
            $content = $content -replace "from ['""]integrations/supabase", "from '@/integrations/supabase"
            $content = $content -replace "from ['""]lib/utils", "from '@/lib/utils"
            
            # Save if changed
            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                Write-Host "Fixed imports in: $($file.FullName)"
            }
        }
    }
}

Write-Host "`nImport path fixes completed!"
