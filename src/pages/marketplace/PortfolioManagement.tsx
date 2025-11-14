import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { PortfolioManagementSection } from '@/components/marketplace/services/portfolio/PortfolioManagementSection';
import { ProviderProjectsSection } from '@/components/marketplace/services/portfolio/ProviderProjectsSection';
import { PortfolioBatchUpload } from '@/components/marketplace/services/portfolio/PortfolioBatchUpload';
import { PortfolioImageBatchUpload } from '@/components/marketplace/services/portfolio/PortfolioImageBatchUpload';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PortfolioManagement = () => {
  const navigate = useNavigate();
  
  // Get current user's provider profile
  const { data: provider, isLoading } = useQuery({
    queryKey: ['current-provider'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('service_providers' as any)
        .select('id, name, email')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;
      return data as unknown as { id: string; name: string; email: string };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You need to be a registered service provider to access portfolio management.
            </p>
            <Button onClick={() => navigate('/services')}>
              Go to Services
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
          <p className="text-muted-foreground">
            Manage your portfolio items and showcase your work
          </p>
        </div>

        <div className="space-y-8">
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manage">Hantera</TabsTrigger>
              <TabsTrigger value="projects">Projekt</TabsTrigger>
              <TabsTrigger value="csv">Batch CSV</TabsTrigger>
              <TabsTrigger value="images">Batch Bilder</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-6">
              <PortfolioManagementSection providerId={provider.id} />
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <ProviderProjectsSection providerId={provider.id} isOwner={true} />
            </TabsContent>

            <TabsContent value="csv" className="mt-6">
              <PortfolioBatchUpload providerId={provider.id} />
            </TabsContent>

            <TabsContent value="images" className="mt-6">
              <PortfolioImageBatchUpload providerId={provider.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PortfolioManagement;
