

import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/marketplace/ui/page-header';
import { ServiceImageGallery } from '@/components/marketplace/services/ServiceImageGallery';
import { ServiceDetailsCard } from '@/components/marketplace/services/ServiceDetailsCard';
import { ServiceProviderProfile } from '@/components/marketplace/services/ServiceProviderProfile';
import { ServiceBookingCard } from '@/components/marketplace/services/ServiceBookingCard';
import { EnhancedGuestCommunication } from '@/components/marketplace/communication/EnhancedGuestCommunication';
import { ServiceLoading } from '@/components/marketplace/ui/service-loading';
import { ServiceError } from '@/components/marketplace/ui/service-error';
import { ShareServiceButton } from '@/components/marketplace/services/ShareServiceButton';
import { ServiceRatingsSummary } from '@/components/marketplace/services/reviews/ServiceRatingsSummary';
import { ServiceReviewsList } from '@/components/marketplace/services/reviews/ServiceReviewsList';
import { ServiceReviewForm } from '@/components/marketplace/services/reviews/ServiceReviewForm';
import { ServiceFAQ } from '@/components/marketplace/services/ServiceFAQ';

import { useService } from '@/hooks/marketplace/useService';
import { useSocialProof } from '@/hooks/marketplace/useSocialProof';
import { useServiceReviews } from '@/hooks/marketplace/useServiceReviews';
import React from 'react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch service from database
  const { 
    data: service, 
    isLoading, 
    error, 
    refetch 
  } = useService(id ?? '');

  // Centralized view tracking
  const { recordView } = useSocialProof(id ?? '', 'service');
  
  // Fetch reviews for summary
  const { data: reviews } = useServiceReviews(id ?? '');
  
  // Generate session ID for anonymous helpful voting
  const [sessionId] = React.useState(() => `sess_${Math.random().toString(36).substr(2, 9)}`);
  
  // Record view once when service loads
  React.useEffect(() => {
    if (service) {
      recordView();
    }
  }, [service?.id, recordView]);

  const handleGoHome = (): void => {
    navigate('/services');
  };

  const handleRetry = (): void => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ServiceLoading variant="gallery" />
              <ServiceLoading variant="details" />
            </div>
            <div className="space-y-6">
              <ServiceLoading variant="compact" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ServiceError
          variant="page"
          error={error || undefined}
          onRetry={handleRetry}
            onGoHome={handleGoHome}
            title={error?.message === 'Service not found' ? 'Service not found' : 'Failed to load service'}
            message={error?.message === 'Service not found' 
              ? "The service you're looking for doesn't exist or has been removed."
              : "We couldn't load this service. Please try again."
            }
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-start justify-between gap-4 mb-6">
          <PageHeader
            title={service.title}
            breadcrumbs={[
              { label: 'Services', href: '/services' },
              { label: service.category, href: `/services?category=${service.category}` },
              { label: service.title }
            ]}
            backLink={{
              href: '/services',
              label: 'Back to Services'
            }}
          />
          
          {/* Share Button */}
          <div className="flex-shrink-0 pt-8">
            <ShareServiceButton
              serviceTitle={service.title}
              variant="outline"
              size="default"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ServiceImageGallery 
              images={service.images?.length ? service.images : ['/placeholder.svg']}
              title={service.title}
            />

            <ServiceDetailsCard
              title={service.title}
              description={service.description}
              duration={service.duration}
              location={service.providerDetails.location}
              price={service.startingPrice}
              category={service.category}
              features={service.features}
            />

            <ServiceProviderProfile
              provider={{
                ...service.providerDetails,
                avatar: service.providerDetails.avatar ?? undefined
              }}
              category={service.category}
            />

            {/* FAQ Section */}
            {service.faqs && service.faqs.length > 0 && (
              <ServiceFAQ faqs={service.faqs} />
            )}

            {/* Reviews Section */}
            <div className="space-y-6">
              <ServiceRatingsSummary reviews={reviews || []} />
              <ServiceReviewsList serviceId={service.id} sessionId={sessionId} />
              <ServiceReviewForm serviceId={service.id} />
            </div>
          </div>

          {/* Booking and Communication Sidebar */}
          <div className="space-y-6">
            <ServiceBookingCard
              serviceId={service.id}
            />
            
            <EnhancedGuestCommunication
              providerId={service.id}
              providerName={service.providerDetails.name}
              providerEmail={service.providerDetails.email}
              serviceContext={{
                serviceId: service.id,
                serviceName: service.title,
                servicePrice: service.startingPrice
              }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
