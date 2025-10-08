
import { validateBooleanState, ensureBoolean } from './typeGuards';

// Type-safe state updater for boolean values
export const createBooleanStateUpdater = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  fieldName: keyof T
) => {
  return (value: boolean): void => {
    const validatedValue = validateBooleanState(value, String(fieldName));
    setState(prev => ({ ...prev, [fieldName]: validatedValue }));
  };
};

// Type-safe state updater for string values
export const createStringStateUpdater = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  fieldName: keyof T
) => {
  return (value: string): void => {
    setState(prev => ({ ...prev, [fieldName]: value }));
  };
};

// Type-safe nested state updater
export const createNestedStateUpdater = <T, K extends keyof T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  parentField: K
) => {
  return (field: keyof T[K], value: T[K][keyof T[K]]): void => {
    setState(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };
};

// Boolean validation with error handling
export const safeBooleanUpdate = (
  value: unknown,
  fieldName: string,
  fallbackValue: boolean = false
): boolean => {
  try {
    return validateBooleanState(value, fieldName);
  } catch (error) {
    console.warn(`Boolean validation failed for ${fieldName}, using fallback:`, error);
    return fallbackValue;
  }
};

// State validation helpers
export const validateStateBoolean = (state: any, fieldName: string): boolean => {
  const value = state?.[fieldName];
  return ensureBoolean(value);
};

export const validateStateString = (state: any, fieldName: string): string => {
  const value = state?.[fieldName];
  return typeof value === 'string' ? value : '';
};
