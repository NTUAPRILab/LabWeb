/**
 * Three.js scene for the Projects section: a VR headset seen from above that the camera
 * flies into as you scroll, ending at the wearer's eye position looking at the display.
 * Loaded lazily (dynamic import) so three.js never lands in the initial bundle.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type HeadsetScene = {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  resize(): void;
  setActive(on: boolean): void;
  dispose(): void;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Materials by part name (set in the STL → GLB conversion). */
function materialFor(name: string, debug: boolean, i: number): Material {
  if (debug) return new MeshStandardMaterial({ color: new Color().setHSL((i * 0.137) % 1, 0.7, 0.55), roughness: 0.6 });
  // monochrome, like the reference photo: black glass, aluminium frame, white / light-grey body
  switch (name) {
    case 'glass':
      return new MeshPhysicalMaterial({ color: '#050607', metalness: 0.25, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.8 });
    case 'frame':
      return new MeshStandardMaterial({ color: '#e4e6e8', metalness: 1, roughness: 0.2, envMapIntensity: 1.2 });
    case 'band':
      return new MeshStandardMaterial({ color: '#a8abad', roughness: 0.9 });
    case 'seal':
      return new MeshStandardMaterial({ color: '#c9cccd', roughness: 0.85 });
    case 'pod':
    case 'dial':
      return new MeshStandardMaterial({ color: '#f4f4f4', roughness: 0.5 });
    default:
      return new MeshStandardMaterial({ color: '#cfd1d2', roughness: 0.6 });
  }
}

/** Soft round shadow under the headset (cheaper and softer than shadow maps). */
function contactShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(23,29,25,0.38)');
  grad.addColorStop(1, 'rgba(23,29,25,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new CanvasTexture(c);
  const m = new Mesh(new PlaneGeometry(3.4, 3.8), new MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = -0.5;
  return m;
}

// Camera path in model space: x right, y up, +z toward the visor. Starts straight above,
// swings behind and down to eye level, then pushes through the band into the light seal.
const POS = new CatmullRomCurve3(
  [new Vector3(0, 8, 0.7), new Vector3(0, 4.4, -2.3), new Vector3(0, 1.5, -2.9), new Vector3(0, 0.24, -1.55), new Vector3(0, 0.08, 0.1), new Vector3(0, 0.05, 0.62)],
  false,
  'centripetal',
);
const AIM = new CatmullRomCurve3(
  [new Vector3(0, 0, 0.7), new Vector3(0, 0, 0.35), new Vector3(0, 0.03, 0.5), new Vector3(0, 0.05, 1.0), new Vector3(0, 0.05, 2.2), new Vector3(0, 0.05, 3)],
  false,
  'centripetal',
);

export async function createHeadsetScene(canvas: HTMLCanvasElement, modelUrl: string, debug = false): Promise<HeadsetScene> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new HemisphereLight('#ffffff', '#c8d6cc', 0.6));
  const key = new DirectionalLight('#ffffff', 1.6);
  key.position.set(2.5, 5, 3);
  scene.add(key);

  const camera = new PerspectiveCamera(32, 1, 0.005, 60);
  const shadow = contactShadow();
  scene.add(shadow);

  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(modelUrl);
  const model = gltf.scene;
  let i = 0;
  model.traverse((o: Object3D) => {
    if ((o as Mesh).isMesh) {
      const mesh = o as Mesh;
      mesh.material = materialFor(mesh.name || mesh.parent?.name || '', debug, i++);
    }
  });
  scene.add(model);

  let progress = 0;
  let px = 0, py = 0; // pointer, -0.5..0.5
  let sx = 0, sy = 0; // smoothed pointer
  let active = true;
  let dirty = true;
  let raf = 0;
  const up = new Vector3();
  const pos = new Vector3();
  const aim = new Vector3();

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    // ease the pointer so the camera drifts rather than snaps
    const ex = px - sx, ey = py - sy;
    if (Math.abs(ex) + Math.abs(ey) > 0.0005) {
      sx += ex * 0.08;
      sy += ey * 0.08;
      dirty = true;
    }
    if (!active || !dirty) return;
    dirty = false;

    const t = smooth(seg(progress, 0.04, 0.46));
    POS.getPointAt(t, pos);
    AIM.getPointAt(t, aim);
    // on tall, narrow screens pull the camera back so the whole headset fits, easing out as we close in
    const narrow = Math.max(1, Math.sqrt(0.75 / camera.aspect));
    pos.sub(aim).multiplyScalar(1 + (narrow - 1) * (1 - t)).add(aim);
    // pointer orbit, strongest in the overview and fading out as we get close
    const sway = 1 - seg(progress, 0.08, 0.36);
    pos.x += sx * 1.2 * sway;
    pos.z += sy * 0.9 * sway;
    // the camera pitches from looking straight down to looking forward
    const pitch = smooth(seg(progress, 0.04, 0.24));
    up.set(0, pitch, 1 - pitch).normalize();
    camera.up.copy(up);
    camera.position.copy(pos);
    camera.lookAt(aim);
    camera.fov = 32 + 38 * smooth(seg(progress, 0.24, 0.46));
    camera.updateProjectionMatrix();
    // idle turn in the overview so the top view isn't static
    model.rotation.y = (1 - pitch) * sx * 0.25;
    shadow.visible = progress < 0.4;
    renderer.render(scene, camera);
  };

  resize();
  raf = requestAnimationFrame(frame);

  if (location.search.includes('model-')) {
    // free camera for inspecting the model (?model-look or ?model-debug): __headset.look([x,y,z],[tx,ty,tz])
    (window as unknown as Record<string, unknown>)['__headset'] = {
      look(p: number[], t: number[]) {
        active = false;
        camera.up.set(0, 1, 0);
        camera.position.set(p[0], p[1], p[2]);
        camera.lookAt(t[0], t[1], t[2]);
        camera.fov = 35;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      },
      names: model.children.map((c) => c.name),
    };
  }

  return {
    setProgress(p) {
      if (p !== progress) {
        progress = p;
        dirty = true;
      }
    },
    setPointer(x, y) {
      px = x;
      py = y;
    },
    resize,
    setActive(on) {
      active = on;
      dirty = true;
    },
    dispose() {
      cancelAnimationFrame(raf);
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
