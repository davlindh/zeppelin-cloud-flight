import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Package, 
  Gavel, 
  Wrench, 
  BarChart3,
  Plus,
  DollarSign,
  Camera,
  Users,
  Shield,
  MessageSquare,
  Calendar,
  ShoppingCart,
  Building,
  Tags
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductForm from '@/components/admin/products/ProductForm';

import AuctionsTable from '@/components/admin/auctions/AuctionsTable';
import AuctionForm from '@/components/admin/auctions/AuctionForm';
import ServicesTable from '@/components/admin/services/ServicesTable';
import ServiceForm from '@/components/admin/services/ServiceForm';
import { ServiceProvidersTable } from '@/components/admin/providers/ServiceProvidersTable';
import { ServiceProviderForm } from '@/components/admin/providers/ServiceProviderForm';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';
import { BookingsTable } from '@/components/admin/bookings/BookingsTable';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import BrandManagement from '@/components/admin/brands/BrandManagement';
import { SecurityDashboard } from '@/components/admin/security/SecurityDashboard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CommunicationsTable } from '@/components/admin/communications/CommunicationsTable';
import { UserManagement } from '@/components/admin/users/UserManagement';
import { SecurityMetricsCard } from '@/components/admin/dashboard/SecurityMetricsCard';
import { LiveActivityFeed } from '@/components/admin/dashboard/LiveActivityFeed';
import { AlertsCenter } from '@/components/admin/dashboard/AlertsCenter';
import AdminDataHub from '@/components/admin/dashboard/AdminDataHub';
import { AppSidebarAdmin } from '@/components/admin/AppSidebarAdmin';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useAuctionMutations } from '@/hooks/useAuctionMutations';
import { useServiceMutations } from '@/hooks/useServiceMutations';
import { useServiceProviderMutations } from '@/hooks/useServiceProviderMutations';
import type { Category } from '@/hooks/useCategoryMutations';
import { useToast } from '@/hooks/use-toast';
import { useDashboardStats, useRevenueStats } from '@/hooks/useDashboardStats';
import { useUserMutations } from '@/hooks/useUserManagement';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import type { Product, Auction, Service, ServiceProvider } from '@/types/unified';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // HOOKS FIRST - before any calculations that use their values
  const { logAdminAction } = useAdminAuditLog();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueStats } = useRevenueStats();
  const { resetCount } = useAdminRealtime();
  
  // Dynamic security status based on alerts (AFTER hooks)
  const securityStatus: 'secure' | 'warning' | 'critical' = (() => {
    const lowStock = dashboardStats?.products.lowStock ?? 0;
    const endingToday = dashboardStats?.auctions.endingToday ?? 0;
    const pending = dashboardStats?.services.pending ?? 0;
    
    if (lowStock > 10 || endingToday > 5) return 'critical';
    if (lowStock > 0 || endingToday > 0 || pending > 5) return 'warning';
    return 'secure';
  })();

  // Track tab changes for audit
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    logAdminAction({
      action: `admin_tab_${value}`,
      details: { tab: value, timestamp: new Date().toISOString() }
    });
    
    // Reset real-time counts when switching to relevant tabs
    if (value === 'messages') {
      resetCount('newCommunications');
    } else if (value === 'bookings') {
      resetCount('newBookings');
    } else if (value === 'orders') {
      resetCount('newOrders');
    } else if (value === 'users') {
      resetCount('newUsers');
    }
  };

  // Handle security dashboard click
  const handleSecurityClick = () => {
    setActiveTab('security');
  };

  // Handle activity feed click
  const handleActivityViewAll = () => {
    // TODO: Navigate to full activity log page
    logAdminAction({
      action: 'view_activity_log',
      details: { timestamp: new Date().toISOString() }
    });
  };

  // Handle alert actions
  const handleAlertAction = (alertId: string, action: string) => {
    logAdminAction({
      action: `alert_${action}`,
      details: { alertId, action, timestamp: new Date().toISOString() }
    });
  };

  // User management handlers - now with real data mutations
  const { updateUserRole, updateUserStatus } = useUserMutations();

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ 
        userId, 
        newRole: newRole as 'admin' | 'moderator' | 'customer' 
      });
      logAdminAction({
        action: 'user_role_change',
        details: { userId, newRole, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus.mutateAsync({ 
        userId, 
        isActive: newStatus === 'active' 
      });
      logAdminAction({
        action: 'user_status_change',
        details: { userId, newStatus, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit'>('create');
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [auctionFormMode, setAuctionFormMode] = useState<'create' | 'edit'>('create');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormMode, setServiceFormMode] = useState<'create' | 'edit'>('create');
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  
  
  const { createProduct, updateProduct, deleteProduct, error } = useProductMutations();
  const { createAuction, updateAuction, deleteAuction, error: auctionError } = useAuctionMutations();
  const { createService, updateService, deleteService, error: serviceError } = useServiceMutations();
  const { deleteServiceProvider } = useServiceProviderMutations();
  const { toast } = useToast();

  // Category handlers
  const handleCreateCategory = () => {
    // Placeholder for category creation
    console.log('Create category clicked');
  };

  const handleEditCategory = (category: Category) => {
    // Placeholder for category editing
    console.log('Edit category:', category);
  };

  const handleViewCategory = (category: Category) => {
    // Placeholder for category viewing
    console.log('View category:', category);
  };

  const handleDeleteCategory = (category: Category) => {
    // Placeholder for category deletion
    console.log('Delete category:', category);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductFormMode('create');
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormMode('edit');
    setShowProductForm(true);
  };

  const handleViewProduct = (product: Product) => {
    // For now, just edit when viewing
    handleEditProduct(product);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      const success = await deleteProduct(product.id);
      
      if (success) {
        toast({
          title: "Product deleted",
          description: `"${product.title}" has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      let result: Product | null = null;
      
      if (productFormMode === 'create') {
        result = await createProduct({
          title: productData.title!,
          description: productData.description!,
          price: productData.price!,
          originalPrice: productData.originalPrice,
          category: productData.categoryName!,
          brand: productData.brand,
          features: productData.features,
          tags: productData.tags,
          variants: productData.variants,
          images: productData.images,
          image: productData.image ?? undefined
        });
        
        if (result) {
          toast({
            title: "Product created",
            description: `"${result.title}" has been successfully created.`,
          });
        }
      } else if (editingProduct) {
        result = await updateProduct({
          id: editingProduct.id,
          title: productData.title!,
          description: productData.description!,
          price: productData.price!,
          originalPrice: productData.originalPrice,
          category: productData.categoryName!,
          brand: productData.brand,
          features: productData.features,
          tags: productData.tags,
          variants: productData.variants,
          images: productData.images,
          image: productData.image ?? undefined
        });
        
        if (result) {
          toast({
            title: "Product updated",
            description: `"${result.title}" has been successfully updated.`,
          });
        }
      }
      
      if (result) {
        setShowProductForm(false);
        setEditingProduct(null);
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to save product. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Save product error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // Auction handlers
  const handleCreateAuction = () => {
    setEditingAuction(null);
    setAuctionFormMode('create');
    setShowAuctionForm(true);
  };

  const handleEditAuction = (auction: Auction) => {
    setEditingAuction(auction);
    setAuctionFormMode('edit');
    setShowAuctionForm(true);
  };

  const handleViewAuction = (auction: Auction) => {
    // For now, just edit when viewing
    handleEditAuction(auction);
  };

  const handleDeleteAuction = async (auction: Auction) => {
    if (confirm(`Are you sure you want to delete "${auction.title}"?`)) {
      const success = await deleteAuction(auction.id);
      
      if (success) {
        toast({
          title: "Auction deleted",
          description: `"${auction.title}" has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: auctionError ?? "Failed to delete auction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveAuction = async (auctionData: Partial<Auction>) => {
    try {
      let result: Auction | null = null;
      
      if (auctionFormMode === 'create') {
        result = await createAuction({
          title: auctionData.title!,
          starting_bid: auctionData.startingBid!,
          end_time: auctionData.endTime!.toISOString(),
          category: auctionData.category as any,
          condition: auctionData.condition as 'new' | 'like-new' | 'good' | 'fair' | 'poor',
          image: auctionData.image!,
          category_name: auctionData.category
        });
        
        if (result) {
          toast({
            title: "Auction created",
            description: `"${result.title}" has been successfully created.`,
          });
        }
      } else if (editingAuction) {
        result = await updateAuction({
          id: editingAuction.id,
          title: auctionData.title,
          starting_bid: auctionData.startingBid,
          end_time: auctionData.endTime?.toISOString(),
          category: auctionData.category as any,
          condition: auctionData.condition as 'new' | 'like-new' | 'good' | 'fair' | 'poor' | undefined,
          image: auctionData.image ?? undefined,
          category_name: auctionData.category
        });
        
        if (result) {
          toast({
            title: "Auction updated",
            description: `"${result.title}" has been successfully updated.`,
          });
        }
      }
      
      if (result) {
        setShowAuctionForm(false);
        setEditingAuction(null);
      } else {
        toast({
          title: "Error",
          description: auctionError ?? "Failed to save auction. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Save auction error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseAuctionForm = () => {
    setShowAuctionForm(false);
    setEditingAuction(null);
  };

  // Service handlers
  const handleCreateService = () => {
    setEditingService(null);
    setServiceFormMode('create');
    setShowServiceForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormMode('edit');
    setShowServiceForm(true);
  };

  const handleViewService = (service: Service) => {
    // For now, just edit when viewing
    handleEditService(service);
  };

  const handleDeleteService = async (service: Service) => {
    if (confirm(`Are you sure you want to delete "${service.title}"?`)) {
      const success = await deleteService(service.id);
      
      if (success) {
        toast({
          title: "Service deleted",
          description: `"${service.title}" has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: serviceError?.message ?? "Failed to delete service. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    try {
      let result: Service | null = null;
      
      if (serviceFormMode === 'create') {
        result = await createService({
          title: serviceData.title!,
          description: serviceData.description!,
          category: serviceData.category!,
          starting_price: serviceData.startingPrice!,
          duration: serviceData.duration!,
          location: serviceData.location!,
          image: serviceData.image!,
          images: serviceData.images,
          features: serviceData.features,
          provider: serviceData.provider!,
          available_times: serviceData.availableTimes,
          response_time: serviceData.responseTime
        });
        
        if (result) {
          toast({
            title: "Service created",
            description: `"${result.title}" has been successfully created.`,
          });
        }
      } else if (editingService) {
        result = await updateService({
          id: editingService.id,
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          starting_price: serviceData.startingPrice,
          duration: serviceData.duration,
          location: serviceData.location,
          image: serviceData.image ?? undefined,
          images: serviceData.images,
          features: serviceData.features,
          provider: serviceData.provider,
          available_times: serviceData.availableTimes,
          response_time: serviceData.responseTime
        });
        
        if (result) {
          toast({
            title: "Service updated",
            description: `"${result.title}" has been successfully updated.`,
          });
        }
      }
      
      if (result) {
        setShowServiceForm(false);
        setEditingService(null);
      } else {
        toast({
          title: "Error",
          description: serviceError?.message ?? "Failed to save service. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Save service error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  // Service Provider handlers
  const handleCreateProvider = () => {
    setEditingProvider(null);
    setShowProviderForm(true);
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setShowProviderForm(true);
  };

  const handleViewProvider = (provider: ServiceProvider) => {
    handleEditProvider(provider);
  };

  const handleDeleteProvider = async (provider: ServiceProvider) => {
    if (confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      try {
        await deleteServiceProvider(provider.id);
        toast({
          title: "Provider deleted",
          description: `"${provider.name}" has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to delete provider. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCloseProviderForm = () => {
    setShowProviderForm(false);
    setEditingProvider(null);
  };

  // Quick Actions handlers
  const handleProductWithCamera = () => {
    // Open product form but with camera integration
    setEditingProduct(null);
    setProductFormMode('create');
    setShowProductForm(true);
    
    // Show toast to indicate camera functionality
    toast({
      title: "Product Creation",
      description: "Product form opened. Use the camera button to capture product images.",
    });
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
        <AppSidebarAdmin activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          {/* Sidebar Toggle - Always Visible */}
          <div className="bg-white border-b px-4 py-2">
            <SidebarTrigger />
          </div>
          
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {/* Admin Header */}
            <AdminHeader 
              securityStatus={securityStatus}
              onSecurityClick={handleSecurityClick}
            />

            {/* Main Admin Interface */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              {/* Mobile-First Tab Navigation - Hidden when using sidebar */}
              <div className="lg:hidden sticky top-16 z-40 bg-white/80 backdrop-blur-sm border rounded-lg p-2">
                <div className="overflow-x-auto">
                  <TabsList className="flex w-max space-x-1">
                    <TabsTrigger value="dashboard" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-xs">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Package className="h-4 w-4" />
                      <span className="text-xs">Products</span>
                    </TabsTrigger>
                    <TabsTrigger value="auctions" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Gavel className="h-4 w-4" />
                      <span className="text-xs">Auctions</span>
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Wrench className="h-4 w-4" />
                      <span className="text-xs">Services</span>
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs">Messages</span>
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Bookings</span>
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-xs">Orders</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Users</span>
                    </TabsTrigger>
                    <TabsTrigger value="providers" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Building className="h-4 w-4" />
                      <span className="text-xs">Providers</span>
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Tags className="h-4 w-4" />
                      <span className="text-xs">Categories</span>
                    </TabsTrigger>
                    <TabsTrigger value="brands" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Package className="h-4 w-4" />
                      <span className="text-xs">Brands</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex flex-col gap-1 p-2 min-w-[80px]">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs">Security</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="py-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Quick Stats Cards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.products.total.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600">
                        {dashboardStats?.products.lowStock ?? 0} low stock
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.auctions.active ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-orange-600">
                        {dashboardStats?.auctions.endingToday ?? 0} ending today
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats?.services.active ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-blue-600">
                        {dashboardStats?.services.pending ?? 0} pending approval
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${revenueStats?.today.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className={revenueStats?.growth && revenueStats.growth > 0 ? "text-green-600" : "text-red-600"}>
                        {revenueStats?.growth ? (revenueStats.growth > 0 ? '+' : '') + revenueStats.growth.toFixed(1) + '% from yesterday' : 'No change'}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Dashboard Components */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Security Metrics */}
              <SecurityMetricsCard onViewDetails={handleSecurityClick} />
              
              {/* Live Activity Feed */}
              <LiveActivityFeed onViewAll={handleActivityViewAll} />
              
              {/* Alerts Center */}
              <AlertsCenter onAlertAction={handleAlertAction} />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Button onClick={handleCreateProduct} className="h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    <span>Add Product</span>
                  </Button>
                  <Button onClick={handleCreateAuction} variant="outline" className="h-20 flex flex-col gap-2">
                    <Gavel className="h-6 w-6" />
                    <span>Create Auction</span>
                  </Button>
                  <Button onClick={handleCreateService} variant="outline" className="h-20 flex flex-col gap-2">
                    <Wrench className="h-6 w-6" />
                    <span>Add Service</span>
                  </Button>
                  <Button onClick={handleProductWithCamera} variant="outline" className="h-20 flex flex-col gap-2">
                    <Camera className="h-6 w-6" />
                    <span>Photo Product</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Data Hub */}
            <AdminDataHub />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductsTable
              onCreateProduct={handleCreateProduct}
              onEditProduct={handleEditProduct}
              onViewProduct={handleViewProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          {/* Auctions Tab */}
          <TabsContent value="auctions" className="space-y-6">
            <AuctionsTable
              onCreateAuction={handleCreateAuction}
              onEditAuction={handleEditAuction}
              onViewAuction={handleViewAuction}
              onDeleteAuction={handleDeleteAuction}
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <ServicesTable
              onCreateService={handleCreateService}
              onEditService={handleEditService}
              onViewService={handleViewService}
              onDeleteService={handleDeleteService}
            />
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Service Providers</h2>
                <p className="text-muted-foreground">
                  Manage service providers and their profiles
                </p>
              </div>
              <Button onClick={handleCreateProvider}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>
            <ServiceProvidersTable
              onEdit={handleEditProvider}
              onView={handleViewProvider}
              onDelete={handleDeleteProvider}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
                <p className="text-muted-foreground">
                  View and manage all customer orders with complete details
                </p>
              </div>
            </div>

            <OrdersTable />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Booking Management</h2>
                <p className="text-muted-foreground">
                  Manage customer service bookings and appointments
                </p>
              </div>
            </div>

            <BookingsTable />
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Brand Management</h2>
                <p className="text-muted-foreground">
                  Manage brands, view performance, and access brand-specific admin pages
                </p>
              </div>
            </div>
            <BrandManagement />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <CategoriesTable
              onCreateCategory={handleCreateCategory}
              onEditCategory={handleEditCategory}
              onViewCategory={handleViewCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement 
              onUserRoleChange={handleUserRoleChange}
              onUserStatusChange={handleUserStatusChange}
            />
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Communication Management</h2>
                <p className="text-muted-foreground">
                  Manage guest communications, service inquiries, and customer messages
                </p>
              </div>
            </div>

            <CommunicationsTable onCreateBooking={() => handleTabChange('bookings')} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Security Dashboard</h2>
                <p className="text-muted-foreground">
                  Monitor security status, manage access control, and review audit logs
                </p>
              </div>
            </div>
            <SecurityDashboard />
          </TabsContent>
            </Tabs>
          </div>

          <Footer />
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showProductForm}
        onClose={handleCloseProductForm}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={productFormMode}
      />

      {/* Auction Form Modal */}
      <AuctionForm
        isOpen={showAuctionForm}
        onClose={handleCloseAuctionForm}
        onSave={handleSaveAuction}
        auction={editingAuction}
        mode={auctionFormMode}
      />

      {/* Service Form Modal */}
      <ServiceForm
        isOpen={showServiceForm}
        onClose={handleCloseServiceForm}
        onSave={handleSaveService}
        service={editingService}
        mode={serviceFormMode}
      />

      {/* Service Provider Form Modal */}
      <ServiceProviderForm
        isOpen={showProviderForm}
        onClose={handleCloseProviderForm}
        onSave={() => {
          setShowProviderForm(false);
          setEditingProvider(null);
        }}
        provider={editingProvider}
        mode={editingProvider ? 'edit' : 'create'}
      />
    </SidebarProvider>
  );
};

export default Admin;
