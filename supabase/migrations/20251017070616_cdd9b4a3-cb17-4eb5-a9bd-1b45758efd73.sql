-- Add RLS policies for admins to manage sponsors
CREATE POLICY "Admins can insert sponsors" ON public.sponsors
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sponsors" ON public.sponsors
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sponsors" ON public.sponsors
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));