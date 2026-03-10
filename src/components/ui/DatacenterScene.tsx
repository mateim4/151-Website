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

const RACK_WIDTH_Z = 1.65;
const RACK_HEIGHT = 2.7;
const RACK_DEPTH_X = 0.4;
const RACK_X = 2.0;

const SHELVES_PER_RACK = 8;
const UNIT_HEIGHT = RACK_HEIGHT / (SHELVES_PER_RACK + 1);
const TILE_STEP = 0.5;
const BLOCK_H = 0.12;

const NEAR_Z_MIN = 2.2;
const NEAR_Z_MID = NEAR_Z_MIN + RACK_WIDTH_Z;
const NEAR_Z_MAX = NEAR_Z_MID + RACK_WIDTH_Z;
const FAR_Z_MAX = 0.8;
const FAR_Z_MID = FAR_Z_MAX - RACK_WIDTH_Z;
const FAR_Z_MIN = FAR_Z_MID - RACK_WIDTH_Z;

const DOOR_Z = -4.5;
const DOOR_WIDTH = 1.0;
const DOOR_HEIGHT = 2.3;

// Camera
const DOLLY_CENTER = 8;
const DOLLY_AMPLITUDE = 0.4;
const DOLLY_SPEED = 0.06;
const FLY_IN_START = 14;
const FLY_IN_DURATION = 2.0;

// Server face
const TRAY_COUNT = 8;
const TRAY_ZONE_START = 0.04;
const TRAY_ZONE_END = 0.80;
const TRAY_GAP = 0.008;
const CTRL_ZONE_START = 0.84;
const CTRL_ZONE_END = 0.97;
const TRAY_Y_TOP = 0.90;
const TRAY_Y_BOT = 0.10;

// Theme color palettes
const PALETTE_DARK = {
  rack: "#5E2BFF", violet: "#8B5CF6", cyan: "#63B4D1",
  floor: "#D8DCF0", green: "#00FF66", disk: "#E6E7F0",
  amber: "#FF6B35", tube: "#E8E0FF", fog: "#131515",
  oScale: 1.0,
};
const PALETTE_LIGHT = {
  rack: "#2B2B2F", violet: "#4A4A52", cyan: "#3A3A42",
  floor: "#475569", green: "#00C853", disk: "#64748B",
  amber: "#FF6D00", tube: "#3D3D45", fog: "#FAFBFE",
  oScale: 1.3,
};

// ─── Types ───────────────────────────────────────────────────────
interface RackDef {
  xCenter: number;
  zMin: number;
  zMax: number;
  frontSign: number;
}

interface LEDData {
  positions: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
}

// ─── 8 Racks in 4 groups of 2 ───────────────────────────────────
const RACKS: RackDef[] = [
  { xCenter: -RACK_X, zMin: NEAR_Z_MIN, zMax: NEAR_Z_MID, frontSign: 1 },
  { xCenter: -RACK_X, zMin: NEAR_Z_MID, zMax: NEAR_Z_MAX, frontSign: 1 },
  { xCenter: -RACK_X, zMin: FAR_Z_MID, zMax: FAR_Z_MAX, frontSign: 1 },
  { xCenter: -RACK_X, zMin: FAR_Z_MIN, zMax: FAR_Z_MID, frontSign: 1 },
  { xCenter: RACK_X, zMin: NEAR_Z_MIN, zMax: NEAR_Z_MID, frontSign: -1 },
  { xCenter: RACK_X, zMin: NEAR_Z_MID, zMax: NEAR_Z_MAX, frontSign: -1 },
  { xCenter: RACK_X, zMin: FAR_Z_MID, zMax: FAR_Z_MAX, frontSign: -1 },
  { xCenter: RACK_X, zMin: FAR_Z_MIN, zMax: FAR_Z_MID, frontSign: -1 },
];

function faceZ(rack: RackDef, frac: number): number {
  const zCenter = (rack.zMin + rack.zMax) / 2;
  return zCenter + rack.frontSign * RACK_WIDTH_Z * (0.5 - frac);
}

