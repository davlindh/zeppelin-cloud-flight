import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ProviderOnboardingData } from '@/schemas/providerOnboarding';

interface Step3Props {
  form: UseFormReturn<ProviderOnboardingData>;
}

export const Step3Services: React.FC<Step3Props> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Services & Portfolio</h3>
        <p className="text-sm text-muted-foreground">Describe what you offer to clients</p>
      </div>
      
      <FormField
        control={form.control}
        name="services_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Services Description *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the services you offer, your approach, and what clients can expect when working with you..."
                className="min-h-[120px]"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              {field.value?.length || 0}/500 characters (minimum 20)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="portfolio_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Portfolio Description (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Highlight your best work, notable projects, or achievements..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Share examples of your work to attract clients
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="work_philosophy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work Philosophy (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What principles guide your work? What do you value most when working with clients?"
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Help clients understand your approach and values
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
