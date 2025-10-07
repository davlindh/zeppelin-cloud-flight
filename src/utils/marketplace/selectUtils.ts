/**
 * Utility functions for working with Select components and form data
 */

/**
 * Utility function to convert form data values back to proper types
 * for database storage. Converts the optional value back to null.
 * 
 * @param value - The form value to convert
 * @param optionalValue - The value that represents "no selection" (default: "none")
 * @returns Converted value (null if it matches optionalValue, otherwise the original value)
 */
export const convertOptionalSelectValue = (
  value: string | FormDataEntryValue | null, 
  optionalValue: string = "none"
): string | null => {
  if (value === optionalValue || value === '' || value === null) {
    return null;
  }
  return value as string;
};

/**
 * Converts a potentially null database value to a display value for select components
 * 
 * @param value - The database value (potentially null)
 * @param optionalValue - The value to use when the database value is null (default: "none")
 * @returns Display value suitable for select components
 */
export const convertNullToSelectValue = (
  value: string | null,
  optionalValue: string = "none"
): string => {
  return value ?? optionalValue;
};

/**
 * Type guard to check if a select value represents "no selection"
 * 
 * @param value - The value to check
 * @param optionalValue - The value that represents "no selection" (default: "none")
 * @returns True if the value represents no selection
 */
export const isOptionalSelectValue = (
  value: string | null | undefined,
  optionalValue: string = "none"
): boolean => {
  return value === optionalValue || value === null || value === undefined || value === ';
};
