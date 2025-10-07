
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomizationOption {
  name: string;
  type: 'select' | 'input' | 'textarea';
  options?: string[];
  required: boolean;
  description?: string;
}

interface ServiceCustomizationProps {
  customizationOptions?: CustomizationOption[];
  customizations: Record<string, string>;
  onCustomizationChange: (field: string, value: string) => void;
}

export const ServiceCustomization: React.FC<ServiceCustomizationProps> = ({
  customizationOptions,
  customizations,
  onCustomizationChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-slate-900">Customize Your Service</h3>
      
      {customizationOptions ? (
        customizationOptions.map((option) => (
          <div key={option.name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {option.name} {option.required && '*'}
            </label>
            {option.description && (
              <p className="text-xs text-slate-600 mb-2">{option.description}</p>
            )}
            
            {option.type === 'select' && option.options && (
              <Select 
                value={customizations[option.name] || '} 
                onValueChange={(value) => onCustomizationChange(option.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${option.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {option.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {option.type === 'input' && (
              <Input
                value={customizations[option.name] || '}
                onChange={(e) => onCustomizationChange(option.name, e.target.value)}
                placeholder={`Enter ${option.name}`}
              />
            )}
            
            {option.type === 'textarea' && (
              <Textarea
                value={customizations[option.name] || '}
                onChange={(e) => onCustomizationChange(option.name, e.target.value)}
                placeholder={`Describe ${option.name}`}
                rows={3}
              />
            )}
          </div>
        ))
      ) : (
        <p className="text-slate-600">No customization options for this service.</p>
      )}
    </div>
  );
};
