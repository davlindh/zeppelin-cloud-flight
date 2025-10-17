import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileText, Image, Video, File } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Submission {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  contact_email: string;
  media_count?: number;
}

interface SubmissionListItemProps {
  submission: Submission;
  selected: boolean;
  onClick: () => void;
}

const typeIcons = {
  participant: FileText,
  project: FileText,
  media: Image,
  collaboration: FileText,
  default: File
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

export const SubmissionListItem: React.FC<SubmissionListItemProps> = ({
  submission,
  selected,
  onClick
}) => {
  const Icon = typeIcons[submission.type as keyof typeof typeIcons] || typeIcons.default;
  const statusColor = statusColors[submission.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary bg-accent' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{submission.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{submission.contact_email}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={statusColor}>
              {submission.status}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {submission.type}
            </Badge>
            {submission.media_count && submission.media_count > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Image className="h-3 w-3" />
                {submission.media_count}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(submission.created_at), 'PPp', { locale: sv })}
          </p>
        </div>
      </div>
    </Card>
  );
};
