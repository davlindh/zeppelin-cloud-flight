import React from 'react';
import { Users, Briefcase, Image, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParticipantStatsProps {
  stats: {
    totalParticipants: number;
    totalProjects: number;
    totalMedia: number;
    roleDistribution: Array<{ role: string; count: number; }>;
  };
}

export const ParticipantStats: React.FC<ParticipantStatsProps> = ({ stats }) => {
  const {
    totalParticipants,
    totalProjects,
    totalMedia,
    roleDistribution
  } = stats;

  const topRoles = roleDistribution
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Participants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totalt Deltagare</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <p className="text-xs text-muted-foreground">
            Aktiva community-medlemmar
          </p>
        </CardContent>
      </Card>

      {/* Total Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projekt</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            Samarbeten och initiativ
          </p>
        </CardContent>
      </Card>

      {/* Total Media */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Media</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMedia}</div>
          <p className="text-xs text-muted-foreground">
            Portfolio och dokumentation
          </p>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Populära Roller</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topRoles.slice(0, 3).map((roleData, index) => (
              <div key={roleData.role} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1 mr-2">{roleData.role}</span>
                <Badge variant="secondary" className="text-xs">
                  {roleData.count}
                </Badge>
              </div>
            ))}
            {topRoles.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{roleDistribution.length - 3} fler roller
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};