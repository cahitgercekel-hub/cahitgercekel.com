# Export a Blender model for the 3D exploded view on a project page (see docs/3d-exploded-view.md).
#
# Run it in Blender (Scripting tab → open this file → Run Script) with the assembled model open.
# It writes two files to OUT_DIR:
#   <NAME>.bin   positions, normals and indices of every object, split per material
#   <NAME>.json  the manifest: geometry offsets ("meshes") plus one "parts" entry per object
#
# After the export, open the JSON and fill in for every part: a readable name, a short text and the
# "explode" offset (how far the part moves, in the model's units, along x / y / z). Then copy both files
# to public/projects/<slug>/model/ and turn the 3D view on for the project in /admin.
import bpy, json, os, struct

# ---- settings ---------------------------------------------------------------
NAME = "model"                                   # file name without extension
OUT_DIR = os.path.join(os.path.expanduser("~"), "Documents", "exploded_view_export")
OBJECTS = []                                     # object names in the order you want; empty = all visible meshes
REFERENCE = None                                 # object whose local frame becomes the origin (e.g. the main body)
SCALE = 1000.0                                   # Blender metres → millimetres; use 1.0 if the scene is already in mm
Z_UP = True                                      # Blender's z-up → the web's y-up. Set False if the REFERENCE
                                                 # object's local frame already has +y up (as in the LärmBox export)
# -----------------------------------------------------------------------------

scene = bpy.context.scene
depsgraph = bpy.context.evaluated_depsgraph_get()
names = OBJECTS or [o.name for o in scene.objects if o.type == 'MESH' and o.visible_get()]
ref = scene.objects[REFERENCE].matrix_world.inverted() if REFERENCE else None


def base_color(mat):
    if mat is None:
        return [0.8, 0.8, 0.8]
    if mat.use_nodes and mat.node_tree:
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                c = n.inputs["Base Color"].default_value
                return [round(c[0], 4), round(c[1], 4), round(c[2], 4)]
            if n.type == 'EMISSION':
                c = n.inputs["Color"].default_value
                return [round(c[0], 4), round(c[1], 4), round(c[2], 4)]
    c = mat.diffuse_color
    return [round(c[0], 4), round(c[1], 4), round(c[2], 4)]


blob = bytearray()
meshes = []
for name in names:
    ob = scene.objects.get(name) or bpy.data.objects.get(name)
    if ob is None:
        print("MISSING", name)
        continue
    ev = ob.evaluated_get(depsgraph)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    mw = (ref @ ob.matrix_world) if ref else ob.matrix_world.copy()
    nm = mw.to_3x3().inverted().transposed()
    pos = [mw @ v.co for v in me.vertices]
    cn = me.corner_normals
    groups = {}
    for tri in me.loop_triangles:
        groups.setdefault(tri.material_index, []).append(tri)
    for mi, tris in groups.items():
        mat = ob.material_slots[mi].material if mi < len(ob.material_slots) else None
        index_of, vbuf, nbuf, ibuf = {}, [], [], []
        for tri in tris:
            for k in range(3):
                vi = tri.vertices[k]
                n = (nm @ cn[tri.loops[k]].vector).normalized()
                key = (vi, round(n.x, 3), round(n.y, 3), round(n.z, 3))
                j = index_of.get(key)
                if j is None:
                    j = index_of[key] = len(vbuf)
                    p = pos[vi]
                    if Z_UP:  # (x, y, z) → (x, z, -y)
                        vbuf.append((p.x * SCALE, p.z * SCALE, -p.y * SCALE))
                        nbuf.append((n.x, n.z, -n.y))
                    else:
                        vbuf.append((p.x * SCALE, p.y * SCALE, p.z * SCALE))
                        nbuf.append((n.x, n.y, n.z))
                ibuf.append(j)
        nv = len(vbuf)
        off_p = len(blob); blob += struct.pack("<%df" % (nv * 3), *[c for v in vbuf for c in v])
        off_n = len(blob); blob += struct.pack("<%df" % (nv * 3), *[c for v in nbuf for c in v])
        wide = nv > 65535
        off_i = len(blob); blob += struct.pack("<%d%s" % (len(ibuf), "I" if wide else "H"), *ibuf)
        while len(blob) % 4:
            blob += b"\0"
        meshes.append({"object": name, "color": base_color(mat), "vertices": nv, "indices": len(ibuf),
                       "index32": wide, "pos": off_p, "nrm": off_n, "idx": off_i})
    ev.to_mesh_clear()

parts = [{"id": n.lower().replace(" ", "-"), "objects": [n], "explode": [0, 0, 0],
          "name": {"en": n, "tr": "", "de": ""}, "text": {"en": "", "tr": "", "de": ""}}
         for n in names if any(m["object"] == n for m in meshes)]
manifest = {"version": 1, "geometry": NAME + ".bin", "units": "mm",
            "camera": {"fov": 30, "yaw": 0.55, "pitch": 0.22},
            "spotlight": [p["id"] for p in parts], "parts": parts, "meshes": meshes}

os.makedirs(OUT_DIR, exist_ok=True)
with open(os.path.join(OUT_DIR, NAME + ".bin"), "wb") as f:
    f.write(blob)
with open(os.path.join(OUT_DIR, NAME + ".json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=1)
print("EXPORTED", len(parts), "parts,", len(meshes), "meshes,", len(blob), "bytes →", OUT_DIR)
