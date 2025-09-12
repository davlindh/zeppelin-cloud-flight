import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Edit, Trash2, ExternalLink, Globe } from 'lucide-react';
import { fetchSponsors, logError } from '@/utils/adminApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SponsorManagementListProps {
  onAddSponsor: () => void;
}

export const SponsorManagementList = ({ onAddSponsor }: SponsorManagementListProps) => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const data = await fetchSponsors();
      setSponsors(data);
    } catch (err) {
      logError('loadSponsors', err);
      setError('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSponsorTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'main': return 'default';
      case 'partner': return 'secondary';
      case 'supporter': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sponsor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading sponsors...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sponsor Management</CardTitle>
        <Button onClick={onAddSponsor}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sponsors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filteredSponsors.length === 0 ? (
          <p className="text-muted-foreground">No sponsors found.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSponsors.map((sponsor) => (
                  <TableRow key={sponsor.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={sponsor.logo_path} />
                          <AvatarFallback>
                            {sponsor.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sponsor.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSponsorTypeBadgeVariant(sponsor.type)}>
                        {sponsor.type.charAt(0).toUpperCase() + sponsor.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sponsor.website ? (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={sponsor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Visit
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No website</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(sponsor.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {sponsor.website && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};