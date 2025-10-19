import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NotFound from '@/pages/NotFound';
import { EditPageError } from './EditPageError';
import { EditPageLoading } from './EditPageLoading';
import { EnhancedBreadcrumb } from './EnhancedBreadcrumb';

interface EditPageLayoutProps {
  entityType: 'project' | 'participant' | 'sponsor';
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

// Standard navigation mapping for better UX
const getDefaultReturnPath = (entityType: 'project' | 'participant' | 'sponsor'): string => {
  switch (entityType) {
    case 'project': return '/showcase';
    case 'participant': return '/participants';
    case 'sponsor': return '/partners';
    default: return '/admin';
  }
};

const getEntityTypeDisplay = (entityType: 'project' | 'participant' | 'sponsor'): string => {
  switch (entityType) {
    case 'project': return 'projekt';
    case 'participant': return 'deltagare';
    case 'sponsor': return 'sponsor';
    default: return entityType;
  }
};

export function EditPageLayout({
  entityType,
  title,
  subtitle,
  children,
  isLoading = false,
  error = null,
  breadcrumbs,
}: EditPageLayoutProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const returnPath =
      (location.state as { returnPath?: string })?.returnPath ||
      getDefaultReturnPath(entityType);
    navigate(returnPath);
  };

  if (!slug) {
    return <NotFound />;
  }

  if (error) {
    return <EditPageError error={error} onBack={handleBack} />;
  }

  if (isLoading) {
    return <EditPageLoading />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 space-y-3">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <EnhancedBreadcrumb segments={breadcrumbs} />
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {children}
      </div>
    </div>
  );
};
