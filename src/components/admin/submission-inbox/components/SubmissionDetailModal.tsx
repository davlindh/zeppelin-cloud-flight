import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail as MailIcon,
  MapPin,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ExternalLink,
  Loader2,
  Send
} from 'lucide-react';
import type { EnhancedSubmission } from '../hooks/useSubmissionData';
import { getStatusColor, getStatusIcon, getTypeColor, getTypeLabel, hasFiles } from '../utils/submissionContentUtils';
import { getCorrectedFileUrl } from '@/utils/fileNaming';
import { useSendParticipantWelcome } from '@/hooks/useSendParticipantWelcome';

interface SubmissionDetailModalProps {
  submission: EnhancedSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveMedia: (submissionId: string) => void;
  onRejectMedia: (submissionId: string) => void;
  onConvertMedia: (submission: EnhancedSubmission) => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.toLowerCase().split('.').pop() || '';

  // Use a more efficient lookup approach
  const typeMap: Record<string, React.ReactElement> = {
    'jpg': <ImageIcon className="h-4 w-4" />,
    'jpeg': <ImageIcon className="h-4 w-4" />,
    'png': <ImageIcon className="h-4 w-4" />,
    'gif': <ImageIcon className="h-4 w-4" />,
    'webp': <ImageIcon className="h-4 w-4" />,
    'mp4': <Video className="h-4 w-4" />,
    'avi': <Video className="h-4 w-4" />,
    'mov': <Video className="h-4 w-4" />,
    'wmv': <Video className="h-4 w-4" />,
    'mp3': <Music className="h-4 w-4" />,
    'wav': <Music className="h-4 w-4" />,
    'ogg': <Music className="h-4 w-4" />
  };

  return typeMap[ext] || <File className="h-4 w-4" />;
};

const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getFileType = (filename: string) => {
  const ext = filename.toLowerCase().split('.').pop();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext || '')) return 'audio';
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'document';
  return 'unknown';
};

