import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Plus, Trash2, GripVertical, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '@/hooks/use-toast';

interface Milestone {
  date: string;
  title: string;
  description?: string;
}

interface TimelineValue {
  start_date?: string;
  end_date?: string;
  milestones?: Milestone[];
}

interface TimelineEditorProps {
  value?: TimelineValue;
  onChange: (value: TimelineValue) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ value, onChange }) => {
  const { toast } = useToast();
  const [localValue, setLocalValue] = useState<TimelineValue>(value || {});
  const [savedValue, setSavedValue] = useState<TimelineValue>(value || {});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    date: '',
    title: '',
    description: '',
  });

  const hasUnsavedChanges = JSON.stringify(localValue) !== JSON.stringify(savedValue);
  useUnsavedChanges(hasUnsavedChanges);

  useEffect(() => {
    if (value) {
      setLocalValue(value);
      setSavedValue(value);
    }
  }, [value]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onChange(localValue);
      setSavedValue(localValue);
      setLastSaved(new Date());
      toast({
        title: "Ändringar sparade",
        description: "Tidslinjen har uppdaterats.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kunde inte spara",
        description: "Ett fel uppstod när ändringarna skulle sparas.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalValue(savedValue);
    toast({
      title: "Ändringar återställda",
      description: "Alla osparade ändringar har ångrats.",
    });
  };

  const handleStartDateChange = (date: string) => {
    setLocalValue({ ...localValue, start_date: date });
  };

  const handleEndDateChange = (date: string) => {
    setLocalValue({ ...localValue, end_date: date });
  };

  const handleAddMilestone = () => {
    if (!newMilestone.date || !newMilestone.title) return;
    
    const milestones = [...(localValue.milestones || []), newMilestone];
    setLocalValue({ ...localValue, milestones });
    
    setNewMilestone({ date: '', title: '', description: '' });
    setIsAddingMilestone(false);
  };

  const handleDeleteMilestone = (index: number) => {
    const milestones = [...(localValue.milestones || [])];
    milestones.splice(index, 1);
    setLocalValue({ ...localValue, milestones });
  };

  const handleUpdateMilestone = (index: number, field: keyof Milestone, newValue: string) => {
    const milestones = [...(localValue.milestones || [])];
    milestones[index] = { ...milestones[index], [field]: newValue };
    setLocalValue({ ...localValue, milestones });
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'PPP', { locale: sv });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Du har osparade ändringar. Glöm inte att spara!
          </AlertDescription>
        </Alert>
      )}

      {/* Start and End Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Projektperiod
          </CardTitle>
          <CardDescription>
            Ange start- och slutdatum för projektet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Startdatum</Label>
              <Input
                id="start_date"
                type="date"
                value={localValue.start_date || ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Slutdatum</Label>
              <Input
                id="end_date"
                type="date"
                value={localValue.end_date || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Milstolpar</CardTitle>
              <CardDescription>
                Lägg till viktiga milstolpar i projektet
              </CardDescription>
            </div>
            <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till milstolpe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ny milstolpe</DialogTitle>
                  <DialogDescription>
                    Skapa en ny milstolpe för projektet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="milestone_date">Datum</Label>
                    <Input
                      id="milestone_date"
                      type="date"
                      value={newMilestone.date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone_title">Titel</Label>
                    <Input
                      id="milestone_title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      placeholder="T.ex. Projektstart"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone_description">Beskrivning (valfritt)</Label>
                    <Textarea
                      id="milestone_description"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      placeholder="Beskriv vad som händer vid denna milstolpe..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMilestone(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={handleAddMilestone}>
                    Lägg till
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!localValue.milestones || localValue.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Inga milstolpar tillagda ännu. Klicka på knappen ovan för att lägga till.
            </p>
          ) : (
            <div className="space-y-3">
              {localValue.milestones.map((milestone, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={milestone.title}
                            onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                            className="font-medium"
                            placeholder="Milstolpens titel"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMilestone(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <Input
                            type="date"
                            value={milestone.date}
                            onChange={(e) => handleUpdateMilestone(index, 'date', e.target.value)}
                            className="max-w-[200px]"
                          />
                          {milestone.date && (
                            <span className="ml-2">{formatDisplayDate(milestone.date)}</span>
                          )}
                        </div>
                        <Textarea
                          value={milestone.description || ''}
                          onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                          placeholder="Beskrivning (valfritt)"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {(localValue.start_date || localValue.end_date || (localValue.milestones && localValue.milestones.length > 0)) && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Förhandsgranskning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {localValue.start_date && (
              <p>
                <strong>Start:</strong> {formatDisplayDate(localValue.start_date)}
              </p>
            )}
            {localValue.end_date && (
              <p>
                <strong>Slut:</strong> {formatDisplayDate(localValue.end_date)}
              </p>
            )}
            {localValue.milestones && localValue.milestones.length > 0 && (
              <div>
                <strong>Milstolpar:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  {localValue.milestones.map((m, i) => (
                    <li key={i}>
                      {m.title} ({formatDisplayDate(m.date)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sticky Save Controls */}
      <div className="sticky bottom-0 z-10 bg-background border-t pt-4 pb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastSaved ? (
            <span>Senast sparad {formatDistanceToNow(lastSaved, { addSuffix: true, locale: sv })}</span>
          ) : (
            <span>Inga ändringar sparade ännu</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Ångra ändringar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sparar...' : 'Spara ändringar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
