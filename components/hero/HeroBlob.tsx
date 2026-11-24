"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import { readToken } from "@/components/motion/useSceneMode";

type Props = { active: boolean; onReady: () => void; onLost: () => void };

// Pointer and scroll live in refs fed by window listeners: the canvas sits behind the portrait and
// never receives pointer events itself.
function useInputs() {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      scroll.current = Math.min(1, window.scrollY / window.innerHeight);
    };
    onScroll();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return { pointer, scroll };
}

function Blob({ onReady, color, deep }: { onReady: () => void; color: string; deep: string }) {
  const mesh = useRef<Mesh>(null);
  const frames = useRef(0);
  const eased = useRef({ x: 0, y: 0, s: 0 });
  const { pointer, scroll } = useInputs();

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const k = 1 - Math.exp(-2.5 * dt); // slow follow: the blob leans, it never snaps
    const e = eased.current;
    e.x += (pointer.current.x - e.x) * k;
    e.y += (pointer.current.y - e.y) * k;
    e.s += (scroll.current - e.s) * k;
    const t = state.clock.elapsedTime;
    m.rotation.set(e.y * 0.5 + t * 0.06, e.x * 0.7 + e.s * 2.2 + t * 0.08, 0);
    m.position.set(e.x * 0.35, e.y * 0.25 - e.s * 1.2, 0);
    m.scale.setScalar(1 + e.s * 0.3);
    frames.current += 1;
    if (frames.current === 1) onReady();
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 4, 5]} intensity={3} />
      <directionalLight position={[4, -2, -3]} intensity={1.4} color={deep} />
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.2, 48]} />
        {/* speed 1 keeps the morph slow; distort stays low enough to read as one soft object */}
        <MeshDistortMaterial color={color} distort={0.32} speed={1} roughness={0.22} metalness={0.05} />
      </mesh>
    </>
  );
}

export default function HeroBlob({ active, onReady, onLost }: Props) {
  const colors = useMemo(() => ({ color: readToken("--accent"), deep: readToken("--accent-deep") }), []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 5.2], fov: 40 }}
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
      <Blob onReady={onReady} {...colors} />
    </Canvas>
  );
}