const getFileTypeLabel = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop()?.toUpperCase() || '';
  const type = getFileType(filename);
  
  const typeLabels: Record<string, string> = {
    'image': 'Bild',
    'video': 'Video',
    'audio': 'Ljud',
    'document': 'Dokument',
    'unknown': 'Fil'
  };
  
  return `${typeLabels[type]} (${ext})`;
};

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose,
  onApproveMedia,
  onRejectMedia,
  onConvertMedia
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  const sendWelcomeEmail = useSendParticipantWelcome();

  console.log('SubmissionDetailModal render:', { submission: submission?.id, isOpen });

  const handleApproveMedia = async () => {
    setIsApproving(true);
    try {
      await onApproveMedia(submission.id);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectMedia = async () => {
    setIsRejecting(true);
    try {
      await onRejectMedia(submission.id);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConvertMedia = async () => {
    setIsConverting(true);
    try {
      await onConvertMedia(submission);
    } finally {
      setIsConverting(false);
    }
  };

  const renderContentField = (label: string, value: any) => {
    if (!value) return null;

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="text-sm bg-muted/50 p-3 rounded-md">
          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        </div>
      </div>
    );
  };

  const renderFileActions = (file: any) => {
    if (!file.url) return null;

    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(file.url, '_blank')}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadFile(file.url, file.name)}
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderFileHeader = (file: any) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {getFileIcon(file.name || 'unknown')}
        <div>
          <p className="font-medium text-sm">{file.name || 'Unnamed file'}</p>
          <p className="text-xs text-muted-foreground">
            {getFileTypeLabel(file.name || '')} {file.size && `• ${Math.round(file.size / 1024)} KB`}
          </p>
        </div>
      </div>
      {renderFileActions(file)}
    </div>
  );

  const renderFilePreview = (file: any) => {
    if (!file.url) return null;

    return (
      <div className="border rounded-lg p-2 bg-muted/20">
        {renderMediaPreview(file)}
      </div>
    );
  };

  const renderSingleFile = (file: any, index: number) => (
    <Card key={index} className="p-3">
      <div className="space-y-3">
        {renderFileHeader(file)}
        {renderFilePreview(file)}
      </div>
    </Card>
  );

  const renderFiles = () => {
    if (!hasFiles(submission) || !submission.files) return null;

    // Handle both array and object formats
    const filesArray = Array.isArray(submission.files) 
      ? submission.files 
      : Object.values(submission.files).filter((f): f is any => f && typeof f === 'object' && 'url' in f);

    if (filesArray.length === 0) return null;

    // Check if all files are images
    const allImages = filesArray.every((file: any) => getFileType(file.name || '') === 'image');
    const hasMultipleFiles = filesArray.length > 1;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            Media-filer ({filesArray.length})
          </label>
          {allImages && hasMultipleFiles && (
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Bildgalleri
            </Badge>
          )}
        </div>
        
        {/* Image Gallery View for multiple images */}
        {allImages && hasMultipleFiles ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {filesArray.map((file: any, index: number) => (
              <Card key={index} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative bg-muted">
                  <img
                    src={file.url}
                    alt={file.name || `Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadFile(file.url, file.name)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Image number badge */}
                  <Badge className="absolute top-2 left-2 text-xs bg-black/70">
                    {index + 1}
                  </Badge>
                </div>
                <div className="p-2">
                  <p className="text-xs truncate font-medium">{file.name || `Bild ${index + 1}`}</p>
                  {file.size && (
                    <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Individual file cards for mixed types or single files */
          <div className="grid gap-3">
            {filesArray.map((file: any, index: number) => renderSingleFile(file, index))}
          </div>
        )}
      </div>
    );
  };

  const renderImagePreview = (file: any) => (
    <div className="space-y-2">
      <img
        src={file.url}
        alt={file.name}
        className="max-w-full h-auto max-h-64 rounded-lg object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden text-sm text-red-600">
        Failed to load image. <Button variant="link" className="p-0 h-auto" onClick={() => window.open(file.url, '_blank')}>View directly</Button>
      </div>
    </div>
  );

  const renderVideoPreview = (file: any) => (
    <video
      src={file.url}
      controls
      className="max-w-full h-auto max-h-64 rounded-lg"
      preload="metadata"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }}
    >
      Your browser does not support the video tag.
    </video>
  );

  const renderAudioPreview = (file: any) => (
    <audio
      src={file.url}
      controls
      className="w-full"
      preload="metadata"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }}
    >
      Your browser does not support the audio tag.
    </audio>
  );

  const renderDocumentPreview = (file: any) => (
    <div className="text-center p-4 bg-background rounded-lg border-2 border-dashed">
      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">{file.name}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {file.size && `${Math.round(file.size / 1024)} KB`}
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(file.url, '_blank')}
      >
        <Eye className="h-3 w-3 mr-2" />
        Open Document
      </Button>
    </div>
  );

  const renderGenericFilePreview = (file: any) => (
    <div className="text-center p-4 bg-muted rounded-lg">
      <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">{file.name}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {getFileTypeLabel(file.name || '')} {file.size && `• ${Math.round(file.size / 1024)} KB`}
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(file.url, '_blank')}
      >
        <ExternalLink className="h-3 w-3 mr-2" />
        Open File
      </Button>
    </div>
  );

  const getMediaPreviewComponent = (file: any) => {
    if (!file.url) return () => <p className="text-sm text-muted-foreground">No preview available</p>;

    const fileType = getFileType(file.name || '');

    switch (fileType) {
      case 'image':
        return () => renderImagePreview(file);
      case 'video':
        return () => renderVideoPreview(file);
      case 'audio':
        return () => renderAudioPreview(file);
      case 'document':
        return () => renderDocumentPreview(file);
      default:
        return () => renderGenericFilePreview(file);
    }
  };

  const renderMediaPreview = (file: any) => {
    const PreviewComponent = getMediaPreviewComponent(file);
    return <PreviewComponent />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge className={getTypeColor(submission.type)} variant="outline">
              {getTypeLabel(submission.type)}
            </Badge>
            <Badge className={getStatusColor(submission.status)}>
              <span className="text-xs mr-1">{getStatusIcon(submission.status)}</span>
              {submission.status}
            </Badge>
            {submission.media_status && submission.media_status !== 'pending' && (
              <Badge
                variant="outline"
                className={
                  submission.media_status === 'approved' ? 'border-green-500 text-green-700' :
                  submission.media_status === 'rejected' ? 'border-red-500 text-red-700' :
                  submission.media_status === 'converted' ? 'border-blue-500 text-blue-700' :
                  'border-gray-500 text-gray-700'
                }
              >
                📷 {submission.media_status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{submission.title}</h3>

              <div className="space-y-2 text-sm">
                {submission.submitted_by && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{submission.submitted_by}</span>
                  </div>
                )}
                {submission.contact_email && (
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{submission.contact_email}</span>
                  </div>
                )}
                {submission.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{submission.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(submission.created_at).toLocaleString('sv-SE')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {submission.type === 'participant' && submission.status === 'approved' && (
                <Button
                  onClick={() => sendWelcomeEmail.mutate(submission.id)}
                  disabled={sendWelcomeEmail.isPending}
                  className="w-full"
                >
                  {sendWelcomeEmail.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Skickar email...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Skicka välkomstemail
                    </>
                  )}
                </Button>
              )}
              
              {hasFiles(submission) && submission.media_status === 'pending' && (
                <>
                  <Button
                    onClick={handleApproveMedia}
                    disabled={isApproving || isRejecting || isConverting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {isApproving ? 'Godkänner...' : 'Godkänn Media'}
                  </Button>
                  <Button
                    onClick={handleRejectMedia}
                    disabled={isApproving || isRejecting || isConverting}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {isRejecting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {isRejecting ? 'Avvisar...' : 'Avvisa Media'}
                  </Button>
                </>
              )}

              {hasFiles(submission) && submission.media_status === 'approved' && (
                <Button
                  onClick={handleConvertMedia}
                  disabled={isApproving || isRejecting || isConverting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isConverting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  {isConverting ? 'Konverterar...' : 'Konvertera till Mediabibliotek'}
                </Button>
              )}

              {submission.media_status === 'converted' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Media har konverterats till mediabiblioteket
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Content Fields */}
          <div className="space-y-4">
            {renderContentField('Beskrivning', submission.content.description)}
            {renderContentField('Motivation', submission.content.motivation)}
            {renderContentField('Bakgrund', submission.content.background)}
            {renderContentField('Erfarenhet', submission.content.experienceLevel)}
            {renderContentField('Intressen', submission.content.interests)}
            {renderContentField('Färdigheter', submission.content.skills)}
            {renderContentField('Tillgänglighet', submission.content.availability)}
            {renderContentField('Tidsåtagande', submission.content.timeCommitment)}
          </div>

          {/* Files Section */}
          {renderFiles()}

          {/* Additional Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div>Språkpreferens: {submission.language_preference || 'Ej angivet'}</div>
              <div>Hur hittade oss: {submission.how_found_us || 'Ej angivet'}</div>
              <div>Publiceringspermission: {submission.publication_permission ? 'Ja' : 'Nej'}</div>
              <div>Session ID: {submission.session_id || 'Ej angivet'}</div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
