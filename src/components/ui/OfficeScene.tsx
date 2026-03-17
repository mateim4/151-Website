"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { useMousePosition } from "@/hooks/useMousePosition";

// ─── Constants ───────────────────────────────────────────────────
const FLOOR_Y = -1.5;
const CEILING_Y = 1.5;
const CORRIDOR_HALF_W = 2.0;
const CROSSING_HALF_W = 4.0;

const DESK_WIDTH_Z = 1.6;
const DESK_HEIGHT = 0.75;
const DESK_DEPTH_X = 0.8;
const DESK_X = 1.5; // distance from center line

const TILE_STEP = 0.5;
const BLOCK_H = 0.12;

const NEAR_Z_MIN = 2.2;
const NEAR_Z_MID = NEAR_Z_MIN + DESK_WIDTH_Z + 0.5; // Added gap between desks
const NEAR_Z_MAX = NEAR_Z_MID + DESK_WIDTH_Z + 0.5;
const FAR_Z_MAX = 0.8;
const FAR_Z_MID = FAR_Z_MAX - DESK_WIDTH_Z - 0.5;
const FAR_Z_MIN = FAR_Z_MID - DESK_WIDTH_Z - 0.5;

const DOOR_Z = -4.5;
const DOOR_WIDTH = 1.0;
const DOOR_HEIGHT = 2.3;

// Camera
const DOLLY_CENTER = 8;
const DOLLY_AMPLITUDE = 0.4;
const DOLLY_SPEED = 0.06;
const FLY_IN_START = 14;

// Theme color palettes (keeping the same for wireframe style, just no neon shaders)
const PALETTE_DARK = {
  wireframe: "#5E2BFF", highlight: "#8B5CF6", cyan: "#63B4D1",
  floor: "#D8DCF0", green: "#00FF66",
  amber: "#FF6B35", tube: "#E8E0FF", fog: "#131515",
  oScale: 1.0,
};
const PALETTE_LIGHT = {
  wireframe: "#2B2B2F", highlight: "#4A4A52", cyan: "#3A3A42",
  floor: "#475569", green: "#00C853",
  amber: "#FF6D00", tube: "#3D3D45", fog: "#FAFBFE",
  oScale: 1.3,
};

// ─── Types ───────────────────────────────────────────────────────
interface DeskDef {
  xCenter: number;
  zCenter: number;
  facing: number; // 1 for right, -1 for left
}

// ─── 8 Desks ─────────────────────────────────────────────────────
const DESKS: DeskDef[] = [
  { xCenter: -DESK_X, zCenter: (NEAR_Z_MIN + NEAR_Z_MID) / 2, facing: 1 },
  { xCenter: -DESK_X, zCenter: (NEAR_Z_MID + NEAR_Z_MAX) / 2, facing: 1 },
  { xCenter: -DESK_X, zCenter: (FAR_Z_MID + FAR_Z_MAX) / 2, facing: 1 },
  { xCenter: -DESK_X, zCenter: (FAR_Z_MIN + FAR_Z_MID) / 2, facing: 1 },
  { xCenter: DESK_X, zCenter: (NEAR_Z_MIN + NEAR_Z_MID) / 2, facing: -1 },
  { xCenter: DESK_X, zCenter: (NEAR_Z_MID + NEAR_Z_MAX) / 2, facing: -1 },
  { xCenter: DESK_X, zCenter: (FAR_Z_MID + FAR_Z_MAX) / 2, facing: -1 },
  { xCenter: DESK_X, zCenter: (FAR_Z_MIN + FAR_Z_MID) / 2, facing: -1 },
];


// ─── Geometry Generators ─────────────────────────────────────────

