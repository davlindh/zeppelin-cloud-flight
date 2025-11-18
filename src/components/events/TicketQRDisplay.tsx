import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketQRDisplayProps {
  qrCode: string;
  ticketTypeName: string;
  eventTitle: string;
  status: 'valid' | 'checked_in' | 'void';
  checkedInAt?: string | null;
}

export const TicketQRDisplay = ({
  qrCode,
  ticketTypeName,
  eventTitle,
  status,
  checkedInAt,
}: TicketQRDisplayProps) => {
  const downloadQR = () => {
    const svg = document.getElementById(`qr-${qrCode}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `ticket-${qrCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const statusConfig = {
    valid: { variant: 'default' as const, label: 'Valid' },
    checked_in: { variant: 'secondary' as const, label: 'Checked In' },
    void: { variant: 'destructive' as const, label: 'Void' },
  };

  return (
    <Card className={status === 'void' ? 'opacity-50' : ''}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id={`qr-${qrCode}`}
              value={qrCode}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-semibold">{ticketTypeName}</p>
            <p className="text-sm text-muted-foreground">{eventTitle}</p>
            <Badge variant={statusConfig[status].variant}>
              {statusConfig[status].label}
            </Badge>
            {checkedInAt && (
              <p className="text-xs text-muted-foreground">
                Checked in: {new Date(checkedInAt).toLocaleString()}
              </p>
            )}
          </div>

          {status === 'valid' && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
