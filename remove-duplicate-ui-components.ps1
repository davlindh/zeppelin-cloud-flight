# Remove duplicate shadcn components from marketplace/ui
# These components exist in the standard ui/ folder and should be imported from there

Write-Host "=== Removing Duplicate UI Components ===" -ForegroundColor Cyan
Write-Host ""

$marketplaceUiPath = "src/components/marketplace/ui"

# List of duplicate shadcn components to remove
$duplicatesToRemove = @(
    "accordion.tsx",
    "alert.tsx",
    "alert-dialog.tsx",
    "aspect-ratio.tsx",
    "avatar.tsx",
    "badge.tsx",
    "breadcrumb.tsx",
    "button.tsx",
    "calendar.tsx",
    "card.tsx",
    "carousel.tsx",
    "chart.tsx",
    "checkbox.tsx",
    "collapsible.tsx",
    "command.tsx",
    "context-menu.tsx",
    "dialog.tsx",
    "drawer.tsx",
    "dropdown-menu.tsx",
    "form.tsx",
    "hover-card.tsx",
    "input.tsx",
    "input-otp.tsx",
    "label.tsx",
    "menubar.tsx",
    "navigation-menu.tsx",
    "pagination.tsx",
    "popover.tsx",
    "progress.tsx",
    "radio-group.tsx",
    "resizable.tsx",
    "scroll-area.tsx",
    "select.tsx",
    "separator.tsx",
    "sheet.tsx",
    "sidebar.tsx",
    "skeleton.tsx",
    "slider.tsx",
    "sonner.tsx",
    "switch.tsx",
    "table.tsx",
    "tabs.tsx",
    "textarea.tsx",
    "toast.tsx",
    "toaster.tsx",
    "toggle.tsx",
    "toggle-group.tsx",
    "tooltip.tsx",
    "use-toast.ts"
)

$removed = 0
$notFound = 0

foreach ($file in $duplicatesToRemove) {
    $filePath = Join-Path $marketplaceUiPath $file
    
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "Removed: $file" -ForegroundColor Green
        $removed++
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
        $notFound++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Files removed: $removed" -ForegroundColor Green
Write-Host "Files not found: $notFound" -ForegroundColor Yellow
Write-Host ""
Write-Host "Marketplace UI now contains only marketplace-specific components!" -ForegroundColor Green
