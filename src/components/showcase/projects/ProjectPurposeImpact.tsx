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
        <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500 group animate-fade-in">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">Om projektet</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray prose-lg max-w-none">
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-wrap font-light">{full_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Purpose & Impact */}
      {(purpose || expected_impact) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 animate-fade-in">
          {purpose && (
            <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500 h-full group">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-start gap-4 text-xl md:text-2xl">
                  <div className="p-3 rounded-xl gradient-primary flex-shrink-0 shadow-soft group-hover:shadow-glow transition-all duration-300">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                  </div>
                  <span className="leading-tight font-semibold group-hover:text-primary transition-colors duration-300">Syfte</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-light">{purpose}</p>
              </CardContent>
            </Card>
          )}

          {expected_impact && (
            <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500 h-full group">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-start gap-4 text-xl md:text-2xl">
                  <div className="p-3 rounded-xl gradient-secondary flex-shrink-0 shadow-soft group-hover:shadow-glow transition-all duration-300">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-secondary-foreground" />
                  </div>
                  <span className="leading-tight font-semibold group-hover:text-secondary transition-colors duration-300">Förväntad påverkan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-light">{expected_impact}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
};
