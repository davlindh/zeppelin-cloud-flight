# Audit UI Components - Identify duplicates and marketplace-specific files

Write-Host "=== UI Component Audit ===" -ForegroundColor Cyan
Write-Host ""

$standardUiPath = "src/components/ui"
$marketplaceUiPath = "src/components/marketplace/ui"

# Get all files from both directories
$standardFiles = Get-ChildItem -Path $standardUiPath -File | Select-Object -ExpandProperty Name
$marketplaceFiles = Get-ChildItem -Path $marketplaceUiPath -File | Select-Object -ExpandProperty Name

# Identify duplicates (files that exist in both locations)
$duplicates = $marketplaceFiles | Where-Object { $standardFiles -contains $_ }

# Identify marketplace-specific files
$marketplaceSpecific = $marketplaceFiles | Where-Object { $standardFiles -notcontains $_ }

Write-Host "DUPLICATE FILES (exist in both locations):" -ForegroundColor Yellow
Write-Host "Total: $($duplicates.Count)" -ForegroundColor Yellow
$duplicates | Sort-Object | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }

Write-Host ""
Write-Host "MARKETPLACE-SPECIFIC FILES (unique to marketplace):" -ForegroundColor Green
Write-Host "Total: $($marketplaceSpecific.Count)" -ForegroundColor Green
$marketplaceSpecific | Sort-Object | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Standard UI components: $($standardFiles.Count)"
Write-Host "Marketplace UI components: $($marketplaceFiles.Count)"
Write-Host "Duplicates to remove: $($duplicates.Count)"
Write-Host "Marketplace-specific to keep: $($marketplaceSpecific.Count)"

# Save duplicate list for cleanup script
$duplicates | Out-File -FilePath "duplicates-to-remove.txt"
Write-Host ""
Write-Host "Duplicate list saved to: duplicates-to-remove.txt" -ForegroundColor Cyan
