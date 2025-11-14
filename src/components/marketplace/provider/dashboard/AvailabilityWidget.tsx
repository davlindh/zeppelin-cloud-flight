import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Clock, Check, X } from 'lucide-react';
import { useProviderAvailability } from '@/hooks/marketplace/provider/useProviderAvailability';
import { Skeleton } from '@/components/ui/skeleton';

interface AvailabilityWidgetProps {
  providerId: string;
}

export const AvailabilityWidget: React.FC<AvailabilityWidgetProps> = ({ providerId }) => {
  const { availability, isLoading, updateAvailability, isUpdating } = useProviderAvailability(providerId);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!availability) return null;
  
  const isAvailable = availability.status === 'available';
  const isLimited = availability.status === 'limited';
  
  const handleToggle = () => {
    updateAvailability({
      status: isAvailable ? 'unavailable' : 'available',
      nextAvailableAt: null,
    });
  };
  
  const handlePreset = (hours: number) => {
    const nextAvailable = new Date();
    nextAvailable.setHours(nextAvailable.getHours() + hours);
    
    updateAvailability({
      status: 'unavailable',
      nextAvailableAt: nextAvailable.toISOString(),
    });
  };
  
  return (
    <Card className={`border-2 ${
      isAvailable ? 'border-green-500/50' : 
      isLimited ? 'border-yellow-500/50' : 
      'border-red-500/50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {isAvailable ? (
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="font-semibold text-lg">
                {isAvailable ? 'Available' : isLimited ? 'Limited' : 'Unavailable'}
              </p>
              {availability.nextAvailableAt && (
                <p className="text-sm text-muted-foreground">
                  Back {new Date(availability.nextAvailableAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Switch
            checked={isAvailable}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
        </div>
        
        {/* Quick Presets */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Away Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset(1)}
              disabled={isUpdating}
            >
              Away 1 hour
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset(24)}
              disabled={isUpdating}
            >
              Back tomorrow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateAvailability({ status: 'available', nextAvailableAt: null })}
              disabled={isUpdating}
              className="col-span-2"
            >
              Available Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
