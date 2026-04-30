import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUploadField from "./FileUploadField";
import type { BlockType } from "@/lib/blocks";

type Props = {
  type: BlockType;
  data: any;
  onChange: (d: any) => void;
};

/**
 * Per-section layout & positioning controls.
 * Stored under data.layout = { imagePos, textAlign, paddingY, bg, bgImage, maxWidth, imageSize }
 */
export default function LayoutEditor({ type, data, onChange }: Props) {
  const layout = data.layout ?? {};
  const set = (k: string, v: any) => onChange({ ...data, layout: { ...layout, [k]: v } });

  const supportsImagePosition = type === "hero" || type === "about";
  const supportsImageSize = type === "hero" || type === "about" || type === "image";

  return (
    <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Layout & position
      </div>

      {supportsImagePosition && (
        <div className="space-y-1.5">
          <Label className="text-xs">Image position</Label>
          <select
            className="w-full border rounded h-9 px-2 text-sm bg-background"
            value={layout.imagePos ?? "right"}
            onChange={(e) => set("imagePos", e.target.value)}
          >
            <option value="right">Right of text</option>
            <option value="left">Left of text</option>
            <option value="top">Above text</option>
            <option value="bottom">Below text</option>
            <option value="background">Background (text overlay)</option>
          </select>
        </div>
      )}

      {supportsImageSize && (
        <div className="space-y-1.5">
          <Label className="text-xs">Image size</Label>
          <select
            className="w-full border rounded h-9 px-2 text-sm bg-background"
            value={layout.imageSize ?? "medium"}
            onChange={(e) => set("imageSize", e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="full">Full width</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Text alignment</Label>
          <select
            className="w-full border rounded h-9 px-2 text-sm bg-background"
            value={layout.textAlign ?? "left"}
            onChange={(e) => set("textAlign", e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Vertical padding (px)</Label>
          <Input
            type="number"
            value={layout.paddingY ?? ""}
            placeholder="default"
            onChange={(e) => set("paddingY", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Background color (CSS, optional)</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={layout.bg && /^#/.test(layout.bg) ? layout.bg : "#ffffff"}
            onChange={(e) => set("bg", e.target.value)}
            className="w-12 h-9 border rounded cursor-pointer"
          />
          <Input
            value={layout.bg ?? ""}
            placeholder="#ffffff or linear-gradient(...)"
            onChange={(e) => set("bg", e.target.value)}
          />
        </div>
      </div>

      <FileUploadField
        label="Background image (optional)"
        value={layout.bgImage ?? ""}
        onChange={(v) => set("bgImage", v)}
        folder="backgrounds"
        accept="image/*"
      />

      <div className="space-y-1.5">
        <Label className="text-xs">Inner max width (px, optional)</Label>
        <Input
          type="number"
          value={layout.maxWidth ?? ""}
          placeholder="960"
          onChange={(e) => set("maxWidth", e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </div>
    </div>
  );
}
