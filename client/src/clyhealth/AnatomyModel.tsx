import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SYSTEMS, SystemKey, ViewKey } from './AnatomyFigure';

/**
 * Real 3D anatomy viewer.
 * Geometry: BodyParts3D 4.0 (© DBCLS, CC BY 4.0), packaged by ashemag/human-atlas and
 * re-split into per-system binaries by scripts/build-anatomy.mjs. See public/anatomy/ATTRIBUTION.md.
 */

interface PartInfo { name: string; v: number; vc: number; i: number; ic: number; cy: number }
interface SysManifest { vertices: number; indices: number; normalsOffset: number; indicesOffset: number; parts: PartInfo[] }
type Manifest = { systems: Record<string, SysManifest> };

type GroupId = 'skin' | 'respiratory' | 'heart' | 'endocrine' | 'nervous' | 'digestive' | 'urinary' | 'skeletal' | 'arterial' | 'venous';

const BASE_SYSTEMS = ['integumentary', 'respiratory', 'cardiac', 'endocrine', 'nervous', 'digestive', 'urinary'];

const GROUP_COLOR: Record<GroupId, string> = {
  skin: '#8fb8ff', respiratory: '#33c6ea', heart: '#f0546f', endocrine: '#ffb02e', nervous: '#9a8cff',
  digestive: '#2ad196', urinary: '#d6a15a', skeletal: '#ece6d2', arterial: '#e8455f', venous: '#4f86e6',
};

const FOCUS: Record<SystemKey, { y: number; z: number; dist: number }> = {
  respiratory: { y: 1.28, z: 0.03, dist: 1.05 },
  cardiovascular: { y: 1.22, z: 0.04, dist: 0.8 },
  endocrine: { y: 1.4, z: 0.02, dist: 1.5 },
  nervous: { y: 1.58, z: 0, dist: 0.8 },
  digestive: { y: 1.05, z: 0.03, dist: 1.1 },
};

const HIGHLIGHT: Record<SystemKey, GroupId[]> = {
  respiratory: ['respiratory'],
  cardiovascular: ['heart'],
  endocrine: ['endocrine'],
  nervous: ['nervous'],
  digestive: ['digestive'],
};

const groupOf = (sys: string, p: PartInfo): GroupId | null => {
  switch (sys) {
    case 'integumentary': return p.name === 'Skin' ? 'skin' : null;
    case 'respiratory': return 'respiratory';
    case 'cardiac': return p.cy < 1.5 ? 'heart' : 'nervous'; // BodyParts3D files brain ventricles under "cardiac"
    case 'endocrine': return 'endocrine';
    case 'nervous': return 'nervous';
    case 'digestive': return /pancrea/i.test(p.name) ? 'endocrine' : 'digestive';
    case 'urinary': return 'urinary';
    case 'skeletal': return 'skeletal';
    case 'arterial': return 'arterial';
    case 'venous': return 'venous';
    default: return null;
  }
};

