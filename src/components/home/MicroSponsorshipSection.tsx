import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Coffee, Hammer, Cpu, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SponsorshipTier {
  id: string;
  amount: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  impact: string;
}

const sponsorshipTiers: SponsorshipTier[] = [
  {
    id: 'fika',
    amount: 50,
    title: 'Köp en fika',
    description: 'Till en konstnär under residenset',
    icon: <Coffee className="w-6 h-6" />,
    color: 'from-amber-400 to-orange-500',
    impact: 'Ger energi till en hel kreativ eftermiddag',
  },
  {
    id: 'virke',
    amount: 200,
    title: 'Sponsra virke',
    description: 'Material till en installation',
    icon: <Hammer className="w-6 h-6" />,
    color: 'from-emerald-400 to-teal-500',
    impact: 'Bidrar till fysisk konst som stannar kvar',
  },
  {
    id: 'tech',
    amount: 500,
    title: 'Tech-support',
    description: 'Digitala verktyg och utrustning',
    icon: <Cpu className="w-6 h-6" />,
    color: 'from-blue-400 to-indigo-500',
    impact: 'Möjliggör digital innovation och experiment',
  },
];

interface MicroSponsorshipSectionProps {
  className?: string;
}

export const MicroSponsorshipSection: React.FC<MicroSponsorshipSectionProps> = ({ className }) => {
  const { toast } = useToast();
  const [copiedTier, setCopiedTier] = useState<string | null>(null);
  const SWISH_NUMBER = '123-456 78 90'; // Replace with actual Swish number
  const REVOLUT_LINK = 'https://revolut.me/davidxt0s';

  const handleCopySwish = (tierId: string) => {
    navigator.clipboard.writeText(SWISH_NUMBER.replace(/[- ]/g, ''));
    setCopiedTier(tierId);
    toast({
      title: 'Swish-nummer kopierat!',
      description: `Märk din donation med "zeppel-${tierId}"`,
    });
    setTimeout(() => setCopiedTier(null), 3000);
  };

  const handleRevolutClick = (tier: SponsorshipTier) => {
    window.open(REVOLUT_LINK, '_blank');
    toast({
      title: 'Tack för ditt stöd!',
      description: `Märk gärna din donation med "zeppel-${tier.id}"`,
    });
  };

  return (
    <section className={`py-8 sm:py-12 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Stöd Zeppel Inn direkt
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Varje krona gör skillnad. Välj hur du vill bidra och se exakt vad din donation möjliggör.
            </p>
          </div>

          {/* Sponsorship Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {sponsorshipTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-rose-200 group">
                  <CardContent className="p-5 text-center">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${tier.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {tier.icon}
                    </div>

                    {/* Amount */}
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {tier.amount} kr
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      {tier.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-3">
                      {tier.description}
                    </p>

                    {/* Impact */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4">
                      <p className="text-xs text-gray-600 italic">
                        "{tier.impact}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleRevolutClick(tier)}
                        className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white font-medium`}
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Betala via Revolut
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopySwish(tier.id)}
                        className="w-full text-gray-600 hover:text-gray-800"
                        size="sm"
                      >
                        {copiedTier === tier.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Kopierat!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Kopiera Swish
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Eller välj ett valfritt belopp:
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(REVOLUT_LINK, '_blank')}
              className="border-rose-300 text-rose-600 hover:bg-rose-50"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donera valfritt belopp
            </Button>
            <p className="text-xs text-gray-400 mt-3">
              Märk din donation med "zeppel" och ditt namn så tackar vi dig personligen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
