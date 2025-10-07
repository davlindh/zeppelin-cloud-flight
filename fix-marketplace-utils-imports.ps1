# Fix all marketplace hooks to use correct util paths

$files = @(
    "src/hooks/marketplace/useSecureSubmission.ts",
    "src/hooks/marketplace/useSecureBidding.ts",
    "src/hooks/marketplace/useProducts.ts",
    "src/hooks/marketplace/useNotificationPreferences.ts",
    "src/hooks/marketplace/useImageUpload.ts",
    "src/hooks/marketplace/useCustomerInfo.ts",
    "src/hooks/marketplace/useAdaptiveColors.ts",
    "src/hooks/marketplace/useServiceProviders.ts",
    "src/hooks/marketplace/useUnifiedSearch.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Replace util imports
        $content = $content -replace "from '@/utils/inputSanitization'", "from '@/utils/marketplace/inputSanitization'"
        $content = $content -replace "from '@/utils/transforms'", "from '@/utils/marketplace/transforms'"
        $content = $content -replace "from '@/utils/transforms/database'", "from '@/utils/marketplace/transforms/database'"
        $content = $content -replace "from '@/utils/imageManager'", "from '@/utils/marketplace/imageManager'"
        $content = $content -replace "from '@/utils/colorUtils'", "from '@/utils/marketplace/colorUtils'"
        $content = $content -replace "from '@/utils/imageUtils'", "from '@/utils/marketplace/imageUtils'"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "`nAll marketplace util imports fixed!"
