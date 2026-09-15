"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { AdditiveBlending, DoubleSide, type Group, type Mesh } from "three";
import { glowTexture, planetTexture } from "@/lib/textures";


const STILL =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;


const MOONS = [
  { color: "#f0b463", r: 2.3, size: 0.2, speed: 0.3, tilt: 0.45, roll: 0.1, phase: 0.4, spin: 0.5, ring: false },
  { color: "#f79a42", r: 3.0, size: 0.16, speed: 0.24, tilt: -0.28, roll: -0.2, phase: 2.1, spin: -0.35, ring: false },
  { color: "#5fb8ef", r: 3.8, size: 0.34, speed: 0.19, tilt: 0.22, roll: 0.26, phase: 4.4, spin: 0.22, ring: true },
  { color: "#6fd49a", r: 4.7, size: 0.22, speed: 0.15, tilt: -0.5, roll: 0.05, phase: 1.2, spin: 0.4, ring: false },
  { color: "#8fb0f2", r: 5.6, size: 0.28, speed: 0.12, tilt: 0.16, roll: -0.3, phase: 5.6, spin: -0.18, ring: false },
  { color: "#b9c6d6", r: 6.6, size: 0.18, speed: 0.1, tilt: -0.2, roll: 0.18, phase: 3.0, spin: 0.3, ring: false },
];

function Halo({ color, size }: { color: string; size: number }) {
  return (
    <sprite scale={[size, size, 1]}>
      <spriteMaterial
        map={glowTexture()}
        color={color}
        blending={AdditiveBlending}
        opacity={0.7}
        depthWrite={false}
        transparent
      />
    </sprite>
  );
}

function Moon({ color, r, size, speed, tilt, roll, phase, spin, ring }: (typeof MOONS)[number]) {
  const arm = useRef<Group>(null);
  const ball = useRef<Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (arm.current) arm.current.rotation.y = phase + (STILL ? 0 : clock.elapsedTime * speed);
    if (ball.current && !STILL) ball.current.rotation.y += dt * spin;
  });

  return (
    <group rotation={[tilt, 0, roll]}>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r - 0.008, r + 0.008, 128]} />
        <meshBasicMaterial
          color={color}
          side={DoubleSide}
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
      <group ref={arm}>
        <group position={[r, 0, 0]} rotation={[0, 0, 0.35]}>
          <mesh ref={ball}>
            <sphereGeometry args={[size, 48, 32]} />
            <meshStandardMaterial
              map={planetTexture(color, Math.round(r * 100))}
              color={color}
              emissive={color}
              emissiveIntensity={0.28}
              roughness={0.72}
              metalness={0.1}
            />
          </mesh>
          {ring && (
            <mesh rotation={[Math.PI / 2 - 0.3, 0, 0]}>
              <ringGeometry args={[size * 1.5, size * 2.3, 64]} />
              <meshBasicMaterial
                color={color}
                side={DoubleSide}
                transparent
                opacity={0.4}
                depthWrite={false}
              />
            </mesh>
          )}
          <Halo color={color} size={size * 7} />
        </group>
      </group>
    </group>
  );
}


function Rig({ children }: { children: React.ReactNode }) {
  const pivot = useRef<Group>(null);
  const aim = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (STILL) return;
    const onMove = (e: PointerEvent) => {
      aim.current = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 };
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const g = pivot.current;
    if (!g) return;
    g.rotation.y += (aim.current.x * 0.3 - g.rotation.y) * 0.035;
    g.rotation.x += (aim.current.y * 0.18 - g.rotation.x) * 0.035;
  });

  return (
    <group ref={pivot} position={[3.1, 0.4, 0]}>
      {children}
    </group>
  );
}


export default function SpaceStage() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 50, position: [0, 2.6, 9.5] }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={26} distance={22} color="#ffe6c0" />
        <directionalLight position={[-6, 8, 6]} intensity={0.8} />

        <Rig>

          <mesh>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshBasicMaterial color="#ffeccb" />
          </mesh>
          <Halo color="#ffd9a8" size={5.5} />

          {MOONS.map((m) => (
            <Moon key={m.color} {...m} />
          ))}
        </Rig>
      </Canvas>
    </div>
  );
}
