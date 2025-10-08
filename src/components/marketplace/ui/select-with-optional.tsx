import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface SelectWithOptionalProps {
  name?: string;
  defaultValue?: string | null;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onValueChange?: (value: string | null) => void;
  optionalLabel?: string;
  optionalValue?: string;
}

/**
 * A Select component that properly handles optional/nullable values.
 * 
 * This component solves the Radix UI Select issue where empty string values
 * are not allowed in SelectItem components. It provides a standard way to
 * handle "no preference" or "none" options.
 * 
 * @param optionalValue - The value to use for "no preference" (defaults to "none")
 * @param optionalLabel - The label to display for "no preference" (defaults to "No preference")
 */
export const SelectWithOptional: React.FC<SelectWithOptionalProps> = ({
  name,
  defaultValue,
  placeholder,
  disabled,
  children,
  onValueChange,
  optionalLabel = "No preference",
  optionalValue = "none"
}) => {
  // Convert null/empty values to the optional value for display
  const displayValue = defaultValue === null || defaultValue === '' ? optionalValue : defaultValue;

  const handleValueChange = (value: string) => {
    // Convert the optional value back to null when the value changes
    const actualValue = value === optionalValue ? null : value;
    onValueChange?.(actualValue);
  };

  return (
    <Select 
      name={name} 
      defaultValue={displayValue} 
      onValueChange={handleValueChange}
    >
      <SelectTrigger disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={optionalValue}>{optionalLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
  );
};
