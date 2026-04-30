DROP POLICY IF EXISTS "Public can read visible sections" ON public.sections;

CREATE POLICY "Public can read visible sections"
ON public.sections
FOR SELECT
TO anon, authenticated
USING (visible = true);

CREATE POLICY "Admins can read all sections"
ON public.sections
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS sections_visible_position_idx
ON public.sections (visible, position);