import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitlistFormData {
  email: string;
  name?: string;
  interests?: string[];
}

interface WaitlistFormProps {
  context?: 'residency' | 'general' | 'volunteer';
  title?: string;
  description?: string;
  className?: string;
}

export const WaitlistForm: React.FC<WaitlistFormProps> = ({
  context = 'residency',
  title = 'Pinga mig när ansökan öppnar',
  description = 'Missa inte nästa chans att bli en del av Zeppel Inn.',
  className,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WaitlistFormData>();

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      setIsSubmitting(true);

      // Submit to submissions table as type 'waitlist'
      const { error } = await supabase
        .from('submissions')
        .insert({
          type: 'collaboration', // Using collaboration type for waitlist
          title: `Waitlist Signup - ${context}`,
          content: {
            waitlist_context: context,
            contact_info: {
              email: data.email,
              name: data.name || '',
            },
            signup_date: new Date().toISOString(),
            interests: data.interests || [],
          },
          contact_email: data.email,
          status: 'approved', // Auto-approve waitlist signups
          how_found_us: 'waitlist-form',
        });

      if (error) throw error;

      setIsSuccess(true);
      reset();

      toast({
        title: 'Du är på listan!',
        description: 'Vi meddelar dig så fort ansökan öppnar.',
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Waitlist signup error:', err);
      toast({
        title: 'Något gick fel',
        description: 'Försök igen eller kontakta oss direkt.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 ${className}`}>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tack för din anmälan!</h3>
            <p className="text-gray-600">Du får ett mail så fort ansökan öppnar.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="din@email.se"
                    {...register('email', {
                      required: 'E-post krävs',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Ogiltig e-postadress',
                      },
                    })}
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sparar...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Bevaka
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Vi delar aldrig din e-post. Du kan avregistrera dig när som helst.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
