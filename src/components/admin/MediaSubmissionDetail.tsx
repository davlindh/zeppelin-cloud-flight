import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  User,
  Mail,
  Calendar,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  AlertCircle,
  Info
} from 'lucide-react';
import { getMediaIcon, getMediaTypeColor, getCategoryColor, formatFileSize } from '@/utils/mediaHelpers';
import type { EnhancedSubmission } from './submission-inbox/hooks/useSubmissionData';

interface MediaSubmissionDetailProps {
  submission: EnhancedSubmission;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onClose: () => void;
}

export const MediaSubmissionDetail: React.FC<MediaSubmissionDetailProps> = ({
  submission,
  onApprove,
  onReject,
  onClose
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const content = submission.content as any;
  const files = content?.files || [];

  const handleApprove = () => {
    onApprove(submission.id, approvalNotes);
  };

  const handleReject = () => {
    onReject(submission.id, approvalNotes);
  };

  const togglePlay = (fileId: string) => {
    setIsPlaying(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const toggleMute = (fileId: string) => {
    setIsMuted(prev => ({ ...prev, [fileId]: !prev[fileId] }));
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

  const renderMediaPreview = (file: any, index: number) => {
    const mediaType = content.media_type;
    const fileId = `${submission.id}-${index}`;

    switch (mediaType) {
      case 'image':
        return (
          <div className="relative group">
            <img
              src={file.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setShowPreview(file.url)}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="bg-black/70 text-white">
                <Eye className="w-4 h-4 mr-2" />
                Förhandsgranska
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              src={file.url}
              className="w-full h-48 object-cover rounded-lg"
              controls
              preload="metadata"
              onPlay={() => togglePlay(fileId)}
              onPause={() => togglePlay(fileId)}
            >
              Din webbläsare stöder inte videouppspelning.
            </video>
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/70 text-white"
                onClick={() => downloadFile(file.url, file.filename)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-600" />
                <span className="font-medium">{file.filename}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleMute(fileId)}
                >
                  {isMuted[fileId] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadFile(file.url, file.filename)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <audio
              src={file.url}
              controls
              className="w-full"
              muted={isMuted[fileId]}
              onPlay={() => togglePlay(fileId)}
              onPause={() => togglePlay(fileId)}
            >
              Din webbläsare stöder inte ljuduppspelning.
            </audio>
          </div>
        );

      case 'document':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Öppna
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(file.url, file.filename)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ladda ner
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">Förhandsgranskning inte tillgänglig</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => downloadFile(file.url, file.filename)}
            >
              <Download className="w-4 h-4 mr-2" />
              Ladda ner fil
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Media-inlämning: {submission.title}</span>
            <div className="flex items-center gap-2">
              <Badge className={getMediaTypeColor(content.media_type)}>
                {content.media_type === 'image' ? 'Bild' :
                 content.media_type === 'video' ? 'Video' :
                 content.media_type === 'audio' ? 'Ljud' : 'Dokument'}
              </Badge>
              <Badge className={getCategoryColor(content.category)}>
                {content.category === 'presentation' ? 'Presentation' :
                 content.category === 'workshop' ? 'Workshop' :
                 content.category === 'networking' ? 'Mingel' :
                 content.category === 'performance' ? 'Uppträdande' :
                 content.category === 'discussion' ? 'Diskussion' : 'Övrigt'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Kontaktinformation
              </h3>
              <div className="space-y-2 pl-7">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{content.uploader_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${content.uploader_email}`} className="text-primary hover:underline">
                    {content.uploader_email}
                  </a>
                </div>
                {content.uploader_phone && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-gray-500">📞</span>
                    <a href={`tel:${content.uploader_phone}`} className="text-primary hover:underline">
                      {content.uploader_phone}
                    </a>
                  </div>
                )}
                {content.event_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(content.event_date).toLocaleDateString('sv-SE')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="w-5 h-5" />
                Inlämningsdetaljer
              </h3>
              <div className="space-y-2 pl-7">
                <p><strong>Inlämnad:</strong> {new Date(submission.created_at).toLocaleString('sv-SE')}</p>
                <p><strong>Status:</strong> 
                  <Badge className={`ml-2 ${
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status === 'approved' ? 'Godkänd' :
                     submission.status === 'rejected' ? 'Avvisad' : 'Väntande'}
                  </Badge>
                </p>
                <p><strong>Publiceringstillstånd:</strong> {
                  content.publication_permission ? 'Ja' : 'Nej'
                }</p>
                <p><strong>Antal filer:</strong> {files.length}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {content.description && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Beskrivning</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{content.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Files */}
      <Card>
        <CardHeader>
          <CardTitle>Uppladdade filer ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{file.filename}</h4>
                    <span className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  {renderMediaPreview(file, index)}
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Inga filer hittades i denna inlämning.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {submission.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Administrativa åtgärder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Anteckningar (valfritt)
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Lägg till anteckningar för beslut..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Godkänn inlämning
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Avvisa inlämning
              </Button>
              <Button variant="outline" onClick={onClose}>
                Stäng
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tips:</strong> Godkänd media kommer automatiskt att läggas till i det publika galleriet 
                om användaren gett publiceringstillstånd. Avvisad media kommer att arkiveras.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={showPreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setShowPreview(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};