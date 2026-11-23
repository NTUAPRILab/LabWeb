/**
 * Three.js scene for the Projects section: a VR headset seen from above that the camera
 * flies into as you scroll, ending at the wearer's eye position looking at the display.
 * Loaded lazily (dynamic import) so three.js never lands in the initial bundle.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  DoubleSide,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
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
  /** the project image shown inside the lenses */
  setImage(url: string): void;
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


/**
 * A display behind each lens. Shows the current project image; `blur` mixes in a pre-blurred
 * copy (defocus), `offset` shifts the crop per eye (the two eyes see different images until
 * they converge), `bright` makes the display "switch on" as you put the headset on.
 */
const lensShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D sharp;
    uniform sampler2D soft;
    uniform float blur;
    uniform float bright;
    uniform float fit;
    uniform float opacity;
    uniform vec2 offset;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv - 0.5;
      vec2 uv = vec2(p.x * fit, p.y) * 0.92 + 0.5 + offset;
      vec3 a = texture2D(sharp, uv).rgb;
      vec3 b = texture2D(soft, uv).rgb;
      vec3 col = mix(a, b, blur) * bright;
      float r = length(p * 2.0);
      col *= mix(0.35, 1.0, smoothstep(1.0, 0.55, r)); // lens vignette
      gl_FragColor = vec4(col, opacity);
      #include <colorspace_fragment>
    }`,
};

function lensDisplay(x: number, y: number, z: number, w: number, h: number) {
  const mat = new ShaderMaterial({
    ...lensShader,
    transparent: true,
    side: DoubleSide,
    uniforms: {
      sharp: { value: null as Texture | null },
      soft: { value: null as Texture | null },
      blur: { value: 1 },
      bright: { value: 0.5 },
      fit: { value: (w / h) / (16 / 9) },
      opacity: { value: 0 },
      offset: { value: new Vector2() },
    },
  });
  const m = new Mesh(new CircleGeometry(0.5, 64), mat);
  m.scale.set(w, h, 1);
  m.position.set(x, y, z);
  m.rotation.y = Math.PI; // face the wearer (camera looks toward +z)
  m.renderOrder = 2;
  return m;
}

/** Sharp texture + a cheap, cross-browser blurred copy (downscale then let the GPU upscale). */
function loadImage(url: string): Promise<{ sharp: Texture; soft: Texture }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const sharp = new Texture(img);
      sharp.colorSpace = SRGBColorSpace;
      sharp.needsUpdate = true;
      const c = document.createElement('canvas');
      c.width = 40;
      c.height = 23;
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      const soft = new CanvasTexture(c);
      soft.colorSpace = SRGBColorSpace;
      resolve({ sharp, soft });
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Camera path in model space (x right, y up, +z toward the visor). It starts straight above,
// swings behind, clears the top of the headband, drops inside the loop to eye level and
// pushes up to the lenses.
const POS = new CatmullRomCurve3(
  [
    new Vector3(0, 8, 0.7),
    new Vector3(0, 4.4, -2.3),
    new Vector3(0, 1.6, -2.6),
    new Vector3(0, 0.7, -1.35),
    new Vector3(0, 0.16, -0.4),
    new Vector3(0, -0.04, 0.15),
    new Vector3(0, -0.07, 0.6),
  ],
  false,
  'centripetal',
);
const AIM = new CatmullRomCurve3(
  [
    new Vector3(0, 0, 0.7),
    new Vector3(0, 0, 0.35),
    new Vector3(0, -0.02, 0.55),
    new Vector3(0, -0.06, 0.85),
    new Vector3(0, -0.07, 1.2),
    new Vector3(0, -0.075, 2),
    new Vector3(0, -0.078, 3),
  ],
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

  // displays behind the two lenses (centres measured from the model's lens rings).
  // The camera looks toward +z, so the lens at +x is on the viewer's left.
  const leftEye = lensDisplay(0.331, -0.078, 0.826, 0.43, 0.345);
  const rightEye = lensDisplay(-0.351, -0.078, 0.826, 0.43, 0.345);
  scene.add(leftEye, rightEye);
  const eyes = [leftEye, rightEye].map((m) => (m.material as ShaderMaterial).uniforms);
  let imageUrl = '';

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

    // lens displays: switch on, each eye focuses at its own moment, then the images converge
    const on = smooth(seg(progress, 0.16, 0.34));
    const converge = smooth(seg(progress, 0.37, 0.47));
    eyes[0]['opacity'].value = eyes[1]['opacity'].value = on;
    eyes[0]['bright'].value = eyes[1]['bright'].value = 0.45 + 0.7 * smooth(seg(progress, 0.24, 0.44));
    eyes[0]['blur'].value = 1 - 0.95 * smooth(seg(progress, 0.31, 0.41));
    eyes[1]['blur'].value = 1 - 0.95 * smooth(seg(progress, 0.36, 0.46));
    const d = 0.13 * (1 - converge);
    (eyes[0]['offset'].value as Vector2).set(d, 0.02 * (1 - converge));
    (eyes[1]['offset'].value as Vector2).set(-d, -0.02 * (1 - converge));
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
    setImage(url) {
      if (url === imageUrl) return;
      imageUrl = url;
      loadImage(url)
        .then(({ sharp, soft }) => {
          if (url !== imageUrl) return;
          for (const u of eyes) {
            (u['sharp'].value as Texture | null)?.dispose();
            (u['soft'].value as Texture | null)?.dispose();
            u['sharp'].value = sharp;
            u['soft'].value = soft;
          }
          dirty = true;
        })
        .catch(() => {});
    },
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
