import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  HardDrive, 
  Wifi, 
  Shield, 
  Clock, 
  Download,
  Info,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';

interface CachePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionGranted: (settings: {
    enableCache: boolean;
    maxSize: number;
    allowBackground: boolean;
    allowCellular: boolean;
  }) => void;
}

export const CachePermissionDialog: React.FC<CachePermissionDialogProps> = ({
  open,
  onOpenChange,
  onPermissionGranted
}) => {
  const [enableCache, setEnableCache] = useState(true);
  const [maxSize, setMaxSize] = useState(500);
  const [allowBackground, setAllowBackground] = useState(true);
  const [allowCellular, setAllowCellular] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const handleAccept = () => {
    onPermissionGranted({
      enableCache,
      maxSize,
      allowBackground,
      allowCellular
    });
    onOpenChange(false);
  };

  const handleDecline = () => {
    onPermissionGranted({
      enableCache: false,
      maxSize: 0,
      allowBackground: false,
      allowCellular: false
    });
    onOpenChange(false);
  };

  const estimatedFiles = Math.floor(maxSize / 5); // Rough estimate: 5MB per file

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <HardDrive className="h-6 w-6 text-primary" />
            Filcache-behörigheter
          </DialogTitle>
          <DialogDescription className="text-base">
            Vi skulle vilja cachelagra filer lokalt på din enhet för bättre prestanda och offlineåtkomst. 
            Läs igenom detaljerna nedan och välj dina inställningar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* What we're asking for */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Vad vi begär
              </h3>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Lokal fillagring</div>
                    <div className="text-sm text-muted-foreground">
                      Lagra media och dokument i din webbläsares lokala databas (IndexedDB)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Nätverksåtkomst</div>
                    <div className="text-sm text-muted-foreground">
                      Ladda ner filer i bakgrunden för cachelagring
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Lagringsutrymme</div>
                    <div className="text-sm text-muted-foreground">
                      Upp till {maxSize} MB diskutrymme på din enhet
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Fördelar för dig
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Snabbare laddning av mediafiler</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Reducerad dataförbrukning</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Offlineåtkomst till cachade filer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Location & Settings */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Lagringsplats & Inställningar
              </h3>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Lagringsplats:</strong> Webbläsarens IndexedDB (lovable-file-cache)<br />
                  <strong>Åtkomst:</strong> Endast denna webbplats kan komma åt cachade filer<br />
                  <strong>Automatisk rensning:</strong> Gamla filer rensas automatiskt efter 7 dagar
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Aktivera filcache</div>
                    <div className="text-sm text-muted-foreground">
                      Cachelagra filer lokalt för bättre prestanda
                    </div>
                  </div>
                  <Checkbox
                    checked={enableCache}
                    onCheckedChange={(checked) => setEnableCache(checked === true)}
                  />
                </div>

                {enableCache && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Maximalt lagringsutrymme: {maxSize} MB</span>
                        <span>~{estimatedFiles} filer</span>
                      </div>
                      <div className="flex gap-2">
                        {[100, 250, 500, 1000].map(size => (
                          <Button
                            key={size}
                            variant={maxSize === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMaxSize(size)}
                          >
                            {size} MB
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Bakgrundsladdning</div>
                        <div className="text-sm text-muted-foreground">
                          Ladda filer automatiskt i bakgrunden
                        </div>
                      </div>
                      <Checkbox
                        checked={allowBackground}
                        onCheckedChange={(checked) => setAllowBackground(checked === true)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Mobilt nätverk</div>
                        <div className="text-sm text-muted-foreground">
                          Tillåt cachelagring över mobilt nätverk
                        </div>
                      </div>
                      <Checkbox
                        checked={allowCellular}
                        onCheckedChange={(checked) => setAllowCellular(checked === true)}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Integritet & Kontroll</h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Inga filer lämnar din enhet - allt lagras lokalt</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Du kan rensa cache eller inaktivera funktionen när som helst</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Filer raderas automatiskt när du rensar webbläsardata</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Endast offentligt tillgängliga filer cachelagras</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={hasReadTerms}
                  onCheckedChange={(checked) => setHasReadTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm">
                  Jag har läst och förstår informationen ovan
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Avböj cachelagring
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!hasReadTerms}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Acceptera inställningar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};