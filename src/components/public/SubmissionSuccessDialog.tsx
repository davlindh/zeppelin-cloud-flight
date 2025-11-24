import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle2, ArrowRight, Home, UserCircle, ListChecks, MessageSquarePlus } from 'lucide-react';

interface SubmissionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissionType: 'participant' | 'project' | 'sponsor' | 'collaboration';
  onSubmitAnother?: () => void;
  submissionResponse?: {
    submissionId: string;
    submissionSlug: string | null;
    entityType: string | null;
    entityId: string | null;
  };
}

// Define submission-specific text and icons
const submissionInfo = {
  participant: {
    title: 'Tack för din ansökan!',
    description:
      'Vi har tagit emot din ansökan att bli deltagare i Zeppel Inn. Vi kommer att granska den och kontakta dig inom kort.',
    ctaText: 'Gå till deltagarsidor',
    ctaHref: '/participants',
  },
  project: {
    title: 'Projekt publicerat!',
    description:
      'Ditt projekt har skickats in och kommer att granskas av vårt team. Det kommer att visas i vårt showcase så snart det är godkänt.',
    ctaText: 'Se projektgalleri',
    ctaHref: '/showcase',
  },
  sponsor: {
    title: 'Ansökan mottagen!',
    description:
      'Tack för din intresseanmälan som sponsor. Vi kommer att kontakta dig för att diskutera detaljerna.',
    ctaText: 'Se våra partners',
    ctaHref: '/partners',
  },
  collaboration: {
    title: 'Samarbetsförslag skickat!',
    description:
      'Tack för ditt förslag om samarbete. Vi uppskattar ditt intresse och kommer att återkomma till dig.',
    ctaText: 'Se våra partners',
    ctaHref: '/partners',
  },
} as const;

export const SubmissionSuccessDialog: React.FC<SubmissionSuccessDialogProps> = ({
  isOpen,
  onClose,
  submissionType,
  onSubmitAnother,
  submissionResponse
}) => {
  const { user } = useAdminAuth();
  const info = submissionInfo[submissionType];
  const isSignedIn = !!user;

  // Create dynamic links based on submission response when available
  const getDynamicLinks = () => {
    if (!submissionResponse) return null;
    
    // Create entity-specific links based on the response
    if (submissionResponse.entityType === 'participant' && submissionResponse.submissionSlug) {
      return {
        primaryLink: {
          text: 'Se din deltagarprofil',
          href: `/participants/${submissionResponse.submissionSlug}`
        }
      };
    }
    
    // You can add similar logic for other entity types (projects, etc.)
    if (submissionResponse.entityType === 'project' && submissionResponse.submissionSlug) {
      return {
        primaryLink: {
          text: 'Se ditt projekt',
          href: `/showcase/${submissionResponse.submissionSlug}`
        }
      };
    }
    
    return null;
  };

  const dynamicLinks = getDynamicLinks();

  const handleSubmitAnother = () => {
    if (onSubmitAnother) {
      onSubmitAnother();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-left text-xl">{info.title}</DialogTitle>
              <DialogDescription className="text-left">
                {info.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {isSignedIn ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Du är inloggad som {user?.email}</p>
                  <p className="text-xs text-blue-700">
                    Vi kommer att uppdatera dig om status för din ansökan via e-post.
                  </p>
                  {dynamicLinks && dynamicLinks.primaryLink && (
                    <a 
                      href={dynamicLinks.primaryLink.href}
                      className="text-xs text-blue-600 underline mt-2 inline-block hover:text-blue-800 transition-colors"
                    >
                      {dynamicLinks.primaryLink.text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquarePlus className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Inte inloggad</p>
                  <p className="text-xs text-amber-700">
                    För att enklare hantera dina ansökningar och få statusuppdateringar, överväg att skapa ett konto.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:w-auto w-full">
            <Button
              onClick={handleSubmitAnother}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Skicka in en till
            </Button>
            
            {/* Use dynamic links if available, otherwise use the default link */}
            {dynamicLinks?.primaryLink ? (
              <Button asChild className="w-full sm:w-auto">
                <a href={dynamicLinks.primaryLink.href}>
                  {dynamicLinks.primaryLink.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button asChild className="w-full sm:w-auto">
                <a href={info.ctaHref}>
                  {info.ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="ghost" className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Gå till startsidan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
