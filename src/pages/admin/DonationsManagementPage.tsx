import React, { useState } from 'react';
import { AdminRoute } from '@/components/admin/AdminRoute';
import {
  DonationStatsCards,
  DonationFilters,
  DonationListItem,
  DonationDetailsPanel,
} from '@/components/admin/donations';
import { useDonations } from '@/hooks/admin/useDonations';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Donation } from '@/types/funding';

const DonationsManagementPage: React.FC = () => {
  const [selectedDonation, setSelectedDonation] = useState<(Donation & {
    funding_campaigns?: { id: string; title: string; slug: string } | null;
  }) | null>(null);
  
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    campaignId?: string;
  }>({});

  const { data: donations, isLoading } = useDonations(filters);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      if (value === 'all' || !value) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <AdminRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Donations Management</h1>
          <p className="text-muted-foreground">
            Manage and review all donations
          </p>
        </div>

        <DonationStatsCards />

        <DonationFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2 pr-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : donations && donations.length > 0 ? (
                  donations.map((donation) => (
                    <DonationListItem
                      key={donation.id}
                      donation={donation}
                      isSelected={selectedDonation?.id === donation.id}
                      onClick={() => setSelectedDonation(donation)}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No donations found
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-2">
            {selectedDonation ? (
              <DonationDetailsPanel donation={selectedDonation} />
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Select a donation to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default DonationsManagementPage;
