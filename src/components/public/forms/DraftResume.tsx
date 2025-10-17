import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { format } from 'date-fns';

interface DraftResumeProps {
  draftDate: Date;
  onResume: () => void;
  onDiscard: () => void;
  formType: string;
}

export const DraftResume: React.FC<DraftResumeProps> = ({
  draftDate,
  onResume,
  onDiscard,
  formType,
}) => {
  return (
    <Alert className="mb-6 border-primary bg-primary/5">
      <FileText className="h-4 w-4" />
      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground mb-1">
            Draft Found
          </p>
          <p className="text-sm text-muted-foreground">
            You have an unfinished {formType} application from{' '}
            {format(draftDate, 'MMM d, yyyy \'at\' h:mm a')}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={onResume} size="sm">
            Resume
          </Button>
          <Button onClick={onDiscard} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