const SKIN_VERT = `
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const SKIN_FRAG = `
uniform vec3 uColor; uniform float uBase; uniform float uRim; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 2.4); gl_FragColor = vec4(uColor + f*0.35, uBase + f*uRim); }`;

interface Props { system: SystemKey; view: ViewKey; zoom: boolean; rotated: boolean }

export const AnatomyModel: React.FC<Props> = ({ system, view, zoom, rotated }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ system, view, zoom, rotated });
  const apiRef = useRef<{ refresh: () => void; ensure: (s: string[]) => Promise<void> } | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  stateRef.current = { system, view, zoom, rotated };

  useEffect(() => {
    const host = hostRef.current!;
    let disposed = false;
    let raf = 0;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setError('WebGL is not available in this browser.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;outline:none;touch-action:none;';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 30);
    camera.position.set(0.35, 1.0, 4.2);

    scene.add(new THREE.HemisphereLight(0xdbe8ff, 0x1c2c4c, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 3, 3); scene.add(key);
    const rim = new THREE.DirectionalLight(0x74b4ff, 1.4); rim.position.set(-3, 2, -3); scene.add(rim);
    const glowLight = new THREE.PointLight(0xffffff, 0, 1.8, 1.4); scene.add(glowLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 0.45;
    controls.maxDistance = 6;
    controls.autoRotateSpeed = 1.6;
    controls.target.set(0, 0.88, 0);

    const disposables: { dispose: () => void }[] = [];
    const groups = new Map<GroupId, { mesh: THREE.Mesh; mat: THREE.Material }>();
    const loaded = new Set<string>();
    let manifest: Manifest | null = null;

    const makeMaterial = (g: GroupId): THREE.Material => {
      if (g === 'skin') {
        const m = new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(GROUP_COLOR.skin) }, uBase: { value: 0.07 }, uRim: { value: 0.6 } },
          vertexShader: SKIN_VERT, fragmentShader: SKIN_FRAG, transparent: true, depthWrite: false,
        });
        return m;
      }
      return new THREE.MeshStandardMaterial({
        color: GROUP_COLOR[g], roughness: 0.42, metalness: 0.05, transparent: true, opacity: 0.3,
        emissive: new THREE.Color(GROUP_COLOR[g]), emissiveIntensity: 0, side: THREE.DoubleSide,
      });
    };

    const loadSystem = async (sys: string) => {
      if (loaded.has(sys) || !manifest) return;
      loaded.add(sys);
      const info = manifest.systems[sys];
      const res = await fetch(`/anatomy/${sys}.bin`);
      if (!res.ok) throw new Error(`Could not load ${sys} anatomy`);
      const buf = await res.arrayBuffer();
      if (disposed) return;
      const pos = new Float32Array(buf, 0, info.vertices * 3);
      const nrm = new Int16Array(buf, info.normalsOffset, info.vertices * 3);
      const idx = new Uint32Array(buf, info.indicesOffset, info.indices);

      const byGroup = new Map<GroupId, PartInfo[]>();
      for (const p of info.parts) {
        const g = groupOf(sys, p);
        if (!g) continue;
        (byGroup.get(g) ?? byGroup.set(g, []).get(g)!).push(p);
      }
      const posAttr = new THREE.BufferAttribute(pos, 3);
      const nrmAttr = new THREE.BufferAttribute(nrm, 3, true);
      byGroup.forEach((parts, g) => {
        const total = parts.reduce((a, p) => a + p.ic, 0);
        const sub = new Uint32Array(total);
        let o = 0;
        for (const p of parts) { sub.set(idx.subarray(p.i, p.i + p.ic), o); o += p.ic; }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', posAttr);
        geo.setAttribute('normal', nrmAttr);
        geo.setIndex(new THREE.BufferAttribute(sub, 1));
        geo.computeBoundingSphere();
        const existing = groups.get(g);
        if (existing) {
          // merge into existing group (e.g. pancreas from digestive joins endocrine)
          const merged = new THREE.BufferGeometry();
          const a = existing.mesh.geometry, b = geo;
          const pa = a.getAttribute('position') as THREE.BufferAttribute, pb = b.getAttribute('position') as THREE.BufferAttribute;
          const na = a.getAttribute('normal') as THREE.BufferAttribute, nb = b.getAttribute('normal') as THREE.BufferAttribute;
          const mp = new Float32Array(pa.count * 3 + pb.count * 3); mp.set(pa.array as Float32Array, 0); mp.set(pb.array as Float32Array, pa.count * 3);
          const mn = new Int16Array(na.count * 3 + nb.count * 3); mn.set(na.array as Int16Array, 0); mn.set(nb.array as Int16Array, na.count * 3);
          const ia = a.getIndex()!.array as Uint32Array, ib = b.getIndex()!.array as Uint32Array;
          const mi = new Uint32Array(ia.length + ib.length); mi.set(ia, 0);
          for (let k = 0; k < ib.length; k++) mi[ia.length + k] = ib[k] + pa.count;
          merged.setAttribute('position', new THREE.BufferAttribute(mp, 3));
          merged.setAttribute('normal', new THREE.BufferAttribute(mn, 3, true));
          merged.setIndex(new THREE.BufferAttribute(mi, 1));
          merged.computeBoundingSphere();
          existing.mesh.geometry.dispose();
          existing.mesh.geometry = merged;
          disposables.push(merged);
          return;
        }
        const mat = makeMaterial(g);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        mesh.renderOrder = g === 'skin' ? 20 : g === 'skeletal' ? 1 : g === 'arterial' || g === 'venous' ? 2 : 5;
        mesh.visible = false;
        scene.add(mesh);
        groups.set(g, { mesh, mat });
        disposables.push(geo, mat);
      });
      apply();
    };

    // Per-frame material targets
    const target = { dist: 4.2, ty: 0.88, tz: 0 };

    const apply = () => {
      const s = stateRef.current;
      const hi = new Set(HIGHLIGHT[s.system]);
      groups.forEach(({ mesh, mat }, g) => {
        if (g === 'skin') {
          const u = (mat as THREE.ShaderMaterial).uniforms;
          u.uBase.value = s.view === 'body' ? 0.07 : 0.025;
          u.uRim.value = s.view === 'body' ? 0.6 : 0.4;
          mesh.visible = true;
          return;
        }
        const m = mat as THREE.MeshStandardMaterial;
        const on = hi.has(g) || (s.view === 'vessels' && s.system === 'cardiovascular' && (g === 'arterial' || g === 'venous'));
        if (g === 'skeletal') { mesh.visible = s.view === 'skeleton'; m.opacity = 0.92; m.color.set(GROUP_COLOR.skeletal); m.emissiveIntensity = 0; m.depthWrite = true; return; }
        if (g === 'arterial' || g === 'venous') {
          mesh.visible = s.view === 'vessels';
          m.opacity = on ? 0.95 : 0.7; m.emissiveIntensity = on ? 0.5 : 0.15; m.depthWrite = false; return;
        }
        mesh.visible = true;
        const dim = s.view === 'skeleton' ? 0.12 : s.view === 'vessels' ? 0.1 : 0.22;
        m.opacity = on ? 1 : dim;
        m.color.set(on ? GROUP_COLOR[g] : '#8fa6d0');
        m.depthWrite = on;
        m.transparent = !on;
        m.needsUpdate = true;
      });
      const f = FOCUS[s.system];
      target.ty = s.zoom ? f.y : 0.88;
      target.tz = s.zoom ? f.z : 0;
      target.dist = s.zoom ? f.dist : 4.2;
      controls.autoRotate = s.rotated;
      glowLight.color.set(GROUP_COLOR[HIGHLIGHT[s.system][0]]);
      glowLight.position.set(0, f.y, 0.5);
    };

    const ensureForView = async () => {
      const s = stateRef.current;
      if (s.view === 'skeleton') await loadSystem('skeletal');
      if (s.view === 'vessels') { await loadSystem('arterial'); await loadSystem('venous'); }
    };
    apiRef.current = { refresh: () => { apply(); ensureForView().catch((e) => setError(String(e.message || e))); }, ensure: async () => {} };

    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    (async () => {
      try {
        manifest = await (await fetch('/anatomy/manifest.json')).json();
        let done = 0;
        for (const sys of BASE_SYSTEMS) {
          await loadSystem(sys);
          done++;
          if (!disposed) setProgress(Math.round((done / BASE_SYSTEMS.length) * 100));
        }
        apply();
        ensureForView();
      } catch (e: any) {
        if (!disposed) setError(e?.message || 'Could not load the anatomy model.');
      }
    })();

    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      const hi = HIGHLIGHT[stateRef.current.system];
      groups.forEach(({ mat }, g) => {
        if (g === 'skin' || g === 'skeletal') return;
        const m = mat as THREE.MeshStandardMaterial;
        if (hi.includes(g)) m.emissiveIntensity = 0.55 + 0.35 * Math.sin(t * 2.4);
        else if (g !== 'arterial' && g !== 'venous') m.emissiveIntensity = 0;
      });
      glowLight.intensity = 1.6 + 0.8 * Math.sin(t * 2.4);

      // ease camera toward target/distance while keeping the user's orbit angle
      controls.target.y += (target.ty - controls.target.y) * 0.07;
      controls.target.z += (target.tz - controls.target.z) * 0.07;
      tmp.copy(camera.position).sub(controls.target);
      const cur = tmp.length();
      if (!userDragging) {
        const next = cur + (target.dist - cur) * 0.07;
        tmp.setLength(next);
        camera.position.copy(controls.target).add(tmp);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    let userDragging = false;
    controls.addEventListener('start', () => { userDragging = true; });
    controls.addEventListener('end', () => { userDragging = false; target.dist = camera.position.distanceTo(controls.target); });
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => { apiRef.current?.refresh(); }, [system, view, zoom, rotated]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={`Interactive 3D human anatomy highlighting the ${SYSTEMS[system].label} system. Drag to rotate, scroll to zoom.`}
      style={{ position: 'absolute', inset: 0 }}
    >
      {progress < 100 && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 2 }}>
          <div style={{ textAlign: 'center', color: '#54627e', fontWeight: 600, fontSize: 12 }}>
            <div style={{ width: 160, height: 5, borderRadius: 99, background: '#e1e8f4', overflow: 'hidden', margin: '0 auto 8px' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#3b82f6,#14b8a6)', transition: 'width .3s' }} />
            </div>
            Loading anatomy model… {progress}%
          </div>
        </div>
      )}
      {error && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#d03a5c', fontWeight: 600 }}>{error}</div>}
    </div>
  );
};
