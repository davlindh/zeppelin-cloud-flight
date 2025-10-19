import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Eye, 
  CheckCircle, 
  Share2, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkflowStage = 'upload' | 'review' | 'approved' | 'published' | 'orphaned';

interface WorkflowStageCardProps {
  stage: WorkflowStage;
  count: number;
  total: number;
  onViewItems: () => void;
  onPromote?: () => void;
  onDemote?: () => void;
  canPromote?: boolean;
  canDemote?: boolean;
}

const stageConfig: Record<WorkflowStage, {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  upload: {
    title: 'Uppladdad',
    description: 'Nyligen uppladdade filer',
    icon: <Upload className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  review: {
    title: 'Granskning',
    description: 'Väntande granskning',
    icon: <Eye className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  approved: {
    title: 'Godkänd',
    description: 'Godkända för publicering',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  published: {
    title: 'Publicerad',
    description: 'Länkad till projekt/deltagare',
    icon: <Share2 className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  orphaned: {
    title: 'Föräldralös',
    description: 'Ej länkad på >30 dagar',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

export const WorkflowStageCard: React.FC<WorkflowStageCardProps> = ({
  stage,
  count,
  total,
  onViewItems,
  onPromote,
  onDemote,
  canPromote = false,
  canDemote = false,
}) => {
  const config = stageConfig[stage];
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", config.bgColor, config.color)}>
            {config.icon}
          </div>
          <Badge variant={stage === 'orphaned' ? 'destructive' : 'secondary'}>
            {count}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{config.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{percentage.toFixed(0)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={onViewItems}
          >
            Visa ({count})
          </Button>
          
          {canDemote && onDemote && (
            <Button size="sm" variant="ghost" onClick={onDemote}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {canPromote && onPromote && (
            <Button size="sm" variant="ghost" onClick={onPromote}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};