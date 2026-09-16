"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Vector2,
  Vector3,
  type Mesh,
  type ShaderMaterial,
} from "three";
import { CHAMBERS, SLIT } from "@/lib/levels";
import { wavelengthRgb } from "@/lib/physics";
import { Dim, SpanRule } from "../Gauge";
import type { ChamberProps } from "../hall";

const SCREEN_H = 10;
const PER_MM = SCREEN_H / SLIT.screenMm;
const CENTRE_Y = 5.4;
const SOURCE_X = SLIT.maskX - 5;
const PULSE = 1.8;
const SLIT_WIDTH_MM = 0.03;
const OPEN = 0.16;
const LASER_LEN = 1.8;
const MUZZLE = SOURCE_X + LASER_LEN / 2;

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform float uLambda;
  uniform float uD;
  uniform float uA;
  uniform float uGapMm;
  uniform float uSpan;
  uniform vec2  uX;
  uniform vec3  uTint;
  uniform float uGain;
  uniform float uFlash;
  uniform float uGlow;
  varying vec2 vUv;

  const float PI = 3.141592653589793;

  void main() {
    float lambda = uLambda * 1e-9;
    float d = uD * 1e-3;
    float a = uA * 1e-3;
    float y = (vUv.y - 0.5) * uSpan * 1e-3;
    float x = mix(uX.x, uX.y, vUv.x);

    float hole = 0.5 * uGapMm * 1e-3;
    float dy1 = y - hole;
    float dy2 = y + hole;
    float r1 = sqrt(x * x + dy1 * dy1);
    float r2 = sqrt(x * x + dy2 * dy2);

    float b1 = PI * a * dy1 / (lambda * max(r1, 1e-9));
    float b2 = PI * a * dy2 / (lambda * max(r2, 1e-9));
    float e1 = abs(b1) < 1e-4 ? 1.0 : sin(b1) / b1;
    float e2 = abs(b2) < 1e-4 ? 1.0 : sin(b2) / b2;

    float a1 = e1 * sqrt(clamp(uX.y / max(r1, 1e-4), 0.0, 2.25));
    float a2 = e2 * sqrt(clamp(uX.y / max(r2, 1e-4), 0.0, 2.25));

    float R1 = sqrt(x * x + (y - 0.5 * d) * (y - 0.5 * d));
    float R2 = sqrt(x * x + (y + 0.5 * d) * (y + 0.5 * d));
    float phase = PI * (2.0 * y * d / max(R1 + R2, 1e-9)) / lambda;

    float w = fwidth(phase);
    float coh = w < 1e-4 ? 1.0 : sin(w) / w;
    float near = smoothstep(0.0, 0.05, vUv.x) * uGlow + (1.0 - uGlow);

    float I = 0.25 * (a1 * a1 + a2 * a2 + 2.0 * a1 * a2 * cos(2.0 * phase) * coh);
    I *= near * uGain * uFlash;
    vec3 base = vec3(0.024, 0.035, 0.047) * (1.0 - uGlow);

    gl_FragColor = vec4(pow(base + uTint * I, vec3(2.2)), 1.0);
  }
