import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, Check, Chrome, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isStandalone);
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast({
        title: 'App Installed!',
        description: 'Zeppel Inn has been installed successfully.',
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!installPrompt) {
      toast({
        title: 'Installation not available',
        description: 'Please use your browser\'s install option or add to home screen.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: 'Installing...',
          description: 'Zeppel Inn is being installed.',
        });
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      toast({
        title: 'Installation failed',
        description: 'Please try again or use your browser\'s install option.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">Install Zeppel Inn</CardTitle>
              <CardDescription className="text-base">
                Get the full app experience on your device
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isStandalone || isInstalled ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium">App is already installed!</p>
                  <Button onClick={() => navigate('/home')} size="lg" className="w-full">
                    Open App
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Benefits:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Access directly from your home screen</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Works offline with cached content</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Faster loading and better performance</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Full-screen app experience</span>
                      </li>
                    </ul>
                  </div>

                  {installPrompt ? (
                    <Button onClick={handleInstall} size="lg" className="w-full">
                      <Download className="mr-2 h-5 w-5" />
                      Install Now
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          Installation is available through your browser:
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <Chrome className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong>Chrome/Edge:</strong> Tap the menu (⋮) → "Install app" or "Add to Home screen"
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong>iOS Safari:</strong> Tap Share → "Add to Home Screen"
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => navigate('/home')} 
                        variant="outline" 
                        size="lg" 
                        className="w-full"
                      >
                        <X className="mr-2 h-5 w-5" />
                        Continue in Browser
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