function generateDeskGeometry(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const desk of DESKS) {
    const hx = DESK_DEPTH_X / 2, hz = DESK_WIDTH_Z / 2;
    const yB = FLOOR_Y, yT = FLOOR_Y + DESK_HEIGHT;
    const x0 = desk.xCenter - hx, x1 = desk.xCenter + hx;
    const z0 = desk.zCenter - hz, z1 = desk.zCenter + hz;

    // Desk surface
    p.push(x0,yT,z0, x1,yT,z0, x1,yT,z0, x1,yT,z1, x1,yT,z1, x0,yT,z1, x0,yT,z1, x0,yT,z0);
    // Legs
    p.push(x0,yB,z0, x0,yT,z0, x1,yB,z0, x1,yT,z0, x1,yB,z1, x1,yT,z1, x0,yB,z1, x0,yT,z1);

    // Add a laptop/monitor
    const monitorWidth = 0.5, monitorHeight = 0.3;
    const mx = desk.xCenter + desk.facing * 0.1; // Place monitor towards the back
    const my = yT;
    const mz0 = desk.zCenter - monitorWidth/2, mz1 = desk.zCenter + monitorWidth/2;

    // Monitor stand
    p.push(mx, my, desk.zCenter, mx, my + 0.1, desk.zCenter);
    // Monitor screen
    const screenX = mx - desk.facing * 0.05;
    p.push(screenX, my+0.1, mz0, screenX, my+0.1+monitorHeight, mz0);
    p.push(screenX, my+0.1+monitorHeight, mz0, screenX, my+0.1+monitorHeight, mz1);
    p.push(screenX, my+0.1+monitorHeight, mz1, screenX, my+0.1, mz1);
    p.push(screenX, my+0.1, mz1, screenX, my+0.1, mz0);

    // Add a small plant pot
    const px = desk.xCenter - desk.facing * 0.2;
    const pz = desk.zCenter + 0.5;
    p.push(px-0.05, my, pz-0.05, px+0.05, my, pz-0.05);
    p.push(px+0.05, my, pz-0.05, px+0.05, my, pz+0.05);
    p.push(px+0.05, my, pz+0.05, px-0.05, my, pz+0.05);
    p.push(px-0.05, my, pz+0.05, px-0.05, my, pz-0.05);
    // Plant stem
    p.push(px, my, pz, px, my+0.2, pz);
    p.push(px, my+0.1, pz, px+0.1, my+0.15, pz+0.1);
    p.push(px, my+0.15, pz, px-0.1, my+0.2, pz-0.1);

  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateCoffeeMachine(): THREE.BufferGeometry {
    const p: number[] = [];
    const cx = -CORRIDOR_HALF_W + 0.4;
    const cy = FLOOR_Y;
    const cz = DOOR_Z + 1.5;
    const w = 0.6, d = 0.6, h = 1.5;

    // Base counter
    p.push(cx-w/2, cy, cz-d/2, cx+w/2, cy, cz-d/2);
    p.push(cx+w/2, cy, cz-d/2, cx+w/2, cy, cz+d/2);
    p.push(cx+w/2, cy, cz+d/2, cx-w/2, cy, cz+d/2);
    p.push(cx-w/2, cy, cz+d/2, cx-w/2, cy, cz-d/2);

    p.push(cx-w/2, cy+0.9, cz-d/2, cx+w/2, cy+0.9, cz-d/2);
    p.push(cx+w/2, cy+0.9, cz-d/2, cx+w/2, cy+0.9, cz+d/2);
    p.push(cx+w/2, cy+0.9, cz+d/2, cx-w/2, cy+0.9, cz+d/2);
    p.push(cx-w/2, cy+0.9, cz+d/2, cx-w/2, cy+0.9, cz-d/2);

    p.push(cx-w/2, cy, cz-d/2, cx-w/2, cy+0.9, cz-d/2);
    p.push(cx+w/2, cy, cz-d/2, cx+w/2, cy+0.9, cz-d/2);
    p.push(cx+w/2, cy, cz+d/2, cx+w/2, cy+0.9, cz+d/2);
    p.push(cx-w/2, cy, cz+d/2, cx-w/2, cy+0.9, cz+d/2);

    // Coffee machine on top
    const mcy = cy + 0.9;
    const mw = 0.4, md = 0.3, mh = 0.4;
    p.push(cx-mw/2, mcy, cz-md/2, cx-mw/2, mcy+mh, cz-md/2);
    p.push(cx+mw/2, mcy, cz-md/2, cx+mw/2, mcy+mh, cz-md/2);
    p.push(cx+mw/2, mcy, cz+md/2, cx+mw/2, mcy+mh, cz+md/2);
    p.push(cx-mw/2, mcy, cz+md/2, cx-mw/2, mcy+mh, cz+md/2);

    p.push(cx-mw/2, mcy+mh, cz-md/2, cx+mw/2, mcy+mh, cz-md/2);
    p.push(cx+mw/2, mcy+mh, cz-md/2, cx+mw/2, mcy+mh, cz+md/2);
    p.push(cx+mw/2, mcy+mh, cz+md/2, cx-mw/2, mcy+mh, cz+md/2);
    p.push(cx-mw/2, mcy+mh, cz+md/2, cx-mw/2, mcy+mh, cz-md/2);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return geo;
}

function generateTileGrid(): THREE.BufferGeometry {
  const p: number[] = [];
  const zMin = -5.5, zMax = 6.5;
  const yTop = FLOOR_Y;
  const yBot = FLOOR_Y - BLOCK_H;

  // Floor: top and bottom face grids
  for (const y of [yTop, yBot]) {
    for (let z = zMin; z <= zMax + 0.01; z += TILE_STEP) {
      let xl = -CORRIDOR_HALF_W, xr = CORRIDOR_HALF_W;
      if (z >= FAR_Z_MAX - 0.01 && z <= NEAR_Z_MIN + 0.01) {
        xl = -CROSSING_HALF_W; xr = CROSSING_HALF_W;
      }
      p.push(xl, y, z, xr, y, z);
    }
    for (let x = -CORRIDOR_HALF_W; x <= CORRIDOR_HALF_W + 0.01; x += TILE_STEP) {
      p.push(x, y, zMin, x, y, zMax);
    }
    for (let x = -CROSSING_HALF_W; x <= CROSSING_HALF_W + 0.01; x += TILE_STEP) {
      if (x < -CORRIDOR_HALF_W - 0.01 || x > CORRIDOR_HALF_W + 0.01) {
        p.push(x, y, FAR_Z_MAX, x, y, NEAR_Z_MIN);
      }
    }
  }

  // Floor: vertical edges at every grid intersection
  for (let z = zMin; z <= zMax + 0.01; z += TILE_STEP) {
    let xl = -CORRIDOR_HALF_W, xr = CORRIDOR_HALF_W;
    if (z >= FAR_Z_MAX - 0.01 && z <= NEAR_Z_MIN + 0.01) {
      xl = -CROSSING_HALF_W; xr = CROSSING_HALF_W;
    }
    for (let x = xl; x <= xr + 0.01; x += TILE_STEP) {
      p.push(x, yTop, z, x, yBot, z);
    }
  }

  // Ceiling: flat grid only
  const cy = CEILING_Y;
  for (let z = zMin; z <= zMax + 0.01; z += TILE_STEP) {
    let xl = -CORRIDOR_HALF_W, xr = CORRIDOR_HALF_W;
    if (z >= FAR_Z_MAX - 0.01 && z <= NEAR_Z_MIN + 0.01) {
      xl = -CROSSING_HALF_W; xr = CROSSING_HALF_W;
    }
    p.push(xl, cy, z, xr, cy, z);
  }
  for (let x = -CORRIDOR_HALF_W; x <= CORRIDOR_HALF_W + 0.01; x += TILE_STEP) {
    p.push(x, cy, zMin, x, cy, zMax);
  }
  for (let x = -CROSSING_HALF_W; x <= CROSSING_HALF_W + 0.01; x += TILE_STEP) {
    if (x < -CORRIDOR_HALF_W - 0.01 || x > CORRIDOR_HALF_W + 0.01) {
      p.push(x, cy, FAR_Z_MAX, x, cy, NEAR_Z_MIN);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateDoorGeometry(): THREE.BufferGeometry {
  const p: number[] = [];
  const hw = DOOR_WIDTH / 2, yB = FLOOR_Y + BLOCK_H, yT = FLOOR_Y + DOOR_HEIGHT;
  p.push(-hw,yB,DOOR_Z, hw,yB,DOOR_Z, hw,yB,DOOR_Z, hw,yT,DOOR_Z);
  p.push(hw,yT,DOOR_Z, -hw,yT,DOOR_Z, -hw,yT,DOOR_Z, -hw,yB,DOOR_Z);
  const hx = hw - 0.15, hy = yB + DOOR_HEIGHT * 0.48;
  p.push(hx,hy,DOOR_Z, hx+0.05,hy,DOOR_Z, hx+0.05,hy,DOOR_Z, hx+0.05,hy+0.2,DOOR_Z);
  p.push(hx+0.05,hy+0.2,DOOR_Z, hx,hy+0.2,DOOR_Z, hx,hy+0.2,DOOR_Z, hx,hy,DOOR_Z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

const TUBE_Y = CEILING_Y - 0.02;
const TUBE_HW = 0.04;
const TUBE_LENGTH = 2.5;
const TUBE_COLUMNS = [-0.5, 0.5];
const TUBE_Z_STARTS = [-3.5, -0.5, 2.5];

function generateFluorescentTubes(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const tx of TUBE_COLUMNS) {
    for (const zS of TUBE_Z_STARTS) {
      const zE = zS + TUBE_LENGTH;
      p.push(tx-TUBE_HW,TUBE_Y,zS, tx+TUBE_HW,TUBE_Y,zS);
      p.push(tx+TUBE_HW,TUBE_Y,zS, tx+TUBE_HW,TUBE_Y,zE);
      p.push(tx+TUBE_HW,TUBE_Y,zE, tx-TUBE_HW,TUBE_Y,zE);
      p.push(tx-TUBE_HW,TUBE_Y,zE, tx-TUBE_HW,TUBE_Y,zS);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateExitSign(): THREE.BufferGeometry {
  const p: number[] = [];
  const yB = FLOOR_Y + DOOR_HEIGHT + 0.08, yT = yB + 0.15, hw = 0.2;
  p.push(-hw,yB,DOOR_Z, hw,yB,DOOR_Z, hw,yB,DOOR_Z, hw,yT,DOOR_Z);
  p.push(hw,yT,DOOR_Z, -hw,yT,DOOR_Z, -hw,yT,DOOR_Z, -hw,yB,DOOR_Z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

// ─── Sub-components ──────────────────────────────────────────────

/** Camera Dolly for OfficeScene - Descend from ceiling to eye-level based on scroll */
function OfficeCameraDolly() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    const baseZ = DOLLY_CENTER + Math.sin(t * DOLLY_SPEED) * DOLLY_AMPLITUDE;

    // Use a custom property passed down or global scroll relative to section
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Calculate progress within the section roughly.
    // The HeroSection takes up the first 100vh. ValueProp takes up space after.
    // When scrollY is near vh, we are entering ValueProp.
    // Let's create a scroll fraction that starts at 0 when we enter ValueProp
    // and hits 1 when ValueProp is fully in view.
    // Assuming ValueProp is roughly 100vh tall and starts at scrollY = vh.
    let scrollProgress = 0;
    if (scrollY > vh * 0.5) {
        scrollProgress = Math.min((scrollY - vh * 0.5) / vh, 1);
    }

    // We want to descend FROM the ceiling down to normal eye level
    const startY = CEILING_Y + 3; // Start high up
    const targetY = 0; // Eye level

    // Ease out cubic
    const ease = 1 - Math.pow(1 - scrollProgress, 3);

    camera.position.z = baseZ;
    camera.position.y = startY - (startY - targetY) * ease;

    // Start looking down, then tilt up to level
    const startRotX = -Math.PI / 4; // Look down 45 deg
    const targetRotX = 0;
    camera.rotation.x = startRotX - (startRotX - targetRotX) * ease;

    // Very slightly bob
    camera.position.y += Math.sin(t) * 0.05;

  });

  return null;
}

function SwayGroup({ mouse, children }: { mouse: { x: number; y: number }; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = mouse.x * 0.08;
    ref.current.rotation.x = mouse.y * 0.04;
  });

  return <group ref={ref}>{children}</group>;
}

function makeFatLines(
  geo: THREE.BufferGeometry,
  color: string,
  opacity: number,
  linewidth: number,
): LineSegments2 {
  const positions = geo.getAttribute("position").array as Float32Array;
  const lGeo = new LineSegmentsGeometry();
  lGeo.setPositions(positions);
  const lMat = new LineMaterial({
    color: new THREE.Color(color).getHex(),
    transparent: true,
    opacity,
    linewidth,
    depthTest: true,
    depthWrite: false,
    resolution: new THREE.Vector2(1, 1),
  });
  return new LineSegments2(lGeo, lMat);
}

function OfficeCorridorStructure({ geos, isDark }: {
  geos: {
    desk: THREE.BufferGeometry; coffee: THREE.BufferGeometry;
    tile: THREE.BufferGeometry; door: THREE.BufferGeometry;
    tube: THREE.BufferGeometry; exit: THREE.BufferGeometry;
  };
  isDark: boolean;
}) {
  const { size } = useThree();

  const objects = useMemo(() => {
    const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;
    const s = p.oScale;
    return [
      makeFatLines(geos.desk,     p.wireframe, 0.55 * s, 1.8),
      makeFatLines(geos.coffee,   p.wireframe, 0.45 * s, 1.8),
      makeFatLines(geos.tile,     p.floor,     0.25 * s, 2.2),
      makeFatLines(geos.door,     p.highlight, 0.40 * s, 1.8),
      makeFatLines(geos.tube,     p.tube,      0.40 * s, 1.8),
      makeFatLines(geos.exit,     p.green,     0.40 * s, 1.8),
    ];
  }, [geos, isDark]);

  useFrame(() => {
    for (const obj of objects) {
      (obj.material as LineMaterial).resolution.set(size.width, size.height);
    }
  });

  return <>{objects.map((o, i) => <primitive key={`${isDark}-${i}`} object={o} />)}</>;
}


function PortraitCompact({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();

  useEffect(() => {
    if (!ref.current) return;
    const aspect = size.width / size.height;
    ref.current.scale.x = aspect < 0.8 ? Math.max(aspect * 0.9 + 0.15, 0.55) : 1;
  }, [size]);

  return <group ref={ref}>{children}</group>;
}

function Occluders() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    colorWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  }), []);

  const floorMat = useMemo(() => new THREE.MeshBasicMaterial({
    colorWrite: false,
    side: THREE.FrontSide,
    fog: false,
  }), []);

  const floorGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(CROSSING_HALF_W * 2, 12);
    g.rotateX(-Math.PI / 2);
    g.translate(0, FLOOR_Y, 0.5);
    return g;
  }, []);

  const deskGeos = useMemo(() =>
    DESKS.map(desk => {
      const g = new THREE.BoxGeometry(DESK_DEPTH_X, DESK_HEIGHT, DESK_WIDTH_Z);
      g.translate(desk.xCenter, FLOOR_Y + DESK_HEIGHT / 2, desk.zCenter);
      return g;
    }), []);

  return (
    <>
      <mesh geometry={floorGeo} material={floorMat} renderOrder={-1} />
      {deskGeos.map((g, i) => <mesh key={i} geometry={g} material={mat} renderOrder={-1} />)}
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────

export default function OfficeScene({ isDark = true }: { isDark?: boolean }) {
  const mouse = useMousePosition();
  const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;

  const geos = useMemo(() => ({
    desk: generateDeskGeometry(),
    coffee: generateCoffeeMachine(),
    tile: generateTileGrid(),
    door: generateDoorGeometry(),
    tube: generateFluorescentTubes(),
    exit: generateExitSign(),
  }), []);

  return (
    <Canvas
      camera={{ position: [0, CEILING_Y + 3, DOLLY_CENTER], fov: 50 }}
      style={{ pointerEvents: "none" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <fog key={isDark ? "d" : "l"} attach="fog" args={[p.fog, 12, 26]} />

      <OfficeCameraDolly />
      <SwayGroup mouse={mouse}>
        <PortraitCompact>
          <Occluders />
          <OfficeCorridorStructure geos={geos} isDark={isDark} />
        </PortraitCompact>
      </SwayGroup>
    </Canvas>
  );
}
