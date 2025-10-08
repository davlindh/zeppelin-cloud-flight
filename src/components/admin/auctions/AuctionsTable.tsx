import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  StopCircle,
  DollarSign,
  Eye,
  RefreshCw,
  Clock,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuctions } from '@/hooks/useAuctions';
import { useAuctionMutations } from '@/hooks/useAuctionMutations';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/utils/imageUtils';
import type { Auction } from '@/types/unified';

interface AuctionsTableProps {
  onCreateAuction: () => void;
  onEditAuction: (auction: Auction) => void;
  onViewAuction: (auction: Auction) => void;
  onDeleteAuction: (auction: Auction) => void;
}

const AuctionsTable: React.FC<AuctionsTableProps> = ({
  onCreateAuction,
  onEditAuction,
  onViewAuction,
  onDeleteAuction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ending-soon' | 'ended'>('all');

  const { data: auctions = [], isLoading, refetch, isRefetching } = useAuctions();
  const { endAuction, extendAuction } = useAuctionMutations();
  const { toast } = useToast();

  // Filter and search auctions
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const endTime = new Date(auction.endTime);
    const isActive = endTime > now;
    const isEndingSoon = isActive && (endTime.getTime() - now.getTime()) <= (24 * 60 * 60 * 1000); // 24 hours

    switch (statusFilter) {
      case 'active':
        return matchesSearch && isActive && !isEndingSoon;
      case 'ending-soon':
        return matchesSearch && isEndingSoon;
      case 'ended':
        return matchesSearch && !isActive;
      default:
        return matchesSearch;
    }
  });

  const getAuctionStatus = (auction: Auction) => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    const isActive = endTime > now;
    const timeLeft = endTime.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (!isActive) return { status: 'ended', variant: 'secondary' as const, label: 'Ended' };
    if (hoursLeft <= 1) return { status: 'critical', variant: 'destructive' as const, label: 'Ending Soon' };
    if (hoursLeft <= 24) return { status: 'warning', variant: 'outline' as const, label: 'Ending Today' };
    return { status: 'active', variant: 'default' as const, label: 'Active' };
  };

  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleEndAuction = async (auction: Auction) => {
    if (confirm(`Are you sure you want to end "${auction.title}" immediately?`)) {
      const success = await endAuction(auction.id, true);
      
      if (success) {
        toast({
          title: "Auction ended",
          description: `"${auction.title}" has been ended successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to end auction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExtendAuction = async (auction: Auction) => {
    const hours = prompt('How many hours would you like to extend this auction?');
    if (hours && !isNaN(Number(hours))) {
      const additionalMinutes = Number(hours) * 60;
      const success = await extendAuction(auction.id, additionalMinutes);
      
      if (success) {
        toast({
          title: "Auction extended",
          description: `"${auction.title}" has been extended by ${hours} hours.`,
        });
      } else {
        toast({
          title: "Error", 
          description: "Failed to extend auction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Auctions...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Auction Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your auction catalog and monitor live bidding ({auctions.length} total auctions)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={onCreateAuction}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Auction
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const csvContent = [
                  'Title,Category,Starting Bid,Current Bid,Bidders,End Time,Status',
                  ...auctions.map(a => 
                    `"${a.title}","${a.category}","${a.startingBid}","${a.currentBid}","${a.bidders}","${a.endTime}","${new Date(a.endTime) > new Date() ? 'Active' : 'Ended'}"`
                  )
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `auctions-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search auctions by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'ending-soon', 'ended'] as const).map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter)}
                className="capitalize"
              >
                {filter.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Auctions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Bid</TableHead>
                <TableHead>Time Left</TableHead>
                <TableHead>Bidders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuctions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-slate-500">
                      {searchTerm ? 'No auctions match your search' : 'No auctions found'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAuctions.map((auction) => {
                  const status = getAuctionStatus(auction);
                  return (
                    <TableRow key={auction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(auction.image)}
                            alt={auction.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{auction.title}</div>
                            <div className="text-sm text-slate-500 capitalize">
                              {auction.category} • {auction.condition}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-semibold">
                          ${auction.currentBid.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500">
                          Starting: ${auction.startingBid.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className={`font-medium ${
                            status.status === 'critical' ? 'text-red-600' : 
                            status.status === 'warning' ? 'text-amber-600' : 'text-slate-600'
                          }`}>
                            {formatTimeLeft(auction.endTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>{auction.bidders}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewAuction(auction)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditAuction(auction)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Auction
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {status.status !== 'ended' && (
                              <>
                                <DropdownMenuItem onClick={() => handleExtendAuction(auction)}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Extend Time
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEndAuction(auction)}
                                  className="text-orange-600"
                                >
                                  <StopCircle className="mr-2 h-4 w-4" />
                                  End Now
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteAuction(auction)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Summary */}
        <div className="flex items-center justify-between text-sm text-slate-500 mt-4">
          <div>
            Showing {filteredAuctions.length} of {auctions.length} auctions
          </div>
          <div className="flex items-center gap-4">
            <span>
              Active: {auctions.filter(a => new Date(a.endTime) > new Date()).length}
            </span>
            <span>
              Ended: {auctions.filter(a => new Date(a.endTime) <= new Date()).length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionsTable;
