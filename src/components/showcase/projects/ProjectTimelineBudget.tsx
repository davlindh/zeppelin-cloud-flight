import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign } from 'lucide-react';

interface ProjectTimelineBudgetProps {
  timeline?: {
    start_date?: string;
    end_date?: string;
    milestones?: Array<{ date: string; title: string; description?: string; }>;
  };
  budget?: {
    amount?: number;
    currency?: string;
    breakdown?: Array<{ item: string; cost: number; }>;
  };
}

export const ProjectTimelineBudget: React.FC<ProjectTimelineBudgetProps> = ({
  timeline,
  budget
}) => {
  // Early return if neither timeline nor budget exists
  if (!timeline && !budget) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {timeline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tidsplan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeline.start_date && (
                <p className="text-sm">
                  <strong>Start:</strong> {new Date(timeline.start_date).toLocaleDateString('sv-SE')}
                </p>
              )}
              {timeline.end_date && (
                <p className="text-sm">
                  <strong>Slut:</strong> {new Date(timeline.end_date).toLocaleDateString('sv-SE')}
                </p>
              )}
              {timeline.milestones && timeline.milestones.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mt-4 mb-2">Milstolpar:</h4>
                  <ul className="space-y-1">
                    {timeline.milestones.map((milestone, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        <strong>{new Date(milestone.date).toLocaleDateString('sv-SE')}:</strong> {milestone.title}
                        {milestone.description && <span className="block ml-4">{milestone.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {budget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budget.amount && (
                <p className="text-lg font-semibold">
                  {budget.amount.toLocaleString('sv-SE')} {budget.currency || 'SEK'}
                </p>
              )}
              {budget.breakdown && budget.breakdown.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mt-4 mb-2">Fördelning:</h4>
                  <ul className="space-y-1">
                    {budget.breakdown.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex justify-between">
                        <span>{item.item}</span>
                        <span>{item.cost.toLocaleString('sv-SE')} {budget?.currency || 'SEK'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
