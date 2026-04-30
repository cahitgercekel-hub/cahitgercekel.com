import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, X, Crosshair } from "lucide-react";
import { toast } from "sonner";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  preview?: "image" | "file" | "none";
  /** Optional focal point as "x% y%" (e.g. "50% 30%"). When provided, enables click-to-set focal picker. */
  focal?: string;
  onFocalChange?: (focal: string) => void;
};

const CROP_PREVIEWS: { label: string; ratio: string; width: number }[] = [
  { label: "Square", ratio: "1 / 1", width: 110 },
  { label: "Landscape 16:9", ratio: "16 / 9", width: 200 },
  { label: "Portrait 3:4", ratio: "3 / 4", width: 110 },
];

export default function FileUploadField({
  label,
  value,
  onChange,
  folder = "uploads",
  accept = "image/*",
  preview = "image",
  focal,
  onFocalChange,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const focalPos = focal || "50% 50%";
  const [fxStr, fyStr] = focalPos.split(" ");
  const fx = Math.max(0, Math.min(100, parseFloat(fxStr) || 50));
  const fy = Math.max(0, Math.min(100, parseFloat(fyStr) || 50));

  const setFocal = (x: number, y: number) => {
    if (!onFocalChange) return;
    const cx = Math.round(Math.max(0, Math.min(100, x)));
    const cy = Math.round(Math.max(0, Math.min(100, y)));
    onFocalChange(`${cx}% ${cy}%`);
  };

  const updateFromEvent = (clientX: number, clientY: number) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setFocal(((clientX - rect.left) / rect.width) * 100, ((clientY - rect.top) / rect.height) * 100);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => updateFromEvent(e.clientX, e.clientY);
    const onUp = () => setDragging(false);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) updateFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste URL or upload"
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-1" />
          {busy ? "..." : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {value && preview === "image" && !onFocalChange && (
        <img src={value} alt="" className="mt-2 rounded border max-h-32 object-contain bg-muted/30" />
      )}

      {value && preview === "image" && onFocalChange && (
        <div className="mt-2 space-y-3 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Crosshair className="w-3.5 h-3.5" />
              Focal point
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">{`${Math.round(fx)}% / ${Math.round(fy)}%`}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setFocal(50, 50)}>
                Reset
              </Button>
            </div>
          </div>

          {/* Source image with draggable focal marker */}
          <div
            ref={frameRef}
            onMouseDown={(e) => {
              setDragging(true);
              updateFromEvent(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              setDragging(true);
              if (e.touches[0]) updateFromEvent(e.touches[0].clientX, e.touches[0].clientY);
            }}
            className="relative rounded-md border bg-background overflow-hidden cursor-crosshair select-none touch-none"
            style={{ aspectRatio: "16 / 10" }}
          >
            <img
              src={value}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain bg-[repeating-conic-gradient(hsl(var(--muted))_0_25%,transparent_0_50%)] bg-[length:20px_20px]"
            />
            {/* Crosshair guides */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary/70 pointer-events-none"
              style={{ left: `${fx}%` }}
            />
            <div
              className="absolute left-0 right-0 h-px bg-primary/70 pointer-events-none"
              style={{ top: `${fy}%` }}
            />
            {/* Focal marker */}
            <div
              className="absolute pointer-events-none rounded-full border-2 border-white shadow-[0_0_0_2px_hsl(var(--primary))]"
              style={{
                left: `${fx}%`,
                top: `${fy}%`,
                width: 18,
                height: 18,
                marginLeft: -9,
                marginTop: -9,
                background: "hsl(var(--primary))",
              }}
            />
          </div>

          {/* Precise sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Horizontal</span>
                <span className="tabular-nums">{Math.round(fx)}%</span>
              </div>
              <Slider value={[fx]} min={0} max={100} step={1} onValueChange={(v) => setFocal(v[0], fy)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Vertical</span>
                <span className="tabular-nums">{Math.round(fy)}%</span>
              </div>
              <Slider value={[fy]} min={0} max={100} step={1} onValueChange={(v) => setFocal(fx, v[0])} />
            </div>
          </div>

          {/* Live crop previews at common aspect ratios */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Live crop preview (object-position: {focalPos})</div>
            <div className="flex flex-wrap gap-3">
              {CROP_PREVIEWS.map((c) => (
                <div key={c.label} className="space-y-1">
                  <div
                    className="rounded border overflow-hidden bg-muted/30"
                    style={{ width: c.width, aspectRatio: c.ratio }}
                  >
                    <img
                      src={value}
                      alt=""
                      className="w-full h-full"
                      style={{ objectFit: "cover", objectPosition: focalPos }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {value && preview === "file" && (
        <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary underline break-all">
          {value.split("/").pop()}
        </a>
      )}
    </div>
  );
}
