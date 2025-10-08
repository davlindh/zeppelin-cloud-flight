# Fix the final remaining marketplace import paths

Write-Host "Fixing final marketplace import paths..."

$fixes = @{
    "src/components/marketplace/services/ServicesSection.tsx" = @{
        "@/components/ui/unified-service-card" = "@/components/marketplace/ui/unified-service-card"
        "@/hooks/useServices" = "@/hooks/marketplace/useServices"
    }
    "src/components/marketplace/services/ServiceBookingCard.tsx" = @{
        "@/hooks/useAvailableTimes" = "@/hooks/marketplace/useAvailableTimes"
        "@/schemas/booking.schema" = "@/schemas/marketplace/booking.schema"
    }
    "src/components/marketplace/services/booking/ContactInformation.tsx" = @{
        "@/utils/typeGuards" = "@/utils/marketplace/typeGuards"
    }
}

$totalFixed = 0

foreach ($filePath in $fixes.Keys) {
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $changed = $false
        
        foreach ($old in $fixes[$filePath].Keys) {
            $new = $fixes[$filePath][$old]
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $new
                $changed = $true
                Write-Host "  Fixed: $old -> $new"
                Write-Host "    in: $filePath"
            }
        }
        
        if ($changed) {
            Set-Content $filePath -Value $content -NoNewline
            $totalFixed++
        }
    } else {
        Write-Host "  Warning: File not found: $filePath"
    }
}

Write-Host "`nDone! Fixed $totalFixed files."
