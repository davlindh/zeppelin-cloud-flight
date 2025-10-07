# Enhanced PowerShell script to fix import paths in marketplace files

$marketplacePaths = @(
    "src/components/marketplace",
    "src/pages/marketplace",
    "src/hooks/marketplace",
    "src/utils/marketplace",
    "src/types/marketplace",
    "src/schemas/marketplace",
    "src/contexts/marketplace"
)

$fixCount = 0

foreach ($basePath in $marketplacePaths) {
    if (Test-Path $basePath) {
        Get-ChildItem -Path $basePath -Recurse -Include *.tsx,*.ts | ForEach-Object {
            $file = $_
            $content = Get-Content $file.FullName -Raw
            $originalContent = $content
            
            # Fix imports with double quotes (with extra quotes issue)
            $content = $content -replace "from\s+['""]'hooks/", "from '@/hooks/marketplace/"
            $content = $content -replace "from\s+['""]'utils/", "from '@/utils/marketplace/"
            $content = $content -replace "from\s+['""]'types/", "from '@/types/marketplace/"
            $content = $content -replace "from\s+['""]'schemas/", "from '@/schemas/marketplace/"
            $content = $content -replace "from\s+['""]'integrations/supabase", "from '@/integrations/supabase"
            $content = $content -replace "from\s+['""]'lib/utils", "from '@/lib/utils"
            
            # Fix normal single-quoted imports
            $content = $content -replace "from\s+'hooks/", "from '@/hooks/marketplace/"
            $content = $content -replace "from\s+'utils/", "from '@/utils/marketplace/"
            $content = $content -replace "from\s+'types/", "from '@/types/marketplace/"
            $content = $content -replace "from\s+'schemas/", "from '@/schemas/marketplace/"
            $content = $content -replace "from\s+'integrations/supabase", "from '@/integrations/supabase"
            $content = $content -replace "from\s+'lib/utils", "from '@/lib/utils"
            
            # Fix double-quoted imports
            $content = $content -replace 'from\s+"hooks/', 'from "@/hooks/marketplace/'
            $content = $content -replace 'from\s+"utils/', 'from "@/utils/marketplace/'
            $content = $content -replace 'from\s+"types/', 'from "@/types/marketplace/'
            $content = $content -replace 'from\s+"schemas/', 'from "@/schemas/marketplace/'
            $content = $content -replace 'from\s+"integrations/supabase', 'from "@/integrations/supabase'
            $content = $content -replace 'from\s+"lib/utils', 'from "@/lib/utils'
            
            # Fix context imports
            $content = $content -replace "from\s+['""]'?contexts/CartContext", "from '@/contexts/marketplace/CartContext"
            $content = $content -replace "from\s+['""]'?contexts/WishlistContext", "from '@/contexts/marketplace/WishlistContext"
            $content = $content -replace "from\s+['""]'?contexts/ShopContext", "from '@/contexts/marketplace/ShopContext"
            $content = $content -replace "from\s+['""]'?contexts/NotificationContext", "from '@/contexts/marketplace/NotificationContext"
            $content = $content -replace "from\s+['""]'?contexts/ThemeContext", "from '@/contexts/marketplace/ThemeContext"
            $content = $content -replace "from\s+['""]'?contexts/DensityContext", "from '@/contexts/marketplace/DensityContext"
            $content = $content -replace "from\s+['""]'?contexts/WatchListContext", "from '@/contexts/marketplace/WatchListContext"
            
            # Fix component imports
            $content = $content -replace "from\s+['""]'?components/ui/", "from '@/components/marketplace/ui/"
            $content = $content -replace "from\s+['""]'?components/security/", "from '@/components/marketplace/security/"
            $content = $content -replace "from\s+['""]'?components/communication/", "from '@/components/marketplace/communication/"
            $content = $content -replace "from\s+['""]'?components/cart/", "from '@/components/marketplace/cart/"
            $content = $content -replace "from\s+['""]'?components/reviews/", "from '@/components/marketplace/reviews/"
            $content = $content -replace "from\s+['""]'?components/auctions/", "from '@/components/marketplace/auctions/"
            $content = $content -replace "from\s+['""]'?components/shop/", "from '@/components/marketplace/shop/"
            $content = $content -replace "from\s+['""]'?components/services/", "from '@/components/marketplace/services/"
            
            # Clean up any double quotes at the end
            $content = $content -replace "'([^']+)''", "'`$1'"
            $content = $content -replace '"([^"]+)""', '"`$1"'
            
            # Save if changed
            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                Write-Host "Fixed imports in: $($file.FullName)"
                $fixCount++
            }
        }
    }
}

Write-Host "`nFixed $fixCount files!"
Write-Host "Import path fixes completed!"
