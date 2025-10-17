import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  FileIcon,
  Tag,
  User,
  Mail,
  MapPin,
  Calendar,
  Image,
  Check,
  X
} from 'lucide-react';
import type { EnhancedSubmission } from '../hooks/useSubmissionData';
import { getStatusColor, getStatusIcon, getTypeColor, getTypeLabel, hasFiles, getFileCount, formatFileSize } from '../utils/submissionContentUtils';

interface SubmissionListProps {
  submissions: EnhancedSubmission[];
  selectedSubmission: EnhancedSubmission | null;
  selectedSubmissions?: string[];
  viewMode?: 'table' | 'cards';
  onSelect: (submission: EnhancedSubmission) => void;
  onToggleSelect?: (id: string) => void;
  onEdit: (submission: EnhancedSubmission) => void;
  onConvert: (submission: EnhancedSubmission) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onExport: (submission: EnhancedSubmission) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  selectedSubmission,
  selectedSubmissions = [],
  viewMode = 'cards',
  onSelect,
  onToggleSelect,
  onEdit,
  onConvert,
  onApprove,
  onReject,
  onExport,
  onDelete,
  loading = false
}) => {
  const renderMediaThumbnails = (submission: EnhancedSubmission) => {
    if (!hasFiles(submission) || !submission.files) return null;

    const filesArray = Array.isArray(submission.files) 
      ? submission.files 
      : Object.values(submission.files).filter((f): f is any => 
          f && typeof f === 'object' && 'url' in f
        );

    const imageFiles = filesArray.filter((file: any) => {
      const ext = file.name?.toLowerCase().split('.').pop() || '';
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    });

    if (imageFiles.length === 0) return null;

    const displayImages = imageFiles.slice(0, 4);
    const remainingCount = imageFiles.length - displayImages.length;

    return (
      <div className="mt-3 pt-3 border-t">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {displayImages.map((file: any, index: number) => (
            <div 
              key={index} 
              className="relative aspect-square bg-muted rounded overflow-hidden group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                window.open(file.url, '_blank');
              }}
            >
              <img
                src={file.url}
                alt={file.name || `Bild ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {submission.media_status === 'approved' && (
                <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              {submission.media_status === 'rejected' && (
                <div className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5">
                  <X className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="aspect-square bg-muted rounded flex items-center justify-center text-sm font-medium text-muted-foreground border-2 border-dashed">
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laddar inlämningar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Inga inlämningar hittades.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card
          key={submission.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(submission)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={getTypeColor(submission.type)} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {getTypeLabel(submission.type)}
                  </Badge>
                  <Badge className={getStatusColor(submission.status)}>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{getStatusIcon(submission.status)}</span>
                      {submission.status}
                    </div>
                  </Badge>
                  {hasFiles(submission) && (() => {
                    const filesArray = Array.isArray(submission.files) 
                      ? submission.files 
                      : Object.values(submission.files).filter((f): f is any => 
                          f && typeof f === 'object' && 'url' in f
                        );
                    
                    const nonImageFiles = filesArray.filter((file: any) => {
                      const ext = file.name?.toLowerCase().split('.').pop() || '';
                      return !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                    });

                    if (nonImageFiles.length === 0) return null;

                    return (
                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                        <FileIcon className="h-3 w-3 mr-1" />
                        {nonImageFiles.length} {nonImageFiles.length === 1 ? 'dokument' : 'dokument'}
                      </Badge>
                    );
                  })()}
                  {submission.media_status && submission.media_status !== 'pending' && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        submission.media_status === 'approved' ? 'border-green-500 text-green-700' :
                        submission.media_status === 'rejected' ? 'border-red-500 text-red-700' :
                        submission.media_status === 'converted' ? 'border-blue-500 text-blue-700' :
                        'border-gray-500 text-gray-700'
                      }`}
                    >
                      📷 {submission.media_status}
                    </Badge>
                  )}
                </div>

                <h4 className="font-medium mb-1">{submission.title}</h4>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {submission.submitted_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {submission.submitted_by}
                    </div>
                  )}
                  {submission.contact_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {submission.contact_email}
                    </div>
                  )}
                  {submission.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {submission.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(submission.created_at).toLocaleString('sv-SE')}
                  </div>
                </div>

                {/* Preview of content */}
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  {typeof submission.content.description === 'string'
                    ? submission.content.description.substring(0, 100) + (submission.content.description.length > 100 ? '...' : '')
                    : 'Ingen beskrivning tillgänglig'
                  }
                </div>

                {/* Media thumbnails */}
                {renderMediaThumbnails(submission)}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Se Detaljer clicked for submission:', submission.id);
                    onSelect(submission);
                  }}
                  title="Se detaljer"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(submission);
                  }}
                  title="Redigera"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConvert(submission);
                  }}
                  disabled={submission.status === 'approved'}
                  title="Konvertera till deltagare/projekt"
                >
                  {submission.type === 'participant' ? '👤' : '🏗️'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(submission);
                  }}
                  title="Exportera som JSON"
                >
                  <Download className="h-4 w-4" />
                </Button>

                {submission.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(submission.id);
                      }}
                      className="text-green-600 hover:text-green-700"
                      title="Godkänn"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(submission.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Avvisa"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(submission.id);
                  }}
                  className="text-red-600 hover:text-red-700"
                  title="Radera"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
