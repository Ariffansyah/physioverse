import { BAY, COURT, RAIL, SLIT, WIND, courtX, type Level } from "@/lib/levels";
import { box, type Box } from "@/lib/collide";


export function solidsFor(level: Level): Box[] {
  const railHalf = (RAIL.length * RAIL.scale) / 2;
  switch (level.chamber) {
    case "ballistics":
      return [box(BAY.origin + 0.3, 0.5, 0, 1.3, 0.6, 0.75)];
    case "court":
      return [
        box(courtX(level.marker ?? 8) + 0.6, 1.7, 0, 0.2, 1.6, 0.2),
        box(COURT.origin, 0.9, 0, 0.4, 0.95, 0.4),
      ];
    case "photonics":

      return level.marker === undefined
        ? []
        : [box(level.marker, 2.6, 0, 0.12, 2.5, 1.2)];
    case "kinetics":
      return [
        box(0, 0.15, 0, railHalf, 0.15, 1),
        ...[-railHalf, railHalf].flatMap((x) =>
          [-1.3, 1.3].map((z) => box(x, 1.6, z, 0.12, 1.6, 0.12)),
        ),
      ];
    case "drag":
      return [box(WIND.carX, 0.8, 0, 2, 0.8, 1)];
    case "quantum":
      return [box(SLIT.maskX, 5.4, 0, 0.1, 5, 2.5)];
    default:
      return [];
  }
}

