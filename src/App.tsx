import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MediaProvider } from "@/contexts/MediaContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { PersistentPlayer } from "@/components/multimedia/PersistentPlayer";
import { RootLayout } from "../components/layout";
import { HomePage } from "../pages/HomePage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { ParticipantDetailPage } from "./pages/ParticipantDetailPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminRoute } from "./components/admin/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <MediaProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="showcase" element={<ShowcasePage />} />
                <Route path="showcase/:slug" element={<ProjectDetailPage />} />
                <Route path="participants" element={<ParticipantsPage />} />
                <Route path="participants/:slug" element={<ParticipantDetailPage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <PersistentPlayer />
        </MediaProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
