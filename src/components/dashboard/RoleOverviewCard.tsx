import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { CheckCircle2 } from 'lucide-react';

interface Capability {
  label: string;
  description: string;
}

const roleCapabilities: Record<string, Capability[]> = {
  admin: [
    { label: 'Full systemåtkomst', description: 'Hantera alla användare och innehåll' },
    { label: 'Godkänna ansökningar', description: 'Granska och godkänna roller' },
    { label: 'Systemkonfiguration', description: 'Ändra inställningar' },
  ],
  provider: [
    { label: 'Skapa tjänster', description: 'Erbjud dina tjänster till kunder' },
    { label: 'Hantera bokningar', description: 'Ta emot och hantera bokningar' },
    { label: 'Portfolio', description: 'Visa upp dina tidigare projekt' },
  ],
  participant: [
    { label: 'Projektdeltagande', description: 'Delta i aktiva projekt' },
    { label: 'Profilsida', description: 'Din egen publika profil' },
    { label: 'Media-uppladdning', description: 'Ladda upp bilder och videos' },
  ],
  seller: [
    { label: 'Sälja produkter', description: 'Lista och sälj produkter' },
    { label: 'Lagerhantering', description: 'Hantera ditt lager' },
    { label: 'Försäljningsanalys', description: 'Se statistik och försäljning' },
  ],
  customer: [
    { label: 'Köpa produkter', description: 'Handla i vår marketplace' },
    { label: 'Boka tjänster', description: 'Boka tjänster från leverantörer' },
    { label: 'Beställningshistorik', description: 'Se dina tidigare köp' },
  ],
};

interface RoleOverviewCardProps {
  role: string;
}

export const RoleOverviewCard: React.FC<RoleOverviewCardProps> = ({ role }) => {
  const capabilities = roleCapabilities[role] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RoleBadge role={role as any} size="lg" />
        </CardTitle>
        <CardDescription>
          Dina nuvarande behörigheter med denna roll
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {capabilities.map((capability, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{capability.label}</p>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
