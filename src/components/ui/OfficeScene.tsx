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
const CEILING_Y = 1.8;
const ROOM_HX = 6; // half-width along X
const ROOM_Z_MIN = -6;
const ROOM_Z_MAX = 8;
const TILE_STEP = 0.8;
const BLOCK_H = 0.1;

// Camera — starts high above, looks down at room center, descends to mid-height (level)
const CAM_START_Y = CEILING_Y + 3;       // high above the room
const CAM_END_Y = FLOOR_Y + 0.9; // just above desk height, looking across the room = -0.6
const CAM_Z = 10;
const LOOK_TARGET = new THREE.Vector3(0, FLOOR_Y + 0.9, 1); // room center at desk height
const CAM_X_OFFSET = 1.4; // positive = corridor shifted LEFT (text panel is on the right)
const DOLLY_SPEED = 0.06;
const DOLLY_AMPLITUDE = 0.3;

// Desk layout — 4 standalone desks (larger), 2x2 grid
// Chairs face outward, monitors face inward toward room center
const DESK_W = 2.5;  // along Z (+40%)
const DESK_D = 1.12; // along X (+40%)
const DESK_H = 0.75;

interface DeskDef { x: number; z: number; facing: number }
const DESKS: DeskDef[] = [
  { x: -2.5, z: -1.5, facing:  1 }, // back row
  { x:  1.5, z: -1.5, facing: -1 },
  { x: -2.5, z:  1.5, facing:  1 }, // middle row
  { x:  1.5, z:  1.5, facing: -1 },
  { x: -2.5, z:  4.5, facing:  1 }, // front row
  { x:  1.5, z:  4.5, facing: -1 },
];

// Planters along left wall
const PLANTER_W = 2.2;  // along Z
const PLANTER_D = 0.7;  // along X
const PLANTER_H = 0.65;
const PLANTER_X = -ROOM_HX + PLANTER_D / 2 + 0.1;
const PLANTER_ZS = [-3.5, 1, 5];

// Hanging ceiling planters along the center
const CEIL_PLANTER_W = 1.4;  // along Z
const CEIL_PLANTER_D = 0.5;  // along X
const CEIL_PLANTER_H = 0.2;
const CEIL_PLANTER_ZS = [-2, 1.5, 5];

// Windows on back wall (facing camera, same wall position as datacenter door)
const WIN_Z = ROOM_Z_MIN;
const WIN_BOTTOM = FLOOR_Y + 0.15;
const WIN_TOP = CEILING_Y - 0.05;
const WIN_PANE_W = 2.0;
const WIN_XS = [-4.5, -2.0, 0.5, 3.0, 5.5]; // 5 panes distributed along X

// Ceiling beams
const BEAM_XS = [-4, -2, 0, 2, 4];
const BEAM_HW = 0.08; // half-width

// ─── Palettes ────────────────────────────────────────────────────
const PALETTE_DARK = {
  structure: "#4A4A6A", floor: "#D8DCF0", window: "#FFD3BA",
  planter: "#6B6B80", plant: "#2D8B4E",
  plantWire: "#3AAF6B", desk: "#E0E0E8", monitor: "#5E2BFF",
  monitorScreen: "#2E3048", chair: "#6B6B80", beam: "#3A3A4A",
  light: "#E8E0FF", fog: "#131515", oScale: 1.0,
};
const PALETTE_LIGHT = {
  structure: "#8A8A9A", floor: "#475569", window: "#A8D4F0",
  planter: "#9A9AAA", plant: "#1A6B3A",
  plantWire: "#2D8B4E", desk: "#8A9298", monitor: "#4A4A52",
  monitorScreen: "#8AACB0", chair: "#35353D", beam: "#5A5A6A",
  light: "#3D3D45", fog: "#FAFBFE", oScale: 1.3,
};

// Deterministic pseudo-random for reproducible plant placement
function prng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// ─── Wireframe Geometry Generators ───────────────────────────────

