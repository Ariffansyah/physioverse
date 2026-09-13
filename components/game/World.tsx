"use client";

import { Environment, Lightformer, PointerLockControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { RefObject } from "react";
import { CHAMBERS, getLevel } from "@/lib/levels";
import Ballistics from "./chambers/ballistics";
import Court from "./chambers/court";
import Gravity from "./chambers/gravity";
import Kinetics from "./chambers/kinetics";
import Photonics from "./chambers/photonics";
import Quantum from "./chambers/quantum";
import type { ChamberProps, Lockable } from "./hall";
import { Player } from "./Player";
import { Room } from "./Room";

const VIEWS: Record<string, (props: ChamberProps) => React.ReactNode> = {
  ballistics: Ballistics,
  court: Court,
  photonics: Photonics,
  kinetics: Kinetics,
  quantum: Quantum,
  gravity: Gravity,
};

export default function World({
  levelId,
  params,
  runToken,
  active,
  onFinish,
  onNear,
  onLock,
  onUnlock,
  controlsRef,
  onInteract,
  hud,
}: {
  levelId: string;
  params: Record<string, number>;
  runToken: number;
  active: boolean;
  onFinish: (value: number) => void;
  onNear: (near: boolean) => void;
  onLock: () => void;
  onUnlock: () => void;
  controlsRef: RefObject<Lockable | null>;
  onInteract?: () => void;
  hud?: React.ReactNode;
}) {
  const level = getLevel(levelId);
  if (!level) return null;
  const tint = CHAMBERS[level.chamber]?.tint ?? "#e8a04a";
  const View = VIEWS[level.chamber];
  if (!View) {
    console.error(`[World] unknown chamber "${level.chamber}", known: ${Object.keys(VIEWS).join(",")}`);
  }

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ fov: 75, near: 0.2, far: 220 }}
    >
      <color attach="background" args={["#04070a"]} />
      <fog attach="fog" args={["#050912", 22, 130]} />

      <Stars radius={150} depth={75} count={7000} factor={3.4} saturation={0} fade speed={0.6} />

      <ambientLight intensity={0.32} />
      <hemisphereLight args={[tint, "#0a1424", 0.8]} />
      <directionalLight position={[-12, 20, 8]} intensity={0.35} />
      <directionalLight position={[-118, 58, -148]} intensity={0.7} color="#ffd9a8" />

      {/* Pantulan buat semua logam di chamber — tanpa ini metalness cuma jadi hitam. */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffd9a8" scale={[10, 4, 1]} position={[-8, 5, -6]} rotation={[0, 0.9, 0]} />
        <Lightformer form="rect" intensity={1.1} color={tint} scale={[14, 3, 1]} position={[7, 3, 5]} rotation={[0, -2.4, 0]} />
        <Lightformer form="ring" intensity={0.9} color="#5f8fc4" scale={[8, 8, 1]} position={[0, 9, -4]} rotation={[-1.2, 0, 0]} />
        <Lightformer form="rect" intensity={0.35} color="#101820" scale={[20, 20, 1]} position={[0, -6, 0]} rotation={[1.57, 0, 0]} />
      </Environment>

      <Room tint={tint} />
      {View ? (
        <View
          level={level}
          params={params}
          runToken={runToken}
          onFinish={onFinish}
          onInteract={onInteract}
        />
      ) : (
        <group>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff3333" />
          </mesh>
        </group>
      )}
      <Player active={active} level={level} onNear={onNear} />
      {hud}

      <PointerLockControls
        selector="#play-surface"
        onLock={onLock}
        onUnlock={onUnlock}
        ref={(instance) => {
          controlsRef.current = instance;
        }}
      />

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.32}
          luminanceSmoothing={0.7}
          radius={0.92}
          mipmapBlur
          resolutionScale={0.5}
        />
        <ChromaticAberration offset={[0.0007, 0.0007]} radialModulation modulationOffset={0.4} />
        <Vignette offset={0.28} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
