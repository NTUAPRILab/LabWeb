// Converts the headset STL into the compressed model the Projects section loads (public/models/headset.glb).
//
//   npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer
//   node tools/stl-to-glb.mjs path/to/headset.stl public/models/headset.glb
//
// What it does: welds the binary STL, splits it into connected parts, groups the parts into
// materials by position (glass / frame / seal / band / dial / pod / detail — the scene colours
// them by these names), simplifies to ~45 % of the triangles, adds creased normals, and writes a
// Meshopt-compressed, quantized GLB. Add --debug to give every large part its own group.
import fs from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { meshopt, quantize, reorder } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const [, , inPath, outPath, flag] = process.argv;
const DEBUG = flag === '--debug';
const RATIO = 0.45;
const CREASE = Math.cos((38 * Math.PI) / 180);

const buf = fs.readFileSync(inPath);
const nTri = buf.readUInt32LE(80);

// --- weld ---
const key = new Map();
const P = [];
const T = new Uint32Array(nTri * 3);
for (let i = 0; i < nTri; i++) {
  const o = 84 + i * 50 + 12;
  for (let v = 0; v < 3; v++) {
    const x = buf.readFloatLE(o + v * 12), y = buf.readFloatLE(o + v * 12 + 4), z = buf.readFloatLE(o + v * 12 + 8);
    const k = `${Math.round(x * 1000)},${Math.round(y * 1000)},${Math.round(z * 1000)}`;
    let id = key.get(k);
    if (id === undefined) {
      id = P.length / 3;
      key.set(k, id);
      // to Y-up, visor toward +Z, metres/10, centred
      P.push(x / 100, (z - 49.3) / 100, -y / 100);
    }
    T[i * 3 + v] = id;
  }
}
const nV = P.length / 3;

// --- connected components ---
const parent = new Int32Array(nV).map((_, i) => i);
const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
for (let i = 0; i < nTri; i++) {
  const a = find(T[i * 3]);
  parent[find(T[i * 3 + 1])] = a;
  parent[find(T[i * 3 + 2])] = a;
}
const comps = new Map();
for (let i = 0; i < nTri; i++) {
  const r = find(T[i * 3]);
  let c = comps.get(r);
  if (!c) comps.set(r, (c = { tris: [], mn: [1e9, 1e9, 1e9], mx: [-1e9, -1e9, -1e9] }));
  c.tris.push(i);
  for (let v = 0; v < 3; v++) for (let a = 0; a < 3; a++) {
    const x = P[T[i * 3 + v] * 3 + a];
    if (x < c.mn[a]) c.mn[a] = x;
    if (x > c.mx[a]) c.mx[a] = x;
  }
}
const list = [...comps.values()].sort((a, b) => b.tris.length - a.tris.length);
list.forEach((c, i) => (c.id = i));

const frontmost = list.filter((c) => c.mx[0] - c.mn[0] > 1.2).sort((a, b) => b.mx[2] - a.mx[2])[0];
// --- classify (coordinates now: x right, y up, z toward the front/visor) ---
function classify(c) {
  const [x0, y0, z0] = c.mn, [x1, y1, z1] = c.mx;
  const w = x1 - x0;
  if (DEBUG) return 'c' + Math.min(c.id, 23);
  if (c === frontmost) return 'glass';                 // outermost front cover
  if (z1 > 1.25 && w > 1.2) return 'frame';            // aluminium frame / front shells
  if (z1 < 0.0 && w > 1.2) return 'band';              // headband loop at the back
  if (Math.abs(x0) > 0.78 && z1 < -0.3) return 'dial'; // fit dial + band arms
  if (w < 0.4 && z0 > -0.3 && z1 < 1.0 && Math.abs(x0) > 0.6) return 'pod';   // audio straps
  if (w > 1.2) return 'seal';                          // light seal / cushion / body
  return 'detail';
}
const groups = new Map();
for (const c of list) {
  const g = classify(c);
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(c);
}

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
const positions = new Float32Array(P);

// --- per group: compact, simplify, creased normals ---
function buildGroup(cs) {
  const idx = [];
  for (const c of cs) for (const t of c.tris) idx.push(T[t * 3], T[t * 3 + 1], T[t * 3 + 2]);
  let indices = new Uint32Array(idx);
  if (indices.length > 300) {
    const target = Math.max(36, Math.floor((indices.length * RATIO) / 3) * 3);
    [indices] = MeshoptSimplifier.simplify(indices, positions, 3, target, 0.0015, ['LockBorder']);
  }
  // creased normals: average only faces within CREASE of each other
  const nF = indices.length / 3;
  const fn = new Float32Array(nF * 3);
  const inc = new Map();
  for (let f = 0; f < nF; f++) {
    const a = indices[f * 3], b = indices[f * 3 + 1], c = indices[f * 3 + 2];
    const ax = P[b * 3] - P[a * 3], ay = P[b * 3 + 1] - P[a * 3 + 1], az = P[b * 3 + 2] - P[a * 3 + 2];
    const bx = P[c * 3] - P[a * 3], by = P[c * 3 + 1] - P[a * 3 + 1], bz = P[c * 3 + 2] - P[a * 3 + 2];
    fn[f * 3] = ay * bz - az * by; fn[f * 3 + 1] = az * bx - ax * bz; fn[f * 3 + 2] = ax * by - ay * bx;
    for (const v of [a, b, c]) { if (!inc.has(v)) inc.set(v, []); inc.get(v).push(f); }
  }
  const unit = (f) => { const l = Math.hypot(fn[f * 3], fn[f * 3 + 1], fn[f * 3 + 2]) || 1; return [fn[f * 3] / l, fn[f * 3 + 1] / l, fn[f * 3 + 2] / l]; };
  const outPos = [], outNor = [], outIdx = [];
  const vmap = new Map();
  for (let f = 0; f < nF; f++) {
    const nf = unit(f);
    for (let k = 0; k < 3; k++) {
      const v = indices[f * 3 + k];
      let sx = 0, sy = 0, sz = 0;
      for (const g of inc.get(v)) {
        const ng = unit(g);
        if (ng[0] * nf[0] + ng[1] * nf[1] + ng[2] * nf[2] >= CREASE) { sx += fn[g * 3]; sy += fn[g * 3 + 1]; sz += fn[g * 3 + 2]; }
      }
      const l = Math.hypot(sx, sy, sz) || 1;
      const n = [sx / l, sy / l, sz / l];
      const kk = `${v}|${n[0].toFixed(2)},${n[1].toFixed(2)},${n[2].toFixed(2)}`;
      let id = vmap.get(kk);
      if (id === undefined) {
        id = outPos.length / 3;
        vmap.set(kk, id);
        outPos.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
        outNor.push(...n);
      }
      outIdx.push(id);
    }
  }
  return { pos: new Float32Array(outPos), nor: new Float32Array(outNor), idx: new Uint32Array(outIdx) };
}

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('headset');
const root = doc.createNode('headset');
scene.addChild(root);
let total = 0;
for (const [name, cs] of groups) {
  const g = buildGroup(cs);
  total += g.idx.length / 3;
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(g.pos).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(g.nor).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(g.idx).setBuffer(buffer))
    .setMaterial(doc.createMaterial(name));
  root.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
  console.log(name.padEnd(8), 'parts', String(cs.length).padStart(4), 'tris', g.idx.length / 3);
}
console.log('total tris', total);

await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(outPath, doc);
console.log('wrote', outPath, (fs.statSync(outPath).size / 1024).toFixed(0) + ' KB');
