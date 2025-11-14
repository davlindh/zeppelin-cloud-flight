-- Fix critical admin RLS usability issues
-- Issue 1: Admins cannot insert into project_media (missing WITH CHECK clause)
-- Issue 2: Admins cannot update order_status_history (read-only access)

-- ================================
-- FIX 1: project_media table
-- ================================

-- Drop and recreate the admin policy with proper WITH CHECK clause
DROP POLICY IF EXISTS "Admins can manage project_media" ON public.project_media;

CREATE POLICY "Admins can manage project_media"
ON public.project_media
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ================================
-- FIX 2: order_status_history table
-- ================================

-- Add full admin management policy (currently only has SELECT)
CREATE POLICY "Admins can manage order status history"
ON public.order_status_history
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));