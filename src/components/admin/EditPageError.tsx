import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EditPageErrorProps {
  error: Error;
  onBack: () => void;
}

export const EditPageError: React.FC<EditPageErrorProps> = ({ error, onBack }) => (
  <div className="min-h-screen bg-red-50">
    <div className="container mx-auto px-6 py-4">
      <Button onClick={onBack} variant="ghost">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Tillbaka
      </Button>
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-red-600">Något gick fel</h2>
          <p className="text-red-500 mt-2">
            {error.message || 'Ett fel uppstod när data hämtades.'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Ladda om sidan
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);