// ─── Geometry Generators ─────────────────────────────────────────

function generateRackGeometry(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const rack of RACKS) {
    const hx = RACK_DEPTH_X / 2, hz = RACK_WIDTH_Z / 2;
    const zc = (rack.zMin + rack.zMax) / 2;
    const yB = FLOOR_Y, yT = FLOOR_Y + RACK_HEIGHT;
    const x0 = rack.xCenter - hx, x1 = rack.xCenter + hx;
    const z0 = zc - hz, z1 = zc + hz;
    // bottom
    p.push(x0,yB,z0, x1,yB,z0, x1,yB,z0, x1,yB,z1, x1,yB,z1, x0,yB,z1, x0,yB,z1, x0,yB,z0);
    // top
    p.push(x0,yT,z0, x1,yT,z0, x1,yT,z0, x1,yT,z1, x1,yT,z1, x0,yT,z1, x0,yT,z1, x0,yT,z0);
    // verticals
    p.push(x0,yB,z0, x0,yT,z0, x1,yB,z0, x1,yT,z0, x1,yB,z1, x1,yT,z1, x0,yB,z1, x0,yT,z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateShelfGeometry(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const rack of RACKS) {
    const hx = RACK_DEPTH_X / 2, hz = RACK_WIDTH_Z / 2;
    const zc = (rack.zMin + rack.zMax) / 2;
    const fx = rack.xCenter + rack.frontSign * hx;
    const z0 = zc - hz, z1 = zc + hz;
    for (let s = 0; s < SHELVES_PER_RACK; s++) {
      const sy = FLOOR_Y + UNIT_HEIGHT * (s + 1);
      p.push(fx, sy, z0, fx, sy, z1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateServerFaceGeometry(): THREE.BufferGeometry {
  const p: number[] = [];
  const tzw = (TRAY_ZONE_END - TRAY_ZONE_START) * RACK_WIDTH_Z;
  const tg = (TRAY_COUNT - 1) * TRAY_GAP;
  const tw = (tzw - tg) / TRAY_COUNT;
  const twf = tw / RACK_WIDTH_Z;
  const tgf = TRAY_GAP / RACK_WIDTH_Z;

  for (const rack of RACKS) {
    const hx = RACK_DEPTH_X / 2;
    const fx = rack.xCenter + rack.frontSign * hx;
    const fz = (f: number) => faceZ(rack, f);

    for (let u = 0; u < SHELVES_PER_RACK + 1; u++) {
      const ub = FLOOR_Y + UNIT_HEIGHT * u;
      const yb = ub + TRAY_Y_BOT * UNIT_HEIGHT;
      const yt = ub + TRAY_Y_TOP * UNIT_HEIGHT;

      for (let t = 0; t < TRAY_COUNT; t++) {
        const fs = TRAY_ZONE_START + t * (twf + tgf);
        const fe = fs + twf;
        const tz0 = fz(fs), tz1 = fz(fe);
        p.push(fx,yb,tz0, fx,yb,tz1, fx,yb,tz1, fx,yt,tz1, fx,yt,tz1, fx,yt,tz0, fx,yt,tz0, fx,yb,tz0);
      }

      const cz0 = fz(CTRL_ZONE_START), cz1 = fz(CTRL_ZONE_END);
      p.push(fx,yb,cz0, fx,yb,cz1, fx,yb,cz1, fx,yt,cz1, fx,yt,cz1, fx,yt,cz0, fx,yt,cz0, fx,yb,cz0);
      const dy = ub + UNIT_HEIGHT * 0.55;
      p.push(fx, dy, cz0, fx, dy, cz1);
      const bh = UNIT_HEIGHT * 0.10;
      const bcz = (cz0 + cz1) / 2, bcy = ub + UNIT_HEIGHT * 0.30;
      p.push(fx,bcy-bh,bcz-bh, fx,bcy-bh,bcz+bh, fx,bcy-bh,bcz+bh, fx,bcy+bh,bcz+bh);
      p.push(fx,bcy+bh,bcz+bh, fx,bcy+bh,bcz-bh, fx,bcy+bh,bcz-bh, fx,bcy-bh,bcz-bh);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

/** E2: Floor as 3D blocks (top + bottom grid + verticals) + flat ceiling */
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
  // Base sits on top of the floor surface; small offset prevents
  // the fat-line bottom from visually dipping below the tile grid.
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

function generateAccentStrips(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const rack of RACKS) {
    const hx = RACK_DEPTH_X / 2, hz = RACK_WIDTH_Z / 2;
    const zc = (rack.zMin + rack.zMax) / 2;
    const fx = rack.xCenter + rack.frontSign * hx;
    const yB = FLOOR_Y, yT = FLOOR_Y + RACK_HEIGHT;
    p.push(fx,yB,zc-hz, fx,yT,zc-hz, fx,yB,zc+hz, fx,yT,zc+hz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

/** A1: 6 fluorescent tube fixtures — 2 columns of 3, spaced along Z */
const TUBE_Y = CEILING_Y - 0.02;
const TUBE_HW = 0.04; // half-width of fixture rectangle
const TUBE_LENGTH = 2.5;
const TUBE_COLUMNS = [-0.5, 0.5]; // X positions
const TUBE_Z_STARTS = [-3.5, -0.5, 2.5]; // Z start of each fixture

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

/** A1 supplement: Bright center lines inside each tube (the "lit" part) */
function generateTubeGlowLines(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const tx of TUBE_COLUMNS) {
    for (const zS of TUBE_Z_STARTS) {
      p.push(tx, TUBE_Y, zS, tx, TUBE_Y, zS + TUBE_LENGTH);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

/** C1: Cable tray ladders above each rack row */
function generateCableTrays(): THREE.BufferGeometry {
  const p: number[] = [];
  const y = FLOOR_Y + RACK_HEIGHT + 0.15, hw = 0.15;
  const zS = FAR_Z_MIN - 0.2, zE = NEAR_Z_MAX + 0.2;
  for (const rx of [-RACK_X, RACK_X]) {
    const x0 = rx - hw, x1 = rx + hw;
    p.push(x0,y,zS, x0,y,zE, x1,y,zS, x1,y,zE);
    for (let z = zS; z <= zE; z += 0.5) p.push(x0,y,z, x1,y,z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

/** C3: EXIT sign rectangle above the door */
function generateExitSign(): THREE.BufferGeometry {
  const p: number[] = [];
  const yB = FLOOR_Y + DOOR_HEIGHT + 0.08, yT = yB + 0.15, hw = 0.2;
  p.push(-hw,yB,DOOR_Z, hw,yB,DOOR_Z, hw,yB,DOOR_Z, hw,yT,DOOR_Z);
  p.push(hw,yT,DOOR_Z, -hw,yT,DOOR_Z, -hw,yT,DOOR_Z, -hw,yB,DOOR_Z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

/** C4: Fire suppression pipes with sprinkler heads */
function generateFirePipes(): THREE.BufferGeometry {
  const p: number[] = [];
  const y = CEILING_Y - 0.1, zS = -5.0, zE = 6.0;
  for (const px of [-1.2, 1.2]) {
    p.push(px, y, zS, px, y, zE);
    for (let z = zS; z <= zE; z += 1.5) p.push(px, y, z, px, y - 0.08, z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

// ─── LED Data Generators (D1: per-LED random phase/speed) ───────

function generateStatusLedData(): LEDData {
  const pos: number[] = [];
  for (const rack of RACKS) {
    const hx = RACK_DEPTH_X / 2;
    const fx = rack.xCenter + rack.frontSign * hx;
    const lx = fx + rack.frontSign * 0.02;
    const cz = faceZ(rack, (CTRL_ZONE_START + CTRL_ZONE_END) / 2);
    for (let u = 0; u < SHELVES_PER_RACK + 1; u++) {
      pos.push(lx, FLOOR_Y + UNIT_HEIGHT * u + UNIT_HEIGHT * 0.30, cz);
    }
  }
  const n = pos.length / 3;
  const phases = new Float32Array(n);
  const speeds = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 1.2 + Math.random() * 0.6;
  }
  return { positions: new Float32Array(pos), phases, speeds };
}

function generateDiskLedData(): LEDData {
  const pos: number[] = [];
  const tzw = (TRAY_ZONE_END - TRAY_ZONE_START) * RACK_WIDTH_Z;
  const tg = (TRAY_COUNT - 1) * TRAY_GAP;
  const tw = (tzw - tg) / TRAY_COUNT;
  const twf = tw / RACK_WIDTH_Z;
  const tgf = TRAY_GAP / RACK_WIDTH_Z;

  for (const rack of RACKS) {
    const hx = RACK_DEPTH_X / 2;
    const fx = rack.xCenter + rack.frontSign * hx;
    const lx = fx + rack.frontSign * 0.02;
    for (let u = 0; u < SHELVES_PER_RACK + 1; u++) {
      const ly = FLOOR_Y + UNIT_HEIGHT * u + TRAY_Y_TOP * UNIT_HEIGHT - UNIT_HEIGHT * 0.04;
      for (let t = 0; t < TRAY_COUNT; t++) {
        const fc = TRAY_ZONE_START + t * (twf + tgf) + twf / 2;
        pos.push(lx, ly, faceZ(rack, fc));
      }
    }
  }
  const n = pos.length / 3;
  const phases = new Float32Array(n);
  const speeds = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 3.0 + Math.random() * 2.0;
  }
  return { positions: new Float32Array(pos), phases, speeds };
}



// ─── LED Shader Code (E3: GPU-based animation) ──────────────────

const LED_VERT = `
attribute float aPhase;
attribute float aSpeed;
uniform float uTime;
uniform float uSize;
varying float vOp;
void main() {
  vOp = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const LED_FRAG = `
uniform vec3 uColor;
varying float vOp;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, vOp * smoothstep(0.5, 0.15, d));
}`;

const GLOW_VERT = `
attribute float aPhase;
attribute float aSpeed;
uniform float uTime;
uniform float uSize;
varying float vOp;
void main() {
  vOp = 0.08 + 0.12 * sin(uTime * aSpeed + aPhase);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const GLOW_FRAG = `
uniform vec3 uColor;
varying float vOp;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, vOp * smoothstep(0.5, 0.0, d));
}`;

// ─── Sub-components ──────────────────────────────────────────────

/** B1 + B2: Camera fly-in, dolly oscillation, scroll parallax */
function CameraDolly() {
  const startT = useRef(-1);

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    if (startT.current < 0) startT.current = t;
    const elapsed = t - startT.current;

    let baseZ: number;
    if (elapsed < FLY_IN_DURATION) {
      const p = elapsed / FLY_IN_DURATION;
      baseZ = FLY_IN_START + (DOLLY_CENTER - FLY_IN_START) * (1 - Math.pow(1 - p, 3));
    } else {
      baseZ = DOLLY_CENTER + Math.sin(t * DOLLY_SPEED) * DOLLY_AMPLITUDE;
    }

    // B1: scroll-linked dolly down — descend through the building,
    // then tilt upward so the floor's near edge appears perpendicular
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const sf = Math.min(scrollY / vh, 1);
    const ease = sf * sf; // quadratic ease-in: subtle start, dramatic finish

    camera.position.z = baseZ + ease * -2;
    camera.position.y = ease * -5;        // descend well below floor (FLOOR_Y = -1.5)
    camera.rotation.x = ease * 1.0;       // tilt up ~57° to see floor edge from below
  });

  return null;
}

/** B3: Idle sway + mouse follow + random head-look impulse */
function SwayGroup({ mouse, children }: { mouse: { x: number; y: number }; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = mouse.x * 0.08;
    ref.current.rotation.x = mouse.y * 0.04;
  });

  return <group ref={ref}>{children}</group>;
}

/** Convert a BufferGeometry (pairs of points) into a fat-line LineSegments2 */
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

/** Corridor wireframe structure using Line2 for anti-aliased thick lines */
function CorridorStructure({ geos, isDark }: {
  geos: {
    rack: THREE.BufferGeometry; shelf: THREE.BufferGeometry; face: THREE.BufferGeometry;
    tile: THREE.BufferGeometry; door: THREE.BufferGeometry; accent: THREE.BufferGeometry;
    tube: THREE.BufferGeometry; tubeGlow: THREE.BufferGeometry; cable: THREE.BufferGeometry;
    exit: THREE.BufferGeometry; pipe: THREE.BufferGeometry;
  };
  isDark: boolean;
}) {
  const { size } = useThree();

  const objects = useMemo(() => {
    const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;
    const s = p.oScale;
    return [
      makeFatLines(geos.rack,     p.rack,   0.45 * s, 1.8),
      makeFatLines(geos.shelf,    p.rack,   0.55 * s, 1.8),
      makeFatLines(geos.face,     p.rack,   0.25 * s, 1.5),
      makeFatLines(geos.tile,     p.floor,  0.25 * s, 2.2),
      makeFatLines(geos.door,     p.violet, 0.40 * s, 1.8),
      makeFatLines(geos.accent,   p.rack,   0.50 * s, 1.8),
      makeFatLines(geos.tube,     p.tube,   0.40 * s, 1.8),
      makeFatLines(geos.tubeGlow, p.tube,   0.55 * s, 2.2),
      makeFatLines(geos.cable,    p.rack,   0.25 * s, 1.5),
      makeFatLines(geos.exit,     p.green,  0.40 * s, 1.8),
      makeFatLines(geos.pipe,     p.cyan,   0.20 * s, 1.5),
    ];
  }, [geos, isDark]);

  // LineMaterial needs the canvas resolution to compute screen-space width
  useFrame(() => {
    for (const obj of objects) {
      (obj.material as LineMaterial).resolution.set(size.width, size.height);
    }
  });

  return <>{objects.map((o, i) => <primitive key={`${isDark}-${i}`} object={o} />)}</>;
}

/** D1 + E3: GPU-animated LED points with per-vertex phase/speed */
function ShaderLEDs({ data, color, size, glowSize }: {
  data: LEDData; color: string; size: number; glowSize?: number;
}) {
  const uTime = useRef({ value: 0 });
  const col = useMemo(() => new THREE.Color(color), [color]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(data.phases, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(data.speeds, 1));
    return g;
  }, [data]);

  const coreMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: uTime.current, uColor: { value: col }, uSize: { value: size } },
    vertexShader: LED_VERT, fragmentShader: LED_FRAG,
    transparent: true, depthWrite: false, fog: false,
  }), [col, size]);

  const glowMat = useMemo(() => glowSize ? new THREE.ShaderMaterial({
    uniforms: { uTime: uTime.current, uColor: { value: col }, uSize: { value: glowSize } },
    vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
    transparent: true, depthWrite: false, fog: false,
  }) : null, [col, glowSize]);

  useFrame(({ clock }) => { uTime.current.value = clock.getElapsedTime(); });

  return (
    <>
      {glowMat && <points geometry={geo}><primitive object={glowMat} attach="material" /></points>}
      <points geometry={geo}><primitive object={coreMat} attach="material" /></points>
    </>
  );
}

/** D2: Occasional amber alert flash on a random status LED */
function AlertFlash({ statusPositions, alertColor }: { statusPositions: Float32Array; alertColor: string }) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const posAttr = useRef<THREE.BufferAttribute | null>(null);
  const nextAlert = useRef(8 + Math.random() * 4);
  const alertEnd = useRef(0);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const attr = new THREE.Float32BufferAttribute([0, 0, 0], 3);
    g.setAttribute("position", attr);
    posAttr.current = attr;
    return g;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!matRef.current || !posAttr.current) return;

    if (t > nextAlert.current && t > alertEnd.current) {
      const n = statusPositions.length / 3;
      const idx = Math.floor(Math.random() * n) * 3;
      posAttr.current.setXYZ(0, statusPositions[idx], statusPositions[idx + 1], statusPositions[idx + 2]);
      posAttr.current.needsUpdate = true;
      alertEnd.current = t + 0.5;
      nextAlert.current = t + 8 + Math.random() * 4;
    }
    matRef.current.opacity = t < alertEnd.current ? 0.9 : 0;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial ref={matRef} color={alertColor} size={0.12} sizeAttenuation transparent opacity={0} depthWrite={false} />
    </points>
  );
}

/** C3 supplement: Pulsing green glow behind the EXIT sign */
function ExitSignGlow({ glowColor }: { glowColor: string }) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, FLOOR_Y + DOOR_HEIGHT + 0.155, DOOR_Z], 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.opacity = 0.15 + 0.10 * Math.sin(clock.getElapsedTime() * 1.2);
  });

  return (
    <points geometry={geo}>
      <pointsMaterial ref={matRef} color={glowColor} size={0.5} sizeAttenuation transparent opacity={0.15} depthWrite={false} />
    </points>
  );
}

/** Portrait-mode responsive compactor: scales the scene's X-axis inward on
 *  narrow viewports so left/right racks remain visible instead of clipping. */
function PortraitCompact({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();

  useEffect(() => {
    if (!ref.current) return;
    const aspect = size.width / size.height;
    // On portrait (aspect < 0.8), compress X to keep racks in view
    // Floor: aspect 0.5 → scale ~0.6, aspect 0.75 → scale ~0.85
    ref.current.scale.x = aspect < 0.8 ? Math.max(aspect * 0.9 + 0.15, 0.55) : 1;
  }, [size]);

  return <group ref={ref}>{children}</group>;
}

/** Hidden-line occlusion: invisible solid meshes that fill the depth buffer,
 *  preventing geometry behind racks/floor from rendering. */
function Occluders() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    colorWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  }), []);

  // Floor plane (FrontSide only — occlude from above so dolly-down still reveals underside)
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

  const rackGeos = useMemo(() =>
    RACKS.map(rack => {
      const zc = (rack.zMin + rack.zMax) / 2;
      const g = new THREE.BoxGeometry(RACK_DEPTH_X, RACK_HEIGHT, RACK_WIDTH_Z);
      g.translate(rack.xCenter, FLOOR_Y + RACK_HEIGHT / 2, zc);
      return g;
    }), []);

  return (
    <>
      <mesh geometry={floorGeo} material={floorMat} renderOrder={-1} />
      {rackGeos.map((g, i) => <mesh key={i} geometry={g} material={mat} renderOrder={-1} />)}
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────

export default function DatacenterScene({ isDark = true }: { isDark?: boolean }) {
  const mouse = useMousePosition();
  const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;

  const geos = useMemo(() => ({
    rack: generateRackGeometry(),
    shelf: generateShelfGeometry(),
    face: generateServerFaceGeometry(),
    tile: generateTileGrid(),
    door: generateDoorGeometry(),
    accent: generateAccentStrips(),
    tube: generateFluorescentTubes(),
    tubeGlow: generateTubeGlowLines(),
    cable: generateCableTrays(),
    exit: generateExitSign(),
    pipe: generateFirePipes(),
  }), []);

  const statusData = useMemo(() => generateStatusLedData(), []);
  const diskData = useMemo(() => generateDiskLedData(), []);

  return (
    <Canvas
      camera={{ position: [0, 0, FLY_IN_START], fov: 50 }}
      style={{ pointerEvents: "none" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      {/* A2: Depth fog — fades distant geometry, color matches page bg */}
      <fog key={isDark ? "d" : "l"} attach="fog" args={[p.fog, 12, 26]} />

      <CameraDolly />
      <SwayGroup mouse={mouse}>
        <PortraitCompact>
          <Occluders />
          <CorridorStructure geos={geos} isDark={isDark} />
          <ShaderLEDs data={statusData} color={p.green} size={0.07} glowSize={0.30} />
          <ShaderLEDs data={diskData} color={p.disk} size={0.035} />
          <AlertFlash statusPositions={statusData.positions} alertColor={p.amber} />
          <ExitSignGlow glowColor={p.green} />
        </PortraitCompact>
      </SwayGroup>
    </Canvas>
  );
}
