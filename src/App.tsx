import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MediaProvider } from "@/contexts/MediaContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { MediaErrorBoundary } from "@/components/ui/MediaErrorBoundary";
import { PersistentMediaPlayer } from "@/components/media/core/PersistentMediaPlayer";
import { RootLayout } from "./components/layout";
import { HomePage } from "./pages/HomePage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { ParticipantDetailPage } from "./pages/ParticipantDetailPage";
import { PartnersPage } from "./pages/PartnersPage";
import { CompleteParticipantProfilePage } from "./pages/CompleteParticipantProfilePage";
import { AuthPage } from "./pages/AuthPage";
import MediaGalleryPage from "./pages/MediaGalleryPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminRoute } from "./components/admin/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProjectEditPage } from "./pages/admin/ProjectEditPage";
import { ParticipantEditPage } from "./pages/admin/ParticipantEditPage";
import { SponsorEditPage } from "./pages/admin/SponsorEditPage";
import { ComponentTest } from "./components/admin/ComponentTest";
import NotFound from "./pages/NotFound";
import { queryClient } from "./lib/queryClient";
import MarketplaceLayout from "./components/marketplace/MarketplaceLayout";
import MarketplaceIndex from "./pages/marketplace/MarketplaceIndex";
import Auctions from "./pages/marketplace/Auctions";
import AuctionDetail from "./pages/marketplace/AuctionDetail";
import Shop from "./pages/marketplace/Shop";
import ProductDetail from "./pages/marketplace/ProductDetail";
import Services from "./pages/marketplace/Services";
import ServiceDetail from "./pages/marketplace/ServiceDetail";
import { CartPage } from "./pages/marketplace/CartPage";
import CheckoutPage from "./pages/marketplace/CheckoutPage";
import { WishlistPage } from "./pages/marketplace/WishlistPage";
import { NotificationsPage } from "./pages/marketplace/NotificationsPage";
import { ProfilePage } from "./pages/marketplace/ProfilePage";
import { OrdersPage as CustomerOrdersPage } from "./pages/marketplace/OrdersPage";
import { WishlistProvider } from "./contexts/marketplace/WishlistContext";
import { CartProvider } from "./contexts/marketplace/CartProvider";
import { NotificationProvider } from "./contexts/marketplace/NotificationProvider";
import { ProtectedRoute } from "./components/marketplace/ProtectedRoute";

import OrderDetailPage from "./pages/admin/OrderDetailPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

