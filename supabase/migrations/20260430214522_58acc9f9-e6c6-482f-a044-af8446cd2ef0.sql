-- 1. Remove overly permissive public SELECT on sections (exposes hidden rows)
DROP POLICY IF EXISTS "Public can view sections" ON public.sections;

-- 2. Remove duplicate admin policies on sections (keep "Admins can ..." variants)
DROP POLICY IF EXISTS "Admins insert sections" ON public.sections;
DROP POLICY IF EXISTS "Admins update sections" ON public.sections;
DROP POLICY IF EXISTS "Admins delete sections" ON public.sections;

-- 3. Remove duplicate policies on site_settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins update site settings" ON public.site_settings;

-- 4. Revoke EXECUTE on SECURITY DEFINER functions from signed-in users
REVOKE EXECUTE ON FUNCTION public.promote_first_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is used inside RLS policies via SECURITY DEFINER; keep callable for RLS evaluation
-- but ensure it's safe (it only reads user_roles for the passed _user_id)
