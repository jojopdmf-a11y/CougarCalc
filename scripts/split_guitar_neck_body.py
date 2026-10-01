"""
Headless Blender: split imported guitar GLBs into body vs neck(+headstock).

Method: separate by loose parts, classify each island by world-space centroid
along the guitar's long axis relative to a heel cut. Hardware stays on the
part it naturally belongs to. Spanning islands (rare) are bisected at the heel.

Usage:
  blender --background --python scripts/split_guitar_neck_body.py -- \\
    --input path/to/style.glb --out-body path/body.glb --out-neck path/neck.glb \\
    [--heel-frac 0.42] [--label s-style]
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--out-body", required=True)
    p.add_argument("--out-neck", required=True)
    p.add_argument("--heel-frac", type=float, default=None,
                   help="Fraction of long-axis length from min where heel cut sits (0-1).")
    p.add_argument("--heel-y", type=float, default=None,
                   help="Absolute world Y cut (overrides heel-frac).")
    p.add_argument("--label", default="guitar")
    p.add_argument("--report", default="")
    return p.parse_args(argv)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_glb(path: str):
    bpy.ops.import_scene.gltf(filepath=path)


def mesh_objects():
    return [o for o in bpy.context.scene.objects if o.type == "MESH"]


def world_bounds(objs):
    mins = Vector((math.inf, math.inf, math.inf))
    maxs = Vector((-math.inf, -math.inf, -math.inf))
    for o in objs:
        for corner in o.bound_box:
            w = o.matrix_world @ Vector(corner)
            mins.x = min(mins.x, w.x)
            mins.y = min(mins.y, w.y)
            mins.z = min(mins.z, w.z)
            maxs.x = max(maxs.x, w.x)
            maxs.y = max(maxs.y, w.y)
            maxs.z = max(maxs.z, w.z)
    return mins, maxs


def object_world_centroid(obj):
    # Prefer face-area weighted centroid from evaluated mesh when possible.
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    mesh = eval_obj.to_mesh()
    try:
        if not mesh.polygons:
            # fallback: bbox center
            mins, maxs = world_bounds([obj])
            return (mins + maxs) * 0.5
        acc = Vector((0.0, 0.0, 0.0))
        area = 0.0
        mw = obj.matrix_world
        for poly in mesh.polygons:
            a = poly.area
            acc += mw @ poly.center * a
            area += a
        if area <= 0:
            mins, maxs = world_bounds([obj])
            return (mins + maxs) * 0.5
        return acc / area
    finally:
        eval_obj.to_mesh_clear()


def object_world_aabb(obj):
    return world_bounds([obj])


def long_axis_index(mins, maxs):
    extents = [maxs[i] - mins[i] for i in range(3)]
    return max(range(3), key=lambda i: extents[i])


def separate_loose(obj):
    """Separate loose parts; returns list of resulting mesh objects (may be [obj] if none)."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    before = {o.name for o in bpy.context.scene.objects}
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")
    after = [o for o in bpy.context.scene.objects if o.name not in before or o == obj]
    # Blender keeps original + creates new; collect all selected-ish meshes that came from this
    # Safer: collect every mesh that shares materials lineage by selecting connected new objects
    result = []
    for o in bpy.context.scene.objects:
        if o.type != "MESH":
            continue
        # after separate, new objects are selected along with original
        if o.select_get() or o == obj:
            result.append(o)
    # Deduplicate
    uniq = []
    seen = set()
    for o in result:
        if o.name not in seen:
            uniq.append(o)
            seen.add(o.name)
    return uniq if uniq else [obj]


