// Extracts selected anatomy systems from the Human Atlas (BodyParts3D 4.0, CC BY 4.0) chunks
// into compact per-system binaries consumed by client/src/clyhealth/AnatomyModel.tsx.
// Usage: node scripts/build-anatomy.mjs <path-to-human-atlas/public/models> <out-dir>
import fs from 'node:fs';
import path from 'node:path';

const [src, out] = process.argv.slice(2);
if (!src || !out) throw new Error('usage: node build-anatomy.mjs <models-dir> <out-dir>');

const SYSTEMS = (process.env.SYSTEMS || 'integumentary,skeletal,respiratory,cardiac,endocrine,nervous,digestive,arterial,venous,urinary').split(',');
const atlas = JSON.parse(fs.readFileSync(path.join(src, 'atlas.json'), 'utf8'));
const chunks = atlas.chunks.map((c) => fs.readFileSync(path.join(src, path.basename(c.url))));
fs.mkdirSync(out, { recursive: true });

const manifest = { source: 'BodyParts3D 4.0 via ashemag/human-atlas', license: 'CC BY 4.0', systems: {} };
for (const sys of SYSTEMS) {
  const parts = atlas.parts.filter((p) => p.system === sys);
  const vTotal = parts.reduce((a, p) => a + p.vertexCount, 0);
  const iTotal = parts.reduce((a, p) => a + p.indexCount, 0);
  const normalsBytes = Math.ceil((vTotal * 3 * 2) / 4) * 4;
  const buf = Buffer.alloc(vTotal * 12 + normalsBytes + iTotal * 4);
  const posView = new Float32Array(buf.buffer, buf.byteOffset, vTotal * 3);
  const nrmView = new Int16Array(buf.buffer, buf.byteOffset + vTotal * 12, vTotal * 3);
  const idxView = new Uint32Array(buf.buffer, buf.byteOffset + vTotal * 12 + normalsBytes, iTotal);
  let v = 0, i = 0;
  const list = [];
  for (const p of parts) {
    const c = chunks[p.chunk];
    const ab = c.buffer.slice(c.byteOffset, c.byteOffset + c.byteLength);
    posView.set(new Float32Array(ab, p.positions, p.vertexCount * 3), v * 3);
    nrmView.set(new Int16Array(ab, p.normals, p.vertexCount * 3), v * 3);
    const src32 = new Uint32Array(ab, p.indices, p.indexCount);
    for (let k = 0; k < p.indexCount; k++) idxView[i + k] = src32[k] + v;
    list.push({ name: p.name, id: p.id, v, vc: p.vertexCount, i, ic: p.indexCount, cy: +((p.bounds[0][1] + p.bounds[1][1]) / 2).toFixed(3) });
    v += p.vertexCount; i += p.indexCount;
  }
  fs.writeFileSync(path.join(out, `${sys}.bin`), buf);
  manifest.systems[sys] = { vertices: vTotal, indices: iTotal, normalsOffset: vTotal * 12, indicesOffset: vTotal * 12 + normalsBytes, bytes: buf.length, parts: list };
  console.log(sys.padEnd(14), parts.length, 'parts', (buf.length / 1048576).toFixed(2), 'MB');
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest));
