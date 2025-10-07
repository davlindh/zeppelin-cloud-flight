import { useState, useMemo } from 'react';
import { useSubmissions } from '@/hooks/useApi';

export interface SubmissionFilters {
  type: string;
  experience: string;
  location: string;
  sortBy: 'created_at' | 'title' | 'type';
  sortOrder: 'asc' | 'desc';
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
  type: 'all',
  experience: 'all',
  location: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc'
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

  // Filtered and sorted submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.title.toLowerCase().includes(searchLower) ||
        sub.submitted_by?.toLowerCase().includes(searchLower) ||
        sub.contact_email?.toLowerCase().includes(searchLower) ||
        sub.location?.toLowerCase().includes(searchLower) ||
        JSON.stringify(sub.content).toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(sub => sub.type === filters.type);
    }

    // Filter by experience level (for participant submissions)
    if (filters.experience !== 'all') {
      filtered = filtered.filter(sub => sub.type === 'participant' && sub.content.experienceLevel === filters.experience);
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(sub => sub.location?.toLowerCase().includes(filters.location.toLowerCase()));
    }

    // Status filter (when viewing specific tabs)
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | Date, bVal: string | Date;

      switch (filters.sortBy) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
      }

      if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [submissions, searchTerm, filters, selectedStatus]);

  // Stats for dashboard
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;

    return {
      total,
      pending,
      approved,
      rejected,
      byStatus: { pending, approved, rejected },
      byType: [
        {
          type: 'project',
          count: submissions.filter(s => s.type === 'project').length,
          percentage: Math.round((submissions.filter(s => s.type === 'project').length / total) * 100) || 0
        },
        {
          type: 'participant',
          count: submissions.filter(s => s.type === 'participant').length,
          percentage: Math.round((submissions.filter(s => s.type === 'participant').length / total) * 100) || 0
        },
        {
          type: 'media',
          count: submissions.filter(s => s.type === 'media').length,
          percentage: Math.round((submissions.filter(s => s.type === 'media').length / total) * 100) || 0
        }
      ].filter(item => item.count > 0)
    };
  }, [submissions]);

  // Unique filter values
  const filterOptions = useMemo(() => {
    const locations = Array.from(new Set(submissions.map(sub => sub.location).filter(Boolean)));
    const types = Array.from(new Set(submissions.map(sub => sub.type)));

    return {
      locations,
      types
    };
  }, [submissions]);

  return {
    submissions,
    filteredSubmissions,
    loading,
    error,
    searchTerm,
    filters,
    selectedStatus,
    stats,
    filterOptions,
    setSearchTerm,
    setFilters,
    setSelectedStatus
  };
};
