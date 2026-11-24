"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Box3, CanvasTexture, SRGBColorSpace, Vector3, type Group } from "three";
import { readToken } from "@/components/motion/useSceneMode";
import { iconSrc } from "./logos";

type StackGroup = { group: string; items: string[] };
type Tokens = { paper: string; accent: string; deep: string; ink: string };

type SceneProps = {
  groups: StackGroup[];
  progress: MutableRefObject<number>;
  active: boolean;
  onReady: () => void;
  onLost: () => void;
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// SVG logos are rasterised once onto a square canvas so three.js gets a crisp texture.
function useLogoTexture(src: string) {
  const [tex, setTex] = useState<CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.src = src;
    img
      .decode()
      .then(() => {
        if (!alive) return;
        const size = 256;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const pad = 36;
        const ratio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const w = ratio >= 1 ? size - pad * 2 : (size - pad * 2) * ratio;
        const h = ratio >= 1 ? (size - pad * 2) / ratio : size - pad * 2;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const t = new CanvasTexture(c);
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = 4;
        setTex(t);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);
  return tex;
}

// Where each slab rests inside its group's cluster, as a unit offset (-1..1) around the cluster centre.
// The real size comes from the visible frame every frame (see fit), so no screen width cuts a slab.
function clusterUnit(i: number, n: number): [number, number, number] {
  const a = (i / Math.max(1, n)) * Math.PI * 2 + 0.4;
  const r = n <= 2 ? 0.65 : 1;
  return [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2) * 0.6];
}

// The cluster sits in the right half of whatever the camera sees at z = 0: centre at half the
// half-width, radius about a quarter of it, slabs shrunk on narrow frames.
type Fit = { cx: number; rx: number; ry: number; scale: number };
function fit(halfW: number, halfH: number): Fit {
  return { cx: halfW * 0.5, rx: halfW * 0.26, ry: Math.min(halfW * 0.26, halfH * 0.42), scale: Math.min(1, halfW / 7) };
}

// Each slab flies in from deep behind the stage, holds in the cluster, then rushes past the camera.
function Slab({ src, group, index, count, p, tokens, register }: { src: string; group: number; index: number; count: number; p: MutableRefObject<number>; tokens: Tokens; register: (key: string, g: Group | null) => void }) {
  const ref = useRef<Group>(null);
  const tex = useLogoTexture(src);
  const unit = useMemo(() => clusterUnit(index, count), [index, count]);
  const seed = useMemo(() => (group * 7 + index * 13) % 11, [group, index]);
  const key = `${group}-${index}`;

  useEffect(() => {
    register(key, ref.current);
    return () => register(key, null);
  }, [key, register]);

  useEffect(() => () => tex?.dispose(), [tex]);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = p.current * 4 - group; // 0..1 while this group owns the stage
    const enter = smooth(-0.05, 0.3, t);
    const leave = smooth(0.72, 1.02, t);
    const visible = t > -0.1 && t < 1.1;
    g.visible = visible;
    if (!visible) return;
    const f = fit(state.viewport.width / 2, state.viewport.height / 2);
    const slot = [f.cx + unit[0] * f.rx, unit[1] * f.ry, unit[2]];
    const from = [slot[0] + (seed - 5) * 0.9, slot[1] + ((seed % 3) - 1) * 3, -26];
    const to = [slot[0] * 1.6 + (seed - 5) * 0.4, slot[1] * 1.8 + 2.5, 9];
    const x = from[0] + (slot[0] - from[0]) * enter + (to[0] - slot[0]) * leave;
    const y = from[1] + (slot[1] - from[1]) * enter + (to[1] - slot[1]) * leave;
    const z = from[2] + (slot[2] - from[2]) * enter + (to[2] - slot[2]) * leave;
    const time = state.clock.elapsedTime;
    // Idle drift is slow (about an 8 s cycle) and the pointer only leans the slab, never jerks it.
    g.scale.setScalar(f.scale);
    g.position.set(x + state.pointer.x * 0.3 * f.scale, y + Math.sin(time * 0.8 + seed) * 0.08 + state.pointer.y * 0.2 * f.scale, z);
    g.rotation.set(
      (1 - enter) * 1.4 + leave * -0.9 - state.pointer.y * 0.25,
      (1 - enter) * -2.2 + leave * 1.6 + state.pointer.x * 0.35 + Math.sin(time * 0.5 + seed) * 0.12,
      (1 - enter) * 0.6,
    );
  });

  return (
    <group ref={ref} visible={false}>
      <RoundedBox args={[1.5, 1.5, 0.32]} radius={0.22} smoothness={4}>
        <meshStandardMaterial color={tokens.paper} roughness={0.35} metalness={0.05} />
      </RoundedBox>
      {tex && (
        <mesh position-z={0.165}>
          <planeGeometry args={[1.12, 1.12]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function Rig({ groups, progress, onReady, tokens }: Omit<SceneProps, "active" | "onLost"> & { tokens: Tokens }) {
  const p = useRef(0);
  const frames = useRef(0);
  const slabs = useMemo(
    () =>
      groups.flatMap((g, gi) => {
        const withLogo = g.items.map((name) => iconSrc(name)).filter((s): s is string => Boolean(s));
        return withLogo.map((src, i) => ({ src, group: gi, index: i, count: withLogo.length }));
      }),
    [groups],
  );

  const placed = useRef(new Map<string, Group>());
  const register = useCallback((key: string, g: Group | null) => {
    if (g) placed.current.set(key, g);
    else placed.current.delete(key);
  }, []);
  const box = useMemo(() => new Box3(), []);
  const corner = useMemo(() => new Vector3(), []);

  useFrame((state, dt) => {
    // The scene eases toward the raw scroll value so a fast flick still reads as one slow move.
    p.current += (progress.current - p.current) * (1 - Math.exp(-4 * dt));
    frames.current += 1;
    if (frames.current === 1) onReady();
    if (frames.current === 90) state.gl.domElement.dataset.calls = String(state.gl.info.render.calls);
    // Publishes how far the widest settled slab reaches in clip space (1 = canvas edge), for the e2e
    // fit check. Slabs flying in or out are skipped: passing the camera is the point of their exit.
    if (frames.current % 15 === 0) {
      let max = 0;
      const t = p.current * 4;
      placed.current.forEach((g, key) => {
        const local = t - Number(key.split("-")[0]);
        if (!g.visible || local < 0.32 || local > 0.7) return;
        box.setFromObject(g);
        for (let i = 0; i < 8; i++) {
          corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(state.camera);
          max = Math.max(max, Math.abs(corner.x), Math.abs(corner.y));
        }
      });
      state.gl.domElement.dataset.maxNdc = max.toFixed(3);
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[-5, 6, 8]} intensity={2.4} />
      <directionalLight position={[6, -3, -2]} intensity={1.1} color={tokens.deep} />
      {slabs.map((s) => (
        <Slab key={`${s.group}-${s.src}`} {...s} p={p} tokens={tokens} register={register} />
      ))}
    </>
  );
}

export default function BuildScene({ active, onLost, ...rig }: SceneProps) {
  const tokens = useMemo<Tokens>(() => ({ paper: readToken("--paper-2"), accent: readToken("--accent"), deep: readToken("--accent-deep"), ink: readToken("--ink") }), []);
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 12], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          window.setTimeout(() => {
            if (gl.domElement.isConnected) onLost();
          }, 150);
        });
      }}
    >
      <Rig {...rig} tokens={tokens} />
    </Canvas>
  );
}
