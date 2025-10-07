
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

import { PageHeader } from '@/components/ui/page-header';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { UnifiedServiceCard } from '@/components/ui/unified-service-card';
import { ServiceLoading } from '@/components/ui/service-loading';
import { ServiceError } from '@/components/ui/service-error';
import { useServices, type ServiceFilters } from '@/hooks/useServices';
import { useServiceCategories } from '@/hooks/useServiceCategories';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ?? 'all'
  );
  const [sortBy, setSortBy] = useState('rating');

  // Fetch dynamic categories from database
  const { data: categoriesData = [], isLoading: categoriesLoading } = useServiceCategories();
  const categories = ['all', ...categoriesData];

  const filters = React.useMemo(() => {
    const serviceFilters: ServiceFilters = {
      available: true
    };

    if (selectedCategory !== 'all') {
      serviceFilters.category = selectedCategory;
    }

    if (searchTerm.trim()) {
      serviceFilters.search = searchTerm.trim();
    }

    return serviceFilters;
  }, [selectedCategory, searchTerm]);

  // Fetch services from database
  const { 
    data: services = [], 
    isLoading: servicesLoading, 
    error: servicesError,
    refetch: retryServices
  } = useServices(filters);

  // Sort services based on sortBy
  const sortedServices = React.useMemo(() => {
    if (!services.length) return [];

    const sorted = [...services];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.startingPrice - b.startingPrice);
      case 'price-high':
        return sorted.sort((a, b) => b.startingPrice - a.startingPrice);
      case 'rating':
      default:
        return sorted.sort((a, b) => b.rating - a.rating);
    }
  }, [services, sortBy]);
  
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
    }
    
    setSearchParams(params);
  }, [selectedCategory, searchTerm, setSearchParams]);

  // Create enhanced breadcrumbs based on current filter state
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Services', href: '/services' }];
    
    if (selectedCategory !== 'all') {
      const categoryLabel = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        breadcrumbs.push({
          label: categoryLabel,
          href: `/services?category=${selectedCategory}`
        });
    }
    
    return breadcrumbs;
  };

  const handleRetry = () => {
    retryServices();
  };

  const handleQuickView = (serviceId: string) => {
    console.log('Quick view service:', serviceId);
  };

  const handleQuickBook = (serviceId: string) => {
    console.log('Quick book service:', serviceId);
  };

  const isLoading = servicesLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PageHeader
          title="Premium Services"
          description="Connect with verified professionals for personalized services and expert consultations."
          breadcrumbs={getBreadcrumbs()}
        />

        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortOptions={sortOptions}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchPlaceholder="Search services or providers..."
        />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center mt-8">
            <ServiceLoading count={6} />
          </div>
        )}

        {/* Error State */}
        {servicesError && !isLoading && (
          <div className="mt-8">
            <ServiceError 
              variant="page"
              error={servicesError}
              onRetry={handleRetry}
              title="Failed to load services"
              message="We couldn't load the services. Please try again."
            />
          </div>
        )}

        {/* Content */}
        {!isLoading && !servicesError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center mt-8">
              {sortedServices.map((service) => (
                <UnifiedServiceCard 
                  key={service.id} 
                  id={service.id}
                  title={service.title}
                  provider={service.provider}
                  rating={service.rating}
                  reviews={service.reviews}
                  startingPrice={service.startingPrice}
                  duration={service.duration}
                  category={service.category}
                  location={service.location}
                  available={service.available}
                  image={service.image || '/placeholder.svg'}
                  variant="default"
                  onQuickView={() => handleQuickView(service.id)}
                  onQuickBook={() => handleQuickBook(service.id)}
                />
              ))}
            </div>

            {sortedServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-slate-600">No services found matching your criteria.</p>
                <p className="text-sm text-slate-500 mt-2">Try adjusting your search or filter options.</p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Services;
