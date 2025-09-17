import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';
import { useToast } from '@/hooks/use-toast';
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
  Globe,
  Info,
  X,
  Star,
  Award,
  Shield
} from 'lucide-react';

export const PartnersPage: React.FC = () => {
  const { partners, loading } = usePartnerData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<typeof partners[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Prevent infinite re-renders by stabilizing dependencies
  const lowerSearchTerm = useMemo(() =>
    searchTerm.toLowerCase().trim(),
    [searchTerm]
  );

  // Memoize filtered partners with stable dependencies
  const filteredPartners = useMemo(() => {
    // console.log('Filtering partners:', partners.length);
    if (!partners?.length) return [];

    return partners.filter(partner => {
      if (!partner) return false;

      // Search in both name and alt fields for better results
      const nameMatch = partner.name?.toLowerCase().includes(lowerSearchTerm);
      const altMatch = partner.alt?.toLowerCase().includes(lowerSearchTerm);
      const matchesSearch = !lowerSearchTerm || nameMatch || altMatch;

      // Type filtering
      const matchesType = selectedType === 'all' ||
        partner.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [partners, lowerSearchTerm, selectedType]);

  // Memoize static functions to prevent re-creation on each render
  const getPartnerTypeIcon = useCallback((partnerType: string) => {
    switch (partnerType) {
      case 'main': return <Crown className="h-5 w-5" />;
      case 'supporter': return <Heart className="h-5 w-5" />;
      default: return <HandHeart className="h-5 w-5" />;
    }
  }, []);

  const getPartnerType = useCallback((partnerType: string) => {
    switch (partnerType) {
      case 'main': return 'Huvudsponsor';
      case 'supporter': return 'Supporter';
      default: return 'Partner';
    }
  }, []);

  const getPartnerTypeColor = useCallback((partnerType: string) => {
    switch (partnerType) {
      case 'main': return 'bg-gold-500/10 text-gold-600 border-gold-200';
      case 'supporter': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-200';
    }
  }, []);

  // Memoize partner counts to prevent recalculation on each render
  const partnerCounts = useMemo(() => ({
    total: partners.length,
    main: partners.filter(p => p.type === 'main').length,
    partner: partners.filter(p => p.type === 'partner').length,
    supporter: partners.filter(p => p.type === 'supporter').length
  }), [partners]);

  // Dialog handlers
  const handlePartnerClick = (partner: typeof partners[0]) => {
    setSelectedPartner(partner);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPartner(null);
  };

  const handleWebsiteClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: "Öppnar webbplats",
      description: "Partnerns webbplats öppnas i ett nytt fönster.",
    });
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
              {filteredPartners.map((partner) => (
                <Card
                  key={partner.id}
                  className="card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-500 group overflow-hidden cursor-pointer"
                  onClick={() => handlePartnerClick(partner)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant="outline"
                        className={`${getPartnerTypeColor(partner.type)} mb-3 shadow-soft`}
                      >
                        {getPartnerTypeIcon(partner.type)}
                        <span className="ml-2 font-medium">{getPartnerType(partner.type)}</span>
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePartnerClick(partner);
                        }}
                        title="Mer information"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="aspect-video bg-gradient-to-br from-muted/50 to-background rounded-lg flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      <EnhancedImage
                        src={partner.logo || partner.src || '/images/partners/placeholder-logo.png'}
                        alt={partner.name || partner.alt || 'Partner logo'}
                        className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = '/images/partners/placeholder-logo.png';
                        }}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {partner.name || partner.alt}
                      </h3>
                      {(partner as any)?.description && (
                        <p className="text-muted-foreground mt-2 text-sm line-clamp-3 leading-relaxed">
                          {(partner as any).description}
                        </p>
                      )}
                    </div>

                    {/* Partner Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 text-primary/60" />
                        <span>Organisationspartner</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary/60" />
                        <span>Karlskrona, Sverige</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {partner.href && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWebsiteClick(partner.href);
                          }}
                          className="flex-1 shadow-soft hover:shadow-elegant transition-all duration-300"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Besök webbplats
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePartnerClick(partner);
                        }}
                        className="px-3 hover:bg-primary/10 transition-colors duration-300"
                        title="Mer information"
                      >
                        <Info className="h-4 w-4" />
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

          {/* Partner Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedPartner && (
                    <>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <EnhancedImage
                          src={selectedPartner.logo || selectedPartner.src || '/images/partners/placeholder-logo.png'}
                          alt={selectedPartner.name || selectedPartner.alt || 'Partner logo'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = '/images/partners/placeholder-logo.png';
                          }}
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedPartner.name || selectedPartner.alt}</h2>
                        <Badge
                          variant="outline"
                          className={`${getPartnerTypeColor(selectedPartner.type)} mt-1`}
                        >
                          {getPartnerTypeIcon(selectedPartner.type)}
                          <span className="ml-2">{getPartnerType(selectedPartner.type)}</span>
                        </Badge>
                      </div>
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {(selectedPartner as any)?.description && (
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {(selectedPartner as any).description}
                    </p>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Partner Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Organisation
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Karlskrona, Sverige</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Organisationspartner</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Kontakt
                    </h3>
                    <div className="space-y-2">
                      {selectedPartner?.href && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWebsiteClick(selectedPartner.href)}
                          className="w-full justify-start"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Besök webbplats
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Skicka e-post
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Partner Stats */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Partnerstatus
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {selectedPartner?.type === 'main' ? '⭐' : selectedPartner?.type === 'supporter' ? '💝' : '🤝'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getPartnerType(selectedPartner?.type || 'partner')}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {selectedPartner?.type === 'main' ? '🏆' : '🎯'}
                      </div>
                      <div className="text-xs text-muted-foreground">Engagemang</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {selectedPartner?.type === 'main' ? '🌟' : '✨'}
                      </div>
                      <div className="text-xs text-muted-foreground">Status</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">🚀</div>
                      <div className="text-xs text-muted-foreground">Partner sedan</div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <DialogClose>
                  <Button variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Stäng
                  </Button>
                </DialogClose>
                {selectedPartner?.href && (
                  <Button onClick={() => handleWebsiteClick(selectedPartner.href)}>
                    <Globe className="h-4 w-4 mr-2" />
                    Besök webbplats
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
