import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Trash2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
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

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ value = {}, onChange }) => {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    date: '',
    title: '',
    description: '',
  });

  const handleStartDateChange = (date: string) => {
    onChange({ ...value, start_date: date });
  };

  const handleEndDateChange = (date: string) => {
    onChange({ ...value, end_date: date });
  };

  const handleAddMilestone = () => {
    if (!newMilestone.date || !newMilestone.title) return;
    
    const milestones = [...(value.milestones || []), newMilestone];
    onChange({ ...value, milestones });
    
    setNewMilestone({ date: '', title: '', description: '' });
    setIsAddingMilestone(false);
  };

  const handleDeleteMilestone = (index: number) => {
    const milestones = [...(value.milestones || [])];
    milestones.splice(index, 1);
    onChange({ ...value, milestones });
  };

  const handleUpdateMilestone = (index: number, field: keyof Milestone, newValue: string) => {
    const milestones = [...(value.milestones || [])];
    milestones[index] = { ...milestones[index], [field]: newValue };
    onChange({ ...value, milestones });
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
                value={value.start_date || ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Slutdatum</Label>
              <Input
                id="end_date"
                type="date"
                value={value.end_date || ''}
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
          {!value.milestones || value.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Inga milstolpar tillagda ännu. Klicka på knappen ovan för att lägga till.
            </p>
          ) : (
            <div className="space-y-3">
              {value.milestones.map((milestone, index) => (
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
      {(value.start_date || value.end_date || (value.milestones && value.milestones.length > 0)) && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Förhandsgranskning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {value.start_date && (
              <p>
                <strong>Start:</strong> {formatDisplayDate(value.start_date)}
              </p>
            )}
            {value.end_date && (
              <p>
                <strong>Slut:</strong> {formatDisplayDate(value.end_date)}
              </p>
            )}
            {value.milestones && value.milestones.length > 0 && (
              <div>
                <strong>Milstolpar:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  {value.milestones.map((m, i) => (
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
    </div>
  );
};
