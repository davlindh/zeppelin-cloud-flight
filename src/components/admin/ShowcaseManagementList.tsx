import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, Search, Edit, Trash2, Users, Building, ExternalLink, MoreVertical, Download, Eye, Filter, SortAsc, SortDesc } from 'lucide-react';
import { fetchProjectsWithRelationships, logError } from '@/utils/adminApi';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Participant, Sponsor } from '@/types/admin';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
  participants?: Array<{ role: string; participants: Participant }>;
  sponsors?: Array<{ sponsors: Sponsor }>;
  tags?: string[];
  slug?: string;
}

interface ShowcaseManagementListProps {
  onAddShowcase: () => void;
  onEditShowcase: (showcaseId: string) => void;
  onViewShowcase?: (showcaseId: string) => void;
}

export const ShowcaseManagementList = ({ onAddShowcase, onEditShowcase, onViewShowcase }: ShowcaseManagementListProps) => {
  const { toast } = useToast();
  const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'popular'>('all');
  const [selectedShowcases, setSelectedShowcases] = useState<string[]>([]);

  useEffect(() => {
    const loadShowcases = async () => {
      try {
        setLoading(true);
        const data = await fetchProjectsWithRelationships();
        setShowcases(data as unknown as ShowcaseItem[]);
      } catch (err) {
        logError('loadShowcases', err);
        setError('Failed to load showcase items');
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      const channel = supabase
        .channel('showcase_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadShowcases)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_participants' }, loadShowcases)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_sponsors' }, loadShowcases)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    loadShowcases();
    setupRealtimeSubscription();
  }, []);

  const deleteShowcase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShowcases(prev => prev.filter(item => item.id !== id));
      setSelectedShowcases(prev => prev.filter(itemId => itemId !== id));
      
      toast({
        title: 'Showcase item deleted',
        description: 'The showcase item has been removed successfully.',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete showcase item';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedShowcases.length === 0) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', selectedShowcases);

      if (error) throw error;

      setShowcases(prev => prev.filter(item => !selectedShowcases.includes(item.id)));
      setSelectedShowcases([]);
      
      toast({
        title: 'Bulk delete completed',
        description: `${selectedShowcases.length} showcase items have been deleted.`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete showcase items';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const exportShowcases = () => {
    const csvContent = showcases.map(item => ({
      title: item.title,
      description: item.description,
      participants: String(item.participants?.length || 0),
      sponsors: String(item.sponsors?.length || 0),
      tags: item.tags?.join(', ') || '',
      created: new Date(item.created_at).toLocaleDateString()
    }));

    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).map(value => String(value)))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `showcase-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAndSortedShowcases = () => {
    let filtered = showcases.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply filters
    if (filterBy === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(item => new Date(item.created_at) > oneWeekAgo);
    } else if (filterBy === 'popular') {
      filtered = filtered.filter(item => (item.participants?.length || 0) >= 2);
    }

    

    return filtered;
  };

  const toggleSelectAll = () => {
    if (selectedShowcases.length === filteredAndSortedShowcases().length) {
      setSelectedShowcases([]);
    } else {
      setSelectedShowcases(filteredAndSortedShowcases().map(item => item.id));
    }
  };

  const toggleSelectShowcase = (id: string) => {
    setSelectedShowcases(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Showcase Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-4 text-muted-foreground">Loading showcase items...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredShowcases = filteredAndSortedShowcases();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Showcase Management</CardTitle>
        <div className="flex gap-2">
          {selectedShowcases.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedShowcases.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={bulkDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" onClick={exportShowcases}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={onAddShowcase}>
            <Plus className="h-4 w-4 mr-2" />
            Add Showcase Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search showcase items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={(value: 'all' | 'recent' | 'popular') => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value: string) => {
              const [field, order] = value.split('-');
              setSortBy(field as 'title' | 'created_at' | 'updated_at');
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-40">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredShowcases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No showcase items match your search.' : 'No showcase items found.'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedShowcases.length === filteredShowcases.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Showcase Item</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Sponsors</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShowcases.map((showcase) => (
                  <TableRow key={showcase.id} className={selectedShowcases.includes(showcase.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedShowcases.includes(showcase.id)}
                        onCheckedChange={() => toggleSelectShowcase(showcase.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {showcase.image_path && (
                          <img 
                            src={`https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/project-images/${showcase.image_path}`}
                            alt={showcase.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{showcase.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {showcase.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{showcase.participants?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{showcase.sponsors?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {showcase.tags?.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {showcase.tags?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{showcase.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(showcase.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewShowcase?.(showcase.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditShowcase(showcase.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/showcase/${showcase.slug}`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Public
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteShowcase(showcase.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
