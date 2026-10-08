export interface LayerPose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  opacity: number;
}

export interface HeroFrame {
  camera: { x: number; y: number; z: number; fov: number };
  layers: Record<string, LayerPose>;
}

const pose = (partial: Partial<LayerPose>): LayerPose => ({
  x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1, opacity: 1, ...partial,
});

export const HERO_FRAMES: HeroFrame[] = [
  {
    camera: { x: 0, y: 0.05, z: 4.2, fov: 38 },
    layers: {
      shell: pose({ z: 0, scale: 1.05 }),
      inner: pose({ z: -0.02, opacity: 0.15, scale: 0.92 }),
      controller: pose({ x: 0.85, y: -0.55, z: 0.2, scale: 0.42 }),
      artwork: pose({ x: -0.95, y: 0.35, z: -0.15, scale: 0.38, opacity: 0.9 }),
      accessory: pose({ x: 0.7, y: 0.55, z: -0.2, scale: 0.28, opacity: 0.8 }),
    },
  },
  {
    camera: { x: 0, y: 0.12, z: 3.9, fov: 36 },
    layers: {
      shell: pose({ y: 0.12, z: 0.05, scale: 1.08 }),
      inner: pose({ z: -0.08, opacity: 0.28, scale: 0.94 }),
      controller: pose({ x: 0.92, y: -0.5, z: 0.28, scale: 0.44 }),
      artwork: pose({ x: -1.02, y: 0.4, z: -0.1, scale: 0.4 }),
      accessory: pose({ x: 0.78, y: 0.6, z: -0.12, scale: 0.3 }),
    },
  },
  {
    camera: { x: 0.08, y: 0.1, z: 3.55, fov: 34 },
    layers: {
      shell: pose({ y: 0.08, ry: 0.12, scale: 1.1 }),
      inner: pose({ z: -0.18, opacity: 0.45, scale: 0.95 }),
      controller: pose({ x: 1.15, y: -0.35, z: 0.55, rx: -0.2, scale: 0.5 }),
      artwork: pose({ x: -1.15, y: 0.45, z: 0.05, scale: 0.42 }),
      accessory: pose({ x: 0.9, y: 0.72, z: 0.05, scale: 0.32 }),
    },
  },
  {
    camera: { x: 0.15, y: 0.05, z: 3.4, fov: 33 },
    layers: {
      shell: pose({ x: -0.15, ry: 0.28, rx: 0.08, scale: 1.05 }),
      inner: pose({ x: 0.12, z: -0.35, opacity: 0.7, scale: 0.98 }),
      controller: pose({ x: 1.35, y: -0.15, z: 0.75, rx: -0.35, ry: -0.2, scale: 0.55 }),
      artwork: pose({ x: -1.35, y: 0.2, z: 0.35, ry: 0.25, scale: 0.48 }),
      accessory: pose({ x: 1.05, y: 0.85, z: 0.2, scale: 0.34 }),
    },
  },
  {
    camera: { x: 0.2, y: 0.02, z: 3.2, fov: 32 },
    layers: {
      shell: pose({ x: -0.35, y: 0.1, ry: 0.45, scale: 1 }),
      inner: pose({ x: 0.28, z: -0.55, opacity: 0.85, ry: -0.2, scale: 1 }),
      controller: pose({ x: 1.45, y: 0.05, z: 0.95, rx: -0.5, scale: 0.58 }),
      artwork: pose({ x: -1.5, y: -0.05, z: 0.55, ry: 0.4, scale: 0.5 }),
      accessory: pose({ x: 0.2, y: 1.05, z: 0.4, scale: 0.36 }),
    },
  },
  {
    camera: { x: 0, y: 0.15, z: 3.6, fov: 35 },
    layers: {
      shell: pose({ x: -0.55, y: 0.2, z: -0.1, ry: 0.6, scale: 0.95 }),
      inner: pose({ x: 0.45, y: -0.15, z: -0.7, opacity: 0.9, scale: 0.92 }),
      controller: pose({ x: 1.2, y: 0.55, z: 0.7, rx: -0.4, ry: 0.3, scale: 0.52 }),
      artwork: pose({ x: -1.1, y: -0.65, z: 0.4, rz: 0.15, scale: 0.46 }),
      accessory: pose({ x: -0.2, y: 0.95, z: 0.65, scale: 0.33 }),
    },
  },
  {
    camera: { x: -0.35, y: 0.2, z: 3.3, fov: 36 },
    layers: {
      shell: pose({ x: 0.15, y: 0.35, z: 0.1, ry: 0.9, rx: 0.1, scale: 0.9 }),
      inner: pose({ x: -0.4, z: -0.4, opacity: 0.75, ry: 0.4, scale: 0.88 }),
      controller: pose({ x: -1.2, y: 0.4, z: 0.8, ry: 0.6, scale: 0.5 }),
      artwork: pose({ x: 1.25, y: 0.15, z: 0.5, ry: -0.5, scale: 0.44 }),
      accessory: pose({ x: 0.5, y: -0.85, z: 0.45, scale: 0.3 }),
    },
  },
  {
    camera: { x: 0.1, y: 0.08, z: 3.8, fov: 37 },
    layers: {
      shell: pose({ x: -0.1, y: 0.15, ry: 0.35, scale: 1 }),
      inner: pose({ z: -0.2, opacity: 0.4, scale: 0.94 }),
      controller: pose({ x: 1.0, y: -0.4, z: 0.4, scale: 0.46 }),
      artwork: pose({ x: -1.0, y: 0.3, z: 0.1, scale: 0.4 }),
      accessory: pose({ x: 0.65, y: 0.6, z: 0, scale: 0.28 }),
    },
  },
  {
    camera: { x: 0, y: 0, z: 4.1, fov: 38 },
    layers: {
      shell: pose({ scale: 1.02, opacity: 0.96 }),
      inner: pose({ opacity: 0.12, scale: 0.9 }),
      controller: pose({ x: 0.8, y: -0.5, z: 0.15, scale: 0.4, opacity: 0.85 }),
      artwork: pose({ x: -0.85, y: 0.3, opacity: 0.55, scale: 0.34 }),
      accessory: pose({ x: 0.55, y: 0.45, opacity: 0.4, scale: 0.24 }),
    },
  },
  {
    camera: { x: 0, y: -0.1, z: 4.6, fov: 40 },
    layers: {
      shell: pose({ y: -0.2, scale: 0.88, opacity: 0.35 }),
      inner: pose({ opacity: 0, scale: 0.8 }),
      controller: pose({ x: 0.4, y: -0.7, opacity: 0.15, scale: 0.3 }),
      artwork: pose({ opacity: 0, scale: 0.2 }),
      accessory: pose({ opacity: 0, scale: 0.2 }),
    },
  },
];

