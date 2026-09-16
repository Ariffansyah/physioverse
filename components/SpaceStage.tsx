"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { AdditiveBlending, DoubleSide, Vector3, type Group, type Mesh, type Object3D, type Sprite } from "three";
import { setFocus, useFocus, useStops, type Stop } from "@/lib/focus";
import { PLANETS } from "@/lib/planets";
import { useNarrow } from "@/lib/touch";
import { play } from "@/lib/sfx";
import { glowTexture, planetTexture } from "@/lib/textures";


const never = () => () => {};

const STILL =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;



function Sun() {
  const flare = useRef<Sprite>(null);
  const body = useRef<Mesh>(null);
  const focus = useFocus();

  useFrame((_, dt) => {
    const s = flare.current;
    const b = body.current;
    if (!s || !b) return;
    const k = STILL ? 1 : 1 - 0.02 ** dt;
    s.scale.x += ((focus >= 0 ? 1.6 : 5.5) - s.scale.x) * k;
    s.scale.y = s.scale.x;
    b.scale.x += ((focus >= 0 ? 0.42 : 1) - b.scale.x) * k;
    b.scale.y = b.scale.x;
    b.scale.z = b.scale.x;
  });

  return (
    <>
      <mesh ref={body}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color="#ffeccb" />
      </mesh>
      <sprite ref={flare} scale={[5.5, 5.5, 1]}>
        <spriteMaterial
          map={glowTexture()}
          color="#ffd9a8"
          blending={AdditiveBlending}
          opacity={0.7}
          depthWrite={false}
          transparent
        />
      </sprite>
    </>
  );
}

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

function Moon({
  color,
  r,
  speed,
  tilt,
  roll,
  phase,
  spin,
  ring,
  size,
  mark,
  stop,
  card,
  deck,
  narrow,
}: (typeof PLANETS)[number] & {
  narrow: boolean;
  mark: (o: Object3D | null) => void;
  stop?: Stop;
  card: boolean;
  deck: RefObject<HTMLDivElement | null>;
}) {
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
          <mesh
            ref={(o) => {
              ball.current = o;
              mark(o);
            }}
          >
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

          {card && !narrow && stop?.card && (
            <Html portal={deck as RefObject<HTMLElement>} center zIndexRange={[40, 0]} pointerEvents="auto">
              <div
                role="presentation"
                onClick={() => stop.go()}
                onPointerEnter={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerLeave={() => {
                  document.body.style.cursor = "auto";
                }}
                className="hud bracket w-[17rem] translate-x-[13.5rem] cursor-pointer bg-graphite/85 p-4 backdrop-blur-sm transition-colors duration-500 ease-settle"
                style={{ ["--tint" as string]: stop.card.tint, borderColor: stop.card.tint }}
              >
                <p className="tag" style={{ color: stop.card.tint }}>
                  {stop.card.kicker}
                </p>
                <p className="mt-2 font-serif text-lg leading-snug text-starlight">
                  {stop.card.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ash">{stop.card.body}</p>
                {stop.card.lines?.length ? (
                  <dl className="mt-3 grid gap-1 border-t border-rule pt-3 font-mono text-[11px] tabular-nums text-ashdim">
                    {stop.card.lines.map((line) => (
                      <div key={line} className="flex justify-between gap-4">
                        <dt>{line.split(" · ")[0]}</dt>
                        <dd className="text-ash">{line.split(" · ").slice(1).join(" · ")}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <p className="mt-3 flex items-center justify-between gap-3 border-t border-rule pt-3 font-mono text-[11px] tracking-[0.16em] text-ashdim">
                  {stop.card.meta}
                  <span style={{ color: stop.card.tint }}>{stop.card.cta}</span>
                </p>
              </div>
            </Html>
          )}

          {stop && !narrow && (
            <mesh
              onPointerOver={(e) => {
                if (blocked(e.nativeEvent)) return;
                e.stopPropagation();
                document.body.style.cursor = "pointer";
                play("move");
                setFocus(stop.planet);
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
              onClick={(e) => {
                if (blocked(e.nativeEvent)) return;
                e.stopPropagation();
                play("select");
                stop.go();
              }}
            >
              <sphereGeometry args={[Math.max(size * 3.2, 0.55), 16, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
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

  const focus = useFocus();

  useFrame(() => {
    const g = pivot.current;
    if (!g) return;
    const sway = focus >= 0 ? 0.25 : 1;
    g.rotation.y += (aim.current.x * 0.3 * sway - g.rotation.y) * 0.035;
    g.rotation.x += (aim.current.y * 0.18 * sway - g.rotation.x) * 0.035;
  });

  return (
    <group ref={pivot} position={[3.1, 0.4, 0]}>
      {children}
    </group>
  );
}


const blocked = (e: Event) => {
  const el = e.target;
  return el instanceof Element && !!el.closest("a, button, input, label, summary, [role='button']");
};

const HOME = new Vector3(0, 2.6, 9.5);
const HOME_LOOK = new Vector3(3.1, 0.4, 0);
const HOME_LOOK_NARROW = new Vector3(3.1, 3.6, 0);

function Flight({ seats, narrow }: { seats: RefObject<(Object3D | null)[]>; narrow: boolean }) {
  const focus = useFocus();
  const look = useRef(HOME_LOOK.clone());
  const at = useRef(new Vector3());
  const seat = useRef(new Vector3());

  useFrame(({ camera }, dt) => {
    const planet = narrow || focus < 0 ? null : seats.current[focus];

    if (planet) {
      planet.getWorldPosition(at.current);
      const back = 1.6 + (PLANETS[focus]?.size ?? 0.2) * 6;
      seat.current.set(at.current.x, at.current.y + 0.35, at.current.z + back);
      at.current.x -= back * 0.16;
    } else {
      at.current.copy(narrow ? HOME_LOOK_NARROW : HOME_LOOK);
      seat.current.copy(HOME);
    }

    const k = STILL ? 1 : 1 - 0.015 ** dt;
    camera.position.lerp(seat.current, k);
    look.current.lerp(at.current, k);
    camera.lookAt(look.current);
  });

  return null;
}

export default function SpaceStage() {
  const seats = useRef<(Object3D | null)[]>([]);
  const deck = useRef<HTMLDivElement>(null);
  const stops = useStops();
  const focus = useFocus();
  const narrow = useNarrow();
  const source = useSyncExternalStore(never, () => document.body, () => undefined);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 50, position: [0, 2.6, 9.5] }}
        eventSource={source}
        eventPrefix="client"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={26} distance={22} color="#ffe6c0" />
        <directionalLight position={[-6, 8, 6]} intensity={0.8} />

        <Flight seats={seats} narrow={narrow} />

        <Rig>

          <Sun />

          {PLANETS.map((p, i) => (
            <Moon
              key={p.chamber}
              {...p}
              stop={stops.find((t) => t.planet === i)}
              card={focus === i}
              deck={deck}
              narrow={narrow}
              mark={(o) => {
                seats.current[i] = o;
              }}
            />
          ))}
        </Rig>
      </Canvas>
      </div>
      <div ref={deck} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50" />
    </>
  );
}
