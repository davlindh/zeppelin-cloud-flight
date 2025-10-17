import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle } from 'lucide-react';
import { SubmissionList } from './components/SubmissionList';
import { SubmissionDetailModal } from './components/SubmissionDetailModal';
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
    exportToJSON,
    approveMedia,
    rejectMedia,
    convertMediaToLibrary
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
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Ansökningar</CardTitle>
            <div className="flex items-center gap-4">
              {stats.pending > 0 && (
                <Badge variant="destructive">
                  {stats.pending} väntande
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {stats.total} totalt
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök titel, namn eller email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Alla typer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla typer ({stats.total})</SelectItem>
                <SelectItem value="project">Projekt ({stats.byType.project})</SelectItem>
                <SelectItem value="participant">Deltagare ({stats.byType.participant})</SelectItem>
                <SelectItem value="media">Media ({stats.byType.media})</SelectItem>
                <SelectItem value="collaboration">Samarbete ({stats.byType.collaboration})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                Alla ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Väntande ({stats.pending})
                {stats.pending === 0 && <CheckCircle className="ml-2 h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Godkända ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Avvisade ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {currentTab === 'pending' && stats.pending === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Bra jobbat!</h3>
                  <p className="text-muted-foreground mb-4">
                    Det finns inga väntande ansökningar att granska just nu.
                  </p>
                </Card>
              ) : (
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
              )}
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

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => {
          console.log('Closing modal, selectedSubmission was:', selectedSubmission?.id);
          setSelectedSubmission(null);
        }}
        onApproveMedia={(submissionId) => {
          console.log('Approving media for submission:', submissionId);
          approveMedia(submissionId);
        }}
        onRejectMedia={(submissionId) => {
          console.log('Rejecting media for submission:', submissionId);
          rejectMedia(submissionId);
        }}
        onConvertMedia={(submission) => {
          console.log('Converting media for submission:', submission.id);
          convertMediaToLibrary(submission);
        }}
      />
    </div>
  );
};
