import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ProviderOnboardingData } from '@/schemas/providerOnboarding';

interface Step4Props {
  form: UseFormReturn<ProviderOnboardingData>;
}

export const Step4Availability: React.FC<Step4Props> = ({ form }) => {
  const [awardInput, setAwardInput] = React.useState('');
  
  const addAward = () => {
    if (awardInput.trim()) {
      const current = form.getValues('awards') || [];
      form.setValue('awards', [...current, awardInput.trim()]);
      setAwardInput('');
    }
  };
  
  const removeAward = (index: number) => {
    const current = form.getValues('awards') || [];
    form.setValue('awards', current.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Availability & Response</h3>
        <p className="text-sm text-muted-foreground">Set your availability and response expectations</p>
      </div>
      
      <FormField
        control={form.control}
        name="availability_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Availability Status</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="available" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    <div>
                      <div className="font-medium">Available</div>
                      <div className="text-sm text-muted-foreground">Actively taking new clients</div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="limited" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    <div>
                      <div className="font-medium">Limited Availability</div>
                      <div className="text-sm text-muted-foreground">Selective about new projects</div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="unavailable" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    <div>
                      <div className="font-medium">Unavailable</div>
                      <div className="text-sm text-muted-foreground">Not taking new clients currently</div>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="response_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Typical Response Time</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your typical response time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1 hour">Within 1 hour</SelectItem>
                <SelectItem value="24 hours">Within 24 hours</SelectItem>
                <SelectItem value="48 hours">Within 48 hours</SelectItem>
                <SelectItem value="1 week">Within 1 week</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How quickly do you typically respond to inquiries?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="avatar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Picture URL (Optional)</FormLabel>
            <FormControl>
              <Input 
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Add a professional photo to help clients recognize you
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="awards"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Awards & Recognition (Optional)</FormLabel>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., Best Service Provider 2023"
                value={awardInput}
                onChange={(e) => setAwardInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAward();
                  }
                }}
              />
              <button 
                type="button"
                onClick={addAward}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add
              </button>
            </div>
            {field.value && field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((award, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {award}
                    <button
                      type="button"
                      onClick={() => removeAward(index)}
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
    </div>
  );
};
