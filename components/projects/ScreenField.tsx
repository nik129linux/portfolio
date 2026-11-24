"use client";

import { Suspense, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Color, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Vector2, type Mesh, type Texture } from "three";
import type { Project } from "@/data/types";
import { readToken } from "@/components/motion/useSceneMode";

// Projects as a fly-through field (spec 2026-11-22-screen-field-design.md, after madebyigor.com).
// Every screenshot is a thin curved screen. Project i owns a station at z = -i * GAP; its first screen
// sits centred there and the rest float around it. Scroll flies the camera from station to station;
// speed bends and smears the screens, and they settle when the visitor stops. Behind everything a slow
// grainy gradient in the page's tokens.

const GAP = 10; // depth between two project stations
const CAM_AHEAD = 9.5; // camera distance in front of the station in focus
const FOCUS_W = 4.4; // width of a landscape focus screen in scene units
const FOCUS_Y = 0.75; // focus screens sit high so the caption and chips below stay clear

type Shared = { p: number; smear: number; pointer: Vector2 };

type FieldProps = {
  projects: Project[];
  progress: MutableRefObject<number>;
  selectedSlug: string | null;
  active: boolean;
  onFront: (index: number) => void;
  onReady: () => void;
  onLost: () => void;
  onSelect: (slug: string) => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Deterministic scatter so the field is the same on every visit.
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const screenVertex = /* glsl */ `
  uniform float uBend;
  uniform float uSmear;
  uniform float uHalfW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float nx = p.x / uHalfW;
    p.z -= uBend * nx * nx;               // curved like a wide display, edges away from the viewer
    p.y += uSmear * nx * nx * 0.35;       // speed drags the edges
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const screenFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uSmear;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 o = vec2(0.0, uSmear * 0.012);
    vec4 c = texture2D(uMap, vUv);
    c.r = texture2D(uMap, vUv + o).r;     // a light chromatic split while moving
    c.b = texture2D(uMap, vUv - o).b;
    gl_FragColor = vec4(c.rgb, uOpacity);
    #include <colorspace_fragment>
  }
`;

type Slot = { pos: [number, number, number]; rot: number; scale: number; focus: boolean };

function slotFor(project: number, screen: number): Slot {
  const z = -project * GAP;
  if (screen === 0) return { pos: [0, FOCUS_Y, z], rot: 0, scale: 1, focus: true };
  const s = project * 31 + screen * 7;
  const side = screen % 2 === 0 ? 1 : -1;
  return {
    pos: [side * (3.8 + rand(s) * 2.6), FOCUS_Y + (rand(s + 1) - 0.45) * 4.4, z - 1.5 - rand(s + 2) * 5],
    rot: side * -(0.18 + rand(s + 3) * 0.2),
    scale: 0.48 + rand(s + 4) * 0.22,
    focus: false,
  };
}

function Screen({ src, project, index, slug, shared, onSelect }: { src: string; project: number; index: number; slug: string; shared: MutableRefObject<Shared>; onSelect: (slug: string) => void }) {
  const mesh = useRef<Mesh>(null);
  const tex = useTexture(src, (t) => {
    const one = (Array.isArray(t) ? t[0] : t) as Texture;
    one.colorSpace = SRGBColorSpace;
    one.anisotropy = 8;
  }) as Texture;
  const slot = useMemo(() => slotFor(project, index), [project, index]);
  const img = tex.image as { width: number; height: number };
  const aspect = img.width / img.height;
  // Landscape screens share one width; tall phone screens share one height so both read the same size.
  const w = aspect >= 1 ? FOCUS_W : (FOCUS_W / 1.6) * aspect;
  const h = w / aspect;
  const geometry = useMemo(() => new PlaneGeometry(w, h, 32, 1), [w, h]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uMap: { value: tex }, uBend: { value: 0.3 }, uSmear: { value: 0 }, uHalfW: { value: w / 2 }, uOpacity: { value: 0 } },
        vertexShader: screenVertex,
        fragmentShader: screenFragment,
        transparent: true,
      }),
    [tex, w],
  );

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const { smear, pointer } = shared.current;
    const cam = state.camera.position.z;
    const dz = cam - slot.pos[2]; // how far in front of the camera this screen is
    const opacity = smooth(32, 16, dz) * smooth(0.4, 2.5, dz);
    m.visible = opacity > 0.01;
    const u = material.uniforms;
    u.uOpacity.value = opacity;
    u.uSmear.value = smear;
    u.uBend.value = (slot.focus ? 0.28 : 0.4) + Math.abs(smear) * 0.9;
    const t = state.clock.elapsedTime;
    const drift = slot.focus ? 0.05 : 0.14;
    m.position.set(
      slot.pos[0] + Math.sin(t * 0.35 + index) * drift,
      slot.pos[1] + Math.sin(t * 0.42 + project + index) * drift,
      slot.pos[2],
    );
    m.rotation.set(-pointer.y * 0.08, slot.rot + pointer.x * 0.12, 0);
    m.scale.setScalar(slot.scale);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(slug);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    />
  );
}

const bgVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }
`;
// Slow grainy gradient: a pale base, one cobalt hotspot drifting on a ~20 s loop, film grain on top.
const bgFragment = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uAccent;
  uniform vec3 uSoft;
  uniform vec3 uPaper;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 q = vec2(uv.x * uAspect, uv.y);
    vec2 hot = vec2((0.5 + 0.22 * sin(uTime * 0.31)) * uAspect, 0.48 + 0.16 * cos(uTime * 0.23));
    vec2 cool = vec2((0.5 - 0.3 * cos(uTime * 0.19)) * uAspect, 0.3 + 0.12 * sin(uTime * 0.27));
    vec3 col = mix(uPaper, uSoft, smoothstep(1.0, 0.0, uv.y) * 0.65);
    col = mix(col, uAccent, exp(-pow(distance(q, hot) * 2.2, 2.0)) * 0.42);
    col = mix(col, uSoft, exp(-pow(distance(q, cool) * 2.6, 2.0)) * 0.5);
    col += (hash(uv * 900.0 + fract(uTime)) - 0.5) * 0.05;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Background() {
  const size = useThree((s) => s.size);
  const material = useMemo(() => {
    const c = (name: string) => new Color(readToken(name));
    return new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uAspect: { value: 1 }, uAccent: { value: c("--accent") }, uSoft: { value: c("--accent-soft") }, uPaper: { value: c("--paper-2") } },
      vertexShader: bgVertex,
      fragmentShader: bgFragment,
      depthWrite: false,
      depthTest: false,
    });
  }, []);
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uAspect.value = size.width / size.height;
  });
  return (
    <mesh renderOrder={-1} frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function Rig({ projects, progress, selectedSlug, onFront, onReady, onSelect }: Omit<FieldProps, "active" | "onLost">) {
  const shared = useRef<Shared>({ p: 0, smear: 0, pointer: new Vector2() });
  const front = useRef(-1);
  const frames = useRef(0);
  const n = projects.length;

  useFrame((state, dt) => {
    const s = shared.current;
    const selected = selectedSlug ? projects.findIndex((p) => p.slug === selectedSlug) : -1;
    const target = selected >= 0 ? selected : progress.current * (n - 1);
    const prev = s.p;
    s.p += (target - s.p) * (1 - Math.exp(-3.2 * dt));
    const velocity = dt > 0 ? (s.p - prev) / dt : 0;
    s.smear += (clamp(velocity * 0.55, -1, 1) - s.smear) * (1 - Math.exp(-6 * dt));
    s.pointer.lerp(state.pointer, 1 - Math.exp(-2.5 * dt));

    const cam = state.camera;
    cam.position.set(s.pointer.x * 0.45, s.pointer.y * 0.3, CAM_AHEAD - s.p * GAP);
    cam.lookAt(0, 0, cam.position.z - 10);

    const idx = clamp(Math.round(s.p), 0, n - 1);
    if (idx !== front.current) {
      front.current = idx;
      onFront(idx);
    }
    frames.current += 1;
    if (frames.current === 1) onReady();
    if (frames.current === 90) state.gl.domElement.dataset.calls = String(state.gl.info.render.calls);
  });

  return (
    <>
      <Background />
      {projects.map((p, pi) =>
        (p.screens ?? []).map((sc, si) => (
          <Suspense key={sc.src} fallback={null}>
            <Screen src={sc.src} project={pi} index={si} slug={p.slug} shared={shared} onSelect={onSelect} />
          </Suspense>
        )),
      )}
    </>
  );
}

export default function ScreenField({ active, onLost, ...rig }: FieldProps) {
  const total = rig.projects.reduce((n, p) => n + (p.screens?.length ?? 0), 0);
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAM_AHEAD], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.dataset.screens = String(total);
        gl.domElement.dataset.bg = "grain";
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          window.setTimeout(() => {
            if (gl.domElement.isConnected) onLost();
          }, 150);
        });
      }}
    >
      <Rig {...rig} />
    </Canvas>
  );
}
