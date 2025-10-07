/**
 * Utility functions for rendering submission content
 * Moved from component to reduce complexity and improve reusability
 */

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return '🟢';
    case 'rejected':
      return '🔴';
    default:
      return '🟡';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  }
};

export const getTypeColor = (type: string) => {
  const colors = {
    project: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    participant: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    media: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    collaboration: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    feedback: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
    suggestion: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export const getTypeLabel = (type: string) => {
  const labels = {
    project: 'Projektförslag',
    participant: 'Deltagare',
    media: 'Media',
    collaboration: 'Samarbete',
    feedback: 'Feedback',
    suggestion: 'Förslag',
  };
  return labels[type as keyof typeof labels] || type;
};

/**
 * Check if submission has files
 */
export const hasFiles = (submission: any): boolean => {
  if (!submission.files) return false;
  
  // Handle both array and object formats
  if (Array.isArray(submission.files)) {
    return submission.files.length > 0;
  }
  
  // For object format (file_0, file_1, etc.)
  if (typeof submission.files === 'object') {
    const fileValues = Object.values(submission.files);
    return fileValues.some((f: any) => f && typeof f === 'object' && 'url' in f);
  }
  
  return false;
};

/**
 * Get file count from submission
 */
export const getFileCount = (submission: any): number => {
  if (!submission.files) return 0;
  
  // Handle both array and object formats
  if (Array.isArray(submission.files)) {
    return submission.files.length;
  }
  
  // For object format (file_0, file_1, etc.)
  if (typeof submission.files === 'object') {
    const fileValues = Object.values(submission.files);
    return fileValues.filter((f: any) => f && typeof f === 'object' && 'url' in f).length;
  }
  
  return 0;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
