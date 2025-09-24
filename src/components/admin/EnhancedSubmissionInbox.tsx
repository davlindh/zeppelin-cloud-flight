import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Download, 
  Calendar,
  Clock,
  User,
  FileText,
  Image,
  Video,
  Music,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { SubmissionList } from './submission-inbox/components/SubmissionList';
import { useSubmissionData } from './submission-inbox/hooks/useSubmissionData';
import { useSubmissionActions } from './submission-inbox/hooks/useSubmissionActions';
import { SubmissionEditModal } from './SubmissionEditModal';
import { ConversionModal } from './ConversionModal';
import { MediaGallery } from '@/components/multimedia/MediaGallery';
import { cn } from '@/lib/utils';
import type { EnhancedSubmission } from './submission-inbox/hooks/useSubmissionData';

interface SubmissionFilters {
  type: string;
  status: string;
  dateRange: string;
  experience: string;
  hasMedia: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialFilters: SubmissionFilters = {
  type: 'all',
  status: 'all',
  dateRange: 'all',
  experience: 'all',
  hasMedia: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const EnhancedSubmissionInbox: React.FC = () => {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedSubmission | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<EnhancedSubmission | null>(null);
  const [convertingSubmission, setConvertingSubmission] = useState<EnhancedSubmission | null>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [filters, setFilters] = useState<SubmissionFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'media'>('table');

  const {
    submissions,
    loading,
    searchTerm,
    setSearchTerm
  } = useSubmissionData();

  const {
    updateStatus,
    deleteSubmission,
    exportToCSV,
    exportToJSON
  } = useSubmissionActions();

  // Enhanced filtering and sorting
  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          submission.title?.toLowerCase().includes(searchLower) ||
          (typeof submission.content?.name === 'string' && submission.content.name.toLowerCase().includes(searchLower)) ||
          (typeof submission.content?.description === 'string' && submission.content.description.toLowerCase().includes(searchLower)) ||
          submission.contact_email?.toLowerCase().includes(searchLower) ||
          submission.type?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all' && submission.type !== filters.type) return false;
      
      // Status filter
      if (filters.status !== 'all' && submission.status !== filters.status) return false;

      // Date range filter
      if (filters.dateRange !== 'all') {
        const submissionDate = new Date(submission.created_at);
        const now = new Date();
        const daysDiff = (now.getTime() - submissionDate.getTime()) / (1000 * 3600 * 24);
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 1) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      // Experience filter
      if (filters.experience !== 'all') {
        const expLevel = submission.content?.experienceLevel || submission.content?.experience_level;
        if (expLevel !== filters.experience) return false;
      }

      // Media filter
      if (filters.hasMedia !== 'all') {
        const hasFiles = submission.files && submission.files.length > 0;
        if (filters.hasMedia === 'with' && !hasFiles) return false;
        if (filters.hasMedia === 'without' && hasFiles) return false;
      }

      return true;
    });

