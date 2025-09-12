import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ExternalLink, 
  Search, 
  Building2, 
  Heart, 
  HandHeart, 
  Crown,
  MapPin,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

export const PartnersPage: React.FC = () => {
  const { partners, loading } = usePartnerData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter partners based on search and type
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.alt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || 
      (selectedType === 'main' && partner.alt.includes('Kommun')) ||
      (selectedType === 'partner' && !partner.alt.includes('Kommun') && !partner.alt.includes('Visit')) ||
      (selectedType === 'supporter' && partner.alt.includes('Visit'));
    
    return matchesSearch && matchesType;
  });

  const getPartnerTypeIcon = (partnerName: string) => {
    if (partnerName.includes('Kommun')) return <Crown className="h-5 w-5" />;
    if (partnerName.includes('Visit')) return <Heart className="h-5 w-5" />;
    return <HandHeart className="h-5 w-5" />;
  };

  const getPartnerType = (partnerName: string) => {
    if (partnerName.includes('Kommun')) return 'Huvudsponsor';
    if (partnerName.includes('Visit')) return 'Supporter';
    return 'Partner';
  };

  const getPartnerTypeColor = (partnerName: string) => {
    if (partnerName.includes('Kommun')) return 'bg-gold-500/10 text-gold-600 border-gold-200';
    if (partnerName.includes('Visit')) return 'bg-purple-500/10 text-purple-600 border-purple-200';
    return 'bg-blue-500/10 text-blue-600 border-blue-200';
  };

  const partnerCounts = {
    total: partners.length,
    main: partners.filter(p => p.alt.includes('Kommun')).length,
    partner: partners.filter(p => !p.alt.includes('Kommun') && !p.alt.includes('Visit')).length,
    supporter: partners.filter(p => p.alt.includes('Visit')).length
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-muted rounded-lg w-2/3 mx-auto"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-subtle opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in space-y-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl gradient-primary shadow-glow">
                <Users className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Våra <span className="gradient-text">Partners</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Tillsammans skapar vi framtidens kreativa samarbeten. Möt de organisationer 
              som stödjer vår vision och gör våra projekt möjliga.
            </p>

            {/* Partner Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-12">
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{partnerCounts.total}</div>
                <div className="text-sm text-muted-foreground">Totalt</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{partnerCounts.main}</div>
                <div className="text-sm text-muted-foreground">Huvudsponsorer</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{partnerCounts.partner}</div>
                <div className="text-sm text-muted-foreground">Partners</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{partnerCounts.supporter}</div>
                <div className="text-sm text-muted-foreground">Supporters</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Search and Filter Section */}
          <Card className="card-enhanced border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Sök efter partner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Tabs value={selectedType} onValueChange={setSelectedType}>
                  <TabsList className="grid w-full md:w-auto grid-cols-4">
                    <TabsTrigger value="all">Alla</TabsTrigger>
                    <TabsTrigger value="main">Huvudsponsorer</TabsTrigger>
                    <TabsTrigger value="partner">Partners</TabsTrigger>
                    <TabsTrigger value="supporter">Supporters</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Partners Grid */}
          {filteredPartners.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPartners.map((partner, index) => (
                <Card 
                  key={index} 
                  className="card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-500 group overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge 
                        variant="outline" 
                        className={`${getPartnerTypeColor(partner.alt)} mb-3`}
                      >
                        {getPartnerTypeIcon(partner.alt)}
                        <span className="ml-2">{getPartnerType(partner.alt)}</span>
                      </Badge>
                    </div>
                    
                    <div className="aspect-video bg-gradient-to-br from-muted/50 to-background rounded-lg flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={partner.src}
                        alt={partner.alt}
                        className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/images/partners/placeholder-logo.png';
                        }}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {partner.alt}
                      </h3>
                      {partner.tagline && (
                        <p className="text-muted-foreground mt-2">
                          {partner.tagline}
                        </p>
                      )}
                    </div>

                    {/* Partner Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Organisationspartner</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Karlskrona, Sverige</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {partner.href && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <a
                            href={partner.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            Besök webbplats
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-3"
                        title="Kontaktinformation"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-enhanced border-0 shadow-elegant">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Inga partners hittades
                </h3>
                <p className="text-muted-foreground mb-6">
                  Prova att justera dina sökkriterier eller filtreringsalternativ.
                </p>
                <Button onClick={() => { setSearchTerm(''); setSelectedType('all'); }}>
                  Rensa filter
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Call to Action Section */}
          <Card className="card-enhanced border-0 shadow-glow bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-4 rounded-2xl gradient-primary inline-block shadow-glow">
                  <HandHeart className="h-8 w-8 text-primary-foreground" />
                </div>
                
                <h2 className="text-3xl font-bold text-foreground">
                  Bli vår partner
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Är du intresserad av att stödja kreativa projekt och innovation? 
                  Vi välkomnar nya partners som delar vår vision för framtiden.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="shadow-elegant hover:shadow-glow">
                    <Mail className="mr-2 h-5 w-5" />
                    Kontakta oss
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild
                  >
                    <Link to="/showcase">
                      Se våra projekt
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};