function generateFloorCeiling(): THREE.BufferGeometry {
  const p: number[] = [];
  const zMin = ROOM_Z_MIN, zMax = ROOM_Z_MAX;
  const yTop = FLOOR_Y, yBot = FLOOR_Y - BLOCK_H;

  // Floor grids (top + bottom faces)
  for (const y of [yTop, yBot]) {
    for (let z = zMin; z <= zMax + 0.01; z += TILE_STEP)
      p.push(-ROOM_HX, y, z, ROOM_HX, y, z);
    for (let x = -ROOM_HX; x <= ROOM_HX + 0.01; x += TILE_STEP)
      p.push(x, y, zMin, x, y, zMax);
  }
  // Floor vertical edges
  for (let z = zMin; z <= zMax + 0.01; z += TILE_STEP)
    for (let x = -ROOM_HX; x <= ROOM_HX + 0.01; x += TILE_STEP)
      p.push(x, yTop, z, x, yBot, z);

  // Ceiling grid (larger step)
  const cStep = 1.0;
  for (let z = zMin; z <= zMax + 0.01; z += cStep)
    p.push(-ROOM_HX, CEILING_Y, z, ROOM_HX, CEILING_Y, z);
  for (let x = -ROOM_HX; x <= ROOM_HX + 0.01; x += cStep)
    p.push(x, CEILING_Y, zMin, x, CEILING_Y, zMax);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateWalls(): THREE.BufferGeometry {
  const p: number[] = [];
  const zMin = ROOM_Z_MIN, zMax = ROOM_Z_MAX;

  // Back wall frame (windows fill the wall, so just the border)
  p.push(-ROOM_HX, FLOOR_Y, zMin, ROOM_HX, FLOOR_Y, zMin);
  p.push(-ROOM_HX, CEILING_Y, zMin, ROOM_HX, CEILING_Y, zMin);
  p.push(-ROOM_HX, FLOOR_Y, zMin, -ROOM_HX, CEILING_Y, zMin);
  p.push(ROOM_HX, FLOOR_Y, zMin, ROOM_HX, CEILING_Y, zMin);

  // Left wall verticals (between planters)
  p.push(-ROOM_HX, FLOOR_Y, zMin, -ROOM_HX, CEILING_Y, zMin);
  p.push(-ROOM_HX, FLOOR_Y, zMax, -ROOM_HX, CEILING_Y, zMax);
  p.push(-ROOM_HX, FLOOR_Y, zMin, -ROOM_HX, FLOOR_Y, zMax);
  p.push(-ROOM_HX, CEILING_Y, zMin, -ROOM_HX, CEILING_Y, zMax);

  // Right wall verticals (window frames are separate)
  p.push(ROOM_HX, FLOOR_Y, zMin, ROOM_HX, CEILING_Y, zMin);
  p.push(ROOM_HX, FLOOR_Y, zMax, ROOM_HX, CEILING_Y, zMax);
  p.push(ROOM_HX, FLOOR_Y, zMin, ROOM_HX, FLOOR_Y, zMax);
  p.push(ROOM_HX, CEILING_Y, zMin, ROOM_HX, CEILING_Y, zMax);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateWindows(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const wx of WIN_XS) {
    const x0 = wx - WIN_PANE_W / 2, x1 = wx + WIN_PANE_W / 2;
    // Outer frame on back wall (XY plane at Z = WIN_Z)
    p.push(x0, WIN_BOTTOM, WIN_Z, x1, WIN_BOTTOM, WIN_Z);
    p.push(x1, WIN_BOTTOM, WIN_Z, x1, WIN_TOP, WIN_Z);
    p.push(x1, WIN_TOP, WIN_Z, x0, WIN_TOP, WIN_Z);
    p.push(x0, WIN_TOP, WIN_Z, x0, WIN_BOTTOM, WIN_Z);
    // Horizontal mullion
    const midWinY = (WIN_BOTTOM + WIN_TOP) / 2;
    p.push(x0, midWinY, WIN_Z, x1, midWinY, WIN_Z);
    // Vertical mullion
    p.push(wx, WIN_BOTTOM, WIN_Z, wx, WIN_TOP, WIN_Z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

// Window pane fills — solid colored quads behind the wireframe frames
function generateWindowPaneMesh(): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  for (const wx of WIN_XS) {
    const x0 = wx - WIN_PANE_W / 2, x1 = wx + WIN_PANE_W / 2;
    // Flat quad on the back wall
    pos.push(
      x0, WIN_BOTTOM, WIN_Z + 0.01,
      x1, WIN_BOTTOM, WIN_Z + 0.01,
      x1, WIN_TOP, WIN_Z + 0.01,
      x0, WIN_TOP, WIN_Z + 0.01,
    );
    idx.push(vi, vi+1, vi+2, vi, vi+2, vi+3);
    vi += 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Box edge lines (12 edges per box, no surface diagonals)
function pushBoxEdges(p: number[], x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  // Bottom face edges
  p.push(x0,y0,z0, x1,y0,z0, x1,y0,z0, x1,y0,z1, x1,y0,z1, x0,y0,z1, x0,y0,z1, x0,y0,z0);
  // Top face edges
  p.push(x0,y1,z0, x1,y1,z0, x1,y1,z0, x1,y1,z1, x1,y1,z1, x0,y1,z1, x0,y1,z1, x0,y1,z0);
  // Vertical edges
  p.push(x0,y0,z0, x0,y1,z0, x1,y0,z0, x1,y1,z0, x1,y0,z1, x1,y1,z1, x0,y0,z1, x0,y1,z1);
}

function generatePlanterEdges(): THREE.BufferGeometry {
  const p: number[] = [];
  for (const pz of PLANTER_ZS) {
    const x0 = PLANTER_X - PLANTER_D / 2, x1 = PLANTER_X + PLANTER_D / 2;
    const z0 = pz - PLANTER_W / 2, z1 = pz + PLANTER_W / 2;
    pushBoxEdges(p, x0, FLOOR_Y + 0.01, z0, x1, FLOOR_Y + PLANTER_H, z1);
  }
  for (const cpz of CEIL_PLANTER_ZS) {
    const x0 = -CEIL_PLANTER_D / 2, x1 = CEIL_PLANTER_D / 2;
    const z0 = cpz - CEIL_PLANTER_W / 2, z1 = cpz + CEIL_PLANTER_W / 2;
    pushBoxEdges(p, x0, CEILING_Y - CEIL_PLANTER_H - 0.01, z0, x1, CEILING_Y - 0.01, z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

function generateDeskEdges(): THREE.BufferGeometry {
  const p: number[] = [];
  const legW = 0.04;
  for (const d of DESKS) {
    const hx = DESK_D / 2, hz = DESK_W / 2;
    const x0 = d.x - hx, x1 = d.x + hx;
    const z0 = d.z - hz, z1 = d.z + hz;
    const yT = FLOOR_Y + DESK_H;
    // Desktop slab edges
    pushBoxEdges(p, x0, yT - 0.03, z0, x1, yT, z1);
    // 4 leg edges
    pushBoxEdges(p, x0, FLOOR_Y, z0, x0 + legW, yT - 0.03, z0 + legW);
    pushBoxEdges(p, x1 - legW, FLOOR_Y, z0, x1, yT - 0.03, z0 + legW);
    pushBoxEdges(p, x1 - legW, FLOOR_Y, z1 - legW, x1, yT - 0.03, z1);
    pushBoxEdges(p, x0, FLOOR_Y, z1 - legW, x0 + legW, yT - 0.03, z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

// Planters are now generated as low-poly meshes (see generatePlanterMesh)

function generateCeilingBeams(): THREE.BufferGeometry {
  // Beams only — no rails or hangers, just the light bars (rendered as mesh separately)
  const p: number[] = [];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return geo;
}

// Ceiling tube lights — warm amber low-poly rectangles
function generateTubeLightMesh(): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  const zMin = ROOM_Z_MIN, zMax = ROOM_Z_MAX;
  const lightY = CEILING_Y - 0.06;
  const tubeH = 0.03; // thickness
  const tubeHW = 0.04; // half-width across beam
  const tubeLen = 1.8; // length along Z
  for (const bx of BEAM_XS) {
    for (let z = zMin + 1; z <= zMax - 1; z += 3.5) {
      vi = pushBox(pos, idx, vi,
        bx - tubeHW, lightY - tubeH, z,
        bx + tubeHW, lightY, z + tubeLen);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Desks, vine stems, and chair bases are now low-poly meshes (see below)

// Fern spines as tapering mesh ribbons (thick at base, thin at tip)
function generateFernSpineMesh(): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  const SEG = 8;

  function addSpine(
    startX: number, startY: number, startZ: number,
    dirX: number, dirZ: number, frondLen: number,
    yFn: (t: number) => number, baseWidth: number,
  ) {
    const perpX = -dirZ, perpZ = dirX;
    for (let s = 0; s < SEG; s++) {
      const t0 = s / SEG, t1 = (s + 1) / SEG;
      const w0 = baseWidth * (1 - t0 * 0.85); // taper from full to 15%
      const w1 = baseWidth * (1 - t1 * 0.85);
      const x0 = startX + dirX * frondLen * t0, z0 = startZ + dirZ * frondLen * t0;
      const x1 = startX + dirX * frondLen * t1, z1 = startZ + dirZ * frondLen * t1;
      const y0 = yFn(t0), y1 = yFn(t1);
      // Quad strip segment (two triangles)
      pos.push(
        x0 + perpX * w0, y0, z0 + perpZ * w0,
        x0 - perpX * w0, y0, z0 - perpZ * w0,
        x1 - perpX * w1, y1, z1 - perpZ * w1,
        x1 + perpX * w1, y1, z1 + perpZ * w1,
      );
      idx.push(vi, vi+1, vi+2, vi, vi+2, vi+3);
      vi += 4;
    }
  }

  // Floor planter spines
  const floorRand = prng(77);
  for (const pz of PLANTER_ZS) {
    const baseY = FLOOR_Y + PLANTER_H;
    for (let f = 0; f < 14; f++) {
      const angle = (f / 14) * Math.PI * 2 + floorRand() * 0.3;
      const frondLen = 0.2 + floorRand() * 0.2;
      const startX = PLANTER_X + (floorRand() - 0.5) * PLANTER_D * 0.6;
      const startZ = pz + (floorRand() - 0.5) * PLANTER_W * 0.6;
      addSpine(startX, baseY, startZ, Math.cos(angle), Math.sin(angle), frondLen,
        (t) => baseY + Math.sin(t * Math.PI) * frondLen * 0.6, 0.015);
    }
  }

  // Ceiling planter spines
  const ceilRand = prng(55);
  for (const cpz of CEIL_PLANTER_ZS) {
    const ceilBase = CEILING_Y - CEIL_PLANTER_H - 0.01;
    for (let f = 0; f < 12; f++) {
      const angle = (f / 12) * Math.PI * 2 + ceilRand() * 0.3;
      const frondLen = 0.3 + ceilRand() * 0.25;
      const startX = ceilRand() * CEIL_PLANTER_D * 0.4 - CEIL_PLANTER_D * 0.2;
      const startZ = cpz + ceilRand() * CEIL_PLANTER_W * 0.4 - CEIL_PLANTER_W * 0.2;
      addSpine(startX, ceilBase, startZ, Math.cos(angle), Math.sin(angle), frondLen,
        (t) => ceilBase - t * t * frondLen * 1.2, 0.018);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ─── Low-Poly Mesh Generators (positions + indices) ──────────────

/** Helper: push a box (8 verts, 12 tris) and return new vertex index */
function pushBox(
  pos: number[], idx: number[], vi: number,
  x0: number, y0: number, z0: number,
  x1: number, y1: number, z1: number,
): number {
  pos.push(
    x0,y0,z0, x1,y0,z0, x1,y1,z0, x0,y1,z0, // front (z0)
    x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1, // back (z1)
  );
  const v = vi;
  idx.push(
    v,v+1,v+2, v,v+2,v+3,     // front
    v+5,v+4,v+7, v+5,v+7,v+6, // back
    v+4,v,v+3, v+4,v+3,v+7,   // left
    v+1,v+5,v+6, v+1,v+6,v+2, // right
    v+3,v+2,v+6, v+3,v+6,v+7, // top
    v,v+4,v+5, v,v+5,v+1,     // bottom
  );
  return vi + 8;
}

function generatePlanterMesh(): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  // Floor planters (left wall)
  for (const pz of PLANTER_ZS) {
    const x0 = PLANTER_X - PLANTER_D / 2, x1 = PLANTER_X + PLANTER_D / 2;
    const z0 = pz - PLANTER_W / 2, z1 = pz + PLANTER_W / 2;
    vi = pushBox(pos, idx, vi, x0, FLOOR_Y + 0.01, z0, x1, FLOOR_Y + PLANTER_H, z1);
  }
  // Ceiling hanging planters (center of room)
  for (const cpz of CEIL_PLANTER_ZS) {
    const x0 = -CEIL_PLANTER_D / 2, x1 = CEIL_PLANTER_D / 2;
    const z0 = cpz - CEIL_PLANTER_W / 2, z1 = cpz + CEIL_PLANTER_W / 2;
    const yTop = CEILING_Y - 0.01;
    vi = pushBox(pos, idx, vi, x0, yTop - CEIL_PLANTER_H, z0, x1, yTop, z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function generateDeskMesh(): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  const legW = 0.04; // leg thickness
  for (const d of DESKS) {
    const hx = DESK_D / 2, hz = DESK_W / 2;
    const x0 = d.x - hx, x1 = d.x + hx;
    const z0 = d.z - hz, z1 = d.z + hz;
    const yT = FLOOR_Y + DESK_H;
    // Desktop surface (thin slab)
    vi = pushBox(pos, idx, vi, x0, yT - 0.03, z0, x1, yT, z1);
    // 4 legs
    vi = pushBox(pos, idx, vi, x0, FLOOR_Y, z0, x0 + legW, yT - 0.03, z0 + legW);
    vi = pushBox(pos, idx, vi, x1 - legW, FLOOR_Y, z0, x1, yT - 0.03, z0 + legW);
    vi = pushBox(pos, idx, vi, x1 - legW, FLOOR_Y, z1 - legW, x1, yT - 0.03, z1);
    vi = pushBox(pos, idx, vi, x0, FLOOR_Y, z1 - legW, x0 + legW, yT - 0.03, z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Color gradient: cool dark green (base) → warm yellow-green (tip)
const FERN_BASE = new THREE.Color("#1B6B3A"); // cool dark green
const FERN_TIP  = new THREE.Color("#8BBF3F"); // warm yellow-green

function generatePlantMesh(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let vi = 0;
  const SEG = 8;

  // Helper: add a leaf pair with vertex colors based on t (0=base, 1=tip)
  function addLeafPair(
    sx: number, sy: number, sz: number,
    perpX: number, perpZ: number,
    leafW: number, leafH: number, yDir: number,
    t: number, // 0=base, 1=tip — drives color gradient
  ) {
    // Interpolate color: base → tip
    const stemColor = FERN_BASE.clone().lerp(FERN_TIP, t * 0.7);
    const tipColor = FERN_BASE.clone().lerp(FERN_TIP, Math.min(t * 0.7 + 0.3, 1));

    // Left leaflet (3 verts: stem point, mid, tip)
    positions.push(
      sx, sy, sz,
      sx + perpX * leafW, sy + yDir * leafH * 0.3, sz + perpZ * leafW,
      sx + perpX * leafW * 0.3, sy + yDir * leafH, sz + perpZ * leafW * 0.3,
    );
    colors.push(stemColor.r, stemColor.g, stemColor.b);
    colors.push(tipColor.r, tipColor.g, tipColor.b);
    colors.push(tipColor.r, tipColor.g, tipColor.b);
    indices.push(vi, vi+1, vi+2); vi += 3;

    // Right leaflet
    positions.push(
      sx, sy, sz,
      sx - perpX * leafW, sy + yDir * leafH * 0.3, sz - perpZ * leafW,
      sx - perpX * leafW * 0.3, sy + yDir * leafH, sz - perpZ * leafW * 0.3,
    );
    colors.push(stemColor.r, stemColor.g, stemColor.b);
    colors.push(tipColor.r, tipColor.g, tipColor.b);
    colors.push(tipColor.r, tipColor.g, tipColor.b);
    indices.push(vi, vi+1, vi+2); vi += 3;
  }

  // Floor planter ferns — 14 fronds per planter, 8 segments each
  const rand = prng(77);
  for (const pz of PLANTER_ZS) {
    const baseY = FLOOR_Y + PLANTER_H;
    for (let f = 0; f < 14; f++) {
      const angle = (f / 14) * Math.PI * 2 + rand() * 0.3;
      const frondLen = 0.2 + rand() * 0.2; // tighter spread
      const startX = PLANTER_X + (rand() - 0.5) * PLANTER_D * 0.6;
      const startZ = pz + (rand() - 0.5) * PLANTER_W * 0.6;
      const dirX = Math.cos(angle), dirZ = Math.sin(angle);
      const perpX = -dirZ, perpZ = dirX;

      for (let s = 0; s < SEG; s++) {
        const t = (s + 1) / SEG;
        const stemX = startX + dirX * frondLen * t;
        const stemZ = startZ + dirZ * frondLen * t;
        const stemY = baseY + Math.sin(t * Math.PI) * frondLen * 0.6;
        const leafW = 0.05 + (1 - t) * 0.05;
        const leafH = 0.06 + (1 - t) * 0.06;
        addLeafPair(stemX, stemY, stemZ, perpX, perpZ, leafW, leafH, 1, t);
        if (s < SEG - 1) {
          const tm = (s + 1.5) / SEG;
          const mx = startX + dirX * frondLen * tm;
          const mz = startZ + dirZ * frondLen * tm;
          const my = baseY + Math.sin(tm * Math.PI) * frondLen * 0.6;
          addLeafPair(mx, my, mz, perpX, perpZ, leafW * 0.7, leafH * 0.7, 1, tm);
        }
      }
    }
  }

  // Ceiling hanging ferns — 12 fronds per planter, 8 segments each
  const ceilRand = prng(55);
  for (const cpz of CEIL_PLANTER_ZS) {
    const ceilBase = CEILING_Y - CEIL_PLANTER_H - 0.01;
    for (let f = 0; f < 12; f++) {
      const angle = (f / 12) * Math.PI * 2 + ceilRand() * 0.3;
      const frondLen = 0.3 + ceilRand() * 0.25;
      const startX = ceilRand() * CEIL_PLANTER_D * 0.4 - CEIL_PLANTER_D * 0.2;
      const startZ = cpz + ceilRand() * CEIL_PLANTER_W * 0.4 - CEIL_PLANTER_W * 0.2;
      const dirX = Math.cos(angle), dirZ = Math.sin(angle);
      const perpX = -dirZ, perpZ = dirX;

      for (let s = 0; s < SEG; s++) {
        const t = (s + 1) / SEG;
        const stemX = startX + dirX * frondLen * t;
        const stemZ = startZ + dirZ * frondLen * t;
        const stemY = ceilBase - t * t * frondLen * 1.2;
        const leafW = 0.05 + (1 - t) * 0.05;
        const leafH = 0.07 + (1 - t) * 0.07;
        addLeafPair(stemX, stemY, stemZ, perpX, perpZ, leafW, leafH, -1, t);
        if (s < SEG - 1) {
          const tm = (s + 1.5) / SEG;
          const mx = startX + dirX * frondLen * tm;
          const mz = startZ + dirZ * frondLen * tm;
          const my = ceilBase - tm * tm * frondLen * 1.2;
          addLeafPair(mx, my, mz, perpX, perpZ, leafW * 0.7, leafH * 0.7, -1, tm);
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function generateChairMesh(): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  let vi = 0;
  const colW = 0.04; // column thickness (+40%)

  for (const d of DESKS) {
    const cx = d.x + d.facing * (DESK_D / 2 + 0.45);
    const cz = d.z;
    const baseY = FLOOR_Y + 0.05;
    const seatY = FLOOR_Y + 0.45;
    const seatW = 0.50, seatD = 0.50; // +40%

    // Central column (thin box)
    vi = pushBox(positions, indices, vi,
      cx - colW, baseY, cz - colW, cx + colW, seatY, cz + colW);

    // X-shaped base (two perpendicular arms forming a cross)
    const r = 0.39, armW = 0.035, armH = 0.025; // +40%
    // Arm along X axis
    vi = pushBox(positions, indices, vi,
      cx - r, baseY, cz - armW, cx + r, baseY + armH, cz + armW);
    // Arm along Z axis
    vi = pushBox(positions, indices, vi,
      cx - armW, baseY, cz - r, cx + armW, baseY + armH, cz + r);

    // Seat (flat quad)
    positions.push(
      cx - seatD/2, seatY, cz - seatW/2,
      cx + seatD/2, seatY, cz - seatW/2,
      cx + seatD/2, seatY, cz + seatW/2,
      cx - seatD/2, seatY, cz + seatW/2,
    );
    indices.push(vi, vi+1, vi+2, vi, vi+2, vi+3);
    vi += 4;

    // Backrest (on far side from desk)
    const backH = 0.49; // +40%
    const tilt = d.facing * 0.08;
    const backX = cx + d.facing * seatD / 2;
    positions.push(
      backX, seatY, cz - seatW/2,
      backX, seatY, cz + seatW/2,
      backX + tilt, seatY + backH, cz + seatW/2,
      backX + tilt, seatY + backH, cz - seatW/2,
    );
    indices.push(vi, vi+1, vi+2, vi, vi+2, vi+3);
    vi += 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Monitor body (stands + bases) — rendered grey
function generateMonitorBodyMesh(): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  const standW = 0.03; // +40%
  for (const d of DESKS) {
    const deskTop = FLOOR_Y + DESK_H;
    const mx = d.x - d.facing * (DESK_D / 2 - 0.08);
    const mz = d.z;
    const standH = 0.08;
    const screenY = deskTop + standH;
    vi = pushBox(pos, idx, vi, mx-standW, deskTop, mz-standW, mx+standW, screenY, mz+standW);
    vi = pushBox(pos, idx, vi, mx-0.084, deskTop, mz-0.084, mx+0.084, deskTop+0.015, mz+0.084);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Screen quads — split by row for alternating colors
function generateScreenMesh(...rowZs: number[]): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let vi = 0;
  for (const d of DESKS) {
    if (!rowZs.some(rz => Math.abs(d.z - rz) < 0.5)) continue;
    const deskTop = FLOOR_Y + DESK_H;
    const mx = d.x - d.facing * (DESK_D / 2 - 0.08);
    const mz = d.z;
    const screenW = 0.84, screenH = 0.56; // +40%
    const screenY = deskTop + 0.08;
    pos.push(
      mx, screenY, mz - screenW/2,
      mx, screenY, mz + screenW/2,
      mx, screenY + screenH, mz + screenW/2,
      mx, screenY + screenH, mz - screenW/2,
    );
    idx.push(vi, vi+1, vi+2, vi, vi+2, vi+3);
    vi += 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ─── Sub-components ──────────────────────────────────────────────

function OfficeCameraDolly() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Phase 1 — ENTER: descend from high to desk-height over full scroll range
    // Starts when scene first becomes visible (vh*0.2), completes at vh*1.2
    let sp = 0;
    if (scrollY > vh * 0.2) sp = Math.min((scrollY - vh * 0.2) / (vh * 1.0), 1);
    const enterEase = sp * sp * (3 - 2 * sp); // smoothstep: even distribution across full range

    // Phase 2 — EXIT: descend through floor when scrolling past office section
    let exitFrac = 0;
    if (scrollY > vh * 1.3) exitFrac = Math.min((scrollY - vh * 1.3) / (vh * 0.5), 1);
    const exitEase = exitFrac * exitFrac; // quadratic ease-in (matches datacenter)

    // Camera position: smooth descent, no Z-axis dolly (prevents zoom effect)
    const bob = Math.sin(t * 0.8) * 0.03;
    const enterY = CAM_START_Y - (CAM_START_Y - CAM_END_Y) * enterEase;
    camera.position.set(
      CAM_X_OFFSET,
      enterY - exitEase * 3 + bob,
      CAM_Z,
    );

    // lookAt room center — naturally tilts down when high, perfectly level at mid-height
    camera.lookAt(LOOK_TARGET);
  });
  return null;
}

function SwayGroup({ mouse, children }: { mouse: { x: number; y: number }; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    // Match datacenter's mouse reactivity (camera.rotation.set(0,0,0) prevents dutch angle)
    ref.current.rotation.y = mouse.x * 0.08;
    ref.current.rotation.x = mouse.y * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

function makeFatLines(
  geo: THREE.BufferGeometry, color: string, opacity: number, linewidth: number,
): LineSegments2 {
  const positions = geo.getAttribute("position").array as Float32Array;
  const lGeo = new LineSegmentsGeometry();
  lGeo.setPositions(positions);
  const lMat = new LineMaterial({
    color: new THREE.Color(color).getHex(),
    transparent: true, opacity, linewidth,
    depthTest: true, depthWrite: false,
    resolution: new THREE.Vector2(1, 1),
  });
  return new LineSegments2(lGeo, lMat);
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
  const floorMat = useMemo(() => new THREE.MeshBasicMaterial({
    colorWrite: false, side: THREE.FrontSide, fog: false,
  }), []);
  const floorGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(ROOM_HX * 2, ROOM_Z_MAX - ROOM_Z_MIN);
    g.rotateX(-Math.PI / 2);
    g.translate(0, FLOOR_Y, (ROOM_Z_MIN + ROOM_Z_MAX) / 2);
    return g;
  }, []);
  return <mesh geometry={floorGeo} material={floorMat} renderOrder={-1} />;
}

/** Wireframe structure rendered via LineSegments2 (room shell only) */
function WireframeStructure({ geos, isDark }: {
  geos: {
    floor: THREE.BufferGeometry; walls: THREE.BufferGeometry;
    windows: THREE.BufferGeometry;
    beams: THREE.BufferGeometry;
    planterEdges: THREE.BufferGeometry;
    deskEdges: THREE.BufferGeometry;
  };
  isDark: boolean;
}) {
  const { size } = useThree();
  const objects = useMemo(() => {
    const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;
    const s = p.oScale;
    return [
      makeFatLines(geos.floor,     p.floor,     0.20 * s, 2.0),
      makeFatLines(geos.walls,     p.structure, 0.35 * s, 1.8),
      makeFatLines(geos.windows,   p.window,    0.50 * s, 1.8),
      makeFatLines(geos.beams,        p.beam,      0.35 * s, 1.5),
      makeFatLines(geos.planterEdges, p.structure,  0.40 * s, 1.5),
      makeFatLines(geos.deskEdges,    p.structure,  0.40 * s, 1.5),
    ];
  }, [geos, isDark]);

  useFrame(() => {
    for (const obj of objects)
      (obj.material as LineMaterial).resolution.set(size.width, size.height);
  });

  return <>{objects.map((o, i) => <primitive key={`${isDark}-${i}`} object={o} />)}</>;
}

/** Low-poly filled meshes + wireframe overlay for all furniture */
function LowPolyMeshes({ meshGeos, isDark }: {
  meshGeos: {
    planters: THREE.BufferGeometry;
    desks: THREE.BufferGeometry;
    plants: THREE.BufferGeometry;
    chairs: THREE.BufferGeometry;
    monitorBodies: THREE.BufferGeometry;
    screensA: THREE.BufferGeometry;
    screensB: THREE.BufferGeometry;
    screensC: THREE.BufferGeometry;
    tubeLights: THREE.BufferGeometry;
    fernSpines: THREE.BufferGeometry;
    windowPanes: THREE.BufferGeometry;
  };
  isDark: boolean;
}) {
  const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;
  const s = p.oScale;

  // Solid fill materials only — no wireframe overlay on furniture
  const planterMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: p.planter, side: THREE.DoubleSide,
  }), [isDark]);
  const deskMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#A8D4F0", side: THREE.DoubleSide, transparent: true, opacity: 0.5,
  }), [isDark]);
  const planterWireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: p.structure, wireframe: true, transparent: true,
    opacity: 0.5, depthWrite: false, side: THREE.DoubleSide,
  }), [isDark]);
  const deskWireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: p.structure, wireframe: true, transparent: true,
    opacity: 0.5, depthWrite: false, side: THREE.DoubleSide,
  }), [isDark]);
  const plantMat = useMemo(() => new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.DoubleSide,
  }), [isDark]);
  // Darker wireframe overlay connecting the fern leaves
  const plantWireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: isDark ? "#1A5C32" : "#0E4A25", wireframe: true,
    transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide,
  }), [isDark]);
  const chairMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: p.chair, side: THREE.DoubleSide,
  }), [isDark]);
  const monBodyMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#B0B8C4", side: THREE.DoubleSide, // light grey mounts
  }), [isDark]);
  const screenAMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#EF72E8", side: THREE.DoubleSide, transparent: true, opacity: 0.85, // pink — front
  }), [isDark]);
  const screenBMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#C57CF3", side: THREE.DoubleSide, transparent: true, opacity: 0.85, // midpoint — middle
  }), [isDark]);
  const screenCMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#9B85FE", side: THREE.DoubleSide, transparent: true, opacity: 0.85, // purple — back
  }), [isDark]);
  const tubeLightMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#F0F3FA", side: THREE.DoubleSide, // cool white
  }), [isDark]);
  const windowPaneMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: p.window, transparent: true, opacity: 0.35,
    side: THREE.DoubleSide, depthWrite: false,
  }), [isDark]);

  return (
    <>
      <mesh geometry={meshGeos.windowPanes} material={windowPaneMat} />
      <mesh geometry={meshGeos.planters} material={planterMat} />
      <mesh geometry={meshGeos.desks} material={deskMat} />
      <mesh geometry={meshGeos.fernSpines} material={plantWireMat} />
      <mesh geometry={meshGeos.plants} material={plantMat} />
      <mesh geometry={meshGeos.plants} material={plantWireMat} />
      <mesh geometry={meshGeos.chairs} material={chairMat} />
      <mesh geometry={meshGeos.monitorBodies} material={monBodyMat} />
      <mesh geometry={meshGeos.screensA} material={screenAMat} />
      <mesh geometry={meshGeos.screensB} material={screenBMat} />
      <mesh geometry={meshGeos.screensC} material={screenCMat} />
      <mesh geometry={meshGeos.tubeLights} material={tubeLightMat} />
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────

export default function OfficeScene({ isDark = true }: { isDark?: boolean }) {
  const mouse = useMousePosition();
  const p = isDark ? PALETTE_DARK : PALETTE_LIGHT;

  const wireGeos = useMemo(() => ({
    floor: generateFloorCeiling(),
    walls: generateWalls(),
    windows: generateWindows(),
    beams: generateCeilingBeams(),
    planterEdges: generatePlanterEdges(),
    deskEdges: generateDeskEdges(),
  }), []);

  const meshGeos = useMemo(() => ({
    planters: generatePlanterMesh(),
    desks: generateDeskMesh(),
    plants: generatePlantMesh(),
    chairs: generateChairMesh(),
    monitorBodies: generateMonitorBodyMesh(),
    screensA: generateScreenMesh(4.5),          // front row — pink
    screensB: generateScreenMesh(1.5),         // middle row — midpoint
    screensC: generateScreenMesh(-1.5),        // back row — purple
    fernSpines: generateFernSpineMesh(),
    tubeLights: generateTubeLightMesh(),
    windowPanes: generateWindowPaneMesh(),
  }), []);

  return (
    <Canvas
      camera={{ position: [CAM_X_OFFSET, CAM_START_Y, CAM_Z], fov: 50 }}
      style={{ pointerEvents: "none" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog key={isDark ? "d" : "l"} attach="fog" args={[p.fog, 12, 26]} />

      <OfficeCameraDolly />
      <SwayGroup mouse={mouse}>
        <PortraitCompact>
          <Occluders />
          <WireframeStructure geos={wireGeos} isDark={isDark} />
          <LowPolyMeshes meshGeos={meshGeos} isDark={isDark} />
        </PortraitCompact>
      </SwayGroup>
    </Canvas>
  );
}
