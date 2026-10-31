# 3D exploded view on project pages

A project page can show a scroll-driven 3D model: it starts assembled, comes apart while the visitor
scrolls, then highlights one part after another with a short label. LärmLupe (`/laermlupe`) uses it.

## Turn it on for a project

1. Put the two model files in `public/projects/<slug>/model/` (a manifest `.json` and a geometry `.bin`).
2. In `/admin`, open the project, then **3D exploded view (scroll animation)**:
   - tick **Show the 3D exploded view on the project page**
   - **Manifest URL**: for example `/projects/laermlupe/model/laermbox.json`
   - **Eyebrow** (for example "Inside the LärmBox") and an **Intro text**; both can be translated in the
     translations panel like the other project texts.
3. Save. The section appears between the description and the gallery.

The heading ("Scroll to take it apart."), the part counter and the fallback message are translated in the
component. Part names and texts come from the manifest.

## Make the model files

Open the assembled model in Blender and run `tools/blender/export_exploded_view.py` (Scripting tab →
Open → Run Script). Set `NAME`, `OUT_DIR` and, if needed, `OBJECTS`, `REFERENCE`, `SCALE` and `Z_UP` at the
top of the script first. It writes `<NAME>.bin` and `<NAME>.json`.

Then edit the JSON:

```jsonc
{
  "version": 1,
  "geometry": "laermbox.bin",          // relative to the JSON file
  "units": "mm",
  "camera": { "fov": 30, "yaw": 0.55, "pitch": 0.22 },   // optional; yaw/pitch in radians
  "spotlight": ["body", "lid", "mcu"], // order in which parts are highlighted (default: order of "parts")
  "parts": [
    {
      "id": "lid",
      "objects": ["u_a_Lid"],          // Blender object names that make up this part
      "explode": [0, 0, 150],          // how far the part moves when exploded (x right, y up, z towards viewer)
      "name": { "en": "Lid", "tr": "Kapak", "de": "Deckel" },
      "text": { "en": "Sealed with a gasket.", "tr": "…", "de": "…" }
    }
  ],
  "meshes": [ … ]                      // written by the export script, do not edit
}
```

Keep the `.bin` small: around 1–2 MB is fine. Decimate high-poly parts in Blender before exporting.

## How it works

- `src/components/site/Exploded3D.tsx` renders the section. three.js is loaded at runtime from
  `public/vendor/three.module.min.js` (r170, MIT, see `three.LICENSE.txt`), so it is not part of the main
  bundle and is only downloaded on pages that use the 3D view.
- The section is 560 % of the viewport tall with a sticky stage. Scroll progress 0–12 %: assembled,
  12–38 %: exploding, from 40 %: one part after another. Rendering pauses while the section is off screen,
  and the camera sway is turned off for visitors who prefer reduced motion.
- Styles are the `.p-x3d*` rules in `src/components/site/portfolioStyles.ts`. The highlight colour is the
  site accent (`--p-accent`).
- If WebGL or the files are not available, the section shows a short message instead of the model.