`;

const makeUniforms = (glow: number, gain: number) => ({
  uLambda: { value: 550 },
  uD: { value: 0.3 },
  uA: { value: SLIT_WIDTH_MM },
  uGapMm: { value: 1 },
  uSpan: { value: SLIT.screenMm },
  uX: { value: new Vector2(0, 2.5) },
  uTint: { value: new Vector3(1, 1, 1) },
  uGain: { value: gain },
  uFlash: { value: 1 },
  uGlow: { value: glow },
});

export default function Quantum({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const tint = CHAMBERS[level.chamber].tint;

  const lambda = params.wavelength ?? 550;
  const screenM = params.screen ?? 2.5;
  const screenX = SLIT.maskX + screenM * SLIT.unitsPerMetre;

  const gap = Math.max(0.3, params.slit * 3.3);
  const wing = (SCREEN_H - gap - OPEN) / 2;

  const rgb = wavelengthRgb(lambda);
  const lit = useMemo(() => new Color(), []);
  const litHex = `#${lit.setRGB(rgb[0], rgb[1], rgb[2]).getHexString()}`;

  const screenU = useMemo(() => makeUniforms(0, 1), []);
  const fieldU = useMemo(() => makeUniforms(1, 0.45), []);

  const pulse = useRef<Mesh>(null);
  const screenMat = useRef<ShaderMaterial>(null);
  const fieldMat = useRef<ShaderMaterial>(null);
  const t = useRef(0);
  const live = useRef(false);

  useEffect(() => {
    t.current = 0;
    live.current = runToken > 0;
  }, [runToken]);

  useFrame((_, dt) => {
    const knobs = { lambda, slit: params.slit, gapMm: gap / PER_MM, screenM, rgb };

    if (!live.current || !pulse.current) {
      sync(screenMat, fieldMat, knobs, 1);
      return;
    }
    t.current += dt;

    const p = Math.min(t.current / PULSE, 1);
    let glare = 1;

    if (p < 0.45) {
      pulse.current.position.set(MUZZLE + (SLIT.maskX - MUZZLE) * (p / 0.45), CENTRE_Y, 0);
      pulse.current.visible = true;
    } else {
      pulse.current.visible = false;
      glare = 1 + 2.4 * (1 - (p - 0.45) / 0.55) ** 2;
    }

    sync(screenMat, fieldMat, knobs, glare);

    if (p >= 1) {
      live.current = false;
      onFinish(level.solve(params));
    }
  });

  return (
    <group>
      <group position={[SOURCE_X, CENTRE_Y, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, LASER_LEN, 20]} />
          <meshStandardMaterial color="#2b3238" metalness={0.85} roughness={0.38} />
        </mesh>
        <mesh position={[0, LASER_LEN / 2 - 0.22, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.2, 20]} />
          <meshStandardMaterial color="#464f57" metalness={0.9} roughness={0.28} />
        </mesh>
        <mesh position={[0, LASER_LEN / 2 + 0.01, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
          <meshStandardMaterial color={litHex} emissive={litHex} emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[0, -LASER_LEN / 2 - 0.06, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
          <meshStandardMaterial color="#1a1f24" roughness={0.9} />
        </mesh>
      </group>
      <pointLight position={[MUZZLE, CENTRE_Y, 0]} color={litHex} intensity={3.5} distance={7} />

      <group position={[(MUZZLE + SLIT.maskX) / 2, CENTRE_Y, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, SLIT.maskX - MUZZLE, 10, 1, true]} />
          <Air tint={litHex} opacity={0.55} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.13, 0.13, SLIT.maskX - MUZZLE, 10, 1, true]} />
          <Air tint={litHex} opacity={0.07} />
        </mesh>
      </group>

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
        {[
          [0, gap - OPEN],
          [gap / 2 + OPEN / 2 + wing / 2, wing],
          [-(gap / 2 + OPEN / 2 + wing / 2), wing],
        ].map(([y, h]) => (
          <mesh key={`plate-${y}`} position={[0, y, 0]}>
            <boxGeometry args={[0.16, h, 5]} />
            <meshStandardMaterial color="#0a0e12" roughness={0.85} metalness={0.2} />
          </mesh>
        ))}
        {[gap / 2, -gap / 2].map((y) => (
          <mesh key={`slit-${y}`} position={[0.09, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[4.6, OPEN]} />
            <Air tint={litHex} opacity={0.75} />
          </mesh>
        ))}
      </group>

      <mesh position={[(SLIT.maskX + screenX) / 2, CENTRE_Y, 0]}>
        <planeGeometry args={[screenX - SLIT.maskX, SCREEN_H]} />
        <shaderMaterial
          ref={fieldMat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={fieldU}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
        />
      </mesh>

      <mesh position={[screenX, CENTRE_Y, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, SCREEN_H]} />
        <shaderMaterial
          ref={screenMat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={screenU}
          side={DoubleSide}
        />
      </mesh>
      <pointLight
        position={[screenX - 0.6, CENTRE_Y, 0]}
        color={litHex}
        intensity={5}
        distance={9}
      />
      {[1, -1].map((side) => (
        <mesh
          key={`frame-${side}`}
          position={[screenX + 0.1, CENTRE_Y + (side * (SCREEN_H + 0.4)) / 2, 0]}
        >
          <boxGeometry args={[0.2, 0.4, 5.4]} />
          <meshStandardMaterial color="#0a0e12" roughness={0.9} />
        </mesh>
      ))}

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

      <mesh ref={pulse} visible={false} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.8, 12]} />
        <meshBasicMaterial color={litHex} toneMapped={false} />
      </mesh>
    </group>
  );
}

type MatRef = { current: ShaderMaterial | null };
type Knobs = {
  lambda: number;
  slit: number;
  gapMm: number;
  screenM: number;
  rgb: [number, number, number];
};

const sync = (screen: MatRef, field: MatRef, k: Knobs, flash: number) => {
  for (const [ref, from] of [
    [screen, k.screenM],
    [field, 0],
  ] as const) {
    const u = ref.current?.uniforms;
    if (!u) continue;
    u.uLambda.value = k.lambda;
    u.uD.value = k.slit;
    u.uGapMm.value = k.gapMm;
    u.uFlash.value = flash;
    u.uTint.value.set(...k.rgb);
    u.uX.value.set(from, k.screenM);
  }
};

function Air({ tint, opacity }: { tint: string; opacity: number }) {
  return (
    <meshBasicMaterial
      color={tint}
      transparent
      opacity={opacity}
      blending={AdditiveBlending}
      depthWrite={false}
      side={DoubleSide}
      toneMapped={false}
    />
  );
}
