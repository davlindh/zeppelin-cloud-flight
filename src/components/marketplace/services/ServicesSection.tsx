
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UnifiedServiceCard } from '@/components/ui/unified-service-card';
import { ServiceLoading } from '@/components/ui/service-loading';
import { ServiceError } from '@/components/ui/service-error';
import { useServices } from '@/hooks/useServices';
import { getImageUrl } from '@/utils/imageUtils';

const ServicesSection = () => {
  // Fetch featured services from database
  const { 
    data: services = [], 
    isLoading, 
    error,
    refetch 
  } = useServices({ 
    available: true 
  });

  // Get top 3 highest rated services for featured display
  const featuredServices = React.useMemo(() => {
    return services
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [services]);

  const handleQuickView = (serviceId: string) => {
    console.log('Quick view service:', serviceId);
    // Implement quick view modal logic
  };

  const handleQuickBook = (serviceId: string) => {
    console.log('Quick book service:', serviceId);
    // Implement quick booking modal logic
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <section id="services" className="section-spacing">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="heading-section mb-4">
            Premium Services
          </h2>
          <p className="text-body-large max-w-2xl mx-auto">
            Connect with verified professionals for personalized services and expert consultations.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid-responsive mb-8">
            <ServiceLoading count={3} />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8 mb-8">
            <ServiceError 
              variant="inline"
              error={error}
              onRetry={handleRetry}
              title="Failed to load featured services"
              message="We couldn't load the services. Please try again."
            />
          </div>
        )}

        {/* Featured Services */}
        {!isLoading && !error && featuredServices.length > 0 && (
          <div className="grid-responsive mb-8">
            {featuredServices.map((service) => (
              <UnifiedServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                provider={service.provider}
                providerRating={service.providerRating}
                rating={service.rating}
                reviews={service.reviews}
                startingPrice={service.startingPrice}
                duration={service.duration}
                category={service.category}
                location={service.location}
                available={service.available}
                image={getImageUrl(service.image)}
                responseTime={service.responseTime}
                variant="enhanced"
                onQuickView={() => handleQuickView(service.id)}
                onQuickBook={() => handleQuickBook(service.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && featuredServices.length === 0 && (
          <div className="text-center py-8 mb-8">
            <p className="text-slate-600 mb-4">No featured services available at the moment</p>
            <p className="text-metadata">Please check back later.</p>
          </div>
        )}

        <div className="text-center">
          <Link to="/services">
            <Button variant="outline" size="lg">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
