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
import { GripVertical, Eye, EyeOff, Trash2, Copy, Plus, LogOut, ExternalLink, Pencil } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_DEFAULTS, BLOCK_LABELS, BlockType, SectionRow } from "@/lib/blocks";
import BlockEditor from "@/components/admin/BlockEditor";

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = async (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id || !sections) return;
    const oldIdx = sections.findIndex((s) => s.id === e.active.id);
    const newIdx = sections.findIndex((s) => s.id === e.over!.id);
    const reordered = arrayMove(sections, oldIdx, newIdx);
    const updates = reordered.map((s, i) => ({ id: s.id, position: (i + 1) * 10 }));
    qc.setQueryData(["sections", true], reordered.map((s, i) => ({ ...s, position: (i + 1) * 10 })));
    for (const u of updates) {
      await supabase.from("sections").update({ position: u.position }).eq("id", u.id);
    }
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
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").update({ theme, footer_text: footer }).eq("id", settings.id);
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
      <CardHeader><CardTitle className="text-base">Theme & Footer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {colorRow("accent", "Accent")}
          {colorRow("accent2", "Accent 2")}
          {colorRow("accent3", "Accent 3")}
          {colorRow("bg", "Background")}
          {colorRow("fg", "Foreground")}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hero gradient (CSS)</Label>
          <Textarea value={theme.heroGradient} onChange={(e) => setTheme({ ...theme, heroGradient: e.target.value })} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Footer text</Label>
          <Input value={footer} onChange={(e) => setFooter(e.target.value)} />
        </div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}

function NavEditor({ settings, onSaved }: { settings: any; onSaved: () => void }) {
  const [logo, setLogo] = useState(settings.logo_text);
  const [items, setItems] = useState<{ label: string; href: string }[]>(settings.nav_items ?? []);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").update({ logo_text: logo, nav_items: items }).eq("id", settings.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Navigation</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Logo text</Label>
          <Input value={logo} onChange={(e) => setLogo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Nav links</Label>
          {items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Label" value={it.label} onChange={(e) => { const n = [...items]; n[i].label = e.target.value; setItems(n); }} />
              <Input placeholder="#anchor" value={it.href} onChange={(e) => { const n = [...items]; n[i].href = e.target.value; setItems(n); }} />
              <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, x) => x !== i))}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { label: "", href: "#" }])}><Plus className="w-3 h-3 mr-1" /> Add link</Button>
        </div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}
