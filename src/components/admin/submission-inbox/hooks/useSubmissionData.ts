import { useState, useMemo } from 'react';
import { useSubmissions } from '@/hooks/useApi';

export interface SubmissionFilters {
  type: string; // 'all' | 'project' | 'participant' | 'media' | 'collaboration'
}

export interface EnhancedSubmission {
  id: string;
  type: 'project' | 'participant' | 'media' | 'partnership' | 'collaboration';
  title: string;
  content: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  language_preference: string;
  how_found_us: string;
  publication_permission: boolean;
  files?: Record<string, unknown>[];
  created_at: string;
  processed_at?: string;
  session_id?: string;
  device_fingerprint?: string;
  ip_address?: string;
  media_status?: 'pending' | 'approved' | 'rejected' | 'converted';
  media_approved_at?: string;
  media_converted_at?: string;
}

const defaultFilters: SubmissionFilters = {
  type: 'all'
};

/**
 * Custom hook for managing submission data and filtering
 * Reduces complexity by centralizing data management logic
 */
export const useSubmissionData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SubmissionFilters>(defaultFilters);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch submissions using existing hook
  const { data: apiSubmissions = [], isLoading: loading, error } = useSubmissions();

  // Transform API data to our enhanced submission format
  const submissions: EnhancedSubmission[] = useMemo(() => {
    return apiSubmissions.map(sub => ({
      id: sub.id,
      type: sub.type as EnhancedSubmission['type'],
      title: sub.title,
      content: sub.content as Record<string, unknown>,
      status: sub.status as EnhancedSubmission['status'],
      submitted_by: sub.submitted_by || '',
      contact_email: sub.contact_email || '',
      contact_phone: sub.contact_phone || '',
      location: sub.location || '',
      language_preference: sub.language_preference || '',
      how_found_us: sub.how_found_us || '',
      publication_permission: sub.publication_permission || false,
      files: Array.isArray(sub.files) ? sub.files as Record<string, unknown>[] : [],
      created_at: sub.created_at,
      processed_at: sub.processed_at || '',
      session_id: sub.session_id || '',
      device_fingerprint: sub.device_fingerprint || '',
      ip_address: '',
      media_status: sub.media_status as EnhancedSubmission['media_status'],
      media_approved_at: sub.media_approved_at || '',
      media_converted_at: sub.media_converted_at || ''
    }));
  }, [apiSubmissions]);

  // Filtered and sorted submissions (simplified)
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Filter by search term - simplified to only search in key fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.title.toLowerCase().includes(searchLower) ||
        sub.submitted_by?.toLowerCase().includes(searchLower) ||
        sub.contact_email?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(sub => sub.type === filters.type);
    }

    // Status filter (when viewing specific tabs)
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
    }

    // Always sort by created_at DESC (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return filtered;
  }, [submissions, searchTerm, filters, selectedStatus]);

  // Stats for dashboard
  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    byType: {
      project: submissions.filter(s => s.type === 'project').length,
      participant: submissions.filter(s => s.type === 'participant').length,
      media: submissions.filter(s => s.type === 'media').length,
      collaboration: submissions.filter(s => s.type === 'collaboration').length
    }
  }), [submissions]);

  return {
    submissions,
    filteredSubmissions,
    loading,
    error,
    searchTerm,
    filters,
    selectedStatus,
    stats,
    setSearchTerm,
    setFilters,
    setSelectedStatus
  };
};
