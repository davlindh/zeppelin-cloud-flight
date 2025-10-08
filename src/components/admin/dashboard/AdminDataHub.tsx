import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  ChevronDown,
  Eye,
  Edit,
  ExternalLink,
  Download,
  Package,
  Gavel,
  Wrench,
  ShoppingCart,
  Calendar,
  MessageSquare,
  Building,
  Tags,
  Database
} from 'lucide-react';
import DataCompletenessCenter from './DataCompletenessCenter';
import { useProducts } from '@/hooks/useProducts';
import { useAuctions } from '@/hooks/useAuctions';
import { useServices } from '@/hooks/useServices';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getImageUrl } from '@/utils/imageUtils';
import type { Product, Auction, Service } from '@/types/unified';

// Simple data interfaces for orders
interface Order {
  id: string;
  order_number: string;
  item_title: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface DataPanelProps {
  title: string;
  icon: React.ReactNode;
  totalCount: number;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const DataPanel: React.FC<DataPanelProps> = ({ title, icon, totalCount, children, isOpen, onToggle }) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <Card>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon}
              {title}
              <Badge variant="outline">{totalCount}</Badge>
            </CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

const AdminDataHub: React.FC = () => {
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Data fetching
  const { data: products = [] } = useProducts({});
  const { data: auctions = [] } = useAuctions();
  const { data: services = [] } = useServices({});
  const { data: providers = [] } = useServiceProviders();

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Order[];
    }
  });

  // Fetch bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, customer_name, customer_email, service_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch messages using admin communication history
  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communication_requests')
        .select('id, reference_number, customer_name, provider_name, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, display_name, is_active, created_at')
        .order('name')
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const togglePanel = (panelId: string) => {
    setOpenPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  const updateSearchTerm = (panelId: string, term: string) => {
    setSearchTerms(prev => ({ ...prev, [panelId]: term }));
  };

  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  // Filter functions
  const filterProducts = (products: Product[]) => {
    const search = searchTerms['products']?.toLowerCase() || '';
    return products.filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.categoryName?.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search)
    ).slice(0, 10);
  };

  const filterAuctions = (auctions: Auction[]) => {
    const search = searchTerms['auctions']?.toLowerCase() || '';
    return auctions.filter(a => 
      a.title.toLowerCase().includes(search) || 
      a.category.toLowerCase().includes(search)
    ).slice(0, 10);
  };

  const filterServices = (services: Service[]) => {
    const search = searchTerms['services']?.toLowerCase() || '';
    return services.filter(s => 
      s.title.toLowerCase().includes(search) || 
      s.category.toLowerCase().includes(search) ||
      s.provider.toLowerCase().includes(search)
    ).slice(0, 10);
  };

  const filterOrders = (orders: Order[]) => {
    const search = searchTerms['orders']?.toLowerCase() || '';
    return orders.filter(o => 
      o.order_number.toLowerCase().includes(search) || 
      o.item_title.toLowerCase().includes(search)
    ).slice(0, 10);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Hub
          </h3>
          <p className="text-sm text-muted-foreground">
            Quick access to all your data with search and export capabilities
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Data Completeness Center */}
        <DataCompletenessCenter />
        {/* Products Panel */}
        <DataPanel
          title="Products"
          icon={<Package className="h-4 w-4" />}
          totalCount={products.length}
          isOpen={!!openPanels['products']}
          onToggle={() => togglePanel('products')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerms['products'] || ''}
                  onChange={(e) => updateSearchTerm('products', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCsv(products, 'products')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterProducts(products).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{product.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={product.inStock ? "default" : "destructive"}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {Math.min(10, filterProducts(products).length)} of {products.length}</span>
              <Button variant="link" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Products
              </Button>
            </div>
          </div>
        </DataPanel>

        {/* Auctions Panel */}
        <DataPanel
          title="Auctions"
          icon={<Gavel className="h-4 w-4" />}
          totalCount={auctions.length}
          isOpen={!!openPanels['auctions']}
          onToggle={() => togglePanel('auctions')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search auctions..."
                  value={searchTerms['auctions'] || ''}
                  onChange={(e) => updateSearchTerm('auctions', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCsv(auctions, 'auctions')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterAuctions(auctions).map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(auction.image)}
                            alt={auction.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{auction.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{auction.category}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(auction.currentBid)}</TableCell>
                      <TableCell>
                        <Badge variant={new Date(auction.endTime) > new Date() ? "default" : "secondary"}>
                          {new Date(auction.endTime) > new Date() ? 'Active' : 'Ended'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {Math.min(10, filterAuctions(auctions).length)} of {auctions.length}</span>
              <Button variant="link" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Auctions
              </Button>
            </div>
          </div>
        </DataPanel>

        {/* Services Panel */}
        <DataPanel
          title="Services"
          icon={<Wrench className="h-4 w-4" />}
          totalCount={services.length}
          isOpen={!!openPanels['services']}
          onToggle={() => togglePanel('services')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerms['services'] || ''}
                  onChange={(e) => updateSearchTerm('services', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCsv(services, 'services')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterServices(services).map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(service.image)}
                            alt={service.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{service.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{service.provider}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(service.startingPrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {Math.min(10, filterServices(services).length)} of {services.length}</span>
              <Button variant="link" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Services
              </Button>
            </div>
          </div>
        </DataPanel>

        {/* Orders Panel */}
        <DataPanel
          title="Orders"
          icon={<ShoppingCart className="h-4 w-4" />}
          totalCount={orders.length}
          isOpen={!!openPanels['orders']}
          onToggle={() => togglePanel('orders')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerms['orders'] || ''}
                  onChange={(e) => updateSearchTerm('orders', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCsv(orders, 'orders')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterOrders(orders).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.order_number}</TableCell>
                      <TableCell>{order.item_title}</TableCell>
                      <TableCell>{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {Math.min(10, filterOrders(orders).length)} of {orders.length}</span>
              <Button variant="link" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Orders
              </Button>
            </div>
          </div>
        </DataPanel>

        {/* Compact panels for other data types */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Bookings */}
          <DataPanel
            title="Bookings"
            icon={<Calendar className="h-4 w-4" />}
            totalCount={bookings.length}
            isOpen={!!openPanels['bookings']}
            onToggle={() => togglePanel('bookings')}
          >
            <div className="space-y-2">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <span className="font-medium">{booking.customer_name}</span>
                    <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                  </div>
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
              ))}
              <Button variant="link" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Bookings ({bookings.length})
              </Button>
            </div>
          </DataPanel>

          {/* Messages */}
          <DataPanel
            title="Messages"
            icon={<MessageSquare className="h-4 w-4" />}
            totalCount={messages.length}
            isOpen={!!openPanels['messages']}
            onToggle={() => togglePanel('messages')}
          >
            <div className="space-y-2">
              {messages.slice(0, 5).map((message: any) => (
                <div key={message.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <span className="font-medium">{message.customer_name}</span>
                    <p className="text-sm text-muted-foreground">{message.subject}</p>
                  </div>
                  <Badge variant="outline">{message.status}</Badge>
                </div>
              ))}
              <Button variant="link" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Messages ({messages.length})
              </Button>
            </div>
          </DataPanel>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Providers */}
          <DataPanel
            title="Providers"
            icon={<Building className="h-4 w-4" />}
            totalCount={providers.length}
            isOpen={!!openPanels['providers']}
            onToggle={() => togglePanel('providers')}
          >
            <div className="space-y-2">
              {providers.slice(0, 5).map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <img
                      src={getImageUrl(provider.avatar)}
                      alt={provider.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <Badge variant="outline">★ {provider.rating.toFixed(1)}</Badge>
                </div>
              ))}
              <Button variant="link" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Providers ({providers.length})
              </Button>
            </div>
          </DataPanel>

          {/* Categories */}
          <DataPanel
            title="Categories"
            icon={<Tags className="h-4 w-4" />}
            totalCount={categories.length}
            isOpen={!!openPanels['categories']}
            onToggle={() => togglePanel('categories')}
          >
            <div className="space-y-2">
              {categories.slice(0, 5).map((category: any) => (
                <div key={category.id} className="flex items-center justify-between p-2 rounded border">
                  <span className="font-medium">{category.display_name}</span>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              <Button variant="link" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All Categories ({categories.length})
              </Button>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
};

export default AdminDataHub;