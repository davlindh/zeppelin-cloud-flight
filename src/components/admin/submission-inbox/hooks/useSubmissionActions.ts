import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateSubmissionStatus, useDeleteSubmission } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedSubmission } from './useSubmissionData';

/**
 * CSV export utility function
 * Moved from component to dedicated function to reduce complexity
 */
export const exportSubmissionsToCSV = (submissions: EnhancedSubmission[]) => {
  const csvHeaders = [
    'ID', 'Type', 'Title', 'Name', 'Email', 'Phone', 'Location',
    'Roles', 'Experience', 'Interests', 'Status', 'Created', 'How Found Us'
  ];

  const csvRows = submissions.map(sub => [
    sub.id,
    sub.type,
    sub.title,
    sub.submitted_by || '',
    sub.contact_email || '',
    sub.contact_phone || '',
    sub.location || '',
    Array.isArray(sub.content.roles) ? sub.content.roles.join('; ') : '',
    sub.content.experienceLevel || '',
    Array.isArray(sub.content.interests) ? sub.content.interests.join('; ') : '',
    sub.status,
    new Date(sub.created_at).toLocaleDateString('sv-SE'),
    sub.how_found_us || ''
  ]);

  const csvContent = [csvHeaders.join(','), ...csvRows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  )].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `submissions-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * JSON export for individual submissions
 */
export const exportSubmissionToJSON = (submission: EnhancedSubmission) => {
  const data = {
    id: submission.id,
    type: submission.type,
    title: submission.title,
    content: submission.content,
    contact: {
      name: submission.submitted_by,
      email: submission.contact_email,
      phone: submission.contact_phone,
      location: submission.location
    },
    metadata: {
      created_at: submission.created_at,
      status: submission.status,
      language_preference: submission.language_preference,
      how_found_us: submission.how_found_us,
      publication_permission: submission.publication_permission
    },
    files: submission.files
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `submission-${submission.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Custom hook for managing submission actions (CRUD operations)
 * Reduces complexity by centralizing business logic
 */
export const useSubmissionActions = () => {
  const { toast } = useToast();

  // TanStack Query mutations for CRUD operations
  const updateStatusMutation = useUpdateSubmissionStatus();
  const deleteMutation = useDeleteSubmission();

  // Loading states for better UX
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Update submission status (approve/reject)
   */
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });

      const statusMessage = status === 'approved' ? 'godkänd' : 'avvisad';
      toast({
        title: `Inlämning ${statusMessage}`,
        description: `Inlämningen har blivit ${statusMessage}.`
      });

      return true;
    } catch (error) {
      const statusMessage = status === 'approved' ? 'godkänna' : 'avvisa';
      toast({
        title: 'Fel',
        description: `Kunde inte ${statusMessage} inlämning`,
        variant: 'destructive'
      });

      return false;
    }
  };

  /**
   * Delete submission
   */
  const deleteSubmission = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);

      toast({
        title: 'Inlämning raderad',
        description: 'Inlämningen har tagits bort.'
      });

      return true;
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte radera inlämning',
        variant: 'destructive'
      });

      return false;
    }
  };

  /**
   * Batch status update
   */
  const batchUpdateStatus = async (ids: string[], status: 'approved' | 'rejected') => {
    const results = await Promise.allSettled(
      ids.map(id => updateStatus(id, status))
    );

    const successful = results.filter(result =>
      result.status === 'fulfilled' && result.value
    ).length;

    const failed = results.length - successful;

    if (successful > 0) {
      toast({
        title: 'Batchuppdatering klar',
        description: `${successful} inlämningar uppdaterades framgångsrikt.`
      });
    }

    if (failed > 0) {
      toast({
        title: 'Delvis misslyckad',
        description: `${failed} inlämningar kunde inte uppdateras.`,
        variant: failed === results.length ? 'destructive' : 'default'
      });
    }

    return { successful, failed };
  };

  /**
   * Export submissions to CSV
   */
  const exportToCSV = async (submissions: EnhancedSubmission[]) => {
    try {
      setIsExporting(true);

      if (submissions.length === 0) {
        toast({
          title: 'Inga inlämningar att exportera',
          description: 'Välj minst en inlämning för export.',
          variant: 'destructive'
        });
        return;
      }

      exportSubmissionsToCSV(submissions);

      toast({
        title: 'Export lyckades',
        description: `${submissions.length} inlämningar har exporterats som CSV.`
      });
    } catch (error) {
      toast({
        title: 'Export misslyckades',
        description: 'Kunde inte exportera inlämningarna.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export individual submission to JSON
   */
  const exportToJSON = async (submission: EnhancedSubmission) => {
    try {
      exportSubmissionToJSON(submission);

      toast({
        title: 'Export lyckades',
        description: `Inlämning "${submission.title}" har exporterats som JSON.`
      });
    } catch (error) {
      toast({
        title: 'Export misslyckades',
        description: 'Kunde inte exportera inlämningen.',
        variant: 'destructive'
      });
    }
  };

  /**
   * Convert approved collaboration submission to sponsor record
   */
  const convertToSponsor = async (submission: EnhancedSubmission) => {
    try {
      // Type guard to ensure content has the expected structure
      if (!submission.content || typeof submission.content !== 'object') {
        throw new Error('Invalid submission content structure');
      }

      const content = submission.content as Record<string, any>;

      // Extract sponsor data from submission content
      const contactInfo = content.contact_info;
      const collaborationType = content.collaboration_type || 'partner';

      if (!contactInfo || typeof contactInfo !== 'object') {
        throw new Error('Missing or invalid contact information');
      }

      // Map collaboration type to sponsor type
      const sponsorTypeMap: Record<string, string> = {
        'artist': 'partner',
        'researcher': 'partner',
        'community': 'supporter',
        'business': 'main',
        'other': 'partner'
      };

      const sponsorType = sponsorTypeMap[collaborationType] || 'partner';

      // Create sponsor record
      const sponsorData = {
        name: `${contactInfo.firstName} ${contactInfo.lastName}`,
        type: sponsorType,
        website: contactInfo.website || null,
        logo_path: null, // Will be updated if logo is uploaded later
      };

      const { data: sponsor, error: sponsorError } = await supabase
        .from('sponsors')
        .insert([sponsorData])
        .select()
        .single();

      if (sponsorError) throw sponsorError;

      // Mark submission as processed
      await updateStatus(submission.id, 'approved');

      toast({
        title: 'Sponsor skapad',
        description: `${sponsorData.name} har lagts till som sponsor och kommer att visas på partnersidan.`
      });

      return sponsor;
    } catch (error) {
      toast({
        title: 'Fel vid konvertering',
        description: 'Kunde inte konvertera inlämningen till sponsor.',
        variant: 'destructive'
      });

      throw error;
    }
  };

  /**
   * Bulk delete submissions
   */
  const batchDelete = async (ids: string[]) => {
    try {
      // Ask for confirmation (we'd implement this in the UI component)
      const results = await Promise.allSettled(
        ids.map(id => deleteSubmission(id))
      );

      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value
      ).length;

      const failed = results.length - successful;

      if (successful > 0) {
        toast({
          title: 'Batch radering klar',
          description: `${successful} inlämningar raderades framgångsrikt.`
        });
      }

      if (failed > 0) {
        toast({
          title: 'Delvis misslyckad',
          description: `${failed} inlämningar kunde inte raderas.`,
          variant: 'destructive'
        });
      }

      return { successful, failed };
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte utföra batch radering.',
        variant: 'destructive'
      });

      return { successful: 0, failed: ids.length };
    }
  };

  return {
    // Actions
    updateStatus,
    deleteSubmission,
    batchUpdateStatus,
    exportToCSV,
    exportToJSON,
    batchDelete,
    convertToSponsor,

    // State
    isExporting,

    // Loading states from mutations
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
