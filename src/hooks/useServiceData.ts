
import { useState, useEffect } from 'react';
import { getEnhancedServiceData, getAllServices, Service } from '@/utils/serviceUtils';

interface UseServiceDataOptions {
  serviceId?: string;
  category?: string;
  autoLoad?: boolean;
}

interface UseServiceDataReturn {
  service: Service | null;
  services: Service[];
  isLoading: boolean;
  error: Error | null;
  loadService: (id: string) => Promise<void>;
  loadServices: (category?: string) => Promise<void>;
  retry: () => void;
}

export const useServiceData = (options: UseServiceDataOptions = {}): UseServiceDataReturn => {
  const { serviceId, category, autoLoad = true } = options;
  
  const [service, setService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadService = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const serviceData = getEnhancedServiceData(id);
      if (!serviceData) {
        throw new Error('Service not found');
      }
      
      setService(serviceData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to load service');
      setError(errorMessage);
      console.error('Service loading error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async (filterCategory?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const allServices = getAllServices();
      const filteredServices = filterCategory && filterCategory !== 'all'
        ? allServices.filter(service => service.category === filterCategory)
        : allServices;
      
      setServices(filteredServices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to load services');
      setError(errorMessage);
      console.error('Services loading error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    if (serviceId) {
      loadService(serviceId);
    } else {
      loadServices(category);
    }
  };

  useEffect(() => {
    if (!autoLoad) return;

    if (serviceId) {
      loadService(serviceId);
    } else {
      loadServices(category);
    }
  }, [serviceId, category, autoLoad]);

  return {
    service,
    services,
    isLoading,
    error,
    loadService,
    loadServices,
    retry
  };
};
