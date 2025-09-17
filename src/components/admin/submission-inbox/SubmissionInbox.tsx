import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { SubmissionList } from './components/SubmissionList';
import { useSubmissionData } from './hooks/useSubmissionData';
import { useSubmissionActions } from './hooks/useSubmissionActions';
import { SubmissionEditModal } from '../SubmissionEditModal';
import { ConversionModal } from '../ConversionModal';
import type { EnhancedSubmission } from './hooks/useSubmissionData';

export const SubmissionInbox: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedSubmission | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<EnhancedSubmission | null>(null);
  const [convertingSubmission, setConvertingSubmission] = useState<EnhancedSubmission | null>(null);
  const [currentTab, setCurrentTab] = useState('all');

  const {
    submissions,
    filteredSubmissions,
    loading,
    searchTerm,
    filters,
    stats,
    setSearchTerm,
    setFilters
  } = useSubmissionData();

  const {
    updateStatus,
    deleteSubmission,
    exportToCSV,
    exportToJSON
  } = useSubmissionActions();

  // Filter submissions based on current tab
  const getFilteredSubmissions = () => {
    switch (currentTab) {
      case 'pending':
        return filteredSubmissions.filter(s => s.status === 'pending');
      case 'approved':
        return filteredSubmissions.filter(s => s.status === 'approved');
      case 'rejected':
        return filteredSubmissions.filter(s => s.status === 'rejected');
      default:
        return filteredSubmissions;
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const visibleSubmissions = getFilteredSubmissions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Inlämningar</span>
            <span className="text-sm text-muted-foreground">
              {stats.total} totalt
            </span>
          </CardTitle>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök i inlämningar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alla typer</option>
                <option value="project">Projekt</option>
                <option value="participant">Deltagare</option>
                <option value="media">Media</option>
                <option value="collaboration">Samarbete</option>
              </select>

              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alla erfarenheter</option>
                <option value="beginner">Nybörjare</option>
                <option value="intermediate">Medel</option>
                <option value="experienced">Erfaren</option>
                <option value="expert">Expert</option>
              </select>

              <Button
                variant="outline"
                onClick={() => exportToCSV(filteredSubmissions)}
                title="Exportera alla inlämningar som CSV"
              >
                Export CSV
              </Button>

              <Button
                variant="outline"
                onClick={() => setFilters({
                  ...filters,
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                })}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                Alla ({filteredSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Väntande ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Godkända ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Avvisade ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              <SubmissionList
                submissions={visibleSubmissions}
                selectedSubmission={selectedSubmission}
                onSelect={setSelectedSubmission}
                onEdit={setEditingSubmission}
                onConvert={setConvertingSubmission}
                onApprove={(id) => updateStatus(id, 'approved')}
                onReject={(id) => updateStatus(id, 'rejected')}
                onExport={exportToJSON}
                onDelete={deleteSubmission}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
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
