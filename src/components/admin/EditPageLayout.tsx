import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NotFound from '@/pages/NotFound';
import { EditPageError } from './EditPageError';
import { EditPageLoading } from './EditPageLoading';

interface EditPageLayoutProps {
  entityType: 'project' | 'participant' | 'sponsor';
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
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
  children,
  isLoading = false,
  error = null,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Tillbaka till {getEntityTypeDisplay(entityType)}
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground">
                  Uppdatera {getEntityTypeDisplay(entityType)}information och profil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {children}
      </div>
    </div>
  );
};
