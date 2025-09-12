/**
 * Shared file validation utilities used across different upload components
 */

export interface FileValidationOptions {
  maxSizeMB?: number;
  acceptedTypes?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a file based on type and size constraints
 */
export const validateFile = (
  file: File, 
  options: FileValidationOptions = {}
): FileValidationResult => {
  const { maxSizeMB = 10, acceptedTypes = "*/*" } = options;
  
  // Validate file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  // Validate file type
  if (!validateFileType(file, acceptedTypes)) {
    const typesList = acceptedTypes.split(',').map(t => t.trim()).join(', ');
    return {
      isValid: false,
      error: `File type not supported. Expected: ${typesList}`
    };
  }

  return { isValid: true };
};

/**
 * Validates file type against accepted types string
 */
export const validateFileType = (file: File, acceptedTypes: string): boolean => {
  if (acceptedTypes === "*/*") return true;
  
  const acceptedList = acceptedTypes.split(',').map(type => type.trim());
  const fileMimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  return acceptedList.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      // Handle file extensions
      return fileName.endsWith(acceptedType.toLowerCase());
    } else if (acceptedType.includes('/*')) {
      // Handle wildcard MIME types (e.g., "image/*", "video/*")
      const baseType = acceptedType.split('/')[0];
      return fileMimeType.startsWith(baseType + '/');
    } else {
      // Handle exact MIME types
      return fileMimeType === acceptedType.toLowerCase();
    }
  });
};

/**
 * Formats file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generates unique file path for upload
 */
export const generateFilePath = (
  file: File, 
  folder: string = 'uploads'
): string => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  return `${folder}/${fileName}`;
};