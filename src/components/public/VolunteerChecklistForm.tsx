import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSubmission } from '@/hooks/useSubmission';
import { 
  HandHeart, 
  Hammer, 
  Ship, 
  UtensilsCrossed, 
  Camera, 
  Code, 
  Palette, 
  Users,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VolunteerSkill {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const volunteerSkills: VolunteerSkill[] = [
  {
    id: 'snickra',
    label: 'Snickra',
    icon: <Hammer className="w-5 h-5" />,
    description: 'Bygg och konstruktion',
  },
  {
    id: 'kora-bat',
    label: 'Köra båt',
    icon: <Ship className="w-5 h-5" />,
    description: 'Transport i skärgården',
  },
  {
    id: 'laga-mat',
    label: 'Laga mat',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    description: 'Catering och måltider',
  },
  {
    id: 'dokumentera',
    label: 'Dokumentera',
    icon: <Camera className="w-5 h-5" />,
    description: 'Foto och video',
  },
  {
    id: 'koda',
    label: 'Koda',
    icon: <Code className="w-5 h-5" />,
    description: 'Webb och teknik',
  },
  {
    id: 'skapa',
    label: 'Skapa konst',
    icon: <Palette className="w-5 h-5" />,
    description: 'Kreativt arbete',
  },
  {
    id: 'koordinera',
    label: 'Koordinera',
    icon: <Users className="w-5 h-5" />,
    description: 'Event och logistik',
  },
];

interface VolunteerChecklistFormProps {
  className?: string;
  onClose?: () => void;
  isDialog?: boolean;
}

export const VolunteerChecklistForm: React.FC<VolunteerChecklistFormProps> = ({
  className,
  onClose,
  isDialog = false,
}) => {
  const { toast } = useToast();
  const { isSubmitting, submitForm } = useSubmission();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSkills.length === 0) {
      toast({
        title: 'Välj minst en färdighet',
        description: 'Vad kan du bidra med?',
        variant: 'destructive',
      });
      return;
    }

    if (!email) {
      toast({
        title: 'E-post krävs',
        description: 'Vi behöver din e-post för att kunna kontakta dig.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        type: 'collaboration' as const,
        title: `Volunteer Interest - ${name || email}`,
        content: {
          volunteer_skills: selectedSkills,
          collaboration_type: 'volunteer',
          availability: message,
          contact_info: {
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            email,
            phone,
          },
          additional_info: {
            motivation: `Jag kan bidra med: ${selectedSkills.map(s => 
              volunteerSkills.find(vs => vs.id === s)?.label
            ).join(', ')}`,
            message,
          },
          consent: {
            terms: true,
            privacy: true,
          },
        },
        contact_email: email,
        contact_phone: phone,
      };

      await submitForm('collaboration', payload, []);

      setIsSuccess(true);
      toast({
        title: 'Tack för din anmälan!',
        description: 'Vi hör av oss när vi behöver din hjälp.',
      });

      // Reset after success
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedSkills([]);
        setEmail('');
        setName('');
        setPhone('');
        setMessage('');
        onClose?.();
      }, 3000);
    } catch (err) {
      console.error('Volunteer signup error:', err);
      toast({
        title: 'Något gick fel',
        description: 'Försök igen eller kontakta oss direkt.',
        variant: 'destructive',
      });
    }
  };

  const formContent = (
    <>
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Tack för att du vill hjälpa!</h3>
          <p className="text-gray-600">Vi kontaktar dig när vi behöver just din kompetens.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skills Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Jag kan bidra med... <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {volunteerSkills.map((skill) => (
                <motion.button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedSkills.includes(skill.id)
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`mb-2 ${
                    selectedSkills.includes(skill.id) ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {skill.icon}
                  </div>
                  <div className="font-medium text-sm text-gray-800">{skill.label}</div>
                  <div className="text-xs text-gray-500">{skill.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="volunteer-name">Namn</Label>
              <Input
                id="volunteer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt namn"
              />
            </div>
            <div>
              <Label htmlFor="volunteer-email">E-post *</Label>
              <Input
                id="volunteer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="volunteer-phone">Telefon (valfritt)</Label>
            <Input
              id="volunteer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+46 70 123 45 67"
            />
          </div>

          <div>
            <Label htmlFor="volunteer-message">Något mer vi borde veta?</Label>
            <Input
              id="volunteer-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="T.ex. tillgänglighet, erfarenhet..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Avbryt
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || selectedSkills.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Skickar...
                </>
              ) : (
                <>
                  <HandHeart className="w-4 h-4 mr-2" />
                  Skicka intresseanmälan
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </>
  );

  if (isDialog) {
    return formContent;
  }

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-emerald-200 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <HandHeart className="w-5 h-5 text-emerald-600" />
          Jag vill bidra med min tid
        </CardTitle>
        <p className="text-sm text-gray-600">
          Du behöver inte vara expert – alla bidrag räknas!
        </p>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

// Dialog wrapper for use in other components
export const VolunteerChecklistDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold">Jag vill bidra med min tid</h2>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Du behöver inte vara expert – alla bidrag räknas!
        </p>
        <VolunteerChecklistForm
          isDialog
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
