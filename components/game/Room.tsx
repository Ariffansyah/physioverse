"use client";

import { ContactShadows, Grid, MeshReflectorMaterial } from "@react-three/drei";
import { memo } from "react";
import { AdditiveBlending, DoubleSide } from "three";
import { glowTexture } from "@/lib/textures";
import { BOUNDS, HALL } from "./hall";

const NEBULA: [[number, number, number], number, string][] = [
  [[-78, 28, -150], 170, "#3f6ea8"],
  [[96, 44, -128], 200, "#7a4e9e"],
  [[14, -34, -165], 230, "#1f6f7d"],
  [[-130, 16, 70], 180, "#2c4a86"],
];

export const Room = memo(function Room({ tint }: { tint: string }) {
  const { halfX, halfZ } = HALL;

  return (
    <group>
      {NEBULA.map(([pos, scale, color]) => (
        <sprite key={color} position={pos} scale={[scale, scale, 1]}>
          <spriteMaterial
            map={glowTexture()}
            color={color}
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0.55}
            transparent
            fog={false}
          />
        </sprite>
      ))}


      <mesh position={[-118, 58, -148]}>
        <sphereGeometry args={[4.5, 24, 24]} />
        <meshBasicMaterial color="#ffe9c8" fog={false} />
      </mesh>

      <mesh position={[38, -96, -54]}>
        <sphereGeometry args={[78, 64, 64]} />
        <meshStandardMaterial color="#1a2430" roughness={0.95} metalness={0.05} fog={false} />
      </mesh>
      <mesh position={[38, -96, -54]} rotation={[1.18, 0.35, 0]}>
        <ringGeometry args={[94, 128, 96]} />
        <meshBasicMaterial
          color={tint}
          side={DoubleSide}
          transparent
          opacity={0.2}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      <mesh position={[-92, 52, -118]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial color="#232d3a" emissive="#4d637a" emissiveIntensity={0.3} fog={false} />
      </mesh>


      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[halfX * 2, halfZ * 2]} />
        <MeshReflectorMaterial
          resolution={256}
          blur={[420, 110]}
          mixBlur={1}
          mixStrength={16}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.35}
          mirror={0.5}
          color="#070b10"
          metalness={0.8}
          roughness={0.88}
        />
      </mesh>


      <ContactShadows
        position={[0, 0.015, 0]}
        scale={[halfX * 2, halfZ * 2]}
        resolution={256}
        far={5}
        blur={2.4}
        opacity={0.55}
        color="#000000"
      />


      <Grid
        position={[0, 0.012, 0]}
        args={[halfX * 2, halfZ * 2]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1c242d"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#31414f"
        fadeDistance={78}
        fadeStrength={1.2}
        side={2}
      />

      <Axis size={[halfX * 2, 0.03, 0.03]} bright />
      <Axis size={[0.03, 0.03, halfZ * 2]} />

      {[-BOUNDS.z, BOUNDS.z].map((z) => (
        <Rail key={`z${z}`} position={[0, 0.05, z]} size={[BOUNDS.x * 2, 0.04, 0.04]} tint={tint} />
      ))}
      {[-BOUNDS.x, BOUNDS.x].map((x) => (
        <Rail key={`x${x}`} position={[x, 0.05, 0]} size={[0.04, 0.04, BOUNDS.z * 2]} tint={tint} />
      ))}
    </group>
  );
});

function Axis({ size, bright = false }: { size: [number, number, number]; bright?: boolean }) {
  return (
    <mesh position={[0, 0.028, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#8b949c"
        emissive="#8b949c"
        emissiveIntensity={bright ? 0.3 : 0.14}
        roughness={0.7}
      />
    </mesh>
  );
}

function Rail({
  position,
  size,
  tint,
}: {
  position: [number, number, number];
  size: [number, number, number];
  tint: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.6} roughness={0.6} />
    </mesh>
  );
}
