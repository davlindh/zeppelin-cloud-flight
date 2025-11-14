import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/role-badge';
import { ArrowRight, Lock } from 'lucide-react';

interface UnlockRoleCardProps {
  role: string;
  description: string;
  benefits: string[];
  onApply: () => void;
}

export const UnlockRoleCard: React.FC<UnlockRoleCardProps> = ({ 
  role, 
  description, 
  benefits,
  onApply 
}) => {
  return (
    <Card className="relative overflow-hidden border-2 border-dashed">
      <div className="absolute top-4 right-4 opacity-10">
        <Lock className="h-12 w-12" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RoleBadge role={role as any} size="lg" />
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={onApply} variant="default" className="w-full">
          Ansök nu
        </Button>
      </CardFooter>
    </Card>
  );
};
