"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Group, type PerspectiveCamera, Vector3 } from "three";

const scratch = new Vector3();

const seats = new Map<string, Vector3>();
function seat(id: string | undefined, offset: [number, number, number]) {
  if (!id) return new Vector3(...offset);
  let v = seats.get(id);
  if (!v) seats.set(id, (v = new Vector3(...offset)));
  return v;
}

export function VrPanel({
  offset,
  tilt = [0, 0, 0],
  lag = 5,
  interactive = false,
  id,
  children,
}: {
  offset: [number, number, number];
  tilt?: [number, number, number];
  lag?: number;
  interactive?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<Group>(null);
  const camera = useThree((s) => s.camera as PerspectiveCamera);
  const height = useThree((s) => s.size.height);
  const placed = useRef(false);
  const spot = useRef(seat(id, offset));
  const drag = useRef<{ x: number; y: number } | null>(null);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const bob = Math.sin(state.clock.elapsedTime * 0.9 + spot.current.x * 4) * 0.012;
    scratch
      .set(spot.current.x, spot.current.y + bob, spot.current.z)
      .applyQuaternion(camera.quaternion)
      .add(camera.position);
    if (!placed.current) {
      placed.current = true;
      g.position.copy(scratch);
      g.quaternion.copy(camera.quaternion);
      return;
    }
    g.position.lerp(scratch, 1 - Math.exp(-lag * dt));
    g.quaternion.slerp(camera.quaternion, 1 - Math.exp(-lag * 1.6 * dt));
  });

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest("input,button,a,select,textarea")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };

  const onMove = (e: React.PointerEvent) => {
    const from = drag.current;
    if (!from) return;
    const perPx =
      (2 * Math.abs(spot.current.z) * Math.tan((camera.fov * Math.PI) / 360)) / height;
    const clamp = (v: number, r: number) => Math.max(-r, Math.min(r, v));
    spot.current.x = clamp(spot.current.x + (e.clientX - from.x) * perPx, 2.5);
    spot.current.y = clamp(spot.current.y - (e.clientY - from.y) * perPx, 1.6);
    drag.current = { x: e.clientX, y: e.clientY };
  };

  const onUp = () => {
    drag.current = null;
  };

  return (
    <group ref={ref}>
      <group rotation={tilt}>
        <Html
          transform
          distanceFactor={0.6}
          zIndexRange={[60, 0]}
          occlude={false}
          pointerEvents={interactive ? "auto" : "none"}
          style={{ pointerEvents: interactive ? "auto" : "none" }}
        >
          <div
            className={interactive ? "cursor-grab active:cursor-grabbing select-none touch-none" : undefined}
            style={{ touchAction: "none" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </Html>
      </group>
    </group>
  );
}
