"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 18;
const EDGE_PAIRS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5],
  [4, 6], [5, 7], [6, 8], [7, 9], [8, 10],
  [1, 4], [3, 6], [5, 8], [2, 7], [0, 9],
  [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],
  [15, 16], [16, 17], [11, 15], [12, 16], [13, 17],
];

function generatePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const radius = 3.5 + Math.sin(i * 1.3) * 0.8;
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
}

function Nodes({ positions }: { positions: Float32Array }) {
  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#FF40C2"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function Edges({ positions }: { positions: Float32Array }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
  });

  const lines = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: "#00D4AA",
      transparent: true,
      opacity: 0.15,
    });

    return EDGE_PAIRS.map(([a, b]) => {
      const points = [
        new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]),
        new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, material);
    });
  }, [positions]);

  return (
    <group ref={ref}>
      {lines.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

export default function NetworkScene() {
  const positions = useMemo(() => generatePositions(NODE_COUNT), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <Nodes positions={positions} />
      <Edges positions={positions} />
    </Canvas>
  );
}
