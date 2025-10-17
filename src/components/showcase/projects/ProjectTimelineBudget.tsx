import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, CheckCircle2, Clock } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {timeline && (
        <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500 group overflow-hidden">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <div className="p-3 rounded-xl gradient-primary shadow-soft group-hover:shadow-glow transition-all duration-300">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              Tidsplan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Date Range */}
            {(timeline.start_date || timeline.end_date) && (
              <div className="flex gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                {timeline.start_date && (
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Start</p>
                    <p className="text-sm font-semibold">{new Date(timeline.start_date).toLocaleDateString('sv-SE')}</p>
                  </div>
                )}
                {timeline.end_date && (
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Slut</p>
                    <p className="text-sm font-semibold">{new Date(timeline.end_date).toLocaleDateString('sv-SE')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Visual Timeline with Milestones */}
            {timeline.milestones && timeline.milestones.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Milstolpar</h4>
                <div className="relative pl-8 border-l-2 border-primary/20 space-y-6">
                  {timeline.milestones.map((milestone, index) => (
                    <div key={index} className="relative group/milestone">
                      {/* Marker */}
                      <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-primary border-4 border-background group-hover/milestone:scale-125 group-hover/milestone:rotate-180 transition-all duration-300 shadow-soft" />
                      
                      {/* Content */}
                      <div className="bg-background/50 p-4 rounded-lg border border-border/30 hover:border-primary/40 hover:bg-background/80 transition-all duration-300 hover:shadow-soft">
                        <Badge className="mb-2 bg-muted/50 text-foreground border-border/40">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(milestone.date).toLocaleDateString('sv-SE')}
                        </Badge>
                        <h5 className="font-semibold text-sm mb-1">{milestone.title}</h5>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {budget && (
        <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500 group overflow-hidden">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <div className="p-3 rounded-xl gradient-secondary shadow-soft group-hover:shadow-glow transition-all duration-300">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-secondary-foreground" />
              </div>
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Total Amount */}
            {budget.amount && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl mb-6 border border-primary/20 group-hover:border-primary/30 transition-all">
                <p className="text-sm text-muted-foreground mb-1 font-medium">Total budget</p>
                <p className="text-3xl font-bold text-primary">
                  {budget.amount.toLocaleString('sv-SE')} <span className="text-xl">{budget.currency || 'SEK'}</span>
                </p>
              </div>
            )}

            {/* Budget Breakdown with Progress Bars */}
            {budget.breakdown && budget.breakdown.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Kostnadsfördelning</h4>
                <div className="space-y-4">
                  {budget.breakdown.map((item, index) => {
                    const percentage = budget.amount ? (item.cost / budget.amount) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2 group/item">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-foreground group-hover/item:text-primary transition-colors">{item.item}</span>
                          <span className="font-semibold text-foreground">
                            {item.cost.toLocaleString('sv-SE')} {budget.currency || 'SEK'}
                          </span>
                        </div>
                        {budget.amount && (
                          <div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 group-hover/item:from-primary group-hover/item:to-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% av budget</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