def bisect_object(obj, plane_co: Vector, plane_no: Vector):
    """Split object by plane into two objects; returns (below_or_none, above_or_none)."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    before = {o.name for o in bpy.context.scene.objects}

    # Duplicate for the "above" side, bisect each
    bpy.ops.object.duplicate()
    above = bpy.context.view_layer.objects.active

    # Cut original: keep below (clear_inner keeps positive side depending on normal)
    # Blender bisect: clear_inner removes geometry on positive normal side;
    # clear_outer removes geometry on negative normal side.
    # We want: body = side opposite neck direction. If plane_no points toward neck (increasing axis),
    # body is clear_inner (remove +side), neck is clear_outer on the duplicate.
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.bisect(
        plane_co=plane_co,
        plane_no=plane_no,
        clear_inner=False,
        clear_outer=True,  # keep negative side (body if normal points to neck)
        threshold=1e-5,
    )
    bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.select_all(action="DESELECT")
    above.select_set(True)
    bpy.context.view_layer.objects.active = above
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.bisect(
        plane_co=plane_co,
        plane_no=plane_no,
        clear_inner=True,  # keep positive side (neck)
        clear_outer=False,
        threshold=1e-5,
    )
    bpy.ops.object.mode_set(mode="OBJECT")

    def has_geometry(o):
        return o.type == "MESH" and o.data and len(o.data.polygons) > 0

    body = obj if has_geometry(obj) else None
    neck = above if has_geometry(above) else None
    if body is None and obj.name in bpy.data.objects:
        bpy.data.objects.remove(obj, do_unlink=True)
    if neck is None and above.name in bpy.data.objects:
        bpy.data.objects.remove(above, do_unlink=True)
    return body, neck


def join_objects(objs, name: str):
    objs = [o for o in objs if o and o.name in bpy.data.objects and o.type == "MESH" and len(o.data.polygons) > 0]
    if not objs:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    return joined


def export_glb(obj, path: str):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    # Export object and its children; also keep empty parents if needed for transforms.
    # Apply: select only this object (world transform preserved on export).
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_format="GLB",
        export_yup=True,
        export_apply=False,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )


def apply_world_transforms(objs):
    """Bake world transforms so later joins share one coordinate space."""
    for o in objs:
        if o.name not in bpy.data.objects or o.type != "MESH":
            continue
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def classify_and_split(heel_cut: float, axis: int, mins: Vector, maxs: Vector):
    """Separate all meshes into loose parts, classify, bisect straddlers."""
    originals = list(mesh_objects())
    # Bake transforms on originals first so loose separation + join stay aligned.
    apply_world_transforms(originals)

    islands = []
    for obj in list(mesh_objects()):
        parts = separate_loose(obj)
        islands.extend(parts)

    # Deduplicate by name
    seen = set()
    uniq = []
    for o in islands:
        if o.name not in seen and o.name in bpy.data.objects:
            uniq.append(o)
            seen.add(o.name)
    islands = uniq
    apply_world_transforms(islands)

    body_parts = []
    neck_parts = []
    straddlers = []
    details = []

    # Axis unit vector pointing toward headstock (increasing coordinate)
    plane_no = Vector((0.0, 0.0, 0.0))
    plane_no[axis] = 1.0
    plane_co = Vector((0.0, 0.0, 0.0))
    plane_co[axis] = heel_cut

    span_threshold = (maxs[axis] - mins[axis]) * 0.35  # if island spans a lot of the guitar

    for o in islands:
        if o.name not in bpy.data.objects or o.type != "MESH" or not o.data.polygons:
            continue
        c = object_world_centroid(o)
        bmin, bmax = object_world_aabb(o)
        span = bmax[axis] - bmin[axis]
        # Straddle: bounds cross heel; only bisect if mass is truly split.
        crosses = (bmin[axis] < heel_cut - 1e-4) and (bmax[axis] > heel_cut + 1e-4)
        below_w = max(0.0, heel_cut - bmin[axis])
        above_w = max(0.0, bmax[axis] - heel_cut)
        total_w = below_w + above_w or 1.0
        below_frac = below_w / total_w
        above_frac = above_w / total_w
        balanced = below_frac >= 0.18 and above_frac >= 0.18
        if crosses and span >= span_threshold and balanced:
            straddlers.append(o)
            details.append({
                "name": o.name,
                "action": "bisect",
                "centroid": list(c),
                "span": span,
                "below_frac": below_frac,
                "above_frac": above_frac,
            })
        elif c[axis] >= heel_cut or (crosses and above_frac >= 0.55):
            neck_parts.append(o)
            details.append({"name": o.name, "action": "neck", "centroid": list(c), "span": span})
        else:
            body_parts.append(o)
            details.append({"name": o.name, "action": "body", "centroid": list(c), "span": span})

    for o in straddlers:
        body, neck = bisect_object(o, plane_co, plane_no)
        if body:
            body_parts.append(body)
        if neck:
            neck_parts.append(neck)

    # Re-apply after bisect so body/neck joins share world space.
    apply_world_transforms([o for o in body_parts + neck_parts if o])
    return body_parts, neck_parts, details


def main():
    args = parse_args()
    reset_scene()
    import_glb(args.input)

    meshes = mesh_objects()
    if not meshes:
        raise SystemExit(f"No meshes in {args.input}")

    mins, maxs = world_bounds(meshes)
    axis = long_axis_index(mins, maxs)
    length = maxs[axis] - mins[axis]

    if args.heel_y is not None:
        heel_cut = args.heel_y
        heel_frac = (heel_cut - mins[axis]) / length if length else 0
    else:
        # Defaults tuned from density analysis of these two assets.
        # S-Style body ends ~0.55 world-Y on imported upright mesh; T-Style ~0.43.
        heel_frac = args.heel_frac if args.heel_frac is not None else 0.42
        heel_cut = mins[axis] + length * heel_frac

    body_parts, neck_parts, details = classify_and_split(heel_cut, axis, mins, maxs)

    body = join_objects(body_parts, f"{args.label}-body")
    neck = join_objects(neck_parts, f"{args.label}-neck")

    if body is None or neck is None:
        raise SystemExit(
            f"Split failed for {args.label}: body={body is not None} neck={neck is not None} "
            f"(islands body={len(body_parts)} neck={len(neck_parts)})"
        )

    # Keep both in scene for a moment; export each alone by temporary hide.
    # Simpler: export selection.
    export_glb(body, args.out_body)
    export_glb(neck, args.out_neck)

    report = {
        "label": args.label,
        "input": args.input,
        "out_body": args.out_body,
        "out_neck": args.out_neck,
        "axis": axis,
        "bounds_min": list(mins),
        "bounds_max": list(maxs),
        "heel_cut": heel_cut,
        "heel_frac": heel_frac,
        "body_island_actions": sum(1 for d in details if d["action"] == "body"),
        "neck_island_actions": sum(1 for d in details if d["action"] == "neck"),
        "bisect_actions": sum(1 for d in details if d["action"] == "bisect"),
        "body_faces": len(body.data.polygons),
        "neck_faces": len(neck.data.polygons),
        "details_sample": details[:40],
    }
    print("SPLIT_REPORT " + json.dumps(report))
    if args.report:
        Path(args.report).write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
