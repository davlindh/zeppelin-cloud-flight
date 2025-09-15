import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript support
 * Handles JSON serialization/deserialization and error handling
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing boolean localStorage values
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useLocalStorage(key, initialValue);

  const toggle = useCallback(() => {
    setValue(!value);
  }, [value, setValue]);

  const setTrue = useCallback(() => {
    setValue(true);
  }, [setValue]);

  const setFalse = useCallback(() => {
    setValue(false);
  }, [setValue]);

  return [value, toggle, setTrue, setFalse];
}

/**
 * Hook for managing form data in localStorage
 */
export function useFormStorage<T extends Record<string, unknown>>(
  formKey: string,
  initialData: T
): [T, (data: Partial<T>) => void, () => void] {
  const [data, setData] = useLocalStorage(formKey, initialData);

  const updateData = useCallback(
    (updates: Partial<T>) => {
      setData((prev) => ({ ...prev, ...updates }));
    },
    [setData]
  );

  const resetData = useCallback(() => {
    setData(initialData);
  }, [setData, initialData]);

  return [data, updateData, resetData];
}
