# Fix all remaining imports that should point to marketplace directories

Write-Host "Fixing all remaining marketplace import paths..."

# Get all TypeScript/TSX files in marketplace
$files = Get-ChildItem -Path "src/components/marketplace","src/pages/marketplace" -Recurse -Include *.tsx,*.ts -ErrorAction SilentlyContinue

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    # Fix component imports
    $replacements = @{
        "@/components/ui/async-error-boundary" = "@/components/marketplace/ui/async-error-boundary"
        "@/components/security/SecurityNotice" = "@/components/marketplace/security/SecurityNotice"
        "@/components/communication/CommunicationTracker" = "@/components/marketplace/communication/CommunicationTracker"
    }
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $changed = $true
            Write-Host "  Fixed: $old in $($file.Name)"
        }
    }
    
    # Fix hook imports
    $hookReplacements = @{
        "@/hooks/useAuctions" = "@/hooks/marketplace/useAuctions"
        "@/hooks/useErrorHandler" = "@/hooks/marketplace/useErrorHandler"
        "@/hooks/useRealTimeBidding" = "@/hooks/marketplace/useRealTimeBidding"
        "@/hooks/useCountdown" = "@/hooks/marketplace/useCountdown"
        "@/hooks/useProducts" = "@/hooks/marketplace/useProducts"
        "@/hooks/useCommunicationTracking" = "@/hooks/marketplace/useCommunicationTracking"
        "@/hooks/useCustomerInfo" = "@/hooks/marketplace/useCustomerInfo"
        "@/hooks/useServiceProvider" = "@/hooks/marketplace/useServiceProvider"
        "@/hooks/useService([^s]|`$)" = "@/hooks/marketplace/useService`$1"
        "@/hooks/useAuthenticatedUser" = "@/hooks/marketplace/useAuthenticatedUser"
    }
    
    foreach ($old in $hookReplacements.Keys) {
        if ($content -match $old) {
            $content = $content -replace $old, $hookReplacements[$old]
            $changed = $true
            Write-Host "  Fixed hook: $old in $($file.Name)"
        }
    }
    
    # Fix context imports
    $contextReplacements = @{
        "@/contexts/WishlistContext" = "@/contexts/marketplace/WishlistContext"
        "from '@/contexts/CartContext'" = "from '@/contexts/marketplace/CartProvider'"
        'from "@/contexts/CartContext"' = 'from "@/contexts/marketplace/CartProvider"'
    }
    
    foreach ($old in $contextReplacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $contextReplacements[$old]
            $changed = $true
            Write-Host "  Fixed context: $old in $($file.Name)"
        }
    }
    
    # Fix type imports
    if ($content -match "@/types/communication([^/])") {
        $content = $content -replace "@/types/communication([^/])", "@/types/marketplace/communication`$1"
        $changed = $true
        Write-Host "  Fixed type import in: $($file.Name)"
    }
    
    if ($changed) {
        Set-Content $file.FullName -Value $content -NoNewline
        $totalFixed++
    }
}

Write-Host "`nDone! Fixed $totalFixed files."
