import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MediaProvider } from "@/contexts/MediaContext";
import { UnifiedMediaProvider } from "@/contexts/UnifiedMediaContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { MediaErrorBoundary } from "@/components/ui/MediaErrorBoundary";
import { RootLayout } from "./components/layout";
import { HomePage } from "./pages/HomePage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { ParticipantDetailPage } from "./pages/ParticipantDetailPage";
import { PartnersPage } from "./pages/PartnersPage";
import MediaGalleryPage from "./pages/MediaGalleryPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminRoute } from "./components/admin/AdminRoute";
import { ProjectEditPage } from "./pages/admin/ProjectEditPage";
import { ParticipantEditPage } from "./pages/admin/ParticipantEditPage";
import { SponsorEditPage } from "./pages/admin/SponsorEditPage";
import { ComponentTest } from "./components/admin/ComponentTest";
import NotFound from "./pages/NotFound";
import { queryClient } from "./lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <MediaProvider>
          <UnifiedMediaProvider>
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
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={
                  <AdminProvider>
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  </AdminProvider>
                } />

                {/* Direct Admin Edit Routes */}
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
                
                {/* Component compatibility test */}
                <Route path="/component-test" element={<ComponentTest />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <MediaErrorBoundary>
              <div />
            </MediaErrorBoundary>
          </PermissionProvider>
          </UnifiedMediaProvider>
        </MediaProvider>
      </AdminAuthProvider>
    </TooltipProvider>
    {/* React Query DevTools - only in development */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
