import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareServiceButtonProps {
  serviceTitle: string;
  serviceUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ShareServiceButton: React.FC<ShareServiceButtonProps> = ({
  serviceTitle,
  serviceUrl,
  variant = 'outline',
  size = 'default',
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Get the current URL or use provided URL
  const shareUrl = serviceUrl || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(serviceTitle);

  // Social media share URLs
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Länk kopierad!', {
        description: 'Tjänstlänken har kopierats till urklipp',
      });
      
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 2000);
    } catch (error) {
      toast.error('Kunde inte kopiera länk', {
        description: 'Försök igen eller kopiera URL:en manuellt',
      });
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    window.open(
      shareLinks[platform],
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    
    toast.success(`Öppnar ${platform}`, {
      description: 'Dela tjänsten med ditt nätverk',
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && 'Dela'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Dela tjänst</h4>
            <p className="text-xs text-muted-foreground">
              Dela denna tjänst med ditt nätverk
            </p>
          </div>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col gap-1 h-auto py-3 px-2"
            >
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              <span className="text-xs">Facebook</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col gap-1 h-auto py-3 px-2"
            >
              <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              <span className="text-xs">Twitter</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSocialShare('linkedin')}
              className="flex flex-col gap-1 h-auto py-3 px-2"
            >
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              <span className="text-xs">LinkedIn</span>
            </Button>
          </div>

          {/* Copy Link Button */}
          <div className="pt-2 border-t">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              disabled={copied}
              className="w-full justify-start gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Kopierad!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Kopiera länk</span>
                </>
              )}
            </Button>
          </div>

          {/* URL Preview */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground break-all">
              {shareUrl}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
