import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Eye, TrendingUp, DollarSign, Star, MoreVertical } from 'lucide-react';
import { useServicePerformance } from '@/hooks/marketplace/provider/useServicePerformance';
import { formatRevenue, getPerformanceGrade } from '@/lib/provider-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface ServicePerformanceTableProps {
  providerId: string;
}

type SortKey = 'name' | 'views' | 'bookings' | 'conversionRate' | 'avgRating' | 'revenue';
type SortDirection = 'asc' | 'desc';

export const ServicePerformanceTable: React.FC<ServicePerformanceTableProps> = ({ providerId }) => {
  const { data: services, isLoading } = useServicePerformance(providerId);
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!services || services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">No services yet</p>
          <Button asChild>
            <Link to="/marketplace/services/manage">Add Your First Service</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  const sortedServices = [...services].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    const direction = sortDirection === 'asc' ? 1 : -1;
    return aValue < bValue ? -direction : direction;
  });
  
  const bestPerformer = services.reduce((best, service) => 
    service.revenue > best.revenue ? service : best
  );
  
  const worstPerformer = services.reduce((worst, service) => 
    service.conversionRate < worst.conversionRate ? service : worst
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Service Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('name')}>
                    Service
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('views')}>
                    Views
                    <Eye className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('bookings')}>
                    Bookings
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('conversionRate')}>
                    Conversion
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('avgRating')}>
                    Rating
                    <Star className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('revenue')}>
                    Revenue
                    <DollarSign className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServices.map((service) => {
                const isBest = service.id === bestPerformer.id;
                const isWorst = service.id === worstPerformer.id && services.length > 1;
                const grade = getPerformanceGrade(service.conversionRate);
                
                return (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {service.image && (
                          <img 
                            src={service.image} 
                            alt={service.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {isBest && <Badge variant="default" className="text-xs">🏆 Top</Badge>}
                            {isWorst && <Badge variant="secondary" className="text-xs">⚠️ Low Conv.</Badge>}
                            <Badge variant={service.available ? 'default' : 'secondary'} className="text-xs">
                              {service.available ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{service.views}</TableCell>
                    <TableCell className="text-right font-medium">{service.bookings}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline"
                        className={`${
                          grade.color === 'green' ? 'border-green-500 text-green-700 dark:text-green-400' :
                          grade.color === 'blue' ? 'border-blue-500 text-blue-700 dark:text-blue-400' :
                          grade.color === 'yellow' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                          'border-red-500 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {service.conversionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.avgRating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRevenue(service.revenue)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
