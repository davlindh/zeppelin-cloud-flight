import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { Separator } from '@/components/ui/separator';
import { useRoleApplicationActions } from '@/hooks/admin/useRoleApplicationActions';
import { CheckCircle2, XCircle, Clock, User, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Application {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  application_data: any;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

interface ApplicationDetailDrawerProps {
  application: Application | null;
  userInfo?: {
    email: string;
    full_name?: string;
    current_roles?: string[];
  };
  open: boolean;
  onClose: () => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  userInfo,
  open,
  onClose,
}) => {
  const [adminNotes, setAdminNotes] = useState('');
  const { approveApplication, rejectApplication, updateApplicationStatus } = useRoleApplicationActions();

  if (!application) return null;

  const handleApprove = async () => {
    await approveApplication.mutateAsync({
      applicationId: application.id,
      userId: application.user_id,
      requestedRole: application.requested_role,
      adminNotes: adminNotes || undefined,
    });
    onClose();
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      alert('Vänligen ange en anledning för avslag');
      return;
    }
    await rejectApplication.mutateAsync({
      applicationId: application.id,
      reason: adminNotes,
    });
    onClose();
  };

  const handleMarkUnderReview = async () => {
    await updateApplicationStatus.mutateAsync({
      applicationId: application.id,
      status: 'under_review',
      notes: adminNotes || undefined,
    });
  };

  const appData = application.application_data || {};

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Ansökan om <RoleBadge role={application.requested_role as any} />
          </SheetTitle>
          <SheetDescription>
            Skickad {format(new Date(application.created_at), 'PPP', { locale: sv })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Info */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Användarinformation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userInfo?.email || application.user_id}</span>
              </div>
              {userInfo?.full_name && (
                <div>
                  <span className="font-medium">Namn: </span>
                  {userInfo.full_name}
                </div>
              )}
              {userInfo?.current_roles && userInfo.current_roles.length > 0 && (
                <div>
                  <span className="font-medium">Nuvarande roller: </span>
                  <div className="flex gap-2 mt-1">
                    {userInfo.current_roles.map(role => (
                      <RoleBadge key={role} role={role as any} size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Application Data */}
          {application.requested_role === 'provider' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Ansökningsdetaljer</h3>
              
              <div>
                <Label>Företags-/Leverantörsnamn</Label>
                <p className="text-sm mt-1">{appData.businessName || '-'}</p>
              </div>

              <div>
                <Label>Beskrivning</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{appData.description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>År i branschen</Label>
                  <p className="text-sm mt-1">{appData.yearsExperience || '-'}</p>
                </div>
                <div>
                  <Label>Kategorier</Label>
                  <p className="text-sm mt-1">{appData.serviceCategories || '-'}</p>
                </div>
              </div>

              {appData.portfolioUrl && (
                <div>
                  <Label>Portfolio URL</Label>
                  <a 
                    href={appData.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block mt-1"
                  >
                    {appData.portfolioUrl}
                  </a>
                </div>
              )}

              <div>
                <Label>Motivation</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{appData.motivation || '-'}</p>
              </div>

              {appData.certifications && (
                <div>
                  <Label>Certifieringar/Utmärkelser</Label>
                  <p className="text-sm mt-1">{appData.certifications}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin-anteckningar</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Lägg till interna anteckningar eller anledning för beslut..."
              rows={4}
            />
            {application.admin_notes && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Tidigare anteckningar:</p>
                <p className="text-muted-foreground">{application.admin_notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {application.status === 'pending' || application.status === 'under_review' ? (
            <div className="space-y-2">
              <Button
                onClick={handleApprove}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={approveApplication.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Godkänn ansökan
              </Button>
              
              <Button
                onClick={handleReject}
                variant="destructive"
                className="w-full"
                disabled={rejectApplication.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Avslå ansökan
              </Button>

              {application.status === 'pending' && (
                <Button
                  onClick={handleMarkUnderReview}
                  variant="outline"
                  className="w-full"
                  disabled={updateApplicationStatus.isPending}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Markera som "Under granskning"
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Denna ansökan har redan {application.status === 'approved' ? 'godkänts' : 'avslagits'}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
