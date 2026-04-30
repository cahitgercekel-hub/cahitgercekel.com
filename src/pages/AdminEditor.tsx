import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAdmin";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { GripVertical, Eye, EyeOff, Trash2, Copy, Plus, LogOut, ExternalLink, Pencil, Sparkles, Loader2 } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_DEFAULTS, BLOCK_LABELS, BlockType, SectionRow } from "@/lib/blocks";
import BlockEditor from "@/components/admin/BlockEditor";
import FileUploadField from "@/components/admin/FileUploadField";
import { translateOne, translateTexts, type TargetLang } from "@/lib/translate";

const FONT_CHOICES = ["Inter", "Poppins", "Manrope", "Space Grotesk", "Playfair", "Syne", "DM Sans"];

export default function AdminEditor() {
  const { session, loading } = useAuth();
  const isAdmin = useIsAdmin(session?.user.id);
  const { data: sections } = useSections(true);
  const { data: settings } = useSiteSettings();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [editing, setEditing] = useState<SectionRow | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (loading || isAdmin === null) return <div className="p-8">Loading...</div>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <h2 className="text-xl font-semibold">Not authorized</h2>
        <p className="text-muted-foreground text-sm">Your account doesn't have admin access.</p>
        <Button onClick={async () => { await supabase.auth.signOut(); nav("/admin/login"); }}>Sign out</Button>
      </div>
    );
  }

  const refresh = () => { qc.invalidateQueries({ queryKey: ["sections"] }); qc.invalidateQueries({ queryKey: ["site_settings"] }); };

  const addBlock = async (type: BlockType) => {
    const maxPos = (sections ?? []).reduce((m, s) => Math.max(m, s.position), 0);
    const { error } = await supabase.from("sections").insert({
      type, position: maxPos + 10, visible: true, data: structuredClone(BLOCK_DEFAULTS[type]),
    });
    if (error) toast.error(error.message); else { toast.success("Block added"); refresh(); }
  };


  const onDragEnd = async (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id || !sections) return;
    const oldIdx = sections.findIndex((s) => s.id === e.active.id);
    const newIdx = sections.findIndex((s) => s.id === e.over!.id);
    const reordered = arrayMove(sections, oldIdx, newIdx);
    const updates = reordered.map((s, i) => ({ id: s.id, position: (i + 1) * 10 }));
    const optimistic = reordered.map((s, i) => ({ ...s, position: (i + 1) * 10 }));
    qc.setQueryData(["sections", true], optimistic);
    qc.setQueryData(["sections", false], optimistic.filter((s) => s.visible));
    await Promise.all(
      updates.map((u) => supabase.from("sections").update({ position: u.position }).eq("id", u.id))
    );
    refresh();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-semibold">Portfolio Admin</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild><a href="/" target="_blank"><ExternalLink className="w-4 h-4 mr-1" /> View site</a></Button>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); nav("/admin/login"); }}>
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="sections">
          <TabsList>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="site">Site</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Page sections</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add section</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
                    <DropdownMenuItem key={t} onClick={() => addBlock(t)}>{BLOCK_LABELS[t]}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={(sections ?? []).map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {(sections ?? []).map((s) => (
                    <SortableRow key={s.id} section={s} onEdit={() => setEditing(s)} onChanged={refresh} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>

          <TabsContent value="theme">
            {settings && <ThemeEditor settings={settings} onSaved={refresh} />}
          </TabsContent>

          <TabsContent value="navigation">
            {settings && <NavEditor settings={settings} onSaved={refresh} />}
          </TabsContent>

          <TabsContent value="site">
            {settings && <SiteMetaEditor settings={settings} onSaved={refresh} />}
          </TabsContent>
        </Tabs>
      </main>

      {editing && (
        <EditDialog
          section={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function SortableRow({ section, onEdit, onChanged }: { section: SectionRow; onEdit: () => void; onChanged: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const toggle = async () => {
    await supabase.from("sections").update({ visible: !section.visible }).eq("id", section.id);
    onChanged();
  };
  const del = async () => {
    if (!confirm("Delete this section?")) return;
    await supabase.from("sections").delete().eq("id", section.id);
    toast.success("Deleted"); onChanged();
  };
  const dup = async () => {
    await supabase.from("sections").insert({ type: section.type, position: section.position + 5, visible: section.visible, data: section.data });
    toast.success("Duplicated"); onChanged();
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-3 flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground p-1"><GripVertical className="w-4 h-4" /></button>
        <div className="flex-1">
          <div className="font-medium text-sm">{BLOCK_LABELS[section.type as BlockType] || section.type}</div>
          <div className="text-xs text-muted-foreground">
            {section.data?.title || section.data?.name || section.data?.id || "—"}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} title={section.visible ? "Hide" : "Show"}>
          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={dup}><Copy className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={del}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </CardContent>
    </Card>
  );
}

function EditDialog({ section, onClose, onSaved }: { section: SectionRow; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState<any>(section.data ?? {});
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("sections").update({ data }).eq("id", section.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit {BLOCK_LABELS[section.type as BlockType]}</DialogTitle></DialogHeader>
        <BlockEditor type={section.type as BlockType} data={data} onChange={setData} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ThemeEditor({ settings, onSaved }: { settings: any; onSaved: () => void }) {
  const [theme, setTheme] = useState(settings.theme);
  const [footer, setFooter] = useState(settings.footer_text);
  const [footerTr, setFooterTr] = useState(settings.i18n?.tr?.footer_text ?? "");
  const [footerDe, setFooterDe] = useState(settings.i18n?.de?.footer_text ?? "");
  const [font, setFont] = useState(settings.font_family || "Inter");
  const [radius, setRadius] = useState<number>(settings.radius ?? 14);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const i18n = {
      ...(settings.i18n ?? {}),
      tr: { ...(settings.i18n?.tr ?? {}), footer_text: footerTr },
      de: { ...(settings.i18n?.de ?? {}), footer_text: footerDe },
    };
    const { error } = await supabase
      .from("site_settings")
      .update({ theme, footer_text: footer, font_family: font, radius, i18n })
      .eq("id", settings.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  };
  const colorRow = (key: string, label: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <input type="color" value={theme[key]} onChange={(e) => setTheme({ ...theme, [key]: e.target.value })} className="w-12 h-9 border rounded cursor-pointer" />
        <Input value={theme[key]} onChange={(e) => setTheme({ ...theme, [key]: e.target.value })} />
      </div>
    </div>
  );
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Theme & Typography</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {colorRow("accent", "Accent")}
          {colorRow("accent2", "Accent 2")}
          {colorRow("accent3", "Accent 3")}
          {colorRow("bg", "Background")}
          {colorRow("fg", "Foreground")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Font family</Label>
            <select className="w-full border rounded h-9 px-2 text-sm bg-background" value={font} onChange={(e) => setFont(e.target.value)}>
              {FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Corner roundness ({radius}px)</Label>
            <input type="range" min={0} max={32} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hero gradient (CSS)</Label>
          <Textarea value={theme.heroGradient} onChange={(e) => setTheme({ ...theme, heroGradient: e.target.value })} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Footer text (English)</Label>
          <Input value={footer} onChange={(e) => setFooter(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Footer · Türkçe (TR)</Label>
            <Input value={footerTr} onChange={(e) => setFooterTr(e.target.value)} placeholder={footer} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Footer · Deutsch (DE)</Label>
            <Input value={footerDe} onChange={(e) => setFooterDe(e.target.value)} placeholder={footer} />
          </div>
        </div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}

function SiteMetaEditor({ settings, onSaved }: { settings: any; onSaved: () => void }) {
  const [siteTitle, setSiteTitle] = useState(settings.site_title || "");
  const [metaDesc, setMetaDesc] = useState(settings.meta_description || "");
  const [favicon, setFavicon] = useState(settings.favicon_url || "");
  const [og, setOg] = useState(settings.og_image_url || "");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").update({
      site_title: siteTitle || null,
      meta_description: metaDesc || null,
      favicon_url: favicon || null,
      og_image_url: og || null,
    }).eq("id", settings.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Site metadata & SEO</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Browser tab title</Label>
          <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="Cahit Gercekel — Product Manager" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Meta description (under 160 chars)</Label>
          <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} maxLength={160} />
        </div>
        <FileUploadField label="Favicon" value={favicon} onChange={setFavicon} folder="meta" accept="image/*" />
        <FileUploadField label="Social share image (Open Graph)" value={og} onChange={setOg} folder="meta" accept="image/*" />
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}

function NavEditor({ settings, onSaved }: { settings: any; onSaved: () => void }) {
  const [logo, setLogo] = useState(settings.logo_text);
  const [logoTr, setLogoTr] = useState(settings.i18n?.tr?.logo_text ?? "");
  const [logoDe, setLogoDe] = useState(settings.i18n?.de?.logo_text ?? "");
  const [items, setItems] = useState<{ label: string; href: string }[]>(settings.nav_items ?? []);
  const [navTr, setNavTr] = useState<string[]>(settings.i18n?.tr?.nav_items ?? []);
  const [navDe, setNavDe] = useState<string[]>(settings.i18n?.de?.nav_items ?? []);
  const [busy, setBusy] = useState(false);

  const setNavLang = (lang: "tr" | "de", i: number, v: string) => {
    const arr = [...(lang === "tr" ? navTr : navDe)];
    arr[i] = v;
    if (lang === "tr") setNavTr(arr); else setNavDe(arr);
  };

  const save = async () => {
    setBusy(true);
    const i18n = {
      ...(settings.i18n ?? {}),
      tr: { ...(settings.i18n?.tr ?? {}), logo_text: logoTr, nav_items: navTr },
      de: { ...(settings.i18n?.de ?? {}), logo_text: logoDe, nav_items: navDe },
    };
    const { error } = await supabase.from("site_settings").update({ logo_text: logo, nav_items: items, i18n }).eq("id", settings.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Navigation</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Logo text (English)</Label>
          <Input value={logo} onChange={(e) => setLogo(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Logo · Türkçe (TR)</Label>
            <Input value={logoTr} onChange={(e) => setLogoTr(e.target.value)} placeholder={logo} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Logo · Deutsch (DE)</Label>
            <Input value={logoDe} onChange={(e) => setLogoDe(e.target.value)} placeholder={logo} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Nav links</Label>
          {items.map((it, i) => (
            <div key={i} className="space-y-1.5 border rounded-lg p-2 bg-muted/20">
              <div className="flex gap-2">
                <Input placeholder="Label (EN)" value={it.label} onChange={(e) => { const n = [...items]; n[i].label = e.target.value; setItems(n); }} />
                <Input placeholder="#anchor" value={it.href} onChange={(e) => { const n = [...items]; n[i].href = e.target.value; setItems(n); }} />
                <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, x) => x !== i))}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={`TR — ${it.label}`} value={navTr[i] ?? ""} onChange={(e) => setNavLang("tr", i, e.target.value)} />
                <Input placeholder={`DE — ${it.label}`} value={navDe[i] ?? ""} onChange={(e) => setNavLang("de", i, e.target.value)} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { label: "", href: "#" }])}><Plus className="w-3 h-3 mr-1" /> Add link</Button>
        </div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}
