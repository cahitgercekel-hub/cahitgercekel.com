
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-promote the FIRST user to admin
CREATE OR REPLACE FUNCTION public.promote_first_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_promote_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.promote_first_user();

-- Sections
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible sections"
  ON public.sections FOR SELECT TO anon, authenticated
  USING (visible = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert sections"
  ON public.sections FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update sections"
  ON public.sections FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete sections"
  ON public.sections FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_text TEXT NOT NULL DEFAULT 'Portfolio',
  theme JSONB NOT NULL DEFAULT '{"accent":"#6c47ff","accent2":"#ff4f7b","accent3":"#00d9a5","bg":"#f5f3ef","fg":"#0e0e0e","heroGradient":"linear-gradient(135deg, #7b5fff 0%, #5b8fff 40%, #00d9a5 100%)"}'::jsonb,
  nav_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  footer_text TEXT NOT NULL DEFAULT '© 2025 Portfolio. Crafted with ❤️',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert site settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER sections_touch BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed initial settings + sections
INSERT INTO public.site_settings (logo_text, nav_items, footer_text) VALUES (
  'Portfolio',
  '[{"label":"About","href":"#about"},{"label":"Projects","href":"#projects"},{"label":"Experience","href":"#experience"},{"label":"Contact","href":"#contact"}]'::jsonb,
  '© 2025 Cahit Gerçekel. Crafted with ❤️'
);

INSERT INTO public.sections (type, position, data) VALUES
('hero', 10, '{"id":"hero","tag":"Open to opportunities","name":"Cahit","subtitle":"Product Manager & Maker","primaryBtn":{"label":"View Projects","href":"#projects"},"secondaryBtn":{"label":"Contact Me","href":"#contact"}}'::jsonb),
('about', 20, '{"id":"about","label":"Who I am","title":"About Me","paragraphs":["Hi! I''m a passionate creator who blends strategy, design, and technology to build meaningful products.","I work with early-stage founders to ideate, validate, build and launch digital products people actually use."],"skills":["Product Management","Design","Strategy","Web"]}'::jsonb),
('stats', 30, '{"id":"stats","label":"Skills","title":"What I do","items":[{"label":"Product Strategy","value":90},{"label":"UX / Design","value":80},{"label":"Engineering","value":70}]}'::jsonb),
('projects', 40, '{"id":"projects","label":"What I''ve built","title":"Selected Projects","items":[{"tag":"Web App","title":"Project One","description":"A short description of this project.","image":"","link":"#","emoji":"🚀"},{"tag":"Mobile","title":"Project Two","description":"Another great project description.","image":"","link":"#","emoji":"📱"}]}'::jsonb),
('experience', 50, '{"id":"experience","label":"Career","title":"Work Experience","items":[{"period":"2023 — Present","role":"Product Manager","company":"Acme Co","description":"Leading product strategy and execution."}]}'::jsonb),
('contact', 60, '{"id":"contact","label":"Get in touch","title":"Let''s Connect","intro":"I''m always open to new opportunities, collaborations, and interesting conversations.","links":[{"icon":"✉️","label":"hello@cahitgercekel.com","href":"mailto:hello@cahitgercekel.com"},{"icon":"💼","label":"LinkedIn","href":"https://linkedin.com"}]}'::jsonb);
