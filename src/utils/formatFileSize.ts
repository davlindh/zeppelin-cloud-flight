/**
 * Format file size from bytes to human-readable string
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 KB';
  
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

/**
 * Calculate total size from array of media items
 */
export function calculateTotalSize(items: { file_size: number | null }[]): string {
  const totalBytes = items.reduce((sum, item) => sum + (item.file_size || 0), 0);
  return formatFileSize(totalBytes);
}
