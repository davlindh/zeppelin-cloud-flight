import React from 'react';
import { Loader2 } from 'lucide-react';

export const EditPageLoading: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Laddar...</p>
    </div>
  </div>
);
