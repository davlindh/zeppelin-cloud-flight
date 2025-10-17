import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useSponsors } from '@/contexts/AdminContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const SponsorManagementList = () => {
  const navigate = useNavigate();
  const { sponsors, isLoading, error, deleteSponsor, fetchSponsors } = useSponsors();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<string | null>(null);

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sponsor.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (sponsorId: string) => {
    navigate(`/admin/sponsors/${sponsorId}/edit`);
  };

  const handleDeleteClick = (sponsorId: string) => {
    setSponsorToDelete(sponsorId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sponsorToDelete) return;
    
    try {
      await deleteSponsor(sponsorToDelete);
      toast.success('Sponsor raderad');
      await fetchSponsors();
    } catch (error) {
      toast.error('Kunde inte radera sponsor');
      console.error('Error deleting sponsor:', error);
    } finally {
      setDeleteDialogOpen(false);
      setSponsorToDelete(null);
    }
  };

  const getSponsorTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'main': return 'default';
      case 'partner': return 'secondary';
      case 'supporter': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSponsors} className="mt-4">
          Försök igen
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök sponsorer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredSponsors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Inga sponsorer hittades.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sponsor.name}</span>
                        <Badge variant={getSponsorTypeBadgeVariant(sponsor.type)}>
                          {sponsor.type}
                        </Badge>
                      </div>
                      {sponsor.website && (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          {sponsor.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sponsor.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(sponsor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {sponsor.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Detta kommer permanent radera sponsorn. Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Radera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
