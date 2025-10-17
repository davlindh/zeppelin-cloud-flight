import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubmissionContentPreviewProps {
  content: Record<string, any>;
  type: string;
}

export const SubmissionContentPreview: React.FC<SubmissionContentPreviewProps> = ({
  content,
  type
}) => {
  const renderField = (label: string, value: any) => {
    if (!value) return null;
    
    if (Array.isArray(value)) {
      return (
        <div className="mb-3">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary">{item}</Badge>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div className="mb-3">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <div className="text-sm bg-muted p-2 rounded-md">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium">{key}:</span>
                <span>{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-sm">{String(value)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {type === 'participant' && (
        <>
          {renderField('Namn', content.contact_info?.firstName + ' ' + content.contact_info?.lastName)}
          {renderField('Email', content.contact_info?.email)}
          {renderField('Telefon', content.contact_info?.phone)}
          {renderField('Organisation', content.contact_info?.organization)}
          {renderField('Bio', content.additional_info?.motivation)}
          {renderField('Erfarenhet', content.additional_info?.experience)}
          {renderField('Färdigheter', content.skills)}
          {renderField('Intressen', content.interests)}
          {renderField('Tillgänglighet', content.additional_info?.availability)}
        </>
      )}

      {type === 'project' && (
        <>
          {renderField('Beskrivning', content.description)}
          {renderField('Syfte', content.purpose)}
          {renderField('Förväntad påverkan', content.expected_impact)}
          {renderField('Budget', content.budget)}
          {renderField('Tidsplan', content.timeline)}
        </>
      )}

      {type === 'collaboration' && (
        <>
          {renderField('Samarbetstyp', content.collaboration_type)}
          {renderField('Beskrivning', content.description)}
          {renderField('Tillgänglighet', content.availability)}
          {renderField('Kontaktinformation', content.contact_info)}
        </>
      )}

      {/* Consent */}
      {content.consent && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Samtycke</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Villkor accepterade:</span>
                <Badge variant={content.consent.terms ? "success" : "destructive"}>
                  {content.consent.terms ? 'Ja' : 'Nej'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Integritetspolicy:</span>
                <Badge variant={content.consent.privacy ? "success" : "destructive"}>
                  {content.consent.privacy ? 'Ja' : 'Nej'}
                </Badge>
              </div>
              {content.consent.newsletter !== undefined && (
                <div className="flex justify-between">
                  <span>Nyhetsbrev:</span>
                  <Badge variant={content.consent.newsletter ? "success" : "secondary"}>
                    {content.consent.newsletter ? 'Ja' : 'Nej'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
