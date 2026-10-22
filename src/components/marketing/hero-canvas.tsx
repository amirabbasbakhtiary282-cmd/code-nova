"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Points as ThreePoints } from "three";

function ParticleField() {
  const ref = useRef<ThreePoints | null>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(1800);
    for (let i = 0; i < array.length; i += 3) {
      array[i] = (Math.random() - 0.5) * 6;
      array[i + 1] = (Math.random() - 0.5) * 4;
      array[i + 2] = (Math.random() - 0.5) * 5;
    }
    return array;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#10B981" size={0.03} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export function HeroCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      <Canvas camera={{ position: [0, 0, 2.6], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