    // Tab filter
    switch (currentTab) {
      case 'pending':
        filtered = filtered.filter(s => s.status === 'pending');
        break;
      case 'approved':
        filtered = filtered.filter(s => s.status === 'approved');
        break;
      case 'rejected':
        filtered = filtered.filter(s => s.status === 'rejected');
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [submissions, searchTerm, filters, currentTab]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      withMedia: submissions.filter(s => s.files && s.files.length > 0).length,
    };
  }, [submissions]);

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    for (const id of selectedSubmissions) {
      switch (action) {
        case 'approve':
          await updateStatus(id, 'approved');
          break;
        case 'reject':
          await updateStatus(id, 'rejected');
          break;
        case 'delete':
          await deleteSubmission(id);
          break;
      }
    }
    setSelectedSubmissions([]);
  };

  const toggleSubmissionSelection = (id: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    setSelectedSubmissions(filteredAndSortedSubmissions.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedSubmissions([]);
  };

  // Extract media from submissions for media view
  const submissionMedia = useMemo(() => {
    const mediaItems: any[] = [];
    
    filteredAndSortedSubmissions.forEach(submission => {
      if (submission.files && submission.files.length > 0) {
        submission.files.forEach((file: any) => {
          mediaItems.push({
            id: `${submission.id}-${file.name}`,
            title: file.name || submission.title,
            url: file.url,
            type: file.type?.startsWith('image/') ? 'image' : 
                  file.type?.startsWith('video/') ? 'video' : 
                  file.type?.startsWith('audio/') ? 'audio' : 'document',
            description: `From: ${submission.title} (${submission.type})`,
            submission: submission
          });
        });
      }
    });
    
    return mediaItems;
  }, [filteredAndSortedSubmissions]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-elegant bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Inlämningar</h2>
                <p className="text-sm text-muted-foreground">
                  Hantera och granska inkomna inlämningar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.total} totalt</Badge>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {stats.pending} väntande
              </Badge>
            </div>
          </CardTitle>

          {/* Enhanced Search and Controls */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök i titel, innehåll, e-post..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-primary/10")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tabell</SelectItem>
                  <SelectItem value="cards">Kort</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-background border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla typer</SelectItem>
                      <SelectItem value="project">Projekt</SelectItem>
                      <SelectItem value="participant">Deltagare</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="collaboration">Samarbete</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla statusar</SelectItem>
                      <SelectItem value="pending">Väntande</SelectItem>
                      <SelectItem value="approved">Godkänd</SelectItem>
                      <SelectItem value="rejected">Avvisad</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.dateRange} 
                    onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Datum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla datum</SelectItem>
                      <SelectItem value="today">Idag</SelectItem>
                      <SelectItem value="week">Senaste veckan</SelectItem>
                      <SelectItem value="month">Senaste månaden</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.experience} 
                    onValueChange={(value) => setFilters({ ...filters, experience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Erfarenhet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla nivåer</SelectItem>
                      <SelectItem value="beginner">Nybörjare</SelectItem>
                      <SelectItem value="intermediate">Medel</SelectItem>
                      <SelectItem value="experienced">Erfaren</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.hasMedia} 
                    onValueChange={(value) => setFilters({ ...filters, hasMedia: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Media" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla</SelectItem>
                      <SelectItem value="with">Med media</SelectItem>
                      <SelectItem value="without">Utan media</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sortera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Datum</SelectItem>
                      <SelectItem value="title">Titel</SelectItem>
                      <SelectItem value="type">Typ</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(initialFilters)}
                  >
                    Återställ filter
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ 
                        ...filters, 
                        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                      })}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      {filters.sortOrder === 'asc' ? 'Stigande' : 'Fallande'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedSubmissions.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedSubmissions.length === filteredAndSortedSubmissions.length}
                      onCheckedChange={(checked) => {
                        if (checked) selectAllVisible();
                        else clearSelection();
                      }}
                    />
                    <span className="text-sm font-medium">
                      {selectedSubmissions.length} markerade
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('approve')}
                      className="border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Godkänn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('reject')}
                      className="border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Avvisa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      className="border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Ta bort
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Alla ({filteredAndSortedSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                <Clock className="h-4 w-4 mr-1" />
                Väntande ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Godkända ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                <XCircle className="h-4 w-4 mr-1" />
                Avvisade ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {viewMode === 'media' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Media från inlämningar</h3>
                    <Badge variant="secondary">{submissionMedia.length} filer</Badge>
                  </div>
                  <MediaGallery media={submissionMedia} viewMode="grid" />
                </div>
              ) : (
                <SubmissionList
                  submissions={filteredAndSortedSubmissions}
                  selectedSubmission={selectedSubmission}
                  selectedSubmissions={selectedSubmissions}
                  viewMode={viewMode}
                  onSelect={setSelectedSubmission}
                  onToggleSelect={toggleSubmissionSelection}
                  onEdit={setEditingSubmission}
                  onConvert={setConvertingSubmission}
                  onApprove={(id) => updateStatus(id, 'approved')}
                  onReject={(id) => updateStatus(id, 'rejected')}
                  onExport={exportToJSON}
                  onDelete={deleteSubmission}
                  loading={loading}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Export Options */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Visar {filteredAndSortedSubmissions.length} av {stats.total} inlämningar
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filteredAndSortedSubmissions)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportera CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToJSON(filteredAndSortedSubmissions[0])}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportera JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {editingSubmission && (
        <SubmissionEditModal
          submission={editingSubmission}
          isOpen={!!editingSubmission}
          onClose={() => setEditingSubmission(null)}
          onUpdate={() => setEditingSubmission(null)}
        />
      )}

      {convertingSubmission && (
        <ConversionModal
          submission={convertingSubmission}
          isOpen={!!convertingSubmission}
          onClose={() => setConvertingSubmission(null)}
          onSuccess={() => setConvertingSubmission(null)}
        />
      )}
    </div>
  );
};