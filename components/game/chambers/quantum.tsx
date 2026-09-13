"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, SRGBColorSpace, type Mesh } from "three";
import { CHAMBERS, SLIT } from "@/lib/levels";
import { fringeSpacing } from "@/lib/physics";
import { Dim, SpanRule } from "../Gauge";
import type { ChamberProps } from "../hall";

const SCREEN_H = 10;
const PER_MM = SCREEN_H / SLIT.screenMm;
const CENTRE_Y = 5.4;
const SOURCE_X = SLIT.maskX - 5;
const PULSE = 1.8;

export default function Quantum({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const tint = CHAMBERS[level.chamber].tint;

  const lambda = params.wavelength ?? 550;
  const screenM = params.screen ?? 2.5;
  const spacing = fringeSpacing(lambda, screenM, params.slit) * 1000;
  const screenX = SLIT.maskX + screenM * SLIT.unitsPerMetre;

  const texture = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 2;
    cv.height = 512;
    const ctx = cv.getContext("2d");

    if (ctx) {
      const r = parseInt(tint.slice(1, 3), 16);
      const g = parseInt(tint.slice(3, 5), 16);
      const b = parseInt(tint.slice(5, 7), 16);

      for (let i = 0; i < cv.height; i++) {
        const yMm = (i / (cv.height - 1) - 0.5) * SLIT.screenMm;
        const phase = (Math.PI * yMm) / spacing;
        const arg = (Math.PI * yMm) / (5 * spacing);
        const env = arg === 0 ? 1 : Math.sin(arg) / arg;
        const I = Math.cos(phase) ** 2 * env * env;

        ctx.fillStyle = `rgb(${6 + (r - 6) * I}, ${9 + (g - 9) * I}, ${12 + (b - 12) * I})`;
        ctx.fillRect(0, i, 2, 1);
      }
    }

    const tex = new CanvasTexture(cv);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, [spacing, tint]);

  useEffect(() => () => texture.dispose(), [texture]);

  const photon = useRef<Mesh>(null);
  const t = useRef(0);
  const live = useRef(false);

  useEffect(() => {
    t.current = 0;
    live.current = runToken > 0;
  }, [runToken]);

  useFrame((_, dt) => {
    if (!live.current || !photon.current) return;
    t.current += dt;

    const p = Math.min(t.current / PULSE, 1);
    const leg = p < 0.45 ? p / 0.45 : (p - 0.45) / 0.55;
    const [ax, bx] =
      p < 0.45 ? [SOURCE_X, SLIT.maskX] : [SLIT.maskX, screenX];

    photon.current.position.set(ax + (bx - ax) * leg, CENTRE_Y, 0);
    photon.current.visible = true;

    if (p >= 1) {
      live.current = false;
      photon.current.visible = false;
      onFinish(level.solve(params));
    }
  });

  const gap = 0.45 + params.slit * 2.4;

  return (
    <group>
      <mesh position={[SOURCE_X, CENTRE_Y, 0]}>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[SOURCE_X, CENTRE_Y, 0]} color={tint} intensity={9} distance={14} />

      <group
        position={[SLIT.maskX, CENTRE_Y, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onInteract?.();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <mesh>
          <boxGeometry args={[0.16, SCREEN_H, 5]} />
          <meshStandardMaterial color="#0a0e12" roughness={0.85} metalness={0.2} />
        </mesh>
        {[gap / 2, -gap / 2].map((y) => (
          <mesh key={`slit-${y}`} position={[0.1, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[4.6, 0.12]} />
            <meshStandardMaterial
              color={tint}
              emissive={tint}
              emissiveIntensity={1.1}
              side={2}
            />
          </mesh>
        ))}
      </group>

      <mesh position={[screenX, CENTRE_Y, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, SCREEN_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[screenX + 0.12, CENTRE_Y, 0]}>
        <boxGeometry args={[0.16, SCREEN_H + 0.5, 5.4]} />
        <meshStandardMaterial color="#0a0e12" roughness={0.9} />
      </mesh>

      <SpanRule
        gauge={level.gauge}
        target={level.goal.target}
        unitsPer={PER_MM}
        position={[screenX - 0.1, CENTRE_Y - SCREEN_H / 2 + 0.4, -2.9]}
        tint={tint}
      />

      <Dim
        from={[SLIT.maskX, 0.35, 2.7]}
        to={[screenX, 0.35, 2.7]}
        label={`L = ${screenM.toFixed(2)} m celah ke layar`}
        tint="#cbb08a"
      />
      <Dim
        from={[SLIT.maskX, CENTRE_Y - gap / 2, 2.7]}
        to={[SLIT.maskX, CENTRE_Y + gap / 2, 2.7]}
        label={`d = ${params.slit.toFixed(3)} mm (gambar dilebarkan)`}
        tint={tint}
      />
      <Dim
        from={[screenX - 0.25, CENTRE_Y, 2.7]}
        to={[screenX - 0.25, CENTRE_Y + level.goal.target * PER_MM, 2.7]}
        label={`Target Δy = ${level.goal.target} mm`}
        tint="#7fa9c9"
      />

      <mesh ref={photon} visible={false}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#e4e8ea" emissive="#e4e8ea" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}
