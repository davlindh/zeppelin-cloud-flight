import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceProviderPortfolioSection } from '@/components/marketplace/services/portfolio/ServiceProviderPortfolioSection';
import { EnhancedGuestCommunication } from '@/components/marketplace/communication/EnhancedGuestCommunication';
import { useTrackPortfolioView } from '@/hooks/marketplace/usePortfolioAnalytics';
import {
  Star,
  MapPin,
  Briefcase,
  Mail,
  Award,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export const ProviderPortfolioPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const trackView = useTrackPortfolioView();
  const [sessionId] = useState(() => crypto.randomUUID());

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          services:services(count),
          portfolio:service_portfolio_items(*),
          testimonials:service_reviews(*)
        `)
        .eq('slug', slug)
        .eq('portfolio_visible', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-12 space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Provider inte hittad</h1>
          <p className="text-muted-foreground mb-4">
            Denna provider finns inte eller är inte tillgänglig.
          </p>
          <Button onClick={() => navigate('/marketplace/services')}>
            Tillbaka till Services
          </Button>
        </div>
      </div>
    );
  }

  // Track portfolio page view
  useEffect(() => {
    if (provider?.id) {
      trackView.mutate({
        itemId: provider.id, // Using provider ID as proxy for portfolio page view
        providerId: provider.id,
        sessionId
      });
    }
  }, [provider?.id, sessionId]);

  return (
    <>
      <Helmet>
        <title>{provider.name} - Portfolio | Service Marketplace</title>
        <meta name="description" content={provider.portfolio_description || provider.bio} />
        <meta property="og:title" content={`${provider.name} - Portfolio`} />
        <meta property="og:description" content={provider.portfolio_description || provider.bio} />
        <meta property="og:image" content={provider.avatar || ''} />
        <meta property="og:type" content="profile" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={provider.avatar || undefined} />
                <AvatarFallback className="text-2xl">{provider.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{provider.name}</h1>
                    {(provider as any).verified && (
                      <Badge variant="default" className="mb-2">
                        Verifierad Provider
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl">
                  {provider.portfolio_description || provider.bio}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-lg">{provider.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({provider.reviews} recensioner)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <span>{provider.completed_projects} projekt</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{provider.location}</span>
                  </div>

                  {provider.years_in_business && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      <span>{provider.years_in_business} år i branschen</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>Svarar inom {provider.response_time}</span>
                  </div>
                </div>

                {provider.awards && provider.awards.length > 0 && (
                  <div className="mt-4 flex items-start gap-2">
                    <Award className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="flex flex-wrap gap-2">
                      {provider.awards.map((award, idx) => (
                        <Badge key={idx} variant="outline">
                          {award}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                <Button size="lg" className="w-full" onClick={() => {
                  document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <Mail className="w-4 h-4 mr-2" />
                  Kontakta mig
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate('/marketplace/services')}
                >
                  Visa Services
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Work Philosophy */}
        {provider.work_philosophy && (
          <section className="container py-12">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Min Arbetsfilosofi</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {provider.work_philosophy}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Portfolio Section */}
        <section className="container py-12">
          <ServiceProviderPortfolioSection
            providerId={provider.id}
            showFilters={true}
            layout="masonry"
          />
        </section>

        {/* Testimonials Section */}
        {(provider as any).testimonials?.length > 0 && (
          <section className="bg-muted/30 py-12">
            <div className="container">
              <h2 className="text-3xl font-bold mb-8">Vad Kunder Säger</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(provider as any).testimonials.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating / 20
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm mb-4 line-clamp-4">{review.comment}</p>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {review.customer_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {review.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM yyyy', { locale: sv })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact-section" className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2">Kom i Kontakt</h2>
              <p className="text-muted-foreground mb-6">
                Har du ett projekt i åtanke? Skicka ett meddelande till {provider.name}
              </p>
              <EnhancedGuestCommunication
                providerId={provider.id}
                providerName={provider.name}
                providerEmail={provider.email}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};
