import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [picking, setPicking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!picking || !onFocalChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onFocalChange(`${x}% ${y}%`);
  };

  const focalPos = focal || "50% 50%";
  const [fx, fy] = focalPos.split(" ").map((v) => parseFloat(v));

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
      {value && preview === "image" && (
        <div className="space-y-1.5">
          <div
            onClick={handlePreviewClick}
            className={`relative mt-2 rounded border bg-muted/30 overflow-hidden ${
              picking ? "cursor-crosshair ring-2 ring-primary" : ""
            }`}
            style={{ height: 180 }}
          >
            <img
              src={value}
              alt=""
              className="w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: focalPos,
              }}
            />
            {onFocalChange && !isNaN(fx) && !isNaN(fy) && (
              <div
                className="absolute pointer-events-none w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${fx}%`,
                  top: `${fy}%`,
                  background: "hsl(var(--primary) / 0.6)",
                }}
              />
            )}
          </div>
          {onFocalChange && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={picking ? "default" : "outline"}
                size="sm"
                onClick={() => setPicking((p) => !p)}
              >
                <Crosshair className="w-4 h-4 mr-1" />
                {picking ? "Click image to set focal" : "Set focal point"}
              </Button>
              <span className="text-xs text-muted-foreground">{focalPos}</span>
              {focal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFocalChange("50% 50%")}
                >
                  Reset
                </Button>
              )}
            </div>
          )}
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