// Lazy load admin pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard").then(m => ({ default: m.Dashboard })));
const ProductsPage = lazy(() => import("./pages/admin/ProductsPage").then(m => ({ default: m.ProductsPage })));
const AuctionsPage = lazy(() => import("./pages/admin/AuctionsPage").then(m => ({ default: m.AuctionsPage })));
const ServicesPage = lazy(() => import("./pages/admin/ServicesPage").then(m => ({ default: m.ServicesPage })));
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage").then(m => ({ default: m.OrdersPage })));
const UsersPage = lazy(() => import("./pages/admin/UsersPage").then(m => ({ default: m.UsersPage })));
const ProvidersPage = lazy(() => import("./pages/admin/ProvidersPage").then(m => ({ default: m.ProvidersPage })));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage").then(m => ({ default: m.CategoriesPage })));
const BrandsPage = lazy(() => import("./pages/admin/BrandsPage").then(m => ({ default: m.BrandsPage })));
const BookingsPage = lazy(() => import("./pages/admin/BookingsPage").then(m => ({ default: m.BookingsPage })));
const CommunicationsPage = lazy(() => import("./pages/admin/CommunicationsPage").then(m => ({ default: m.CommunicationsPage })));
const SecurityPage = lazy(() => import("./pages/admin/SecurityPage").then(m => ({ default: m.SecurityPage })));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ParticipantsManagementPage = lazy(() => import("./pages/admin/ParticipantsManagementPage").then(m => ({ default: m.ParticipantsManagementPage })));
const ProjectsManagementPage = lazy(() => import("./pages/admin/ProjectsManagementPage").then(m => ({ default: m.ProjectsManagementPage })));
const SponsorsManagementPage = lazy(() => import("./pages/admin/SponsorsManagementPage").then(m => ({ default: m.SponsorsManagementPage })));
const MediaLibraryPage = lazy(() => import("./pages/admin/MediaLibraryPage"));
const SubmissionManagementPage = lazy(() => import("./pages/admin/SubmissionManagementPage"));
const MediaSubmissionsPage = lazy(() => import("./pages/admin/MediaSubmissionsPage").then(m => ({ default: m.MediaSubmissionsPage })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <MediaProvider>
          <PermissionProvider>
            <Toaster />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                <Route path="/" element={<RootLayout />}>
                  <Route index element={<Navigate to="/home" replace />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="showcase" element={<ShowcasePage />} />
                  <Route path="showcase/:slug" element={<ProjectDetailPage />} />
                  <Route path="participants" element={<ParticipantsPage />} />
                  <Route path="participants/:slug" element={<ParticipantDetailPage />} />
                  <Route path="partners" element={<PartnersPage />} />
                  <Route path="media" element={<MediaGalleryPage />} />
                </Route>

                {/* Legacy redirects for old marketplace URLs */}
                <Route path="/shop" element={<Navigate to="/marketplace/shop" replace />} />
                <Route path="/shop/:id" element={<Navigate to="/marketplace/shop/:id" replace />} />
                <Route path="/auctions" element={<Navigate to="/marketplace/auctions" replace />} />
                <Route path="/auctions/:id" element={<Navigate to="/marketplace/auctions/:id" replace />} />
                <Route path="/services" element={<Navigate to="/marketplace/services" replace />} />
                <Route path="/services/:id" element={<Navigate to="/marketplace/services/:id" replace />} />

                {/* Auth & Profile Completion */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/participant/complete-profile" element={<CompleteParticipantProfilePage />} />

                {/* Marketplace Routes */}
                <Route path="/marketplace" element={
                  <WishlistProvider>
                    <CartProvider>
                      <NotificationProvider>
                        <MarketplaceLayout />
                      </NotificationProvider>
                    </CartProvider>
                  </WishlistProvider>
                }>
                  <Route index element={<MarketplaceIndex />} />
                  <Route path="auctions" element={<Auctions />} />
                  <Route path="auctions/:id" element={<AuctionDetail />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="shop/:id" element={<ProductDetail />} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/:id" element={<ServiceDetail />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="account" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute>
                      <CustomerOrdersPage />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Order Pages */}
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />
                
                {/* Admin Routes - Nested with Layout */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={
                  <AdminProvider>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </AdminProvider>
                }>
                  <Route index element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="products" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProductsPage />
                    </Suspense>
                  } />
                  <Route path="auctions" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AuctionsPage />
                    </Suspense>
                  } />
                  <Route path="services" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ServicesPage />
                    </Suspense>
                  } />
                  <Route path="orders" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OrdersPage />
                    </Suspense>
                  } />
                  <Route path="users" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <UsersPage />
                    </Suspense>
                  } />
                  <Route path="providers" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProvidersPage />
                    </Suspense>
                  } />
                  <Route path="categories" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <CategoriesPage />
                    </Suspense>
                  } />
                  <Route path="brands" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BrandsPage />
                    </Suspense>
                  } />
                  <Route path="bookings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BookingsPage />
                    </Suspense>
                  } />
                  <Route path="messages" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <CommunicationsPage />
                    </Suspense>
                  } />
                  <Route path="security" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SecurityPage />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SettingsPage />
                    </Suspense>
                  } />
                  <Route path="participants-management" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ParticipantsManagementPage />
                    </Suspense>
                  } />
                  <Route path="projects-management" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProjectsManagementPage />
                    </Suspense>
                  } />
                  <Route path="sponsors-management" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SponsorsManagementPage />
                    </Suspense>
                  } />
                  <Route path="media" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <MediaLibraryPage />
                    </Suspense>
                  } />
                  <Route path="submissions" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SubmissionManagementPage />
                    </Suspense>
                  } />
                  <Route path="media/submissions" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <MediaSubmissionsPage />
                    </Suspense>
                  } />
                </Route>
                
                {/* Direct Admin Edit Routes (outside nested layout) */}
                <Route path="/admin/projects/:slug/edit" element={
                  <AdminProvider>
                    <AdminRoute>
                      <ProjectEditPage />
                    </AdminRoute>
                  </AdminProvider>
                } />
                <Route path="/admin/participants/:slug/edit" element={
                  <AdminProvider>
                    <AdminRoute>
                      <ParticipantEditPage />
                    </AdminRoute>
                  </AdminProvider>
                } />
                <Route path="/admin/sponsors/:slug/edit" element={
                  <AdminProvider>
                    <AdminRoute>
                      <SponsorEditPage />
                    </AdminRoute>
                  </AdminProvider>
                } />
                <Route path="/admin/orders/:orderId" element={
                  <AdminProvider>
                    <AdminRoute>
                      <OrderDetailPage />
                    </AdminRoute>
                  </AdminProvider>
                } />
                
                {/* Component compatibility test */}
                <Route path="/component-test" element={<ComponentTest />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <PersistentMediaPlayer />
            </BrowserRouter>
            <MediaErrorBoundary>
              <div />
            </MediaErrorBoundary>
          </PermissionProvider>
        </MediaProvider>
      </AdminAuthProvider>
    </TooltipProvider>
    {/* React Query DevTools - only in development */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
