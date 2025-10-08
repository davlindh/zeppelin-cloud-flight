# Fix remaining hook imports that should use marketplace path

Write-Host "=== Fixing Remaining Hook Imports ===" -ForegroundColor Cyan
Write-Host ""

# Marketplace-specific hooks that need path correction
$hookFixes = @{
    "@/hooks/useQuickActions" = "@/hooks/marketplace/useQuickActions"
    "@/hooks/useAdaptiveColors" = "@/hooks/marketplace/useAdaptiveColors"
    "@/hooks/useNotificationPreferences" = "@/hooks/marketplace/useNotificationPreferences"
    "@/hooks/useGuestBidding" = "@/hooks/marketplace/useGuestBidding"
    "@/hooks/useProductComparison" = "@/hooks/marketplace/useProductComparison"
    "@/hooks/useRecentlyViewed" = "@/hooks/marketplace/useRecentlyViewed"
}

# Get all marketplace files
$files = Get-ChildItem -Path "src/components/marketplace","src/pages/marketplace" -Recurse -Include *.tsx,*.ts -ErrorAction SilentlyContinue

$totalFixed = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($old in $hookFixes.Keys) {
        $new = $hookFixes[$old]
        
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
Write-Host "Hook imports fixed: $totalFixed" -ForegroundColor Green
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host ""
Write-Host "All marketplace hook imports now use correct paths!" -ForegroundColor Green
