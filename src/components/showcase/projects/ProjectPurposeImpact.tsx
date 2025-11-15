import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface ProjectPurposeImpactProps {
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
}

export const ProjectPurposeImpact: React.FC<ProjectPurposeImpactProps> = ({
  full_description,
  purpose,
  expected_impact
}) => {
  return (
    <>
      {/* Full Description */}
      {full_description && (
        <Card className="backdrop-blur-xl bg-card/40 border-2 border-border/50 shadow-2xl hover:shadow-primary/20 hover:scale-[1.01] transition-all duration-500 group rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
              Om projektet
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray prose-lg max-w-none">
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-wrap font-light">
              {full_description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purpose & Impact */}
      {(purpose || expected_impact) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {purpose && (
            <Card className="backdrop-blur-xl bg-gradient-to-br from-card/60 to-card/40 border-2 border-primary/30 shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] hover:border-primary/50 transition-all duration-500 h-full group rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-start gap-4 text-xl md:text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex-shrink-0 shadow-lg group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-300">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                  </div>
                  <span className="leading-tight font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Syfte
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  {purpose}
                </p>
              </CardContent>
            </Card>
          )}

          {expected_impact && (
            <Card className="backdrop-blur-xl bg-gradient-to-br from-card/60 to-card/40 border-2 border-secondary/30 shadow-2xl hover:shadow-secondary/30 hover:scale-[1.02] hover:border-secondary/50 transition-all duration-500 h-full group rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-start gap-4 text-xl md:text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex-shrink-0 shadow-lg group-hover:shadow-secondary/40 group-hover:scale-110 transition-all duration-300">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-secondary-foreground" />
                  </div>
                  <span className="leading-tight font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                    Förväntad påverkan
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  {expected_impact}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
};
