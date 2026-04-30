import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SectionRow, SiteSettings } from "@/lib/blocks";

export function useSections(includeHidden = false) {
  return useQuery({
    queryKey: ["sections", includeHidden],
    queryFn: async () => {
      let q = supabase.from("sections").select("*").order("position", { ascending: true });
      if (!includeHidden) q = q.eq("visible", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SectionRow[];
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as unknown as SiteSettings | null;
    },
  });
}
