import React, { useState } from 'react';
import { useCampaigns } from '@/hooks/funding/useCampaigns';
import { CampaignCard } from '@/components/funding/CampaignCard';
import { Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const CampaignsListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string[]>(['active']);
  const [sortBy, setSortBy] = useState<'deadline' | 'funded' | 'eckt'>('deadline');

  const { data: campaigns, isLoading } = useCampaigns({
    status: statusFilter,
    visibility: 'public',
  });

  const sortedCampaigns = React.useMemo(() => {
    if (!campaigns) return [];
    
    return [...campaigns].sort((a, b) => {
      if (sortBy === 'deadline' && a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'funded') {
        const aPercent = a.target_amount > 0 ? a.raised_amount / a.target_amount : 0;
        const bPercent = b.target_amount > 0 ? b.raised_amount / b.target_amount : 0;
        return bPercent - aPercent;
      }
      return 0;
    });
  }, [campaigns, sortBy]);

  const toggleStatus = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Funding Campaigns
          </h1>
          <p className="text-muted-foreground text-lg">
            Support creative projects and community initiatives
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Status:</span>
            {['active', 'successful', 'draft'].map(status => (
              <Badge
                key={status}
                variant={statusFilter.includes(status) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleStatus(status)}
              >
                {status}
              </Badge>
            ))}
          </div>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="funded">% Funded</SelectItem>
              <SelectItem value="eckt">Community Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Grid */}
        {sortedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No campaigns found with current filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