export function interpolateFrames(progress: number): HeroFrame {
  const clamped = Math.min(1, Math.max(0, progress));
  const scaled = clamped * (HERO_FRAMES.length - 1);
  const i = Math.min(HERO_FRAMES.length - 2, Math.floor(scaled));
  const t = scaled - i;
  const a = HERO_FRAMES[i];
  const b = HERO_FRAMES[i + 1];
  const lerp = (from: number, to: number) => from + (to - from) * t;
  const mixPose = (pa: LayerPose, pb: LayerPose): LayerPose => ({
    x: lerp(pa.x, pb.x),
    y: lerp(pa.y, pb.y),
    z: lerp(pa.z, pb.z),
    rx: lerp(pa.rx, pb.rx),
    ry: lerp(pa.ry, pb.ry),
    rz: lerp(pa.rz, pb.rz),
    scale: lerp(pa.scale, pb.scale),
    opacity: lerp(pa.opacity, pb.opacity),
  });
  return {
    camera: {
      x: lerp(a.camera.x, b.camera.x),
      y: lerp(a.camera.y, b.camera.y),
      z: lerp(a.camera.z, b.camera.z),
      fov: lerp(a.camera.fov, b.camera.fov),
    },
    layers: {
      shell: mixPose(a.layers.shell, b.layers.shell),
      inner: mixPose(a.layers.inner, b.layers.inner),
      controller: mixPose(a.layers.controller, b.layers.controller),
      artwork: mixPose(a.layers.artwork, b.layers.artwork),
      accessory: mixPose(a.layers.accessory, b.layers.accessory),
    },
  };
}
