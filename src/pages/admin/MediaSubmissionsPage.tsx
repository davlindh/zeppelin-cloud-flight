import React from 'react';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { MediaSubmissionApproval } from '@/components/media/admin/MediaSubmissionApproval';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const MediaSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminRoute>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mediaförsändelser</h1>
            <p className="text-muted-foreground">
              Granska och importera mediafiler från godkända inlämningar
            </p>
          </div>
        </div>

        <MediaSubmissionApproval />
      </div>
    </AdminRoute>
  );
};
