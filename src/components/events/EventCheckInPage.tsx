import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckInTicket, useEventTicketInstances } from '@/hooks/events/useEventTicketInstances';
import { ArrowLeft, QrCode, Keyboard, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EventCheckInPage = () => {
  const { id } = useParams<{ id: string }>();
  const [manualCode, setManualCode] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [scanMode, setScanMode] = useState<'scanner' | 'manual'>('scanner');
  
  const checkInMutation = useCheckInTicket();
  const { data: instances = [] } = useEventTicketInstances(id);

  const stats = {
    total: instances.length,
    checkedIn: instances.filter(i => i.status === 'checked_in').length,
    valid: instances.filter(i => i.status === 'valid').length,
  };

  useEffect(() => {
    if (scanMode !== 'scanner') return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleCheckIn(decodedText);
        scanner.clear();
      },
      (error) => {
        console.log('QR scan error:', error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanMode]);

  const handleCheckIn = async (qrCode: string) => {
    try {
      const result = await checkInMutation.mutateAsync(qrCode);
      setLastCheckIn(result);
      setManualCode('');
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCheckIn(manualCode.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to={`/admin/events/${id}`} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Event Check-In</h1>
          <p className="text-muted-foreground">
            Scan or enter ticket QR codes to check in attendees
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.checkedIn}</div>
              <div className="text-sm text-muted-foreground">Checked In</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.valid}</div>
              <div className="text-sm text-muted-foreground">Valid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Last Check-In Result */}
        {lastCheckIn && (
          <Card className={`mb-8 border-2 ${lastCheckIn.success ? 'border-green-500' : 'border-red-500'}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {lastCheckIn.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <CardTitle>
                  {lastCheckIn.success ? 'Check-in Successful' : 'Check-in Failed'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {lastCheckIn.success ? (
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{lastCheckIn.event_title}</p>
                  <p className="text-muted-foreground">{lastCheckIn.ticket_type_name}</p>
                  {lastCheckIn.holder_name && (
                    <p className="text-sm">Holder: {lastCheckIn.holder_name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Checked in at {new Date(lastCheckIn.checked_in_at).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <p className="text-red-600">{lastCheckIn.error || 'Unknown error'}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Check-In Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Check In Attendee</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="scanner" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Scanner
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scanner">
                <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleManualCheckIn} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Enter Ticket Code
                    </label>
                    <Input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="ZT_..."
                      className="text-lg"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Check In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instances
                .filter(i => i.status === 'checked_in')
                .slice(0, 10)
                .map((instance) => (
                  <div
                    key={instance.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{instance.ticket_type?.name}</p>
                      {instance.holder_name && (
                        <p className="text-sm text-muted-foreground">
                          {instance.holder_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Checked In</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {instance.checked_in_at && 
                          new Date(instance.checked_in_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              {instances.filter(i => i.status === 'checked_in').length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No check-ins yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};
