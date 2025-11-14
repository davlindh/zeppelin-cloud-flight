import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ProviderOnboardingData } from '@/schemas/providerOnboarding';

interface Step2Props {
  form: UseFormReturn<ProviderOnboardingData>;
}

const SPECIALTIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'SEO',
  'Content Writing',
  'Photography',
  'Video Production',
  'Consulting',
];

export const Step2ProfessionalDetails: React.FC<Step2Props> = ({ form }) => {
  const [certInput, setCertInput] = React.useState('');
  
  const addCertification = () => {
    if (certInput.trim()) {
      const current = form.getValues('certifications') || [];
      form.setValue('certifications', [...current, certInput.trim()]);
      setCertInput('');
    }
  };
  
  const removeCertification = (index: number) => {
    const current = form.getValues('certifications') || [];
    form.setValue('certifications', current.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Professional Details</h3>
        <p className="text-sm text-muted-foreground">Tell us about your expertise</p>
      </div>
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Bio *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell potential clients about yourself, your experience, and what makes you unique..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              {field.value?.length || 0}/500 characters (minimum 50)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience Level *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Beginner">Beginner (0-2 years)</SelectItem>
                <SelectItem value="Intermediate">Intermediate (2-5 years)</SelectItem>
                <SelectItem value="Expert">Expert (5-10 years)</SelectItem>
                <SelectItem value="Master">Master (10+ years)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="specialties"
        render={() => (
          <FormItem>
            <FormLabel>Specialties * (Select at least one)</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {SPECIALTIES.map((specialty) => (
                <FormField
                  key={specialty}
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(specialty)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, specialty]);
                            } else {
                              field.onChange(current.filter((val) => val !== specialty));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {specialty}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="certifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certifications (Optional)</FormLabel>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., Google Analytics Certified"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCertification();
                  }
                }}
              />
              <button 
                type="button"
                onClick={addCertification}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add
              </button>
            </div>
            {field.value && field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((cert, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="years_in_business"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years in Business (Optional)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="5"
                min="0"
                max="50"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
